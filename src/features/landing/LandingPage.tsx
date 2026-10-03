import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Radio,
  Eye,
  Users,
  BarChart3,
  Cpu,
  Play,
  ArrowRight,
  WifiOff,
  Layers,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSessionStore } from '../../store/useSessionStore';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setRole } = useAuthStore();
  const { initializeDemoMode } = useSessionStore();

  const handleStartInstructor = () => {
    setRole('INSTRUCTOR');
    navigate('/scenarios');
  };

  const handleStartTrainee = () => {
    setRole('TRAINEE');
    navigate('/role-selection');
  };

  const handleLaunchDemo = async () => {
    const session = await initializeDemoMode();
    navigate(`/instructor/session/${session.id}`);
  };

  return (
    <div className="min-h-screen bg-command-950 text-slate-100 flex flex-col font-sans">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden border-b border-command-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.08),transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-mono font-medium tracking-wide">
              <ShieldAlert className="w-3.5 h-3.5" />
              SIH 2026 PROBLEM STATEMENT SIH26248 — MINISTRY OF DEFENCE
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
              Immersive Multi-Domain <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                Decision-Making Trainer
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
              Decision superiority under degraded communications. Train commanders to assess, adapt, and decide when spectrum noise, latency, and contradictory reports disrupt situational awareness.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={handleLaunchDemo}
                className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>LAUNCH DEMO MODE</span>
              </button>

              <button
                onClick={handleStartInstructor}
                className="flex items-center gap-2 bg-command-800 hover:bg-command-700 text-cyan-400 font-mono font-semibold text-sm px-5 py-3.5 rounded-xl border border-cyan-500/30 transition-all"
              >
                <Radio className="w-4 h-4" />
                <span>Instructor Command Center</span>
              </button>

              <button
                onClick={handleStartTrainee}
                className="flex items-center gap-2 bg-command-900 hover:bg-command-850 text-slate-200 font-mono font-semibold text-sm px-5 py-3.5 rounded-xl border border-command-700 transition-all"
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Trainee Immersive VR</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-command-950/60 border-b border-command-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold font-mono tracking-wide text-slate-100 uppercase">
              Core Capabilities & Architecture
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
              Engineered specifically for realistic tactical decision-making exercises without fake sci-fi tropes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-command-900/80 border border-command-800 p-6 rounded-2xl backdrop-blur-sm hover:border-cyan-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400 mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-mono text-slate-100 mb-2">
                Multi-Domain Integration
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Simulates simultaneous operations across Land, Air, Cyber, and Electronic Warfare (EW) domains to test cross-domain situational awareness.
              </p>
            </div>

            <div className="bg-command-900/80 border border-command-800 p-6 rounded-2xl backdrop-blur-sm hover:border-amber-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400 mb-5">
                <WifiOff className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-mono text-slate-100 mb-2">
                Degraded Comms Simulation
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Client-side degradation engine models message delays, dropouts, RF signal attenuation, and controlled contradictory intelligence reports.
              </p>
            </div>

            <div className="bg-command-900/80 border border-command-800 p-6 rounded-2xl backdrop-blur-sm hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400 mb-5">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-mono text-slate-100 mb-2">
                Immersive 360° VR & Reticle Gaze
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                A-Frame / WebXR mission experience with 360° video sphere, mobile gyroscope head tracking, reticle gaze dwell interaction, and Cardboard VR support.
              </p>
            </div>

            <div className="bg-command-900/80 border border-command-800 p-6 rounded-2xl backdrop-blur-sm hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400 mb-5">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-mono text-slate-100 mb-2">
                Instructor Command Center
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Real-time exercise controls allowing instructors to manipulate network latency, drop specific messages, inject conflicting reports, and monitor trainees.
              </p>
            </div>

            <div className="bg-command-900/80 border border-command-800 p-6 rounded-2xl backdrop-blur-sm hover:border-blue-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-800/80 flex items-center justify-center text-blue-400 mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-mono text-slate-100 mb-2">
                Asymmetric Team Coordination
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Simulated multiplayer adapter models varying information states across team elements (Alpha-1, Alpha-2, Alpha-3) during spectrum disruption.
              </p>
            </div>

            <div className="bg-command-900/80 border border-command-800 p-6 rounded-2xl backdrop-blur-sm hover:border-cyan-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400 mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-mono text-slate-100 mb-2">
                After Action Review (AAR)
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Comprehensive analytics engine computing response times, delivery rates, rationale depth, and interactive chronological decision timelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Backend Architecture Section */}
      <section className="py-16 bg-command-900/40 border-b border-command-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-command-950/90 border border-cyan-500/30 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-bold font-mono text-slate-100">
                Backend-Ready Service Layer Architecture
              </h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              The application is engineered using clean interface contracts. Currently driven by in-memory mock adapters and deterministic simulation engines, it is plug-and-play ready for integration with:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-command-900 p-4 rounded-xl border border-command-800">
                <div className="text-cyan-400 font-bold mb-1">Django REST Framework</div>
                <div className="text-slate-400">PostgreSQL persistence for scenarios, sessions, decisions, and event logs.</div>
              </div>
              <div className="bg-command-900 p-4 rounded-xl border border-command-800">
                <div className="text-amber-400 font-bold mb-1">Django Channels + Redis</div>
                <div className="text-slate-400">WebSocket realtime subscriptions for multi-user synchronized exercise sessions.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl font-mono font-bold text-slate-200 mb-4">
            Ready to Begin Tactical Decision Simulation?
          </h3>
          <Link
            to="/scenarios"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold px-6 py-3 rounded-xl shadow-lg transition-all"
          >
            <span>EXPLORE SCENARIO LIBRARY</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
