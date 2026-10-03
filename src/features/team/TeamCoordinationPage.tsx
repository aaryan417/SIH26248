import React from 'react';
import { Users, WifiOff, CheckCircle2, RefreshCw } from 'lucide-react';
import { useScenarioEngine } from '../../hooks/useScenarioEngine';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const TeamCoordinationPage: React.FC = () => {
  const { session, commStatus, activeMessages } = useScenarioEngine();

  if (!session) {
    return (
      <div className="min-h-screen bg-command-950 flex items-center justify-center text-slate-400 font-mono text-sm">
        No active exercise session found. Select a scenario to start.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-command-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="border-b border-command-800 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-xs font-mono border border-cyan-800 mb-2">
            <Users className="w-3.5 h-3.5" /> MULTI-ELEMENT TEAM SYNCHRONIZATION
          </div>
          <h1 className="text-3xl font-extrabold font-mono text-slate-100 uppercase tracking-wider">
            Team Coordination Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Asymmetric information distribution monitor across Alpha elements during electronic spectrum degradation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {session.participants.map((p) => (
          <Card
            key={p.id}
            title={p.callsign}
            subtitle={p.role}
            glow={p.connectionStatus === 'DISCONNECTED' ? 'red' : 'none'}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="cyan">{p.assignedDomain}</Badge>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    p.connectionStatus === 'CONNECTED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : p.connectionStatus === 'DEGRADED'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}
                >
                  {p.connectionStatus}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono bg-command-950 p-3 rounded-lg border border-command-850">
                <div className="flex justify-between">
                  <span className="text-slate-400">Signal Strength:</span>
                  <span className="text-cyan-400 font-bold">{p.signalStrength}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Messages Received:</span>
                  <span className="text-emerald-400 font-bold">{p.messagesReceivedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Messages Missed:</span>
                  <span className="text-red-400 font-bold">{p.messagesMissedCount}</span>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-300">
                <span className="text-slate-400 block text-[10px] uppercase mb-0.5">
                  Last Activity:
                </span>
                <span className="text-slate-200">{p.lastAction}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card title="ASYMMETRIC INFORMATION DISTRIBUTION MATRIX" glow="cyan">
        <p className="text-xs text-slate-400 mb-4">
          Demonstrates how degraded communications lead to different information states across operational elements.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-command-950 text-slate-400 uppercase border-b border-command-800">
              <tr>
                <th className="p-3">Telemetry / Report Header</th>
                <th className="p-3">Alpha-1 (Land)</th>
                <th className="p-3">Alpha-2 (Air)</th>
                <th className="p-3">Alpha-3 (Cyber/EW)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-command-850">
              {activeMessages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500">
                    No operational reports generated yet. Start scenario to view live asymmetric distribution.
                  </td>
                </tr>
              ) : (
                activeMessages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-command-850/40">
                    <td className="p-3 font-semibold text-slate-200">
                      <div>{msg.subject}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        From: {msg.sender}
                      </div>
                    </td>
                    <td className="p-3">
                      {msg.status === 'DELIVERED' ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                        </span>
                      ) : msg.status === 'DELAYED' ? (
                        <span className="text-amber-400 flex items-center gap-1 font-bold">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Delayed
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1 font-bold">
                          <WifiOff className="w-3.5 h-3.5" /> Dropped
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                      </span>
                    </td>
                    <td className="p-3">
                      {commStatus?.state === 'DISCONNECTED' ? (
                        <span className="text-red-400 flex items-center gap-1 font-bold">
                          <WifiOff className="w-3.5 h-3.5" /> Blackout
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
