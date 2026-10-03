import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  glow?: 'cyan' | 'amber' | 'red' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
  glow = 'none',
}) => {
  const glowClasses = {
    none: 'border-command-800',
    cyan: 'border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
    amber: 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    red: 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
  };

  return (
    <div
      className={`bg-command-900/90 backdrop-blur-md rounded-xl border p-5 transition-all duration-200 ${glowClasses[glow]} ${className}`}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-command-800/80">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
                {title}
              </h3>
            )}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
