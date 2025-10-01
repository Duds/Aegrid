import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isManagerOrHigher } from '@/lib/rbac';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Asset update schema validation
 */
const updateAssetSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  assetType: z
    .enum([
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
    ])
    .optional(),
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
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  suburb: z.string().optional(),
  postcode: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  // Asset details
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  installationDate: z.string().datetime().optional(),
  warrantyExpiry: z.string().datetime().optional(),
  expectedLifespan: z.number().optional(),
  // Financial information
  purchasePrice: z.number().optional(),
  currentValue: z.number().optional(),
  replacementCost: z.number().optional(),
  depreciationRate: z.number().optional(),
  // Maintenance information
  lastInspection: z.string().datetime().optional(),
  nextInspection: z.string().datetime().optional(),
  inspectionFrequency: z.number().optional(),
  maintenanceCost: z.number().optional(),
  // Metadata
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  isPublic: z.boolean().optional(),
});

/**
 * GET /api/assets/[id] - Get a specific asset
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const asset = await prisma.asset.findFirst({
      where: {
        id,
        organisationId: session.user.organisationId!,
      },
      select: {
        id: true,
        organisationId: true,
        assetNumber: true,
        name: true,
        description: true,
        assetType: true,
        status: true,
        condition: true,
        priority: true,
        purpose: true,
        purposeDescription: true,
        criticalityLevel: true,
        serviceImpact: true,
        functionBasedCategory: true,
        address: true,
        suburb: true,
        postcode: true,
        state: true,
        country: true,
        manufacturer: true,
        model: true,
        serialNumber: true,
        installationDate: true,
        warrantyExpiry: true,
        expectedLifespan: true,
        purchasePrice: true,
        currentValue: true,
        replacementCost: true,
        depreciationRate: true,
        lastInspection: true,
        nextInspection: true,
        inspectionFrequency: true,
        maintenanceCost: true,
        tags: true,
        notes: true,
        isPublic: true,
        createdBy: true,
        updatedBy: true,
        createdAt: true,
        updatedAt: true,
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
        updatedByUser: {
          select: { id: true, name: true, email: true },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 5,
          include: {
            inspector: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        maintenance: {
          orderBy: { maintenanceDate: 'desc' },
          take: 5,
          include: {
            performedByUser: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        workOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            assignedToUser: {
              select: { id: true, name: true, email: true },
            },
            assignedByUser: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Convert PostGIS geometry to lat/lng for frontend
    const assetWithLocation = {
      ...asset,
      latitude: null, // Location field not available in select
      longitude: null, // Location field not available in select
    };

    return NextResponse.json(assetWithLocation);
  } catch (error) {
    console.error('Error fetching asset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/assets/[id] - Update a specific asset
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - MANAGER and above can update assets
    if (!isManagerOrHigher(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateAssetSchema.parse(body);

    const { id } = await params;

    // Check if asset exists and user has access
    const existingAsset = await prisma.asset.findFirst({
      where: {
        id,
        organisationId: session.user.organisationId!,
      },
    });

    if (!existingAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      ...validatedData,
      updatedBy: session.user.id,
    };

    // Handle location data
    if (validatedData.latitude && validatedData.longitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [validatedData.longitude, validatedData.latitude],
      };
    }

    // Remove latitude/longitude from the data
    delete updateData.latitude;
    delete updateData.longitude;

    // Convert date strings to Date objects
    if (updateData.installationDate) {
      updateData.installationDate = new Date(updateData.installationDate);
    }
    if (updateData.warrantyExpiry) {
      updateData.warrantyExpiry = new Date(updateData.warrantyExpiry);
    }
    if (updateData.lastInspection) {
      updateData.lastInspection = new Date(updateData.lastInspection);
    }
    if (updateData.nextInspection) {
      updateData.nextInspection = new Date(updateData.nextInspection);
    }

    const asset = await prisma.asset.update({
      where: { id },
      data: updateData,
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
        updatedByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Log the asset update
    await prisma.auditLog.create({
      data: {
        action: 'ASSET_UPDATED',
        userId: session.user.id,
        organisationId: session.user.organisationId!,
        assetId: asset.id,
        details: {
          assetNumber: asset.assetNumber,
          name: asset.name,
          changes: validatedData,
        },
        ipAddress:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error updating asset:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update asset' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/assets/[id] - Delete a specific asset
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - only ADMIN can delete assets
    if (!canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Check if asset exists and user has access
    const existingAsset = await prisma.asset.findFirst({
      where: {
        id,
        organisationId: session.user.organisationId!,
      },
    });

    if (!existingAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Log the asset deletion before deleting
    await prisma.auditLog.create({
      data: {
        action: 'ASSET_DELETED',
        userId: session.user.id,
        organisationId: session.user.organisationId!,
        assetId: existingAsset.id,
        details: {
          assetNumber: existingAsset.assetNumber,
          name: existingAsset.name,
          assetType: existingAsset.assetType,
        },
        ipAddress:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    });

    // Delete the asset (cascade will handle related records)
    await prisma.asset.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}
