import { logAuditEvent } from '@/lib/audit';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isManagerOrHigher } from '@/lib/rbac';
import { AuditAction } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * RCM Template update schema
 */
const updateRCMTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').optional(),
  description: z.string().optional(),
  version: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED', 'REVIEW_REQUIRED']).optional(),
  isPublic: z.boolean().optional(),
});

/**
 * GET /api/rcm-templates/[id] - Get RCM template by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: templateId } = await params;

    const template = await prisma.rCMTemplate.findFirst({
      where: {
        id: templateId,
        OR: [
          { organisationId: session.user.organisationId },
          { isPublic: true },
        ],
      },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
        failureModes: {
          orderBy: { severity: 'desc' },
        },
        maintenanceTasks: {
          orderBy: { frequency: 'asc' },
        },
        _count: {
          select: {
            assetsUsingTemplate: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching RCM template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RCM template' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/rcm-templates/[id] - Update RCM template
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isManagerOrHigher(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: templateId } = await params;
    const body = await request.json();
    const validation = updateRCMTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if template exists and user has permission
    const existingTemplate = await prisma.rCMTemplate.findFirst({
      where: {
        id: templateId,
        organisationId: session.user.organisationId,
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const updatedTemplate = await prisma.rCMTemplate.update({
      where: { id: templateId },
      data: validation.data,
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
        failureModes: true,
        maintenanceTasks: true,
      },
    });

    await logAuditEvent(
      AuditAction.ASSET_UPDATED,
      session.user.id,
      session.user.organisationId,
      { message: `RCM Template '${updatedTemplate.name}' updated`, templateId },
      request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip'),
      request.headers.get('user-agent')
    );

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating RCM template:', error);
    return NextResponse.json(
      { error: 'Failed to update RCM template' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rcm-templates/[id] - Delete RCM template
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isManagerOrHigher(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: templateId } = await params;

    // Check if template exists and user has permission
    const existingTemplate = await prisma.rCMTemplate.findFirst({
      where: {
        id: templateId,
        organisationId: session.user.organisationId,
      },
      include: {
        _count: {
          select: {
            assetsUsingTemplate: true,
          },
        },
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check if template is in use
    if (existingTemplate._count.assetsUsingTemplate > 0) {
      return NextResponse.json(
        { error: 'Cannot delete template that is in use by assets' },
        { status: 400 }
      );
    }

    await prisma.rCMTemplate.delete({
      where: { id: templateId },
    });

    await logAuditEvent(
      AuditAction.ASSET_DELETED,
      session.user.id,
      session.user.organisationId,
      {
        message: `RCM Template '${existingTemplate.name}' deleted`,
        templateId,
      },
      request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip'),
      request.headers.get('user-agent')
    );

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting RCM template:', error);
    return NextResponse.json(
      { error: 'Failed to delete RCM template' },
      { status: 500 }
    );
  }
}
