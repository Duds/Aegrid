import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isManagerOrHigher } from '@/lib/rbac';
import { parse } from 'csv-parse/sync';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { z } from 'zod';

/**
 * Asset import schema validation
 */
const assetImportSchema = z.object({
  assetNumber: z.string().min(1, 'Asset number is required'),
  name: z.string().min(1, 'Asset name is required'),
  description: z.string().optional(),
  assetType: z.enum([
    'BUILDING',
    'ROAD',
    'BRIDGE',
    'FOOTPATH',
    'PARK',
    'PLAYGROUND',
    'SPORTS_FACILITY',
    'LIBRARY',
    'COMMUNITY_CENTRE',
    'CAR_PARK',
    'STREET_FURNITURE',
    'TRAFFIC_LIGHT',
    'STREET_LIGHT',
    'DRAINAGE',
    'WATER_SUPPLY',
    'SEWER',
    'ELECTRICAL_INFRASTRUCTURE',
    'TELECOMMUNICATIONS',
    'OTHER',
  ]),
  status: z
    .enum([
      'ACTIVE',
      'INACTIVE',
      'UNDER_CONSTRUCTION',
      'UNDER_MAINTENANCE',
      'DECOMMISSIONED',
      'PLANNED',
    ])
    .optional(),
  condition: z
    .enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL', 'UNKNOWN'])
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  // Location fields
  latitude: z
    .string()
    .optional()
    .transform(val => (val ? parseFloat(val) : undefined)),
  longitude: z
    .string()
    .optional()
    .transform(val => (val ? parseFloat(val) : undefined)),
  address: z.string().optional(),
  suburb: z.string().optional(),
  postcode: z.string().optional(),
  state: z.string().optional().default('NSW'),
  country: z.string().optional().default('Australia'),
  // Asset details
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  installationDate: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
  warrantyExpiry: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
  expectedLifespan: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val) : undefined)),
  // Financial information
  purchasePrice: z
    .string()
    .optional()
    .transform(val => (val ? parseFloat(val) : undefined)),
  currentValue: z
    .string()
    .optional()
    .transform(val => (val ? parseFloat(val) : undefined)),
  replacementCost: z
    .string()
    .optional()
    .transform(val => (val ? parseFloat(val) : undefined)),
  depreciationRate: z
    .string()
    .optional()
    .transform(val => (val ? parseFloat(val) : undefined)),
  // Maintenance information
  lastInspection: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
  nextInspection: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
  inspectionFrequency: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val) : undefined)),
  maintenanceCost: z
    .string()
    .optional()
    .transform(val => (val ? parseFloat(val) : undefined)),
  // Metadata
  tags: z
    .string()
    .optional()
    .transform(val => (val ? val.split(',').map(tag => tag.trim()) : [])),
  notes: z.string().optional(),
  isPublic: z
    .string()
    .optional()
    .transform(val => val === 'true' || val === '1' || val === 'yes'),
});

