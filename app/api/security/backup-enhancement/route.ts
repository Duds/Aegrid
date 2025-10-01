import { authOptions } from '@/lib/auth';
import {
  BackupEnhancementSystem,
  BackupJobStatus,
} from '@/lib/security/backup-enhancement';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Initialize backup enhancement system
const backupSystem = new BackupEnhancementSystem();

/**
 * GET /api/security/backup-enhancement
 * Get backup enhancement overview
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

    const monitoring = backupSystem.getBackupMonitoring();
    const activeJobs = backupSystem.getBackupJobsByStatus(
      BackupJobStatus.ACTIVE
    );
    const failedRuns = backupSystem.getFailedBackupRuns();
    const integrityIssues = backupSystem.getBackupRunsWithIntegrityIssues();

    return NextResponse.json({
      monitoring,
      activeJobs,
      failedRuns,
      integrityIssues,
    });
  } catch (error) {
    console.error('Backup enhancement API error:', error);
    return NextResponse.json(
      { error: 'Failed to load backup enhancement data' },
      { status: 500 }
    );
  }
}

/**
 * End of backup enhancement API routes
 */
