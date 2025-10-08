import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth-middleware';
import { FileStorage } from '@/lib/file-storage';

export async function POST(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'docx' or 'template'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const filename = file.name;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Determine upload directory
    let dirName: string;
    if (type === 'docx' || filename.endsWith('.docx')) {
      dirName = 'docx';
      if (!filename.endsWith('.docx')) {
        return NextResponse.json({ error: 'Only DOCX files allowed' }, { status: 400 });
      }
    } else if (type === 'template' || filename.endsWith('.json')) {
      dirName = 'templates';
      if (!filename.endsWith('.json')) {
        return NextResponse.json({ error: 'Only JSON files allowed' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    console.log(`📤 Uploading ${filename} to ${dirName}/`);

    // Use FileStorage unified interface
    const success = await FileStorage.writeFile(dirName, filename, buffer);

    if (!success) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    console.log(`✅ Upload successful: ${filename}`);

    return NextResponse.json({
      success: true,
      filename,
      storage: await FileStorage.getStorageType()
    });
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
