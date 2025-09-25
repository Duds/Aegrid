import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';

    // Build where clause for search
    const where: any = {
      organisationId: session.user.organisationId,
    };

    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { purpose: { contains: searchTerm, mode: 'insensitive' } },
        { assetType: { contains: searchTerm, mode: 'insensitive' } },
        { assetNumber: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const assets = await prisma.asset.findMany({
      where,
      select: {
        id: true,
        name: true,
        assetNumber: true,
        assetType: true,
        purpose: true,
        condition: true,
        criticalityLevel: true,
        address: true,
        suburb: true,
        postcode: true,
        state: true,
        lastInspection: true,
        nextInspection: true,
        // Lifecycle Management Data
        installationDate: true,
        expectedLifespan: true,
        currentValue: true,
        replacementCost: true,
        depreciationRate: true,
        purchasePrice: true,
        warrantyExpiry: true,
        maintenanceCost: true,
        // Additional fields for lifecycle analysis
        manufacturer: true,
        model: true,
        serialNumber: true,
        status: true,
        priority: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Calculate lifecycle metrics for each asset
    const assetsWithLifecycle = assets.map(asset => {
      const now = new Date();
      const installationDate = asset.installationDate ? new Date(asset.installationDate) : null;

      let currentAge = 0;
      let lifecycleStage = 'UNKNOWN';
      let replacementDate = null;
      let yearsToReplacement = null;
      let lifecycleProgress = 0;

      if (installationDate && asset.expectedLifespan) {
        currentAge = (now.getTime() - installationDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        yearsToReplacement = asset.expectedLifespan - currentAge;

        if (installationDate) {
          replacementDate = new Date(installationDate);
          replacementDate.setFullYear(installationDate.getFullYear() + asset.expectedLifespan);
        }

        // Calculate lifecycle progress percentage
        lifecycleProgress = Math.min((currentAge / asset.expectedLifespan) * 100, 100);

        // Determine lifecycle stage
        if (currentAge < asset.expectedLifespan * 0.2) {
          lifecycleStage = 'NEW';
        } else if (currentAge < asset.expectedLifespan * 0.6) {
          lifecycleStage = 'OPERATIONAL';
        } else if (currentAge < asset.expectedLifespan * 0.8) {
          lifecycleStage = 'MATURE';
        } else if (currentAge < asset.expectedLifespan) {
          lifecycleStage = 'AGING';
        } else {
          lifecycleStage = 'REPLACEMENT_DUE';
        }
      }

      return {
        ...asset,
        // Lifecycle calculated fields
        currentAge: Math.round(currentAge * 10) / 10,
        lifecycleStage,
        replacementDate,
        yearsToReplacement: yearsToReplacement ? Math.round(yearsToReplacement * 10) / 10 : null,
        lifecycleProgress: Math.round(lifecycleProgress * 10) / 10,
        // Financial calculations
        totalLifecycleCost: asset.purchasePrice ? Number(asset.purchasePrice) : 0,
        annualMaintenanceCost: asset.maintenanceCost ? Number(asset.maintenanceCost) : 0,
        residualValue: asset.currentValue ? Number(asset.currentValue) : 0,
      };
    });

    return NextResponse.json({
      assets: assetsWithLifecycle,
      total: assetsWithLifecycle.length,
    });

  } catch (error) {
    console.error('Error fetching asset register data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset register data' },
      { status: 500 }
    );
  }
}
