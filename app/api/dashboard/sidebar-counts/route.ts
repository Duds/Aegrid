import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organisationId = session.user.organisationId;

    // Fetch emergency alerts count (actual EmergencyAlert records)
    const emergencyAlerts = await prisma.emergencyAlert.count({
      where: {
        organisationId,
        status: { in: ['ACTIVE', 'RESPONDING', 'INVESTIGATING'] }
      }
    });

    // Fetch critical controls overdue count (check if any exist)
    const criticalControlsOverdue = await prisma.criticalControl.count({
      where: {
        organisationId,
        status: 'OVERDUE'
      }
    });

    // Fetch work orders count (using work orders as proxy)
    const workOrdersCount = await prisma.workOrder.count({
      where: {
        asset: { organisationId }
      }
    });

    // Fetch total assets count
    const totalAssetsCount = await prisma.asset.count({
      where: {
        organisationId
      }
    });

    // Calculate control center total alerts (emergency + critical controls)
    const controlCenterAlerts = emergencyAlerts + criticalControlsOverdue;

    const sidebarCounts = {
      emergencyAlerts,
      criticalControlsOverdue,
      workOrdersCount,
      totalAssetsCount,
      controlCenterAlerts
    };

    return NextResponse.json({ sidebarCounts });
  } catch (error) {
    console.error("Error fetching sidebar counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch sidebar counts" },
      { status: 500 }
    );
  }
}
