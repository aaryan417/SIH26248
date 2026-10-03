import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Download,
  Printer,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import { sessionService } from '../../services/api/sessionService';
import { AARReport } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ScoringEngine } from '../../engine/scoringEngine';

export const AARPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<AARReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      sessionService
        .getAARReport(sessionId)
        .then((data) => setReport(data))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const handleExportJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AAR_Report_${report.codeName}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-command-950 flex items-center justify-center text-slate-400 font-mono text-sm">
        Compiling After Action Review Analytics...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-command-950 flex flex-col items-center justify-center text-slate-400 font-mono space-y-4">
        <div>No valid session report found for ID: {sessionId}</div>
        <button
          onClick={() => navigate('/scenarios')}
          className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold px-4 py-2 rounded-lg text-xs"
        >
          Return to Scenario Catalog
        </button>
      </div>
    );
  }

  const commChartData = ScoringEngine.buildChartData(report.timelineEvents);

  const msgBreakdownData = [
    { name: 'Delivered', count: report.metrics.messagesDelivered, fill: '#10b981' },
    { name: 'Delayed', count: report.metrics.messagesDelayed, fill: '#f59e0b' },
    { name: 'Dropped', count: report.metrics.messagesDropped, fill: '#ef4444' },
  ];

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-command-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 print:bg-white print:text-black">
      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-command-800 pb-6 print:hidden">
        <div>
          <button
            onClick={() => navigate('/scenarios')}
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Scenario Catalog
          </button>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-xs font-mono border border-cyan-800">
              <BarChart3 className="w-3.5 h-3.5" /> POST-EXERCISE EVALUATION
            </span>
          </div>
          <h1 className="text-3xl font-extrabold font-mono text-slate-100 uppercase tracking-wider mt-1">
            After Action Review (AAR)
          </h1>
          <p className="text-xs text-slate-400">
            Exercise Code: {report.codeName} • Scenario Duration: {formatTime(report.durationMs)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 bg-command-800 hover:bg-command-700 text-cyan-400 font-mono font-bold text-xs px-4 py-2.5 rounded-xl border border-cyan-500/30 transition-all"
          >
            <Download className="w-4 h-4" /> EXPORT JSON REPORT
          </button>

          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <Printer className="w-4 h-4" /> PRINT / PDF REPORT
          </button>
        </div>
      </div>

      {/* Metrics Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-xs font-mono text-slate-400 uppercase">AVG DECISION TIME</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {report.metrics.avgResponseTimeSec}s
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Calculated from decision logs</div>
        </Card>

        <Card className="text-center">
          <div className="text-xs font-mono text-slate-400 uppercase">COMM RELIABILITY</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {report.metrics.commReliabilityPercent}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Delivered / Total Generated</div>
        </Card>

        <Card className="text-center">
          <div className="text-xs font-mono text-slate-400 uppercase">INFO AVAILABILITY</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {report.metrics.infoAvailabilityPercent}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">At decision submission time</div>
        </Card>

        <Card className="text-center">
          <div className="text-xs font-mono text-slate-400 uppercase">DOMAIN SYNC SCORE</div>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
            {report.teamAnalytics.domainSyncScore} / 100
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Derived from asymmetric gap</div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="DYNAMIC SPECTRUM SIGNAL & LATENCY TIMELINE" glow="cyan">
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={commChartData}>
                <defs>
                  <linearGradient id="colorSignal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d131d', borderColor: '#1f2e46', color: '#f8fafc' }}
                />
                <Area
                  type="monotone"
                  dataKey="signal"
                  stroke="#06b6d4"
                  fillOpacity={1}
                  fill="url(#colorSignal)"
                  name="Signal Strength (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="MESSAGE DELIVERY STATUS BREAKDOWN">
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={msgBreakdownData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d131d', borderColor: '#1f2e46', color: '#f8fafc' }}
                />
                <Bar dataKey="count" name="Message Count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Evaluated Decisions Section */}
      <Card title="EVALUATED TRAINEE DECISIONS">
        {report.decisionsEvaluated.length === 0 ? (
          <div className="text-xs font-mono text-slate-500 py-6 text-center">
            No trainee decisions recorded during this session.
          </div>
        ) : (
          <div className="space-y-4">
            {report.decisionsEvaluated.map((item, idx) => (
              <div
                key={idx}
                className="bg-command-950 p-4 rounded-xl border border-command-800 space-y-3 font-mono text-xs"
              >
                <div className="flex items-center justify-between border-b border-command-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-400">{item.prompt.title}</span>
                    <Badge variant="cyan">{item.prompt.domain}</Badge>
                  </div>
                  <div className="text-slate-400">
                    Response Time:{' '}
                    <span className="text-amber-400 font-bold">{item.decision.responseTimeSec}s</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">
                      Selected Course of Action:
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {item.decision.selectedOptionId}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">
                      Information Awareness Rating:
                    </span>
                    <span className="text-cyan-400 font-bold">
                      {item.qualityAssessment.informationAwareness}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase mb-1">
                    Submitted Trainee Rationale:
                  </span>
                  <p className="text-slate-300 bg-command-900 p-2.5 rounded border border-command-850 font-sans italic">
                    "{item.decision.rationale.text}"
                  </p>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Key Insight: {item.qualityAssessment.keyInsight}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recorded Event Stream Timeline */}
      <Card title="RECORDED SESSION EVENT TIMELINE">
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {report.timelineEvents.map((evt) => (
            <div
              key={evt.id}
              className="flex items-start gap-4 p-3 bg-command-950 rounded-xl border border-command-850 text-xs font-mono"
            >
              <div className="text-cyan-400 font-bold shrink-0 min-w-[70px]">
                {formatTime(evt.scenarioTimeMs)}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{evt.type}</span>
                  <span className="text-[10px] text-slate-500">{evt.timestamp}</span>
                </div>
                <div className="text-slate-400 text-[11px] truncate">
                  {JSON.stringify(evt.payload)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
