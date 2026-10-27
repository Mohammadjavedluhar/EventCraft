import { 
  StructuredEventData, 
  EventType, 
  EventFormat, 
  BudgetCategory, 
  BudgetBreakdown, 
  AmbiguityResolution,
  TimelinePhase,
  VendorRfpItem,
  CreativeDirection,
  LogisticsPlan,
  GuestScaleTier,
  GuestCapacityMetrics
} from '../types/event';

export const SAMPLE_BRIEFS = [
  {
    title: "Austin Tech Summit 2026",
    label: "Large Conference · 450 Attendees · $150,000",
    text: "We need a 3-day tech developer summit in Austin for 450 guests in October 2026. Total budget is $150,000. Cyber-industrial modern aesthetic with immersive lighting, keynotes, hackathon breakout zones, gourmet food trucks/catering, and a rooftop networking afterparty."
  },
  {
    title: "Intimate Napa Valley Vineyard Wedding (Unspecified Count)",
    label: "Wedding Fallback · Unspecified Headcount (Defaults to 100) · $95,000",
    text: "Planning a luxury wedding weekend in Napa Valley with wine tasting dinner, outdoor sunset ceremony, and tented pavilion reception. Budget is $95,000. Warm terracotta, linen, and olive grove aesthetic with farm-to-table dining and acoustic guitar."
  },
  {
    title: "Milestone 40th Birthday Dinner (Unspecified Count)",
    label: "Birthday Fallback · Unspecified Headcount (Defaults to 30)",
    text: "Cozy celebration dinner and cocktail party for a 40th birthday in a private loft. Speakeasy atmosphere with custom mixology, passed canapés, low jazz music, and dim candlelit ambiance."
  },
  {
    title: "Mega Global Developer Expo",
    label: "Mega Scale · 850 Attendees · High-Throughput Catering",
    text: "Annual flagship developer conference for 850 engineers and press. Requires a massive keynote hall, heavy audiovisual livestream rigging, dual-sided continuous catering stations, and sponsor exhibit booths."
  },
  {
    title: "Executive Offsite Retreat (Ambiguous & Math Conflict)",
    label: "Retreat · Ambiguous Headcount & Conflicting Budget Line Items",
    text: "Need an executive leadership retreat in the mountains. We might have 20 or 35 leaders for a couple of days. Budget says $50,000 total, but department requested $30,000 for luxury cabins, $20,000 for dining and wine, $15,000 for team workshops, and $5,000 for shuttle transport."
  }
];

export function getGuestScaleTier(count: number): { tier: GuestScaleTier; label: string } {
  if (count <= 35) return { tier: 'intimate', label: 'Intimate / Micro Scale (≤35 Guests)' };
  if (count <= 150) return { tier: 'mid', label: 'Mid-Scale Assembly (36–150 Guests)' };
  if (count <= 400) return { tier: 'large', label: 'Large-Scale Production (151–400 Guests)' };
  return { tier: 'mega', label: 'Mega / Festival Scale (401+ Guests)' };
}

export function computeGuestCapacityMetrics(
  eventType: EventType,
  expectedGuests: number
): GuestCapacityMetrics {
  const { tier, label } = getGuestScaleTier(expectedGuests);

  // Dynamic sq ft per guest based on scale & archetype
  let sqFtPerGuest = 25;
  if (eventType === 'wedding') sqFtPerGuest = tier === 'intimate' ? 45 : 35;
  else if (eventType === 'gala') sqFtPerGuest = 32;
  else if (eventType === 'retreat') sqFtPerGuest = tier === 'intimate' ? 60 : 40;
  else if (eventType === 'product_launch') sqFtPerGuest = 22;
  else if (eventType === 'private_celebration') sqFtPerGuest = tier === 'intimate' ? 35 : 25;
  else sqFtPerGuest = tier === 'mega' ? 28 : 24;

  const sqFtTotal = expectedGuests * sqFtPerGuest;

  let recommendedVenueStyle = "";
  if (tier === 'intimate') {
    recommendedVenueStyle = eventType === 'wedding'
      ? "Cozy Private Vineyard Villa & Intimate Garden Courtyard"
      : eventType === 'retreat'
      ? "Exclusive Mountain Alpine Sanctuary or Private Estate Buyout"
      : "Cozy Private Dining Loft, Speakeasy Salon, or Wine Vault";
  } else if (tier === 'mid') {
    recommendedVenueStyle = eventType === 'wedding'
      ? "Estate Pavilion with Tented Lawn Grounds"
      : eventType === 'gala'
      ? "Historic Townhouse Ballroom or Museum Atrium"
      : "Contemporary Event Space with Dedicated Breakout Salons";
  } else if (tier === 'large') {
    recommendedVenueStyle = eventType === 'conference'
      ? "Pillarless Convention Hall with Plenary Stage & 4 Breakout Suites"
      : eventType === 'gala'
      ? "Grand Municipal Ballroom with Dual Mezzanine Levels"
      : "Converted Clear-Span Industrial Warehouse with Rigging Grid";
  } else {
    recommendedVenueStyle = "Multi-Zone Convention Arena with Exposition Hall & Satellite Concourse";
  }

  // Bar and service ratios
  const barsRecommended = Math.max(1, Math.ceil(expectedGuests / (tier === 'intimate' ? 25 : 65)));
  const restroomsRecommended = Math.max(2, Math.ceil(expectedGuests / 40));
  const checkInKiosks = Math.max(1, Math.ceil(expectedGuests / (tier === 'intimate' ? 35 : 85)));
  
  // Last-minute additions absorbed by the mandatory 10% contingency
  const contingencyAbsorbedGuests = Math.max(3, Math.round(expectedGuests * 0.12));

  let cateringDynamicRationale = "";
  if (tier === 'intimate') {
    cateringDynamicRationale = "Intimate headcount allows bespoke culinary focus: Chef's multi-course plated tasting, high-touch sommelier pairings, and personalized guest service.";
  } else if (tier === 'mid') {
    cateringDynamicRationale = "Mid-scale crowd balances formal plated service with roaming hors d'oeuvres; moderate catering budget share with efficient galley kitchen footprint.";
  } else if (tier === 'large') {
    cateringDynamicRationale = "Large crowd requires expanded catering ratio (30-33%) to support high-throughput culinary stations, back-of-house staging, and synchronized service staff.";
  } else {
    cateringDynamicRationale = "Mega-scale requires dominant catering allocation (34-36%) for continuous multi-point satellite bars, dual-sided buffets, and high-volume commercial prep.";
  }

  return {
    scaleTier: tier,
    tierLabel: label,
    recommendedVenueStyle,
    sqFtTotal,
    sqFtPerGuest,
    barsRecommended,
    restroomsRecommended,
    checkInKiosks,
    contingencyAbsorbedGuests,
    cateringDynamicRationale,
  };
}

