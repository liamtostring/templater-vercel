'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SingleProcess from '@/components/SingleProcess';
import BatchProcess from '@/components/BatchProcess';
import PromptLibrary from '@/components/PromptLibrary';
import Settings from '@/components/Settings';
import FileManager from '@/components/FileManager';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('single');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check' })
        });

        const data = await res.json();

        if (!data.authenticated) {
          console.warn('🔒 Not authenticated - redirecting to login');
          router.push('/login');
        } else {
          console.log('✅ Authenticated');
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        router.push('/login');
      }
    };

    // Initial check
    checkAuth();

    // Periodic session check every 5 minutes
    const interval = setInterval(() => {
      console.log('🔄 Periodic session check...');
      checkAuth();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-16 h-16"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container-main mt-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-primary pb-6 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-primary">📄 Templater</h1>
            <p className="text-gray-600 mt-2">AI-Powered DOCX to JSON Template Processor</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary flex items-center gap-2"
          >
            <span>Logout</span>
            <span>→</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b">
          {[
            { id: 'single', label: '📄 Single Process', icon: '📄' },
            { id: 'batch', label: '📚 Batch Process', icon: '📚' },
            { id: 'prompts', label: '💡 Prompt Library', icon: '💡' },
            { id: 'settings', label: '⚙️ Settings', icon: '⚙️' },
            { id: 'files', label: '📁 File Manager', icon: '📁' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'tab-button-active' : 'tab-button-inactive'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'single' && <SingleProcess />}
          {activeTab === 'batch' && <BatchProcess />}
          {activeTab === 'prompts' && <PromptLibrary />}
          {activeTab === 'settings' && <Settings />}
          {activeTab === 'files' && <FileManager />}
        </div>
      </div>
    </div>
  );
}
