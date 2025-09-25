import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/control-center/energy
 * Get energy control dashboard data including systems and alerts
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organisationId = session.user.organisationId;

    // Get energy systems
    const energySystems = await prisma.energySystem.findMany({
      where: { organisationId },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetNumber: true,
            assetType: true,
            priority: true
          }
        },
        energyAlerts: {
          where: { status: 'ACTIVE' },
          orderBy: { detectedAt: 'desc' },
          take: 5
        }
      },
      orderBy: { systemType: 'asc' }
    });

    // Get energy alerts
    const energyAlerts = await prisma.energyAlert.findMany({
      where: {
        organisationId,
        status: 'ACTIVE'
      },
      include: {
        energySystem: {
          select: {
            id: true,
            name: true,
            systemType: true,
            location: true
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
    const totalSystems = energySystems.length;
    const operationalSystems = energySystems.filter(system => system.status === 'OPERATIONAL').length;
    const totalCapacity = energySystems.reduce((sum, system) => sum + Number(system.capacity), 0);
    const totalOutput = energySystems.reduce((sum, system) => sum + Number(system.currentOutput), 0);
    const overallEfficiency = totalCapacity > 0 ? (totalOutput / totalCapacity) * 100 : 0;

    const totalAlerts = energyAlerts.length;
    const criticalAlerts = energyAlerts.filter(alert => alert.severity === 'CRITICAL').length;
    const highAlerts = energyAlerts.filter(alert => alert.severity === 'HIGH').length;

    // Calculate energy consumption by type
    const energyConsumption = energySystems.reduce((acc, system) => {
      const type = system.systemType;
      if (!acc[type]) {
        acc[type] = { capacity: 0, output: 0, count: 0 };
      }
      acc[type].capacity += Number(system.capacity);
      acc[type].output += Number(system.currentOutput);
      acc[type].count += 1;
      return acc;
    }, {} as Record<string, { capacity: number; output: number; count: number }>);

    return NextResponse.json({
      systems: energySystems,
      alerts: energyAlerts,
      summary: {
        totalSystems,
        operationalSystems,
        totalCapacity: Math.round(totalCapacity * 100) / 100,
        totalOutput: Math.round(totalOutput * 100) / 100,
        overallEfficiency: Math.round(overallEfficiency * 100) / 100,
        totalAlerts,
        criticalAlerts,
        highAlerts
      },
      consumption: energyConsumption
    });

  } catch (error) {
    console.error('Error fetching energy control data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch energy control data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/control-center/energy
 * Create a new energy alert
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
    const { energySystemId, alertType, severity, message, description } = body;

    if (!energySystemId || !alertType || !severity || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const energyAlert = await prisma.energyAlert.create({
      data: {
        organisationId: session.user.organisationId,
        energySystemId,
        alertType,
        severity,
        message,
        description: description || null,
        status: 'ACTIVE',
        detectedAt: new Date()
      },
      include: {
        energySystem: {
          select: {
            id: true,
            name: true,
            systemType: true,
            location: true
          }
        }
      }
    });

    return NextResponse.json({
      alert: energyAlert,
      message: 'Energy alert created successfully'
    });

  } catch (error) {
    console.error('Error creating energy alert:', error);
    return NextResponse.json(
      { error: 'Failed to create energy alert' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/control-center/energy
 * Update energy system status or resolve alert
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
    const { systemId, alertId, status, currentOutput, efficiency, batteryLevel } = body;

    if (systemId) {
      // Update energy system
      const updateData: any = {};
      if (status) updateData.status = status;
      if (currentOutput !== undefined) updateData.currentOutput = currentOutput;
      if (efficiency !== undefined) updateData.efficiency = efficiency;
      if (batteryLevel !== undefined) updateData.batteryLevel = batteryLevel;

      const energySystem = await prisma.energySystem.update({
        where: {
          id: systemId,
          organisationId: session.user.organisationId
        },
        data: updateData,
        include: {
          asset: {
            select: {
              id: true,
              name: true,
              assetNumber: true,
              assetType: true,
              priority: true
            }
          },
          energyAlerts: {
            where: { status: 'ACTIVE' },
            orderBy: { detectedAt: 'desc' },
            take: 5
          }
        }
      });

      return NextResponse.json({
        system: energySystem,
        message: 'Energy system updated successfully'
      });
    }

    if (alertId) {
      // Resolve energy alert
      const energyAlert = await prisma.energyAlert.update({
        where: {
          id: alertId,
          organisationId: session.user.organisationId
        },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date()
        },
        include: {
          energySystem: {
            select: {
              id: true,
              name: true,
              systemType: true,
              location: true
            }
          }
        }
      });

      return NextResponse.json({
        alert: energyAlert,
        message: 'Energy alert resolved successfully'
      });
    }

    return NextResponse.json(
      { error: 'Missing systemId or alertId' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating energy data:', error);
    return NextResponse.json(
      { error: 'Failed to update energy data' },
      { status: 500 }
    );
  }
}
