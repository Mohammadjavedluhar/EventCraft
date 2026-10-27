import React, { useState } from 'react';
import { Sparkles, MapPin, Calendar, Users, IndianRupee, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { INSTANT_PRESETS, EventPreset } from '../utils/parser';
import { CurrencyCode, formatCurrency, getCurrencySymbol } from '../utils/currency';
import { EventType } from '../types/event';

interface NewPlanViewProps {
  onGeneratePlan: (formData: {
    title: string;
    eventType: EventType;
    cityAndLocation: string;
    targetEventDate: string;
    guestCount: number;
    totalBudget: number;
    currency: CurrencyCode;
    notes?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const NewPlanView: React.FC<NewPlanViewProps> = ({
  onGeneratePlan,
  isLoading,
}) => {
  // Default to first preset (Royal Indian Wedding) matching Screenshot 2
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-wedding');
  
  const [title, setTitle] = useState<string>("Aarav & Meera's Grand Royal Wedding");
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [cityAndLocation, setCityAndLocation] = useState<string>('Udaipur, Rajasthan');
  const [targetEventDate, setTargetEventDate] = useState<string>('2026-12-15');
  const [guestCount, setGuestCount] = useState<number>(300);
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [totalBudget, setTotalBudget] = useState<number>(500000);
  const [bespokeNotes, setBespokeNotes] = useState<string>(
    "Regal Rajputana palace styling, sunset lakeside pheras, energetic sangeet with live dhol and DJ, multi-course Rajasthani and Mughlai banquet feast, and drone floral shower."
  );

  const handleSelectPreset = (preset: EventPreset) => {
    setSelectedPresetId(preset.id);
    setTitle(preset.title);
    setEventType(preset.category);
    setCityAndLocation(preset.cityAndLocation);
    setTargetEventDate(preset.targetEventDate);
    setGuestCount(preset.guestCount);
    setTotalBudget(preset.totalBudget);
    setCurrency(preset.currency);
    setBespokeNotes(preset.text);
  };

  const perGuestEst = guestCount > 0 ? Math.round(totalBudget / guestCount) : 0;
  const currencySymbol = getCurrencySymbol(currency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGeneratePlan({
      title,
      eventType,
      cityAndLocation,
      targetEventDate,
      guestCount,
      totalBudget,
      currency,
      notes: bespokeNotes,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-10">
      
      {/* Hero Header matching Screenshot 2 */}
      <div className="text-center space-y-4">
        {/* Kicker badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>GENAI EVENT PLANNING & BUDGET ENGINE</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Craft Your Perfect{' '}
          <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
            Celebration
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
          From grand Indian weddings to college festivals and milestone birthdays. Generate deterministic
          budgets, verified timelines, vendor due-diligence, and bespoke styling with Google Gemini.
        </p>
      </div>

      {/* Instant One-Click Presets Header & Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-400 tracking-wider uppercase">
            INSTANT ONE-CLICK PRESETS:
          </span>
          <span className="text-amber-400 tracking-wider uppercase text-[11px]">
            CLICK TO AUTO-POPULATE FORM
          </span>
        </div>

        {/* 4 Preset Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {INSTANT_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/80 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/40'
                    : 'bg-[#0f172a]/70 hover:bg-[#131d35] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                      {preset.presetTitle}
                    </span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {preset.presetSubtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Form Card matching Screenshot 2 */}
      <div className="bg-[#0c1322] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Row 1: Celebration Title & Event Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Celebration Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Aarav & Meera's Grand Royal Wedding"
                required
                className="w-full bg-[#111a2e] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Event Category
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full bg-[#111a2e] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
              >
                <option value="wedding">Wedding</option>
                <option value="private_celebration">Milestone Birthday / Private</option>
                <option value="conference">Conference / Tech Fest</option>
                <option value="festival">Community Festival / Mahotsav</option>
                <option value="gala">Charity Gala & Banquet</option>
                <option value="product_launch">Product Launch</option>
                <option value="retreat">Executive Retreat</option>
                <option value="exhibition">Exhibition / Expo</option>
              </select>
            </div>
          </div>

          {/* Row 2: City & Location & Target Event Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>City & Location</span>
              </label>
              <input
                type="text"
                value={cityAndLocation}
                onChange={(e) => setCityAndLocation(e.target.value)}
                placeholder="e.g. Udaipur, Rajasthan"
                required
                className="w-full bg-[#111a2e] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Target Event Date</span>
              </label>
              <input
                type="date"
                value={targetEventDate}
                onChange={(e) => setTargetEventDate(e.target.value)}
                required
                className="w-full bg-[#111a2e] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
              />
            </div>
          </div>

          {/* Row 3: Guest Count, Total Budget, and Deterministic Est. / Guest */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Guest Count (5 cols on lg) */}
            <div className="lg:col-span-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Guest Count</span>
                </label>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                  {guestCount} Attendees
                </span>
              </div>
              <input
                type="number"
                min="5"
                max="5000"
                step="5"
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value, 10) || 50)}
                required
                className="w-full bg-[#111a2e] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors tabular-nums"
              />
              <p className="text-[11px] text-slate-400 leading-tight">
                Guest-Driven Scaling automatically adjusts catering volume and venue capacity.
              </p>
            </div>

            {/* Total Budget (5 cols on lg) */}
            <div className="lg:col-span-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
                  <span>Total Budget</span>
                </label>
                <span className="text-[11px] font-bold text-slate-300 tabular-nums">
                  {formatCurrency(totalBudget, currency)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="bg-[#111a2e] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400 transition-colors shrink-0 cursor-pointer"
                >
                  <option value="INR">₹ INR</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                  <option value="GBP">£ GBP</option>
                </select>

                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(parseInt(e.target.value, 10) || 10000)}
                  required
                  className="flex-1 bg-[#111a2e] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors tabular-nums"
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-tight">
                Mandatory 10% contingency reserve locked for last-minute headcounts.
              </p>
            </div>

            {/* Deterministic Est. / Guest Card matching Screenshot 2 */}
            <div className="lg:col-span-4 bg-[#111a2e]/90 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block mb-1">
                  DETERMINISTIC EST. / GUEST
                </span>
                <div className="text-2xl font-black text-amber-400 tabular-nums tracking-tight">
                  {currencySymbol} {perGuestEst.toLocaleString('en-IN')}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-normal mt-2">
                Auto-calculated in application code
              </span>
            </div>

          </div>

          {/* Bespoke Vision / Creative Request */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Creative Vision & Bespoke Directives
            </label>
            <textarea
              rows={3}
              value={bespokeNotes}
              onChange={(e) => setBespokeNotes(e.target.value)}
              placeholder="Describe decor aesthetics, cuisine preferences, entertainment highlights, or logistical requirements..."
              className="w-full bg-[#111a2e] border border-slate-700/80 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors leading-relaxed"
            />
          </div>

          {/* Action Button & Policy Guarantee */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Zero price hallucinations. Percentage-based allocations with guaranteed 10% safety buffer.
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Synthesizing Masterplan...</span>
                </>
              ) : (
                <>
                  <span>Architect Celebration Masterplan</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
