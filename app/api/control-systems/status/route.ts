import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint for control system status
 * Provides real-time status for Safety, Service, and Portfolio controls
 * Following Aegrid Rules: Every Asset Has a Purpose, Risk Sets the Rhythm
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organisationId = session.user.organisationId;
    console.log(
      'Fetching control system status for organisation:',
      organisationId
    );

    // Get critical control alerts (Rule 1: Every Asset Has a Purpose)
    const criticalControlAlerts = await prisma.assetCriticalControl.count({
      where: {
        organisationId,
        nextDueAt: {
          lt: new Date(),
        },
        status: 'ACTIVE',
      },
    });

    // Get emergency alerts
    const emergencyAlerts = await prisma.workOrder.count({
      where: {
        asset: {
          organisationId,
        },
        priority: 'CRITICAL',
        status: {
          in: ['OPEN', 'IN_PROGRESS'],
        },
      },
    });

    // Get overdue work orders (Service Controls)
    const overdueWorkOrders = await prisma.workOrder.count({
      where: {
        asset: {
          organisationId,
        },
        dueDate: {
          lt: new Date(),
        },
        status: {
          in: ['OPEN', 'IN_PROGRESS'],
        },
      },
    });

    // Get compliance issues (Portfolio Controls) - assets with overdue critical controls
    const complianceIssues = await prisma.asset.count({
      where: {
        organisationId,
        assetCriticalControls: {
          some: {
            nextDueAt: {
              lt: new Date(),
            },
            status: 'ACTIVE',
          },
        },
      },
    });

    console.log('Control system counts:', {
      criticalControlAlerts,
      emergencyAlerts,
      overdueWorkOrders,
      complianceIssues,
    });

    // Calculate control system status
    const safetyAlerts = criticalControlAlerts + emergencyAlerts;
    const serviceAlerts = overdueWorkOrders;
    const portfolioAlerts = complianceIssues;

    // Determine status based on alert levels
    const getStatus = (alerts: number): 'healthy' | 'warning' | 'critical' => {
      if (alerts === 0) return 'healthy';
      if (alerts <= 3) return 'warning';
      return 'critical';
    };

    const status = {
      safety: {
        alerts: safetyAlerts,
        status: getStatus(safetyAlerts),
        lastUpdated: new Date().toISOString(),
        marginStatus: {
          capacity: 85, // percentage
          margin: 15, // percentage
          emergency: safetyAlerts > 5,
        },
      },
      service: {
        alerts: serviceAlerts,
        status: getStatus(serviceAlerts),
        lastUpdated: new Date().toISOString(),
        marginStatus: {
          capacity: 75, // percentage
          margin: 25, // percentage
          emergency: serviceAlerts > 10,
        },
      },
      portfolio: {
        alerts: portfolioAlerts,
        status: getStatus(portfolioAlerts),
        lastUpdated: new Date().toISOString(),
        marginStatus: {
          capacity: 90, // percentage
          margin: 10, // percentage
          emergency: portfolioAlerts > 5,
        },
      },
    };

    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching control system status:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      {
        error: 'Failed to fetch control system status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
