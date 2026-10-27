import React from 'react';
import { X, Settings, ShieldCheck, Scale, Cpu, Users } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0a101f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#0e162a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Engine Architecture & Settings
              </h3>
              <p className="text-xs text-slate-400">
                EventGenie Deterministic Policy Safeguards
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

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Rule 1: Safety Margins */}
          <div className="p-3.5 rounded-xl bg-[#111a2e] border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Mandatory 10% Contingency Buffer</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-normal">
              Always active. Every budget breakdown allocates exactly 10.0% of capital to an untouched safety reserve to buffer unexpected last-minute RSVPs and logistical overages.
            </p>
          </div>

          {/* Rule 2: Zero Price Hallucination */}
          <div className="p-3.5 rounded-xl bg-[#111a2e] border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Percentage-Based Allocations</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-normal">
              Eliminates LLM vendor price hallucinations. All costs derive directly from user budget inputs multiplied by mathematically verified percentage distributions.
            </p>
          </div>

          {/* Rule 3: Guest-Driven Scaling */}
          <div className="p-3.5 rounded-xl bg-[#111a2e] border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Dynamic Guest Count Scaling</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-normal">
              As attendees increase, catering share expands (from 24% up to 34%), and venue sizing scales at 20–25 sq ft/guest to prevent bottlenecks.
            </p>
          </div>

          {/* Rule 4: Explicit Fallbacks */}
          <div className="p-3.5 rounded-xl bg-[#111a2e] border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>Logical Defaults & Fallbacks</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-normal">
              When guest counts are omitted in natural language briefs: Default to 100 guests for weddings, 30 guests for milestone celebrations, with explicit disclosure notice.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0e162a] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition-colors cursor-pointer text-xs"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
};
