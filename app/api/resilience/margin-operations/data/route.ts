import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/resilience/margin-operations/data
 * Fetches margin operations data including signals, operations, and metrics
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

    // Fetch resilience signals
    const resilienceSignals = await prisma.resilienceSignal.findMany({
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
        servicePurpose: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: { detectedAt: 'desc' },
      take: 50, // Limit to recent signals
    });

    // Fetch margin operations
    const marginOperations = await prisma.marginOperation.findMany({
      where: { organisationId: user.organisationId },
      orderBy: { updatedAt: 'desc' },
    });

    // Transform resilience signals data
    const transformedSignals = resilienceSignals.map(signal => ({
      id: signal.id,
      signalType: signal.signalType,
      source: signal.source,
      severity: signal.severity,
      description: signal.description,
      assetId: signal.asset?.id,
      assetName: signal.asset?.name,
      servicePurpose: signal.servicePurpose?.name,
      detectedAt: signal.detectedAt.toISOString(),
      responseStatus: signal.responseStatus,
      responseRequired: signal.responseRequired,
    }));

    // Transform margin operations data
    const transformedOperations = marginOperations.map(operation => ({
      id: operation.id,
      operationType: operation.operationType,
      resourceType: operation.resourceType,
      currentUtilization: operation.utilizedCapacity,
      availableCapacity: operation.availableCapacity - operation.utilizedCapacity,
      emergencyThreshold: operation.emergencyThreshold,
      lastDeployed: operation.lastDeployment?.toISOString(),
      deploymentReason: operation.deploymentData ?
        JSON.parse(operation.deploymentData as string).reason : undefined,
      effectiveness: operation.deploymentData ?
        JSON.parse(operation.deploymentData as string).effectiveness : undefined,
      status: operation.status,
    }));

    // Calculate resilience metrics
    const criticalSignals = transformedSignals.filter(s => s.severity === 'CRITICAL').length;
    const pendingResponses = transformedSignals.filter(s => s.responseStatus === 'PENDING').length;

    // Calculate average response time (simulated based on signal age)
    const avgResponseTime = transformedSignals.length > 0
      ? transformedSignals
          .filter(s => s.responseStatus !== 'PENDING')
          .reduce((sum, s) => {
            const detected = new Date(s.detectedAt);
            const now = new Date();
            const hoursDiff = (now.getTime() - detected.getTime()) / (1000 * 60 * 60);
            return sum + Math.min(hoursDiff, 24); // Cap at 24 hours for calculation
          }, 0) / transformedSignals.filter(s => s.responseStatus !== 'PENDING').length
      : 0;

    // Calculate margin utilization
    const totalCapacity = transformedOperations.reduce((sum, op) => sum + op.availableCapacity + op.currentUtilization, 0);
    const totalUtilized = transformedOperations.reduce((sum, op) => sum + op.currentUtilization, 0);
    const marginUtilization = totalCapacity > 0 ? Math.round((totalUtilized / totalCapacity) * 100) : 0;

    // Calculate overall resilience score
    const overallScore = Math.max(0, Math.min(100,
      100 - (criticalSignals * 10) - (pendingResponses * 5) - (marginUtilization > 80 ? 15 : 0)
    ));

    const resilienceMetrics = {
      overallScore,
      marginUtilization,
      signalResponseTime: Math.round(avgResponseTime * 10) / 10,
      systemStrength: Math.max(0, Math.min(100, 85 - (criticalSignals * 8))),
      learningRate: Math.max(0, Math.min(1, 0.15 + (criticalSignals * 0.02))),
      antifragileScore: Math.max(0, Math.min(100, 70 + (criticalSignals * 2))),
    };

    return NextResponse.json({
      success: true,
      data: {
        resilienceSignals: transformedSignals,
        marginOperations: transformedOperations,
        resilienceMetrics,
        metrics: {
          criticalSignals,
          pendingResponses,
          avgResponseTime: Math.round(avgResponseTime * 10) / 10,
          marginUtilization,
        },
      },
    });

  } catch (error) {
    console.error('Margin operations data API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch margin operations data' },
      { status: 500 }
    );
  }
}
