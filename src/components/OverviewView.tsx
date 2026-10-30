import React from 'react';
import { 
  Users, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Palette, 
  FileSpreadsheet, 
  ArrowRight,
  Sparkles,
  Building2,
  AlertCircle,
  Wine,
  DoorOpen,
  SlidersHorizontal
} from 'lucide-react';
import { StructuredEventData } from '../types/event';
import { AmbiguityInspector } from './AmbiguityInspector';

interface OverviewViewProps {
  eventData: StructuredEventData;
  onNavigateTab: (tabId: string) => void;
  onGuestCountChange?: (newCount: number) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  eventData,
  onNavigateTab,
  onGuestCountChange,
}) => {
  const capacity = eventData.capacityMetrics;

  return (
    <div className="space-y-6">
      {/* CRITICAL RULE 4: Explicit Fallback Declaration Banner */}
      {eventData.guestCount.fallbackApplied && eventData.guestCount.fallbackDescription && (
        <div className="bg-amber-950/40 border-2 border-amber-500/70 rounded-xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 font-bold" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Critical Logic Rule 4 · Explicit Fallback Applied
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Default Headcount Assumed ({eventData.guestCount.expected} Guests)
            </h3>
            <p className="text-xs text-neutral-200 leading-relaxed">
              {eventData.guestCount.fallbackDescription}
            </p>
          </div>
        </div>
      )}

      {/* Ambiguity & Math Contradiction Inspector */}
      <AmbiguityInspector resolutions={eventData.ambiguitiesAndFallbacks} />

      {/* Hero Executive Specification Card */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
              <span className="font-semibold text-amber-400 uppercase tracking-wider">
                {eventData.eventType.replace('_', ' ')}
              </span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{eventData.format.replace('_', ' ')} Format</span>
              <span aria-hidden="true">·</span>
              <span className="text-neutral-300 font-medium">{capacity.tierLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{eventData.targetSeasonOrDate}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {eventData.title}
            </h2>

            <p className="text-sm text-neutral-300 leading-relaxed pt-1">
              {eventData.creativeDirection.tagline}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('budget')}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>View Scaled Budget</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4-Column Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-800/80">
          <div>
            <span className="text-xs text-neutral-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-neutral-500" />
              <span>Target Headcount</span>
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-white">
                {eventData.guestCount.expected}
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                ({eventData.guestCount.min}–{eventData.guestCount.max})
              </span>
            </div>
            <span className="text-[11px] text-amber-400/90 mt-0.5 block font-medium">
              {eventData.guestCount.fallbackApplied ? 'Logical default fallback' : 'Parsed from user brief'}
            </span>
          </div>

          <div>
            <span className="text-xs text-neutral-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>Program Duration</span>
            </span>
            <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-white">
              {eventData.duration.days} {eventData.duration.days === 1 ? 'Day' : 'Days'}
            </div>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">
              {eventData.duration.summary}
            </span>
          </div>

          <div>
            <span className="text-xs text-neutral-400 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-500" />
              <span>Declared Budget</span>
            </span>
            <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-white">
              {eventData.budget.totalBudgetAmount
                ? `$${eventData.budget.totalBudgetAmount.toLocaleString()}`
                : 'Percentage Model'}
            </div>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">
              {eventData.budget.totalBudgetAmount ? 'Total stated cap' : 'Percentage-based allocation'}
            </span>
          </div>

          <div>
            <span className="text-xs text-neutral-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>10% Safety Contingency</span>
            </span>
            <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-amber-400">
              10.0%
            </div>
            <span className="text-[11px] text-neutral-400 mt-0.5 block font-medium">
              Absorbs ~{capacity.contingencyAbsorbedGuests} surprise RSVPs
            </span>
          </div>
        </div>
      </div>

      {/* CRITICAL RULE 1: Guest-Driven Capacity & Logistics Matrix */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">
                Guest-Driven Scaling Matrix ({capacity.tierLabel})
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Venue capacity, catering ratio, and facility footprints automatically adapt to {eventData.guestCount.expected} attendees.
            </p>
          </div>

          {onGuestCountChange && (
            <div className="flex items-center gap-2.5 bg-neutral-950 p-2 rounded-lg border border-neutral-800 self-start sm:self-center">
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="text-xs text-neutral-400 whitespace-nowrap">Simulate Headcount:</span>
              <input
                type="range"
                min="5"
                max="1500"
                step="5"
                value={eventData.guestCount.expected}
                onChange={(e) => onGuestCountChange(Number.parseInt(e.target.value, 10))}
                className="w-24 sm:w-28 accent-amber-400 cursor-pointer"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="5"
                  max="2500"
                  value={eventData.guestCount.expected}
                  onChange={(e) => {
                    const val = Number.parseInt(e.target.value, 10);
                    if (!Number.isNaN(val) && val > 0) onGuestCountChange(val);
                  }}
                  className="w-14 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-amber-400 text-right focus:outline-none focus:border-amber-400"
                />
                <span className="text-[11px] font-mono text-neutral-400">PAX</span>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic venue and catering recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-950/70 border border-neutral-800/80 p-4 rounded-lg space-y-2">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide block">
              Venue Style Recommendation (Scaled for {eventData.guestCount.expected} PAX)
            </span>
            <p className="text-sm font-semibold text-white">
              {capacity.recommendedVenueStyle}
            </p>
            <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-xs text-neutral-400">
              <span>Required Floor Space:</span>
              <span className="font-mono tabular-nums text-amber-400 font-semibold">
                ~{capacity.sqFtTotal.toLocaleString()} sq. ft. ({capacity.sqFtPerGuest} sq ft / guest)
              </span>
            </div>
          </div>

          <div className="bg-neutral-950/70 border border-neutral-800/80 p-4 rounded-lg space-y-2">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide block">
              Catering Allocation Rationale (Rule 1)
            </span>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {capacity.cateringDynamicRationale}
            </p>
            <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-xs text-neutral-400">
              <span>Dynamic Catering Share:</span>
              <span className="font-mono tabular-nums text-emerald-400 font-semibold">
                {eventData.budget.categories.find(c => c.id === 'catering')?.percentage.toFixed(1)}% of budget
              </span>
            </div>
          </div>
        </div>

        {/* Operational Flow Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-neutral-950/50 border border-neutral-800/60 p-3 rounded-lg text-center">
            <span className="text-[11px] text-neutral-500 uppercase tracking-wide block">
              Service Bars
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-neutral-200">
              {capacity.barsRecommended} {capacity.barsRecommended === 1 ? 'Station' : 'Stations'}
            </span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">
              ~1 per {Math.round(eventData.guestCount.expected / capacity.barsRecommended)} guests
            </span>
          </div>

          <div className="bg-neutral-950/50 border border-neutral-800/60 p-3 rounded-lg text-center">
            <span className="text-[11px] text-neutral-500 uppercase tracking-wide block">
              Restroom Units
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-neutral-200">
              {capacity.restroomsRecommended} {capacity.restroomsRecommended === 1 ? 'Stall' : 'Stalls'}
            </span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">
              Queue minimization standard
            </span>
          </div>

          <div className="bg-neutral-950/50 border border-neutral-800/60 p-3 rounded-lg text-center">
            <span className="text-[11px] text-neutral-500 uppercase tracking-wide block">
              Check-In Kiosks
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-neutral-200">
              {capacity.checkInKiosks} {capacity.checkInKiosks === 1 ? 'Point' : 'Points'}
            </span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">
              Rapid credentialing rate
            </span>
          </div>

          <div className="bg-neutral-950/50 border border-amber-900/40 p-3 rounded-lg text-center bg-amber-950/10">
            <span className="text-[11px] text-amber-400 uppercase tracking-wide block font-semibold">
              10% Buffer Absorbs
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-amber-400">
              +{capacity.contingencyAbsorbedGuests} Guests
            </span>
            <span className="text-[10px] text-neutral-400 block mt-0.5">
              Last-minute additions buffer
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
