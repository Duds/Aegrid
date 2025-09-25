import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/dashboard/asset-mappings - Get asset purpose mappings for dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const purpose = searchParams.get("purpose");
    const limit = parseInt(searchParams.get("limit") || "50");

    let whereClause: any = {
      organisationId: session.user.organisationId,
    };

    if (purpose) {
      whereClause.OR = [
        { purpose: { contains: purpose, mode: "insensitive" } },
        { functionBasedCategory: { contains: purpose, mode: "insensitive" } },
      ];
    }

    const assets = await prisma.asset.findMany({
      where: whereClause,
      take: limit,
      orderBy: { priority: "desc" },
      select: {
        id: true,
        assetNumber: true,
        name: true,
        assetType: true,
        purpose: true,
        purposeDescription: true,
        priority: true,
        condition: true,
        criticalityLevel: true,
        lastInspection: true,
        nextInspection: true,
        currentValue: true,
        replacementCost: true,
        address: true,
        suburb: true,
        state: true,
      },
    });

    const assetMappings = assets.map(asset => ({
      id: asset.id,
      assetId: asset.assetNumber,
      assetName: asset.name,
      assetType: asset.assetType,
      contribution: asset.purposeDescription || `${asset.purpose || 'General'} service delivery`,
      criticality: asset.priority,
      condition: asset.condition,
      lastInspection: asset.lastInspection?.toISOString().split('T')[0],
      nextInspection: asset.nextInspection?.toISOString().split('T')[0],
      currentValue: asset.currentValue ? Number(asset.currentValue) : 0,
      replacementCost: asset.replacementCost ? Number(asset.replacementCost) : 0,
      location: `${asset.address || ''} ${asset.suburb || ''} ${asset.state || ''}`.trim(),
    }));

    return NextResponse.json({ assetMappings });
  } catch (error) {
    console.error("Error fetching asset mappings:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset mappings" },
      { status: 500 }
    );
  }
}
