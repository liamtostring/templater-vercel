import Storage from './storage';

export interface Prompt {
  name: string;
  content: string;
  created: number;
}

/**
 * Prompt library manager
 */
export class PromptLibrary {
  /**
   * Get all prompts (async)
   */
  static async getAllAsync(): Promise<Record<string, Prompt>> {
    let prompts = await Storage.getAllAsync<Prompt>('prompt_');

    // Add default prompt if library is empty
    if (Object.keys(prompts).length === 0) {
      const defaultPrompt = this.getDefault();
      prompts['prompt_default'] = defaultPrompt;
      await Storage.setAsync('prompt_default', defaultPrompt);
      await Storage.addToIndex('prompt_', 'prompt_default');
    }

    return prompts;
  }

  /**
   * Get a specific prompt (async)
   */
  static async getAsync(id: string): Promise<Prompt | null> {
    return await Storage.getAsync<Prompt>(id, null);
  }

  /**
   * Save a prompt (async)
   */
  static async saveAsync(id: string, data: Prompt): Promise<boolean> {
    const success = await Storage.setAsync(id, data);
    if (success) {
      await Storage.addToIndex('prompt_', id);
    }
    return success;
  }

  /**
   * Delete a prompt (async)
   */
  static async deleteAsync(id: string): Promise<boolean> {
    // Don't allow deleting the default prompt
    if (id === 'prompt_default') {
      return false;
    }
    const success = await Storage.deleteAsync(id);
    if (success) {
      await Storage.removeFromIndex('prompt_', id);
    }
    return success;
  }


  /**
   * Get default prompt
   */
  static getDefault(): Prompt {
    return {
      name: 'Default Template Variables',
      content: 'Improve this content by making it more engaging, professional, and easier to read. Format your response with clear section headers and variables like hero_h1, hero_text, hero_cta, sec1_h2, sec1_text, sec1_cta, etc.',
      created: Date.now()
    };
  }

  /**
   * Create prompt ID from name
   */
  static createId(name: string): string {
    return 'prompt_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  }
}

export default PromptLibrary;
