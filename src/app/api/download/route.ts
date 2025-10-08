import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth-middleware';
import { FileStorage } from '@/lib/file-storage';

export async function GET(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // docx, templates, generated, enhanced
    const filename = searchParams.get('filename');

    if (!type || !filename) {
      return NextResponse.json({ error: 'Missing type or filename' }, { status: 400 });
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

    // Get file buffer
    const buffer = await FileStorage.readFile(dirName, filename);

    if (!buffer) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Determine content type
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'json': 'application/json',
      'md': 'text/markdown',
      'txt': 'text/plain',
    };
    const contentType = contentTypes[ext || ''] || 'application/octet-stream';

    // Return file (convert Buffer to Uint8Array for NextResponse)
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ error: error.message || 'Download failed' }, { status: 500 });
  }
}
