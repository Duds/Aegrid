/**
 * Energy Management API Endpoints - E21
 *
 * API endpoints for energy management core integration
 * Implements The Aegrid Rules for energy asset management
 *
 * @fileoverview Energy management API endpoints
 */

import { authOptions } from '@/lib/auth';
import { createEnergyManagementCore } from '@/lib/energy-management-core';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/energy - Get energy dashboard and summary data
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
    const action = searchParams.get('action');
    const assetId = searchParams.get('assetId');
    const meterId = searchParams.get('meterId');
    const period = searchParams.get('period') || 'MONTHLY';

    const energyCore = createEnergyManagementCore(user.organisationId);

    switch (action) {
      case 'dashboard':
        const dashboard = await energyCore.getEnergyDashboard();
        return NextResponse.json(dashboard);

      case 'consumption':
        const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
        const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

        const consumption = await energyCore.getEnergyConsumption({
          assetId: assetId || undefined,
          meterId: meterId || undefined,
          startDate,
          endDate,
          periodType: period,
          limit,
        });
        return NextResponse.json(consumption);

      case 'carbon-summary':
        const carbonSummary = await energyCore.getCarbonEmissionsSummary(period);
        return NextResponse.json(carbonSummary);

      case 'alerts':
        const alerts = await prisma.energyAlert.findMany({
          where: {
            organisationId: user.organisationId,
            status: 'ACTIVE',
          },
          include: {
            asset: {
              select: {
                name: true,
                assetNumber: true,
              },
            },
            meter: {
              select: {
                name: true,
                meterType: true,
              },
            },
          },
          orderBy: { detectedAt: 'desc' },
        });
        return NextResponse.json({ success: true, alerts });

      case 'meters':
        const meters = await prisma.energyMeter.findMany({
          where: {
            organisationId: user.organisationId,
          },
          include: {
            asset: {
              select: {
                name: true,
                assetNumber: true,
                assetType: true,
              },
            },
          },
        });
        return NextResponse.json({ success: true, meters });

      default:
        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Energy API error:', error);
    return NextResponse.json(
      { error: 'Failed to process energy request' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/energy - Create or update energy data
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role for energy management
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
    const { action, data } = body;

    const energyCore = createEnergyManagementCore(user.organisationId);

    switch (action) {
      case 'register-meter':
        const meterResult = await energyCore.registerEnergyMeter(data);
        return NextResponse.json(meterResult);

      case 'ingest-consumption':
        // Convert timestamp string to Date if provided
        if (data.timestamp && typeof data.timestamp === 'string') {
          data.timestamp = new Date(data.timestamp);
        }
        const consumptionResult = await energyCore.ingestEnergyConsumption(data);
        return NextResponse.json(consumptionResult);

      case 'calculate-efficiency':
        // Convert date strings to Date objects if provided
        if (data.periodStart && typeof data.periodStart === 'string') {
          data.periodStart = new Date(data.periodStart);
        }
        if (data.periodEnd && typeof data.periodEnd === 'string') {
          data.periodEnd = new Date(data.periodEnd);
        }
        const efficiencyResult = await energyCore.calculateEnergyEfficiency(data);
        return NextResponse.json(efficiencyResult);

      case 'calculate-carbon':
        // Convert date string to Date if provided
        if (data.measurementPeriod && typeof data.measurementPeriod === 'string') {
          data.measurementPeriod = new Date(data.measurementPeriod);
        }
        const carbonResult = await energyCore.calculateCarbonEmissions(data);
        return NextResponse.json(carbonResult);

      case 'create-optimisation':
        // Convert date string to Date if provided
        if (data.scheduledAt && typeof data.scheduledAt === 'string') {
          data.scheduledAt = new Date(data.scheduledAt);
        }
        const optimisationResult = await energyCore.createOptimisationAction(data);
        return NextResponse.json(optimisationResult);

      default:
        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Energy API error:', error);
    return NextResponse.json(
      { error: 'Failed to process energy request' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/energy - Update energy data or actions
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role for energy management
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
    const { action, data } = body;

    const energyCore = createEnergyManagementCore(user.organisationId);

    switch (action) {
      case 'acknowledge-alert':
        const alertUpdate = await prisma.energyAlert.update({
          where: { id: data.alertId },
          data: {
            status: 'ACKNOWLEDGED',
            acknowledgedBy: session.user.id,
            acknowledgedAt: new Date(),
          },
        });
        return NextResponse.json({ success: true, alert: alertUpdate });

      case 'resolve-alert':
        const alertResolve = await prisma.energyAlert.update({
          where: { id: data.alertId },
          data: {
            status: 'RESOLVED',
            resolvedBy: session.user.id,
            resolvedAt: new Date(),
            resolution: data.resolution,
          },
        });
        return NextResponse.json({ success: true, alert: alertResolve });

      case 'execute-optimisation':
        const executionResult = await energyCore.executeOptimisationAction(data.actionId);
        return NextResponse.json(executionResult);

      case 'update-meter':
        const meterUpdate = await prisma.energyMeter.update({
          where: { id: data.meterId },
          data: {
            ...data.updates,
            updatedAt: new Date(),
          },
        });
        return NextResponse.json({ success: true, meter: meterUpdate });

      default:
        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Energy API error:', error);
    return NextResponse.json(
      { error: 'Failed to process energy request' },
      { status: 500 }
    );
  }
}
