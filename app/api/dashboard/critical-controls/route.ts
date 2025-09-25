import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/dashboard/critical-controls - Get critical controls status for dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get critical controls
    const criticalControls = await prisma.criticalControl.findMany({
      where: {
        organisationId: session.user.organisationId,
        status: "ACTIVE",
      },
      include: {
        assetMappings: {
          include: {
            asset: {
              select: {
                id: true,
                name: true,
                assetNumber: true,
                priority: true,
                condition: true,
                lastInspection: true,
                nextInspection: true,
              },
            },
          },
        },
        _count: {
          select: {
            assetMappings: true,
            complianceRecords: true,
          },
        },
      },
    });

    const controlsStatus = criticalControls.map(control => {
      // Calculate status based on asset mappings
      const assetMappings = control.assetMappings;
      const totalAssets = assetMappings.length;

      let compliantAssets = 0;
      let nonCompliantAssets = 0;
      let overdueAssets = 0;
      let lastInspection: Date | null = null;
      let nextDue: Date | null = null;

      assetMappings.forEach(mapping => {
        const asset = mapping.asset;

        // Determine compliance status
        if (mapping.lastExecutedAt && mapping.nextDueAt) {
          if (mapping.nextDueAt > new Date()) {
            compliantAssets++;
          } else {
            overdueAssets++;
          }
        } else {
          nonCompliantAssets++;
        }

        // Track inspection dates
        if (asset.lastInspection && (!lastInspection || asset.lastInspection > lastInspection)) {
          lastInspection = asset.lastInspection;
        }
        if (asset.nextInspection && (!nextDue || asset.nextInspection < nextDue)) {
          nextDue = asset.nextInspection;
        }
      });

      // Determine overall status
      let status: 'GREEN' | 'AMBER' | 'RED' = 'GREEN';
      if (overdueAssets > 0) {
        status = 'RED';
      } else if (nonCompliantAssets > 0) {
        status = 'AMBER';
      }

      // Determine risk level
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
      if (overdueAssets > totalAssets * 0.5) {
        riskLevel = 'CRITICAL';
      } else if (overdueAssets > 0 || nonCompliantAssets > totalAssets * 0.3) {
        riskLevel = 'HIGH';
      } else if (nonCompliantAssets > 0) {
        riskLevel = 'MEDIUM';
      }

      return {
        id: control.id,
        name: control.name,
        type: control.type,
        status,
        riskLevel,
        assetCount: totalAssets,
        lastInspection: lastInspection?.toISOString().split('T')[0],
        nextDue: nextDue?.toISOString().split('T')[0],
        compliantAssets,
        nonCompliantAssets,
        overdueAssets,
        windowHours: control.windowHours,
        frequencyDays: control.frequencyDays,
      };
    });

    return NextResponse.json({ criticalControls: controlsStatus });
  } catch (error) {
    console.error("Error fetching critical controls:", error);
    return NextResponse.json(
      { error: "Failed to fetch critical controls" },
      { status: 500 }
    );
  }
}
