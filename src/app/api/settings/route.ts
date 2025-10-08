import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth-middleware';
import Storage from '@/lib/storage';
import PromptLibrary from '@/lib/prompt-library';
import { GEMINI_MODELS, OPENAI_MODELS, DEFAULT_MODELS } from '@/config/ai-models';

export async function GET(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'get_api_keys') {
    return NextResponse.json({
      gemini_api_key: await Storage.getAsync('gemini_api_key', ''),
      openai_api_key: await Storage.getAsync('openai_api_key', ''),
      gemini_models: GEMINI_MODELS,
      openai_models: OPENAI_MODELS,
      default_gemini_model: await Storage.getAsync('default_gemini_model', DEFAULT_MODELS.gemini),
      default_openai_model: await Storage.getAsync('default_openai_model', DEFAULT_MODELS.openai),
      default_service: await Storage.getAsync('default_service', DEFAULT_MODELS.service)
    });
  }

  if (action === 'get_prompts') {
    const prompts = await PromptLibrary.getAllAsync();
    return NextResponse.json({ prompts });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'save_api_keys') {
      if (body.gemini_api_key !== undefined) {
        await Storage.setAsync('gemini_api_key', body.gemini_api_key);
      }
      if (body.openai_api_key !== undefined) {
        await Storage.setAsync('openai_api_key', body.openai_api_key);
      }
      if (body.default_gemini_model !== undefined) {
        await Storage.setAsync('default_gemini_model', body.default_gemini_model);
      }
      if (body.default_openai_model !== undefined) {
        await Storage.setAsync('default_openai_model', body.default_openai_model);
      }
      if (body.default_service !== undefined) {
        await Storage.setAsync('default_service', body.default_service);
      }

      return NextResponse.json({ success: true, message: 'Settings saved successfully' });
    }

    if (action === 'save_prompt') {
      const { name, content, id } = body;

      if (!name || !content) {
        return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
      }

      const promptId = id || PromptLibrary.createId(name);
      const promptData = {
        name,
        content,
        created: Date.now()
      };

      await PromptLibrary.saveAsync(promptId, promptData);
      return NextResponse.json({ success: true, message: 'Prompt saved successfully', id: promptId });
    }

    if (action === 'delete_prompt') {
      const { id } = body;

      if (!id) {
        return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
      }

      if (await PromptLibrary.deleteAsync(id)) {
        return NextResponse.json({ success: true, message: 'Prompt deleted successfully' });
      } else {
        return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
