import React from 'react';
import { X, Bookmark, Trash2, Calendar, MapPin, Users, IndianRupee, ArrowRight } from 'lucide-react';
import { StructuredEventData } from '../types/event';
import { formatCurrency } from '../utils/currency';

interface SavedPlansDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedPlans: StructuredEventData[];
  currentPlanId: string;
  onSelectPlan: (plan: StructuredEventData) => void;
  onDeletePlan: (planId: string) => void;
}

export const SavedPlansDrawer: React.FC<SavedPlansDrawerProps> = ({
  isOpen,
  onClose,
  savedPlans,
  currentPlanId,
  onSelectPlan,
  onDeletePlan,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-[#0a101f] border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0e162a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Saved Masterplans</span>
              <span className="text-[11px] text-slate-400">
                {savedPlans.length} plans stored in memory
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of plans */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedPlans.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No saved masterplans yet. Create a plan using '+ New Plan' to auto-save.
            </div>
          ) : (
            savedPlans.map((plan) => {
              const isCurrent = plan.id === currentPlanId;
              return (
                <div
                  key={plan.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-amber-500/10 border-amber-500/70 shadow-sm shadow-amber-500/10 ring-1 ring-amber-500/30'
                      : 'bg-[#111a2e]/90 hover:bg-[#14203b] border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate block">
                          {plan.title}
                        </span>
                        {isCurrent && (
                          <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-amber-400 font-medium block capitalize">
                        {plan.eventType.replace('_', ' ')}
                      </span>
                    </div>

                    {savedPlans.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePlan(plan.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                        title="Delete plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 py-1.5 my-1.5 border-y border-slate-800/80">
                    <div className="flex items-center gap-1 truncate">
                      <Users className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{plan.guestCount.expected} Guests</span>
                    </div>
                    <div className="flex items-center gap-1 truncate text-amber-300 font-semibold">
                      <IndianRupee className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{formatCurrency(plan.budget.totalBudgetAmount || 0, plan.budget.currency)}</span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{plan.cityAndLocation}</span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{plan.targetEventDate}</span>
                    </div>
                  </div>

                  {!isCurrent && (
                    <button
                      onClick={() => {
                        onSelectPlan(plan);
                        onClose();
                      }}
                      className="w-full mt-1 py-1.5 text-xs font-semibold text-center text-amber-300 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Load Masterplan</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
