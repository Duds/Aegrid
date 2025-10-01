import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isManagerOrHigher } from '@/lib/rbac';
import { storageService } from '@/lib/storage/storage-service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Document type enum
 */
const DocumentType = z.enum([
  'MANUAL',
  'WARRANTY',
  'INSPECTION',
  'PHOTO',
  'DRAWING',
  'CERTIFICATE',
  'PERMIT',
  'CONTRACT',
  'OTHER',
]);

/**
 * Upload document schema
 */
const uploadDocumentSchema = z.object({
  documentType: DocumentType,
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * POST /api/assets/[id]/documents - Upload document to asset
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - MANAGER and above can upload documents
    if (!isManagerOrHigher(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Verify asset exists and user has access
    const asset = await prisma.asset.findFirst({
      where: {
        id,
        organisationId: session.user.organisationId!,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate document data
    const validatedData = uploadDocumentSchema.parse({
      documentType,
      description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    });

    // Upload file to storage
    const uploadResult = await storageService.uploadFile(
      file,
      id,
      validatedData.documentType,
      {
        maxSize: 50 * 1024 * 1024, // 50MB limit
        generateThumbnail: file.type.startsWith('image/'),
        compress: true,
      }
    );

    // Create document record in database
    const document = await prisma.assetDocument.create({
      data: {
        assetId: id,
        fileName: uploadResult.fileName,
        originalName: file.name,
        fileSize: uploadResult.fileSize,
        mimeType: uploadResult.mimeType,
        filePath: uploadResult.filePath,
        description: validatedData.description,
        documentType: validatedData.documentType,
        uploadedBy: session.user.id,
      },
    });

    // Log the document upload
    await prisma.auditLog.create({
      data: {
        action: 'ASSET_DOCUMENT_ATTACHED',
        userId: session.user.id,
        organisationId: session.user.organisationId!,
        assetId: id,
        details: {
          documentId: document.id,
          fileName: file.name,
          documentType: validatedData.documentType,
          fileSize: uploadResult.fileSize,
        },
        ipAddress:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        fileName: document.fileName,
        originalName: document.originalName,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        documentType: document.documentType,
        description: document.description,
        publicUrl: uploadResult.publicUrl,
        uploadedBy: session.user.name,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    console.error('Error uploading document:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/assets/[id]/documents - List documents for asset
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

    // Verify asset exists and user has access
    const asset = await prisma.asset.findFirst({
      where: {
        id,
        organisationId: session.user.organisationId!,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const documentType = searchParams.get('documentType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {
      assetId: id,
    };

    if (documentType) {
      where.documentType = documentType;
    }

    // Get documents
    const documents = await prisma.assetDocument.findMany({
      where,
      include: {
        uploadedByUser: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Get total count
    const total = await prisma.assetDocument.count({ where });

    return NextResponse.json({
      documents: documents.map(doc => ({
        id: doc.id,
        fileName: doc.fileName,
        originalName: doc.originalName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        documentType: doc.documentType,
        description: doc.description,
        uploadedBy: doc.uploadedByUser?.name,
        createdAt: doc.createdAt,
        publicUrl: `/api/assets/documents/${doc.id}/download`,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
