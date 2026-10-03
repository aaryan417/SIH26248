import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Clock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { scenarioService } from '../../services/api/scenarioService';
import { Scenario } from '../../types';
import { DomainBadge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { useSessionStore } from '../../store/useSessionStore';
import { useAuthStore } from '../../store/useAuthStore';

export const ScenarioDetailPage: React.FC = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const { initializeSession } = useSessionStore();
  const { currentUser, selectedRole } = useAuthStore();

  useEffect(() => {
    if (scenarioId) {
      scenarioService
        .getScenario(scenarioId)
        .then((data) => setScenario(data))
        .catch(() => navigate('/scenarios'))
        .finally(() => setLoading(false));
    }
  }, [scenarioId, navigate]);

  const handleLaunch = async () => {
    if (!scenario) return;
    const session = await initializeSession(scenario, currentUser?.id || 'user-inst-1');
    if (selectedRole === 'INSTRUCTOR') {
      navigate(`/instructor/session/${session.id}`);
    } else {
      navigate(`/mission/${session.id}`);
    }
  };

  if (loading || !scenario) {
    return (
      <div className="min-h-screen bg-command-950 flex items-center justify-center text-slate-400 font-mono text-sm">
        Loading scenario specifications...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-command-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      <button
        onClick={() => navigate('/scenarios')}
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Scenario Catalog
      </button>

      <div className="bg-command-900 border border-command-800 rounded-2xl p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-command-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-cyan-400 bg-command-950 px-2 py-0.5 rounded border border-command-800">
                {scenario.codeName}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                {scenario.difficulty}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold font-mono text-slate-100 uppercase">
              {scenario.name}
            </h1>
          </div>

          <button
            onClick={handleLaunch}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold px-6 py-3 rounded-xl shadow-lg transition-all"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>START EXERCISE SESSION</span>
          </button>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed">{scenario.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <Card title="OPERATIONAL DOMAINS">
            <div className="flex flex-wrap gap-2">
              {scenario.domains.map((d) => (
                <DomainBadge key={d} domain={d} />
              ))}
            </div>
          </Card>

          <Card title="EXERCISE TIME">
            <div className="flex items-center gap-2 text-slate-200 font-mono text-lg font-bold">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>{scenario.durationMinutes} Minutes</span>
            </div>
          </Card>

          <Card title="DEGRADATION LEVEL">
            <div className="font-mono text-lg font-bold text-amber-400">
              {scenario.degradationLevel}
            </div>
          </Card>
        </div>

        <div className="space-y-3 pt-4 border-t border-command-800">
          <h3 className="text-base font-bold font-mono text-slate-200 uppercase">
            Learning Objectives & Training Focus
          </h3>
          <div className="space-y-2">
            {scenario.learningObjectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-3 bg-command-950/60 p-3 rounded-xl border border-command-800 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-command-800">
          <h3 className="text-base font-bold font-mono text-slate-200 uppercase">
            Scheduled Scenario Events ({scenario.events.length} Events)
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {scenario.events.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between bg-command-950 p-3 rounded-lg border border-command-850 text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400 font-bold">{evt.timestamp}</span>
                  <span className="text-slate-300 font-semibold">{evt.type}</span>
                </div>
                <span className="text-slate-400 text-[11px]">{evt.priority} PRIORITY</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
