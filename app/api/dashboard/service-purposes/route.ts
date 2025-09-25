import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/dashboard/service-purposes - Get service purposes for dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get assets grouped by purpose/function
    const assets = await prisma.asset.findMany({
      where: {
        organisationId: session.user.organisationId,
      },
      select: {
        id: true,
        assetNumber: true,
        name: true,
        purpose: true,
        purposeDescription: true,
        priority: true,
        condition: true,
        assetType: true,
        lastInspection: true,
        nextInspection: true,
        criticalityLevel: true,
        serviceImpact: true,
        functionBasedCategory: true,
        _count: {
          select: {
            inspections: true,
            maintenance: true,
            workOrders: true,
          },
        },
      },
    });

    // Group assets by purpose/function
    const purposeGroups = new Map<string, any>();

    assets.forEach(asset => {
      const purpose = asset.purpose || asset.functionBasedCategory || 'General Infrastructure';
      const purposeKey = purpose.toLowerCase().replace(/\s+/g, '-');

      if (!purposeGroups.has(purposeKey)) {
        purposeGroups.set(purposeKey, {
          id: purposeKey,
          name: purpose,
          description: asset.purposeDescription || `${purpose} related assets and infrastructure`,
          priority: asset.priority,
          status: 'ACTIVE',
          isCoreFunction: asset.priority === 'CRITICAL' || asset.priority === 'HIGH',
          assetCount: 0,
          riskLevel: 'MEDIUM',
          lastAssessment: null,
          assets: [],
        });
      }

      const group = purposeGroups.get(purposeKey);
      group.assetCount++;
      group.assets.push(asset);

      // Update risk level based on highest priority asset
      if (asset.priority === 'CRITICAL' && group.riskLevel !== 'CRITICAL') {
        group.riskLevel = 'CRITICAL';
      } else if (asset.priority === 'HIGH' && group.riskLevel === 'MEDIUM') {
        group.riskLevel = 'HIGH';
      }

      // Update last assessment
      if (asset.lastInspection && (!group.lastAssessment || asset.lastInspection > group.lastAssessment)) {
        group.lastAssessment = asset.lastInspection.toISOString().split('T')[0];
      }
    });

    const servicePurposes = Array.from(purposeGroups.values()).map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      priority: group.priority,
      status: group.status,
      isCoreFunction: group.isCoreFunction,
      assetCount: group.assetCount,
      riskLevel: group.riskLevel,
      lastAssessment: group.lastAssessment,
    }));

    return NextResponse.json({ servicePurposes });
  } catch (error) {
    console.error("Error fetching service purposes:", error);
    return NextResponse.json(
      { error: "Failed to fetch service purposes" },
      { status: 500 }
    );
  }
}