export function parseEventRequestDeterministic(rawInput: string): StructuredEventData {
  const text = rawInput.trim();
  const lower = text.toLowerCase();
  const ambiguities: AmbiguityResolution[] = [];

  // 1. Detect Event Type
  let eventType: EventType = 'conference';
  if (lower.includes('wedding') || lower.includes('nuptial') || lower.includes('bride') || lower.includes('groom')) {
    eventType = 'wedding';
  } else if (lower.includes('birthday') || lower.includes('anniversary') || lower.includes('milestone dinner') || lower.includes('celebration')) {
    eventType = 'private_celebration';
  } else if (lower.includes('gala') || lower.includes('charity') || lower.includes('fundraiser') || lower.includes('benefit') || lower.includes('auction')) {
    eventType = 'gala';
  } else if (lower.includes('retreat') || lower.includes('offsite') || lower.includes('leadership meeting') || lower.includes('executives')) {
    eventType = 'retreat';
  } else if (lower.includes('launch') || lower.includes('unveiling') || lower.includes('brand reveal') || lower.includes('showcase') || lower.includes('fashion')) {
    eventType = 'product_launch';
  } else if (lower.includes('exhibition') || lower.includes('expo') || lower.includes('trade show')) {
    eventType = 'exhibition';
  } else if (lower.includes('conference') || lower.includes('summit') || lower.includes('symposium') || lower.includes('hackathon')) {
    eventType = 'conference';
  } else {
    eventType = 'conference';
    ambiguities.push({
      field: 'Event Type',
      issue: 'Event archetype was not explicitly stated in the brief.',
      fallbackApplied: 'Defaulted to Professional Conference / Summit structural baseline.',
      severity: 'low'
    });
  }

  // 2. Format
  let format: EventFormat = 'in_person';
  if (lower.includes('hybrid') || (lower.includes('livestream') && lower.includes('in-person'))) {
    format = 'hybrid';
  } else if (lower.includes('virtual') || lower.includes('remote') || lower.includes('webinar')) {
    format = 'virtual';
  }

  // 3. Guest Count Parsing, Rule 4 Explicit Default Fallback
  let minGuests = 0;
  let maxGuests = 0;
  let expectedGuests = 0;
  let isEstimated = false;
  let fallbackApplied = false;
  let fallbackDescription = "";

  const rangeMatch = text.match(/(\d+)\s*(?:-|to)\s*(\d+)\s*(?:guests?|attendees?|people|participants|leaders|donors|execs|pax)?/i);
  const singleMatch = text.match(/(\d+)\s*(?:guests?|attendees?|people|participants|leaders|donors|execs|pax|engineers)/i);
  const forMatch = text.match(/(?:for|about|approx|roughly|around)\s*(\d+)/i);

  if (rangeMatch) {
    minGuests = parseInt(rangeMatch[1], 10);
    maxGuests = parseInt(rangeMatch[2], 10);
    if (minGuests > maxGuests) {
      const temp = minGuests;
      minGuests = maxGuests;
      maxGuests = temp;
      ambiguities.push({
        field: 'Guest Count Range',
        issue: `Inverted range detected (${maxGuests}-${minGuests}).`,
        fallbackApplied: `Corrected min to ${minGuests} and max to ${maxGuests}.`,
        severity: 'low'
      });
    }
    expectedGuests = Math.round((minGuests + maxGuests) / 2);
    isEstimated = true;
  } else if (singleMatch) {
    expectedGuests = parseInt(singleMatch[1], 10);
    minGuests = Math.round(expectedGuests * 0.9);
    maxGuests = Math.round(expectedGuests * 1.1);
  } else if (forMatch) {
    expectedGuests = parseInt(forMatch[1], 10);
    minGuests = Math.round(expectedGuests * 0.9);
    maxGuests = Math.round(expectedGuests * 1.1);
  } else {
    // CRITICAL LOGIC RULE 4:
    // If the user doesn't specify the number of people, assume a logical default fallback
    // (e.g., 100 guests for weddings, 30 for birthdays) and explicitly state it in your response description.
    fallbackApplied = true;
    const fallbackMap: Record<EventType, number> = {
      wedding: 100, // Explicitly requested in prompt
      private_celebration: 30, // Explicitly requested in prompt (birthdays)
      conference: 250,
      gala: 150,
      retreat: 25,
      product_launch: 150,
      exhibition: 400,
      other: 80
    };

    expectedGuests = fallbackMap[eventType] || 80;
    minGuests = Math.round(expectedGuests * 0.85);
    maxGuests = Math.round(expectedGuests * 1.15);
    isEstimated = true;

    fallbackDescription = `Notice: No guest count was specified in your brief. Assumed a logical default fallback of ${expectedGuests} guests for this ${eventType.replace('_', ' ')} (e.g., 100 for weddings, 30 for birthdays), and dynamically scaled all venue sizing, catering ratios, and percentage allocations accordingly.`;

    ambiguities.push({
      field: 'Guest Count (Explicit Fallback)',
      issue: 'No guest or attendee count was specified in the request brief.',
      fallbackApplied: `Applied Rule 4 standard default of ${expectedGuests} guests for ${eventType.replace('_', ' ')} (100 for weddings, 30 for birthdays).`,
      severity: 'high'
    });
  }

  // 4. Compute Dynamic Capacity Metrics
  const capacityMetrics = computeGuestCapacityMetrics(eventType, expectedGuests);

  // 5. Duration Parsing
  let days = 1;
  let hoursPerDay = 6;
  let durationSummary = "1 Day (6 hours)";

  const dayMatch = text.match(/(\d+)\s*(?:-|day|days)/i);
  if (dayMatch) {
    days = Math.max(1, Math.min(14, parseInt(dayMatch[1], 10)));
    durationSummary = `${days} Days`;
  } else if (lower.includes('weekend')) {
    days = 2;
    durationSummary = "2 Days (Weekend Program)";
  } else if (lower.includes('evening') || lower.includes('dinner') || lower.includes('gala')) {
    days = 1;
    hoursPerDay = 5;
    durationSummary = "Single Evening (5 hours)";
  } else {
    ambiguities.push({
      field: 'Duration',
      issue: 'Program duration unspecified.',
      fallbackApplied: 'Defaulted to 1 Day full execution schedule.',
      severity: 'low'
    });
  }

  // 6. Target Season / Timing
  let targetSeasonOrDate = "Autumn 2026 Target Window (Flexible Scheduling)";
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const foundMonth = months.find(m => lower.includes(m));
  const yearMatch = text.match(/202[5-9]/);
  
  if (foundMonth && yearMatch) {
    targetSeasonOrDate = `${foundMonth.charAt(0).toUpperCase() + foundMonth.slice(1)} ${yearMatch[0]}`;
  } else if (foundMonth) {
    targetSeasonOrDate = `${foundMonth.charAt(0).toUpperCase() + foundMonth.slice(1)} 2026`;
  } else if (lower.includes('spring')) {
    targetSeasonOrDate = 'Spring 2026';
  } else if (lower.includes('summer')) {
    targetSeasonOrDate = 'Summer 2026';
  } else if (lower.includes('fall') || lower.includes('autumn')) {
    targetSeasonOrDate = 'Autumn 2026';
  } else if (lower.includes('winter')) {
    targetSeasonOrDate = 'Winter 2026';
  }

  // 7. Location
  let cityOrRegion = "Metropolitan Hub";
  const knownCities = ['austin', 'new york', 'brooklyn', 'napa valley', 'napa', 'san francisco', 'chicago', 'miami', 'seattle', 'los angeles', 'boston', 'denver', 'london', 'toronto'];
  const foundCity = knownCities.find(c => lower.includes(c));
  if (foundCity) {
    cityOrRegion = foundCity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  } else if (lower.includes('mountains') || lower.includes('mountain')) {
    cityOrRegion = 'Mountain Lodge / Alpine Region';
  } else if (lower.includes('beach') || lower.includes('coastal')) {
    cityOrRegion = 'Coastal Resort Venue';
  }

  // 8. Total Budget Parsing & Math Conflict Detection
  let totalBudgetAmount: number | null = null;
  let totalBudgetProvided = false;

  const budgetCurrencyMatch = text.match(/\$\s*([\d,]+(?:\.\d+)?)\s*(k|thousand|million|m)?/i);
  const budgetWordMatch = text.match(/budget\s*(?:is|of|target)?\s*(?:around|approx|roughly)?\s*\$?\s*([\d,]+)\s*(k|thousand)?/i);

  if (budgetCurrencyMatch) {
    let num = parseFloat(budgetCurrencyMatch[1].replace(/,/g, ''));
    const unit = budgetCurrencyMatch[2]?.toLowerCase();
    if (unit === 'k' || unit === 'thousand') num *= 1000;
    if (unit === 'm' || unit === 'million') num *= 1000000;
    if (num > 0 && num < 100000000) {
      totalBudgetAmount = num;
      totalBudgetProvided = true;
    }
  } else if (budgetWordMatch) {
    let num = parseFloat(budgetWordMatch[1].replace(/,/g, ''));
    const unit = budgetWordMatch[2]?.toLowerCase();
    if (unit === 'k' || unit === 'thousand') num *= 1000;
    if (num > 0) {
      totalBudgetAmount = num;
      totalBudgetProvided = true;
    }
  }

  const lineItemMatches = [...text.matchAll(/\$\s*([\d,]+)\s*(?:for|on)\s*([a-zA-Z\s]+)/gi)];
  if (totalBudgetProvided && lineItemMatches.length >= 2) {
    let sumLineItems = 0;
    for (const m of lineItemMatches) {
      const val = parseFloat(m[1].replace(/,/g, ''));
      sumLineItems += val;
    }
    if (sumLineItems > (totalBudgetAmount as number) * 1.05) {
      ambiguities.push({
        field: 'Budget Math Reconciliation',
        issue: `Discrepancy detected: Mentioned sub-allocations ($${sumLineItems.toLocaleString()}) exceed declared total budget ($${totalBudgetAmount?.toLocaleString()}).`,
        fallbackApplied: `Applied professional coordinator fallback: Discarded contradictory raw figures and normalized all categories to balanced percentage shares, securing mandatory 10% contingency buffer.`,
        severity: 'high'
      });
    }
  }

  if (!totalBudgetProvided) {
    ambiguities.push({
      field: 'Total Budget (No Hallucination Policy)',
      issue: 'No monetary total stated in request brief.',
      fallbackApplied: 'Outputting guest-scaled percentage allocations with 10% contingency buffer and per-guest benchmark brackets (never hallucinating specific vendor prices).',
      severity: 'medium'
    });
  }

  // 9. DYNAMIC GUEST-DRIVEN BUDGET ALLOCATION ENGINE (CRITICAL RULE 1 & 2 & 3)
  // Non-contingency categories must sum to exactly 90.0% so that 90.0% + 10.0% Contingency = 100.0%
  const categories = generateGuestScaledCategories(eventType, expectedGuests, totalBudgetAmount);

  // Compute Cost Per Guest benchmark
  let perGuestEstimated: number | null = null;
  let tier: 'budget' | 'moderate' | 'premium' | 'luxury' = 'moderate';
  let tierNote = "Standard professional event tier";

  if (totalBudgetAmount && expectedGuests > 0) {
    perGuestEstimated = Math.round(totalBudgetAmount / expectedGuests);
    if (perGuestEstimated < 200) {
      tier = 'budget';
      tierNote = "Value-conscious operational tier; prioritize core essentials over bespoke production.";
    } else if (perGuestEstimated < 450) {
      tier = 'moderate';
      tierNote = "Balanced professional quality; solid production and hospitality standard.";
    } else if (perGuestEstimated < 900) {
      tier = 'premium';
      tierNote = "High-tier execution; bespoke culinary pairings, elevated lighting, and polished spatial branding.";
    } else {
      tier = 'luxury';
      tierNote = "Luxury tier; private venue buyout, white-glove hospitality, and architectural design.";
    }
  }

  const budget: BudgetBreakdown = {
    totalBudgetProvided,
    totalBudgetAmount,
    currency: 'USD ($)',
    contingencyPercentage: 10.0,
    categories,
    costPerGuestBenchmark: {
      estimatedPerGuest: perGuestEstimated,
      tier,
      note: tierNote
    },
    policyComplianceNotice: `Strict Policy Compliance: Percentage-based allocations dynamically scaled for ${expectedGuests} guests (${capacityMetrics.tierLabel}). Mandatory 10.0% contingency reserve locked for last-minute attendee additions and operational buffer.`
  };

  // 10. Creative Direction
  const creativeDirection: CreativeDirection = generateCreativeDirection(eventType, text, expectedGuests, capacityMetrics);

  // 11. Logistics Plan
  const logistics: LogisticsPlan = generateLogisticsPlan(eventType, days, durationSummary, expectedGuests, capacityMetrics);

  // 12. Vendor RFP Matrix
  const vendorRfpMatrix: VendorRfpItem[] = categories.map(cat => ({
    id: `rfp-${cat.id}`,
    category: cat.name,
    percentageAllocation: cat.percentage,
    allocatedBudgetDisplay: cat.allocatedAmount ? `$${cat.allocatedAmount.toLocaleString()}` : `${cat.percentage}% of overall budget`,
    scopeOfWork: cat.scopeNotes,
    selectionCriteria: [
      `Demonstrated capacity to handle ${expectedGuests} attendees (${capacityMetrics.tierLabel})`,
      'Proof of commercial liability insurance ($2M aggregate)',
      'Guaranteed on-site lead supervisor for full run of show',
      'Detailed itemized line-item proposal breakdown'
    ],
    keyVendorQuestions: [
      `What is your overtime hourly billing rate beyond the agreed timeline?`,
      `How do you handle day-of equipment redundancies or staff backups for ${expectedGuests} guests?`,
      `What are your electrical power, loading dock, and service staging clearances?`
    ],
    timelineRequirement: cat.isContingency
      ? `Maintained as liquid reserve to absorb up to ~${capacityMetrics.contingencyAbsorbedGuests} last-minute guest additions or day-of weather shifts`
      : 'RFP issuance: T-90 days; Final contract execution: T-45 days'
  }));

  // Title synthesis
  let title = "Curated Event Production Brief";
  if (lower.includes('austin')) title = "Austin Tech Summit 2026";
  else if (eventType === 'wedding') title = `Bespoke Vineyard Wedding Celebration (${expectedGuests} Guests)`;
  else if (eventType === 'private_celebration') title = `Milestone Celebration Dinner (${expectedGuests} Guests)`;
  else if (eventType === 'gala') title = `Annual Charity Benefactors Gala (${expectedGuests} Guests)`;
  else if (eventType === 'retreat') title = `Executive Strategic Leadership Offsite (${expectedGuests} Leaders)`;
  else if (eventType === 'product_launch') title = `Brand Horizon Runway & Showcase (${expectedGuests} Guests)`;
  else if (eventType === 'conference') title = `Global Innovation Summit (${expectedGuests} Attendees)`;

  return {
    id: `evt-${Date.now()}`,
    createdAt: new Date().toISOString(),
    rawInputBrief: text,
    title,
    eventType,
    format,
    guestCount: {
      min: minGuests,
      max: maxGuests,
      expected: expectedGuests,
      isEstimated,
      fallbackApplied,
      fallbackDescription: fallbackApplied ? fallbackDescription : undefined
    },
    capacityMetrics,
    duration: {
      days,
      hoursPerDay,
      summary: durationSummary
    },
    targetSeasonOrDate,
    location: {
      cityOrRegion,
      venueTypeRecommendation: capacityMetrics.recommendedVenueStyle,
      spaceRequirementsSqFt: capacityMetrics.sqFtTotal
    },
    budget,
    creativeDirection,
    logistics,
    vendorRfpMatrix,
    ambiguitiesAndFallbacks: ambiguities
  };
}

