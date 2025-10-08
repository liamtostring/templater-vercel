'use client';

import { useState, useEffect } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState<any>({});
  const [formData, setFormData] = useState({
    gemini_api_key: '',
    openai_api_key: '',
    default_gemini_model: '',
    default_openai_model: '',
    default_service: 'gemini'
  });
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenAI, setShowOpenAI] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const res = await fetch('/api/settings?action=get_api_keys');
    const data = await res.json();
    setSettings(data);
    setFormData({
      gemini_api_key: data.gemini_api_key || '',
      openai_api_key: data.openai_api_key || '',
      default_gemini_model: data.default_gemini_model || '',
      default_openai_model: data.default_openai_model || '',
      default_service: data.default_service || 'gemini'
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_api_keys',
        ...formData
      })
    });

    if (res.ok) {
      alert('Settings saved successfully!');
      loadSettings();
    } else {
      alert('Failed to save settings');
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">API Settings</h3>
      <p className="text-gray-600 mb-6">Configure your AI service API keys and default models. Settings are saved to local storage.</p>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Gemini Settings */}
        <div className="card">
          <h4 className="text-xl font-bold mb-4 text-[#4285f4]">🔷 Google Gemini Settings</h4>
          <div className="mb-4">
            <label className="block font-medium mb-2">API Key</label>
            <div className="flex gap-2">
              <input
                type={showGemini ? 'text' : 'password'}
                value={formData.gemini_api_key}
                onChange={(e) => setFormData({ ...formData, gemini_api_key: e.target.value })}
                className="input-field flex-1"
                placeholder="Enter Gemini API key..."
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="btn-secondary"
              >
                {showGemini ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Get your API key from{' '}
              <a href="https://makersuite.google.com/app/apikey" target="_blank" className="text-primary hover:underline">
                Google AI Studio
              </a>
            </p>
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-2">Default Model</label>
            <select
              value={formData.default_gemini_model}
              onChange={(e) => setFormData({ ...formData, default_gemini_model: e.target.value })}
              className="input-field"
            >
              {Object.entries(settings.gemini_models || {}).map(([value, label]: any) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>

        {/* OpenAI Settings */}
        <div className="card">
          <h4 className="text-xl font-bold mb-4 text-[#10a37f]">💬 OpenAI Settings</h4>
          <div className="mb-4">
            <label className="block font-medium mb-2">API Key</label>
            <div className="flex gap-2">
              <input
                type={showOpenAI ? 'text' : 'password'}
                value={formData.openai_api_key}
                onChange={(e) => setFormData({ ...formData, openai_api_key: e.target.value })}
                className="input-field flex-1"
                placeholder="Enter OpenAI API key..."
              />
              <button
                type="button"
                onClick={() => setShowOpenAI(!showOpenAI)}
                className="btn-secondary"
              >
                {showOpenAI ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Get your API key from{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" className="text-primary hover:underline">
                OpenAI Platform
              </a>
            </p>
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-2">Default Model</label>
            <select
              value={formData.default_openai_model}
              onChange={(e) => setFormData({ ...formData, default_openai_model: e.target.value })}
              className="input-field"
            >
              {Object.entries(settings.openai_models || {}).map(([value, label]: any) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Default Service */}
      <div className="card mb-6">
        <h4 className="text-xl font-bold mb-4">⚙️ Default Service</h4>
        <div className="mb-4">
          <label className="block font-medium mb-2">Preferred AI Service</label>
          <select
            value={formData.default_service}
            onChange={(e) => setFormData({ ...formData, default_service: e.target.value })}
            className="input-field"
          >
            <option value="gemini">Google Gemini</option>
            <option value="openai">OpenAI</option>
          </select>
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary px-8 py-3 text-lg">
        💾 Save Settings
      </button>
    </div>
  );
}
