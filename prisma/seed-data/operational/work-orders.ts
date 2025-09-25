/**
 * Historical Work Orders Generator
 *
 * Creates historical work orders for the Greenfield Shire Council
 * infrastructure assets to demonstrate operational history.
 */

import { PrismaClient } from '@prisma/client';

export async function generateHistoricalWorkOrders(prisma: PrismaClient, organisationId: string): Promise<number> {
  console.log('  📋 Creating historical work orders...');

  // Get assets to create work orders for
  const assets = await prisma.asset.findMany({
    where: { organisationId },
    take: 100, // Limit to avoid too many work orders
    select: { id: true, name: true, assetType: true, priority: true }
  });

  if (assets.length === 0) {
    console.log('   ⚠️  No assets found, skipping work orders');
    return 0;
  }

  // Get users to assign work orders to
  const users = await prisma.user.findMany({
    where: {
      organisationId,
      role: { in: ['SUPERVISOR', 'CREW', 'CONTRACTOR'] }
    },
    select: { id: true, name: true, role: true }
  });

  if (users.length === 0) {
    console.log('   ⚠️  No users found, skipping work orders');
    return 0;
  }

  const workOrderTypes = [
    'PREVENTIVE_MAINTENANCE',
    'CORRECTIVE_MAINTENANCE',
    'EMERGENCY_REPAIR',
    'INSPECTION',
    'UPGRADE',
    'REPLACEMENT',
    'CLEANING',
    'CALIBRATION',
    'TESTING',
    'MODIFICATION'
  ];

  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD'];

  const workOrders = [];
  const now = new Date();

  // Create 200 work orders (reduced from 2000 for performance)
  for (let i = 0; i < 200; i++) {
    const asset = assets[i % assets.length];
    const assignedUser = users[Math.floor(Math.random() * users.length)];
    const workOrderType = workOrderTypes[i % workOrderTypes.length];
    const priority = asset.priority === 'CRITICAL' ?
      (Math.random() > 0.5 ? 'CRITICAL' : 'HIGH') :
      priorities[Math.floor(Math.random() * priorities.length)];
    const status = Math.random() > 0.2 ? 'COMPLETED' : statuses[Math.floor(Math.random() * statuses.length)];

    // Create work order 1-730 days ago (2 years)
    const createdAt = new Date(now.getTime() - Math.random() * 730 * 24 * 60 * 60 * 1000);
    const dueDate = new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
    const completedAt = status === 'COMPLETED' ?
      new Date(createdAt.getTime() + Math.random() * (dueDate.getTime() - createdAt.getTime())) :
      null;

    const workOrder = await prisma.workOrder.create({
      data: {
        assetId: asset.id,
        workOrderNumber: `WO-${organisationId.slice(-8)}-${Date.now()}-${String(i + 1).padStart(4, '0')}`,
        title: `${workOrderType.replace('_', ' ')} - ${asset.name}`,
        description: `Work order for ${workOrderType.toLowerCase().replace('_', ' ')} on ${asset.name}. ${getWorkOrderDescription(workOrderType, priority)}`,
        priority,
        status,
        assignedTo: assignedUser.id,
        assignedBy: users.find(u => u.role === 'SUPERVISOR')?.id || assignedUser.id,
        scheduledDate: createdAt,
        dueDate,
        completedDate: completedAt,
        estimatedDuration: Math.floor(Math.random() * 480) + 60, // 1-8 hours
        actualDuration: completedAt ? Math.floor(Math.random() * 480) + 60 : null,
        estimatedCost: Math.floor(Math.random() * 5000) + 100, // $100-$5000 AUD
        actualCost: completedAt ? Math.floor(Math.random() * 5000) + 100 : null,
        workPerformed: status === 'COMPLETED' ? 'Work completed successfully.' : 'Work order in progress.',
        notes: status === 'COMPLETED' ? 'Work completed successfully.' : 'Work order in progress.',
      }
    });

    workOrders.push(workOrder);
  }

  console.log(`   ✅ Created ${workOrders.length} work orders`);
  return workOrders.length;
}

function getWorkOrderDescription(workOrderType: string, priority: string): string {
  const descriptions = {
    'PREVENTIVE_MAINTENANCE': 'Scheduled maintenance to prevent equipment failure.',
    'CORRECTIVE_MAINTENANCE': 'Repair work to fix identified issues.',
    'EMERGENCY_REPAIR': 'Urgent repair work for critical failures.',
    'INSPECTION': 'Routine inspection to assess asset condition.',
    'UPGRADE': 'Equipment upgrade to improve performance.',
    'REPLACEMENT': 'Replacement of failed or obsolete components.',
    'CLEANING': 'Cleaning and maintenance of equipment.',
    'CALIBRATION': 'Calibration of measurement equipment.',
    'TESTING': 'Testing of equipment functionality.',
    'MODIFICATION': 'Modification of existing equipment.'
  };

  const baseDescription = descriptions[workOrderType] || 'Work order for asset maintenance.';

  if (priority === 'CRITICAL') {
    return `CRITICAL PRIORITY: ${baseDescription} Immediate attention required.`;
  } else if (priority === 'HIGH') {
    return `HIGH PRIORITY: ${baseDescription} Urgent attention required.`;
  } else if (priority === 'MEDIUM') {
    return `MEDIUM PRIORITY: ${baseDescription} Standard priority work.`;
  } else {
    return `LOW PRIORITY: ${baseDescription} Routine maintenance work.`;
  }
}
