import React, { useState } from 'react';
import { FileText, Copy, Check, ExternalLink, HelpCircle } from 'lucide-react';
import { VendorRfpItem } from '../types/event';

interface VendorRfpViewProps {
  rfpItems: VendorRfpItem[];
  eventTitle: string;
}

export const VendorRfpView: React.FC<VendorRfpViewProps> = ({ rfpItems, eventTitle }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyRfp = (item: VendorRfpItem) => {
    const text = `=== VENDOR REQUEST FOR PROPOSAL (RFP) ===
Event: ${eventTitle}
Category: ${item.category}
Budget Allocation Cap: ${item.allocatedBudgetDisplay} (${item.percentageAllocation}%)
Timeline: ${item.timelineRequirement}

SCOPE OF WORK / DELIVERABLES:
${item.scopeOfWork.map((s) => `• ${s}`).join('\n')}

MANDATORY SELECTION CRITERIA:
${item.selectionCriteria.map((c) => `• ${c}`).join('\n')}

KEY VENDOR INTERVIEW QUESTIONS:
${item.keyVendorQuestions.map((q) => `• ${q}`).join('\n')}

Coordinator Policy: Bids are evaluated against percentage allocations and compliance. All specific line-item pricing must be transparently provided in vendor submission.`;

    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAllRfps = () => {
    const fullText = rfpItems
      .map(
        (item) => `------------------------------------------------------------
VENDOR RFP SPECIFICATION: ${item.category.toUpperCase()}
Allocation: ${item.allocatedBudgetDisplay} (${item.percentageAllocation}%)
Scope Notes: ${item.scopeOfWork.join(', ')}
Key Questions:
${item.keyVendorQuestions.map((q) => `  - ${q}`).join('\n')}`
      )
      .join('\n\n');

    navigator.clipboard.writeText(`EVENT RFP DOSSIER: ${eventTitle}\n\n${fullText}`);
    setCopiedId('all');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h3 className="text-base font-semibold text-white">
            Vendor RFP Specifications & Bidding Matrix
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Structured scope briefs for vendor solicitation without hallucinating artificial rates.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyAllRfps}
          className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-medium rounded-lg border border-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
        >
          {copiedId === 'all' ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-neutral-400" />
          )}
          <span>{copiedId === 'all' ? 'Copied Master Dossier' : 'Copy All Vendor RFPs'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rfpItems.map((item) => {
          const isCopied = copiedId === item.id;
          return (
            <div
              key={item.id}
              className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 space-y-4 flex flex-col justify-between hover:border-neutral-700 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {item.category}
                    </h4>
                    <span className="font-mono tabular-nums text-xs font-semibold text-amber-400 mt-0.5 block">
                      Target Band: {item.allocatedBudgetDisplay}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyRfp(item)}
                    className="p-1.5 rounded-lg bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer"
                    title="Copy RFP Text"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wide">
                    Scope of Work & Deliverables:
                  </span>
                  <div className="space-y-1">
                    {item.scopeOfWork.map((scope, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-1.5 text-xs text-neutral-400">
                        <span className="text-amber-400 mt-0.5 font-bold">•</span>
                        <span>{scope}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                  <span className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wide flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-neutral-400" />
                    <span>Vendor Screening Questions:</span>
                  </span>
                  <div className="space-y-1">
                    {item.keyVendorQuestions.map((q, qIdx) => (
                      <p key={qIdx} className="text-xs text-neutral-400 italic">
                        "{q}"
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                <span>{item.timelineRequirement}</span>
                <span className="text-amber-400/90 font-medium">{item.percentageAllocation}% Allocation</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
