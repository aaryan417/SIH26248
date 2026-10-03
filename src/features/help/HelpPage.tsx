import React from 'react';
import { HelpCircle, BookOpen, Eye, Radio, Shield, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';

export const HelpPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-command-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 font-sans">
      <div className="border-b border-command-800 pb-4">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-xs font-mono border border-cyan-800 mb-2">
          <HelpCircle className="w-3.5 h-3.5" /> TRAINING MANUAL & OPERATIONAL GUIDE
        </div>
        <h1 className="text-3xl font-extrabold font-mono text-slate-100 uppercase tracking-wider">
          User Guide & Documentation
        </h1>
        <p className="text-xs text-slate-400">
          Learn how to operate the decision-making trainer during degraded communication exercises.
        </p>
      </div>

      <div className="space-y-6">
        <Card title="1. OVERVIEW & EXERCISE OBJECTIVES">
          <p className="text-xs text-slate-300 leading-relaxed">
            The Immersive Multi-Domain Decision-Making Trainer places trainees into tactical decision scenarios across Land, Air, Cyber, and EW domains. As electronic spectrum noise increases, telemetry messages may arrive delayed, dropped, or corrupted with conflicting information.
          </p>
        </Card>

        <Card title="2. INSTRUCTOR CONTROLS & DEGRADATION INJECTS">
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>State Injections:</strong> Instantly switch spectrum state between NORMAL, DEGRADED, SEVERELY DEGRADED, and DISCONNECTED blackout.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Manual Drop Next Message:</strong> Forces the next outgoing telemetry transmission to drop silently for training evaluation.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Conflicting Reports:</strong> Inject contradictory field reports to challenge trainee information validation.</span>
            </li>
          </ul>
        </Card>

        <Card title="3. TRAINEE 360° VR & GAZE SELECTION">
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Head Tracking & Mouse Drag:</strong> Look around the 360° video sphere using mobile gyroscope or desktop mouse drag.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Cardboard VR Mode:</strong> Toggle "Phone VR Mode" for dual split-eye rendering on mobile devices.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Reticle Gaze Selection:</strong> Dwell over interactive options for ~1.5–2 seconds to confirm selection without controllers.</span>
            </li>
          </ul>
        </Card>

        <Card title="4. AFTER ACTION REVIEW (AAR)">
          <p className="text-xs text-slate-300 leading-relaxed">
            Following exercise completion, review calculated metrics including response speed, information availability, rationale depth, and interactive chronological decision timelines. Export reports as structured JSON or print as PDF.
          </p>
        </Card>
      </div>
    </div>
  );
};
