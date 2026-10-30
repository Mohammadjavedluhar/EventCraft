import React from 'react';
import { Sparkles, Calendar, Bookmark, Printer, Bot, Settings, Plus, LayoutGrid, CheckSquare } from 'lucide-react';

export type AppView = 'planner' | 'current_plan' | 'new_plan';

interface HeaderProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  savedPlansCount: number;
  onOpenSavedPlans: () => void;
  onOpenAiAssistant: () => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  hasCurrentPlan: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  savedPlansCount,
  onOpenSavedPlans,
  onOpenAiAssistant,
  onOpenExport,
  onOpenSettings,
  hasCurrentPlan,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#090e1a]/95 backdrop-blur-md border-b border-slate-800/80 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: EventGenie Brand */}
        <button
          type="button"
          onClick={() => setActiveView('planner')}
          className="flex items-center gap-2 sm:gap-3 shrink-0 cursor-pointer group text-left focus:outline-hidden focus:ring-2 focus:ring-amber-400 rounded-xl"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-amber-700/5 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/10 group-hover:border-amber-400 transition-colors">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-sm sm:text-base font-bold tracking-tight text-white group-hover:text-amber-100 transition-colors">
                EventGenie
              </span>
              <span className="bg-amber-400 text-slate-950 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                AI
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-normal tracking-tight hidden sm:inline mt-0.5">
              Celebration Planner
            </span>
          </div>
        </button>

        {/* Center: Main View Navigation (Responsive & Scroll-Safe) */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
          
          {/* Celebration Planner (Screenshot 3 - Clean Two Column Split View) */}
          <button
            onClick={() => setActiveView('planner')}
            className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeView === 'planner'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:hidden">Planner</span>
            <span className="hidden sm:inline">Celebration Planner</span>
          </button>

          {/* Current Plan / Masterplan Analytics (Screenshot 1) */}
          <button
            onClick={() => {
              if (hasCurrentPlan) setActiveView('current_plan');
            }}
            disabled={!hasCurrentPlan}
            className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeView === 'current_plan'
                ? 'bg-[#1e2342] border border-indigo-500/60 text-indigo-200 shadow-sm shadow-indigo-500/10'
                : hasCurrentPlan
                ? 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
                : 'bg-slate-900/30 border border-slate-850 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:hidden">Matrix</span>
            <span className="hidden sm:inline">Masterplan Matrix</span>
          </button>

          {/* + New Plan (Screenshot 2) */}
          <button
            onClick={() => setActiveView('new_plan')}
            className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeView === 'new_plan'
                ? 'bg-amber-500/10 border border-amber-400/80 text-amber-300 shadow-sm shadow-amber-500/10'
                : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">New Plan</span>
          </button>

          {/* Saved [X] button */}
          <button
            onClick={onOpenSavedPlans}
            className="px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 flex items-center gap-1 sm:gap-1.5 transition-colors shrink-0 cursor-pointer"
            title="View saved event plans"
          >
            <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Saved</span>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/30">
              {savedPlansCount}
            </span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Export Dossier */}
          <button
            onClick={onOpenExport}
            disabled={!hasCurrentPlan}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
              hasCurrentPlan
                ? 'bg-slate-900/80 border-slate-700/80 text-slate-200 hover:text-white hover:border-slate-600'
                : 'bg-slate-900/30 border-slate-850 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Export</span>
          </button>

          {/* AI Assistant - Solid Amber Button */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-bold rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-sm shadow-amber-500/20 cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-slate-950" />
            <span className="hidden sm:inline">AI Assistant</span>
            <span className="sm:hidden text-[11px]">AI</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            title="Engine Settings & Safeguards"
            aria-label="Engine Settings"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
