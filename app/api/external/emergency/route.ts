/**
 * External Emergency API Endpoint
 *
 * Provides emergency data for external integrations and third-party systems.
 * Supports various emergency management protocols and data formats.
 *
 * @fileoverview External emergency API with industry-standard protocols
 */

import { authOptions } from '@/lib/auth';
import {
    checkRateLimit,
    EmergencyError,
    EmergencyErrorCodes,
    handleEmergencyError
} from '@/lib/emergency-error-handler';
import { EmergencyData, EmergencyDataFormatter } from '@/lib/emergency-formatters';
import { withEmergencyMonitoring } from '@/lib/emergency-monitoring';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withEmergencyMonitoring(async (request: NextRequest) => {
  let session: any;
  try {
    session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.organisationId) {
      throw new EmergencyError(
        'Authentication required for external emergency access',
        EmergencyErrorCodes.UNAUTHORIZED,
        401,
        { endpoint: '/api/external/emergency', method: 'GET' },
        session?.user?.organisationId,
        session?.user?.id
      );
    }

    const { searchParams } = new URL(request.url);
    const external = searchParams.get('external');
    const format = searchParams.get('format') || 'json';
    const type = searchParams.get('type') || 'all';

    // Verify this is an external request
    if (external !== 'true') {
      throw new EmergencyError(
        'External access parameter required',
        EmergencyErrorCodes.INVALID_REQUEST,
        400,
        { requiredParam: 'external=true' },
        session.user.organisationId,
        session.user.id
      );
    }

    // Validate format
    if (!EmergencyDataFormatter.isValidFormat(format)) {
      throw new EmergencyError(
        'Invalid data format requested',
        EmergencyErrorCodes.INVALID_FORMAT,
        400,
        {
          format,
          supportedFormats: ['json', 'xml', 'csv', 'yaml', 'geojson', 'cap', 'eas']
        },
        session.user.organisationId,
        session.user.id
      );
    }

    // Check rate limiting
    const rateLimitKey = `external-emergency-${session.user.organisationId}`;
    if (!checkRateLimit(rateLimitKey, 100, 60000)) { // 100 requests per minute
      throw new EmergencyError(
        'Rate limit exceeded for external emergency API',
        EmergencyErrorCodes.RATE_LIMIT_EXCEEDED,
        429,
        { retryAfter: 60 },
        session.user.organisationId,
        session.user.id
      );
    }

    // Mock emergency data for external systems
    const emergencyData: EmergencyData = {
      alerts: [
        {
          id: 'ext-emergency-001',
          type: 'EQUIPMENT_FAILURE',
          severity: 'HIGH',
          location: 'Water Pump Station #3',
          description: 'Primary water pump failure detected',
          timestamp: new Date().toISOString(),
          status: 'ACTIVE',
          coordinates: {
            lat: -33.8688,
            lng: 151.2093
          }
        },
        {
          id: 'ext-emergency-002',
          type: 'ENVIRONMENTAL_HAZARD',
          severity: 'CRITICAL',
          location: 'West Ridge Solar Array',
          description: 'Chemical spill detected near renewable energy facility',
          timestamp: new Date().toISOString(),
          status: 'INVESTIGATING',
          coordinates: {
            lat: -33.8700,
            lng: 151.2100
          }
        }
      ],
      resources: [
        {
          id: 'ext-resource-001',
          type: 'EMERGENCY_CREW',
          name: 'Emergency Response Team Alpha',
          location: 'Main Depot',
          status: 'AVAILABLE',
          contactInfo: {
            phone: '+61 2 9876 5432',
            email: 'emergency.alpha@sample.council'
          }
        },
        {
          id: 'ext-resource-002',
          type: 'MOBILE_UNIT',
          name: 'Mobile Emergency Unit 01',
          location: 'Emergency Facility',
          status: 'DEPLOYED',
          contactInfo: {
            phone: '+61 2 9876 5434',
            email: 'mobile.unit01@sample.council'
          }
        }
      ],
      metadata: {
        organisationId: session.user.organisationId,
        timestamp: new Date().toISOString(),
        version: '1.0',
        source: 'Aegrid Emergency System'
      }
    };

    // Format the data using the EmergencyDataFormatter
    const formattedData = EmergencyDataFormatter.format(emergencyData, format);
    const contentType = EmergencyDataFormatter.getContentType(format);

    return new NextResponse(formattedData, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Emergency-API-Version': '1.0',
        'X-Data-Format': format.toUpperCase(),
        'X-Organisation-ID': session.user.organisationId
      }
    });

  } catch (error) {
    return handleEmergencyError(error, {
      endpoint: '/api/external/emergency',
      method: 'GET',
      organisationId: session?.user?.organisationId,
      userId: session?.user?.id
    });
  }
});

export const POST = withEmergencyMonitoring(async (request: NextRequest) => {
  let session: any;
  try {
    session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.organisationId) {
      throw new EmergencyError(
        'Authentication required for external emergency operations',
        EmergencyErrorCodes.UNAUTHORIZED,
        401,
        { endpoint: '/api/external/emergency', method: 'POST' },
        session?.user?.organisationId,
        session?.user?.id
      );
    }

    const { searchParams } = new URL(request.url);
    const external = searchParams.get('external');

    if (external !== 'true') {
      throw new EmergencyError(
        'External access parameter required',
        EmergencyErrorCodes.INVALID_REQUEST,
        400,
        { requiredParam: 'external=true' },
        session.user.organisationId,
        session.user.id
      );
    }

    // Check rate limiting
    const rateLimitKey = `external-emergency-post-${session.user.organisationId}-${session.user.id}`;
    if (!checkRateLimit(rateLimitKey, 20, 60000)) { // 20 posts per minute
      throw new EmergencyError(
        'Rate limit exceeded for external emergency operations',
        EmergencyErrorCodes.RATE_LIMIT_EXCEEDED,
        429,
        { retryAfter: 60 },
        session.user.organisationId,
        session.user.id
      );
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'report_emergency':
        // Log external emergency report
        console.log('External emergency report received:', {
          organisationId: session.user.organisationId,
          reporter: session.user.email,
          data
        });

        return NextResponse.json({
          message: 'Emergency report received and logged',
          reportId: `ext-report-${Date.now()}`,
          timestamp: new Date().toISOString()
        });

      case 'update_status':
        // Update emergency status from external system
        console.log('External status update received:', {
          organisationId: session.user.organisationId,
          data
        });

        return NextResponse.json({
          message: 'Status update received',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    return handleEmergencyError(error, {
      endpoint: '/api/external/emergency',
      method: 'POST',
      organisationId: session?.user?.organisationId,
      userId: session?.user?.id
    });
  }
});
