import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth-middleware';
import { FileStorage } from '@/lib/file-storage';
import JSZip from 'jszip';

export async function GET(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // docx, template, generated, enhanced

    if (!type) {
      return NextResponse.json({ error: 'Missing type parameter' }, { status: 400 });
    }

    const dirMap: Record<string, string> = {
      docx: 'docx',
      template: 'templates',
      enhanced: 'enhanced',
      generated: 'generated'
    };

    const dirName = dirMap[type];
    if (!dirName) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Get list of files
    const files = await FileStorage.listFiles(dirName);

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files found' }, { status: 404 });
    }

    // Create ZIP file
    const zip = new JSZip();

    // Add each file to the ZIP
    for (const filename of files) {
      try {
        const buffer = await FileStorage.readFile(dirName, filename);
        if (buffer) {
          zip.file(filename, buffer);
        }
      } catch (error) {
        console.error(`Error adding file ${filename} to ZIP:`, error);
        // Continue with other files
      }
    }

    // Generate ZIP buffer as blob
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    // Convert blob to array buffer
    const arrayBuffer = await zipBlob.arrayBuffer();

    // Return ZIP file
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${type}_files.zip"`,
        'Content-Length': arrayBuffer.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error('Download all error:', error);
    return NextResponse.json({ error: error.message || 'Download failed' }, { status: 500 });
  }
}
