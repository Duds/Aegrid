import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/resilience/risk-rhythm/profiles
 * Retrieve risk rhythm profiles for Risk Rhythm interface
 * Implements Aegrid Rule 2: Risk Sets the Rhythm
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organisation
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organisation: true },
    });

    if (!user?.organisationId) {
      return NextResponse.json(
        { error: 'User not associated with organisation' },
        { status: 400 }
      );
    }

    // Fetch risk rhythm profiles with asset and service purpose data
    const riskProfiles = await prisma.riskRhythmProfile.findMany({
      where: {
        organisationId: user.organisationId,
        status: 'ACTIVE',
      },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetType: true,
            condition: true,
            priority: true,
          },
        },
        servicePurpose: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ riskScore: 'desc' }, { lastCalculated: 'desc' }],
    });

    // Transform data for frontend
    const profilesWithDetails = riskProfiles.map(profile => ({
      id: profile.id,
      assetId: profile.assetId,
      assetName: profile.asset.name,
      assetType: profile.asset.assetType,
      servicePurpose: profile.servicePurpose?.name || 'Unassigned',
      servicePurposeId: profile.servicePurposeId,
      consequenceScore: profile.consequenceScore,
      likelihoodScore: profile.likelihoodScore,
      riskScore: profile.riskScore,
      seasonalAdjustment: Number(profile.seasonalAdjustment),
      weatherAdjustment: Number(profile.weatherAdjustment),
      usageAdjustment: Number(profile.usageAdjustment),
      maintenanceFrequency: profile.maintenanceFrequency,
      lastMaintenance: profile.lastMaintenance?.toISOString(),
      nextMaintenance: profile.nextMaintenance?.toISOString(),
      status: profile.status,
      lastCalculated: profile.lastCalculated.toISOString(),
    }));

    // Calculate summary statistics
    const totalProfiles = profilesWithDetails.length;
    const avgRiskScore =
      totalProfiles > 0
        ? Math.round(
            profilesWithDetails.reduce((sum, p) => sum + p.riskScore, 0) /
              totalProfiles
          )
        : 0;
    const highRiskAssets = profilesWithDetails.filter(
      p => p.riskScore >= 25
    ).length;
    const criticalAssets = profilesWithDetails.filter(
      p => p.riskScore >= 40
    ).length;

    return NextResponse.json({
      profiles: profilesWithDetails,
      summary: {
        totalProfiles,
        avgRiskScore,
        highRiskAssets,
        criticalAssets,
        riskDistribution: {
          low: profilesWithDetails.filter(p => p.riskScore < 15).length,
          medium: profilesWithDetails.filter(
            p => p.riskScore >= 15 && p.riskScore < 25
          ).length,
          high: profilesWithDetails.filter(
            p => p.riskScore >= 25 && p.riskScore < 40
          ).length,
          critical: profilesWithDetails.filter(p => p.riskScore >= 40).length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching risk rhythm profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk rhythm profiles' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/resilience/risk-rhythm/profiles
 * Create or update risk rhythm profile
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has manager or admin role
    if (!['ADMIN', 'MANAGER', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      assetId,
      servicePurposeId,
      consequenceScore,
      likelihoodScore,
      seasonalAdjustment,
      weatherAdjustment,
      usageAdjustment,
      maintenanceFrequency,
    } = body;

    if (!assetId || !consequenceScore || !likelihoodScore) {
      return NextResponse.json(
        {
          error:
            'Asset ID, consequence score, and likelihood score are required',
        },
        { status: 400 }
      );
    }

    // Validate scores
    if (
      consequenceScore < 1 ||
      consequenceScore > 10 ||
      likelihoodScore < 1 ||
      likelihoodScore > 10
    ) {
      return NextResponse.json(
        {
          error: 'Scores must be between 1 and 10',
        },
        { status: 400 }
      );
    }

    // Get user's organisation
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organisationId: true },
    });

    if (!user?.organisationId) {
      return NextResponse.json(
        { error: 'User not associated with organisation' },
        { status: 400 }
      );
    }

    // Calculate risk score
    const riskScore = consequenceScore * likelihoodScore;

    // Upsert risk rhythm profile
    const riskProfile = await prisma.riskRhythmProfile.upsert({
      where: {
        assetId_organisationId: {
          assetId,
          organisationId: user.organisationId,
        },
      },
      update: {
        servicePurposeId,
        consequenceScore,
        likelihoodScore,
        riskScore,
        seasonalAdjustment: seasonalAdjustment || 1.0,
        weatherAdjustment: weatherAdjustment || 1.0,
        usageAdjustment: usageAdjustment || 1.0,
        maintenanceFrequency: maintenanceFrequency || 30,
        lastCalculated: new Date(),
      },
      create: {
        assetId,
        servicePurposeId,
        consequenceScore,
        likelihoodScore,
        riskScore,
        seasonalAdjustment: seasonalAdjustment || 1.0,
        weatherAdjustment: weatherAdjustment || 1.0,
        usageAdjustment: usageAdjustment || 1.0,
        maintenanceFrequency: maintenanceFrequency || 30,
        organisationId: user.organisationId,
        status: 'ACTIVE',
        lastCalculated: new Date(),
      },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetType: true,
          },
        },
        servicePurpose: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      profile: riskProfile,
      message: 'Risk rhythm profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating risk rhythm profile:', error);
    return NextResponse.json(
      { error: 'Failed to update risk rhythm profile' },
      { status: 500 }
    );
  }
}
