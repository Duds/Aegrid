/**
 * Maintenance Records Generator
 *
 * Creates maintenance records for the Greenfield Shire Council
 * infrastructure assets to demonstrate maintenance history.
 */

import { PrismaClient } from '@prisma/client';

export async function generateMaintenanceRecords(prisma: PrismaClient, organisationId: string): Promise<number> {
  console.log('  🔧 Creating maintenance records...');

  // Get assets to create maintenance records for
  const assets = await prisma.asset.findMany({
    where: { organisationId },
    take: 120, // Limit to avoid too many maintenance records
    select: { id: true, name: true, assetType: true, priority: true }
  });

  if (assets.length === 0) {
    console.log('   ⚠️  No assets found, skipping maintenance records');
    return 0;
  }

  // Get users to assign maintenance to
  const users = await prisma.user.findMany({
    where: {
      organisationId,
      role: { in: ['SUPERVISOR', 'CREW', 'CONTRACTOR'] }
    },
    select: { id: true, name: true, role: true }
  });

  if (users.length === 0) {
    console.log('   ⚠️  No users found, skipping maintenance records');
    return 0;
  }

  const maintenanceTypes = [
    'PREVENTIVE_MAINTENANCE',
    'CORRECTIVE_MAINTENANCE',
    'EMERGENCY_REPAIR',
    'ROUTINE_MAINTENANCE',
    'SCHEDULED_MAINTENANCE',
    'BREAKDOWN_REPAIR',
    'UPGRADE_MAINTENANCE',
    'CALIBRATION',
    'CLEANING',
    'INSPECTION_MAINTENANCE'
  ];

  const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  const maintenanceRecords = [];
  const now = new Date();

  // Create 120 maintenance records (reduced from 1800 for performance)
  for (let i = 0; i < 120; i++) {
    const asset = assets[i % assets.length];
    const technician = users[Math.floor(Math.random() * users.length)];
    const maintenanceType = maintenanceTypes[i % maintenanceTypes.length];
    const priority = asset.priority === 'CRITICAL' ?
      (Math.random() > 0.3 ? 'CRITICAL' : 'HIGH') :
      priorities[Math.floor(Math.random() * priorities.length)];
    const status = Math.random() > 0.15 ? 'COMPLETED' : statuses[Math.floor(Math.random() * statuses.length)];

    // Create maintenance record 1-180 days ago (6 months)
    const maintenanceDate = new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000);
    const completedAt = status === 'COMPLETED' ?
      new Date(maintenanceDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) :
      null;

    const maintenanceRecord = await prisma.assetMaintenance.create({
      data: {
        organisationId,
        assetId: asset.id,
        maintenanceType,
        technicianId: technician.id,
        maintenanceDate,
        completedAt,
        status,
        priority,
        description: `Maintenance work for ${maintenanceType.toLowerCase().replace('_', ' ')} on ${asset.name}. ${getMaintenanceDescription(maintenanceType, priority)}`,
        workPerformed: getWorkPerformed(maintenanceType, status),
        materialsUsed: getMaterialsUsed(maintenanceType),
        cost: Math.floor(Math.random() * 3000) + 50, // $50-$3000 AUD
        duration: completedAt ? Math.floor(Math.random() * 240) + 30 : null, // 30 minutes to 4 hours
        notes: `Maintenance completed by ${technician.name}. ${getMaintenanceNotes(status, maintenanceType)}`,
        nextMaintenanceDate: new Date(maintenanceDate.getTime() + getNextMaintenanceInterval(maintenanceType)),
        createdAt: maintenanceDate,
        updatedAt: completedAt || maintenanceDate,
      }
    });

    maintenanceRecords.push(maintenanceRecord);
  }

  console.log(`   ✅ Created ${maintenanceRecords.length} maintenance records`);
  return maintenanceRecords.length;
}

function getNextMaintenanceInterval(maintenanceType: string): number {
  const intervals = {
    'PREVENTIVE_MAINTENANCE': 90 * 24 * 60 * 60 * 1000, // 90 days
    'CORRECTIVE_MAINTENANCE': 30 * 24 * 60 * 60 * 1000, // 30 days
    'EMERGENCY_REPAIR': 7 * 24 * 60 * 60 * 1000, // 7 days
    'ROUTINE_MAINTENANCE': 60 * 24 * 60 * 60 * 1000, // 60 days
    'SCHEDULED_MAINTENANCE': 120 * 24 * 60 * 60 * 1000, // 120 days
    'BREAKDOWN_REPAIR': 14 * 24 * 60 * 60 * 1000, // 14 days
    'UPGRADE_MAINTENANCE': 180 * 24 * 60 * 60 * 1000, // 180 days
    'CALIBRATION': 30 * 24 * 60 * 60 * 1000, // 30 days
    'CLEANING': 14 * 24 * 60 * 60 * 1000, // 14 days
    'INSPECTION_MAINTENANCE': 45 * 24 * 60 * 60 * 1000, // 45 days
  };

  return intervals[maintenanceType] || 60 * 24 * 60 * 60 * 1000; // Default 60 days
}