/**
 * POST /api/assets/import - Import assets from CSV/Excel file
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - only MANAGER and above can import assets
    if (!isManagerOrHigher(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const importOptions = formData.get('options') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const options = importOptions ? JSON.parse(importOptions) : {};
    const { skipFirstRow = true, validateOnly = false } = options;

    // Parse file based on extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    let rawData: any[] = [];

    if (fileExtension === 'csv') {
      const csvContent = await file.text();
      rawData = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        return NextResponse.json(
          { error: 'No sheets found in Excel file' },
          { status: 400 }
        );
      }
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        return NextResponse.json(
          { error: 'Worksheet not found in Excel file' },
          { status: 400 }
        );
      }
      rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Convert to object array if first row contains headers
      if (rawData.length > 0 && Array.isArray(rawData[0])) {
        const headers = rawData[0] as string[];
        rawData = rawData.slice(skipFirstRow ? 1 : 0).map((row: any[]) => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        });
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Please use CSV or Excel files.' },
        { status: 400 }
      );
    }

    if (rawData.length === 0) {
      return NextResponse.json(
        { error: 'No data found in file' },
        { status: 400 }
      );
    }

    // Validate and process each row
    const results = {
      total: rawData.length,
      success: 0,
      errors: [] as any[],
      imported: [] as any[],
    };

    const existingAssetNumbers = new Set<string>();

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const rowNumber = i + (skipFirstRow ? 2 : 1); // Account for header row

      try {
        // Validate the row data
        const validatedData = assetImportSchema.parse(row);

        // Check for duplicate asset numbers in the file
        if (existingAssetNumbers.has(validatedData.assetNumber)) {
          results.errors.push({
            row: rowNumber,
            assetNumber: validatedData.assetNumber,
            error: 'Duplicate asset number in file',
          });
          continue;
        }

        // Check if asset number already exists in database
        const existingAsset = await prisma.asset.findUnique({
          where: { assetNumber: validatedData.assetNumber },
        });

        if (existingAsset) {
          results.errors.push({
            row: rowNumber,
            assetNumber: validatedData.assetNumber,
            error: 'Asset number already exists in database',
          });
          continue;
        }

        // Validate spatial data
        if (validatedData.latitude && validatedData.longitude) {
          if (validatedData.latitude < -90 || validatedData.latitude > 90) {
            results.errors.push({
              row: rowNumber,
              assetNumber: validatedData.assetNumber,
              error: 'Invalid latitude value',
            });
            continue;
          }
          if (validatedData.longitude < -180 || validatedData.longitude > 180) {
            results.errors.push({
              row: rowNumber,
              assetNumber: validatedData.assetNumber,
              error: 'Invalid longitude value',
            });
            continue;
          }
        }

        if (validateOnly) {
          results.imported.push({
            row: rowNumber,
            assetNumber: validatedData.assetNumber,
            name: validatedData.name,
            status: 'Validated',
          });
          results.success++;
          existingAssetNumbers.add(validatedData.assetNumber);
          continue;
        }

        // Prepare asset data for creation
        const assetData: any = {
          ...validatedData,
          organisationId: session.user.organisationId!,
          createdBy: session.user.id,
          updatedBy: session.user.id,
        };

        // Handle location data
        if (validatedData.latitude && validatedData.longitude) {
          assetData.location = {
            type: 'Point',
            coordinates: [validatedData.longitude, validatedData.latitude],
          };
        }

        // Remove latitude/longitude from the data
        delete assetData.latitude;
        delete assetData.longitude;

        // Create the asset
        const asset = await prisma.asset.create({
          data: assetData,
          include: {
            createdByUser: {
              select: { id: true, name: true, email: true },
            },
          },
        });

        // Log the asset creation
        await prisma.auditLog.create({
          data: {
            action: 'ASSET_IMPORTED',
            userId: session.user.id,
            organisationId: session.user.organisationId!,
            assetId: asset.id,
            details: {
              assetNumber: asset.assetNumber,
              name: asset.name,
              assetType: asset.assetType,
              importSource: file.name,
            },
            ipAddress:
              request.headers.get('x-forwarded-for') ||
              request.headers.get('x-real-ip'),
            userAgent: request.headers.get('user-agent'),
          },
        });

        results.imported.push({
          row: rowNumber,
          assetNumber: asset.assetNumber,
          name: asset.name,
          id: asset.id,
        });

        results.success++;
        existingAssetNumbers.add(validatedData.assetNumber);
      } catch (error) {
        if (error instanceof z.ZodError) {
          results.errors.push({
            row: rowNumber,
            assetNumber: row.assetNumber || 'Unknown',
            error: 'Validation error',
            details: error.errors
              .map(e => `${e.path.join('.')}: ${e.message}`)
              .join(', '),
          });
        } else {
          results.errors.push({
            row: rowNumber,
            assetNumber: row.assetNumber || 'Unknown',
            error: 'Processing error',
            details: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    return NextResponse.json({
      message: validateOnly ? 'Validation completed' : 'Import completed',
      results,
      options: {
        skipFirstRow,
        validateOnly,
        fileName: file.name,
      },
    });
  } catch (error) {
    console.error('Error importing assets:', error);
    return NextResponse.json(
      { error: 'Failed to import assets' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/assets/import - Get import template and validation rules
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return template and validation information
    const template = {
      headers: [
        'assetNumber',
        'name',
        'description',
        'assetType',
        'status',
        'condition',
        'priority',
        'latitude',
        'longitude',
        'address',
        'suburb',
        'postcode',
        'state',
        'country',
        'manufacturer',
        'model',
        'serialNumber',
        'installationDate',
        'warrantyExpiry',
        'expectedLifespan',
        'purchasePrice',
        'currentValue',
        'replacementCost',
        'depreciationRate',
        'lastInspection',
        'nextInspection',
        'inspectionFrequency',
        'maintenanceCost',
        'tags',
        'notes',
        'isPublic',
      ],
      sampleData: {
        assetNumber: 'BUILD-001',
        name: 'Main Library',
        description: 'Central public library',
        assetType: 'LIBRARY',
        status: 'ACTIVE',
        condition: 'GOOD',
        priority: 'MEDIUM',
        latitude: '-33.8688',
        longitude: '151.2093',
        address: '123 Library Street',
        suburb: 'Sydney',
        postcode: '2000',
        state: 'NSW',
        country: 'Australia',
        manufacturer: 'Council Construction',
        model: 'Standard Library',
        installationDate: '2020-01-15',
        warrantyExpiry: '2030-01-15',
        expectedLifespan: '50',
        purchasePrice: '5000000',
        currentValue: '4500000',
        replacementCost: '6000000',
        depreciationRate: '2.5',
        lastInspection: '2024-01-15',
        nextInspection: '2025-01-15',
        inspectionFrequency: '365',
        maintenanceCost: '50000',
        tags: 'library, public, cultural',
        notes: 'Main branch library',
        isPublic: 'true',
      },
      validationRules: {
        required: ['assetNumber', 'name', 'assetType'],
        assetTypes: [
          'BUILDING',
          'ROAD',
          'BRIDGE',
          'FOOTPATH',
          'PARK',
          'PLAYGROUND',
          'SPORTS_FACILITY',
          'LIBRARY',
          'COMMUNITY_CENTRE',
          'CAR_PARK',
          'STREET_FURNITURE',
          'TRAFFIC_LIGHT',
          'STREET_LIGHT',
          'DRAINAGE',
          'WATER_SUPPLY',
          'SEWER',
          'ELECTRICAL_INFRASTRUCTURE',
          'TELECOMMUNICATIONS',
          'OTHER',
        ],
        statuses: [
          'ACTIVE',
          'INACTIVE',
          'UNDER_CONSTRUCTION',
          'UNDER_MAINTENANCE',
          'DECOMMISSIONED',
          'PLANNED',
        ],
        conditions: [
          'EXCELLENT',
          'GOOD',
          'FAIR',
          'POOR',
          'CRITICAL',
          'UNKNOWN',
        ],
        priorities: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        coordinateRanges: {
          latitude: [-90, 90],
          longitude: [-180, 180],
        },
      },
    };

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error getting import template:', error);
    return NextResponse.json(
      { error: 'Failed to get import template' },
      { status: 500 }
    );
  }
}
