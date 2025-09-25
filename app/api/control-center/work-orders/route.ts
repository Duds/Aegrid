import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/control-center/work-orders
 * Get work orders with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const type = searchParams.get('type');
    const assignedTo = searchParams.get('assignedTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const organisationId = session.user.organisationId;

    // Build where clause
    const where: any = { asset: { organisationId } };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;

    // Get work orders
    const workOrders = await prisma.workOrder.findMany({
      where,
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetNumber: true,
            assetType: true,
            priority: true,
            address: true,
            suburb: true,
            postcode: true,
            state: true
          }
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        vendor: {
          select: {
            id: true,
            name: true,
            contactEmail: true,
            contactPhone: true
          }
        },
        workOrderTypeMappings: {
          include: {
            workOrderType: {
              select: {
                id: true,
                name: true,
                category: true
              }
            }
          }
        },
        workOrderSkillMappings: {
          include: {
            workOrderSkill: {
              select: {
                id: true,
                name: true,
                category: true,
                skillLevel: true,
                certificationRequired: true
              }
            }
          }
        },
        workOrderPartMappings: {
          include: {
            workOrderPart: {
              select: {
                id: true,
                partNumber: true,
                name: true,
                category: true,
                currentStock: true,
                unitCost: true
              }
            }
          }
        },
        workOrderSafetyMappings: {
          include: {
            workOrderSafetyRequirement: {
              select: {
                id: true,
                name: true,
                category: true,
                isMandatory: true,
                requiresPermit: true,
                requiresTraining: true
              }
            }
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.workOrder.count({ where });

    // Get summary statistics
    const statusCounts = await prisma.workOrder.groupBy({
      by: ['status'],
      where: { asset: { organisationId } },
      _count: true
    });

    const priorityCounts = await prisma.workOrder.groupBy({
      by: ['priority'],
      where: { asset: { organisationId } },
      _count: true
    });

    return NextResponse.json({
      workOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      summary: {
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
        priorityCounts: priorityCounts.reduce((acc, item) => {
          acc[item.priority] = item._count;
          return acc;
        }, {} as Record<string, number>)
      }
    });

  } catch (error) {
    console.error('Error fetching work orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work orders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/control-center/work-orders
 * Create a new work order
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
    const {
      assetId,
      title,
      description,
      priority,
      assignedTo,
      dueDate,
      estimatedDuration,
      workOrderTypeIds,
      skillIds,
      partIds,
      safetyRequirementIds
    } = body;

    if (!assetId || !title || !description || !priority) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate work order number
    const workOrderCount = await prisma.workOrder.count({
      where: { asset: { organisationId: session.user.organisationId } }
    });
    const workOrderNumber = `WO-${new Date().getFullYear()}-${String(workOrderCount + 1).padStart(4, '0')}`;

    // Create work order
    const workOrder = await prisma.workOrder.create({
      data: {
        assetId,
        workOrderNumber,
        title,
        description,
        priority,
        status: 'OPEN',
        assignedTo: assignedTo || null,
        assignedBy: session.user.id,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedDuration: estimatedDuration || null,
        createdAt: new Date()
      }
    });

    // Create type mappings
    if (workOrderTypeIds && workOrderTypeIds.length > 0) {
      await prisma.workOrderTypeMapping.createMany({
        data: workOrderTypeIds.map((typeId: string) => ({
          workOrderId: workOrder.id,
          workOrderTypeId: typeId
        }))
      });
    }

    // Create skill mappings
    if (skillIds && skillIds.length > 0) {
      await prisma.workOrderSkillMapping.createMany({
        data: skillIds.map((skillId: string) => ({
          workOrderId: workOrder.id,
          workOrderSkillId: skillId
        }))
      });
    }

    // Create part mappings
    if (partIds && partIds.length > 0) {
      await prisma.workOrderPartMapping.createMany({
        data: partIds.map((partId: string) => ({
          workOrderId: workOrder.id,
          workOrderPartId: partId,
          quantityRequired: 1 // Default quantity
        }))
      });
    }

    // Create safety requirement mappings
    if (safetyRequirementIds && safetyRequirementIds.length > 0) {
      await prisma.workOrderSafetyMapping.createMany({
        data: safetyRequirementIds.map((safetyId: string) => ({
          workOrderId: workOrder.id,
          workOrderSafetyRequirementId: safetyId,
          isCompliant: false
        }))
      });
    }

    // Fetch the complete work order with relationships
    const completeWorkOrder = await prisma.workOrder.findUnique({
      where: { id: workOrder.id },
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
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json({
      workOrder: completeWorkOrder,
      message: 'Work order created successfully'
    });

  } catch (error) {
    console.error('Error creating work order:', error);
    return NextResponse.json(
      { error: 'Failed to create work order' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/control-center/work-orders
 * Update work order status or details
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workOrderId, status, assignedTo, actualDuration, workPerformed, notes } = body;

    if (!workOrderId) {
      return NextResponse.json(
        { error: 'Missing workOrderId' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'IN_PROGRESS') {
        updateData.startedAt = new Date();
      } else if (status === 'COMPLETED') {
        updateData.completedDate = new Date();
      }
    }
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (actualDuration !== undefined) updateData.actualDuration = actualDuration;
    if (workPerformed) updateData.workPerformed = workPerformed;
    if (notes) updateData.notes = notes;

    const workOrder = await prisma.workOrder.update({
      where: {
        id: workOrderId,
        asset: { organisationId: session.user.organisationId }
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
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json({
      workOrder,
      message: 'Work order updated successfully'
    });

  } catch (error) {
    console.error('Error updating work order:', error);
    return NextResponse.json(
      { error: 'Failed to update work order' },
      { status: 500 }
    );
  }
}
