import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint for control system status
 * Provides real-time status for Safety, Service, and Portfolio controls
 * Following Aegrid Rules: Every Asset Has a Purpose, Risk Sets the Rhythm
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organisationId = session.user.organisationId;

    // Get critical control alerts (Rule 1: Every Asset Has a Purpose)
    const criticalControlAlerts = await prisma.criticalControl.count({
      where: {
        organisationId,
        status: {
          in: ['OVERDUE', 'AT_RISK']
        }
      }
    });

    // Get emergency alerts
    const emergencyAlerts = await prisma.workOrder.count({
      where: {
        organisationId,
        priority: 'EMERGENCY',
        status: {
          in: ['OPEN', 'IN_PROGRESS']
        }
      }
    });

    // Get overdue work orders (Service Controls)
    const overdueWorkOrders = await prisma.workOrder.count({
      where: {
        organisationId,
        dueDate: {
          lt: new Date()
        },
        status: {
          in: ['OPEN', 'IN_PROGRESS']
        }
      }
    });

    // Get compliance issues (Portfolio Controls)
    const complianceIssues = await prisma.asset.count({
      where: {
        organisationId,
        complianceStatus: {
          in: ['NON_COMPLIANT', 'AT_RISK']
        }
      }
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
          margin: 15,   // percentage
          emergency: safetyAlerts > 5
        }
      },
      service: {
        alerts: serviceAlerts,
        status: getStatus(serviceAlerts),
        lastUpdated: new Date().toISOString(),
        marginStatus: {
          capacity: 75, // percentage
          margin: 25,   // percentage
          emergency: serviceAlerts > 10
        }
      },
      portfolio: {
        alerts: portfolioAlerts,
        status: getStatus(portfolioAlerts),
        lastUpdated: new Date().toISOString(),
        marginStatus: {
          capacity: 90, // percentage
          margin: 10,   // percentage
          emergency: portfolioAlerts > 5
        }
      }
    };

    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching control system status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch control system status' },
      { status: 500 }
    );
  }
}
