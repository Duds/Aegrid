import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseSearchIntent } from '@/lib/semantic-search';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query.trim()) {
      return NextResponse.json(
        {
          error: 'Search query is required',
          suggestions: [
            'water pumps',
            'critical assets',
            'maintenance overdue',
            'treatment plant',
            'emergency assets',
          ],
        },
        { status: 400 }
      );
    }

    // Parse natural language intent
    const intent = parseSearchIntent(query);

    // Build Prisma query based on search intent and query
    const whereClause: any = {
      organisationId: session.user.organisationId,
    };

    // Add text search conditions
    const searchTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 2);

    if (searchTerms.length > 0) {
      whereClause.OR = [
        // Asset name search
        {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        // Asset number search
        {
          assetNumber: {
            contains: query,
            mode: 'insensitive',
          },
        },
        // Location search
        {
          location: {
            contains: query,
            mode: 'insensitive',
          },
        },
        // Asset type search
        {
          assetType: {
            contains: query,
            mode: 'insensitive',
          },
        },
        // Service purpose search
        {
          assetPurposeMappings: {
            some: {
              servicePurpose: {
                name: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
        // Multi-word search
        ...searchTerms.map(term => ({
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { assetNumber: { contains: term, mode: 'insensitive' } },
            { location: { contains: term, mode: 'insensitive' } },
            { assetType: { contains: term, mode: 'insensitive' } },
            {
              assetPurposeMappings: {
                some: {
                  servicePurpose: {
                    name: { contains: term, mode: 'insensitive' },
                  },
                },
              },
            },
          ],
        })),
      ];
    }

    // Apply intent-based filters
    if (intent.filters.priority) {
      whereClause.priority = intent.filters.priority;
    }

    if (intent.filters.condition) {
      whereClause.condition = intent.filters.condition;
    }

    // Apply action-based filters
    if (intent.action === 'emergency' || intent.action === 'maintain') {
      whereClause.OR = whereClause.OR || [];
      whereClause.OR.push(
        { priority: 'CRITICAL' },
        { condition: { in: ['POOR', 'CRITICAL'] } }
      );
    }

    if (intent.action === 'inspect') {
      // Could add logic for assets due for inspection
      // This would require additional fields in the schema
    }

    // Execute search
    const [assets, totalCount] = await Promise.all([
      prisma.asset.findMany({
        where: whereClause,
        include: {
          createdByUser: {
            select: { id: true, name: true, email: true },
          },
          updatedByUser: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: {
              documents: true,
              inspections: true,
              maintenance: true,
              workOrders: true,
            },
          },
        },
        orderBy: [
          // Prioritize exact matches
          { name: 'asc' },
          { priority: 'desc' },
          { condition: 'asc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.asset.count({ where: whereClause }),
    ]);

    // Generate search suggestions based on results
    const suggestions = [];

    if (assets.length === 0) {
      // No results - suggest alternatives
      suggestions.push(
        'Try searching for specific asset types like "pump" or "generator"',
        'Search by location like "treatment plant" or "eastern zone"',
        'Look for assets by priority like "critical" or "high priority"',
        'Search by condition like "poor" or "excellent"'
      );
    } else {
      // Generate suggestions based on found assets
      const assetTypes = [...new Set(assets.map(a => a.assetType))];
      const locations = [...new Set(assets.map(a => a.address))]; // Use address instead of location
      const purposes = [...new Set(assets.map(a => a.purpose).filter(Boolean))]; // Use purpose field

      if (assetTypes.length > 0) {
        suggestions.push(
          `Found ${assetTypes.length} asset types: ${assetTypes.slice(0, 3).join(', ')}`
        );
      }
      if (locations.length > 0) {
        suggestions.push(`Locations: ${locations.slice(0, 3).join(', ')}`);
      }
      if (purposes.length > 0) {
        suggestions.push(
          `Service purposes: ${purposes.slice(0, 3).join(', ')}`
        );
      }
    }

    return NextResponse.json({
      assets,
      totalCount,
      searchIntent: intent,
      suggestions,
      query,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: Math.floor(offset / limit) + 1,
      },
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
