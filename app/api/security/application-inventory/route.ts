import { AuditAction, logAuditEvent } from '@/lib/audit';
import { authOptions } from '@/lib/auth';
import {
  ApplicationCategory,
  ApplicationInventoryManager,
  ApplicationStatus,
  ApplicationWhitelistManager,
  RiskLevel,
} from '@/lib/security/application-inventory';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Initialize managers
const inventoryManager = new ApplicationInventoryManager();
const whitelistManager = new ApplicationWhitelistManager(inventoryManager);

/**
 * GET /api/security/application-inventory
 * Get application inventory summary
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has appropriate role
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const inventory = inventoryManager.getInventory();
    const whitelistStatus = whitelistManager.getWhitelistStatus();

    return NextResponse.json({
      inventory,
      whitelistStatus,
    });
  } catch (error) {
    console.error('Application inventory API error:', error);
    return NextResponse.json(
      { error: 'Failed to load application inventory' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/security/application-inventory
 * Add new application to inventory
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has appropriate role
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, version, vendor, category, permissions } = body;

    // Validate required fields
    if (!name || !version || !vendor || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new application
    const application = await inventoryManager.addApplication({
      name,
      version,
      vendor,
      category: category as ApplicationCategory,
      status: ApplicationStatus.PENDING_APPROVAL,
      riskLevel: RiskLevel.LOW,
      vulnerabilities: [],
      dependencies: [],
      permissions: permissions || [],
    });

    // Log audit event
    await logAuditEvent(
      AuditAction.APPLICATION_ADDED,
      session.user.id,
      session.user.organisationId,
      {
        applicationId: application.id,
        applicationName: application.name,
        applicationVersion: application.version,
        applicationVendor: application.vendor,
        applicationCategory: application.category,
      }
    );

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Add application API error:', error);
    return NextResponse.json(
      { error: 'Failed to add application' },
      { status: 500 }
    );
  }
}

/**
 * End of application inventory API routes
 */
