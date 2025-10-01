import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

/**
 * GET /api/sessions - Get current user's active sessions
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
        expires: {
          gt: new Date(),
        },
      },
      orderBy: { lastUsed: 'desc' },
      select: {
        id: true,
        sessionToken: true,
        ipAddress: true,
        userAgent: true,
        deviceInfo: true,
        location: true,
        lastUsed: true,
        createdAt: true,
        expires: true,
      },
    });

    // Format sessions for display
    const formattedSessions = sessions.map(sess => ({
      id: sess.id,
      ipAddress: sess.ipAddress,
      userAgent: sess.userAgent,
      deviceInfo: sess.deviceInfo,
      location: sess.location,
      lastUsed: sess.lastUsed,
      createdAt: sess.createdAt,
      expires: sess.expires,
      isCurrent: sess.sessionToken === session.sessionToken,
    }));

    return NextResponse.json({ sessions: formattedSessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * End of sessions API routes
 */
