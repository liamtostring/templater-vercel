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

  const FileSection = ({ title, type, files: fileList }: any) => (
    <div className="card">
      <h4 className="text-xl font-bold mb-4">{title}</h4>
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
        <FileSection title="📄 DOCX Files" type="docx" files={files.docx} />
        <FileSection title="📋 JSON Templates" type="template" files={files.template} />
        <FileSection title="📝 Enhanced Markdown" type="enhanced" files={files.enhanced} />
        <FileSection title="✅ Generated JSON" type="generated" files={files.generated} />
      </div>
    </div>
  );
}
