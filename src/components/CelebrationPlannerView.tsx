import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Users, 
  IndianRupee, 
  Clock, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  Info,
  ShieldCheck,
  FileText,
  Lightbulb,
  Building,
  RotateCcw
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export interface CelebrationPlanSummary {
  eventName: string;
  eventType: 'wedding' | 'birthday' | 'community';
  eventDate: string;
  numberOfGuests: number;
  totalBudget: number;
  style: string;
  selectedPriorities: string[];
  specialRequests: string;
  budgetRows: BudgetSplitRow[];
}

interface CelebrationPlannerProps {
  onPlanBuilt?: (summary: CelebrationPlanSummary) => void;
  onOpenMasterplan?: () => void;
}

interface BudgetSplitRow {
  id: string;
  category: string;
  baseWeight: number; // relative weight before priority adjustments
  isPriority: boolean;
  share: number; // percentage (e.g. 17.6)
  amount: number; // rupee exact amount
  isContingency?: boolean;
}

export const CelebrationPlannerView: React.FC<CelebrationPlannerProps> = ({
  onPlanBuilt,
  onOpenMasterplan,
}) => {
  // Form State initialized to exact Asha & Kiran's wedding values from Screenshot
  const [eventType, setEventType] = useState<'wedding' | 'birthday' | 'community'>('wedding');
  const [eventName, setEventName] = useState<string>("Asha and Kiran's wedding");
  const [eventDate, setEventDate] = useState<string>("2027-08-23");
  const [numberOfGuests, setNumberOfGuests] = useState<number>(250);
  const [totalBudget, setTotalBudget] = useState<number>(1500000);
  const [style, setStyle] = useState<string>("Traditional");
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([
    'food_beverages',
    'photo_video',
  ]);
  const [specialRequests, setSpecialRequests] = useState<string>("");

  // Sub-navigation tabs in the overview card: Budget, Timeline, Vendors, Ideas
  const [activeTab, setActiveTab] = useState<'budget' | 'timeline' | 'vendors' | 'ideas'>('budget');

  // Timeline checklist progress
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  // Available priority areas
  const priorityOptions = [
    { id: 'venue_rooms', label: 'Venue and rooms' },
    { id: 'food_beverages', label: 'Food and beverages' },
    { id: 'decor_flowers', label: 'Decor and flowers' },
    { id: 'photo_video', label: 'Photo and video' },
    { id: 'attire_jewellery', label: 'Attire and jewellery' },
    { id: 'music_entertainment', label: 'Music and entertainment' },
    { id: 'guest_stay_travel', label: 'Guest stay and travel' },
    { id: 'invitations_gifts', label: 'Invitations and gifts' },
    { id: 'ceremony_rituals', label: 'Ceremony and rituals' },
  ];

  const handleTogglePriority = (id: string) => {
    setSelectedPriorities((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      }
      if (prev.length >= 3) {
        return prev; // Max 3
      }
      return [...prev, id];
    });
  };

  const handleReset = () => {
    setEventType('wedding');
    setEventName("Asha and Kiran's wedding");
    setEventDate("2027-08-23");
    setNumberOfGuests(250);
    setTotalBudget(1500000);
    setStyle("Traditional");
    setSelectedPriorities(['food_beverages', 'photo_video']);
    setSpecialRequests("");
    setCompletedSteps({});
  };

  // Calculate live countdown to event date
  const countdownDays = useMemo(() => {
    if (!eventDate) return 300;
    const target = new Date(eventDate).getTime();
    const today = new Date().getTime();
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [eventDate]);

  // Per guest cost calculation
  const perGuest = numberOfGuests > 0 ? Math.round(totalBudget / numberOfGuests) : 0;

  // Format date display (e.g. 23 Aug 2027)
  const formattedEventDate = useMemo(() => {
    if (!eventDate) return '23 Aug 2027';
    try {
      const d = new Date(eventDate);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return eventDate;
    }
  }, [eventDate]);

  // Compute Rupee-Exact Budget Split with strictly 10% contingency buffer
  // and priority weighting for user-selected domains
  const budgetRows: BudgetSplitRow[] = useMemo(() => {
    const baseCategories = [
      { id: 'venue_rooms', category: 'Venue and rooms', weight: 19 },
      { id: 'food_beverages', category: 'Food and beverages', weight: 26 },
      { id: 'decor_flowers', category: 'Decor and flowers', weight: 10 },
      { id: 'photo_video', category: 'Photo and video', weight: 9 },
      { id: 'attire_jewellery', category: 'Attire and jewellery', weight: 8 },
      { id: 'music_entertainment', category: 'Music and entertainment', weight: 6 },
      { id: 'guest_stay_travel', category: 'Guest stay and travel', weight: 6 },
      { id: 'invitations_gifts', category: 'Invitations and gifts', weight: 3.5 },
      { id: 'ceremony_rituals', category: 'Ceremony and rituals', weight: 2.5 },
    ];

    // Priority multiplier
    const adjustedWeights = baseCategories.map((cat) => {
      const isPriority = selectedPriorities.includes(cat.id);
      const weightMultiplier = isPriority ? 1.5 : 1.0;
      return {
        ...cat,
        isPriority,
        effectiveWeight: cat.weight * weightMultiplier,
      };
    });

    const sumWeights = adjustedWeights.reduce((acc, curr) => acc + curr.effectiveWeight, 0);

    // Non-contingency share occupies exactly 90% (leaving strictly 10% for Contingency reserve)
    const availablePercentage = 90.0;

    let computedRows: BudgetSplitRow[] = adjustedWeights.map((cat) => {
      const rawShare = (cat.effectiveWeight / sumWeights) * availablePercentage;
      const share = Math.round(rawShare * 10) / 10;
      const amount = Math.round((totalBudget * share) / 100);
      return {
        id: cat.id,
        category: cat.category,
        baseWeight: cat.weight,
        isPriority: cat.isPriority,
        share,
        amount,
      };
    });

    // Contingency reserve row (Strictly 10%)
    const contingencyShare = 10.0;
    const contingencyAmount = Math.round((totalBudget * contingencyShare) / 100);

    const contingencyRow: BudgetSplitRow = {
      id: 'contingency_reserve',
      category: 'Contingency reserve',
      baseWeight: 10,
      isPriority: false,
      share: contingencyShare,
      amount: contingencyAmount,
      isContingency: true,
    };

    // Calculate sum of amounts and balance minor rounding to equal totalBudget exactly
    const currentSum = computedRows.reduce((a, b) => a + b.amount, 0) + contingencyAmount;
    const diff = totalBudget - currentSum;
    if (diff !== 0 && computedRows.length > 0) {
      computedRows[0].amount += diff;
    }

    return [...computedRows, contingencyRow];
  }, [totalBudget, selectedPriorities]);

  // Master timeline with 25 milestone steps
  const allTimelineSteps = useMemo(() => [
    { id: 's1', task: 'Fix the budget and a first guest list', timing: '40 weeks before', category: 'Planning', date: '16 Nov 2026' },
    { id: 's2', task: 'Choose the date and muhurtham with family and priest', timing: '36 weeks before', category: 'Ceremony', date: '14 Dec 2026' },
    { id: 's3', task: 'Book the venue and nearby rooms', timing: '34 weeks before', category: 'Venue', date: '28 Dec 2026' },
    { id: 's4', task: 'Book photographer and videographer', timing: '30 weeks before', category: 'Photo', date: '25 Jan 2027' },
    { id: 's5', task: 'Shortlist caterers and hold a tasting', timing: '26 weeks before', category: 'Catering', date: '22 Feb 2027' },
    { id: 's6', task: 'Order outfits and start jewellery selection', timing: '24 weeks before', category: 'Attire', date: '8 Mar 2027' },
    { id: 's7', task: 'Design invitations and send save-the-dates', timing: '20 weeks before', category: 'Stationery', date: '5 Apr 2027' },
    { id: 's8', task: 'Book decorator, mandap structure, and floral production', timing: '18 weeks before', category: 'Decor', date: '19 Apr 2027' },
    { id: 's9', task: 'Confirm DJ, sound equipment, and sangeet choreography', timing: '16 weeks before', category: 'Music', date: '3 May 2027' },
    { id: 's10', task: 'Block hotel rooms and shuttle transit for outstation guests', timing: '14 weeks before', category: 'Travel', date: '17 May 2027' },
    { id: 's11', task: 'Finalize multi-course banquet menu and live counter stations', timing: '12 weeks before', category: 'Catering', date: '31 May 2027' },
    { id: 's12', task: 'Book bridal makeup artist (MUA) and schedule trial look', timing: '10 weeks before', category: 'Styling', date: '14 Jun 2027' },
    { id: 's13', task: 'Dispatch formal boxed invitations and digital RSVP tracking', timing: '8 weeks before', category: 'Stationery', date: '28 Jun 2027' },
    { id: 's14', task: 'Lock priest/pandit schedule and assemble samagri checklist', timing: '7 weeks before', category: 'Rituals', date: '5 Jul 2027' },
    { id: 's15', task: 'Conduct technical venue walkthrough for power drops and sound curfew', timing: '6 weeks before', category: 'Logistics', date: '12 Jul 2027' },
    { id: 's16', task: 'Procure return gifts, mithai hampers, and welcoming favors', timing: '5 weeks before', category: 'Favors', date: '19 Jul 2027' },
    { id: 's17', task: 'First outfit trials, alterations, and footwear pairing', timing: '4 weeks before', category: 'Attire', date: '26 Jul 2027' },
    { id: 's18', task: 'Freeze RSVP headcount and re-adjust dining seating plan', timing: '3 weeks before', category: 'Guest Ops', date: '2 Aug 2027' },
    { id: 's19', task: 'Curate sangeet song playlist and photo shot list with photographer', timing: '2 weeks before', category: 'Production', date: '9 Aug 2027' },
    { id: 's20', task: 'Review 10% contingency safety buffer with lead event coordinator', timing: '10 days before', category: 'Finance', date: '13 Aug 2027' },
    { id: 's21', task: 'Verify guest transport pickup schedule from airport and railway station', timing: '1 week before', category: 'Logistics', date: '16 Aug 2027' },
    { id: 's22', task: 'Final vendor coordination briefing and timeline sync call', timing: '4 days before', category: 'Operations', date: '19 Aug 2027' },
    { id: 's23', task: 'Pre-wedding mehendi, haldi staging, and welcome dinner', timing: '1 day before', category: 'Celebration', date: '22 Aug 2027' },
    { id: 's24', task: 'Wedding Day: Barat reception, mandap pheras, and royal banquet feast', timing: 'Day of Event', category: 'Execution', date: '23 Aug 2027' },
    { id: 's25', task: 'Vendor accounts sign-off, deposit settlements, and photo delivery tracking', timing: 'Post Event', category: 'Wrap-up', date: '25 Aug 2027' },
  ], []);

  const totalStepsCount = 25;
  const completedStepsCount = Object.values(completedSteps).filter(Boolean).length;

  const toggleStep = (id: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleBuildPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onPlanBuilt) {
      onPlanBuilt({
        eventName,
        eventType,
        eventDate,
        numberOfGuests,
        totalBudget,
        style,
        selectedPriorities,
        specialRequests,
        budgetRows,
      });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 font-sans">
      
      {/* Top Header matching Screenshot */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
          WEDDINGS, BIRTHDAYS AND COMMUNITY EVENTS
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Celebration Planner
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Tell us the basics. Get a rupee-exact budget split, a dated timeline, a vendor checklist with questions to ask, and ideas that fit your guests.
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT COLUMN: "Your event" form ================= */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Your event
          </h2>

          <form onSubmit={handleBuildPlanSubmit} className="space-y-5">
            
            {/* Type of event: Segmented pills */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Type of event
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'wedding', label: 'Wedding' },
                  { id: 'birthday', label: 'Birthday' },
                  { id: 'community', label: 'Community event' },
                ].map((t) => {
                  const isSelected = eventType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setEventType(t.id as any)}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all text-center cursor-pointer ${
                        isSelected
                          ? 'bg-[#26286b] dark:bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Event Name */}
            <div className="space-y-1.5">
              {/* FIX: a11y label association */}
              <label htmlFor="celebration-event-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Event name
              </label>
              <input
                id="celebration-event-name"
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Asha and Kiran's wedding"
                required
                className="w-full bg-slate-50 dark:bg-[#111a2e] border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Event Date */}
            <div className="space-y-1.5">
              {/* FIX: a11y label association */}
              <label htmlFor="celebration-event-date" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Event date
              </label>
              <div className="relative">
                <input
                  id="celebration-event-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-[#111a2e] border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Number of guests */}
            <div className="space-y-1.5">
              {/* FIX: a11y label association */}
              <label htmlFor="celebration-guest-count" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Number of guests
              </label>
              <input
                id="celebration-guest-count"
                type="number"
                min="5"
                max="5000"
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(parseInt(e.target.value, 10) || 10)}
                required
                className="w-full bg-slate-50 dark:bg-[#111a2e] border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 tabular-nums"
              />
            </div>

            {/* Total budget in rupees */}
            <div className="space-y-1.5">
              {/* FIX: a11y label association */}
              <label htmlFor="celebration-total-budget" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Total budget in rupees
              </label>
              <input
                id="celebration-total-budget"
                type="number"
                min="10000"
                step="5000"
                value={totalBudget}
                onChange={(e) => setTotalBudget(parseInt(e.target.value, 10) || 50000)}
                required
                className="w-full bg-slate-50 dark:bg-[#111a2e] border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 tabular-nums"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Enter the full amount you can spend, for example 1500000.
              </p>
            </div>

            {/* Style dropdown */}
            <div className="space-y-1.5">
              {/* FIX: a11y label association */}
              <label htmlFor="celebration-style-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Style
              </label>
              <select
                id="celebration-style-select"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#111a2e] border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Traditional">Traditional</option>
                <option value="Modern Luxe">Modern Luxe</option>
                <option value="Royal Heritage">Royal Heritage & Darbar</option>
                <option value="Minimalist Chic">Minimalist Chic</option>
                <option value="Beach / Destination">Beach / Destination</option>
                <option value="Garden Rustic">Garden Rustic</option>
              </select>
            </div>

            {/* Where should more money go? Choose up to 3 */}
            <div className="space-y-2 pt-1">
              <div>
                <span className="block text-xs font-bold text-slate-900 dark:text-white">
                  Where should more money go?
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Choose up to 3. {selectedPriorities.length} chosen.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {priorityOptions.map((opt) => {
                  const isChecked = selectedPriorities.includes(opt.id);
                  const inputId = `celebration-priority-${opt.id}`;
                  return (
                    <label
                      key={opt.id}
                      htmlFor={inputId}
                      className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <input
                        id={inputId}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePriority(opt.id)}
                        disabled={!isChecked && selectedPriorities.length >= 3}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Special requests (optional) */}
            <div className="space-y-1.5 pt-1">
              {/* FIX: a11y label association */}
              <label htmlFor="celebration-special-requests" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Special requests (optional)
              </label>
              <textarea
                id="celebration-special-requests"
                rows={3}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="For example: vegetarian menu, elders need seating, rain plan."
                className="w-full bg-slate-50 dark:bg-[#111a2e] border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                For example: vegetarian menu, elders need seating, rain plan.
              </p>
            </div>

            {/* Action Buttons: Build my plan & Reset */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#26286b] hover:bg-[#1f2057] dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Build my plan
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

          </form>
        </div>

        {/* ================= RIGHT COLUMN: Overview, Budget Split & Timeline ================= */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* CARD 1: Event Overview Card */}
          <div className="bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {eventName}
                </h3>
                {onOpenMasterplan && (
                  <button
                    onClick={onOpenMasterplan}
                    className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Genie Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This is an example plan. Change the details on the left and choose Build my plan.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 py-3 border-y border-slate-100 dark:border-slate-800/80">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  DATE
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                  {formattedEventDate}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  COUNTDOWN
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                  {countdownDays} days to go
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  GUESTS
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mt-0.5 tabular-nums">
                  {numberOfGuests}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  BUDGET
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mt-0.5 tabular-nums">
                  {formatCurrency(totalBudget, 'INR')}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  PER GUEST
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mt-0.5 tabular-nums">
                  ₹{perGuest.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Sub-navigation tabs: Budget | Timeline | Vendors | Ideas */}
            <div className="flex items-center gap-6 text-xs font-semibold border-b border-slate-100 dark:border-slate-800 pb-2">
              {[
                { id: 'budget', label: 'Budget' },
                { id: 'timeline', label: 'Timeline' },
                { id: 'vendors', label: 'Vendors' },
                { id: 'ideas', label: 'Ideas' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`transition-colors cursor-pointer ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400 pb-1'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Steps Progress Tracker */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{completedStepsCount} of {totalStepsCount} steps done</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {Math.round((completedStepsCount / totalStepsCount) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(completedStepsCount / totalStepsCount) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* CARD 2: Tab Content */}
          {activeTab === 'budget' && (
            <div className="bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Budget split
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Where each rupee goes, including a 10% reserve for surprises (Strict Policy Guaranteed)
                </p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 font-bold">CATEGORY</th>
                      <th className="py-2.5 font-bold text-right">SHARE</th>
                      <th className="py-2.5 font-bold text-right">AMOUNT</th>
                      <th className="py-2.5 font-bold pl-4 w-24"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {budgetRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-2">
                            <span>{row.category}</span>
                            {row.isPriority && (
                              <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                                Priority
                              </span>
                            )}
                            {row.isContingency && (
                              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                                Reserve
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-300 tabular-nums">
                          {row.share}%
                        </td>

                        <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                          ₹{row.amount.toLocaleString('en-IN')}
                        </td>

                        {/* Mini progress bar */}
                        <td className="py-2.5 pl-4">
                          <div className="w-20 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                row.isPriority
                                  ? 'bg-amber-500'
                                  : row.isContingency
                                  ? 'bg-emerald-500'
                                  : 'bg-[#2b2b80] dark:bg-indigo-500'
                              }`}
                              style={{ width: `${Math.min(100, row.share * 2.8)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* Total Row */}
                    <tr className="border-t-2 border-slate-300 dark:border-slate-700 font-bold text-xs">
                      <td className="py-3 text-slate-900 dark:text-white">
                        Total
                      </td>
                      <td className="py-3 text-right text-slate-900 dark:text-white tabular-nums">
                        100%
                      </td>
                      <td className="py-3 text-right text-slate-900 dark:text-white tabular-nums">
                        ₹{totalBudget.toLocaleString('en-IN')}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Safeguard Notice */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111a2e] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>10% Contingency Reserve locked for last-minute RSVPs</span>
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                  ₹{Math.round(totalBudget * 0.1).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          {/* CARD 3: Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Timeline
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Chronological milestone tasks synchronized to your event date
                </p>
              </div>

              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                {allTimelineSteps.map((step) => {
                  const isChecked = !!completedSteps[step.id];
                  return (
                    <div
                      key={step.id}
                      onClick={() => toggleStep(step.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-850 opacity-60'
                          : 'bg-white dark:bg-[#111a2e] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Handled by parent div
                        className="mt-0.5 w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-600 focus:ring-indigo-500 cursor-pointer"
                      />

                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-xs font-bold block ${
                            isChecked
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {step.task}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          {step.date} · {step.timing} · {step.category}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CARD 4: Vendors Tab */}
          {activeTab === 'vendors' && (
            <div className="bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Vendor Due Diligence Checklist
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Critical questions to ask and contract deliverables before booking
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    category: 'Venue & Banquet Hall',
                    question: 'What is the overtime policy past midnight? Is external catering allowed or is in-house mandatory?',
                    tip: 'Ensure acoustic curfews do not clash with sangeet sound equipment.',
                  },
                  {
                    category: 'Catering & Live Counters',
                    question: 'Are ingredients sourced farm-fresh? What is the staff-to-guest ratio for live chaat stations?',
                    tip: 'Mandate live food tasting and verify backup fuel burners for hot buffets.',
                  },
                  {
                    category: 'Photography & Videography',
                    question: 'How many dedicated candid shooters will be on-site? What is the turnaround time for teaser edits?',
                    tip: 'Demand raw footage storage guarantee for minimum 6 months.',
                  },
                  {
                    category: 'Decor & Mandap Architecture',
                    question: 'Does the quote cover breakdown cleanup and power backup generators?',
                    tip: 'Inspect 3D renders of stage lighting to ensure no harsh glares on bride & groom.',
                  },
                ].map((v, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-[#111a2e] border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">
                      {v.category}
                    </span>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      <strong>Question to Ask:</strong> "{v.question}"
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      <strong>Coordinator Tip:</strong> {v.tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CARD 5: Ideas Tab */}
          {activeTab === 'ideas' && (
            <div className="bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Ideas Fitted to {numberOfGuests} Guests ({style})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tailored concepts to delight your attendees and prevent bottlenecks
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111a2e] border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Dual-Sided Buffet Flow</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    With {numberOfGuests} attendees, set up twin mirroring culinary lanes so food queue times remain strictly under 4 minutes.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111a2e] border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <Building className="w-4 h-4 text-indigo-500" />
                    <span>Lounge Seating for Elders</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Reserve acoustic-dampened diwan seating in direct line-of-sight of the mandap/stage with dedicated servers for chai and snacks.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111a2e] border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <Lightbulb className="w-4 h-4 text-emerald-500" />
                    <span>Bespoke Mocktail / Gin Bar</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Signature botanical drinks named after the couple or milestone celebrants, garnished with dried edible flowers and dry-ice mist.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111a2e] border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <ShieldCheck className="w-4 h-4 text-rose-500" />
                    <span>Contingency Weather Plan</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Clear German waterproof pagoda canopy on standby if booking outdoor lawn pheras, funded by the 10% protected reserve.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
