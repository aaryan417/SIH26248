import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Eye, Shield, User, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Role } from '../../types';

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { setRole, updateUserCallsign, currentUser } = useAuthStore();
  const [selectedRoleState, setSelectedRoleState] = useState<Role>('INSTRUCTOR');
  const [callsign, setCallsign] = useState(currentUser?.callsign || 'CONTROL-1');
  const [unit, setUnit] = useState(currentUser?.unit || 'Defence Services Staff College');

  const handleProceed = () => {
    setRole(selectedRoleState);
    updateUserCallsign(callsign, unit);

    if (selectedRoleState === 'INSTRUCTOR') {
      navigate('/scenarios');
    } else {
      navigate('/trainee');
    }
  };

  return (
    <div className="min-h-screen bg-command-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-command-900 border border-command-800 rounded-2xl p-8 shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 text-xs font-mono border border-cyan-800">
            <Shield className="w-3.5 h-3.5" /> ROLE SELECTION & IDENTIFICATION
          </div>
          <h1 className="text-2xl font-bold font-mono text-white uppercase tracking-wider">
            Select Exercise Role
          </h1>
          <p className="text-xs text-slate-400">
            Configure your access persona for the decision simulation session.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setSelectedRoleState('INSTRUCTOR');
              setCallsign('CONTROL-1');
            }}
            className={`p-5 rounded-xl border text-left transition-all ${
              selectedRoleState === 'INSTRUCTOR'
                ? 'bg-cyan-950/60 border-cyan-500 shadow-lg shadow-cyan-950'
                : 'bg-command-950 border-command-800 hover:border-command-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-900/50 flex items-center justify-center text-cyan-400">
                <Radio className="w-5 h-5" />
              </div>
              {selectedRoleState === 'INSTRUCTOR' && (
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </div>
            <h3 className="font-mono font-bold text-base text-slate-100 mb-1">INSTRUCTOR</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configure scenarios, manipulate network latency, drop messages, inject conflicts, and monitor trainee decision timelines.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRoleState('TRAINEE');
              setCallsign('ALPHA-1');
            }}
            className={`p-5 rounded-xl border text-left transition-all ${
              selectedRoleState === 'TRAINEE'
                ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-950'
                : 'bg-command-950 border-command-800 hover:border-command-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-900/50 flex items-center justify-center text-emerald-400">
                <Eye className="w-5 h-5" />
              </div>
              {selectedRoleState === 'TRAINEE' && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
            <h3 className="font-mono font-bold text-base text-slate-100 mb-1">TRAINEE</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receive live mission briefs, enter 360° VR mission mode, receive degraded telemetry, and submit tactical decisions.
            </p>
          </button>
        </div>

        {/* Callsign & Unit inputs */}
        <div className="space-y-4 pt-2 border-t border-command-800">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
              Callsign / Designation
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                className="w-full bg-command-950 border border-command-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                placeholder="e.g. CONTROL-1 or ALPHA-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
              Unit / Organization
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-command-950 border border-command-700 rounded-lg px-4 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              placeholder="e.g. Defence Services Staff College"
            />
          </div>
        </div>

        <button
          onClick={handleProceed}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
        >
          <span>ENTER AS {selectedRoleState}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
