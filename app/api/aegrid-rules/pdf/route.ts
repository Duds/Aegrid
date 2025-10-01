import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import puppeteer from 'puppeteer';

/**
 * GET /api/aegrid-rules/pdf - Generate PDF from Aegrid Rules web page
 */
export async function GET(_request: NextRequest) {
  try {
    // Get the base URL for the web page
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const webPageUrl = `${baseUrl}/aegrid-rules`;

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 800,
      deviceScaleFactor: 2,
    });

    // Navigate to the web page
    await page.goto(webPageUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for content to load
    await page.waitForSelector('article', { timeout: 10000 });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
          <span>The Aegrid Rules: Resilient Asset Management for Critical Control</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
          <span>© ${new Date().getFullYear()} Aegrid. All rights reserved. | Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
      preferCSSPageSize: true,
    });

    await browser.close();

    // Return PDF with appropriate headers
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          'inline; filename="The-Aegrid-Rules-Resilient-Asset-Management.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);

    // Fallback: return the markdown file as plain text
    try {
      const filePath = path.join(
        process.cwd(),
        'public',
        'documents',
        'The Aegrid Rules_ Resilient Asset Management for Critical Control.md'
      );
      const markdownContent = await fs.readFile(filePath, 'utf-8');

      return new NextResponse(markdownContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition':
            'attachment; filename="The-Aegrid-Rules-Resilient-Asset-Management.txt"',
        },
      });
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      return NextResponse.json(
        { error: 'Failed to generate PDF and fallback failed' },
        { status: 500 }
      );
    }
  }
}