/**
 * CRITICAL RULE 1: Guest-Driven Scaling
 * Dynamically adjust budget allocation based on the number of people attending
 * (e.g., higher catering ratio for larger crowds, smaller cozy venues for minor counts).
 * Always preserves exactly 10.0% Contingency Buffer for last-minute guest additions.
 */
export function generateGuestScaledCategories(
  eventType: EventType,
  guestCount: number,
  totalBudgetAmount: number | null
): BudgetCategory[] {
  const { tier } = getGuestScaleTier(guestCount);
  const categories: BudgetCategory[] = [];

  // Dynamic weights based on guest count scale:
  // - Intimate (<= 35): Venue/buyout is higher % (small space buyout/privacy), Catering is boutique tasting (22%), Production is low (8%), Decor is high (18%).
  // - Mid (36 - 150): Balanced baseline (Catering 26%, Venue 24%, Production 15%, Decor 15%, Logistics 10%).
  // - Large (151 - 400): Catering scales up (30%), Production scales up (20%), Venue adjusts (20%), Decor (10%), Logistics/Staffing (10%).
  // - Mega (401+): Catering dominates (34%), Production heavy (22%), Venue (18%), Crowd Logistics/Staffing (10%), Decor (6%).

  let venuePct = 24;
  let cateringPct = 26;
  let productionPct = 16;
  let decorPct = 14;
  let staffingPct = 10;

  if (tier === 'intimate') {
    venuePct = 32;       // Private dining room or boutique estate buyout has high fixed baseline
    cateringPct = 22;     // High quality per guest, but smaller share of total budget
    productionPct = 8;    // Minimal acoustic/lighting rigging needed for intimate gathering
    decorPct = 18;        // High-touch bespoke tabletop styling & personalized florals
    staffingPct = 10;     // Personal concierge / private sommelier
  } else if (tier === 'mid') {
    venuePct = 25;
    cateringPct = 27;     // Balanced multi-course service
    productionPct = 14;
    decorPct = 14;
    staffingPct = 10;
  } else if (tier === 'large') {
    venuePct = 20;
    cateringPct = 31;     // Higher catering ratio for larger crowds (Rule 1)
    productionPct = 19;   // Scaled line array sound & dual presentation screens
    decorPct = 10;
    staffingPct = 10;
  } else {
    // Mega (401+)
    venuePct = 18;
    cateringPct = 34;     // Substantial catering ratio to feed high volume attendees (Rule 1)
    productionPct = 22;   // Heavy truss rigging, concert-grade sound, and LED walls
    decorPct = 6;
    staffingPct = 10;     // Registration kiosks, crowd control, and multi-shift crews
  }

  // Event archetype specific nuances
  if (eventType === 'wedding') {
    cateringPct += 2;
    decorPct += 2;
    productionPct -= 4;
  } else if (eventType === 'retreat') {
    venuePct += 6;
    productionPct -= 4;
    decorPct -= 2;
  } else if (eventType === 'product_launch') {
    productionPct += 5;
    decorPct -= 2;
    cateringPct -= 3;
  }

  // Guarantee exact sum of non-contingency categories = exactly 90.0%
  const sumRaw = venuePct + cateringPct + productionPct + decorPct + staffingPct;
  const factor = 90.0 / sumRaw;

  let normVenue = Math.round(venuePct * factor * 10) / 10;
  let normCatering = Math.round(cateringPct * factor * 10) / 10;
  let normProduction = Math.round(productionPct * factor * 10) / 10;
  let normDecor = Math.round(decorPct * factor * 10) / 10;
  // Balance remaining to exactly 90.0
  let normStaffing = Math.round((90.0 - (normVenue + normCatering + normProduction + normDecor)) * 10) / 10;

  // Build items
  const cateringTitle = tier === 'intimate' 
    ? 'Catering, Chef Tasting & Sommelier Service'
    : tier === 'mega'
    ? 'High-Volume Catering, Satellite Bars & Hospitality'
    : 'Catering, Bar & Hospitality Service';

  const venueTitle = tier === 'intimate'
    ? 'Venue Buyout & Private Salon Space'
    : tier === 'mega'
    ? 'Convention Arena & Exposition Infrastructure'
    : 'Venue Rental & Facility Infrastructure';

  categories.push({
    id: 'catering',
    name: cateringTitle,
    percentage: normCatering,
    description: `Dynamic Guest-Driven Allocation (${tier.toUpperCase()} TIER): Scaled for ${guestCount} attendees. Includes food prep, beverage service, and service staff.`,
    allocatedAmount: totalBudgetAmount ? Math.round(totalBudgetAmount * (normCatering / 100)) : undefined,
    isContingency: false,
    scopeNotes: [
      `Culinary menu calibrated for ${guestCount} attendees`,
      `Bar setup supporting ~${Math.max(1, Math.ceil(guestCount / (tier === 'intimate' ? 25 : 65)))} dedicated bar stations`,
      'Dietary restriction buffer (vegan, gluten-free, nut-free)',
      'Service staff and banquet captains'
    ]
  });

  categories.push({
    id: 'venue',
    name: venueTitle,
    percentage: normVenue,
    description: `Venue footprint scaled for ${guestCount} attendees. Accommodates ~${(guestCount * 28).toLocaleString()} sq. ft. clear floor space.`,
    allocatedAmount: totalBudgetAmount ? Math.round(totalBudgetAmount * (normVenue / 100)) : undefined,
    isContingency: false,
    scopeNotes: [
      'Facility rental and setup access windows',
      'HVAC, basic utilities, and power drops',
      'Restroom facilities supporting guest flow',
      'Load-in dock access and parking'
    ]
  });

  categories.push({
    id: 'production_av',
    name: 'Production, Audio & Lighting Rigging',
    percentage: normProduction,
    description: `Acoustic coverage and sightline illumination engineered for ${guestCount} guests.`,
    allocatedAmount: totalBudgetAmount ? Math.round(totalBudgetAmount * (normProduction / 100)) : undefined,
    isContingency: false,
    scopeNotes: [
      `Audio coverage calibrated for ${guestCount} listener field`,
      'Stage scenic illumination and ambient room washes',
      'Presentation screens and wireless microphones',
      'Technical audio/lighting console operators'
    ]
  });

  categories.push({
    id: 'creative_decor',
    name: 'Creative Direction, Styling & Florals',
    percentage: normDecor,
    description: `Spatial storytelling, table arrangements, entrance portal, and environmental branding.`,
    allocatedAmount: totalBudgetAmount ? Math.round(totalBudgetAmount * (normDecor / 100)) : undefined,
    isContingency: false,
    scopeNotes: [
      'Tabletop florals and candle lightscapes',
      'Entrance focal point and attendee photo moment',
      'Custom wayfinding signage and printed day-of menus',
      'Lounge seating vignette styling'
    ]
  });

  categories.push({
    id: 'operations_staffing',
    name: 'Operations, Registration & Guest Flow',
    percentage: normStaffing,
    description: `Guest registration check-in, floor hosts, logistics management, and liability coverage.`,
    allocatedAmount: totalBudgetAmount ? Math.round(totalBudgetAmount * (normStaffing / 100)) : undefined,
    isContingency: false,
    scopeNotes: [
      `Registration kiosk check-in flow (~${Math.max(1, Math.ceil(guestCount / 85))} stations)`,
      'On-site event logistics lead and stage manager',
      'Commercial event liability rider',
      'Waste management and post-event strike crew'
    ]
  });

  // CRITICAL RULE 3: Mandatory 10% Contingency Buffer for last-minute additions
  const contingencyAbsorbed = Math.max(3, Math.round(guestCount * 0.12));
  categories.push({
    id: 'contingency_buffer',
    name: 'Contingency & Last-Minute Guest Buffer',
    percentage: 10.0,
    description: `MANDATORY 10.0% SAFETY BUFFER: Specifically earmarked to absorb last-minute guest additions (up to ~${contingencyAbsorbed} unexpected RSVPs/walk-ins), plus weather contingencies, overtime labor, and day-of surge needs.`,
    allocatedAmount: totalBudgetAmount ? Math.round(totalBudgetAmount * 0.10) : undefined,
    isContingency: true,
    scopeNotes: [
      `Absorbs up to ~${contingencyAbsorbed} last-minute guest additions without budget overruns`,
      'Emergency catering plate overages and chair/table additions',
      'Weather-dependent acoustic or tenting adjustments',
      'Load-in/load-out overtime labor insurance'
    ]
  });

  return categories;
}

