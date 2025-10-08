'use client';

import { useState, useEffect } from 'react';

export default function BatchProcess() {
  const [files, setFiles] = useState<any>({ docx: [], template: [] });
  const [settings, setSettings] = useState<any>({});
  const [prompts, setPrompts] = useState<any>({});
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    template_filename: '',
    service: 'gemini',
    gemini_model: '',
    openai_model: '',
    prompt_id: 'prompt_default',
    batch_size: 2,
    keep_enhanced: true
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    loadFiles();
    loadSettings();
    loadPrompts();
  }, []);

  const loadFiles = async () => {
    const res = await fetch('/api/files');
    const data = await res.json();
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

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setProgress(0);
    setResults([]);

    const prompt = prompts[formData.prompt_id]?.content || '';
    const model = formData.service === 'gemini' ? formData.gemini_model : formData.openai_model;

    // Split into chunks
    const chunks = [];
    for (let i = 0; i < selectedFiles.length; i += formData.batch_size) {
      chunks.push(selectedFiles.slice(i, i + formData.batch_size));
    }

    const allResults = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      setProgress(Math.round((i / chunks.length) * 100));

      try {
        const res = await fetch('/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'process_batch_chunk',
            files: chunk,
            template_filename: formData.template_filename,
            service: formData.service,
            model,
            prompt,
            keep_enhanced: formData.keep_enhanced
          })
        });

        const data = await res.json();
        if (data.success) {
          allResults.push(...data.results);
        }
      } catch (error) {
        console.error('Chunk processing error:', error);
      }

      // Small delay between chunks
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setProgress(100);
    setResults(allResults);
    setProcessing(false);
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">Batch Process Multiple Files</h3>
      <p className="text-gray-600 mb-6">Process multiple DOCX files at once with chunked processing to avoid timeouts.</p>

      <form onSubmit={handleProcess}>
        <div className="grid md:grid-cols-2 gap-6">
          {/* File Selection */}
          <div className="card">
            <h4 className="font-bold mb-3">Select DOCX Files</h4>
            <div className="mb-3">
              <button
                type="button"
                onClick={() => setSelectedFiles(files.docx?.map((f: any) => f.name) || [])}
                className="btn-secondary mr-2"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setSelectedFiles([])}
                className="btn-secondary"
              >
                Deselect All
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {files.docx?.map((file: any) => (
                <label key={file.name} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles([...selectedFiles, file.name]);
                      } else {
                        setSelectedFiles(selectedFiles.filter(f => f !== file.name));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="flex-1">{file.name}</span>
                  <span className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                </label>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">JSON Template</label>
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
              <label className="block font-medium mb-2">Model</label>
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

            <div>
              <label className="block font-medium mb-2">Batch Size (files per chunk)</label>
              <select
                value={formData.batch_size}
                onChange={(e) => setFormData({ ...formData, batch_size: parseInt(e.target.value) })}
                className="input-field"
              >
                <option value={1}>1 file (safest, slowest)</option>
                <option value={2}>2 files (recommended)</option>
                <option value={3}>3 files</option>
                <option value={5}>5 files (fastest)</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">Smaller batches reduce timeout risk</p>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.keep_enhanced}
                onChange={(e) => setFormData({ ...formData, keep_enhanced: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Save enhanced markdown files</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={processing || selectedFiles.length === 0}
          className="btn-primary px-8 py-3 text-lg mt-6 disabled:opacity-50"
        >
          {processing ? 'Processing...' : `▶️ Process ${selectedFiles.length} Files`}
        </button>
      </form>

      {/* Progress */}
      {processing && (
        <div className="card mt-6">
          <h4 className="font-bold mb-3">Processing Progress</h4>
          <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
            <div
              className="bg-primary h-full flex items-center justify-center text-white font-bold transition-all"
              style={{ width: `${progress}%` }}
            >
              {progress}%
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="card mt-6">
          <h4 className="font-bold mb-3">Batch Results</h4>
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <strong>Complete!</strong> Successful: {results.filter(r => r.status === 'success').length} |
            Failed: {results.filter(r => r.status === 'failed').length}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">File</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Message</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2">{result.filename}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-sm ${result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="p-2 text-sm">{result.message}</td>
                    <td className="p-2">
                      {result.json_path && (
                        <a href={`/uploads/generated/${result.json_path}`} download className="text-primary hover:underline text-sm">
                          ⬇️ JSON
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
