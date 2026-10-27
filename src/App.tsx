import React, { useState } from 'react';
import { Header } from './components/Header';
import { BriefInput } from './components/BriefInput';
import { OverviewView } from './components/OverviewView';
import { BudgetAllocationView } from './components/BudgetAllocationView';
import { LogisticsView } from './components/LogisticsView';
import { CreativeDirectionView } from './components/CreativeDirectionView';
import { VendorRfpView } from './components/VendorRfpView';
import { ExportModal } from './components/ExportModal';
import { 
  parseEventRequestDeterministic, 
  generateGuestScaledCategories, 
  computeGuestCapacityMetrics, 
  generateVendorRfpMatrix,
  generateCreativeDirection,
  generateLogisticsPlan,
  SAMPLE_BRIEFS 
} from './utils/parser';
import { StructuredEventData, BudgetBreakdown } from './types/event';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [currentBrief, setCurrentBrief] = useState<string>(SAMPLE_BRIEFS[0].text);
  const [eventData, setEventData] = useState<StructuredEventData>(() =>
    parseEventRequestDeterministic(SAMPLE_BRIEFS[0].text)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [parseEngineSource, setParseEngineSource] = useState<'deterministic' | 'gemini_flash'>('deterministic');

  const handleParse = async (briefText: string) => {
    setIsLoading(true);
    setCurrentBrief(briefText);

    try {
      const response = await fetch('/api/parse-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: briefText }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.source === 'gemini_flash' && result.data && result.data.budget) {
          const aiData = result.data;
          const deterministicBaseline = parseEventRequestDeterministic(briefText);

          const expectedGuests = aiData.guestCount?.expected || deterministicBaseline.guestCount.expected;
          const capacityMetrics = computeGuestCapacityMetrics(
            aiData.eventType || deterministicBaseline.eventType,
            expectedGuests
          );

          // Guarantee strict 10% contingency rule and guest scaling on AI output
          let categories = generateGuestScaledCategories(
            aiData.eventType || deterministicBaseline.eventType,
            expectedGuests,
            aiData.budget?.totalBudgetAmount || null
          );

          const isFallback = aiData.guestCount?.fallbackApplied || deterministicBaseline.guestCount.fallbackApplied;
          const fallbackDesc = aiData.guestCount?.fallbackDescription || deterministicBaseline.guestCount.fallbackDescription;

          const combinedData: StructuredEventData = {
            id: `evt-${Date.now()}`,
            createdAt: new Date().toISOString(),
            rawInputBrief: briefText,
            title: aiData.title || deterministicBaseline.title,
            eventType: aiData.eventType || deterministicBaseline.eventType,
            format: aiData.format || deterministicBaseline.format,
            guestCount: {
              min: aiData.guestCount?.min || deterministicBaseline.guestCount.min,
              max: aiData.guestCount?.max || deterministicBaseline.guestCount.max,
              expected: expectedGuests,
              isEstimated: aiData.guestCount?.isEstimated ?? deterministicBaseline.guestCount.isEstimated,
              fallbackApplied: isFallback,
              fallbackDescription: isFallback ? fallbackDesc : undefined,
            },
            capacityMetrics,
            duration: aiData.duration || deterministicBaseline.duration,
            targetSeasonOrDate: aiData.targetSeasonOrDate || deterministicBaseline.targetSeasonOrDate,
            location: {
              cityOrRegion: aiData.location?.cityOrRegion || deterministicBaseline.location.cityOrRegion,
              venueTypeRecommendation: capacityMetrics.recommendedVenueStyle,
              spaceRequirementsSqFt: capacityMetrics.sqFtTotal,
            },
            budget: {
              ...deterministicBaseline.budget,
              totalBudgetProvided: !!aiData.budget?.totalBudgetAmount,
              totalBudgetAmount: aiData.budget?.totalBudgetAmount || null,
              categories,
            },
            creativeDirection: aiData.creativeDirection || deterministicBaseline.creativeDirection,
            logistics: deterministicBaseline.logistics,
            vendorRfpMatrix: deterministicBaseline.vendorRfpMatrix,
            ambiguitiesAndFallbacks: [
              ...(deterministicBaseline.ambiguitiesAndFallbacks || []),
              ...(aiData.ambiguitiesAndFallbacks || []),
            ],
          };

          setEventData(combinedData);
          setParseEngineSource('gemini_flash');
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('API route fallback to local parser:', err);
    }

    // High-performance deterministic coordinator fallback
    const parsed = parseEventRequestDeterministic(briefText);
    setEventData(parsed);
    setParseEngineSource('deterministic');
    setIsLoading(false);
  };

  const handleUpdateBudget = (updatedBudget: BudgetBreakdown) => {
    const updatedRfps = generateVendorRfpMatrix(
      updatedBudget.categories,
      eventData.guestCount.expected,
      eventData.capacityMetrics
    );

    setEventData((prev) => ({
      ...prev,
      budget: updatedBudget,
      vendorRfpMatrix: updatedRfps,
    }));
  };

  // Live Guest-Driven Scaling Handler (Rule 1)
  const handleGuestCountChange = (newCount: number) => {
    const clampedCount = Math.max(5, Math.min(2500, newCount));
    const newCapacity = computeGuestCapacityMetrics(eventData.eventType, clampedCount);
    const newCategories = generateGuestScaledCategories(
      eventData.eventType,
      clampedCount,
      eventData.budget.totalBudgetAmount
    );

    const perGuest = eventData.budget.totalBudgetAmount
      ? Math.round(eventData.budget.totalBudgetAmount / clampedCount)
      : null;

    const newRfpMatrix = generateVendorRfpMatrix(newCategories, clampedCount, newCapacity);
    const newCreative = generateCreativeDirection(
      eventData.eventType,
      eventData.rawInputBrief,
      clampedCount,
      newCapacity
    );
    const newLogistics = generateLogisticsPlan(
      eventData.eventType,
      eventData.duration.days,
      eventData.duration.summary,
      clampedCount,
      newCapacity
    );

    setEventData((prev) => ({
      ...prev,
      guestCount: {
        ...prev.guestCount,
        expected: clampedCount,
        min: Math.round(clampedCount * 0.9),
        max: Math.round(clampedCount * 1.1),
      },
      capacityMetrics: newCapacity,
      location: {
        ...prev.location,
        venueTypeRecommendation: newCapacity.recommendedVenueStyle,
        spaceRequirementsSqFt: newCapacity.sqFtTotal,
      },
      budget: {
        ...prev.budget,
        categories: newCategories,
        costPerGuestBenchmark: {
          estimatedPerGuest: perGuest,
          tier: perGuest && perGuest < 200 ? 'budget' : perGuest && perGuest > 800 ? 'luxury' : 'moderate',
          note: `Dynamically scaled for ${clampedCount} attendees (${newCapacity.tierLabel}).`,
        },
      },
      vendorRfpMatrix: newRfpMatrix,
      creativeDirection: newCreative,
      logistics: newLogistics,
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-400 selection:text-neutral-950">
      {/* Top Bar Contract Compliant Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        hasData={!!eventData}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Natural Language Brief Parser Section */}
        <BriefInput
          currentBrief={currentBrief}
          onParse={handleParse}
          isLoading={isLoading}
        />

        {/* Tab Viewport Navigation Bar (Mobile / Responsive) */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto pb-2 border-b border-neutral-800 text-xs">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'budget', label: 'Budget & 10% Buffer' },
            { id: 'logistics', label: 'Logistics' },
            { id: 'creative', label: 'Creative' },
            { id: 'rfp', label: 'RFPs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-400 text-neutral-950 font-semibold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Workspace Active Views */}
        <div className="transition-opacity duration-200">
          {activeTab === 'overview' && (
            <OverviewView
              eventData={eventData}
              onNavigateTab={(tabId) => setActiveTab(tabId)}
              onGuestCountChange={handleGuestCountChange}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetAllocationView
              budget={eventData.budget}
              expectedGuests={eventData.guestCount.expected}
              capacityMetrics={eventData.capacityMetrics}
              onUpdateBudget={handleUpdateBudget}
              onGuestCountChange={handleGuestCountChange}
            />
          )}

          {activeTab === 'logistics' && (
            <LogisticsView logistics={eventData.logistics} />
          )}

          {activeTab === 'creative' && (
            <CreativeDirectionView creative={eventData.creativeDirection} />
          )}

          {activeTab === 'rfp' && (
            <VendorRfpView
              rfpItems={eventData.vendorRfpMatrix}
              eventTitle={eventData.title}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">EventCraft Logistics Coordinator</span>
            <span aria-hidden="true">·</span>
            <span>Guest-Driven Scaling Engine</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400/90 font-medium">10% Contingency Buffer for Last-Minute RSVPs</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span>Engine: {parseEngineSource === 'gemini_flash' ? 'Gemini 3.8 Flash' : 'Deterministic Coordinator'}</span>
            <button
              onClick={() => setIsExportOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              Export JSON / Spec
            </button>
          </div>
        </div>
      </footer>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        eventData={eventData}
      />
    </div>
  );
}

export default App;
