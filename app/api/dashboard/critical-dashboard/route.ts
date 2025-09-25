import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/dashboard/critical-dashboard - Get critical asset dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get critical assets
    const criticalAssets = await prisma.asset.findMany({
      where: {
        organisationId: session.user.organisationId,
        OR: [
          { priority: 'CRITICAL' },
          { priority: 'HIGH' },
          { tags: { has: 'critical-asset' } },
          { tags: { has: 'high-consequence' } },
        ],
      },
      select: {
        id: true,
        name: true,
        assetNumber: true,
        priority: true,
        condition: true,
        currentValue: true,
        replacementCost: true,
        criticalityLevel: true,
        lastInspection: true,
        nextInspection: true,
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 1,
        },
        workOrders: {
          where: { status: 'OPEN' },
        },
      },
    });

    // Calculate dashboard metrics
    const totalCriticalAssets = criticalAssets.length;
    const totalValue = criticalAssets.reduce((sum, asset) => {
      return sum + (asset.currentValue ? Number(asset.currentValue) : 0);
    }, 0);

    // Calculate compliance status
    let compliantAssets = 0;
    let nonCompliantAssets = 0;
    let overdueAssets = 0;

    criticalAssets.forEach(asset => {
      if (asset.nextInspection) {
        if (asset.nextInspection > new Date()) {
          compliantAssets++;
        } else {
          overdueAssets++;
        }
      } else {
        nonCompliantAssets++;
      }
    });

    // Calculate risk exposure (simplified)
    const totalRiskExposure = criticalAssets.reduce((sum, asset) => {
      let riskScore = 0;

      // Base risk from priority
      if (asset.priority === 'CRITICAL') riskScore += 40;
      else if (asset.priority === 'HIGH') riskScore += 30;
      else if (asset.priority === 'MEDIUM') riskScore += 20;
      else riskScore += 10;

      // Risk from condition
      if (asset.condition === 'CRITICAL') riskScore += 30;
      else if (asset.condition === 'POOR') riskScore += 20;
      else if (asset.condition === 'FAIR') riskScore += 10;
      else if (asset.condition === 'GOOD') riskScore += 5;

      // Risk from open work orders
      riskScore += asset.workOrders.length * 5;

      return sum + Math.min(riskScore, 100);
    }, 0);

    // Get critical controls summary
    const criticalControls = await prisma.criticalControl.findMany({
      where: {
        organisationId: session.user.organisationId,
        status: 'ACTIVE',
      },
      include: {
        assetMappings: {
          include: {
            asset: {
              select: {
                priority: true,
              },
            },
          },
        },
      },
    });

    let totalControls = 0;
    let compliantControls = 0;
    let nonCompliantControls = 0;
    let overdueControls = 0;

    criticalControls.forEach(control => {
      control.assetMappings.forEach(mapping => {
        totalControls++;

        if (mapping.lastExecutedAt && mapping.nextDueAt) {
          if (mapping.nextDueAt > new Date()) {
            compliantControls++;
          } else {
            overdueControls++;
          }
        } else {
          nonCompliantControls++;
        }
      });
    });

    // Get top risk assets
    const topRiskAssets = criticalAssets
      .map(asset => {
        let riskScore = 0;

        if (asset.priority === 'CRITICAL') riskScore += 40;
        else if (asset.priority === 'HIGH') riskScore += 30;
        else if (asset.priority === 'MEDIUM') riskScore += 20;
        else riskScore += 10;

        if (asset.condition === 'CRITICAL') riskScore += 30;
        else if (asset.condition === 'POOR') riskScore += 20;
        else if (asset.condition === 'FAIR') riskScore += 10;
        else if (asset.condition === 'GOOD') riskScore += 5;

        riskScore += asset.workOrders.length * 5;

        return {
          id: asset.id,
          name: asset.name,
          riskScore: Math.min(riskScore, 100),
          criticalityLevel: asset.priority === 'CRITICAL' ? 'Critical' :
                           asset.priority === 'HIGH' ? 'High' :
                           asset.priority === 'MEDIUM' ? 'Medium' : 'Low',
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);

    const criticalDashboard = {
      totalCriticalAssets,
      compliantAssets,
      nonCompliantAssets,
      overdueAssets,
      totalValue,
      totalRiskExposure,
      criticalControls: {
        total: totalControls,
        compliant: compliantControls,
        nonCompliant: nonCompliantControls,
        overdue: overdueControls,
      },
      topRiskAssets,
    };

    return NextResponse.json({ criticalDashboard });
  } catch (error) {
    console.error("Error fetching critical dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch critical dashboard" },
      { status: 500 }
    );
  }
}
