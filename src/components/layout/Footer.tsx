import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-command-950 border-t border-command-900 text-slate-500 py-6 text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-500" />
          <span>
            SIH 2026 Problem Statement <strong className="text-slate-300">SIH26248</strong> — Ministry of Defence (MoD)
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-amber-500" />
            Client-Side Simulation Engine Active
          </span>
          <span className="text-slate-600">|</span>
          <span>Defence Services Staff College</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400">WebXR / Django-Ready Architecture</span>
        </div>
      </div>
    </footer>
  );
};
