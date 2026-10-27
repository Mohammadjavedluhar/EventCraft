import React from 'react';
import { X, ShieldCheck, IndianRupee, PieChart, Sliders } from 'lucide-react';
import { BudgetBreakdown, BudgetCategory } from '../types/event';
import { formatCurrency } from '../utils/currency';

interface BudgetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: BudgetBreakdown;
  onUpdateCategoryPercentage: (categoryId: string, newPercentage: number) => void;
}

export const BudgetDetailsModal: React.FC<BudgetDetailsModalProps> = ({
  isOpen,
  onClose,
  budget,
  onUpdateCategoryPercentage,
}) => {
  if (!isOpen) return null;

  const totalAmount = budget.totalBudgetAmount || 0;
  const currency = budget.currency || 'INR';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#0a101f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#0e162a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Budget Capital Breakdown & Trade-Off Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Total Allocated Outlay: {formatCurrency(totalAmount, currency)}
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

        {/* Protection Banner */}
        <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 px-5 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Policy Enforced: 10.0% Contingency Safety Reserve is locked against overruns.</span>
          </div>
          <span className="font-bold tabular-nums">
            {formatCurrency(totalAmount * 0.1, currency)}
          </span>
        </div>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {budget.categories.map((cat) => {
            const isContingency = cat.isContingency;
            return (
              <div
                key={cat.id}
                className={`p-4 rounded-xl border transition-all ${
                  isContingency
                    ? 'bg-amber-500/5 border-amber-500/40'
                    : 'bg-[#111a2e] border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm font-bold text-white">{cat.name}</span>
                    {isContingency && (
                      <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">
                        Protected Buffer
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-400 tabular-nums">
                      {formatCurrency(cat.allocatedAmount || 0, currency)}
                    </span>
                    <span className="text-xs text-slate-400 block tabular-nums">
                      {cat.percentage}% of total
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                  {cat.description}
                </p>

                {/* Scope Notes */}
                {cat.scopeNotes && cat.scopeNotes.length > 0 && (
                  <div className="text-[11px] text-slate-400 flex flex-wrap gap-1.5 pt-1 border-t border-slate-800/80">
                    {cat.scopeNotes.map((note, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-800"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0e162a] flex items-center justify-between text-xs text-slate-400">
          <span>Deterministic allocation engine active</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
};
