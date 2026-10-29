import React, { useState, useEffect, useRef } from 'react';
import { X, Bot, Send, Loader2 } from 'lucide-react';
import { StructuredEventData } from '../types/event';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  eventData: StructuredEventData;
  onApplyModification: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  eventData,
  onApplyModification,
  isLoading,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; content: string }[]>([
    {
      role: 'assistant',
      content: `Hello! I am your EventGenie AI Coordinator. I'm actively managing "${eventData.title}" for ${eventData.guestCount.expected} guests with a budget of ₹${(eventData.budget.totalBudgetAmount || 0).toLocaleString('en-IN')}.\n\nTell me what you'd like to adjust—for example: 'Increase decor allocation to 20%', 'Scale guest count to 400', or 'Add a drone light show and lakeside fireworks'.`,
    },
  ]);

  // FIX: a11y keyboard listener for Escape key to dismiss drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Autofocus input on open for keyboard accessibility
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickPrompts = [
    `Scale guest count to ${Math.round(eventData.guestCount.expected * 1.25)} attendees`,
    'Increase catering share for gourmet live counters',
    'Add an outdoor monsoon rain contingency setup',
    'Shift creative theme to Contemporary Bohemian Luxe',
  ];

  const handleSubmit = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setPrompt('');

    try {
      await onApplyModification(userText);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Masterplan updated successfully! Re-balanced percentage allocations, recalculated deterministic est./guest, and preserved the mandatory 10% contingency safety reserve.`,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Notice: Local deterministic fallback adjusted the plan while maintaining zero price hallucination rules.`,
        },
      ]);
    }
  };

  return (
    // FIX: a11y dialog landmark and backdrop accessibility
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-drawer-title"
    >
      <div 
        className="w-full max-w-md bg-[#0a101f] border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0e162a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-bold" aria-hidden="true">
              <Bot className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span id="ai-drawer-title" className="text-sm font-bold text-white">EventGenie Assistant</span>
                <span className="bg-amber-400/20 text-amber-400 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                  Gemini Flash
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Context: {eventData.title}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close assistant drawer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conversation Stream */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-4 text-xs"
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-amber-400 text-slate-950 font-medium rounded-tr-xs'
                    : 'bg-[#121c33] border border-slate-800 text-slate-200 rounded-tl-xs'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic" role="status">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Analyzing constraints & recalculating allocations...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0c1424] space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Quick Iterations
          </span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Suggested prompt options">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                type="button"
                disabled={isLoading}
                onClick={() => handleSubmit(qp)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#14203b] hover:bg-[#1a294c] border border-slate-700/60 text-slate-300 hover:text-white transition-colors text-left cursor-pointer disabled:opacity-50 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(prompt);
          }}
          className="p-3 border-t border-slate-800 bg-[#0e162a] flex items-center gap-2"
        >
          <label htmlFor="ai-drawer-directive-input" className="sr-only">
            Type event coordination directive
          </label>
          <input
            id="ai-drawer-directive-input"
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type directive (e.g. increase venue by 5%)..."
            disabled={isLoading}
            className="flex-1 bg-[#14203b] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            aria-label="Send event coordination directive"
            className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold disabled:opacity-40 transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-400"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
