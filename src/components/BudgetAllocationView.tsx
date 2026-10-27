import React, { useState } from 'react';
import { Shield, Info, DollarSign, PieChart, Sliders, CheckCircle, AlertTriangle, Users, SlidersHorizontal } from 'lucide-react';
import { BudgetBreakdown, BudgetCategory, GuestCapacityMetrics } from '../types/event';

interface BudgetAllocationViewProps {
  budget: BudgetBreakdown;
  expectedGuests: number;
  capacityMetrics?: GuestCapacityMetrics;
  onUpdateBudget?: (updatedBudget: BudgetBreakdown) => void;
  onGuestCountChange?: (newCount: number) => void;
}

export const BudgetAllocationView: React.FC<BudgetAllocationViewProps> = ({
  budget,
  expectedGuests,
  capacityMetrics,
  onUpdateBudget,
  onGuestCountChange,
}) => {
  const [totalBudgetInput, setTotalBudgetInput] = useState<string>(
    budget.totalBudgetAmount ? budget.totalBudgetAmount.toString() : ''
  );
  const [categories, setCategories] = useState<BudgetCategory[]>(budget.categories);
  const [isAdjustingPercentages, setIsAdjustingPercentages] = useState(false);

  // Sync state when budget prop updates
  React.useEffect(() => {
    setCategories(budget.categories);
    if (budget.totalBudgetAmount) {
      setTotalBudgetInput(budget.totalBudgetAmount.toString());
    }
  }, [budget]);

  // Contingency category is strictly protected
  const contingencyCat = categories.find((c) => c.isContingency) || {
    id: 'contingency_buffer',
    name: 'Contingency & Last-Minute Guest Buffer',
    percentage: 10.0,
    description: 'Mandatory 10% safety buffer specifically reserved for last-minute guest additions and day-of surge needs.',
    allocatedAmount: budget.totalBudgetAmount ? Math.round(budget.totalBudgetAmount * 0.1) : undefined,
    isContingency: true,
    scopeNotes: ['Last-minute guest additions', 'Overtime labor', 'Weather adjustments', 'Equipment redundancies'],
  };

  const totalSumPercentage = Math.round(
    categories.reduce((acc, cat) => acc + cat.percentage, 0) * 10
  ) / 10;

  const currentTotalAmount = totalBudgetInput ? parseFloat(totalBudgetInput) : null;
  const contingencyAbsorbed = capacityMetrics?.contingencyAbsorbedGuests || Math.max(3, Math.round(expectedGuests * 0.12));

  const handleApplyTotalBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(totalBudgetInput);
    if (!isNaN(parsed) && parsed > 0) {
      const updatedCategories = categories.map((cat) => ({
        ...cat,
        allocatedAmount: Math.round(parsed * (cat.percentage / 100)),
      }));

      const perGuest = expectedGuests > 0 ? Math.round(parsed / expectedGuests) : null;
      let tier: 'budget' | 'moderate' | 'premium' | 'luxury' = 'moderate';
      let tierNote = 'Balanced professional quality tier';
      if (perGuest && perGuest < 200) {
        tier = 'budget';
        tierNote = 'Value-conscious operational tier';
      } else if (perGuest && perGuest > 800) {
        tier = 'luxury';
        tierNote = 'Luxury estate / bespoke tier';
      }

      const updated: BudgetBreakdown = {
        ...budget,
        totalBudgetProvided: true,
        totalBudgetAmount: parsed,
        categories: updatedCategories,
        costPerGuestBenchmark: {
          estimatedPerGuest: perGuest,
          tier,
          note: tierNote,
        },
      };

      setCategories(updatedCategories);
      if (onUpdateBudget) onUpdateBudget(updated);
    } else {
      const updatedCategories = categories.map((cat) => ({
        ...cat,
        allocatedAmount: undefined,
      }));
      const updated: BudgetBreakdown = {
        ...budget,
        totalBudgetProvided: false,
        totalBudgetAmount: null,
        categories: updatedCategories,
        costPerGuestBenchmark: {
          estimatedPerGuest: null,
          tier: 'moderate',
          note: 'Percentage-only benchmark tier',
        },
      };
      setCategories(updatedCategories);
      setTotalBudgetInput('');
      if (onUpdateBudget) onUpdateBudget(updated);
    }
  };

  // Safe percentage adjustment that locks contingency at exactly 10.0%
  const handlePercentageChange = (id: string, newPercentage: number) => {
    if (id === contingencyCat.id) return; // Locked at 10.0%

    const nonContingency = categories.filter((c) => !c.isContingency);
    const otherNonContingency = nonContingency.filter((c) => c.id !== id);
    const clampedNew = Math.max(1, Math.min(85, Math.round(newPercentage * 10) / 10));
    
    // Remaining available for other non-contingency categories: exactly (90.0 - clampedNew)
    const targetOtherSum = Math.round((90.0 - clampedNew) * 10) / 10;
    const currentOtherSum = otherNonContingency.reduce((acc, c) => acc + c.percentage, 0);

    let accumulatedOther = 0;
    const otherCount = otherNonContingency.length;

    const updatedCategories = categories.map((cat) => {
      if (cat.isContingency) {
        return {
          ...cat,
          percentage: 10.0,
          allocatedAmount: currentTotalAmount ? Math.round(currentTotalAmount * 0.1) : undefined,
        };
      }
      if (cat.id === id) {
        return {
          ...cat,
          percentage: clampedNew,
          allocatedAmount: currentTotalAmount ? Math.round(currentTotalAmount * (clampedNew / 100)) : undefined,
        };
      }

      const otherIdx = otherNonContingency.findIndex((o) => o.id === cat.id);
      let recomputed: number;
      if (otherIdx === otherCount - 1) {
        // Last item absorbs any rounding difference to ensure exact 90.0 subtotal
        recomputed = Math.round((targetOtherSum - accumulatedOther) * 10) / 10;
      } else {
        const ratio = currentOtherSum > 0 ? cat.percentage / currentOtherSum : 1 / otherCount;
        recomputed = Math.round(targetOtherSum * ratio * 10) / 10;
        accumulatedOther += recomputed;
      }

      const safePct = Math.max(0.5, recomputed);
      return {
        ...cat,
        percentage: safePct,
        allocatedAmount: currentTotalAmount ? Math.round(currentTotalAmount * (safePct / 100)) : undefined,
      };
    });

    setCategories(updatedCategories);
    if (onUpdateBudget) {
      onUpdateBudget({
        ...budget,
        categories: updatedCategories,
      });
    }
  };

  const paletteBarColors = [
    'bg-sky-500',
    'bg-indigo-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-rose-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-amber-400',
  ];

  return (
    <div className="space-y-6">
      {/* Strict Compliance & Guest-Scaling Policy Banner */}
      <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-900/60 border border-amber-700/80 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-200">
              Critical Rules 1, 2 & 3 · Guest Scaling, No Price Guessing & 10% Margin
            </h3>
            <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
              Allocations dynamically scale based on your <strong className="text-white">{expectedGuests} guest count</strong> (higher catering ratio for larger crowds, boutique venue buyouts for intimate counts). Specific vendor prices are never hallucinated; the mandatory 10% contingency buffer is permanently reserved for last-minute attendee surges.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <span className="text-xs text-neutral-400">Headcount Margin:</span>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-1 rounded border border-amber-800/80">
            10.0% Locked (+{contingencyAbsorbed} Guests)
          </span>
        </div>
      </div>

      {/* Top Controls: Interactive Total Budget, Headcount Slider & Simulator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Budget Calculator Card */}
        <div className="md:col-span-2 bg-neutral-900/60 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>Overall Event Budget Range</span>
              </h4>
              <p className="text-xs text-neutral-400">
                Supply or adjust total budget to project percentage-derived category caps.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onGuestCountChange && (
                <div className="flex items-center gap-1.5 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800">
                  <Users className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-xs text-neutral-400 hidden sm:inline">Headcount:</span>
                  <input
                    type="number"
                    min="5"
                    max="2500"
                    value={expectedGuests}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val > 0) onGuestCountChange(val);
                    }}
                    className="w-14 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-amber-400 text-right focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[11px] font-mono text-neutral-400">PAX</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsAdjustingPercentages(!isAdjustingPercentages)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isAdjustingPercentages
                    ? 'bg-amber-400 text-neutral-950 border-amber-400 font-semibold'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isAdjustingPercentages ? 'Lock Sliders' : 'Fine-Tune %'}</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleApplyTotalBudget} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-mono">
                $
              </span>
              <input
                type="number"
                min="0"
                step="1000"
                value={totalBudgetInput}
                onChange={(e) => setTotalBudgetInput(e.target.value)}
                placeholder="Enter total budget (or leave blank for % only)"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 font-mono tabular-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg border border-neutral-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Recalculate Allocations
              </button>
              {totalBudgetInput && (
                <button
                  type="button"
                  onClick={() => {
                    setTotalBudgetInput('');
                    handleApplyTotalBudget({ preventDefault: () => {} } as any);
                  }}
                  className="px-2.5 py-2 text-xs text-neutral-400 hover:text-neutral-200 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </form>

          {currentTotalAmount && currentTotalAmount > 0 && (
            <div className="mt-3 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <span>Calculated Baseline:</span>
                <span className="font-mono tabular-nums font-bold text-white text-sm">
                  ${currentTotalAmount.toLocaleString()} USD
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>10% Contingency Reserve:</span>
                <span className="font-mono tabular-nums font-bold text-amber-400">
                  ${Math.round(currentTotalAmount * 0.1).toLocaleString()} USD
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Cost Per Guest & Scaling Tier Card */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                Per-Guest Metric
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-amber-400">
                {capacityMetrics?.scaleTier || 'standard'} tier
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-white">
                {budget.costPerGuestBenchmark?.estimatedPerGuest
                  ? `$${budget.costPerGuestBenchmark.estimatedPerGuest.toLocaleString()}`
                  : '—'}
              </span>
              <span className="text-xs text-neutral-500">
                {budget.costPerGuestBenchmark?.estimatedPerGuest ? '/ attendee' : 'No total specified'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              {budget.costPerGuestBenchmark?.note || 'Provide total budget to calculate per-attendee metrics.'}
            </p>
          </div>

          <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span>Attendee Base:</span>
            <span className="font-mono tabular-nums text-neutral-200 font-semibold">
              {expectedGuests} guests
            </span>
          </div>
        </div>
      </div>

      {/* Visual Stacked Percentage Allocation Bar */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-neutral-400" />
            <span>Guest-Scaled Percentage Spectrum (Rule 1 & 2)</span>
          </h4>
          <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
            <span className="text-neutral-400">Total:</span>
            <span
              className={`font-bold ${
                totalSumPercentage === 100.0 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {totalSumPercentage.toFixed(1)}%
            </span>
            <span className="text-neutral-500">/ 100.0%</span>
          </div>
        </div>

        {/* The 100% Bar */}
        <div className="w-full h-4 rounded-lg bg-neutral-950 overflow-hidden flex border border-neutral-800">
          {categories.map((cat, idx) => {
            const colorClass = cat.isContingency
              ? 'bg-amber-400'
              : paletteBarColors[idx % (paletteBarColors.length - 1)];
            return (
              <div
                key={cat.id}
                style={{ width: `${cat.percentage}%` }}
                title={`${cat.name}: ${cat.percentage.toFixed(1)}%`}
                className={`${colorClass} h-full transition-all duration-300 relative group`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 text-xs">
          {categories.map((cat, idx) => {
            const colorClass = cat.isContingency
              ? 'bg-amber-400'
              : paletteBarColors[idx % (paletteBarColors.length - 1)];
            return (
              <div key={cat.id} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-sm ${colorClass} shrink-0`} />
                <span className="text-neutral-300 font-medium">{cat.name}</span>
                <span className="font-mono tabular-nums text-neutral-400">
                  ({cat.percentage.toFixed(1)}%)
                </span>
                {cat.isContingency && (
                  <span className="text-[10px] uppercase font-bold text-amber-400 ml-1">
                    [10% Safety Buffer]
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory Contingency Highlight Box (Rule 3) */}
      <div className="bg-amber-950/20 border-2 border-amber-500/50 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-neutral-950 text-[10px] font-bold uppercase tracking-wider rounded-bl-lg">
          Rule 3 · Guaranteed 10% Safety Margin
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <h4 className="text-base font-bold text-white">
                {contingencyCat.name}
              </h4>
            </div>
            <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
              {contingencyCat.description}
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div>
              <span className="text-[11px] text-neutral-400 uppercase tracking-wide block">
                Allocation Share
              </span>
              <span className="text-2xl font-bold font-mono tabular-nums text-amber-400">
                10.0%
              </span>
            </div>

            <div>
              <span className="text-[11px] text-neutral-400 uppercase tracking-wide block">
                Last-Minute RSVPs
              </span>
              <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                +{contingencyAbsorbed} PAX
              </span>
            </div>

            {currentTotalAmount && currentTotalAmount > 0 && (
              <div className="pl-6 border-l border-amber-900/50">
                <span className="text-[11px] text-neutral-400 uppercase tracking-wide block">
                  Dollar Reserve
                </span>
                <span className="text-2xl font-bold font-mono tabular-nums text-white">
                  ${Math.round(currentTotalAmount * 0.1).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-amber-900/30">
          <span className="text-xs font-semibold text-neutral-300 block mb-1.5">
            Surge Scenarios Protected by the 10% Margin:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs text-neutral-300">
            {contingencyCat.scopeNotes.map((note, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-neutral-950/60 p-2 rounded border border-amber-900/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Structured Category Breakdown Table */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-white">
              Category Allocation Table & Guest-Driven Scopes
            </h4>
            <p className="text-xs text-neutral-400">
              Each bucket specifies RFP deliverables and percentage cap dynamically scaled for {expectedGuests} attendees.
            </p>
          </div>

          <span className="text-xs text-neutral-400 font-mono tabular-nums">
            {categories.length} Categories
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/50 text-neutral-400 font-medium">
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold text-right">Share (%)</th>
                {currentTotalAmount && (
                  <th className="py-3 px-4 font-semibold text-right">Target Range ($)</th>
                )}
                <th className="py-3 px-4 font-semibold">Operational Scope & RFP Deliverables</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {categories.map((cat) => {
                const isContingency = cat.isContingency;
                return (
                  <tr
                    key={cat.id}
                    className={`hover:bg-neutral-800/30 transition-colors ${
                      isContingency ? 'bg-amber-950/10' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-medium text-white align-top">
                      <div className="flex items-center gap-2">
                        <span>{cat.name}</span>
                        {isContingency && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/80">
                            10% BUFFER
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1 max-w-sm">
                        {cat.description}
                      </p>

                      {isAdjustingPercentages && !isContingency && (
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="range"
                            min="2"
                            max="50"
                            step="0.5"
                            value={cat.percentage}
                            onChange={(e) =>
                              handlePercentageChange(cat.id, parseFloat(e.target.value))
                            }
                            className="w-32 accent-amber-400"
                          />
                          <span className="font-mono text-neutral-300 tabular-nums">
                            {cat.percentage.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-sm font-semibold text-neutral-200 align-top">
                      <span className={isContingency ? 'text-amber-400 font-bold' : ''}>
                        {cat.percentage.toFixed(1)}%
                      </span>
                    </td>

                    {currentTotalAmount && (
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-sm font-semibold text-white align-top">
                        {cat.allocatedAmount ? (
                          <span className={isContingency ? 'text-amber-400 font-bold' : ''}>
                            ${cat.allocatedAmount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-neutral-500">—</span>
                        )}
                      </td>
                    )}

                    <td className="py-3.5 px-4 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        {cat.scopeNotes.map((note, nIdx) => (
                          <span
                            key={nIdx}
                            className="text-[11px] bg-neutral-950 text-neutral-300 px-2 py-1 rounded border border-neutral-800/80"
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
