/**
 * Antifragile System API Endpoint
 *
 * GET /api/resilience/antifragile - Get antifragile system status
 *
 * @file app/api/resilience/antifragile/route.ts
 * @version 1.0.0
 * @since PI3 - Resilience Implementation
 */

import { authOptions } from '@/lib/auth';
import { isManagerOrHigher } from '@/lib/rbac';
import {
  createResilienceEngine,
  defaultResilienceConfig,
} from '@/lib/resilience-engine';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/resilience/antifragile - Get antifragile system status
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isManagerOrHigher(session.user.role)) {
      return NextResponse.json(
        {
          error:
            'Unauthorized - Insufficient permissions for resilience operations',
        },
        { status: 401 }
      );
    }

    const engine = createResilienceEngine(defaultResilienceConfig);

    // Get antifragile system status
    const antifragileStatus = await engine.getAntifragileStatus({
      organisationId: session.user.organisationId!,
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      data: antifragileStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting antifragile status:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
