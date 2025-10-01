import { LandingPageEvent } from '@/lib/analytics/landing-page-analytics';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const event: LandingPageEvent = await request.json();

    // Validate event structure
    if (!event.type || !event.timestamp || !event.sessionId) {
      return NextResponse.json(
        { error: 'Invalid event structure' },
        { status: 400 }
      );
    }

    // Validate event type
    const validTypes = [
      'page_view',
      'cta_click',
      'section_view',
      'scroll_depth',
      'time_on_page',
      'feature_interaction',
    ];
    if (!validTypes.includes(event.type)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Add server-side metadata
    const enrichedEvent = {
      ...event,
      serverTimestamp: Date.now(),
      ip:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
      userAgent: request.headers.get('user-agent') || event.userAgent,
      referrer: request.headers.get('referer') || event.referrer,
    };

    // Store event (in production, this would go to a database or analytics service)
    await storeAnalyticsEvent(enrichedEvent);

    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event Stored:', {
        type: enrichedEvent.type,
        timestamp: new Date(enrichedEvent.timestamp).toISOString(),
        sessionId: enrichedEvent.sessionId,
        properties: enrichedEvent.properties,
      });
    }

    return NextResponse.json({
      success: true,
      eventId: enrichedEvent.sessionId,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function storeAnalyticsEvent(event: any) {
  // In a real implementation, this would store to a database
  // For now, we'll just log it and could store in memory or a simple file

  // Example database storage (commented out for now):
  /*
  await db.analyticsEvents.create({
    data: {
      type: event.type,
      sessionId: event.sessionId,
      timestamp: new Date(event.timestamp),
      serverTimestamp: new Date(event.serverTimestamp),
      properties: event.properties,
      metadata: {
        userAgent: event.userAgent,
        ip: event.ip,
        referrer: event.referrer,
        url: event.url,
        variant: event.variant,
        section: event.section
      }
    }
  });
  */

  // For development, we could store in a simple in-memory store
  // or write to a file for analysis
  if (process.env.NODE_ENV === 'development') {
    // Store in a global array for development analysis
    if (!(global as any).analyticsEvents) {
      (global as any).analyticsEvents = [];
    }
    (global as any).analyticsEvents.push(event);

    // Keep only last 1000 events to prevent memory issues
    if ((global as any).analyticsEvents.length > 1000) {
      (global as any).analyticsEvents = (global as any).analyticsEvents.slice(
        -1000
      );
    }
  }
}
