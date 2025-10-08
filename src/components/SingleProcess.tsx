'use client';

import { useState, useEffect } from 'react';
import { handle401Error, authFetch } from '@/lib/client-auth';

export default function SingleProcess() {
  const [files, setFiles] = useState<any>({ docx: [], template: [] });
  const [settings, setSettings] = useState<any>({});
  const [prompts, setPrompts] = useState<any>({});
  const [formData, setFormData] = useState({
    docx_filename: '',
    template_filename: '',
    service: 'gemini',
    gemini_model: '',
    openai_model: '',
    prompt_id: 'prompt_default',
    keep_enhanced: true
  });
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadFiles();
    loadSettings();
    loadPrompts();
  }, []);

  const loadFiles = async () => {
    console.log('📂 Loading files list...');
    const res = await fetch('/api/files');
    const data = await res.json();
    console.log('📊 Files data received:', data);
    console.log('   Storage type:', data.storage);
    console.log('   DOCX files:', data.files?.docx?.length || 0);
    console.log('   Template files:', data.files?.template?.length || 0);
    setFiles(data.files || {});
  };

  const loadSettings = async () => {
    const res = await fetch('/api/settings?action=get_api_keys');
    const data = await res.json();
    setSettings(data);
    setFormData(prev => ({
      ...prev,
      service: data.default_service || 'gemini',
      gemini_model: data.default_gemini_model || 'gemini-1.5-flash-latest',
      openai_model: data.default_openai_model || 'gpt-4o-mini'
    }));
  };

  const loadPrompts = async () => {
    const res = await fetch('/api/settings?action=get_prompts');
    const data = await res.json();
    setPrompts(data.prompts || {});
  };

  const handleUpload = async (e: React.FormEvent, type: 'docx' | 'template') => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) return;

    const formDataToSend = new FormData();
    formDataToSend.append('file', file);
    formDataToSend.append('type', type);

    try {
      console.log(`📤 Uploading ${type} file:`, file.name);

      const res = await authFetch('/api/upload', {
        method: 'POST',
        body: formDataToSend
      });

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Upload successful:', data);
        console.log('   Storage:', data.storage);
        console.log('   Filename:', data.filename);
        if (data.url) console.log('   URL:', data.url);
        alert('File uploaded successfully!');
        loadFiles();
        form.reset();
      } else {
        const data = await res.json();
        console.error('❌ Upload failed:', data);
        alert(data.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      if (error.message !== 'Unauthorized - session expired') {
        alert('Upload failed: ' + error.message);
      }
    }
  };

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setResult(null);

    try {
      const prompt = prompts[formData.prompt_id]?.content || '';
      const model = formData.service === 'gemini' ? formData.gemini_model : formData.openai_model;

      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process_single',
          ...formData,
          model,
          prompt
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResult(data);
      } else {
        alert(data.error || 'Processing failed');
      }
    } catch (error) {
      alert('Processing failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Upload DOCX */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Upload DOCX File</h3>
          <form onSubmit={(e) => handleUpload(e, 'docx')} className="mb-4">
            <input type="file" accept=".docx" className="input-field mb-2" required />
            <button type="submit" className="btn-primary">Upload DOCX</button>
          </form>
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Available DOCX Files:</h4>
            {files.docx?.length > 0 ? (
              files.docx.map((file: any) => (
                <div key={file.name} className="file-item">
                  <span>{file.name}</span>
                  <span className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No files uploaded yet</p>
            )}
          </div>
        </div>

        {/* Upload Template */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Upload JSON Template</h3>
          <form onSubmit={(e) => handleUpload(e, 'template')} className="mb-4">
            <input type="file" accept=".json" className="input-field mb-2" required />
            <button type="submit" className="btn-primary">Upload Template</button>
          </form>
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Available Templates:</h4>
            {files.template?.length > 0 ? (
              files.template.map((file: any) => (
                <div key={file.name} className="file-item">
                  <span>{file.name}</span>
                  <span className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No templates uploaded yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Process Form */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Process Single File</h3>
        <form onSubmit={handleProcess}>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-medium mb-2">Select DOCX File</label>
              <select
                value={formData.docx_filename}
                onChange={(e) => setFormData({ ...formData, docx_filename: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Choose...</option>
                {files.docx?.map((file: any) => (
                  <option key={file.name} value={file.name}>{file.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">Select JSON Template</label>
              <select
                value={formData.template_filename}
                onChange={(e) => setFormData({ ...formData, template_filename: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Choose...</option>
                {files.template?.map((file: any) => (
                  <option key={file.name} value={file.name}>{file.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">AI Service</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="input-field"
              >
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">
                {formData.service === 'gemini' ? 'Gemini Model' : 'OpenAI Model'}
              </label>
              {formData.service === 'gemini' ? (
                <select
                  value={formData.gemini_model}
                  onChange={(e) => setFormData({ ...formData, gemini_model: e.target.value })}
                  className="input-field"
                >
                  {Object.entries(settings.gemini_models || {}).map(([value, label]: any) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              ) : (
                <select
                  value={formData.openai_model}
                  onChange={(e) => setFormData({ ...formData, openai_model: e.target.value })}
                  className="input-field"
                >
                  {Object.entries(settings.openai_models || {}).map(([value, label]: any) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block font-medium mb-2">Prompt</label>
              <select
                value={formData.prompt_id}
                onChange={(e) => setFormData({ ...formData, prompt_id: e.target.value })}
                className="input-field"
              >
                {Object.entries(prompts).map(([id, prompt]: any) => (
                  <option key={id} value={id}>{prompt.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.keep_enhanced}
                  onChange={(e) => setFormData({ ...formData, keep_enhanced: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>Save enhanced markdown</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="btn-primary px-8 py-3 text-lg disabled:opacity-50"
          >
            {processing ? 'Processing...' : '▶️ Process File'}
          </button>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="card mt-6">
          <h3 className="text-xl font-bold mb-4 text-green-600">✅ Processing Complete!</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold mb-2">Generated JSON</h4>
              <a
                href={`/uploads/generated/${result.json_path}`}
                download
                className="btn-primary inline-block"
              >
                ⬇️ Download JSON
              </a>
            </div>
            {result.enhanced_path && (
              <div>
                <h4 className="font-semibold mb-2">Enhanced Markdown</h4>
                <a
                  href={`/uploads/enhanced/${result.enhanced_path}`}
                  download
                  className="btn-primary inline-block"
                >
                  ⬇️ Download Markdown
                </a>
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Extracted Variables</h4>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-64 text-sm">
              {JSON.stringify(result.variables, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
