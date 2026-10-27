export type EventType = 
  | 'conference'
  | 'gala'
  | 'wedding'
  | 'product_launch'
  | 'retreat'
  | 'exhibition'
  | 'private_celebration'
  | 'other';

export type EventFormat = 'in_person' | 'hybrid' | 'virtual';

export type GuestScaleTier = 'intimate' | 'mid' | 'large' | 'mega';

export interface GuestCapacityMetrics {
  scaleTier: GuestScaleTier;
  tierLabel: string;
  recommendedVenueStyle: string;
  sqFtTotal: number;
  sqFtPerGuest: number;
  barsRecommended: number;
  restroomsRecommended: number;
  checkInKiosks: number;
  contingencyAbsorbedGuests: number; // How many last-minute arrivals the 10% buffer absorbs
  cateringDynamicRationale: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  percentage: number; // e.g. 25 for 25%
  description: string;
  allocatedAmount?: number; // Calculated only if total budget is supplied
  isContingency?: boolean; // Strictly true for the 10% contingency buffer
  scopeNotes: string[];
}

export interface BudgetBreakdown {
  totalBudgetProvided: boolean;
  totalBudgetAmount: number | null; // e.g. 120000 or null if unspecified
  currency: string;
  contingencyPercentage: number; // Strictly 10.0
  categories: BudgetCategory[];
  costPerGuestBenchmark?: {
    estimatedPerGuest: number | null;
    tier: 'budget' | 'moderate' | 'premium' | 'luxury';
    note: string;
  };
  policyComplianceNotice: string;
}

export interface AmbiguityResolution {
  field: string;
  issue: string;
  fallbackApplied: string;
  severity: 'low' | 'medium' | 'high';
}

export interface TimelinePhase {
  time: string;
  title: string;
  duration: string;
  zone: string;
  logisticsLead: string;
  details: string;
  contingencyTrigger?: string;
}

export interface VendorRfpItem {
  id: string;
  category: string;
  percentageAllocation: number;
  allocatedBudgetDisplay: string;
  scopeOfWork: string[];
  selectionCriteria: string[];
  keyVendorQuestions: string[];
  timelineRequirement: string;
}

export interface CreativeDirection {
  conceptTitle: string;
  tagline: string;
  narrative: string;
  colorPalette: {
    name: string;
    hex: string;
    role: string;
  }[];
  materiality: string[];
  lightingDesign: {
    ambient: string;
    focal: string;
    accent: string;
  };
  sensoryProfile: {
    acoustic: string;
    olfactory: string;
    taste: string;
  };
  spatialZones: {
    name: string;
    capacityPercentage: number;
    description: string;
    keyElements: string[];
  }[];
}

export interface LogisticsPlan {
  runOfShow: TimelinePhase[];
  keyMilestones: {
    timing: string;
    task: string;
    criticality: 'essential' | 'recommended' | 'optional';
  }[];
  riskMatrix: {
    risk: string;
    impact: 'low' | 'moderate' | 'critical';
    mitigationStrategy: string;
    contingencyAction: string;
  }[];
}

export interface StructuredEventData {
  id: string;
  createdAt: string;
  rawInputBrief: string;
  title: string;
  eventType: EventType;
  format: EventFormat;
  guestCount: {
    min: number;
    max: number;
    expected: number;
    isEstimated: boolean;
    fallbackApplied: boolean;
    fallbackDescription?: string; // Explicit statement required by Rule 4
  };
  capacityMetrics: GuestCapacityMetrics;
  duration: {
    days: number;
    hoursPerDay: number;
    summary: string;
  };
  targetSeasonOrDate: string;
  location: {
    cityOrRegion: string;
    venueTypeRecommendation: string;
    spaceRequirementsSqFt: number;
  };
  budget: BudgetBreakdown;
  creativeDirection: CreativeDirection;
  logistics: LogisticsPlan;
  vendorRfpMatrix: VendorRfpItem[];
  ambiguitiesAndFallbacks: AmbiguityResolution[];
}
