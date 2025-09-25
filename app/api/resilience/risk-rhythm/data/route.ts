import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/resilience/risk-rhythm/data
 * Fetches risk rhythm data including profiles, schedules, and seasonal adjustments
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with organisation
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
        include: { organisation: true },
    });

    if (!user?.organisationId) {
      return NextResponse.json({ error: 'User must have an organisation' }, { status: 400 });
    }

    // Fetch risk rhythm profiles with related data
    const riskProfiles = await prisma.riskRhythmProfile.findMany({
      where: { organisationId: user.organisationId },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetNumber: true,
            assetType: true,
            condition: true,
            priority: true,
          },
        },
        servicePurpose: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    // Fetch dynamic maintenance schedules
    const maintenanceSchedules = await prisma.dynamicMaintenanceSchedule.findMany({
      where: { organisationId: user.organisationId },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetNumber: true,
            assetType: true,
          },
        },
        riskProfile: {
          select: {
            id: true,
            riskScore: true,
            maintenanceFrequency: true,
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    // Transform risk profiles data
    const transformedProfiles = riskProfiles.map(profile => ({
      id: profile.id,
      assetId: profile.asset.id,
      assetName: profile.asset.name,
      assetType: profile.asset.assetType,
      servicePurpose: profile.servicePurpose?.name || 'Unassigned Purpose',
      consequenceScore: profile.consequenceScore,
      likelihoodScore: profile.likelihoodScore,
      riskScore: profile.riskScore,
      seasonalAdjustment: Number(profile.seasonalAdjustment),
      weatherAdjustment: Number(profile.weatherAdjustment),
      usageAdjustment: Number(profile.usageAdjustment),
      maintenanceFrequency: profile.maintenanceFrequency,
      lastMaintenance: profile.lastMaintenance?.toISOString().split('T')[0],
      nextMaintenance: profile.nextMaintenance?.toISOString().split('T')[0],
      status: profile.status,
    }));

    // Transform maintenance schedules data
    const transformedSchedules = maintenanceSchedules.map(schedule => ({
      id: schedule.id,
      assetId: schedule.asset.id,
      assetName: schedule.asset.name,
      taskName: `${schedule.maintenanceType} - ${schedule.asset.name}`,
      taskType: schedule.maintenanceType,
      priority: schedule.priority,
      baseFrequency: schedule.riskProfile?.maintenanceFrequency || 30,
      riskMultiplier: schedule.riskProfile?.riskScore ?
        Math.max(0.5, Math.min(2.0, schedule.riskProfile.riskScore / 50)) : 1.0,
      adjustedFrequency: schedule.riskProfile?.maintenanceFrequency || 30,
      scheduledDate: schedule.scheduledDate.toISOString().split('T')[0],
      dueDate: schedule.scheduledDate.toISOString().split('T')[0],
      status: schedule.status,
      assignedTo: schedule.assignedTo,
    }));

    // Generate seasonal profiles based on current data
    const currentMonth = new Date().getMonth();
    const seasons = [
      { name: 'Summer', months: [11, 0, 1], factor: 1.3, description: 'Increased usage and heat stress on equipment' },
      { name: 'Autumn', months: [2, 3, 4], factor: 0.9, description: 'Moderate conditions, standard maintenance intervals' },
      { name: 'Winter', months: [5, 6, 7], factor: 1.1, description: 'Cold weather stress and reduced outdoor activity' },
      { name: 'Spring', months: [8, 9, 10], factor: 1.2, description: 'Increased outdoor activity and weather transitions' },
    ];

    const seasonalProfiles = seasons.map(season => ({
      season: season.name,
      adjustmentFactor: season.factor,
      description: season.description,
      affectedAssets: Math.floor(riskProfiles.length * (0.7 + Math.random() * 0.3)), // Simulate affected assets
    }));

    // Calculate key metrics
    const highRiskAssets = transformedProfiles.filter(p => p.riskScore >= 25).length;
    const overdueTasks = transformedSchedules.filter(s =>
      s.status === 'OVERDUE' ||
      (s.status === 'SCHEDULED' && new Date(s.dueDate) < new Date())
    ).length;
    const avgRiskScore = transformedProfiles.length > 0
      ? Math.round(transformedProfiles.reduce((sum, p) => sum + p.riskScore, 0) / transformedProfiles.length)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        riskProfiles: transformedProfiles,
        maintenanceSchedules: transformedSchedules,
        seasonalProfiles,
        metrics: {
          highRiskAssets,
          overdueTasks,
          avgRiskScore,
          totalAssets: transformedProfiles.length,
          totalSchedules: transformedSchedules.length,
        },
      },
    });

  } catch (error) {
    console.error('Risk rhythm data API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk rhythm data' },
      { status: 500 }
    );
  }
}
