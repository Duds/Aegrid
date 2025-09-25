/**
 * Inspection Records Generator
 *
 * Creates inspection records for the Greenfield Shire Council
 * infrastructure assets to demonstrate maintenance history.
 */

import { PrismaClient } from '@prisma/client';

export async function generateInspectionRecords(prisma: PrismaClient, organisationId: string): Promise<number> {
  console.log('  🔍 Creating inspection records...');

  // Get assets to create inspections for
  const assets = await prisma.asset.findMany({
    where: { organisationId },
    take: 150, // Limit to avoid too many inspections
    select: { id: true, name: true, assetType: true, priority: true }
  });

  if (assets.length === 0) {
    console.log('   ⚠️  No assets found, skipping inspections');
    return 0;
  }

  // Get users to assign inspections to
  const users = await prisma.user.findMany({
    where: {
      organisationId,
      role: { in: ['SUPERVISOR', 'CREW', 'CONTRACTOR'] }
    },
    select: { id: true, name: true, role: true }
  });

  if (users.length === 0) {
    console.log('   ⚠️  No users found, skipping inspections');
    return 0;
  }

  const inspectionTypes = [
    'ROUTINE_INSPECTION',
    'SAFETY_INSPECTION',
    'COMPLIANCE_INSPECTION',
    'PREVENTIVE_INSPECTION',
    'POST_MAINTENANCE_INSPECTION',
    'EMERGENCY_INSPECTION',
    'ANNUAL_INSPECTION',
    'QUARTERLY_INSPECTION',
    'MONTHLY_INSPECTION',
    'WEEKLY_INSPECTION'
  ];

  const conditions = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'];
  const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'];

  const inspections = [];
  const now = new Date();

  // Create 150 inspections (reduced from 1500 for performance)
  for (let i = 0; i < 150; i++) {
    const asset = assets[i % assets.length];
    const inspector = users[Math.floor(Math.random() * users.length)];
    const inspectionType = inspectionTypes[i % inspectionTypes.length];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const status = Math.random() > 0.1 ? 'COMPLETED' : statuses[Math.floor(Math.random() * statuses.length)];

    // Create inspection 1-365 days ago (1 year)
    const inspectionDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    const nextInspectionDate = new Date(inspectionDate.getTime() + getNextInspectionInterval(inspectionType));

    const inspection = await prisma.inspection.create({
      data: {
        assetId: asset.id,
        inspectionDate,
        inspectorName: inspector.name || 'Unknown Inspector',
        inspectorId: inspector.id,
        condition,
        conditionNotes: getInspectionFindings(condition, inspectionType),
        riskScore: getRiskScore(condition),
        issues: getIssues(condition),
        recommendations: getInspectionRecommendations(condition, inspectionType),
        nextInspectionDate,
        priorityActions: getPriorityActions(condition),
      }
    });

    inspections.push(inspection);
  }

  console.log(`   ✅ Created ${inspections.length} inspection records`);
  return inspections.length;
}

function getNextInspectionInterval(inspectionType: string): number {
  const intervals = {
    'ROUTINE_INSPECTION': 30 * 24 * 60 * 60 * 1000, // 30 days
    'SAFETY_INSPECTION': 90 * 24 * 60 * 60 * 1000, // 90 days
    'COMPLIANCE_INSPECTION': 365 * 24 * 60 * 60 * 1000, // 1 year
    'PREVENTIVE_INSPECTION': 60 * 24 * 60 * 60 * 1000, // 60 days
    'POST_MAINTENANCE_INSPECTION': 7 * 24 * 60 * 60 * 1000, // 7 days
    'EMERGENCY_INSPECTION': 1 * 24 * 60 * 60 * 1000, // 1 day
    'ANNUAL_INSPECTION': 365 * 24 * 60 * 60 * 1000, // 1 year
    'QUARTERLY_INSPECTION': 90 * 24 * 60 * 60 * 1000, // 90 days
    'MONTHLY_INSPECTION': 30 * 24 * 60 * 60 * 1000, // 30 days
    'WEEKLY_INSPECTION': 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  return intervals[inspectionType] || 30 * 24 * 60 * 60 * 1000; // Default 30 days
}

function getInspectionFindings(condition: string, inspectionType: string): string {
  const findings = {
    'EXCELLENT': 'Asset is in excellent condition with no issues identified.',
    'GOOD': 'Asset is in good condition with minor maintenance recommendations.',
    'FAIR': 'Asset shows signs of wear and requires attention.',
    'POOR': 'Asset condition is poor and requires immediate maintenance.',
    'CRITICAL': 'Asset condition is critical and poses safety risks.'
  };

  return findings[condition] || 'Inspection completed with standard findings.';
}

function getInspectionRecommendations(condition: string, inspectionType: string): string {
  const recommendations = {
    'EXCELLENT': 'Continue current maintenance schedule.',
    'GOOD': 'Schedule minor maintenance within 30 days.',
    'FAIR': 'Schedule maintenance within 14 days.',
    'POOR': 'Schedule urgent maintenance within 7 days.',
    'CRITICAL': 'Immediate maintenance required - safety risk identified.'
  };

  return recommendations[condition] || 'Follow standard maintenance procedures.';
}

function getRiskScore(condition: string): number {
  const riskScores = {
    'EXCELLENT': 1,
    'GOOD': 2,
    'FAIR': 3,
    'POOR': 4,
    'CRITICAL': 5
  };

  return riskScores[condition] || 3;
}

function getIssues(condition: string): string[] {
  const issues = {
    'EXCELLENT': [],
    'GOOD': ['Minor wear observed'],
    'FAIR': ['Signs of wear', 'Minor maintenance required'],
    'POOR': ['Significant wear', 'Maintenance overdue', 'Performance degradation'],
    'CRITICAL': ['Safety risk', 'Immediate maintenance required', 'Equipment failure risk']
  };

  return issues[condition] || ['Standard inspection completed'];
}

function getPriorityActions(condition: string): string {
  const actions = {
    'EXCELLENT': 'Continue current maintenance schedule.',
    'GOOD': 'Schedule minor maintenance within 30 days.',
    'FAIR': 'Schedule maintenance within 14 days.',
    'POOR': 'Schedule urgent maintenance within 7 days.',
    'CRITICAL': 'Immediate maintenance required - safety risk identified.'
  };

  return actions[condition] || 'Follow standard maintenance procedures.';
}