function generateCreativeDirection(
  eventType: EventType,
  briefText: string,
  guestCount: number,
  capacity: GuestCapacityMetrics
): CreativeDirection {
  const isIntimate = capacity.scaleTier === 'intimate';

  if (eventType === 'wedding') {
    return {
      conceptTitle: isIntimate ? "Tuscan Hearth & Intimate Grove" : "Terracotta Grove & Sun-Bleached Linen",
      tagline: isIntimate 
        ? `An intimate gathering for ${guestCount} closest family and friends under the olive trees.`
        : `Effortless romance and joyful fellowship for ${guestCount} celebrated guests.`,
      narrative: `Designed specifically for ${guestCount} guests. ${isIntimate ? 'Focuses on an intimate family-style banquet table with artisanal stoneware, private acoustic guitar, and candlelight.' : 'Orchestrates seamless movement from open-air vineyard ceremony to a spacious dining pavilion and vibrant dance floor.'}`,
      colorPalette: [
        { name: "Warm Terracotta", hex: "#C2410C", role: "Earthen Core Foundation" },
        { name: "Olive Leaf", hex: "#4D7C0F", role: "Vineyard Foliage Tone" },
        { name: "Oatmeal Linen", hex: "#F5F5F4", role: "Textile Ground" },
        { name: "Sunlit Sandstone", hex: "#E7E5E4", role: "Architectural Stone" },
        { name: "Smoked Espresso", hex: "#292524", role: "Calligraphy & Frame Accent" }
      ],
      materiality: ["Handmade raw terracotta pots", "Stonewashed natural Belgian linen", "Weathered French oak", "Matte ceramic plates"],
      lightingDesign: {
        ambient: "Golden hour sunset transition into soft 2200K overhead festival string lights.",
        focal: "Low glass hurricane pillar candles lining the aisle and guest farm tables.",
        accent: "Concealed tree uplights casting soft leafy silhouettes onto the pavilion canvas."
      },
      sensoryProfile: {
        acoustic: isIntimate 
          ? "Unamplified Spanish fingerstyle guitar, allowing effortless conversational volume."
          : "Unamplified ceremony guitar transitioning to an 8-piece soul band for the evening.",
        olfactory: "Wild rosemary, blossoming olive flowers, and fresh woodsmoke from the outdoor kitchen.",
        taste: isIntimate
          ? "Family-style multi-course tasting of heritage estate olive oils, handmade pasta, and braised osso buco."
          : "Wood-fired sourdough, burrata with heirloom figs, estate cabernet sauvignon, and tiered olive oil wedding cake."
      },
      spatialZones: [
        {
          name: isIntimate ? "Hearthside Ceremony Garden" : "Ceremony Vineyard Lawn",
          capacityPercentage: 100,
          description: `Outdoor natural setting configured with comfortable seating for ${guestCount} guests.`,
          keyElements: ["Organic asymmetrical floral arch", "Natural oak ceremony benching", "Linen parasol station"]
        },
        {
          name: "Cocktail Olive Grove",
          capacityPercentage: 100,
          description: `Dedicated social area equipped with ${capacity.barsRecommended} service bar stations.`,
          keyElements: ["Custom copper bar", "Bistro seating vignettes", "Bocce ball court"]
        },
        {
          name: isIntimate ? "Private Villa Dining Table" : "Tented Dinner Pavilion",
          capacityPercentage: 100,
          description: `Dining space accommodating ${guestCount} seated attendees with ~${capacity.sqFtPerGuest} sq. ft. per guest.`,
          keyElements: [isIntimate ? "Continuous 30-foot family table" : "Round 60-inch guest tables", "Hanging greenery installations", "Oak dance floor"]
        }
      ]
    };
  }

  if (eventType === 'private_celebration') {
    return {
      conceptTitle: isIntimate ? "Velvet Speakeasy & Hearthfire Salon" : "Nocturne Celebration & Kinetic Revelry",
      tagline: `Curated celebration engineered for ${guestCount} cherished guests.`,
      narrative: `Scaled intentionally for ${guestCount} guests. Intimate bespoke mixology and acoustic resonance, emphasizing high-touch hospitality over cavernous hall emptiness.`,
      colorPalette: [
        { name: "Obsidian Slate", hex: "#0F172A", role: "Primary Deep Foundation" },
        { name: "Smoked Amber", hex: "#D97706", role: "Warm Firelight Accent" },
        { name: "Vintage Brass", hex: "#CA8A04", role: "Gilded Highlights" },
        { name: "Cream Parchment", hex: "#FEFCE8", role: "Warm Menu Text" },
        { name: "Midnight Bordeaux", hex: "#831843", role: "Celebratory Focus" }
      ],
      materiality: ["Fluted smoked glass", "Tufted cognac leather", "Brushed antiqued brass", "Raw linen napkins"],
      lightingDesign: {
        ambient: "Low-key 2000K warm amber room glow with dimmable architectural perimeter lights.",
        focal: "Flickering beeswax votives and pin-spots on the celebration cake and bar.",
        accent: "Concealed back-bar warm illumination highlighting vintage spirits collection."
      },
      sensoryProfile: {
        acoustic: "Curated vinyl lounge jazz transitioning to upbeat neo-soul at 68dB conversational ceiling.",
        olfactory: "Aged bourbon, cedarwood smoke, and sweet amber diffuser notes.",
        taste: "Smoked old fashioneds, chef-passed truffled arancini, and single-origin dark chocolate gateau."
      },
      spatialZones: [
        {
          name: "Speakeasy Welcome Lounge",
          capacityPercentage: 100,
          description: `Welcoming arrival parlor scaled for ${guestCount} guests with craft cocktail station.`,
          keyElements: ["Custom brass cocktail bar", "Leather Chesterfield seating", "Coat check closet"]
        },
        {
          name: "Main Dining & Celebration Salon",
          capacityPercentage: 100,
          description: `Dinner layout providing ~${capacity.sqFtPerGuest} sq ft per person for spacious comfort.`,
          keyElements: ["Plated dining tables", "Celebration toast podium", "Ambient candlelight runner"]
        }
      ]
    };
  }

  // Default / Conference
  return {
    conceptTitle: "Cyber-Industrial Precision & Human Velocity",
    tagline: `High-contrast architectural clarity scaled for ${guestCount} attendees.`,
    narrative: `Engineered specifically for ${guestCount} guests. ${capacity.cateringDynamicRationale}`,
    colorPalette: [
      { name: "Obsidian Slate", hex: "#0F172A", role: "Primary Deep Foundation" },
      { name: "Architectural Steel", hex: "#334155", role: "Structural Surface Tone" },
      { name: "Raw Ochre", hex: "#D97706", role: "Tactile Warmth Accent" },
      { name: "Crisp Chalk", hex: "#F8FAFC", role: "High-Legibility Type" },
      { name: "Electric Indigo", hex: "#4F46E5", role: "Keynote Focus Cue" }
    ],
    materiality: ["Matte black powder-coated aluminum", "Reclaimed cedar timbers", "Textured acoustic charcoal felt", "Frosted acrylic wayfinding"],
    lightingDesign: {
      ambient: "Low-level 2400K architectural wash to lower eye fatigue during multi-hour sessions.",
      focal: "Pin-spot illumination on main stage speakers and demonstration hardware pedestals.",
      accent: "Linear warm-edge lighting along primary attendee circulation corridors."
    },
    sensoryProfile: {
      acoustic: `Tightly calibrated directional sound arrays ensuring 65dB speech clarity across all ${guestCount} seating positions.`,
      olfactory: "Subtle cedarwood and eucalyptus botanical notes dispersed at registration portals.",
      taste: "Continuous artisan pour-over coffee bar paired with savory protein bento boxes."
    },
    spatialZones: [
      {
        name: "Main Plenary Arena",
        capacityPercentage: 80,
        description: `Widescreen stage with tiered seating sized for ${Math.round(guestCount * 0.8)} simultaneous attendees.`,
        keyElements: ["Low-rise 36-inch stage deck", "Curved LED backdrop", "Dual confidence teleprompters"]
      },
      {
        name: "Hospitality & Networking Concourse",
        capacityPercentage: 60,
        description: `Spacious concourse supporting ${capacity.barsRecommended} beverage hubs and high-top networking.`,
        keyElements: ["High-top communal cedar tables", "Acoustic lounge perimeter", `${capacity.barsRecommended} Barista Counters`]
      }
    ]
  };
}

