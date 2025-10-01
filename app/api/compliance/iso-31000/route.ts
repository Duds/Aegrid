/**
 * ISO 31000 API Endpoints
 *
 * API endpoints for ISO 31000 compliance management
 *
 * @fileoverview ISO 31000 compliance API endpoints
 */

import { authOptions } from '@/lib/auth';
import { iso31000Compliance } from '@/lib/iso-31000-compliance';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Get ISO 31000 compliance data
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
      case 'risks': {
        const risks = await iso31000Compliance.getRiskRegisters(organisationId);
        return NextResponse.json(risks);
      }

      case 'assessments': {
        const assessments =
          await iso31000Compliance.getRiskAssessments(organisationId);
        return NextResponse.json(assessments);
      }

      case 'treatments': {
        // ISO31000Compliance doesn't have getRiskTreatments method
        return NextResponse.json(
          { error: 'Risk treatments not implemented' },
          { status: 501 }
        );
      }

      case 'monitoring': {
        const monitoring =
          await iso31000Compliance.getRiskMonitoring(organisationId);
        return NextResponse.json(monitoring);
      }

      case 'report': {
        const period = {
          startDate: new Date(
            searchParams.get('startDate') ||
              Date.now() - 90 * 24 * 60 * 60 * 1000
          ),
          endDate: new Date(searchParams.get('endDate') || Date.now()),
        };
        const report = await iso31000Compliance.generateComplianceReport(
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
    console.error('ISO 31000 API error:', error);
    return NextResponse.json(
      { error: 'Failed to get ISO 31000 compliance data' },
      { status: 500 }
    );
  }
}

/**
 * Create risk assessment or treatment
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
      case 'risk':
        // Use createRiskRegister instead of createRisk
        result = await iso31000Compliance.createRiskRegister(data);
        break;

      case 'assessment':
        result = await iso31000Compliance.conductRiskAssessment(data);
        break;

      case 'treatment':
        // ISO31000Compliance doesn't have createRiskTreatment method
        return NextResponse.json(
          { error: 'Risk treatment creation not implemented' },
          { status: 501 }
        );

      case 'monitoring':
        result = await iso31000Compliance.setupRiskMonitoring(data);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('ISO 31000 creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create ISO 31000 data' },
      { status: 500 }
    );
  }
}
