import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/control-center/performance
 * Get performance monitoring dashboard data including KPIs and alerts
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organisationId = session.user.organisationId;

    // Get performance KPIs
    const performanceKPIs = await prisma.performanceKPI.findMany({
      where: { organisationId },
      orderBy: [
        { category: 'asc' },
        { measuredAt: 'desc' }
      ]
    });

    // Get performance alerts
    const performanceAlerts = await prisma.performanceAlert.findMany({
      where: {
        organisationId,
        status: 'ACTIVE'
      },
      include: {
        kpi: {
          select: {
            id: true,
            name: true,
            category: true,
            unit: true
          }
        }
      },
      orderBy: [
        { severity: 'desc' },
        { detectedAt: 'desc' }
      ],
      take: 10
    });

    // Calculate summary statistics
    const totalKPIs = performanceKPIs.length;
    const excellentKPIs = performanceKPIs.filter(kpi => kpi.status === 'excellent').length;
    const warningKPIs = performanceKPIs.filter(kpi => kpi.status === 'warning').length;
    const criticalKPIs = performanceKPIs.filter(kpi => kpi.status === 'critical').length;

    const totalAlerts = performanceAlerts.length;
    const criticalAlerts = performanceAlerts.filter(alert => alert.severity === 'CRITICAL').length;
    const highAlerts = performanceAlerts.filter(alert => alert.severity === 'HIGH').length;

    // Group KPIs by category
    const kpisByCategory = performanceKPIs.reduce((acc, kpi) => {
      const category = kpi.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(kpi);
      return acc;
    }, {} as Record<string, typeof performanceKPIs>);

    // Calculate trends
    const trends = performanceKPIs.map(kpi => ({
      name: kpi.name,
      trend: kpi.trend,
      changePercent: Number(kpi.changePercent),
      status: kpi.status
    }));

    return NextResponse.json({
      kpis: performanceKPIs,
      alerts: performanceAlerts,
      summary: {
        totalKPIs,
        excellentKPIs,
        warningKPIs,
        criticalKPIs,
        totalAlerts,
        criticalAlerts,
        highAlerts
      },
      kpisByCategory,
      trends
    });

  } catch (error) {
    console.error('Error fetching performance monitoring data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance monitoring data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/control-center/performance
 * Create a new performance alert
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has manager or admin role
    if (!['ADMIN', 'MANAGER', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { kpiId, alertType, severity, title, description, thresholdValue, actualValue } = body;

    if (!kpiId || !alertType || !severity || !title || !description || !actualValue) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const performanceAlert = await prisma.performanceAlert.create({
      data: {
        organisationId: session.user.organisationId,
        kpiId,
        alertType,
        severity,
        title,
        description,
        thresholdValue: thresholdValue || null,
        actualValue,
        status: 'ACTIVE',
        detectedAt: new Date()
      },
      include: {
        kpi: {
          select: {
            id: true,
            name: true,
            category: true,
            unit: true
          }
        }
      }
    });

    return NextResponse.json({
      alert: performanceAlert,
      message: 'Performance alert created successfully'
    });

  } catch (error) {
    console.error('Error creating performance alert:', error);
    return NextResponse.json(
      { error: 'Failed to create performance alert' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/control-center/performance
 * Update KPI values or resolve alert
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has manager or admin role
    if (!['ADMIN', 'MANAGER', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { kpiId, alertId, currentValue, trend, changePercent, status } = body;

    if (kpiId) {
      // Update KPI
      const updateData: any = {};
      if (currentValue !== undefined) updateData.currentValue = currentValue;
      if (trend) updateData.trend = trend;
      if (changePercent !== undefined) updateData.changePercent = changePercent;
      if (status) updateData.status = status;
      updateData.measuredAt = new Date();

      const performanceKPI = await prisma.performanceKPI.update({
        where: {
          id: kpiId,
          organisationId: session.user.organisationId
        },
        data: updateData
      });

      return NextResponse.json({
        kpi: performanceKPI,
        message: 'Performance KPI updated successfully'
      });
    }

    if (alertId) {
      // Resolve performance alert
      const performanceAlert = await prisma.performanceAlert.update({
        where: {
          id: alertId,
          organisationId: session.user.organisationId
        },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date()
        },
        include: {
          kpi: {
            select: {
              id: true,
              name: true,
              category: true,
              unit: true
            }
          }
        }
      });

      return NextResponse.json({
        alert: performanceAlert,
        message: 'Performance alert resolved successfully'
      });
    }

    return NextResponse.json(
      { error: 'Missing kpiId or alertId' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating performance data:', error);
    return NextResponse.json(
      { error: 'Failed to update performance data' },
      { status: 500 }
    );
  }
}
