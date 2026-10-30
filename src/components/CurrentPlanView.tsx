import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  ArrowUpRight, 
  Users, 
  MapPin, 
  Calendar,
  Layers,
  FileText,
  Palette,
  Sliders,
  Check,
  ChevronRight
} from 'lucide-react';
import { StructuredEventData, BudgetCategory } from '../types/event';
import { formatCurrency, formatCompactCurrency } from '../utils/currency';

interface CurrentPlanViewProps {
  eventData: StructuredEventData;
  onOpenChecklistModal: () => void;
  onOpenBudgetModal: () => void;
  onNavigateTab?: (tabId: string) => void;
}

export const CurrentPlanView: React.FC<CurrentPlanViewProps> = ({
  eventData,
  onOpenChecklistModal,
  onOpenBudgetModal,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<BudgetCategory | null>(null);
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'creative' | 'rfp' | 'capacity'>('matrix');

  const budget = eventData.budget;
  const categories = budget.categories || [];
  const totalAmount = budget.totalBudgetAmount || 0;
  const currency = budget.currency || 'INR';

  // Toggle milestone completion
  const handleToggleMilestone = (id: string) => {
    setCompletedMilestones((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Calculate SVG Donut chart paths
  // Radius = 90, center = (120, 120), inner radius = 55 (hole)
  const donutCenter = 120;
  const donutOuterR = 85;
  const donutInnerR = 52;

  let cumulativeAngle = -Math.PI / 2; // Start from top 12 o'clock

  const donutSlices = categories.map((cat) => {
    const fraction = (cat.percentage || 0) / 100;
    const angle = fraction * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const x1 = donutCenter + donutOuterR * Math.cos(startAngle);
    const y1 = donutCenter + donutOuterR * Math.sin(startAngle);
    const x2 = donutCenter + donutOuterR * Math.cos(endAngle);
    const y2 = donutCenter + donutOuterR * Math.sin(endAngle);

    const x3 = donutCenter + donutInnerR * Math.cos(endAngle);
    const y3 = donutCenter + donutInnerR * Math.sin(endAngle);
    const x4 = donutCenter + donutInnerR * Math.cos(startAngle);
    const y4 = donutCenter + donutInnerR * Math.sin(startAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${donutOuterR} ${donutOuterR} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${donutInnerR} ${donutInnerR} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');

    return {
      cat,
      pathData,
      color: cat.color || '#F59E0B',
    };
  });

  // Calculate SVG Bar Chart Metrics
  const maxAllocated = Math.max(...categories.map((c) => c.allocatedAmount || 0), 1);
  const chartHeight = 160;
  const chartWidth = 360;
  const barWidth = 26;
  const barGap = 16;
  const chartYScaleMax = Math.ceil(maxAllocated / 40000) * 40000 || 160000;
  const yTicks = [chartYScaleMax, chartYScaleMax * 0.75, chartYScaleMax * 0.5, chartYScaleMax * 0.25, 0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Bar Header with Title, Meta and Success Toast */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {eventData.eventType.replace('_', ' ')}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {eventData.cityAndLocation}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {eventData.targetEventDate}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
              <Users className="w-3 h-3 text-amber-400" />
              {eventData.guestCount.expected} Guests
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {eventData.title}
          </h2>
        </div>

        {/* Success Banner Matching Screenshot 1 */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d211a] border border-emerald-500/50 text-emerald-300 text-xs font-semibold shadow-sm shadow-emerald-500/10">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Event Masterplan generated and saved successfully!</span>
        </div>
      </div>

      {/* Sub-Tabs: Matrix (Screenshot 1 view) vs Detailed Deep-Dives */}
      <div className="flex items-center gap-2 text-xs font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'matrix'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Masterplan Dashboard</span>
        </button>

        <button
          onClick={() => setActiveSubTab('creative')}
          className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'creative'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Creative Styling & Palette</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rfp')}
          className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'rfp'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Vendor RFP Specifications</span>
        </button>

        <button
          onClick={() => setActiveSubTab('capacity')}
          className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'capacity'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Guest Capacity & Floorplan</span>
        </button>
      </div>

      {/* VIEWPORT 1: Masterplan Dashboard Matching Screenshot 1 Exactly */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-6">
          
          {/* Top Row: Two Equal Columns (Donut Chart & Bar Chart) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* CARD 1: Budget Capital Allocation (Top Left) */}
            <div className="bg-[#0c1322] border border-slate-800/90 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Budget Capital Allocation
                    </h3>
                    <p className="text-xs text-slate-400">
                      Share by service domain
                    </p>
                  </div>
                  <button
                    onClick={onOpenBudgetModal}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Donut Chart Container */}
                <div className="flex flex-col items-center justify-center my-2">
                  <div className="relative w-60 h-60 flex items-center justify-center">
                    <svg
                      viewBox="0 0 240 240"
                      className="w-full h-full transform -rotate-90"
                    >
                      {donutSlices.map((slice, idx) => (
                        <path
                          key={idx}
                          d={slice.pathData}
                          fill={slice.color}
                          className="transition-all duration-200 cursor-pointer hover:opacity-85"
                          onMouseEnter={() => setHoveredCategory(slice.cat)}
                          onMouseLeave={() => setHoveredCategory(null)}
                        />
                      ))}
                    </svg>

                    {/* Donut Center Hole Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      {hoveredCategory ? (
                        <div className="px-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate max-w-[110px]">
                            {hoveredCategory.name}
                          </span>
                          <span className="text-base font-black text-white tabular-nums block">
                            {hoveredCategory.percentage}%
                          </span>
                          <span className="text-[10px] font-semibold text-amber-400 tabular-nums">
                            {formatCompactCurrency(hoveredCategory.allocatedAmount || 0, currency)}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            TOTAL BUDGET
                          </span>
                          <span className="text-sm sm:text-base font-black text-amber-400 tabular-nums block">
                            {formatCurrency(totalAmount, currency)}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                            10% Contingency
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend with colored dots matching Screenshot 1 */}
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px]">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      onMouseEnter={() => setHoveredCategory(cat)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className="flex items-center gap-1.5 cursor-pointer hover:text-white text-slate-300 transition-colors"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium">
                        {cat.name} ({cat.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CARD 2: Expense Distribution Bar (Top Right) */}
            <div className="bg-[#0c1322] border border-slate-800/90 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Expense Distribution Bar
                    </h3>
                    <p className="text-xs text-slate-400">
                      Total estimated outlay in {currency === 'INR' ? '₹' : currency}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 tabular-nums">
                    {categories.length} Domains
                  </span>
                </div>

                {/* SVG Vertical Bar Chart Matching Screenshot 1 */}
                <div className="w-full overflow-x-auto py-2">
                  <div className="min-w-[420px] h-[220px] relative">
                    <svg viewBox="0 0 460 210" className="w-full h-full">
                      {/* Horizontal Gridlines and Y-axis Labels */}
                      {yTicks.map((val, idx) => {
                        const y = 20 + idx * 32;
                        return (
                          <g key={idx}>
                            <line
                              x1="55"
                              y1={y}
                              x2="450"
                              y2={y}
                              stroke="#1e293b"
                              strokeDasharray="3 3"
                            />
                            <text
                              x="48"
                              y={y + 3}
                              fill="#64748b"
                              fontSize="9"
                              textAnchor="end"
                              fontFamily="sans-serif"
                            >
                              {currency === 'INR' ? '₹' : ''}
                              {val >= 1000 ? `${Math.round(val / 1000)}k` : val}
                            </text>
                          </g>
                        );
                      })}

                      {/* Vertical Amber Bars */}
                      {categories.map((cat, idx) => {
                        const amount = cat.allocatedAmount || 0;
                        const barHeight = Math.max(4, (amount / chartYScaleMax) * 128);
                        const x = 70 + idx * 46;
                        const y = 148 - barHeight;

                        return (
                          <g
                            key={cat.id}
                            className="cursor-pointer group"
                            onMouseEnter={() => setHoveredCategory(cat)}
                            onMouseLeave={() => setHoveredCategory(null)}
                          >
                            {/* The vertical amber bar */}
                            <rect
                              x={x}
                              y={y}
                              width={barWidth}
                              height={barHeight}
                              fill="#f59e0b"
                              rx="3"
                              className="transition-all duration-150 hover:fill-amber-300"
                            />

                            {/* Slanted X-axis label */}
                            <text
                              x={x + 12}
                              y="160"
                              fill="#94a3b8"
                              fontSize="8.5"
                              textAnchor="end"
                              transform={`rotate(-35 ${x + 12} 160)`}
                              fontFamily="sans-serif"
                            >
                              {cat.name.length > 12 ? `${cat.name.slice(0, 11)}...` : cat.name}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bar Chart Quick Insights */}
              <div className="mt-2 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Top Allocation: {categories[0]?.name || 'Catering'}</span>
                <span className="text-amber-400 font-semibold tabular-nums">
                  {formatCurrency(categories[0]?.allocatedAmount || 0, currency)}
                </span>
              </div>
            </div>

          </div>

          {/* Bottom Row: Milestone Timeline & Immediate Deadlines + ARCHITECTURE & DISCLOSURES */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* CARD 3: Milestone Timeline & Immediate Deadlines (7 cols) */}
            <div className="lg:col-span-7 bg-[#0c1322] border border-slate-800/90 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Milestone Timeline & Immediate Deadlines
                    </h3>
                  </div>
                  <button
                    onClick={onOpenChecklistModal}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Full Checklist ({eventData.logistics?.keyMilestones?.length || 17})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Milestone Checklist Items */}
                <div className="space-y-3">
                  {(eventData.logistics?.keyMilestones || []).slice(0, 4).map((milestone) => {
                    const isDone = !!completedMilestones[milestone.id];
                    return (
                      <button
                        type="button"
                        key={milestone.id}
                        onClick={() => handleToggleMilestone(milestone.id)}
                        className={`w-full p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-left ${
                          isDone
                            ? 'bg-slate-900/40 border-slate-850 opacity-60'
                            : 'bg-[#111a2e]/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Amber Dot or Check */}
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
              </div>

              {/* Footer Note */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Critical Path Scheduling</span>
                <span className="text-amber-400/90 font-medium">
                  {Object.values(completedMilestones).filter(Boolean).length} of{' '}
                  {eventData.logistics?.keyMilestones?.length || 17} Tasks Completed
                </span>
              </div>
            </div>

            {/* CARD 4: ARCHITECTURE & DISCLOSURES (5 cols) Matching Screenshot 1 */}
            <div className="lg:col-span-5 bg-[#0c1322] border border-slate-800/90 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    ARCHITECTURE & DISCLOSURES
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-3">
                  EventGenie Deterministic Intelligence Engine
                </h4>

                <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-normal">
                  <div className="p-3 rounded-xl bg-[#111a2e]/60 border border-slate-800 space-y-1">
                    <span className="font-bold text-white block">
                      Programmatic Precision:
                    </span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      All budget allocations, category totals, and trade-off deltas are executed via
                      deterministic code formulas to eliminate LLM arithmetic hallucinations.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#111a2e]/60 border border-slate-800 space-y-1">
                    <span className="font-bold text-white block">
                      Model Attribution:
                    </span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Rule-based expert system was utilized for baseline logistics; enhanced by Google
                      Gemini 3.8 Flash for creative narratives and vendor due-diligence.
                    </p>
                  </div>
                </div>
              </div>

              {/* Safety Margins and Fallback Badges */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>10% Safety Reserve Active</span>
                </div>
                <span className="text-slate-400">
                  Scale: {eventData.capacityMetrics?.tierLabel || 'Production'}
                </span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEWPORT 2: Creative Direction & Styling Deep-Dive */}
      {activeSubTab === 'creative' && (
        <div className="bg-[#0c1322] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Creative Architecture
              </span>
              <h3 className="text-xl font-bold text-white">
                {eventData.creativeDirection?.conceptTitle || 'Regal Heritage & Modern Opulence'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                "{eventData.creativeDirection?.tagline}"
              </p>
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Curated Architectural Palette
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(eventData.creativeDirection?.colorPalette || []).map((c, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#111a2e] border border-slate-800 flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg shrink-0 border border-white/20 shadow-sm"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">{c.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">{c.hex}</span>
                    <span className="text-[10px] text-amber-400 block truncate">{c.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Narrative & Sensory Profile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 rounded-xl bg-[#111a2e] border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white block">Narrative Atmosphere</span>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {eventData.creativeDirection?.narrative}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#111a2e] border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white block">Sensory Profile</span>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li><strong className="text-amber-400">Acoustic:</strong> {eventData.creativeDirection?.sensoryProfile?.acoustic}</li>
                <li><strong className="text-amber-400">Olfactory:</strong> {eventData.creativeDirection?.sensoryProfile?.olfactory}</li>
                <li><strong className="text-amber-400">Culinary:</strong> {eventData.creativeDirection?.sensoryProfile?.taste}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VIEWPORT 3: Vendor RFP Matrix Deep-Dive */}
      {activeSubTab === 'rfp' && (
        <div className="bg-[#0c1322] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Vendor Due Diligence
              </span>
              <h3 className="text-xl font-bold text-white">
                RFP Specifications & Deliverable Matrices
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Zero hallucinated prices. Strict percentage-based outlays and contractual selection criteria.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(eventData.vendorRfpMatrix || []).map((rfp) => (
              <div key={rfp.id} className="p-4 rounded-xl bg-[#111a2e] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{rfp.category}</h4>
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                    {rfp.allocatedBudgetDisplay}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Scope of Work
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {rfp.scopeOfWork.slice(0, 3).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Key Selection Criteria
                  </span>
                  <p className="text-xs text-slate-400">
                    {rfp.selectionCriteria.join(' · ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEWPORT 4: Guest Capacity & Floorplan Scaling Deep-Dive */}
      {activeSubTab === 'capacity' && (
        <div className="bg-[#0c1322] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Guest-Driven Scaling Architecture
              </span>
              <h3 className="text-xl font-bold text-white">
                Venue Sizing & Crowd Flow Logistics
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated for {eventData.guestCount.expected} attendees ({eventData.capacityMetrics?.tierLabel})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#111a2e] border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Venue Space</span>
              <span className="text-lg font-black text-amber-400 block tabular-nums">
                {eventData.capacityMetrics?.sqFtTotal.toLocaleString()} sq ft
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {eventData.capacityMetrics?.sqFtPerGuest} sq ft / attendee
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#111a2e] border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Beverage Bars</span>
              <span className="text-lg font-black text-white block tabular-nums">
                {eventData.capacityMetrics?.barsRecommended} Stations
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Zero bottleneck flow
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#111a2e] border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Restroom Units</span>
              <span className="text-lg font-black text-white block tabular-nums">
                {eventData.capacityMetrics?.restroomsRecommended} Units
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                40 guests / unit standard
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#111a2e] border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Safety Headroom</span>
              <span className="text-lg font-black text-emerald-400 block tabular-nums">
                +{eventData.capacityMetrics?.contingencyAbsorbedGuests} Guests
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                10% contingency buffer
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111a2e] border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white block">Catering Dynamic Scaling Rationale</span>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {eventData.capacityMetrics?.cateringDynamicRationale}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
