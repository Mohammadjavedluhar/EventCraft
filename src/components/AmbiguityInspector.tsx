import React from 'react';
import { AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { AmbiguityResolution } from '../types/event';

interface AmbiguityInspectorProps {
  resolutions: AmbiguityResolution[];
}

export const AmbiguityInspector: React.FC<AmbiguityInspectorProps> = ({ resolutions }) => {
  if (!resolutions || resolutions.length === 0) {
    return (
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-200">
              Clean Input Validation
            </h4>
            <p className="text-xs text-neutral-400">
              All parameters specified cleanly without mathematical contradictions or missing structural values.
            </p>
          </div>
        </div>
        <div className="text-xs font-mono tabular-nums text-neutral-500 shrink-0">
          0 ambiguities detected
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/50 border border-amber-900/40 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400 shrink-0">
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-200">
              Ambiguity & Math Discrepancy Reconciliation
            </h4>
            <p className="text-xs text-neutral-400">
              Coordinator safe fallbacks applied to reconcile missing parameters or mathematical conflicts.
            </p>
          </div>
        </div>
        <div className="text-xs text-amber-400 font-mono tabular-nums font-medium shrink-0">
          {resolutions.length} {resolutions.length === 1 ? 'fallback applied' : 'fallbacks applied'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {resolutions.map((res, idx) => (
          <div
            key={idx}
            className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-3.5 space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-neutral-200">{res.field}</span>
              <span
                className={`font-mono uppercase text-[11px] px-1.5 py-0.5 rounded ${
                  res.severity === 'high'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                    : res.severity === 'medium'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {res.severity} severity
              </span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              <strong className="text-neutral-300 font-medium">Issue:</strong> {res.issue}
            </p>

            <div className="pt-1 border-t border-neutral-900 flex items-start gap-1.5 text-xs text-amber-300/90 leading-relaxed">
              <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
              <span>
                <strong className="text-amber-200 font-medium">Safe Fallback:</strong> {res.fallbackApplied}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
