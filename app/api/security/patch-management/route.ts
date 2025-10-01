import { authOptions } from '@/lib/auth';
import {
  PatchManagementSystem,
  PatchStatus,
} from '@/lib/security/patch-management';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Initialize patch management system
const patchManager = new PatchManagementSystem();

/**
 * GET /api/security/patch-management
 * Get patch management overview and compliance status
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

    const compliance = patchManager.getPatchCompliance();
    const criticalPatches = patchManager.getCriticalPatches();
    const pendingPatches = patchManager.getPatchesByStatus(
      PatchStatus.DISCOVERED
    );
    const failedDeployments = patchManager.getFailedDeployments();

    return NextResponse.json({
      compliance,
      criticalPatches,
      pendingPatches,
      failedDeployments,
    });
  } catch (error) {
    console.error('Patch management API error:', error);
    return NextResponse.json(
      { error: 'Failed to load patch management data' },
      { status: 500 }
    );
  }
}

/**
 * End of patch management API routes
 */
