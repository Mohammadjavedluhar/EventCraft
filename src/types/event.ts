import { CurrencyCode } from '../utils/currency';

export type EventType = 
  | 'wedding'
  | 'private_celebration'
  | 'conference'
  | 'festival'
  | 'gala'
  | 'product_launch'
  | 'retreat'
  | 'exhibition'
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
  contingencyAbsorbedGuests: number;
  cateringDynamicRationale: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  percentage: number; // e.g. 30 for 30%
  description: string;
  allocatedAmount?: number;
  color?: string; // Hex color for SVG Donut and Bar charts
  isContingency?: boolean; // Strictly true for the 10% contingency buffer
  scopeNotes: string[];
}

export interface BudgetBreakdown {
  totalBudgetProvided: boolean;
  totalBudgetAmount: number | null;
  currency: CurrencyCode;
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

export interface MilestoneItem {
  id: string;
  timing: string;
  category: string;
  dateDisplay: string;
  task: string;
  criticality: 'HIGH PRIORITY' | 'MEDIUM PRIORITY' | 'ESSENTIAL';
  completed?: boolean;
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
  keyMilestones: MilestoneItem[];
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
  cityAndLocation: string;
  targetEventDate: string;
  guestCount: {
    min: number;
    max: number;
    expected: number;
    isEstimated: boolean;
    fallbackApplied: boolean;
    fallbackDescription?: string;
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
