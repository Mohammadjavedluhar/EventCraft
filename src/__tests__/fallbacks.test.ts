import { describe, it, expect } from 'vitest';
import { parseEventRequestDeterministic } from '../utils/parser';

describe('Fallback Handling & Input Validation', () => {
  it('applies logical default fallback of 100 guests for weddings when guest count is unspecified', () => {
    const parsed = parseEventRequestDeterministic("Asha's royal wedding in Udaipur with traditional ceremonies");
    expect(parsed.guestCount.fallbackApplied).toBe(true);
    expect(parsed.guestCount.expected).toBe(100);
    expect(parsed.ambiguitiesAndFallbacks.some((a) => a.field.toLowerCase().includes('guest'))).toBe(true);
  });

  it('applies logical default fallback of 30 guests for birthdays when guest count is unspecified', () => {
    const parsed = parseEventRequestDeterministic("Rohan's milestone 30th birthday rooftop party");
    expect(parsed.guestCount.fallbackApplied).toBe(true);
    expect(parsed.guestCount.expected).toBe(30);
  });

  it('handles missing budget gracefully without hallucinating arbitrary prices', () => {
    const parsed = parseEventRequestDeterministic("Corporate summit for 200 attendees in Bengaluru");
    // If no budget is specified, totalBudgetProvided is flagged false
    expect(parsed.budget.totalBudgetProvided).toBe(false);
    expect(parsed.ambiguitiesAndFallbacks.some((a) => a.field.toLowerCase().includes('budget'))).toBe(true);
    // Contingency is strictly 10%
    expect(parsed.budget.contingencyPercentage).toBe(10.0);
    const sumPct = parsed.budget.categories.reduce((acc, c) => acc + c.percentage, 0);
    expect(Math.round(sumPct)).toBe(100);
  });

  it('defaults style and format logically when not provided', () => {
    const parsed = parseEventRequestDeterministic("Community cultural festival for 300 guests");
    expect(parsed.format).toBe('in_person');
    expect(parsed.duration.days).toBeGreaterThanOrEqual(1);
  });

  it('safely clamps extreme or zero guest inputs', () => {
    const parsed = parseEventRequestDeterministic("Private dinner party", { guestCount: 0 });
    // Should fallback to safe minimum
    expect(parsed.guestCount.expected).toBeGreaterThanOrEqual(5);
  });
});
