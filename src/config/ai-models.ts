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
  'gemini-2.5-pro-preview-06-05': 'Gemini 2.5 Pro Preview (Most Capable)',
  'gemini-2.5-flash-preview-05-20': 'Gemini 2.5 Flash Preview (Fast & Smart)',
  'gemini-2.0-flash': 'Gemini 2.0 Flash (Stable)',
  'gemini-2.0-flash-lite': 'Gemini 2.0 Flash Lite (Fastest)',
  'gemini-1.5-pro': 'Gemini 1.5 Pro (Legacy)',
  'gemini-1.5-flash': 'Gemini 1.5 Flash (Legacy)',
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
  'o3-mini': 'O3 Mini (Best Reasoning)',
  'o1': 'O1 (Advanced Reasoning)',
  'o1-mini': 'O1 Mini (Fast Reasoning)',
  'gpt-4.1': 'GPT-4.1 (Latest)',
  'gpt-4.1-mini': 'GPT-4.1 Mini (Fast & Cheap)',
  'gpt-4o': 'GPT-4o (Stable)',
  'gpt-4o-mini': 'GPT-4o Mini (Budget)',
  'gpt-4-turbo': 'GPT-4 Turbo (Legacy)',
};

/**
 * Default Models
 *
 * These are the models selected by default when users first configure the app.
 * Change these to your preferred defaults.
 */
export const DEFAULT_MODELS = {
  gemini: 'gemini-2.5-flash-preview-05-20',
  openai: 'gpt-4.1-mini',
  service: 'gemini' as 'gemini' | 'openai', // Default service to use
};

/**
 * Model Recommendations
 *
 * Helper text shown to users in the UI (optional, for future use)
 */
export const MODEL_RECOMMENDATIONS = {
  gemini: {
    fast: 'gemini-2.0-flash-lite',
    balanced: 'gemini-2.5-flash-preview-05-20',
    capable: 'gemini-2.5-pro-preview-06-05',
  },
  openai: {
    fast: 'gpt-4.1-mini',
    balanced: 'gpt-4.1',
    capable: 'o3-mini',
  },
};
