import { authOptions } from '@/lib/auth';
import {
  OSPatchManagementSystem,
  OSPatchStatus,
} from '@/lib/security/os-patch-management';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Initialize OS patch management system
const osPatchManager = new OSPatchManagementSystem();

/**
 * GET /api/security/os-patch-management
 * Get OS patch management overview
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

    const compliance = osPatchManager.getOSPatchCompliance();
    const criticalPatches = osPatchManager.getCriticalOSPatches();
    const pendingPatches = osPatchManager.getOSPatchesByStatus(
      OSPatchStatus.DISCOVERED
    );
    const failedDeployments = osPatchManager.getFailedOSDeployments();

    return NextResponse.json({
      compliance,
      criticalPatches,
      pendingPatches,
      failedDeployments,
    });
  } catch (error) {
    console.error('OS patch management API error:', error);
    return NextResponse.json(
      { error: 'Failed to load OS patch management data' },
      { status: 500 }
    );
  }
}

/**
 * End of OS patch management API routes
 */
