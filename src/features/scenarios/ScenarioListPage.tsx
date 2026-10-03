import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, Users, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { scenarioService } from '../../services/api/scenarioService';
import { Scenario } from '../../types';
import { DomainBadge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { useSessionStore } from '../../store/useSessionStore';
import { useAuthStore } from '../../store/useAuthStore';

export const ScenarioListPage: React.FC = () => {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const { initializeSession } = useSessionStore();
  const { currentUser, selectedRole } = useAuthStore();

  useEffect(() => {
    scenarioService
      .getScenarios()
      .then((data) => setScenarios(data))
      .finally(() => setLoading(false));
  }, []);

  const handleLaunchScenario = async (scenario: Scenario) => {
    try {
      const session = await initializeSession(scenario, currentUser?.id || 'user-inst-1');
      if (selectedRole === 'INSTRUCTOR') {
        navigate(`/instructor/session/${session.id}`);
      } else {
        navigate(`/mission/${session.id}`);
      }
    } catch (e) {
      console.error('Failed to launch scenario:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-command-950 flex items-center justify-center text-slate-400 font-mono text-sm">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          Loading Fictional Scenario Catalog...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-command-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-command-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-xs font-mono border border-cyan-800 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> FICTIONAL DECISION EXERCISES
          </div>
          <h1 className="text-3xl font-extrabold font-mono tracking-wider text-slate-100 uppercase">
            Scenario Library
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Select a multi-domain operational scenario to initialize an exercise session with custom communication degradation profiles.
          </p>
        </div>
      </div>

      {/* Scenario Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario) => (
          <Card
            key={scenario.id}
            className="flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
            glow={scenario.id === 'scen-silent-horizon' ? 'cyan' : 'none'}
          >
            <div className="space-y-4">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-command-950 px-2 py-0.5 rounded border border-command-800">
                  {scenario.codeName}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    scenario.degradationLevel === 'EXTREME'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : scenario.degradationLevel === 'SEVERE'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  {scenario.degradationLevel} DEGRADATION
                </span>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-xl font-bold font-mono text-slate-100 group-hover:text-cyan-400 transition-colors">
                  {scenario.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {scenario.description}
                </p>
              </div>

              {/* Domain Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {scenario.domains.map((dom) => (
                  <DomainBadge key={dom} domain={dom} />
                ))}
              </div>

              {/* Metadata row */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-command-950/60 p-3 rounded-lg border border-command-800">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{scenario.durationMinutes} Minutes</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Max {scenario.maxParticipants} Trainees</span>
                </div>
              </div>

              {/* Learning Objectives */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-mono font-semibold uppercase text-slate-300">
                  Learning Objectives:
                </div>
                <ul className="space-y-1">
                  {scenario.learningObjectives.slice(0, 2).map((obj, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Launch Actions */}
            <div className="pt-6 border-t border-command-800/80 mt-6 flex items-center gap-2">
              <button
                onClick={() => handleLaunchScenario(scenario)}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold text-xs py-2.5 rounded-lg shadow-md transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>LAUNCH EXERCISE</span>
              </button>
              <button
                onClick={() => navigate(`/scenarios/${scenario.id}`)}
                className="px-3 py-2.5 bg-command-800 hover:bg-command-700 text-slate-300 rounded-lg text-xs font-mono transition-colors"
                title="View Scenario Details"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
