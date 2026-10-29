import { describe, it, expect } from 'vitest';
import { parseEventRequestDeterministic, generateGuestScaledCategories } from '../utils/parser';
import { extractCompactEventData } from '../utils/sharedEventLogic';

describe('Resilience, Boundary Conditions & Mathematical Integrity', () => {
  it('handles empty, null, or whitespace-only briefs safely with fallback', () => {
    const emptyResult = extractCompactEventData('');
    expect(emptyResult.guestCount).toBeGreaterThanOrEqual(30);
    expect(emptyResult.totalBudget).toBeNull();
    expect(emptyResult.contingencyBuffer).toBeNull();

    const wsResult = extractCompactEventData('   \n\t  ');
    expect(wsResult.guestCount).toBeGreaterThanOrEqual(30);
  });

  it('handles extreme guest volumes safely (1 guest to 10,000+ attendees)', () => {
    // Micro crowd
    const micro = parseEventRequestDeterministic("Private romantic dinner for 2 guests");
    expect(micro.guestCount.expected).toBe(2);
    expect(micro.capacityMetrics.scaleTier).toBe('intimate');

    // Mega crowd
    const mega = parseEventRequestDeterministic("Mega rock concert and tech carnival for 25000 people");
    expect(mega.guestCount.expected).toBe(25000);
    expect(mega.capacityMetrics.scaleTier).toBe('mega');
    expect(mega.capacityMetrics.barsRecommended).toBeGreaterThan(50);
  });

  it('parses diverse currency representations accurately (lakhs, crores, thousands, symbols)', () => {
    const testCases = [
      { text: "Wedding for 100 guests with ₹5 Lakh budget", expected: 500000 },
      { text: "Wedding for 100 guests with 2.5 Lakhs budget", expected: 250000 },
      { text: "Festival for 1000 guests with 1 Crore budget", expected: 10000000 },
      { text: "Dinner for 50 guests with 75k budget", expected: 75000 },
      { text: "Celebration for 30 guests with ₹1,50,000 budget", expected: 150000 },
      { text: "Summit for 200 guests with $50000 budget", expected: 50000 },
    ];

    for (const tc of testCases) {
      const parsed = extractCompactEventData(tc.text);
      expect(parsed.totalBudget).toBe(tc.expected);
      expect(parsed.contingencyBuffer).toBe(Math.round(tc.expected * 0.10));
    }
  });

  it('handles user briefs with emojis and noisy special characters cleanly', () => {
    const noisyBrief = "🎉 💍 Grand Royal Wedding for 350 guests with ₹20,00,000 budget! @ Udaipur #festive ~~~~";
    const data = extractCompactEventData(noisyBrief);

    expect(data.eventType).toBe('wedding');
    expect(data.guestCount).toBe(350);
    expect(data.totalBudget).toBe(2000000);
    expect(data.contingencyBuffer).toBe(200000);
  });

  it('guarantees zero rounding errors across all budget category sums', () => {
    const irregularBudgets = [133749, 999999, 1500000, 4821033, 85000000];

    for (const budget of irregularBudgets) {
      const categories = generateGuestScaledCategories('wedding', 250, budget);
      const allocatedSum = categories.reduce((sum, c) => sum + (c.allocatedAmount || 0), 0);
      expect(allocatedSum).toBe(budget);

      const percentSum = categories.reduce((sum, c) => sum + c.percentage, 0);
      expect(Math.round(percentSum * 10) / 10).toBe(100.0);
    }
  });

  it('guarantees contingency is locked at 10.0% even under extreme crowd scaling', () => {
    const tiers = [10, 50, 150, 300, 1000, 5000];
    for (const count of tiers) {
      const categories = generateGuestScaledCategories('wedding', count, 1000000);
      const contingency = categories.find((c) => c.isContingency);
      expect(contingency?.percentage).toBe(10.0);
      expect(contingency?.allocatedAmount).toBe(100000);
    }
  });
});