function generateLogisticsPlan(
  eventType: EventType,
  days: number,
  durationSummary: string,
  guestCount: number,
  capacity: GuestCapacityMetrics
): LogisticsPlan {
  const runOfShow: TimelinePhase[] = [
    {
      time: "07:00 - 09:30",
      title: "Logistics Load-In & Technical Rigging",
      duration: "2.5 hrs",
      zone: "Backstage / Loading Dock",
      logisticsLead: "Production Coordinator & Lead Rigger",
      details: `Dock arrival for ${capacity.scaleTier} production. Staging sound reinforcement and lighting calibrated for ${guestCount} attendees.`,
      contingencyTrigger: "If dock is delayed >20 mins, activate alternate street-level loading ramp team."
    },
    {
      time: "09:30 - 11:00",
      title: "Catering Setup & Bar Station Staging",
      duration: "1.5 hrs",
      zone: "Main Hall / Service Kitchen",
      logisticsLead: "Culinary Director & Lead Bartender",
      details: `Staging ${capacity.barsRecommended} bar stations and food service stations. Glassware polish and table linen placement for ${guestCount} seats.`,
      contingencyTrigger: "Ice buffer: extra 200 lbs stored in backup refrigerated trailer."
    },
    {
      time: "11:00 - 12:00",
      title: "Audio/Video Rehearsal & Staff Briefing",
      duration: "1.0 hr",
      zone: "Main Stage & Registration Foyer",
      logisticsLead: "Master Stage Manager",
      details: `Mic battery checks, clicker tests, slide advance sync, and briefing for ${capacity.checkInKiosks} registration hosts.`,
      contingencyTrigger: "Hardwire backup clickers staged at stage left lectern."
    },
    {
      time: "12:00 - 13:00",
      title: "Doors Open, Guest Check-In & Welcome Reception",
      duration: "1.0 hr",
      zone: "Registration Vestibule / Welcome Bar",
      logisticsLead: "Guest Experience Captain",
      details: `Expedited check-in across ${capacity.checkInKiosks} stations. 10% Contingency absorbs up to ~${capacity.contingencyAbsorbedGuests} last-minute walk-ins smoothly.`,
      contingencyTrigger: "If queue exceeds 12 persons, deploy roaming handheld tablet scanners."
    },
    {
      time: "13:00 - 15:30",
      title: "Core Program (Keynote / Vows / Plated Meal)",
      duration: "2.5 hrs",
      zone: "Main Hall",
      logisticsLead: "Run-of-Show Director",
      details: `Timed culinary service sequence, speaker introductions, and live engagement for ${guestCount} seated guests.`,
      contingencyTrigger: `Catering reserve: 5% dietary buffer prepped for ${Math.ceil(guestCount * 0.05)} unannounced allergies.`
    },
    {
      time: "15:30 - 17:30",
      title: "Social Networking, Climax / Dancing & Celebration",
      duration: "2.0 hrs",
      zone: "Main Lounge / Dance Floor",
      logisticsLead: "Entertainment & Floor Coordinator",
      details: `Live band / DJ transition, dessert stations open, bar service peak operation across ${capacity.barsRecommended} service bars.`,
      contingencyTrigger: "Security lead stationed near main exit for smooth egress."
    },
    {
      time: "17:30 - 19:30",
      title: "Guest Departure, Vendor Strike & Load-Out",
      duration: "2.0 hrs",
      zone: "Full Venue & Loading Bay",
      logisticsLead: "Strike Supervisor",
      details: "Rental item count, glassware crate packing, trash sorting, venue walk-through with site manager for deposit sign-off.",
      contingencyTrigger: "10% contingency buffer funds allocated for potential venue overtime authorization if required."
    }
  ];

  const keyMilestones = [
    { timing: "T-120 Days", task: `Execute contract for ${capacity.recommendedVenueStyle} sized for ${guestCount} guests.`, criticality: "essential" as const },
    { timing: "T-90 Days", task: `Issue percentage-based RFPs for catering and AV sized to ${capacity.scaleTier} specifications.`, criticality: "essential" as const },
    { timing: "T-60 Days", task: "Finalize creative moodboard, print layouts, sensory profile, and menu tasting selections.", criticality: "recommended" as const },
    { timing: "T-30 Days", task: `Lock guest RSVP count and verify 10% contingency buffer covers up to ${capacity.contingencyAbsorbedGuests} surprise additions.`, criticality: "essential" as const },
    { timing: "T-14 Days", task: "Distribute minute-by-minute Run of Show to all vendor leads; confirm dock schedule.", criticality: "essential" as const },
    { timing: "T-24 Hours", task: `Verify weather forecast, confirm generator/power redundancy, and pre-print ${guestCount} credentials.`, criticality: "essential" as const }
  ];

  const riskMatrix = [
    {
      risk: "Last-Minute Guest Surge / Unregistered Walk-Ins",
      impact: "moderate" as const,
      mitigationStrategy: `Designated 10% Contingency Reserve pre-authorizes catering kitchen and rental team to absorb up to +${capacity.contingencyAbsorbedGuests} additional guests.`,
      contingencyAction: "Host automatically seats walk-ins at pre-staged reserve tables; kitchen releases reserve meal courses."
    },
    {
      risk: "Power Failure or Audio System Dropout",
      impact: "critical" as const,
      mitigationStrategy: `Require dual redundant circuits on stage power and isolated UPS battery backup sized for ${guestCount}-person acoustic field.`,
      contingencyAction: "Console automatically fails over to UPS battery within 4ms; stage audio switches to secondary battery line."
    },
    {
      risk: "Adverse Weather (Rain / Excessive Heat)",
      impact: "moderate" as const,
      mitigationStrategy: `Reserve 48-hour tenting and climate control option sized for ${capacity.sqFtTotal.toLocaleString()} sq ft venue clearance.`,
      contingencyAction: "Trigger tenting contract at T-72 hours utilizing the 10% contingency budget reserve."
    },
    {
      risk: "Service Bar Congestion",
      impact: "moderate" as const,
      mitigationStrategy: `Deploy ${capacity.barsRecommended} separate bar stations to maintain attendee flow below 60 guests per bartender.`,
      contingencyAction: "Floater bartender activates portable satellite bar during initial welcome rush."
    }
  ];

  return {
    runOfShow,
    keyMilestones,
    riskMatrix
  };
}
