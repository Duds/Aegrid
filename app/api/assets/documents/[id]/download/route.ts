import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { storageService } from '@/lib/storage/storage-service';
import { promises as fs } from 'fs';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

/**
 * GET /api/assets/documents/[id]/download - Download document
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

    const { id } = await params;

    // Get document from database
    const document = await prisma.assetDocument.findUnique({
      where: { id },
      include: {
        asset: {
          select: {
            id: true,
            organisationId: true,
            isPublic: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const hasAccess =
      session.user.organisationId === document.asset.organisationId ||
      document.asset.isPublic;

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get file info from storage
    const fileInfo = await storageService.getFileInfo(
      document.assetId,
      document.fileName
    );

    if (!fileInfo.exists) {
      return NextResponse.json(
        { error: 'File not found in storage' },
        { status: 404 }
      );
    }

    // For local storage, read file directly
    if (storageService.getProviderInfo().isLocal) {
      const filePath = path.join(
        process.cwd(),
        'uploads',
        'documents',
        document.assetId,
        document.fileName
      );

      try {
        const fileBuffer = await fs.readFile(filePath);

        // Log document access
        await prisma.auditLog.create({
          data: {
            action: 'ASSET_DOCUMENT_ATTACHED',
            userId: session.user.id,
            organisationId: session.user.organisationId!,
            assetId: document.assetId,
            details: {
              documentId: document.id,
              fileName: document.originalName,
              documentType: document.documentType,
            },
            ipAddress:
              request.headers.get('x-forwarded-for') ||
              request.headers.get('x-real-ip'),
            userAgent: request.headers.get('user-agent'),
          },
        });

        // Return file with appropriate headers
        return new NextResponse(Buffer.from(fileBuffer), {
          headers: {
            'Content-Type': document.mimeType,
            'Content-Disposition': `inline; filename="${document.originalName}"`,
            'Content-Length': fileInfo.size.toString(),
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          },
        });
      } catch (error) {
        console.error('Error reading file:', error);
        return NextResponse.json(
          { error: 'Failed to read file' },
          { status: 500 }
        );
      }
    } else {
      // Azure storage implementation would go here
      return NextResponse.json(
        { error: 'Azure storage not implemented' },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    );
  }
}
