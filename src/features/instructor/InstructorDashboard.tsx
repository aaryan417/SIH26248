import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  Wifi,
  WifiOff,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useScenarioEngine } from '../../hooks/useScenarioEngine';
import { Card } from '../../components/common/Card';
import { CommStatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { DegradationState } from '../../types';

export const InstructorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    session,
    commStatus,
    eventLogs,
    start,
    pause,
    reset,
    end,
    setDegradationState,
    setArtificialDelay,
    setMessageLossRate,
    dropNextMessage,
    injectConflict,
  } = useScenarioEngine();

  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [conflictSender, setConflictSender] = useState('FORWARD-OBSERVER-2');
  const [conflictSubject, setConflictSubject] = useState('Axis Blue Clearance Status');
  const [conflictContent, setConflictContent] = useState(
    'Updated field report indicates Axis Blue is obstructed by debris. Exercise caution.'
  );

  if (!session) {
    return (
      <div className="min-h-screen bg-command-950 flex flex-col items-center justify-center text-slate-400 font-mono space-y-4">
        <div>No active exercise session found.</div>
        <button
          onClick={() => navigate('/scenarios')}
          className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold px-4 py-2 rounded-lg text-xs"
        >
          Select Scenario from Catalog
        </button>
      </div>
    );
  }

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `T+ 00:${pad(mins)}:${pad(secs)}`;
  };

  const handleInjectConflictSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    injectConflict(
      conflictSender,
      conflictSubject,
      conflictContent,
      'Route Assessment Alpha indicates clear path.'
    );
    setIsConflictModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-command-950 text-slate-100 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Exercise Control Header */}
      <div className="bg-command-900 border border-command-800 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-command-950 px-2.5 py-1 rounded border border-command-800">
              {session.codeName}
            </span>
            <span className="flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded bg-red-950 text-red-400 border border-red-800 font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              LIVE EXERCISE
            </span>
          </div>
          <h1 className="text-2xl font-extrabold font-mono text-slate-100 mt-2 uppercase tracking-wide">
            {session.scenarioName}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Instructor Tactical Control Center</p>
        </div>

        {/* Clock T+ and Primary Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-command-950 px-4 py-2.5 rounded-xl border border-command-800 flex items-center gap-3">
            <Clock className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                ELAPSED TIME
              </div>
              <div className="text-xl font-mono font-bold text-cyan-400 tracking-wider">
                {formatTime(session.currentScenarioTimeMs)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {session.state === 'RUNNING' ? (
              <button
                onClick={pause}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-black font-mono font-bold text-xs px-3.5 py-2.5 rounded-lg transition-all"
              >
                <Pause className="w-4 h-4 fill-black" /> PAUSE
              </button>
            ) : (
              <button
                onClick={start}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs px-3.5 py-2.5 rounded-lg transition-all shadow-md shadow-emerald-500/20"
              >
                <Play className="w-4 h-4 fill-black" /> START / RESUME
              </button>
            )}

            <button
              onClick={reset}
              className="flex items-center gap-1.5 bg-command-800 hover:bg-command-700 text-slate-200 font-mono font-semibold text-xs px-3.5 py-2.5 rounded-lg border border-command-700 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> RESET
            </button>

            <button
              onClick={() => {
                end();
                navigate(`/aar/${session.id}`);
              }}
              className="flex items-center gap-1.5 bg-red-950 hover:bg-red-900 text-red-400 font-mono font-bold text-xs px-3.5 py-2.5 rounded-lg border border-red-800 transition-all"
            >
              <Square className="w-4 h-4 fill-red-400" /> END EXERCISE
            </button>
          </div>
        </div>
      </div>

      {/* Grid Row 1: Comm Health & Degradation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="COMMUNICATION SPECTRUM HEALTH" glow="cyan">
          {commStatus && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-command-800">
                <span className="text-xs font-mono text-slate-400">STATE:</span>
                <CommStatusBadge state={commStatus.state} />
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">RF Signal Strength</span>
                    <span className="text-cyan-400 font-bold">{commStatus.signalStrength}%</span>
                  </div>
                  <div className="w-full bg-command-950 h-2 rounded-full overflow-hidden border border-command-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        commStatus.signalStrength < 30
                          ? 'bg-red-500'
                          : commStatus.signalStrength < 65
                          ? 'bg-amber-500'
                          : 'bg-cyan-400'
                      }`}
                      style={{ width: `${commStatus.signalStrength}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">Network Health</span>
                    <span className="text-emerald-400 font-bold">{commStatus.networkHealth}%</span>
                  </div>
                  <div className="w-full bg-command-950 h-2 rounded-full overflow-hidden border border-command-800">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-300"
                      style={{ width: `${commStatus.networkHealth}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-command-950 p-3 rounded-lg border border-command-850">
                <div>
                  <div className="text-[10px] text-slate-400">ARTIFICIAL LATENCY</div>
                  <div className="text-sm font-bold text-amber-400">
                    {commStatus.artificialDelaySec}s
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">LOSS PROBABILITY</div>
                  <div className="text-sm font-bold text-red-400">
                    {Math.round(commStatus.messageLossRate * 100)}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">INFO CONFIDENCE</div>
                  <div className="text-sm font-bold text-cyan-400">
                    {commStatus.confidenceScore}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card title="INSTRUCTOR DEGRADATION INJECTS" glow="amber">
          <div className="space-y-4">
            <div>
              <div className="text-xs font-mono text-slate-400 mb-2 uppercase">
                Preset State Injections:
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    'NORMAL',
                    'DEGRADED',
                    'SEVERELY_DEGRADED',
                    'DISCONNECTED',
                    'RECOVERING',
                  ] as DegradationState[]
                ).map((st) => (
                  <button
                    key={st}
                    onClick={() => setDegradationState(st)}
                    className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                      commStatus?.state === st
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'bg-command-950 hover:bg-command-800 text-slate-300 border border-command-800'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 uppercase">
                  Delay Injection (Sec):
                </label>
                <div className="flex gap-1">
                  {[0, 15, 30].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setArtificialDelay(sec)}
                      className="flex-1 bg-command-950 hover:bg-command-800 text-slate-300 border border-command-800 rounded py-1 text-xs font-mono"
                    >
                      +{sec}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 uppercase">
                  Loss Rate Preset:
                </label>
                <div className="flex gap-1">
                  {[0, 0.3, 0.6].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setMessageLossRate(rate)}
                      className="flex-1 bg-command-950 hover:bg-command-800 text-slate-300 border border-command-800 rounded py-1 text-xs font-mono"
                    >
                      {Math.round(rate * 100)}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-command-800">
              <button
                onClick={dropNextMessage}
                className="flex items-center gap-1.5 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 rounded-lg px-3 py-2 text-xs font-mono font-bold"
              >
                <WifiOff className="w-3.5 h-3.5" /> DROP NEXT MSG
              </button>

              <button
                onClick={() => setIsConflictModalOpen(true)}
                className="flex items-center gap-1.5 bg-amber-950 hover:bg-amber-900 text-amber-400 border border-amber-800 rounded-lg px-3 py-2 text-xs font-mono font-bold"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> INJECT CONFLICTING REPORT
              </button>

              <button
                onClick={() => setDegradationState('NORMAL')}
                className="flex items-center gap-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 rounded-lg px-3 py-2 text-xs font-mono font-bold ml-auto"
              >
                <Wifi className="w-3.5 h-3.5" /> RESTORE COMMS
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Grid Row 2: Trainee Monitoring & Event Log Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="TRAINEE ELEMENT MONITORING">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-command-950 text-slate-400 uppercase border-b border-command-800">
                  <tr>
                    <th className="p-3">Trainee / Callsign</th>
                    <th className="p-3">Domain</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Signal</th>
                    <th className="p-3">Received / Missed</th>
                    <th className="p-3">Last Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-command-850">
                  {session.participants.map((p) => (
                    <tr key={p.id} className="hover:bg-command-850/50">
                      <td className="p-3 font-semibold text-slate-100">{p.callsign}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                          {p.assignedDomain}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.connectionStatus === 'CONNECTED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : p.connectionStatus === 'DEGRADED'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}
                        >
                          {p.connectionStatus}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 font-bold">{p.signalStrength}%</td>
                      <td className="p-3">
                        <span className="text-emerald-400">{p.messagesReceivedCount}</span> /{' '}
                        <span className="text-red-400">{p.messagesMissedCount}</span>
                      </td>
                      <td className="p-3 text-slate-400 truncate max-w-xs">{p.lastAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          <Card title="REAL-TIME EVENT STREAM" subtitle="Append-only session event log">
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {eventLogs.length === 0 ? (
                <div className="text-xs font-mono text-slate-500 py-8 text-center">
                  No events logged yet. Click Start Exercise to begin.
                </div>
              ) : (
                eventLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 bg-command-950 rounded-lg border border-command-850 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-cyan-400 font-bold">
                        {formatTime(log.scenarioTimeMs)}
                      </span>
                      <span className="text-slate-400 uppercase">{log.type}</span>
                    </div>
                    <div className="text-slate-300 text-[11px] truncate">
                      {JSON.stringify(log.payload)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        title="INJECT CONFLICTING TELEMETRY REPORT"
      >
        <form onSubmit={handleInjectConflictSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-slate-300 mb-1">Originating Sender:</label>
            <input
              type="text"
              value={conflictSender}
              onChange={(e) => setConflictSender(e.target.value)}
              className="w-full bg-command-950 border border-command-700 rounded p-2 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Subject Header:</label>
            <input
              type="text"
              value={conflictSubject}
              onChange={(e) => setConflictSubject(e.target.value)}
              className="w-full bg-command-950 border border-command-700 rounded p-2 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Conflicting Content:</label>
            <textarea
              rows={3}
              value={conflictContent}
              onChange={(e) => setConflictContent(e.target.value)}
              className="w-full bg-command-950 border border-command-700 rounded p-2 text-slate-100"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 rounded-lg text-xs"
          >
            DISPATCH CONFLICTING REPORT TO TRAINEES
          </button>
        </form>
      </Modal>
    </div>
  );
};
