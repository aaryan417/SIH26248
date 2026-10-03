import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useScenarioEngine } from '../../hooks/useScenarioEngine';
import { VRMissionView } from '../vr/VRMissionView';
import { Card } from '../../components/common/Card';
import { CommStatusBadge } from '../../components/common/Badge';
import { DecisionModal } from '../decisions/DecisionModal';

export const TraineeMissionPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    session,
    commStatus,
    activeMessages,
    pendingDecisions,
    submitDecision,
  } = useScenarioEngine();

  const [isVRFullscreen, setIsVRFullscreen] = useState(false);

  if (!session) {
    return (
      <div className="min-h-screen bg-command-950 flex flex-col items-center justify-center text-slate-400 font-mono space-y-4">
        <div>No active mission session found.</div>
        <button
          onClick={() => navigate('/scenarios')}
          className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold px-4 py-2 rounded-lg text-xs"
        >
          Select Exercise from Scenario Catalog
        </button>
      </div>
    );
  }

  const activePrompt = pendingDecisions[0];

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `T+ 00:${pad(mins)}:${pad(secs)}`;
  };

  return (
    <div className="min-h-screen bg-command-950 text-slate-100 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <div className="bg-command-900 border border-command-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-command-950 px-2.5 py-1 rounded border border-command-800">
              TRAINEE CALLSIGN: ALPHA-1
            </span>
            {commStatus && <CommStatusBadge state={commStatus.state} />}
          </div>
          <h1 className="text-2xl font-extrabold font-mono text-slate-100 uppercase tracking-wide">
            {session.scenarioName}
          </h1>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="bg-command-950 px-3.5 py-2 rounded-xl border border-command-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">T+ CLOCK:</span>
            <span className="font-bold text-cyan-400">
              {formatTime(session.currentScenarioTimeMs)}
            </span>
          </div>

          <button
            onClick={() => setIsVRFullscreen(!isVRFullscreen)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-mono font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <Eye className="w-4 h-4 fill-black" />
            <span>{isVRFullscreen ? 'EXIT VR WINDOW' : 'FULLSCREEN 360° VR'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            360° Immersive Mission Viewport
          </h2>
          <span className="text-xs font-mono text-slate-400">
            A-Frame WebXR • Gyro / Mouse Look Enabled
          </span>
        </div>

        <VRMissionView />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <Card title="RECEIVED TELEMETRY & RADIO FEEDS" glow="cyan">
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {activeMessages.length === 0 ? (
              <div className="text-xs font-mono text-slate-500 py-10 text-center">
                Awaiting incoming spectrum transmissions...
              </div>
            ) : (
              activeMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 transition-all ${
                    msg.isConflicting
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      : msg.status === 'DROPPED'
                      ? 'bg-red-950/30 border-red-800 text-red-300 opacity-60'
                      : 'bg-command-950 border-command-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-command-800/60 pb-1">
                    <span className="font-bold text-cyan-400">{msg.sender}</span>
                    <span className="text-[10px] text-slate-400">
                      CONFIDENCE: {msg.confidence}%
                    </span>
                  </div>

                  <div className="font-bold text-sm text-slate-100">{msg.subject}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{msg.content}</p>

                  {msg.isConflicting && (
                    <div className="text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800 inline-block mt-1">
                      ⚠️ CONFLICTING REPORT DETECTED
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        <div>
          {activePrompt ? (
            <DecisionModal
              prompt={activePrompt}
              onSubmit={(optId, rationale, conf) => {
                submitDecision(activePrompt.id, 'part-1', optId, rationale, conf);
              }}
            />
          ) : (
            <Card title="TACTICAL DECISION STATUS">
              <div className="text-center py-12 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold font-mono text-slate-200">
                  NO PENDING DECISION PROMPTS
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Continue monitoring 360° mission viewport and tactical telemetry feeds for scheduled updates.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
