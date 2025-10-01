/**
 * AI Intelligence API Routes
 *
 * REST API endpoints for AI Intelligence Core functionality
 */

import { createAIIntelligenceCore } from '@/lib/ai-intelligence-core';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const aiIntelligenceSchema = z.object({
  action: z.enum(['analyze', 'dashboard', 'insights', 'execute_engine']),
  engine: z
    .enum(['optimization', 'anomaly', 'predictive', 'redflagging'])
    .optional(),
  assetId: z.string().optional(),
  parameters: z.record(z.any()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'dashboard';
    const engine = searchParams.get('engine');
    const assetId = searchParams.get('assetId');

    const aiCore = createAIIntelligenceCore(session.user.organisationId!);

    switch (action) {
      case 'dashboard': {
        const dashboard = await aiCore.getIntelligenceDashboard();
        return NextResponse.json(dashboard);
      }

      case 'insights': {
        if (!assetId) {
          return NextResponse.json(
            { error: 'Asset ID required for insights' },
            { status: 400 }
          );
        }
        const insights = await aiCore.getAssetAIInsights(assetId);
        return NextResponse.json(insights);
      }

      case 'execute_engine': {
        if (!engine) {
          return NextResponse.json(
            { error: 'Engine required for execution' },
            { status: 400 }
          );
        }
        const result = await aiCore.executeEngine(engine as string);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI Intelligence API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = aiIntelligenceSchema.parse(body);

    const aiCore = createAIIntelligenceCore(session.user.organisationId!);

    switch (validatedData.action) {
      case 'analyze': {
        const analysis = await aiCore.executeComprehensiveAnalysis();
        return NextResponse.json(analysis);
      }

      case 'execute_engine': {
        if (!validatedData.engine) {
          return NextResponse.json(
            { error: 'Engine required' },
            { status: 400 }
          );
        }
        const result = await aiCore.executeEngine(validatedData.engine);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI Intelligence API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
