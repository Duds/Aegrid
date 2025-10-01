import { authOptions } from '@/lib/auth';
import { InfrastructureApplicationControlSystem } from '@/lib/security/infrastructure-application-control';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Initialize infrastructure application control system
const infrastructureControl = new InfrastructureApplicationControlSystem();

/**
 * GET /api/security/infrastructure-control
 * Get infrastructure application control overview
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

    const inventory = infrastructureControl.getInfrastructureInventory();
    const whitelistStatus = infrastructureControl.getWhitelistStatus();

    return NextResponse.json({
      inventory,
      whitelistStatus,
    });
  } catch (error) {
    console.error('Infrastructure control API error:', error);
    return NextResponse.json(
      { error: 'Failed to load infrastructure control data' },
      { status: 500 }
    );
  }
}

/**
 * End of infrastructure control API routes
 */
