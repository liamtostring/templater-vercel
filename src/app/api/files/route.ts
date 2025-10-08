import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth-middleware';
import { FileStorage } from '@/lib/file-storage';
import path from 'path';

export async function POST(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, type, filename } = body;

    if (action === 'delete') {
      if (!filename) {
        return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
      }

      const dirMap: Record<string, string> = {
        docx: 'docx',
        template: 'templates',
        enhanced: 'enhanced',
        generated: 'generated'
      };

      if (!dirMap[type]) {
        return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
      }

      // Sanitize filename (security)
      const sanitizedFilename = path.basename(filename);
      const dirName = dirMap[type];

      const deleted = await FileStorage.deleteFile(dirName, sanitizedFilename);

      if (!deleted) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: 'File deleted successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const dirMap: Record<string, string> = {
      docx: 'docx',
      template: 'templates',
      enhanced: 'enhanced',
      generated: 'generated'
    };

    const files: Record<string, Array<{ name: string; size: number; url: string }>> = {};
    const storageType = await FileStorage.getStorageType();

    for (const [key, dirName] of Object.entries(dirMap)) {
      const fileList = await FileStorage.listFilesWithMetadata(dirName);
      files[key] = await Promise.all(fileList.map(async (file) => {
        const fileUrl = await FileStorage.getPublicUrl(dirName, file.name);
        return {
          name: file.name,
          size: file.size,
          url: fileUrl
        };
      }));
    }

    if (type && files[type]) {
      return NextResponse.json({ files: files[type], storage: storageType });
    }

    return NextResponse.json({ files, storage: storageType });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
