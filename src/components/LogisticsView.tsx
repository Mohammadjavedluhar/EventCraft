import React, { useState } from 'react';
import { Clock, ShieldAlert, CheckSquare, Square, MapPin, UserCheck, AlertTriangle, Copy, Check } from 'lucide-react';
import { LogisticsPlan, TimelinePhase } from '../types/event';

interface LogisticsViewProps {
  logistics: LogisticsPlan;
}

export const LogisticsView: React.FC<LogisticsViewProps> = ({ logistics }) => {
  const [completedMilestones, setCompletedMilestones] = useState<Record<number, boolean>>({});
  const [copiedSchedule, setCopiedSchedule] = useState(false);

  const toggleMilestone = (idx: number) => {
    setCompletedMilestones((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCopySchedule = () => {
    const text = logistics.runOfShow
      .map(
        (p) =>
          `[${p.time}] ${p.title} (${p.duration})\nZone: ${p.zone} | Lead: ${p.logisticsLead}\nDetails: ${p.details}${
            p.contingencyTrigger ? `\nContingency: ${p.contingencyTrigger}` : ''
          }`
      )
      .join('\n\n');

    navigator.clipboard.writeText(`=== MASTER EVENT RUN OF SHOW ===\n\n${text}`);
    setCopiedSchedule(true);
    setTimeout(() => setCopiedSchedule(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div>
          <h3 className="text-base font-semibold text-white">
            Logistics Coordination & Operational Run of Show
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Synchronized load-in, run-of-show sequence, lead assignments, and contingency triggers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span>{logistics.runOfShow.length} Timeline Blocks</span>
          <span aria-hidden="true">·</span>
          <span>{logistics.riskMatrix.length} Risk Mitigation Protocols</span>
        </div>
      </div>

      {/* Run of Show Timeline */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-white">
              Master Run of Show (Minute-by-Minute Sequence)
            </h4>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
              Load-in 07:00 → Strike 19:30
            </span>
            <button
              type="button"
              onClick={handleCopySchedule}
              className="px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedSchedule ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-neutral-400" />
              )}
              <span>{copiedSchedule ? 'Copied Schedule' : 'Copy Schedule'}</span>
            </button>
          </div>
        </div>

        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-800">
          {logistics.runOfShow.map((phase, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-[1.85rem] top-1 w-3 h-3 rounded-full bg-neutral-950 border-2 border-amber-400 ring-4 ring-neutral-950" />

              <div className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-4 space-y-2 hover:border-neutral-700 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums font-bold text-amber-400 text-sm">
                      {phase.time}
                    </span>
                    <span className="text-neutral-500 font-mono">({phase.duration})</span>
                    <span className="text-neutral-200 font-semibold text-sm ml-1">
                      {phase.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-500" />
                      <span>{phase.zone}</span>
                    </div>
                    <span aria-hidden="true">·</span>
                    <div className="flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-neutral-500" />
                      <span>{phase.logisticsLead}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  {phase.details}
                </p>

                {phase.contingencyTrigger && (
                  <div className="pt-2 border-t border-neutral-900 flex items-start gap-1.5 text-xs text-amber-300/90">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
                    <span>
                      <strong className="text-amber-200 font-medium">Contingency Trigger:</strong> {phase.contingencyTrigger}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Milestones & Risk Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestone Checklist */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>Production Milestones Checklist</span>
            </h4>
            <span className="text-xs text-neutral-400 font-mono">
              {Object.values(completedMilestones).filter(Boolean).length} of {logistics.keyMilestones.length} Done
            </span>
          </div>

          <div className="space-y-2.5">
            {logistics.keyMilestones.map((m, idx) => {
              const isChecked = !!completedMilestones[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleMilestone(idx)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-start gap-3 ${
                    isChecked
                      ? 'bg-emerald-950/20 border-emerald-900/40 text-neutral-400'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-200'
                  }`}
                >
                  <button type="button" className="mt-0.5 text-neutral-400 focus:outline-none">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-500" />
                    )}
                  </button>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono font-bold text-amber-400">
                        {m.timing}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${
                          m.criticality === 'HIGH PRIORITY' || m.criticality === 'ESSENTIAL'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {m.criticality}
                      </span>
                    </div>
                    <p className={`text-xs ${isChecked ? 'line-through text-neutral-500' : 'text-neutral-300'}`}>
                      {m.task}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk & Contingency Protocols */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Operational Risk & Contingency Protocols</span>
            </h4>
            <span className="text-xs text-neutral-400">
              10% Reserve Backed
            </span>
          </div>

          <div className="space-y-3">
            {logistics.riskMatrix.map((item, idx) => (
              <div
                key={idx}
                className="bg-neutral-950/60 border border-neutral-800 rounded-lg p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-white">{item.risk}</span>
                  <span
                    className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${
                      item.impact === 'critical'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                    }`}
                  >
                    {item.impact} impact
                  </span>
                </div>

                <div className="text-xs text-neutral-400 space-y-1">
                  <div>
                    <strong className="text-neutral-300 font-medium">Mitigation: </strong>
                    {item.mitigationStrategy}
                  </div>
                  <div className="text-amber-300/90">
                    <strong className="text-amber-200 font-medium">Contingency Trigger: </strong>
                    {item.contingencyAction}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
