import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Radio,
  Users,
  BarChart3,
  BookOpen,
  Settings,
  HelpCircle,
  Play,
  Eye,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSessionStore } from '../../store/useSessionStore';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, selectedRole, setRole, logout } = useAuthStore();
  const { initializeDemoMode, currentSession } = useSessionStore();

  const handleLaunchDemo = async () => {
    try {
      const session = await initializeDemoMode();
      if (selectedRole === 'INSTRUCTOR') {
        navigate(`/instructor/session/${session.id}`);
      } else {
        navigate(`/mission/${session.id}`);
      }
    } catch (e) {
      console.error('Failed to launch demo:', e);
    }
  };

  const navLinks = [
    { path: '/scenarios', label: 'Scenarios', icon: BookOpen },
    { path: '/instructor', label: 'Instructor Cmd', icon: Radio, role: 'INSTRUCTOR' },
    { path: '/trainee', label: 'Trainee Hub', icon: Eye, role: 'TRAINEE' },
    {
      path: currentSession ? `/team/${currentSession.id}` : '/role-selection',
      label: 'Team Sync',
      icon: Users,
    },
    {
      path: currentSession ? `/aar/${currentSession.id}` : '/role-selection',
      label: 'AAR Report',
      icon: BarChart3,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-command-950/90 backdrop-blur-md border-b border-command-800 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-black font-bold shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold tracking-wider text-base text-slate-100">
                  SIH26248
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  MoD TRAINER
                </span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest hidden sm:block">
                Multi-Domain Decision Superiority
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.role && link.role !== selectedRole) return null;
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    isActive
                      ? 'bg-command-800 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-command-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLaunchDemo}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-bold text-xs px-3 py-1.5 rounded-lg shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
              title="Instantly launch Operation Silent Horizon Demo"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>DEMO MODE</span>
            </button>

            <div className="hidden lg:flex items-center bg-command-900 border border-command-800 rounded-lg p-0.5 text-xs font-mono">
              <button
                onClick={() => setRole('INSTRUCTOR')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedRole === 'INSTRUCTOR'
                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-700/50 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Instructor
              </button>
              <button
                onClick={() => setRole('TRAINEE')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedRole === 'TRAINEE'
                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-700/50 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Trainee
              </button>
            </div>

            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-command-800">
                <div className="text-right hidden xl:block">
                  <div className="text-xs font-mono font-semibold text-slate-200">
                    {currentUser.callsign}
                  </div>
                  <div className="text-[10px] text-slate-400">{currentUser.role}</div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-command-900 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            <Link
              to="/settings"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-command-900 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <Link
              to="/help"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-command-900 rounded-lg transition-colors"
              title="Help & Manual"
            >
              <HelpCircle className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
