import { describe, it, expect } from 'vitest';
import { extractCompactEventData } from '../utils/sharedEventLogic';

describe('Strict Output Schema & Formatting Rules Conformity', () => {
  it('conforms strictly to the 6 core schema keys without extraneous properties', () => {
    const brief = "Asha and Kiran's wedding for 250 guests with 1500000 total budget in traditional style";
    const data = extractCompactEventData(brief);

    const keys = Object.keys(data).sort();
    const expectedKeys = [
      'contingencyBuffer',
      'eventName',
      'eventType',
      'guestCount',
      'style',
      'totalBudget',
    ].sort();

    expect(keys).toEqual(expectedKeys);
  });

  it('never outputs conversational filler, pleasantries, or explanations in JSON output', () => {
    const brief = "Wedding for 200 guests with 1000000 budget";
    const data = extractCompactEventData(brief);
    const serialized = JSON.stringify(data);

    expect(serialized.startsWith('{')).toBe(true);
    expect(serialized.endsWith('}')).toBe(true);
    expect(serialized).not.toContain('Hello');
    expect(serialized).not.toContain('Here is your');
    expect(serialized).not.toContain('```json');
    expect(serialized).not.toContain('```');
  });

  it('guarantees zero price hallucination by setting budget to null when absent', () => {
    const briefsWithoutBudget = [
      "Asha and Kiran's wedding for 250 guests in traditional style",
      "Birthday party for 50 people",
      "Annual engineering symposium for 300 participants",
    ];

    for (const brief of briefsWithoutBudget) {
      const data = extractCompactEventData(brief);
      expect(data.totalBudget).toBeNull();
      expect(data.contingencyBuffer).toBeNull();
    }
  });

  it('guarantees 10% contingency buffer matches exactly 0.10 * totalBudget when budget is present', () => {
    const budgets = [1500000, 500000, 200000, 75000, 10000000];

    for (const b of budgets) {
      const brief = `Event for 100 guests with ${b} budget`;
      const data = extractCompactEventData(brief);
      expect(data.contingencyBuffer).toBe(Math.round(b * 0.10));
    }
  });

  it('produces valid JSON that passes JSON.parse without syntax errors', () => {
    const briefs = [
      "Asha and Kiran's wedding for 250 guests with ₹15,00,000 budget",
      "Rohan's milestone 30th birthday for 80 attendees with ₹1,50,000 budget",
      "Tech fest for 1200 participants with ₹8,00,000 budget",
      "Diwali celebration for 450 guests with ₹3,00,000 budget",
    ];

    for (const b of briefs) {
      const data = extractCompactEventData(b);
      const jsonString = JSON.stringify(data);
      expect(() => JSON.parse(jsonString)).not.toThrow();
    }
  });
});
