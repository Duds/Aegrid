import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/profile/sessions - Get current user's active sessions
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await prisma.session.findMany({
      where: { userId: session.user.id },
      orderBy: { lastUsed: 'desc' },
      select: {
        id: true,
        sessionToken: true,
        ipAddress: true,
        userAgent: true,
        deviceInfo: true,
        location: true,
        isActive: true,
        lastUsed: true,
        createdAt: true,
        expires: true,
      },
    });

    // Format sessions with additional info
    const formattedSessions = sessions.map(session => ({
      ...session,
      isCurrentSession: session.sessionToken === session.sessionToken, // This would need to be compared with current session token
      deviceName: getDeviceName(session.userAgent, session.deviceInfo),
      browserName: getBrowserName(session.userAgent),
      osName: getOSName(session.userAgent),
    }));

    return NextResponse.json(formattedSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getDeviceName(userAgent: string | null, deviceInfo: any): string {
  if (deviceInfo?.deviceName) {
    return deviceInfo.deviceName;
  }

  if (!userAgent) {
    return 'Unknown Device';
  }

  if (userAgent.includes('Mobile')) {
    return 'Mobile Device';
  } else if (userAgent.includes('Tablet')) {
    return 'Tablet';
  } else {
    return 'Desktop';
  }
}

function getBrowserName(userAgent: string | null): string {
  if (!userAgent) {
    return 'Unknown Browser';
  }

  if (userAgent.includes('Chrome')) {
    return 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    return 'Firefox';
  } else if (userAgent.includes('Safari')) {
    return 'Safari';
  } else if (userAgent.includes('Edge')) {
    return 'Edge';
  } else {
    return 'Unknown Browser';
  }
}

function getOSName(userAgent: string | null): string {
  if (!userAgent) {
    return 'Unknown OS';
  }

  if (userAgent.includes('Windows')) {
    return 'Windows';
  } else if (userAgent.includes('Mac')) {
    return 'macOS';
  } else if (userAgent.includes('Linux')) {
    return 'Linux';
  } else if (userAgent.includes('Android')) {
    return 'Android';
  } else if (userAgent.includes('iOS')) {
    return 'iOS';
  } else {
    return 'Unknown OS';
  }
}
