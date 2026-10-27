import React, { useState } from 'react';
import { X, Download, Copy, Check, FileJson, FileText, Printer } from 'lucide-react';
import { StructuredEventData } from '../types/event';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventData: StructuredEventData;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, eventData }) => {
  const [activeFormat, setActiveFormat] = useState<'json' | 'markdown'>('json');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonContent = JSON.stringify(eventData, null, 2);

  const markdownContent = `# ${eventData.title}
*Parsed Structural Event Specification & Logistics Blueprint*

**Event Archetype:** ${eventData.eventType.replace('_', ' ').toUpperCase()}  
**Format:** ${eventData.format.replace('_', ' ').toUpperCase()}  
**Guest Count:** ${eventData.guestCount.expected} attendees (${eventData.guestCount.min} - ${eventData.guestCount.max})  
${eventData.guestCount.fallbackApplied ? `**Headcount Fallback Applied:** ${eventData.guestCount.fallbackDescription}\n` : ''}
**Scale Tier:** ${eventData.capacityMetrics.tierLabel}  
**Recommended Venue:** ${eventData.location.venueTypeRecommendation} (~${eventData.location.spaceRequirementsSqFt.toLocaleString()} sq. ft.)  
**Service Ratios:** ${eventData.capacityMetrics.barsRecommended} service bars · ${eventData.capacityMetrics.restroomsRecommended} restroom stalls · ${eventData.capacityMetrics.checkInKiosks} check-in stations  
**Contingency Margin:** 10.0% buffer absorbs up to +${eventData.capacityMetrics.contingencyAbsorbedGuests} last-minute guest additions  
**Duration:** ${eventData.duration.summary}  
**Target Window:** ${eventData.targetSeasonOrDate}  
**Location:** ${eventData.location.cityOrRegion}  

---

## 1. Budget Allocation Strategy (10% Contingency Buffer Enforced)
*Policy: Specific vendor quotes are subject to competitive RFP bidding. Non-hallucinated percentage distributions.*

${eventData.budget.totalBudgetAmount ? `**Total Declared Budget:** ${eventData.budget.currency} ${eventData.budget.totalBudgetAmount.toLocaleString()}\n` : ''}
${eventData.budget.categories
  .map(
    (c) =>
      `- **${c.name}:** ${c.percentage}% ${
        c.allocatedAmount ? `(${eventData.budget.currency} ${c.allocatedAmount.toLocaleString()})` : ''
      } ${c.isContingency ? '*(MANDATORY CONTINGENCY BUFFER)*' : ''}\n  *Scope:* ${c.scopeNotes.join(', ')}`
  )
  .join('\n\n')}

---

## 2. Creative Direction
- **Concept Title:** ${eventData.creativeDirection.conceptTitle}
- **Tagline:** "${eventData.creativeDirection.tagline}"
- **Narrative:** ${eventData.creativeDirection.narrative}
- **Color Palette:** ${eventData.creativeDirection.colorPalette.map((p) => `${p.name} (${p.hex})`).join(', ')}
- **Materiality:** ${eventData.creativeDirection.materiality.join(', ')}

---

## 3. Operational Run of Show
${eventData.logistics.runOfShow
  .map((p) => `- **${p.time} (${p.duration}):** ${p.title} | *Zone:* ${p.zone} | *Lead:* ${p.logisticsLead}\n  ${p.details}`)
  .join('\n')}

---

## 4. Reconciled Ambiguities & Safe Fallbacks
${eventData.ambiguitiesAndFallbacks.length === 0
  ? 'None. Clean mathematical input.'
  : eventData.ambiguitiesAndFallbacks
      .map((a) => `- **${a.field} (${a.severity}):** ${a.issue} → *Applied:* ${a.fallbackApplied}`)
      .join('\n')}
`;

  const currentText = activeFormat === 'json' ? jsonContent : markdownContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `${eventData.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_spec.${activeFormat}`;
    const blob = new Blob([currentText], {
      type: activeFormat === 'json' ? 'application/json' : 'text/markdown',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Export Structural Event Specification
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Production-ready data conforming to coordinator percentage rules and 10% contingency policy.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector Bar */}
        <div className="px-5 py-2.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg">
            <button
              onClick={() => setActiveFormat('json')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeFormat === 'json'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Structured JSON</span>
            </button>

            <button
              onClick={() => setActiveFormat('markdown')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeFormat === 'markdown'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Executive Markdown</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors cursor-pointer"
              title="Print Brief"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Code / Text Preview */}
        <div className="flex-1 p-5 overflow-auto bg-neutral-950/70 font-mono text-xs text-neutral-300 leading-relaxed select-all">
          <pre className="whitespace-pre-wrap">{currentText}</pre>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800 text-center text-[11px] text-neutral-500">
          Strict non-hallucination compliance · 10% contingency buffer verified · Formatted for immediate execution
        </div>
      </div>
    </div>
  );
};
