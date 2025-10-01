/**
 * Energy Analytics API Endpoints - E21
 *
 * Dedicated endpoints for energy analytics and efficiency calculations
 *
 * @fileoverview Energy analytics API endpoints
 */

import { authOptions } from '@/lib/auth';
import { createEnergyManagementCore } from '@/lib/energy-management-core';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/energy/analytics - Get energy analytics data
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
      return NextResponse.json(
        { error: 'User must have an organisation' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const assetId = searchParams.get('assetId') || undefined;
    const period = searchParams.get('period') || 'MONTHLY';

    const _energyCore = createEnergyManagementCore(user.organisationId);

    switch (action) {
      case 'efficiency-trends': {
        const efficiencyTrends = await getEfficiencyTrends(
          user.organisationId,
          assetId,
          period
        );
        return NextResponse.json({ success: true, data: efficiencyTrends });
      }

      case 'consumption-patterns': {
        const consumptionPatterns = await getConsumptionPatterns(
          user.organisationId,
          assetId,
          period
        );
        return NextResponse.json({ success: true, data: consumptionPatterns });
      }

      case 'cost-analysis': {
        const costAnalysis = await getCostAnalysis(
          user.organisationId,
          assetId,
          period
        );
        return NextResponse.json({ success: true, data: costAnalysis });
      }

      case 'benchmarking': {
        const benchmarking = await getBenchmarkingData(
          user.organisationId,
          assetId
        );
        return NextResponse.json({ success: true, data: benchmarking });
      }

      case 'anomaly-detection': {
        const anomalies = await getAnomalyDetection(
          user.organisationId,
          assetId,
          period
        );
        return NextResponse.json({ success: true, data: anomalies });
      }

      case 'predictions': {
        const predictions = await getEnergyPredictions(
          user.organisationId,
          assetId
        );
        return NextResponse.json({ success: true, data: predictions });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Energy analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to get energy analytics data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/energy/analytics - Calculate energy analytics
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role for energy analytics
    if (!['ADMIN', 'MANAGER', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get user with organisation
    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organisation: true },
    });

    if (!user?.organisationId) {
      return NextResponse.json(
        { error: 'User must have an organisation' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    const _energyCore = createEnergyManagementCore(user.organisationId);

    switch (action) {
      case 'calculate-efficiency': {
        // Convert date strings to Date objects if provided
        if (data.periodStart && typeof data.periodStart === 'string') {
          data.periodStart = new Date(data.periodStart);
        }
        if (data.periodEnd && typeof data.periodEnd === 'string') {
          data.periodEnd = new Date(data.periodEnd);
        }
        const efficiencyResult =
          await _energyCore.calculateEnergyEfficiency(data);
        return NextResponse.json(efficiencyResult);
      }

      case 'run-anomaly-detection': {
        const anomalyResult = await runAnomalyDetection(
          user.organisationId,
          data
        );
        return NextResponse.json(anomalyResult);
      }

      case 'generate-benchmark': {
        const benchmarkResult = await generateBenchmark(
          user.organisationId,
          data
        );
        return NextResponse.json(benchmarkResult);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Energy analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to process energy analytics request' },
      { status: 500 }
    );
  }
}

// Helper functions for analytics

async function getEfficiencyTrends(
  organisationId: string,
  assetId?: string,
  _period: string = 'MONTHLY'
) {
  const { prisma } = await import('@/lib/prisma');

  const where: any = { organisationId };
  if (assetId) where.assetId = assetId;

  // Use existing EnergySystem model instead of non-existent energyEfficiencyMetric
  const energySystems = await prisma.energySystem.findMany({
    where,
    include: {
      asset: {
        select: {
          name: true,
          assetNumber: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Group by period and calculate trends from energy systems
  const trends = energySystems.reduce((acc: any, system) => {
    const key = system.createdAt.toISOString().split('T')[0];
    if (key && !acc[key]) {
      acc[key] = {
        period: key,
        efficiencyScores: [],
        capacities: [],
        outputs: [],
      };
    }
    if (key) {
      acc[key].efficiencyScores.push(Number(system.efficiency));
      acc[key].capacities.push(Number(system.capacity));
      acc[key].outputs.push(Number(system.currentOutput));
    }
    return acc;
  }, {});

  // Calculate averages and trends
  const trendData = Object.values(trends).map((trend: any) => ({
    ...trend,
    avgEfficiencyScore:
      trend.efficiencyScores.reduce((a: number, b: number) => a + b, 0) /
      trend.efficiencyScores.length,
    avgCapacity:
      trend.capacities.reduce((a: number, b: number) => a + b, 0) /
      trend.capacities.length,
    avgOutput:
      trend.outputs.reduce((a: number, b: number) => a + b, 0) /
      trend.outputs.length,
  }));

  return trendData;
}

async function getConsumptionPatterns(
  organisationId: string,
  assetId?: string,
  _period: string = 'MONTHLY'
) {
  // Mock data for consumption patterns (energyConsumption model not implemented yet)
  return {
    hourly: {
      0: { average: 45.2 },
      6: { average: 78.5 },
      12: { average: 120.3 },
      18: { average: 95.7 },
    },
    daily: {
      0: { average: 850.2 }, // Sunday
      1: { average: 920.5 }, // Monday
      2: { average: 910.3 }, // Tuesday
      3: { average: 890.7 }, // Wednesday
      4: { average: 880.1 }, // Thursday
      5: { average: 750.4 }, // Friday
      6: { average: 680.9 }, // Saturday
    },
    weekly: {
      0: { average: 6200.5 },
      1: { average: 6400.2 },
      2: { average: 6300.8 },
      3: { average: 6100.3 },
    },
  };
}

async function getCostAnalysis(
  organisationId: string,
  assetId?: string,
  _period: string = 'MONTHLY'
) {
  // Mock data for cost analysis (energyConsumption model not implemented yet)
  return {
    totalCost: 125000.5,
    averageCost: 1250.25,
    costPerUnit: 0.15,
    costTrend: [
      {
        timestamp: '2024-01-01T00:00:00Z',
        cost: 120000,
        consumption: 800000,
        costPerUnit: 0.15,
      },
      {
        timestamp: '2024-02-01T00:00:00Z',
        cost: 125000,
        consumption: 850000,
        costPerUnit: 0.147,
      },
      {
        timestamp: '2024-03-01T00:00:00Z',
        cost: 130000,
        consumption: 900000,
        costPerUnit: 0.144,
      },
    ],
    topCostAssets: [
      {
        id: '1',
        name: 'Water Treatment Plant',
        cost: 45000,
        consumption: 300000,
      },
      {
        id: '2',
        name: 'Sewage Treatment Plant',
        cost: 38000,
        consumption: 250000,
      },
      {
        id: '3',
        name: 'Street Lighting System',
        cost: 25000,
        consumption: 180000,
      },
    ],
  };
}

async function getBenchmarkingData(organisationId: string, assetId?: string) {
  const { prisma } = await import('@/lib/prisma');

  const where: any = { organisationId };
  if (assetId) where.assetId = assetId;

  // Use existing EnergySystem model instead of non-existent energyEfficiencyMetric
  const energySystems = await prisma.energySystem.findMany({
    where,
    include: {
      asset: {
        select: {
          name: true,
          assetNumber: true,
          assetType: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate benchmarking metrics from energy systems
  const benchmarking = {
    organisationAverage: 0,
    assetTypeAverages: {} as any,
    topPerformers: [] as any[],
    underPerformers: [] as any[],
    industryBenchmarks: {
      buildings: 75,
      equipment: 80,
      infrastructure: 70,
    },
  };

  let totalEfficiency = 0;
  const assetTypeEfficiencies: {
    [key: string]: { total: number; count: number };
  } = {};

  energySystems.forEach(system => {
    const efficiency = Number(system.efficiency);
    totalEfficiency += efficiency;

    const assetType = system.asset?.assetType || 'OTHER';
    if (!assetTypeEfficiencies[assetType]) {
      assetTypeEfficiencies[assetType] = { total: 0, count: 0 };
    }
    assetTypeEfficiencies[assetType].total += efficiency;
    assetTypeEfficiencies[assetType].count += 1;

    // Categorize performance
    const performance = {
      asset: system.asset,
      efficiency: efficiency,
      capacity: Number(system.capacity),
      output: Number(system.currentOutput),
      createdAt: system.createdAt,
    };

    if (efficiency >= 85) {
      benchmarking.topPerformers.push(performance);
    } else if (efficiency < 65) {
      benchmarking.underPerformers.push(performance);
    }
  });

  benchmarking.organisationAverage =
    totalEfficiency / (energySystems.length || 1);

  // Calculate asset type averages
  Object.keys(assetTypeEfficiencies).forEach(type => {
    const typeData = assetTypeEfficiencies[type];
    if (typeData) {
      benchmarking.assetTypeAverages[type] = typeData.total / typeData.count;
    }
  });

  // Sort performers
  benchmarking.topPerformers.sort((a, b) => b.efficiency - a.efficiency);
  benchmarking.underPerformers.sort((a, b) => a.efficiency - b.efficiency);

  return benchmarking;
}

async function getAnomalyDetection(
  organisationId: string,
  assetId?: string,
  _period: string = 'MONTHLY'
) {
  const { prisma } = await import('@/lib/prisma');

  const where: any = { organisationId };
  if (assetId) {
    // Find energy systems for the asset first
    const energySystems = await prisma.energySystem.findMany({
      where: { organisationId, assetId },
      select: { id: true },
    });
    where.energySystemId = { in: energySystems.map(s => s.id) };
  }

  const alerts = await prisma.energyAlert.findMany({
    where: {
      ...where,
      status: 'ACTIVE',
      detectedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
    include: {
      energySystem: {
        include: {
          asset: {
            select: {
              name: true,
              assetNumber: true,
            },
          },
        },
      },
    },
    orderBy: { detectedAt: 'desc' },
  });

  return {
    activeAlerts: alerts,
    alertSummary: {
      total: alerts.length,
      byType: alerts.reduce((acc: any, alert) => {
        acc[alert.alertType] = (acc[alert.alertType] || 0) + 1;
        return acc;
      }, {}),
      bySeverity: alerts.reduce((acc: any, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      }, {}),
    },
  };
}

async function getEnergyPredictions(
  _organisationId: string,
  _assetId?: string
) {
  // This would integrate with ML models for energy consumption prediction
  // For now, return mock prediction data
  return {
    predictions: {
      next24Hours: {
        predictedConsumption: 1250.5,
        confidence: 0.85,
        factors: ['weather', 'historical_pattern', 'occupancy'],
      },
      next7Days: {
        predictedConsumption: 8750.2,
        confidence: 0.78,
        factors: ['seasonal_trend', 'maintenance_schedule', 'weather_forecast'],
      },
      nextMonth: {
        predictedConsumption: 37500.8,
        confidence: 0.72,
        factors: ['seasonal_pattern', 'historical_average', 'planned_changes'],
      },
    },
    recommendations: [
      'Consider load shifting during peak hours',
      'Schedule maintenance during low consumption periods',
      'Optimize HVAC settings based on occupancy patterns',
    ],
  };
}

async function runAnomalyDetection(
  _organisationId: string,
  data: Record<string, unknown>
) {
  // This would run comprehensive anomaly detection algorithms
  // For now, return mock results
  return {
    success: true,
    anomaliesDetected: 3,
    processingTime: 1250,
    anomalies: [
      {
        type: 'CONSUMPTION_SPIKE',
        severity: 'HIGH',
        detectedAt: new Date(),
        assetId: data.assetId,
        description: 'Unusual consumption spike detected',
      },
    ],
  };
}

async function generateBenchmark(
  _organisationId: string,
  _data: Record<string, unknown>
) {
  // This would generate industry benchmarks for comparison
  return {
    success: true,
    benchmark: {
      industryAverage: 78.5,
      bestInClass: 92.3,
      organisationScore: 82.1,
      improvementPotential: 10.2,
    },
  };
}
