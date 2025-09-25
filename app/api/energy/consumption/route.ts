/**
 * Energy Consumption API Endpoints - E21
 *
 * Dedicated endpoints for energy consumption data management
 *
 * @fileoverview Energy consumption API endpoints
 */

import { authOptions } from '@/lib/auth';
import { createEnergyManagementCore } from '@/lib/energy-management-core';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/energy/consumption - Get energy consumption data
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with organisation
    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
        include: { organisation: true },
    });

    if (!user?.organisationId) {
      return NextResponse.json({ error: 'User must have an organisation' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');
    const meterId = searchParams.get('meterId');
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    const periodType = searchParams.get('periodType') || 'DAILY';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 1000;
    const aggregation = searchParams.get('aggregation'); // HOURLY, DAILY, WEEKLY, MONTHLY

    const energyCore = createEnergyManagementCore(user.organisationId);

    const result = await energyCore.getEnergyConsumption({
      assetId: assetId || undefined,
      meterId: meterId || undefined,
      startDate,
      endDate,
      periodType,
      limit,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    // Apply aggregation if requested
    if (aggregation && result.data) {
      const aggregatedData = aggregateConsumptionData(result.data, aggregation);
      return NextResponse.json({
        ...result,
        data: aggregatedData,
        aggregation,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Energy consumption API error:', error);
    return NextResponse.json(
      { error: 'Failed to get energy consumption data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/energy/consumption - Ingest energy consumption data
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role for energy data ingestion
    if (!['ADMIN', 'MANAGER', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get user with organisation
    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
        include: { organisation: true },
    });

    if (!user?.organisationId) {
      return NextResponse.json({ error: 'User must have an organisation' }, { status: 400 });
    }

    const body = await request.json();

    // Handle single or batch data ingestion
    const consumptionData = Array.isArray(body) ? body : [body];

    const energyCore = createEnergyManagementCore(user.organisationId);
    const results = [];

    for (const data of consumptionData) {
      // Convert timestamp string to Date if provided
      if (data.timestamp && typeof data.timestamp === 'string') {
        data.timestamp = new Date(data.timestamp);
      }

      const result = await energyCore.ingestEnergyConsumption(data);
      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
      success: failureCount === 0,
      message: `Processed ${successCount} records successfully, ${failureCount} failed`,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
      },
    });
  } catch (error) {
    console.error('Energy consumption API error:', error);
    return NextResponse.json(
      { error: 'Failed to ingest energy consumption data' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to aggregate consumption data
 */
function aggregateConsumptionData(data: any[], aggregation: string) {
  const aggregated: { [key: string]: any } = {};

  data.forEach(record => {
    const timestamp = new Date(record.timestamp);
    let key: string;

    switch (aggregation) {
      case 'HOURLY':
        key = `${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}-${timestamp.getHours()}`;
        break;
      case 'DAILY':
        key = `${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}`;
        break;
      case 'WEEKLY':
        const weekStart = new Date(timestamp);
        weekStart.setDate(timestamp.getDate() - timestamp.getDay());
        key = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
        break;
      case 'MONTHLY':
        key = `${timestamp.getFullYear()}-${timestamp.getMonth()}`;
        break;
      default:
        key = timestamp.toISOString();
    }

    if (!aggregated[key]) {
      aggregated[key] = {
        period: key,
        timestamp: timestamp,
        consumptionValue: 0,
        totalCost: 0,
        powerDemand: 0,
        count: 0,
        asset: record.asset,
        meter: record.meter,
      };
    }

    aggregated[key].consumptionValue += Number(record.consumptionValue);
    aggregated[key].totalCost += Number(record.totalCost || 0);
    aggregated[key].powerDemand += Number(record.powerDemand || 0);
    aggregated[key].count += 1;
  });

  // Calculate averages for power demand
  Object.values(aggregated).forEach((item: any) => {
    if (item.count > 0) {
      item.powerDemand = item.powerDemand / item.count;
    }
  });

  return Object.values(aggregated).sort((a: any, b: any) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}
