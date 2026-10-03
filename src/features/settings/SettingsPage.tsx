import React, { useState } from 'react';
import { Settings, Save, Video, Check } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { useVRStore } from '../../store/useVRStore';
import { storage } from '../../utils/storage';

export const SettingsPage: React.FC = () => {
  const { videoUrl, setVideoUrl } = useVRStore();
  const [customVideo, setCustomVideo] = useState(videoUrl);
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1');
  const [wsUrl, setWsUrl] = useState(import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000');
  const [useMock, setUseMock] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setVideoUrl(customVideo);
    storage.set('custom_settings', { customVideo, apiUrl, wsUrl, useMock });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-command-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 font-sans">
      <div className="border-b border-command-800 pb-4">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-xs font-mono border border-cyan-800 mb-2">
          <Settings className="w-3.5 h-3.5" /> SYSTEM CONFIGURATION
        </div>
        <h1 className="text-3xl font-extrabold font-mono text-slate-100 uppercase tracking-wider">
          Trainer Settings
        </h1>
        <p className="text-xs text-slate-400">
          Configure video CDN assets, API backend adapters, and simulation parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card title="360° VR MEDIA ASSET SOURCE" glow="cyan">
          <div className="space-y-3 font-mono text-xs">
            <label className="block text-slate-300">
              Equirectangular 360 Video Source URL (Cloudflare R2 / AWS S3 / Local):
            </label>
            <div className="relative">
              <Video className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={customVideo}
                onChange={(e) => setCustomVideo(e.target.value)}
                className="w-full bg-command-950 border border-command-700 rounded-xl pl-9 pr-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Default points to local asset: <code className="text-cyan-400">/videos/training360.mp4</code>
            </p>
          </div>
        </Card>

        <Card title="FUTURE DJANGO BACKEND CONNECTOR API">
          <div className="space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between bg-command-950 p-3 rounded-xl border border-command-850">
              <div>
                <div className="font-bold text-slate-200">Use In-Memory Mock Adapter</div>
                <div className="text-[10px] text-slate-400">
                  Runs client-side simulation engine without backend requirements.
                </div>
              </div>
              <input
                type="checkbox"
                checked={useMock}
                onChange={(e) => setUseMock(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Django REST API Base URL:</label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full bg-command-950 border border-command-700 rounded-lg p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Django Channels WebSocket URL:</label>
                <input
                  type="text"
                  value={wsUrl}
                  onChange={(e) => setWsUrl(e.target.value)}
                  className="w-full bg-command-950 border border-command-700 rounded-lg p-2.5 text-slate-100"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          {savedSuccess && (
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950 px-3 py-1.5 rounded border border-emerald-800">
              <Check className="w-4 h-4" /> Settings Saved Successfully
            </div>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold text-xs px-6 py-3 rounded-xl shadow-lg transition-all ml-auto"
          >
            <Save className="w-4 h-4" /> SAVE CONFIGURATION
          </button>
        </div>
      </form>
    </div>
  );
};
