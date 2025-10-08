/**
 * AI Models Configuration
 *
 * Centralized configuration for all AI model names and labels.
 * Update this file to add/remove models without touching the core code.
 */

/**
 * Google Gemini Models
 *
 * To add a new model:
 * 1. Add a new entry: 'model-name': 'Display Label'
 * 2. Test the model name works with your API key
 * 3. Save the file
 *
 * Model naming format: exact model ID from Google's API
 * Display format: User-friendly label shown in the UI
 */
export const GEMINI_MODELS = {
  'gemini-2.0-flash-exp': 'Gemini 2.0 Flash Experimental (Fastest)',
  'gemini-2.0-flash': 'Gemini 2.0 Flash (Latest & Recommended)',
  // Add more Gemini models here as they become available
  // Example:
  // 'gemini-3.0-pro': 'Gemini 3.0 Pro (Future)',
};

/**
 * OpenAI Models
 *
 * To add a new model:
 * 1. Add a new entry: 'model-name': 'Display Label'
 * 2. Make sure the model ID matches OpenAI's API
 * 3. Save the file
 *
 * Model naming format: exact model ID from OpenAI's API
 * Display format: User-friendly label shown in the UI
 */
export const OPENAI_MODELS = {
  'gpt-4o': 'GPT-4o (Most Capable)',
  'gpt-4o-mini': 'GPT-4o Mini (Fast & Cheap)',
  'gpt-4-turbo': 'GPT-4 Turbo',
  'gpt-4': 'GPT-4',
  'gpt-3.5-turbo': 'GPT-3.5 Turbo (Legacy)',
  // Add more OpenAI models here
  // Example:
  // 'gpt-5': 'GPT-5 (Future)',
};

/**
 * Default Models
 *
 * These are the models selected by default when users first configure the app.
 * Change these to your preferred defaults.
 */
export const DEFAULT_MODELS = {
  gemini: 'gemini-2.0-flash-exp',
  openai: 'gpt-4o-mini',
  service: 'gemini' as 'gemini' | 'openai', // Default service to use
};

/**
 * Model Recommendations
 *
 * Helper text shown to users in the UI (optional, for future use)
 */
export const MODEL_RECOMMENDATIONS = {
  gemini: {
    fast: 'gemini-2.0-flash-exp',
    balanced: 'gemini-2.0-flash',
  },
  openai: {
    fast: 'gpt-4o-mini',
    capable: 'gpt-4o',
  },
};
