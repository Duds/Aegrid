import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/dashboard/function-analytics - Get function analytics for asset intelligence dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all assets with their details
    const assets = await prisma.asset.findMany({
      where: {
        organisationId: session.user.organisationId,
      },
      select: {
        id: true,
        assetType: true,
        priority: true,
        condition: true,
        currentValue: true,
        replacementCost: true,
        purpose: true,
        functionBasedCategory: true,
        criticalityLevel: true,
        tags: true,
      },
    });

    // Calculate function analytics
    const totalAssets = assets.length;
    const totalValue = assets.reduce((sum, asset) => {
      return sum + (asset.currentValue ? Number(asset.currentValue) : 0);
    }, 0);

    const criticalAssets = assets.filter(asset =>
      asset.priority === 'CRITICAL' ||
      asset.priority === 'HIGH' ||
      asset.tags?.includes('critical-asset') ||
      asset.tags?.includes('high-consequence')
    ).length;

    // Group by function/category
    const functionGroups = new Map<string, any>();

    assets.forEach(asset => {
      const functionName = asset.functionBasedCategory || asset.purpose || 'General Infrastructure';
      const category = getAssetCategory(asset.assetType);

      if (!functionGroups.has(functionName)) {
        functionGroups.set(functionName, {
          category,
          functions: 0,
          assets: 0,
          value: 0,
          criticalAssets: 0,
        });
      }

      const group = functionGroups.get(functionName);
      group.functions = 1; // Each function name represents one function
      group.assets++;
      group.value += asset.currentValue ? Number(asset.currentValue) : 0;

      if (asset.priority === 'CRITICAL' || asset.priority === 'HIGH' ||
          asset.tags?.includes('critical-asset') || asset.tags?.includes('high-consequence')) {
        group.criticalAssets++;
      }
    });

    // Group by category
    const categoryBreakdown = new Map<string, any>();

    functionGroups.forEach((group, functionName) => {
      const category = group.category;

      if (!categoryBreakdown.has(category)) {
        categoryBreakdown.set(category, {
          category,
          functions: 0,
          assets: 0,
          value: 0,
          criticalAssets: 0,
        });
      }

      const categoryGroup = categoryBreakdown.get(category);
      categoryGroup.functions += group.functions;
      categoryGroup.assets += group.assets;
      categoryGroup.value += group.value;
      categoryGroup.criticalAssets += group.criticalAssets;
    });

    const functionAnalytics = {
      totalFunctions: functionGroups.size,
      totalAssets,
      totalValue,
      criticalAssets,
      categoryBreakdown: Array.from(categoryBreakdown.values()),
    };

    return NextResponse.json({ functionAnalytics });
  } catch (error) {
    console.error("Error fetching function analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch function analytics" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to categorize asset types
 */
function getAssetCategory(assetType: string): string {
  const categoryMap: Record<string, string> = {
    BUILDING: 'Infrastructure',
    ROAD: 'Transportation',
    BRIDGE: 'Transportation',
    FOOTPATH: 'Transportation',
    TRAFFIC_LIGHT: 'Transportation',
    STREET_LIGHT: 'Transportation',
    CAR_PARK: 'Transportation',
    PARK: 'Community Services',
    PLAYGROUND: 'Community Services',
    SPORTS_FACILITY: 'Community Services',
    LIBRARY: 'Community Services',
    COMMUNITY_CENTRE: 'Community Services',
    WATER_SUPPLY: 'Utilities',
    SEWER: 'Utilities',
    DRAINAGE: 'Utilities',
    ELECTRICAL_INFRASTRUCTURE: 'Utilities',
    TELECOMMUNICATIONS: 'Utilities',
    WIND_TURBINE: 'Renewable Energy',
    SOLAR_ARRAY: 'Renewable Energy',
    BATTERY_STORAGE: 'Renewable Energy',
    SMART_STREETLIGHT: 'Smart Infrastructure',
    SMART_POLE: 'Smart Infrastructure',
    SMART_TRAFFIC_LIGHT: 'Smart Infrastructure',
    IOT_SENSOR: 'Smart Infrastructure',
    AIR_QUALITY_MONITOR: 'Smart Infrastructure',
  };

  return categoryMap[assetType] || 'Other';
}
