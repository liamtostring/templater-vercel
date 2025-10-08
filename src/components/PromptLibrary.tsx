'use client';

import { useState, useEffect } from 'react';

export default function PromptLibrary() {
  const [prompts, setPrompts] = useState<any>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ id: '', name: '', content: '' });

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    const res = await fetch('/api/settings?action=get_prompts');
    const data = await res.json();
    setPrompts(data.prompts || {});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_prompt',
        ...formData
      })
    });

    if (res.ok) {
      loadPrompts();
      setEditing(null);
      setFormData({ id: '', name: '', content: '' });
    } else {
      alert('Failed to save prompt');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this prompt?')) return;

    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_prompt', id })
    });

    if (res.ok) {
      loadPrompts();
    } else {
      alert('Failed to delete prompt');
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(prompts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prompts-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedPrompts = JSON.parse(text);

      if (!confirm(`Import ${Object.keys(importedPrompts).length} prompt(s)? This will merge with existing prompts.`)) {
        return;
      }

      // Save each imported prompt
      for (const [id, prompt] of Object.entries(importedPrompts) as [string, any][]) {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_prompt',
            id: prompt.id || id.replace('prompt_', ''),
            name: prompt.name,
            content: prompt.content
          })
        });
      }

      await loadPrompts();
      alert('Prompts imported successfully!');
      e.target.value = '';
    } catch (error) {
      alert('Failed to import prompts. Please check the file format.');
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">Prompt Library</h3>
      <p className="text-gray-600 mb-6">Manage your AI prompts for different use cases.</p>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => {
            setEditing('new');
            setFormData({ id: '', name: '', content: '' });
          }}
          className="btn-primary"
        >
          ➕ Add New Prompt
        </button>

        <button
          onClick={handleExport}
          className="btn-secondary"
          disabled={Object.keys(prompts).length === 0}
        >
          💾 Export All Prompts
        </button>

        <label className="btn-secondary cursor-pointer">
          📥 Import Prompts
          <input
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>

      {/* Prompt Form */}
      {editing && (
        <div className="card mb-6 bg-blue-50 border-blue-200">
          <h4 className="font-bold mb-4">{editing === 'new' ? 'Add New Prompt' : 'Edit Prompt'}</h4>
          <form onSubmit={handleSave}>
            <div className="mb-4">
              <label className="block font-medium mb-2">Prompt Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="e.g., SEO Content Optimizer"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-2">Prompt Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="input-field"
                rows={8}
                placeholder="Enter your prompt instructions..."
                required
              />
              <p className="text-sm text-gray-500 mt-1">This will be sent to the AI along with the document content.</p>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Save Prompt</button>
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setFormData({ id: '', name: '', content: '' });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Prompt List */}
      <div className="space-y-3">
        {Object.entries(prompts).map(([id, prompt]: any) => (
          <div key={id} className="prompt-card">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-bold text-lg">
                  {prompt.name}
                  {id === 'prompt_default' && (
                    <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded">Default</span>
                  )}
                </h4>
                <p className="text-gray-600 text-sm mt-1">
                  {prompt.content.substring(0, 200)}
                  {prompt.content.length > 200 && '...'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(id);
                    setFormData({ id, name: prompt.name, content: prompt.content });
                  }}
                  className="btn-secondary text-sm"
                >
                  ✏️ Edit
                </button>
                {id !== 'prompt_default' && (
                  <button
                    onClick={() => handleDelete(id)}
                    className="btn-danger text-sm"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
