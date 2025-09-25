import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isManagerOrHigher } from "@/lib/rbac";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Asset creation schema validation
 */
const createAssetSchema = z.object({
  assetNumber: z.string().min(1, "Asset number is required"),
  name: z.string().min(1, "Asset name is required"),
  description: z.string().optional(),
  assetType: z.enum([
    "BUILDING", "ROAD", "BRIDGE", "FOOTPATH", "PARK", "PLAYGROUND",
    "SPORTS_FACILITY", "LIBRARY", "COMMUNITY_CENTRE", "CAR_PARK",
    "STREET_FURNITURE", "TRAFFIC_LIGHT", "STREET_LIGHT", "DRAINAGE",
    "WATER_SUPPLY", "SEWER", "ELECTRICAL_INFRASTRUCTURE", "TELECOMMUNICATIONS", "OTHER"
  ]),
  status: z.enum(["ACTIVE", "INACTIVE", "UNDER_CONSTRUCTION", "UNDER_MAINTENANCE", "DECOMMISSIONED", "PLANNED"]).optional(),
  condition: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR", "CRITICAL", "UNKNOWN"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
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
 * Asset update schema validation
 */
const updateAssetSchema = createAssetSchema.partial().omit({ assetNumber: true });

/**
 * GET /api/assets - List assets with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const assetType = searchParams.get("assetType");
    const status = searchParams.get("status");
    const condition = searchParams.get("condition");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const suburb = searchParams.get("suburb");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      organisationId: session.user.organisationId,
    };

    if (assetType) where.assetType = assetType;
    if (status) where.status = status;
    if (condition) where.condition = condition;
    if (priority) where.priority = priority;
    if (suburb) where.suburb = suburb;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { assetNumber: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          createdByUser: {
            select: { id: true, name: true, email: true },
          },
          updatedByUser: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: {
              documents: true,
              inspections: true,
              maintenance: true,
              workOrders: true,
            },
          },
        },
      }),
      prisma.asset.count({ where }),
    ]);

    // Extract latitude and longitude from PostGIS location field
    const assetsWithCoordinates = assets.map(asset => {
      let latitude: number | undefined;
      let longitude: number | undefined;

      if (asset.location) {
        try {
          // Parse PostGIS geometry - assuming it's stored as GeoJSON
          const locationData = typeof asset.location === 'string'
            ? JSON.parse(asset.location)
            : asset.location;

          if (locationData && locationData.coordinates && Array.isArray(locationData.coordinates)) {
            // PostGIS stores coordinates as [longitude, latitude]
            [longitude, latitude] = locationData.coordinates;
          }
        } catch (error) {
          console.warn('Failed to parse location data for asset:', asset.id, error);
        }
      }

      return {
        ...asset,
        latitude,
        longitude,
      };
    });

    return NextResponse.json({
      assets: assetsWithCoordinates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assets - Create a new asset
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions - only MANAGER and above can create assets
    if (!isManagerOrHigher(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createAssetSchema.parse(body);

    // Check if asset number already exists
    const existingAsset = await prisma.asset.findUnique({
      where: { assetNumber: validatedData.assetNumber },
    });

    if (existingAsset) {
      return NextResponse.json(
        { error: "Asset number already exists" },
        { status: 400 }
      );
    }

    // Prepare asset data
    const assetData: any = {
      ...validatedData,
      organisationId: session.user.organisationId!,
      createdBy: session.user.id,
      updatedBy: session.user.id,
    };

    // Handle location data
    if (validatedData.latitude && validatedData.longitude) {
      // Create PostGIS point geometry
      assetData.location = {
        type: "Point",
        coordinates: [validatedData.longitude, validatedData.latitude],
      };
    }

    // Remove latitude/longitude from the data as they're handled above
    delete assetData.latitude;
    delete assetData.longitude;

    // Convert date strings to Date objects
    if (assetData.installationDate) {
      assetData.installationDate = new Date(assetData.installationDate);
    }
    if (assetData.warrantyExpiry) {
      assetData.warrantyExpiry = new Date(assetData.warrantyExpiry);
    }
    if (assetData.lastInspection) {
      assetData.lastInspection = new Date(assetData.lastInspection);
    }
    if (assetData.nextInspection) {
      assetData.nextInspection = new Date(assetData.nextInspection);
    }

    const asset = await prisma.asset.create({
      data: assetData,
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
        updatedByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Log the asset creation
    await prisma.auditLog.create({
      data: {
        action: "ASSET_CREATED",
        userId: session.user.id,
        organisationId: session.user.organisationId!,
        assetId: asset.id,
        details: {
          assetNumber: asset.assetNumber,
          name: asset.name,
          assetType: asset.assetType,
        },
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
        userAgent: request.headers.get("user-agent"),
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error("Error creating asset:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    );
  }
}
