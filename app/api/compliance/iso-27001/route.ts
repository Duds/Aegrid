/**
 * ISO 27001/27002 API Endpoints
 *
 * API endpoints for ISO 27001/27002 compliance management
 *
 * @fileoverview ISO 27001/27002 compliance API endpoints
 */

import { authOptions } from '@/lib/auth';
import { iso27001Compliance } from '@/lib/iso-27001-compliance';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Get ISO 27001/27002 compliance data
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organisationId = searchParams.get('organisationId');
    const type = searchParams.get('type');

    if (!organisationId) {
      return NextResponse.json(
        { error: 'Organisation ID required' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'controls': {
        const controls =
          await iso27001Compliance.getSecurityControls(organisationId);
        return NextResponse.json(controls);
      }

      case 'risks': {
        const risks = await iso27001Compliance.getSecurityRisks(organisationId);
        return NextResponse.json(risks);
      }

      case 'incidents': {
        const incidents =
          await iso27001Compliance.getSecurityIncidents(organisationId);
        return NextResponse.json(incidents);
      }

      case 'training': {
        const training =
          await iso27001Compliance.getSecurityTraining(organisationId);
        return NextResponse.json(training);
      }

      case 'report': {
        const period = {
          startDate: new Date(
            searchParams.get('startDate') ||
              Date.now() - 90 * 24 * 60 * 60 * 1000
          ),
          endDate: new Date(searchParams.get('endDate') || Date.now()),
        };
        const report = await iso27001Compliance.generateComplianceReport(
          organisationId,
          period,
          session.user?.email || 'Unknown'
        );
        return NextResponse.json(report);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('ISO 27001/27002 API error:', error);
    return NextResponse.json(
      { error: 'Failed to get ISO 27001/27002 compliance data' },
      { status: 500 }
    );
  }
}

/**
 * Create security control or risk
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, data } = await request.json();

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type and data required' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'control':
        // ISO27001Compliance doesn't have createSecurityControl method
        return NextResponse.json(
          { error: 'Control creation not implemented' },
          { status: 501 }
        );

      case 'risk':
        result = await iso27001Compliance.conductSecurityRiskAssessment(data);
        break;

      case 'incident':
        result = await iso27001Compliance.recordSecurityIncident(data);
        break;

      case 'training':
        // ISO27001Compliance doesn't have createSecurityTraining method
        return NextResponse.json(
          { error: 'Training creation not implemented' },
          { status: 501 }
        );

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('ISO 27001/27002 creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create ISO 27001/27002 data' },
      { status: 500 }
    );
  }
}
