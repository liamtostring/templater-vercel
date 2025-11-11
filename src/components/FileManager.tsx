'use client';

import { useState, useEffect } from 'react';

export default function FileManager() {
  const [files, setFiles] = useState<any>({
    docx: [],
    template: [],
    enhanced: [],
    generated: []
  });

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    console.log('📂 [FileManager] Loading files...');
    const res = await fetch('/api/files');
    const data = await res.json();
    console.log('📊 [FileManager] Files received:', data);
    console.log('   Storage type:', data.storage);
    console.log('   Files:', data.files);
    setFiles(data.files || {});
  };

  const handleDelete = async (type: string, filename: string) => {
    if (!confirm(`Delete ${filename}?`)) return;

    const res = await fetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', type, filename })
    });

    if (res.ok) {
      loadFiles();
    } else {
      alert('Failed to delete file');
    }
  };

  const handleDeleteAll = async (type: string, typeName: string) => {
    const fileCount = files[type]?.length || 0;

    if (fileCount === 0) {
      alert('No files to delete');
      return;
    }

    if (!confirm(`⚠️ WARNING: Delete ALL ${fileCount} ${typeName} file(s)?\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_all', type })
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✅ Successfully deleted ${data.count} file(s)`);
        loadFiles();
      } else {
        const data = await res.json();
        alert(`Failed to delete files: ${data.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDownloadAll = async (type: string) => {
    try {
      const response = await fetch(`/api/download-all?type=${type}`);
      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Create blob from response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_files.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      alert(`Failed to download: ${error.message}`);
    }
  };

  const FileSection = ({ title, type, files: fileList, showBulkDelete = false, showDownloadAll = false, typeName = '' }: any) => (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-bold">{title}</h4>
        <div className="flex gap-2">
          {showDownloadAll && fileList && fileList.length > 0 && (
            <button
              onClick={() => handleDownloadAll(type)}
              className="btn-primary text-sm"
            >
              📦 Download All ({fileList.length})
            </button>
          )}
          {showBulkDelete && fileList && fileList.length > 0 && (
            <button
              onClick={() => handleDeleteAll(type, typeName)}
              className="btn-danger text-sm"
            >
              🗑️ Delete All ({fileList.length})
            </button>
          )}
        </div>
      </div>
      {fileList && fileList.length > 0 ? (
        <div className="space-y-2">
          {fileList.map((file: any) => (
            <div key={file.name} className="file-item">
              <div className="flex-1">
                <div className="font-medium">{file.name}</div>
                <div className="text-sm text-gray-500">
                  {file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Unknown size'}
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/api/download?type=${type}&filename=${encodeURIComponent(file.name)}`}
                  download={file.name}
                  className="btn-primary text-sm"
                >
                  ⬇️ Download
                </a>
                <button
                  onClick={() => handleDelete(type, file.name)}
                  className="btn-danger text-sm"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No files</p>
      )}
    </div>
  );

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">File Manager</h3>
      <p className="text-gray-600 mb-6">View and manage all uploaded and generated files.</p>

      <div className="grid md:grid-cols-2 gap-6">
        <FileSection
          title="📄 DOCX Files"
          type="docx"
          files={files.docx}
          showBulkDelete={true}
          typeName="DOCX"
        />
        <FileSection
          title="📋 JSON Templates"
          type="template"
          files={files.template}
          showBulkDelete={false}
        />
        <FileSection
          title="📝 Enhanced Markdown"
          type="enhanced"
          files={files.enhanced}
          showBulkDelete={true}
          typeName="Enhanced Markdown"
        />
        <FileSection
          title="✅ Generated JSON"
          type="generated"
          files={files.generated}
          showBulkDelete={true}
          showDownloadAll={true}
          typeName="Generated JSON"
        />
      </div>
    </div>
  );
}
