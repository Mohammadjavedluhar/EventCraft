import React, { useState } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { SAMPLE_BRIEFS } from '../utils/parser';

interface BriefInputProps {
  currentBrief: string;
  onParse: (brief: string) => void;
  isLoading: boolean;
}

export const BriefInput: React.FC<BriefInputProps> = ({
  currentBrief,
  onParse,
  isLoading,
}) => {
  const [inputText, setInputText] = useState(currentBrief);

  React.useEffect(() => {
    setInputText(currentBrief);
  }, [currentBrief]);

  const handleSelectSample = (sampleText: string) => {
    setInputText(sampleText);
    onParse(sampleText);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onParse(inputText);
  };

  return (
    <section className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 md:p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-base font-semibold text-white">
            Natural Language Event Request Parser
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Coordinator engine decomposes natural language briefs into structural event data with safe mathematical fallbacks.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span>Non-hallucinated budget policy</span>
          <span aria-hidden="true">·</span>
          <span className="text-amber-400 font-medium">10% Contingency Buffer Locked</span>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-neutral-300 block mb-2">
          Test with Real-World Briefs & Ambiguity Scenarios:
        </label>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_BRIEFS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(sample.text)}
              className="text-left text-xs px-3 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/60 transition-colors cursor-pointer"
            >
              <span className="font-semibold">{sample.title}</span>
              <span className="text-neutral-500 ml-1.5">({sample.label.split('·')[0].trim()})</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            rows={4}
            placeholder="Paste your event request brief here... (e.g., 'We need a 3-day tech conference for 450 guests in Austin with $120,000 budget, cyber-industrial aesthetic, keynotes, hackathon, and rooftop gala...')"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/80 transition-all font-sans leading-relaxed"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="text-xs text-neutral-500 flex items-center gap-2">
            <span>Tip: Ambiguous guest counts or conflicting budget line items are safely reconciled.</span>
            <span className="hidden sm:inline text-neutral-600 font-mono text-[11px]">(Ctrl+Enter to parse)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setInputText('');
              }}
              className="px-3 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                isLoading || !inputText.trim()
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-amber-400 text-neutral-950 hover:bg-amber-300 shadow-sm'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Parsing Structural Data...</span>
                </>
              ) : (
                <>
                  <span>Parse Structural Event Data</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
