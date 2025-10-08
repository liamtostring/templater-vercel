import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { GEMINI_MODELS, OPENAI_MODELS, DEFAULT_MODELS } from '@/config/ai-models';

// Re-export for compatibility
export { GEMINI_MODELS, OPENAI_MODELS, DEFAULT_MODELS };

export class AIService {
  /**
   * Enhance content using Google Gemini
   */
  static async enhanceWithGemini(
    content: string,
    prompt: string,
    apiKey: string,
    model: string = DEFAULT_MODELS.gemini
  ): Promise<string> {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModel = genAI.getGenerativeModel({ model });

      const fullPrompt = `${prompt}\n\nHere is the content to enhance:\n\n${content}`;

      const result = await geminiModel.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      throw new Error(`Gemini API error: ${error.message || error}`);
    }
  }

  /**
   * Enhance content using OpenAI
   */
  static async enhanceWithOpenAI(
    content: string,
    prompt: string,
    apiKey: string,
    model: string = DEFAULT_MODELS.openai
  ): Promise<string> {
    try {
      const openai = new OpenAI({ apiKey });

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content }
        ],
        temperature: 0.7,
        max_tokens: 4000
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error: any) {
      throw new Error(`OpenAI API error: ${error.message || error}`);
    }
  }

  /**
   * Enhance content using selected AI service
   */
  static async enhance(
    content: string,
    prompt: string,
    service: 'gemini' | 'openai',
    apiKey: string,
    model: string
  ): Promise<string> {
    if (service === 'gemini') {
      return this.enhanceWithGemini(content, prompt, apiKey, model);
    } else if (service === 'openai') {
      return this.enhanceWithOpenAI(content, prompt, apiKey, model);
    } else {
      throw new Error('Invalid AI service selected');
    }
  }
}

export default AIService;
