import { describe, it, expect } from 'vitest';
import { 
  generateGuestScaledCategories, 
  parseEventRequestDeterministic, 
  computeGuestCapacityMetrics 
} from '../utils/parser';
import { EventType } from '../types/event';

describe('Deterministic Budget Calculation & 10% Contingency Guarantee', () => {
  it('strictly locks a 10.0% contingency buffer into all event budgets', () => {
    const totalBudget = 1500000;
    const categories = generateGuestScaledCategories('wedding', 250, totalBudget);

    const contingencyCategory = categories.find((c) => c.isContingency);
    expect(contingencyCategory).toBeDefined();
    expect(contingencyCategory?.percentage).toBe(10.0);
    expect(contingencyCategory?.allocatedAmount).toBe(150000); // 10% of 1,500,000
  });

  it('ensures all budget category percentages sum to exactly 100.0%', () => {
    const testCases: Array<{ type: EventType; guests: number; budget: number }> = [
      { type: 'wedding', guests: 250, budget: 1500000 },
      { type: 'private_celebration', guests: 30, budget: 75000 },
      { type: 'conference', guests: 1200, budget: 800000 },
      { type: 'festival', guests: 500, budget: 350000 },
    ];

    for (const tc of testCases) {
      const categories = generateGuestScaledCategories(tc.type, tc.guests, tc.budget);
      const totalPercentage = categories.reduce((sum, c) => sum + c.percentage, 0);
      expect(Math.round(totalPercentage * 10) / 10).toBe(100.0);
    }
  });

  it('ensures all allocated category amounts sum exactly to the total budget without rounding loss', () => {
    const testBudgets = [1500000, 777777, 234500, 10000000];

    for (const budget of testBudgets) {
      const categories = generateGuestScaledCategories('wedding', 250, budget);
      const sumAmounts = categories.reduce((sum, c) => sum + (c.allocatedAmount || 0), 0);
      expect(sumAmounts).toBe(budget);
    }
  });

  it('dynamically scales catering ratio with attendee volume', () => {
    // Intimate crowd (20 guests)
    const intimateCategories = generateGuestScaledCategories('wedding', 20, 500000);
    const intimateCatering = intimateCategories.find((c) => c.name.toLowerCase().includes('catering'));

    // Mega crowd (800 guests)
    const megaCategories = generateGuestScaledCategories('wedding', 800, 500000);
    const megaCatering = megaCategories.find((c) => c.name.toLowerCase().includes('catering'));

    expect(megaCatering?.percentage).toBeGreaterThan(intimateCatering?.percentage || 0);
  });

  it('computes venue space, bars, and restrooms scaled to guest volume', () => {
    const metrics = computeGuestCapacityMetrics('wedding', 250);
    expect(metrics.sqFtTotal).toBe(250 * metrics.sqFtPerGuest);
    expect(metrics.barsRecommended).toBeGreaterThanOrEqual(1);
    expect(metrics.restroomsRecommended).toBeGreaterThanOrEqual(2);
    expect(metrics.contingencyAbsorbedGuests).toBeGreaterThanOrEqual(25);
  });
});
