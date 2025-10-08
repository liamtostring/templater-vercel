import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth-middleware';
import Storage from '@/lib/storage';
import DocxConverter from '@/lib/docx-converter';
import AIService from '@/lib/ai-service';
import TemplateProcessor from '@/lib/template-processor';
import { FileStorage } from '@/lib/file-storage';
import path from 'path';

export async function POST(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'process_single') {
      return await processSingle(body);
    }

    if (action === 'process_batch_chunk') {
      return await processBatchChunk(body);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

async function processSingle(data: any) {
  const { docx_filename, template_filename, service, model, prompt, keep_enhanced } = data;

  if (!docx_filename || !template_filename) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Get API key from storage
  const apiKey = await Storage.getAsync<string>(`${service}_api_key`, '');
  if (!apiKey) {
    return NextResponse.json({ error: `${service} API key not configured` }, { status: 400 });
  }

  try {
    // Read DOCX file
    const docxBuffer = await FileStorage.readFile('docx', docx_filename);
    if (!docxBuffer) {
      return NextResponse.json({ error: 'DOCX file not found' }, { status: 404 });
    }

    // Convert to Markdown
    const markdown = await DocxConverter.toMarkdown(docxBuffer);

    // Enhance with AI
    const enhanced = await AIService.enhance(markdown, prompt, service as 'gemini' | 'openai', apiKey, model);

    // Save enhanced content if requested
    let enhancedPath = '';
    if (keep_enhanced) {
      const baseFilename = path.parse(docx_filename).name;
      const enhancedFilename = `${baseFilename}_enhanced.md`;
      await FileStorage.writeFile('enhanced', enhancedFilename, Buffer.from(enhanced, 'utf-8'));
      enhancedPath = enhancedFilename;
    }

    // Parse variables
    const baseFilename = path.parse(docx_filename).name;
    const variables = TemplateProcessor.parseVariables(enhanced, baseFilename);

    // Read template
    const templateBuffer = await FileStorage.readFile('templates', template_filename);
    if (!templateBuffer) {
      return NextResponse.json({ error: 'Template file not found' }, { status: 404 });
    }

    const templateContent = templateBuffer.toString('utf-8');
    const templateJson = JSON.parse(templateContent);

    // Process template
    const generatedJson = TemplateProcessor.processTemplate(templateJson, variables);

    // Save generated JSON
    const jsonFilename = `${baseFilename}.json`;
    await FileStorage.writeFile('generated', jsonFilename, Buffer.from(generatedJson, 'utf-8'));

    return NextResponse.json({
      success: true,
      enhanced_path: enhancedPath,
      json_path: jsonFilename,
      variables,
      markdown,
      enhanced,
      storage: await FileStorage.getStorageType()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function processBatchChunk(data: any) {
  const { files, template_filename, service, model, prompt, keep_enhanced } = data;

  if (!files || !Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: 'No files to process' }, { status: 400 });
  }

  // Get API key from storage
  const apiKey = await Storage.getAsync<string>(`${service}_api_key`, '');
  if (!apiKey) {
    return NextResponse.json({ error: `${service} API key not configured` }, { status: 400 });
  }

  // Read template once
  const templateBuffer = await FileStorage.readFile('templates', template_filename);
  if (!templateBuffer) {
    return NextResponse.json({ error: 'Template file not found' }, { status: 404 });
  }

  const templateContent = templateBuffer.toString('utf-8');
  const templateJson = JSON.parse(templateContent);

  const results = [];

  for (const filename of files) {
    const result: any = {
      filename,
      status: 'failed',
      message: '',
      enhanced_path: '',
      json_path: ''
    };

    try {
      // Read DOCX file
      const docxBuffer = await FileStorage.readFile('docx', filename);
      if (!docxBuffer) {
        throw new Error('File not found');
      }

      // Convert to Markdown
      const markdown = await DocxConverter.toMarkdown(docxBuffer);

      // Enhance with AI
      const enhanced = await AIService.enhance(markdown, prompt, service as 'gemini' | 'openai', apiKey, model);

      // Save enhanced content if requested
      if (keep_enhanced) {
        const baseFilename = path.parse(filename).name;
        const enhancedFilename = `${baseFilename}_enhanced.md`;
        await FileStorage.writeFile('enhanced', enhancedFilename, Buffer.from(enhanced, 'utf-8'));
        result.enhanced_path = enhancedFilename;
      }

      // Parse variables
      const baseFilename = path.parse(filename).name;
      const variables = TemplateProcessor.parseVariables(enhanced, baseFilename);

      // Process template
      const generatedJson = TemplateProcessor.processTemplate(templateJson, variables);

      // Save generated JSON
      const jsonFilename = `${baseFilename}.json`;
      await FileStorage.writeFile('generated', jsonFilename, Buffer.from(generatedJson, 'utf-8'));
      result.json_path = jsonFilename;

      result.status = 'success';
      result.message = 'Successfully processed';
    } catch (error: any) {
      result.message = error.message || 'Processing failed';
    }

    results.push(result);
  }

  return NextResponse.json({ success: true, results });
}
