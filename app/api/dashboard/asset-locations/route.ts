import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/dashboard/asset-locations - Get asset locations for map visualization
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const condition = searchParams.get('condition');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assetType = searchParams.get('assetType');
    const criticality = searchParams.get('criticality');

    // Build where clause
    const where: any = {
      organisationId: session.user.organisationId,
    };

    if (condition) {
      where.condition = condition;
    }
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (assetType) {
      where.assetType = assetType;
    }
    if (criticality) {
      where.criticalityLevel = criticality;
    }

    const assets = await prisma.asset.findMany({
      where,
      select: {
        id: true,
        assetNumber: true,
        name: true,
        assetType: true,
        condition: true,
        status: true,
        priority: true,
        criticalityLevel: true,
        address: true,
        suburb: true,
        state: true,
        postcode: true,
        lastInspection: true,
        nextInspection: true,
        currentValue: true,
      },
    });

    // Process assets and extract coordinates
    const assetLocations = assets.map(asset => {
      let latitude: number | undefined;
      let longitude: number | undefined;

      // Location field not available in current query
      // if (asset.location) {
      //   try {
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

      // Use default coordinates if no location data (for testing)
      if (!latitude || !longitude) {
        // Default to Dubbo, NSW coordinates for Greenfield Shire Council
        latitude = -32.2433 + (Math.random() - 0.5) * 0.1; // Small random offset
        longitude = 148.6042 + (Math.random() - 0.5) * 0.1;
      }

      return {
        id: asset.id,
        name: asset.name,
        type: asset.assetType,
        condition: asset.condition,
        status: asset.status,
        priority: asset.priority,
        latitude,
        longitude,
        address:
          `${asset.address || ''} ${asset.suburb || ''} ${asset.state || ''} ${asset.postcode || ''}`.trim(),
        lastInspection: asset.lastInspection?.toISOString().split('T')[0],
        nextInspection: asset.nextInspection?.toISOString().split('T')[0],
        value: asset.currentValue ? Number(asset.currentValue) : 0,
        criticality: asset.criticalityLevel || asset.priority,
      };
    });

    return NextResponse.json({ assetLocations });
  } catch (error) {
    console.error('Error fetching asset locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset locations' },
      { status: 500 }
    );
  }
}
