/**
 * Emergency Alert Generator
 *
 * Creates realistic emergency alerts for the Greenfield Shire Council
 * to demonstrate emergency response capabilities and critical asset monitoring.
 */

import { PrismaClient } from '@prisma/client';

export async function generateEmergencyAlerts(prisma: PrismaClient, organisationId: string): Promise<number> {
  console.log('  🚨 Creating emergency alerts...');

  // Get some critical assets to create alerts for
  const criticalAssets = await prisma.asset.findMany({
    where: {
      organisationId,
      priority: 'CRITICAL'
    },
    take: 10,
    select: { id: true, name: true, assetType: true }
  });

  if (criticalAssets.length === 0) {
    console.log('   ⚠️  No critical assets found, skipping emergency alerts');
    return 0;
  }

  const alertTypes = [
    'EQUIPMENT_FAILURE',
    'SAFETY_INCIDENT',
    'ENVIRONMENTAL_EVENT',
    'SERVICE_DISRUPTION',
    'WEATHER_EVENT',
    'SECURITY_BREACH',
    'ENERGY_OUTAGE',
    'COMMUNICATION_FAILURE'
  ];

  const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const statuses = ['ACTIVE', 'RESPONDING', 'INVESTIGATING', 'RESOLVED'];

  const alerts = [];
  const now = new Date();

  // Create 15-20 emergency alerts
  for (let i = 0; i < 18; i++) {
    const asset = criticalAssets[i % criticalAssets.length];
    const alertType = alertTypes[i % alertTypes.length];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const status = Math.random() > 0.3 ? 'ACTIVE' : statuses[Math.floor(Math.random() * statuses.length)];

    // Create alert 1-30 days ago
    const detectedAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);

    const alert = await prisma.emergencyAlert.create({
      data: {
        organisationId,
        assetId: asset.id,
        alertType,
        severity,
        title: `${alertType.replace('_', ' ')} Alert - ${asset.name}`,
        description: `Emergency situation detected at ${asset.name}. ${getAlertDescription(alertType, severity)}`,
        location: `${asset.name} - ${asset.assetType}`,
        status,
        detectedAt,
        responseTime: severity === 'CRITICAL' ? Math.floor(Math.random() * 30) + 5 : Math.floor(Math.random() * 120) + 15,
        resolutionTime: status === 'RESOLVED' ? Math.floor(Math.random() * 480) + 60 : null,
        acknowledgedAt: status !== 'ACTIVE' ? new Date(detectedAt.getTime() + Math.random() * 60 * 60 * 1000) : null,
        resolvedAt: status === 'RESOLVED' ? new Date(detectedAt.getTime() + Math.random() * 24 * 60 * 60 * 1000) : null,
      }
    });

    alerts.push(alert);
  }

  console.log(`   ✅ Created ${alerts.length} emergency alerts`);
  return alerts.length;
}

function getAlertDescription(alertType: string, severity: string): string {
  const descriptions = {
    'EQUIPMENT_FAILURE': 'Critical equipment malfunction detected requiring immediate attention.',
    'SAFETY_INCIDENT': 'Safety incident reported with potential risk to personnel or public.',
    'ENVIRONMENTAL_EVENT': 'Environmental condition detected that may impact operations.',
    'SERVICE_DISRUPTION': 'Service disruption affecting community operations.',
    'WEATHER_EVENT': 'Severe weather conditions impacting infrastructure.',
    'SECURITY_BREACH': 'Security breach detected requiring immediate response.',
    'ENERGY_OUTAGE': 'Energy system failure affecting critical infrastructure.',
    'COMMUNICATION_FAILURE': 'Communication system failure impacting operations.'
  };

  const baseDescription = descriptions[alertType] || 'Emergency situation requiring immediate response.';

  if (severity === 'CRITICAL') {
    return `CRITICAL: ${baseDescription} Immediate response required.`;
  } else if (severity === 'HIGH') {
    return `HIGH PRIORITY: ${baseDescription} Response required within 1 hour.`;
  } else if (severity === 'MEDIUM') {
    return `MEDIUM PRIORITY: ${baseDescription} Response required within 4 hours.`;
  } else {
    return `LOW PRIORITY: ${baseDescription} Response required within 24 hours.`;
  }
}
