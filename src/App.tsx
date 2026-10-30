import React, { useState } from 'react';
import { Header, AppView } from './components/Header';
import { CelebrationPlannerView } from './components/CelebrationPlannerView';
import { NewPlanView } from './components/NewPlanView';
import { CurrentPlanView } from './components/CurrentPlanView';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { SavedPlansDrawer } from './components/SavedPlansDrawer';
import { FullChecklistModal } from './components/FullChecklistModal';
import { BudgetDetailsModal } from './components/BudgetDetailsModal';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { ConfettiCanvas } from './components/ConfettiCanvas';
import { 
  parseEventRequestDeterministic, 
  generateGuestScaledCategories, 
  computeGuestCapacityMetrics, 
  generateVendorRfpMatrix,
  generateCreativeDirection,
  generateLogisticsPlan,
  INSTANT_PRESETS 
} from './utils/parser';
import { StructuredEventData, EventType, BudgetCategory } from './types/event';
import { CurrencyCode } from './utils/currency';

export function App() {
  // Main view state: 'planner' (Screenshot 3) | 'current_plan' (Screenshot 1) | 'new_plan' (Screenshot 2)
  const [activeView, setActiveView] = useState<AppView>('planner');

  // Seed saved plans with the first two high-fidelity presets
  const [savedPlans, setSavedPlans] = useState<StructuredEventData[]>(() => {
    const p1 = parseEventRequestDeterministic(INSTANT_PRESETS[0].text, {
      title: INSTANT_PRESETS[0].title,
      eventType: INSTANT_PRESETS[0].category,
      cityAndLocation: INSTANT_PRESETS[0].cityAndLocation,
      targetEventDate: INSTANT_PRESETS[0].targetEventDate,
      guestCount: INSTANT_PRESETS[0].guestCount,
      totalBudget: INSTANT_PRESETS[0].totalBudget,
      currency: INSTANT_PRESETS[0].currency,
    });
    p1.id = 'plan-preset-wedding';

    const p2 = parseEventRequestDeterministic(INSTANT_PRESETS[1].text, {
      title: INSTANT_PRESETS[1].title,
      eventType: INSTANT_PRESETS[1].category,
      cityAndLocation: INSTANT_PRESETS[1].cityAndLocation,
      targetEventDate: INSTANT_PRESETS[1].targetEventDate,
      guestCount: INSTANT_PRESETS[1].guestCount,
      totalBudget: INSTANT_PRESETS[1].totalBudget,
      currency: INSTANT_PRESETS[1].currency,
    });
    p2.id = 'plan-preset-birthday';

    return [p1, p2];
  });

  const [currentPlan, setCurrentPlan] = useState<StructuredEventData>(() => {
    return savedPlans[0];
  });

  // Modal and drawer visibility flags
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);
  const [isSavedPlansOpen, setIsSavedPlansOpen] = useState<boolean>(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState<boolean>(false);
  const [isBudgetDetailsOpen, setIsBudgetDetailsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Loading and celebration confetti states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Generate / Architect a new plan from the NewPlanView form
  const handleGeneratePlan = async (formData: {
    title: string;
    eventType: EventType;
    cityAndLocation: string;
    targetEventDate: string;
    guestCount: number;
    totalBudget: number;
    currency: CurrencyCode;
    notes?: string;
  }) => {
    setIsLoading(true);

    const briefCombined = `${formData.notes || ''} Event for ${formData.guestCount} guests in ${formData.cityAndLocation} with ${formData.currency} ${formData.totalBudget} budget.`;

    try {
      const response = await fetch('/api/parse-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: briefCombined,
          options: {
            title: formData.title,
            eventType: formData.eventType,
            cityAndLocation: formData.cityAndLocation,
            targetEventDate: formData.targetEventDate,
            guestCount: formData.guestCount,
            totalBudget: formData.totalBudget,
            currency: formData.currency,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.source === 'gemini_flash' && result.data && result.data.budget) {
          const aiData = result.data;
          const baseline = parseEventRequestDeterministic(briefCombined, formData);

          const expectedGuests = formData.guestCount || aiData.guestCount?.expected || baseline.guestCount.expected;
          const capacityMetrics = computeGuestCapacityMetrics(formData.eventType, expectedGuests);

          const categories = generateGuestScaledCategories(
            formData.eventType,
            expectedGuests,
            formData.totalBudget
          );

          const newMasterplan: StructuredEventData = {
            id: `plan-${Date.now()}`,
            createdAt: new Date().toISOString(),
            rawInputBrief: briefCombined,
            title: formData.title || aiData.title || baseline.title,
            eventType: formData.eventType,
            format: 'in_person',
            cityAndLocation: formData.cityAndLocation,
            targetEventDate: formData.targetEventDate,
            guestCount: {
              min: Math.round(expectedGuests * 0.9),
              max: Math.round(expectedGuests * 1.1),
              expected: expectedGuests,
              isEstimated: false,
              fallbackApplied: false,
            },
            capacityMetrics,
            duration: baseline.duration,
            targetSeasonOrDate: formData.targetEventDate,
            location: {
              cityOrRegion: formData.cityAndLocation,
              venueTypeRecommendation: capacityMetrics.recommendedVenueStyle,
              spaceRequirementsSqFt: capacityMetrics.sqFtTotal,
            },
            budget: {
              ...baseline.budget,
              totalBudgetProvided: true,
              totalBudgetAmount: formData.totalBudget,
              currency: formData.currency,
              categories,
            },
            creativeDirection: aiData.creativeDirection || baseline.creativeDirection,
            logistics: baseline.logistics,
            vendorRfpMatrix: baseline.vendorRfpMatrix,
            ambiguitiesAndFallbacks: baseline.ambiguitiesAndFallbacks,
          };

          setCurrentPlan(newMasterplan);
          setSavedPlans((prev) => [newMasterplan, ...prev.filter((p) => p.id !== newMasterplan.id)]);
          setIsLoading(false);
          setShowConfetti(true);
          setActiveView('current_plan');
          return;
        }
      }
    } catch {
      // High-performance deterministic engine handles the request seamlessly
    }

    // High performance deterministic fallback
    const deterministicPlan = parseEventRequestDeterministic(briefCombined, formData);
    deterministicPlan.id = `plan-${Date.now()}`;
    setCurrentPlan(deterministicPlan);
    setSavedPlans((prev) => [deterministicPlan, ...prev.filter((p) => p.id !== deterministicPlan.id)]);
    setIsLoading(false);
    setShowConfetti(true);
    setActiveView('current_plan');
  };

  // AI Assistant modification handler
  const handleApplyAssistantModification = async (instruction: string) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/parse-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: `${currentPlan.rawInputBrief}\n\nClient Directive Modification: ${instruction}`,
          options: {
            title: currentPlan.title,
            eventType: currentPlan.eventType,
            cityAndLocation: currentPlan.cityAndLocation,
            targetEventDate: currentPlan.targetEventDate,
            guestCount: currentPlan.guestCount.expected,
            totalBudget: currentPlan.budget.totalBudgetAmount || 500000,
            currency: currentPlan.budget.currency,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          const aiData = result.data;
          const updatedCategories = generateGuestScaledCategories(
            currentPlan.eventType,
            currentPlan.guestCount.expected,
            currentPlan.budget.totalBudgetAmount
          );

          const updated: StructuredEventData = {
            ...currentPlan,
            title: aiData.title || currentPlan.title,
            budget: {
              ...currentPlan.budget,
              categories: updatedCategories,
            },
            creativeDirection: aiData.creativeDirection || currentPlan.creativeDirection,
          };

          setCurrentPlan(updated);
          setSavedPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Deterministic adjustment
    }

    // FIX S8786 & S7773: Deterministic adjustment for quick guest count modifications
    const countMatch = instruction.match(/(\d+)\s+(?:guests|attendees|people)/i);
    if (countMatch) {
      const newCount = Number.parseInt(countMatch[1], 10);
      const newCapacity = computeGuestCapacityMetrics(currentPlan.eventType, newCount);
      const newCategories = generateGuestScaledCategories(
        currentPlan.eventType,
        newCount,
        currentPlan.budget.totalBudgetAmount
      );
      const updatedRfps = generateVendorRfpMatrix(newCategories, newCount, newCapacity);

      const updated: StructuredEventData = {
        ...currentPlan,
        guestCount: {
          ...currentPlan.guestCount,
          expected: newCount,
          min: Math.round(newCount * 0.9),
          max: Math.round(newCount * 1.1),
        },
        capacityMetrics: newCapacity,
        budget: {
          ...currentPlan.budget,
          categories: newCategories,
        },
        vendorRfpMatrix: updatedRfps,
      };

      setCurrentPlan(updated);
      setSavedPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }

    setIsLoading(false);
  };

  // Update category percentage from modal
  const handleUpdateCategoryPercentage = (categoryId: string, newPercentage: number) => {
    // Preserve 10% contingency rule
    if (categoryId === 'contingency') return;

    const currentCategories = currentPlan.budget.categories;
    const targetCat = currentCategories.find((c) => c.id === categoryId);
    if (!targetCat) return;

    const diff = newPercentage - targetCat.percentage;
    const otherNonContingency = currentCategories.filter(
      (c) => c.id !== categoryId && !c.isContingency
    );

    if (otherNonContingency.length === 0) return;

    const adjustmentPerCat = diff / otherNonContingency.length;

    const updatedCategories: BudgetCategory[] = currentCategories.map((c) => {
      if (c.id === categoryId) {
        return {
          ...c,
          percentage: newPercentage,
          allocatedAmount: currentPlan.budget.totalBudgetAmount
            ? Math.round((currentPlan.budget.totalBudgetAmount * newPercentage) / 100)
            : undefined,
        };
      }
      if (!c.isContingency) {
        const adjusted = Math.max(1, Math.round((c.percentage - adjustmentPerCat) * 10) / 10);
        return {
          ...c,
          percentage: adjusted,
          allocatedAmount: currentPlan.budget.totalBudgetAmount
            ? Math.round((currentPlan.budget.totalBudgetAmount * adjusted) / 100)
            : undefined,
        };
      }
      return c;
    });

    const updatedPlan: StructuredEventData = {
      ...currentPlan,
      budget: {
        ...currentPlan.budget,
        categories: updatedCategories,
      },
    };

    setCurrentPlan(updatedPlan);
    setSavedPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#070b14] text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      
      {/* Celebration Confetti Burst upon Plan Generation */}
      <ConfettiCanvas
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* Top Header Matching Screenshots 1 & 2 */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        savedPlansCount={savedPlans.length}
        onOpenSavedPlans={() => setIsSavedPlansOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasCurrentPlan={!!currentPlan}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1">
        {activeView === 'planner' && (
          <CelebrationPlannerView
            onPlanBuilt={(summary) => {
              setShowConfetti(true);
              const updated = parseEventRequestDeterministic(
                `${summary.specialRequests || ''} ${summary.style} ${summary.eventType} celebration for ${summary.numberOfGuests} guests on ${summary.eventDate} with ₹${summary.totalBudget} budget. Priorities: ${summary.selectedPriorities.join(', ')}`,
                {
                  title: summary.eventName,
                  eventType: summary.eventType === 'birthday' ? 'private_celebration' : summary.eventType === 'community' ? 'festival' : 'wedding',
                  cityAndLocation: 'Udaipur, Rajasthan',
                  targetEventDate: summary.eventDate,
                  guestCount: summary.numberOfGuests,
                  totalBudget: summary.totalBudget,
                  currency: 'INR',
                }
              );
              setCurrentPlan(updated);
              setSavedPlans((prev) => [updated, ...prev.filter((p) => p.id !== updated.id)]);
            }}
            onOpenMasterplan={() => setActiveView('current_plan')}
          />
        )}

        {activeView === 'current_plan' && (
          <CurrentPlanView
            eventData={currentPlan}
            onOpenChecklistModal={() => setIsChecklistOpen(true)}
            onOpenBudgetModal={() => setIsBudgetDetailsOpen(true)}
          />
        )}

        {activeView === 'new_plan' && (
          <NewPlanView
            onGeneratePlan={handleGeneratePlan}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090e1a] py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-300">EventGenie AI</span>
            <span>·</span>
            <span>Intelligent Celebration Architect</span>
            <span>·</span>
            <span className="text-amber-400 font-medium">10% Contingency Safety Reserve Locked</span>
            <span>·</span>
            <span className="text-slate-400">Zero Price Hallucination Policy</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Engine Safeguards
            </button>
            <span>·</span>
            <button
              onClick={() => setIsExportOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              Export Dossier
            </button>
          </div>
        </div>
      </footer>

      {/* Slide-over Drawers */}
      <AiAssistantDrawer
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        eventData={currentPlan}
        onApplyModification={handleApplyAssistantModification}
        isLoading={isLoading}
      />

      <SavedPlansDrawer
        isOpen={isSavedPlansOpen}
        onClose={() => setIsSavedPlansOpen(false)}
        savedPlans={savedPlans}
        currentPlanId={currentPlan?.id || ''}
        onSelectPlan={(plan) => {
          setCurrentPlan(plan);
          setActiveView('current_plan');
        }}
        onDeletePlan={(planId) => {
          setSavedPlans((prev) => prev.filter((p) => p.id !== planId));
        }}
      />

      {/* Modals */}
      <FullChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
        milestones={currentPlan?.logistics?.keyMilestones || []}
      />

      <BudgetDetailsModal
        isOpen={isBudgetDetailsOpen}
        onClose={() => setIsBudgetDetailsOpen(false)}
        budget={currentPlan.budget}
        onUpdateCategoryPercentage={handleUpdateCategoryPercentage}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        eventData={currentPlan}
      />

    </div>
  );
}

export default App;
