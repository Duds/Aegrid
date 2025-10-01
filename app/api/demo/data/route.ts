import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Demo Data Management API Endpoint
 * Provides compelling demo data that tells the resilience story
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has appropriate role
    if (!['ADMIN', 'MANAGER', 'EXEC'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get organisation ID from user
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

    const { searchParams } = new URL(request.url);
    const scenario = searchParams.get('scenario') || 'default';

    // Generate demo data (no database model exists for demo scenarios)
    const demoData = generateDemoData(scenario);
    return NextResponse.json({ demoData });
  } catch (error) {
    console.error('Demo data API error:', error);
    return NextResponse.json(
      { error: 'Failed to load demo data' },
      { status: 500 }
    );
  }
}

/**
 * Generate compelling demo data that tells the resilience story
 */
function generateDemoData(scenario: string) {
  const scenarios = {
    default: {
      title: 'Aegrid Resilience Demo',
      description: 'Comprehensive demonstration of The Aegrid Rules in action',
      narrative:
        'See how Aegrid transforms reactive maintenance into proactive risk management',
      metrics: {
        resilienceImprovement: 87,
        costReduction: 23,
        downtimeReduction: 45,
        stakeholderSatisfaction: 94,
      },
      keyStories: [
        {
          rule: 'Rule 1: Every Asset Has a Purpose',
          story:
            'Critical water treatment plant identified and prioritized based on service purpose',
          impact: '50,000 residents protected from water service disruption',
          metrics:
            '95% risk score → 15% risk score through purpose-driven management',
        },
        {
          rule: 'Rule 2: Risk Sets the Rhythm',
          story:
            'Dynamic scheduling adapts to weather conditions and asset condition signals',
          impact: 'Emergency response time reduced from 4 hours to 45 minutes',
          metrics:
            'Risk-based scheduling prevents 3 critical failures this quarter',
        },
        {
          rule: 'Rule 3: Respond to the Real World',
          story:
            'Real-time signal detection prevents major infrastructure failure',
          impact: 'Early warning system prevents $2.3M in emergency repairs',
          metrics: 'Signal response time: 30 seconds average',
        },
        {
          rule: 'Rule 4: Operate with Margin',
          story: 'Antifragile systems improve performance under stress',
          impact: 'System resilience increased 12% during peak demand periods',
          metrics: '86% margin utilization with 94% availability',
        },
      ],
    },

    crisis: {
      title: 'Crisis Response Scenario',
      description: 'How Aegrid handles major infrastructure crisis',
      narrative:
        'Severe weather event tests system resilience and adaptive capabilities',
      metrics: {
        resilienceImprovement: 92,
        costReduction: 31,
        downtimeReduction: 67,
        stakeholderSatisfaction: 89,
      },
      keyStories: [
        {
          rule: 'Rule 1: Every Asset Has a Purpose',
          story: 'Critical controls automatically prioritized during crisis',
          impact: 'Essential services maintained throughout severe weather',
          metrics: '100% critical infrastructure protected',
        },
        {
          rule: 'Rule 2: Risk Sets the Rhythm',
          story:
            'Emergency protocols activated based on real-time risk assessment',
          impact: 'Crisis response time reduced by 60%',
          metrics: 'Risk-based emergency protocols prevent cascading failures',
        },
        {
          rule: 'Rule 3: Respond to the Real World',
          story: 'Weather signals trigger automatic schedule adaptations',
          impact: 'Preventive actions taken before damage occurs',
          metrics: 'Zero unplanned outages during severe weather',
        },
        {
          rule: 'Rule 4: Operate with Margin',
          story: 'Margin deployment ensures continuous service delivery',
          impact: 'Surge capacity maintains service levels during peak demand',
          metrics:
            'Emergency margin utilization: 78% with 100% service continuity',
        },
      ],
    },

    optimization: {
      title: 'Continuous Improvement Scenario',
      description: 'How Aegrid learns and improves over time',
      narrative:
        'Antifragile systems demonstrate continuous improvement under stress',
      metrics: {
        resilienceImprovement: 95,
        costReduction: 28,
        downtimeReduction: 52,
        stakeholderSatisfaction: 97,
      },
      keyStories: [
        {
          rule: 'Rule 1: Every Asset Has a Purpose',
          story: 'Purpose-driven optimization improves asset efficiency',
          impact:
            'Asset utilization increased 15% through better purpose alignment',
          metrics: 'Purpose-driven optimization saves $1.2M annually',
        },
        {
          rule: 'Rule 2: Risk Sets the Rhythm',
          story: 'Machine learning improves risk assessment accuracy',
          impact: 'Risk prediction accuracy improved to 94%',
          metrics: 'Predictive maintenance prevents 89% of potential failures',
        },
        {
          rule: 'Rule 3: Respond to the Real World',
          story: 'Adaptive algorithms optimize response strategies',
          impact: 'Response effectiveness improved 23% through learning',
          metrics: 'Adaptive response algorithms reduce false alarms by 67%',
        },
        {
          rule: 'Rule 4: Operate with Margin',
          story: 'Antifragile systems demonstrate improvement under stress',
          impact: 'System performance improved 8% during stress events',
          metrics: 'Antifragile improvement rate: 12% per stress cycle',
        },
      ],
    },
  };

  return scenarios[scenario as keyof typeof scenarios] || scenarios.default;
}
