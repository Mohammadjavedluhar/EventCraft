import React, { useState } from 'react';
import { X, Check, Clock, Calendar, AlertCircle } from 'lucide-react';
import { MilestoneItem } from '../types/event';

interface FullChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestones: MilestoneItem[];
}

export const FullChecklistModal: React.FC<FullChecklistModalProps> = ({
  isOpen,
  onClose,
  milestones,
}) => {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleCheck = (id: string) => {
    setCompletedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const completedCount = Object.values(completedMap).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#0a101f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#0e162a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Complete Milestone Timeline & Deadlines
              </h3>
              <p className="text-xs text-slate-400">
                {completedCount} of {milestones.length} tasks marked complete
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 h-1.5">
          <div
            className="bg-amber-400 h-full transition-all duration-300"
            style={{ width: `${(completedCount / Math.max(1, milestones.length)) * 100}%` }}
          />
        </div>

        {/* Scrollable Milestone List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {milestones.map((milestone) => {
            const isDone = !!completedMap[milestone.id];
            return (
              <button
                type="button"
                key={milestone.id}
                onClick={() => toggleCheck(milestone.id)}
                className={`w-full p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-left ${
                  isDone
                    ? 'bg-slate-900/40 border-slate-850 opacity-60'
                    : 'bg-[#111a2e]/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isDone
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-amber-400/20 text-amber-400 border border-amber-400/60'
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <span
                      className={`text-xs font-bold block truncate ${
                        isDone ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {milestone.task}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {milestone.category} · {milestone.timing}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 text-right">
                  <span className="text-xs font-bold text-slate-300 tabular-nums">
                    {milestone.dateDisplay}
                  </span>
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      milestone.criticality === 'HIGH PRIORITY'
                        ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {milestone.criticality}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0e162a] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-amber-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Deadlines synchronized with target celebration date</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
