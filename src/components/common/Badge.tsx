import React from 'react';
import { DomainType, DegradationState } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'cyan' | 'amber' | 'emerald' | 'red' | 'purple' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs font-medium' : 'px-3 py-1 text-sm font-semibold';

  const variantClasses = {
    default: 'bg-command-800 text-slate-300 border border-command-700',
    cyan: 'bg-cyan-950/80 text-cyan-400 border border-cyan-700/50 shadow-sm shadow-cyan-950',
    amber: 'bg-amber-950/80 text-amber-400 border border-amber-700/50',
    emerald: 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/50',
    red: 'bg-red-950/80 text-red-400 border border-red-700/50',
    purple: 'bg-purple-950/80 text-purple-400 border border-purple-700/50',
    outline: 'border border-slate-700 text-slate-400 bg-transparent',
  };

  return (
    <span className={`inline-flex items-center rounded-md font-mono tracking-wide ${sizeClasses} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
};

export const DomainBadge: React.FC<{ domain: DomainType }> = ({ domain }) => {
  switch (domain) {
    case 'LAND':
      return <Badge variant="emerald">LAND</Badge>;
    case 'AIR':
      return <Badge variant="cyan">AIR</Badge>;
    case 'CYBER':
      return <Badge variant="purple">CYBER</Badge>;
    case 'ELECTRONIC_WARFARE':
      return <Badge variant="amber">EW SPECTRUM</Badge>;
  }
};

export const CommStatusBadge: React.FC<{ state: DegradationState }> = ({ state }) => {
  switch (state) {
    case 'NORMAL':
      return <Badge variant="emerald">100% OPERATIONAL</Badge>;
    case 'DEGRADED':
      return <Badge variant="amber">DEGRADED</Badge>;
    case 'SEVERELY_DEGRADED':
      return <Badge variant="red">SEVERE DEGRADATION</Badge>;
    case 'DISCONNECTED':
      return <Badge variant="red">BLACKOUT / DISCONNECTED</Badge>;
    case 'RECOVERING':
      return <Badge variant="cyan">RECOVERING</Badge>;
  }
};