function getMaintenanceDescription(maintenanceType: string, priority: string): string {
  const descriptions = {
    'PREVENTIVE_MAINTENANCE': 'Scheduled maintenance to prevent equipment failure.',
    'CORRECTIVE_MAINTENANCE': 'Repair work to fix identified issues.',
    'EMERGENCY_REPAIR': 'Urgent repair work for critical failures.',
    'ROUTINE_MAINTENANCE': 'Regular maintenance to maintain optimal performance.',
    'SCHEDULED_MAINTENANCE': 'Planned maintenance according to schedule.',
    'BREAKDOWN_REPAIR': 'Repair work following equipment breakdown.',
    'UPGRADE_MAINTENANCE': 'Maintenance work including equipment upgrades.',
    'CALIBRATION': 'Calibration of measurement and control equipment.',
    'CLEANING': 'Cleaning and maintenance of equipment.',
    'INSPECTION_MAINTENANCE': 'Maintenance work following inspection findings.'
  };

  const baseDescription = descriptions[maintenanceType] || 'Maintenance work performed on asset.';

  if (priority === 'CRITICAL') {
    return `CRITICAL PRIORITY: ${baseDescription} Immediate attention required.`;
  } else if (priority === 'HIGH') {
    return `HIGH PRIORITY: ${baseDescription} Urgent attention required.`;
  } else if (priority === 'MEDIUM') {
    return `MEDIUM PRIORITY: ${baseDescription} Standard priority maintenance.`;
  } else {
    return `LOW PRIORITY: ${baseDescription} Routine maintenance work.`;
  }
}

function getWorkPerformed(maintenanceType: string, status: string): string {
  const workPerformed = {
    'PREVENTIVE_MAINTENANCE': 'Lubricated moving parts, checked alignment, tested functionality.',
    'CORRECTIVE_MAINTENANCE': 'Replaced worn components, adjusted settings, repaired damage.',
    'EMERGENCY_REPAIR': 'Emergency repairs completed to restore functionality.',
    'ROUTINE_MAINTENANCE': 'Standard maintenance procedures completed.',
    'SCHEDULED_MAINTENANCE': 'Scheduled maintenance tasks completed as planned.',
    'BREAKDOWN_REPAIR': 'Repaired components following equipment breakdown.',
    'UPGRADE_MAINTENANCE': 'Performed maintenance and installed upgrades.',
    'CALIBRATION': 'Calibrated equipment to manufacturer specifications.',
    'CLEANING': 'Cleaned equipment and removed debris.',
    'INSPECTION_MAINTENANCE': 'Performed maintenance based on inspection findings.'
  };

  const baseWork = workPerformed[maintenanceType] || 'Standard maintenance work completed.';

  if (status === 'COMPLETED') {
    return baseWork;
  } else if (status === 'IN_PROGRESS') {
    return `${baseWork} Work in progress.`;
  } else if (status === 'PENDING') {
    return 'Maintenance work scheduled.';
  } else {
    return 'Maintenance work status updated.';
  }
}

function getMaterialsUsed(maintenanceType: string): string {
  const materials = {
    'PREVENTIVE_MAINTENANCE': 'Lubricants, cleaning supplies, basic tools.',
    'CORRECTIVE_MAINTENANCE': 'Replacement parts, tools, materials.',
    'EMERGENCY_REPAIR': 'Emergency repair parts, tools, temporary materials.',
    'ROUTINE_MAINTENANCE': 'Standard maintenance supplies, tools.',
    'SCHEDULED_MAINTENANCE': 'Scheduled maintenance parts, tools, supplies.',
    'BREAKDOWN_REPAIR': 'Repair parts, tools, replacement components.',
    'UPGRADE_MAINTENANCE': 'Upgrade components, tools, installation materials.',
    'CALIBRATION': 'Calibration equipment, reference materials.',
    'CLEANING': 'Cleaning supplies, tools, protective equipment.',
    'INSPECTION_MAINTENANCE': 'Inspection tools, maintenance supplies.'
  };

  return materials[maintenanceType] || 'Standard maintenance materials and tools.';
}

function getMaintenanceNotes(status: string, maintenanceType: string): string {
  const notes = {
    'COMPLETED': 'Maintenance completed successfully. Asset returned to service.',
    'IN_PROGRESS': 'Maintenance work in progress. Asset temporarily out of service.',
    'PENDING': 'Maintenance scheduled. Asset remains in service.',
    'CANCELLED': 'Maintenance cancelled. Asset remains in service.',
    'ON_HOLD': 'Maintenance on hold pending parts or approval.'
  };

  return notes[status] || 'Maintenance work completed.';
}
