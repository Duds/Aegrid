import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/assets/[id]/fmea - Get FMEA analysis for a specific asset
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: assetId } = await params;

    // Get the asset with its RCM templates and failure modes
    const asset = await prisma.asset.findFirst({
      where: {
        id: assetId,
        organisationId: session.user.organisationId!,
      },
      include: {
        rcmTemplates: {
          include: {
            template: {
              include: {
                failureModes: {
                  orderBy: [{ severity: 'desc' }, { riskScore: 'desc' }],
                },
              },
            },
          },
        },
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 5,
        },
        maintenance: {
          orderBy: { maintenanceDate: 'desc' },
          take: 5,
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Calculate asset risk score based on condition, age, and failure modes
    const riskFactors = {
      condition: getConditionRiskScore(asset.condition),
      age: getAgeRiskScore(asset.installationDate, asset.expectedLifespan),
      maintenanceHistory: getMaintenanceRiskScore(asset.maintenance),
      inspectionHistory: getInspectionRiskScore(asset.inspections),
    };

    const overallRiskScore =
      Object.values(riskFactors).reduce((sum, score) => sum + score, 0) / 4;

    // Get all failure modes from associated templates
    const allFailureModes = asset.rcmTemplates.flatMap(
      rt => rt.template.failureModes
    );

    // Calculate failure mode risk scores
    const failureModesWithRisk = allFailureModes.map(fm => ({
      ...fm,
      adjustedRiskScore: calculateAdjustedRiskScore(fm, asset),
      riskLevel: getRiskLevel(fm.riskScore || 0),
    }));

    // Sort by risk score
    failureModesWithRisk.sort(
      (a, b) => (b.adjustedRiskScore || 0) - (a.adjustedRiskScore || 0)
    );

    // Group by severity
    const failureModesBySeverity = {
      CRITICAL: failureModesWithRisk.filter(fm => fm.severity === 'CRITICAL'),
      HIGH: failureModesWithRisk.filter(fm => fm.severity === 'HIGH'),
      MEDIUM: failureModesWithRisk.filter(fm => fm.severity === 'MEDIUM'),
      LOW: failureModesWithRisk.filter(fm => fm.severity === 'LOW'),
    };

    // Calculate maintenance recommendations
    const maintenanceRecommendations = generateMaintenanceRecommendations(
      failureModesWithRisk,
      asset,
      riskFactors
    );

    const fmeaAnalysis = {
      asset: {
        id: asset.id,
        name: asset.name,
        assetNumber: asset.assetNumber,
        assetType: asset.assetType,
        condition: asset.condition,
        installationDate: asset.installationDate,
        expectedLifespan: asset.expectedLifespan,
      },
      riskFactors,
      overallRiskScore,
      overallRiskLevel: getRiskLevel(overallRiskScore),
      failureModesBySeverity,
      maintenanceRecommendations,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(fmeaAnalysis);
  } catch (error) {
    console.error('Error generating FMEA analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate FMEA analysis' },
      { status: 500 }
    );
  }
}

/**
 * Helper functions for risk calculations
 */
function getConditionRiskScore(condition: string): number {
  switch (condition) {
    case 'EXCELLENT':
      return 1;
    case 'GOOD':
      return 3;
    case 'FAIR':
      return 6;
    case 'POOR':
      return 9;
    case 'CRITICAL':
      return 10;
    default:
      return 5;
  }
}

function getAgeRiskScore(
  installationDate: Date | null,
  expectedLifespan: number | null
): number {
  if (!installationDate || !expectedLifespan) return 5;

  const ageInYears =
    (Date.now() - installationDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const agePercentage = (ageInYears / expectedLifespan) * 100;

  if (agePercentage < 25) return 2;
  if (agePercentage < 50) return 4;
  if (agePercentage < 75) return 6;
  if (agePercentage < 90) return 8;
  return 10;
}

function getMaintenanceRiskScore(maintenanceHistory: any[]): number {
  if (maintenanceHistory.length === 0) return 8;

  const recentMaintenance = maintenanceHistory.filter(
    m =>
      Date.now() - new Date(m.maintenanceDate).getTime() <
      365 * 24 * 60 * 60 * 1000
  );

  if (recentMaintenance.length === 0) return 8;
  if (recentMaintenance.length < 2) return 6;
  if (recentMaintenance.length < 4) return 4;
  return 2;
}

function getInspectionRiskScore(inspectionHistory: any[]): number {
  if (inspectionHistory.length === 0) return 7;

  const latestInspection = inspectionHistory[0];
  const daysSinceInspection =
    (Date.now() - new Date(latestInspection.inspectionDate).getTime()) /
    (24 * 60 * 60 * 1000);

  if (daysSinceInspection > 365) return 8;
  if (daysSinceInspection > 180) return 6;
  if (daysSinceInspection > 90) return 4;
  return 2;
}

function calculateAdjustedRiskScore(failureMode: any, asset: any): number {
  let riskScore =
    failureMode.riskScore ||
    (failureMode.probability || 5) * (failureMode.impact || 5);

  // Adjust based on asset condition
  const conditionMultiplier = getConditionRiskScore(asset.condition) / 5;
  riskScore *= conditionMultiplier;

  // Adjust based on asset age
  const ageMultiplier =
    getAgeRiskScore(asset.installationDate, asset.expectedLifespan) / 5;
  riskScore *= ageMultiplier;

  return Math.min(Math.round(riskScore), 100);
}

function getRiskLevel(riskScore: number): string {
  if (riskScore >= 80) return 'CRITICAL';
  if (riskScore >= 60) return 'HIGH';
  if (riskScore >= 40) return 'MEDIUM';
  if (riskScore >= 20) return 'LOW';
  return 'VERY_LOW';
}

function generateMaintenanceRecommendations(
  failureModes: any[],
  asset: any,
  riskFactors: any
): any[] {
  const recommendations = [];

  // High-risk failure modes
  const highRiskModes = failureModes.filter(fm => fm.adjustedRiskScore >= 60);
  if (highRiskModes.length > 0) {
    recommendations.push({
      type: 'URGENT',
      title: 'Address High-Risk Failure Modes',
      description: `${highRiskModes.length} failure modes require immediate attention`,
      priority: 'CRITICAL',
      estimatedCost: highRiskModes.reduce(
        (sum, fm) =>
          sum +
          (fm.template?.maintenanceTasks?.reduce(
            (tSum: number, mt: any) => tSum + (mt.estimatedCost || 0),
            0
          ) || 0),
        0
      ),
      timeline: 'Within 30 days',
    });
  }

  // Condition-based recommendations
  if (riskFactors.condition >= 7) {
    recommendations.push({
      type: 'CONDITION',
      title: 'Asset Condition Assessment',
      description: 'Asset condition requires immediate attention',
      priority: 'HIGH',
      estimatedCost: 500,
      timeline: 'Within 14 days',
    });
  }

  // Age-based recommendations
  if (riskFactors.age >= 7) {
    recommendations.push({
      type: 'AGE',
      title: 'Age-Related Maintenance',
      description: 'Asset approaching end of expected lifespan',
      priority: 'MEDIUM',
      estimatedCost: 1000,
      timeline: 'Within 90 days',
    });
  }

  // Maintenance history recommendations
  if (riskFactors.maintenanceHistory >= 6) {
    recommendations.push({
      type: 'MAINTENANCE',
      title: 'Scheduled Maintenance Overdue',
      description: 'Regular maintenance schedule needs attention',
      priority: 'MEDIUM',
      estimatedCost: 300,
      timeline: 'Within 60 days',
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    return (
      priorityOrder[b.priority as keyof typeof priorityOrder] -
      priorityOrder[a.priority as keyof typeof priorityOrder]
    );
  });
}
