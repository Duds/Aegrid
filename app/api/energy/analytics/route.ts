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
      return NextResponse.json({ error: 'User must have an organisation' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const assetId = searchParams.get('assetId');
    const period = searchParams.get('period') || 'MONTHLY';

    const _energyCore = createEnergyManagementCore(user.organisationId);

    switch (action) {
      case 'efficiency-trends':
        const efficiencyTrends = await getEfficiencyTrends(user.organisationId, assetId, period);
        return NextResponse.json({ success: true, data: efficiencyTrends });

      case 'consumption-patterns':
        const consumptionPatterns = await getConsumptionPatterns(user.organisationId, assetId, period);
        return NextResponse.json({ success: true, data: consumptionPatterns });

      case 'cost-analysis':
        const costAnalysis = await getCostAnalysis(user.organisationId, assetId, period);
        return NextResponse.json({ success: true, data: costAnalysis });

      case 'benchmarking':
        const benchmarking = await getBenchmarkingData(user.organisationId, assetId);
        return NextResponse.json({ success: true, data: benchmarking });

      case 'anomaly-detection':
        const anomalies = await getAnomalyDetection(user.organisationId, assetId, period);
        return NextResponse.json({ success: true, data: anomalies });

      case 'predictions':
        const predictions = await getEnergyPredictions(user.organisationId, assetId);
        return NextResponse.json({ success: true, data: predictions });

      default:
        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
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

    const _energyCore = createEnergyManagementCore(user.organisationId);

    switch (action) {
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

      case 'run-anomaly-detection':
        const anomalyResult = await runAnomalyDetection(user.organisationId, data);
        return NextResponse.json(anomalyResult);

      case 'generate-benchmark':
        const benchmarkResult = await generateBenchmark(user.organisationId, data);
        return NextResponse.json(benchmarkResult);

      default:
        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
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

async function getEfficiencyTrends(organisationId: string, assetId?: string, period: string = 'MONTHLY') {
  const { prisma } = await import('@/lib/prisma');

  const where: any = { organisationId };
  if (assetId) where.assetId = assetId;

  const efficiencyMetrics = await prisma.energyEfficiencyMetric.findMany({
    where,
    include: {
      asset: {
        select: {
          name: true,
          assetNumber: true,
        },
      },
    },
    orderBy: { periodStart: 'asc' },
  });

  // Group by period and calculate trends
  const trends = efficiencyMetrics.reduce((acc: any, metric) => {
    const key = metric.periodStart.toISOString().split('T')[0];
    if (!acc[key]) {
      acc[key] = {
        period: key,
        efficiencyScores: [],
        carbonIntensities: [],
        costs: [],
      };
    }
    acc[key].efficiencyScores.push(Number(metric.efficiencyScore));
    acc[key].carbonIntensities.push(Number(metric.carbonIntensity));
    acc[key].costs.push(Number(metric.costPerUnit));
    return acc;
  }, {});

  // Calculate averages and trends
  const trendData = Object.values(trends).map((trend: any) => ({
    ...trend,
    avgEfficiencyScore: trend.efficiencyScores.reduce((a: number, b: number) => a + b, 0) / trend.efficiencyScores.length,
    avgCarbonIntensity: trend.carbonIntensities.reduce((a: number, b: number) => a + b, 0) / trend.carbonIntensities.length,
    avgCost: trend.costs.reduce((a: number, b: number) => a + b, 0) / trend.costs.length,
  }));

  return trendData;
}

async function getConsumptionPatterns(organisationId: string, assetId?: string, period: string = 'MONTHLY') {
  const { prisma } = await import('@/lib/prisma');

  const where: any = { organisationId };
  if (assetId) where.assetId = assetId;

  // Get consumption data for pattern analysis
  const consumption = await prisma.energyConsumption.findMany({
    where,
    orderBy: { timestamp: 'asc' },
    take: 1000, // Limit for performance
  });

  // Analyze patterns by hour of day, day of week, etc.
  const patterns = {
    hourly: {} as any,
    daily: {} as any,
    weekly: {} as any,
  };

  consumption.forEach(record => {
    const timestamp = new Date(record.timestamp);
    const hour = timestamp.getHours();
    const day = timestamp.getDay();
    const week = Math.floor(timestamp.getDate() / 7);

    // Hourly patterns
    if (!patterns.hourly[hour]) {
      patterns.hourly[hour] = { consumption: 0, count: 0 };
    }
    patterns.hourly[hour].consumption += Number(record.consumptionValue);
    patterns.hourly[hour].count += 1;

    // Daily patterns
    if (!patterns.daily[day]) {
      patterns.daily[day] = { consumption: 0, count: 0 };
    }
    patterns.daily[day].consumption += Number(record.consumptionValue);
    patterns.daily[day].count += 1;

    // Weekly patterns
    if (!patterns.weekly[week]) {
      patterns.weekly[week] = { consumption: 0, count: 0 };
    }
    patterns.weekly[week].consumption += Number(record.consumptionValue);
    patterns.weekly[week].count += 1;
  });

  // Calculate averages
  Object.keys(patterns.hourly).forEach(hour => {
    patterns.hourly[hour].average = patterns.hourly[hour].consumption / patterns.hourly[hour].count;
  });

  Object.keys(patterns.daily).forEach(day => {
    patterns.daily[day].average = patterns.daily[day].consumption / patterns.daily[day].count;
  });

  Object.keys(patterns.weekly).forEach(week => {
    patterns.weekly[week].average = patterns.weekly[week].consumption / patterns.weekly[week].count;
  });

  return patterns;
}

async function getCostAnalysis(organisationId: string, assetId?: string, period: string = 'MONTHLY') {
  const { prisma } = await import('@/lib/prisma');

  const where: any = { organisationId };
  if (assetId) where.assetId = assetId;

  const consumption = await prisma.energyConsumption.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: 1000,
  });

  const costAnalysis = {
    totalCost: 0,
    averageCost: 0,
    costPerUnit: 0,
    costTrend: [] as any[],
    topCostAssets: [] as any[],
  };

  let totalConsumption = 0;
  const assetCosts: { [key: string]: { cost: number; consumption: number; name: string } } = {};

  consumption.forEach(record => {
    const cost = Number(record.totalCost || 0);
    const consumptionValue = Number(record.consumptionValue);

    costAnalysis.totalCost += cost;
    totalConsumption += consumptionValue;

    if (record.asset) {
      const assetKey = record.asset.id;
      if (!assetCosts[assetKey]) {
        assetCosts[assetKey] = {
          cost: 0,
          consumption: 0,
          name: record.asset.name || 'Unknown',
        };
      }
      assetCosts[assetKey].cost += cost;
      assetCosts[assetKey].consumption += consumptionValue;
    }

    // Cost trend data
    costAnalysis.costTrend.push({
      timestamp: record.timestamp,
      cost,
      consumption: consumptionValue,
      costPerUnit: cost / (consumptionValue || 1),
    });
  });

  costAnalysis.averageCost = costAnalysis.totalCost / (consumption.length || 1);
  costAnalysis.costPerUnit = costAnalysis.totalCost / (totalConsumption || 1);

  // Top cost assets
  costAnalysis.topCostAssets = Object.entries(assetCosts)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10);

  return costAnalysis;
}

async function getBenchmarkingData(organisationId: string, assetId?: string) {
  const { prisma } = await import('@/lib/prisma');

  const where: any = { organisationId };
  if (assetId) where.assetId = assetId;

  const efficiencyMetrics = await prisma.energyEfficiencyMetric.findMany({
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
    orderBy: { periodStart: 'desc' },
  });

  // Calculate benchmarking metrics
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
  const assetTypeEfficiencies: { [key: string]: { total: number; count: number } } = {};

  efficiencyMetrics.forEach(metric => {
    const efficiency = Number(metric.efficiencyScore);
    totalEfficiency += efficiency;

    const assetType = metric.asset?.assetType || 'OTHER';
    if (!assetTypeEfficiencies[assetType]) {
      assetTypeEfficiencies[assetType] = { total: 0, count: 0 };
    }
    assetTypeEfficiencies[assetType].total += efficiency;
    assetTypeEfficiencies[assetType].count += 1;

    // Categorize performance
    const performance = {
      asset: metric.asset,
      efficiency: efficiency,
      benchmark: metric.benchmarkScore ? Number(metric.benchmarkScore) : null,
      period: metric.periodStart,
    };

    if (efficiency >= 85) {
      benchmarking.topPerformers.push(performance);
    } else if (efficiency < 65) {
      benchmarking.underPerformers.push(performance);
    }
  });

  benchmarking.organisationAverage = totalEfficiency / (efficiencyMetrics.length || 1);

  // Calculate asset type averages
  Object.keys(assetTypeEfficiencies).forEach(type => {
    benchmarking.assetTypeAverages[type] =
      assetTypeEfficiencies[type].total / assetTypeEfficiencies[type].count;
  });

  // Sort performers
  benchmarking.topPerformers.sort((a, b) => b.efficiency - a.efficiency);
  benchmarking.underPerformers.sort((a, b) => a.efficiency - b.efficiency);

  return benchmarking;
}

async function getAnomalyDetection(organisationId: string, assetId?: string, period: string = 'MONTHLY') {
  const { prisma } = await import('@/lib/prisma');

  const where: any = { organisationId };
  if (assetId) where.assetId = assetId;

  const alerts = await prisma.energyAlert.findMany({
    where: {
      ...where,
      status: 'ACTIVE',
      detectedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
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

async function getEnergyPredictions(organisationId: string, assetId?: string) {
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

async function runAnomalyDetection(organisationId: string, data: any) {
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

async function generateBenchmark(organisationId: string, data: any) {
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
