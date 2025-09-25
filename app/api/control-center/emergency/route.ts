import { authOptions } from '@/lib/auth';
import {
    checkRateLimit,
    EmergencyError,
    EmergencyErrorCodes,
    handleEmergencyError,
    validateEmergencySeverity
} from '@/lib/emergency-error-handler';
import { withEmergencyMonitoring } from '@/lib/emergency-monitoring';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/control-center/emergency
 * Get emergency dashboard data including alerts and resources
 */
export const GET = withEmergencyMonitoring(async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organisationId) {
      throw new EmergencyError(
        'Authentication required to access emergency dashboard',
        EmergencyErrorCodes.UNAUTHORIZED,
        401,
        { endpoint: '/api/control-center/emergency' },
        session?.user?.organisationId,
        session?.user?.id
      );
    }

    // Check rate limiting
    const rateLimitKey = `emergency-dashboard-${session.user.organisationId}`;
    if (!checkRateLimit(rateLimitKey, 200, 60000)) { // 200 requests per minute
      throw new EmergencyError(
        'Rate limit exceeded for emergency dashboard access',
        EmergencyErrorCodes.RATE_LIMIT_EXCEEDED,
        429,
        { retryAfter: 60 },
        session.user.organisationId,
        session.user.id
      );
    }

    const organisationId = session.user.organisationId;

    // Get emergency alerts
    const emergencyAlerts = await prisma.emergencyAlert.findMany({
      where: {
        organisationId,
        status: { in: ['ACTIVE', 'RESPONDING', 'INVESTIGATING'] }
      },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetNumber: true,
            assetType: true,
            priority: true
          }
        }
      },
      orderBy: [
        { severity: 'desc' },
        { detectedAt: 'desc' }
      ],
      take: 10
    });

    // Get emergency resources
    const emergencyResources = await prisma.emergencyResource.findMany({
      where: { organisationId },
      orderBy: { resourceType: 'asc' }
    });

    // Calculate summary statistics
    const totalAlerts = emergencyAlerts.length;
    const criticalAlerts = emergencyAlerts.filter(alert => alert.severity === 'CRITICAL').length;
    const highAlerts = emergencyAlerts.filter(alert => alert.severity === 'HIGH').length;
    const activeAlerts = emergencyAlerts.filter(alert => alert.status === 'ACTIVE').length;

    const totalResources = emergencyResources.length;
    const availableResources = emergencyResources.reduce((sum, resource) => sum + resource.availableCount, 0);
    const utilisedResources = emergencyResources.reduce((sum, resource) => sum + resource.utilisedCount, 0);
    const resourceUtilisation = totalResources > 0 ? (utilisedResources / (availableResources + utilisedResources)) * 100 : 0;

    return NextResponse.json({
      alerts: emergencyAlerts,
      resources: emergencyResources,
      summary: {
        totalAlerts,
        criticalAlerts,
        highAlerts,
        activeAlerts,
        totalResources,
        availableResources,
        utilisedResources,
        resourceUtilisation: Math.round(resourceUtilisation * 100) / 100
      }
    });

  } catch (error) {
    return handleEmergencyError(error, {
      endpoint: '/api/control-center/emergency',
      method: 'GET',
      organisationId: session?.user?.organisationId,
      userId: session?.user?.id
    });
  }
});

/**
 * POST /api/control-center/emergency
 * Create a new emergency alert
 */
export const POST = withEmergencyMonitoring(async (request: NextRequest) => {
  let session: any;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.organisationId) {
      throw new EmergencyError(
        'Authentication required to create emergency alerts',
        EmergencyErrorCodes.UNAUTHORIZED,
        401,
        { endpoint: '/api/control-center/emergency', method: 'POST' },
        session?.user?.organisationId,
        session?.user?.id
      );
    }

    // Check if user has manager or admin role
    if (!['ADMIN', 'MANAGER', 'SUPERVISOR'].includes(session.user.role)) {
      throw new EmergencyError(
        'Insufficient permissions to create emergency alerts',
        EmergencyErrorCodes.INSUFFICIENT_PERMISSIONS,
        403,
        { requiredRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR'], userRole: session.user.role },
        session.user.organisationId,
        session.user.id
      );
    }

    // Check rate limiting
    const rateLimitKey = `emergency-create-${session.user.organisationId}-${session.user.id}`;
    if (!checkRateLimit(rateLimitKey, 10, 60000)) { // 10 creates per minute
      throw new EmergencyError(
        'Rate limit exceeded for emergency alert creation',
        EmergencyErrorCodes.RATE_LIMIT_EXCEEDED,
        429,
        { retryAfter: 60 },
        session.user.organisationId,
        session.user.id
      );
    }

    const body = await request.json();
    const { alertType, severity, title, description, location, assetId } = body;

    // Validate required fields
    const requiredFields = ['alertType', 'severity', 'title', 'description'];
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      throw new EmergencyError(
        'Missing required fields for emergency alert',
        EmergencyErrorCodes.MISSING_REQUIRED_FIELDS,
        400,
        { requiredFields, missingFields },
        session.user.organisationId,
        session.user.id
      );
    }

    // Validate severity
    if (!validateEmergencySeverity(severity)) {
      throw new EmergencyError(
        'Invalid emergency severity level',
        EmergencyErrorCodes.INVALID_SEVERITY,
        400,
        { severity, validSeverities: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
        session.user.organisationId,
        session.user.id
      );
    }

    const emergencyAlert = await prisma.emergencyAlert.create({
      data: {
        organisationId: session.user.organisationId,
        assetId: assetId || null,
        alertType,
        severity,
        title,
        description,
        location: location || null,
        status: 'ACTIVE',
        detectedAt: new Date()
      },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetNumber: true,
            assetType: true,
            priority: true
          }
        }
      }
    });

    return NextResponse.json({
      alert: emergencyAlert,
      message: 'Emergency alert created successfully'
    });

  } catch (error) {
    return handleEmergencyError(error, {
      endpoint: '/api/control-center/emergency',
      method: 'POST',
      organisationId: session?.user?.organisationId,
      userId: session?.user?.id
    });
  }
});

/**
 * PUT /api/control-center/emergency
 * Update emergency alert status
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has manager or admin role
    if (!['ADMIN', 'MANAGER', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { alertId, status, responseTime, resolutionTime } = body;

    if (!alertId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updateData: any = { status };

    if (status === 'RESPONDING' && responseTime) {
      updateData.responseTime = responseTime;
    }

    if (status === 'RESOLVED' && resolutionTime) {
      updateData.resolutionTime = resolutionTime;
      updateData.resolvedAt = new Date();
    }

    const emergencyAlert = await prisma.emergencyAlert.update({
      where: {
        id: alertId,
        organisationId: session.user.organisationId
      },
      data: updateData,
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetNumber: true,
            assetType: true,
            priority: true
          }
        }
      }
    });

    return NextResponse.json({
      alert: emergencyAlert,
      message: 'Emergency alert updated successfully'
    });

  } catch (error) {
    console.error('Error updating emergency alert:', error);
    return NextResponse.json(
      { error: 'Failed to update emergency alert' },
      { status: 500 }
    );
  }
}
