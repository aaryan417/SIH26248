import React, { useState, useEffect } from 'react';
import { Clock, AlertOctagon, Send, FileText, CheckCircle2 } from 'lucide-react';
import { DecisionOption, DecisionPrompt } from '../../types';
import { Badge } from '../../components/common/Badge';

interface DecisionModalProps {
  prompt: DecisionPrompt;
  onSubmit: (
    selectedOptionId: string,
    rationale: string,
    confidence: 'LOW' | 'MEDIUM' | 'HIGH'
  ) => void;
  isVRMode?: boolean;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  prompt,
  onSubmit,
  isVRMode = false,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(prompt.options[0]?.id || '');
  const [rationale, setRationale] = useState('');
  const [confidence, setConfidence] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [timeLeftSec, setTimeLeftSec] = useState(prompt.timeLimitSec || 45);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOptionId) return;
    onSubmit(selectedOptionId, rationale, confidence);
  };

  return (
    <div
      className={`${
        isVRMode
          ? 'bg-command-950/95 border-2 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)]'
          : 'bg-command-900 border border-command-700 shadow-2xl'
      } rounded-2xl p-6 max-w-2xl w-full text-slate-100 font-sans space-y-6 animate-fade-in`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-command-800">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
            DECISION REQUIRED
          </span>
          <Badge variant="cyan">{prompt.domain}</Badge>
        </div>

        {/* Time Limit */}
        <div className="flex items-center gap-2 bg-command-950 px-3 py-1 rounded-lg border border-command-800 font-mono text-xs">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400">TIME REMAINING:</span>
          <span
            className={`font-bold text-sm ${
              timeLeftSec < 15 ? 'text-red-400 animate-ping' : 'text-amber-400'
            }`}
          >
            {timeLeftSec}s
          </span>
        </div>
      </div>

      {/* Prompt Title & Context */}
      <div>
        <h2 className="text-xl font-bold font-mono text-white mb-2">{prompt.title}</h2>
        <div className="bg-command-950 p-4 rounded-xl border border-command-850 text-xs text-slate-300 leading-relaxed">
          {prompt.context}
        </div>
      </div>

      {/* Options List */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-mono text-slate-400 uppercase">
            Select Course of Action:
          </label>
          {prompt.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedOptionId(opt.id)}
              className={`w-full p-4 rounded-xl border text-left transition-all ${
                selectedOptionId === opt.id
                  ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md shadow-cyan-950'
                  : 'bg-command-950 border-command-800 text-slate-300 hover:border-command-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-sm text-cyan-300">{opt.label}</span>
                <Badge variant="outline">{opt.domainFocus}</Badge>
              </div>
              <p className="text-xs text-slate-300 mb-2">{opt.description}</p>
              <div className="text-[11px] font-mono text-amber-400/90 flex items-center gap-1">
                <span className="text-slate-400">RISK:</span> {opt.riskAssessment}
              </div>
            </button>
          ))}
        </div>

        {/* Rationale Input */}
        <div>
          <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase flex items-center justify-between">
            <span>Tactical Rationale (Required):</span>
            <span className="text-slate-500 text-[10px]">
              {rationale.length > 0 ? `${rationale.length} chars` : 'Min 10 chars'}
            </span>
          </label>
          <textarea
            rows={3}
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            required
            placeholder="Explain key factors, assumed risks, and verified vs unverified telemetry assumptions..."
            className="w-full bg-command-950 border border-command-700 rounded-xl p-3 text-xs text-slate-100 font-sans focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Confidence selection */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Confidence:</span>
            {(['LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setConfidence(lvl)}
                className={`px-2.5 py-1 rounded text-xs font-mono ${
                  confidence === lvl
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-command-950 text-slate-400 border border-command-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!selectedOptionId || rationale.length < 5}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 text-black font-mono font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-lg"
          >
            <Send className="w-4 h-4 fill-black" />
            <span>SUBMIT DECISION</span>
          </button>
        </div>
      </form>
    </div>
  );
};
