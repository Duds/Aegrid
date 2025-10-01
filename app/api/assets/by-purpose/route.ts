import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/assets/by-purpose - Search assets by service purpose
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '1000');

    if (!searchTerm) {
      return NextResponse.json(
        { error: 'Search term required' },
        { status: 400 }
      );
    }

    // Build where clause for purpose-based search
    const where = {
      organisationId: session.user.organisationId!,
      OR: [
        { purpose: { contains: searchTerm, mode: 'insensitive' as const } },
        {
          purposeDescription: {
            contains: searchTerm,
            mode: 'insensitive' as const,
          },
        },
        {
          functionBasedCategory: {
            contains: searchTerm,
            mode: 'insensitive' as const,
          },
        },
      ],
    };

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
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

      // Location field not available in current query
      // if (asset.location) {
      //   try {
      //     // Parse PostGIS geometry - assuming it's stored as GeoJSON
      //     const locationData = typeof asset.location === 'string'
      //       ? JSON.parse(asset.location)
      //       : asset.location;
      //
      //     if (locationData && locationData.coordinates && Array.isArray(locationData.coordinates)) {
      //       // PostGIS stores coordinates as [longitude, latitude]
      //       [longitude, latitude] = locationData.coordinates;
      //     }
      //   } catch (error) {
      //     console.warn('Failed to parse location data for asset:', asset.id, error);
      //   }
      // }

      return {
        ...asset,
        latitude,
        longitude,
      };
    });

    return NextResponse.json({
      assets: assetsWithCoordinates,
      pagination: {
        total,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching assets by purpose:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets by purpose' },
      { status: 500 }
    );
  }
}
