import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/dashboard/risk-compliance - Get risk compliance data for reports
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get assets with their condition and compliance data
    const assets = await prisma.asset.findMany({
      where: {
        organisationId: session.user.organisationId,
      },
      select: {
        id: true,
        name: true,
        assetType: true,
        condition: true,
        priority: true,
        currentValue: true,
        lastInspection: true,
        nextInspection: true,
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 1,
        },
        complianceRecords: {
          where: { status: 'COMPLETED' },
          orderBy: { completedDate: 'desc' },
          take: 1,
        },
      },
    });

    // Calculate overall risk score based on asset conditions
    const totalAssets = assets.length;
    const conditionScores = {
      EXCELLENT: 10,
      GOOD: 8,
      FAIR: 6,
      POOR: 4,
      CRITICAL: 2,
      UNKNOWN: 5,
    };

    const overallRiskScore = assets.reduce((sum, asset) => {
      return sum + (conditionScores[asset.condition as keyof typeof conditionScores] || 5);
    }, 0) / totalAssets;

    // Calculate compliance rate based on inspections
    const assetsWithRecentInspections = assets.filter(asset => {
      if (!asset.nextInspection) return false;
      return asset.nextInspection > new Date();
    });

    const overallComplianceRate = (assetsWithRecentInspections.length / totalAssets) * 100;

    // Calculate risk metrics by category
    const riskMetrics = [
      {
        id: '1',
        category: 'Asset Condition',
        currentScore: overallRiskScore,
        previousScore: overallRiskScore + 0.3, // Simulated previous score
        trend: overallRiskScore > 7 ? 'improving' : overallRiskScore < 6 ? 'declining' : 'stable',
        status: overallRiskScore > 8 ? 'low' : overallRiskScore > 6 ? 'medium' : 'high',
        description: 'Overall asset condition risk assessment',
        impact: overallRiskScore > 8 ? 'Low impact on operational efficiency' :
                overallRiskScore > 6 ? 'Medium impact on operational efficiency' :
                'High impact on operational efficiency',
        recommendation: overallRiskScore > 8 ? 'Continue current maintenance program' :
                       overallRiskScore > 6 ? 'Increase preventive maintenance frequency' :
                       'Immediate maintenance intervention required',
      },
      {
        id: '2',
        category: 'Safety Compliance',
        currentScore: overallComplianceRate / 10, // Convert percentage to 10-point scale
        previousScore: (overallComplianceRate + 3) / 10,
        trend: overallComplianceRate > 95 ? 'improving' : overallComplianceRate < 85 ? 'declining' : 'stable',
        status: overallComplianceRate > 95 ? 'low' : overallComplianceRate > 85 ? 'medium' : 'high',
        description: 'Safety regulation compliance risk',
        impact: overallComplianceRate > 95 ? 'Low impact on safety and regulatory compliance' :
                overallComplianceRate > 85 ? 'Medium impact on safety and regulatory compliance' :
                'High impact on safety and regulatory compliance',
        recommendation: overallComplianceRate > 95 ? 'Maintain current safety programs' :
                       overallComplianceRate > 85 ? 'Review safety procedures' :
                       'Immediate safety audit required',
      },
      {
        id: '3',
        category: 'Environmental',
        currentScore: 7.5, // Simulated environmental score
        previousScore: 7.3,
        trend: 'improving',
        status: 'low',
        description: 'Environmental compliance and sustainability',
        impact: 'Low impact on operations',
        recommendation: 'Maintain current environmental programs',
      },
      {
        id: '4',
        category: 'Financial',
        currentScore: 7.9, // Simulated financial score
        previousScore: 8.1,
        trend: 'improving',
        status: 'medium',
        description: 'Budget and cost management risk',
        impact: 'Medium impact on financial performance',
        recommendation: 'Monitor budget utilization closely',
      },
    ];

    const riskComplianceData = {
      overallRiskScore: Math.round(overallRiskScore * 10) / 10,
      overallComplianceRate: Math.round(overallComplianceRate * 10) / 10,
      riskMetrics,
      totalAssets,
      compliantAssets: assetsWithRecentInspections.length,
      nonCompliantAssets: totalAssets - assetsWithRecentInspections.length,
      criticalAssets: assets.filter(asset => asset.priority === 'CRITICAL').length,
      highRiskAssets: assets.filter(asset => asset.condition === 'CRITICAL' || asset.condition === 'POOR').length,
    };

    return NextResponse.json({ riskComplianceData });
  } catch (error) {
    console.error("Error fetching risk compliance data:", error);
    return NextResponse.json(
      { error: "Failed to fetch risk compliance data" },
      { status: 500 }
    );
  }
}
