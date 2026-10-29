import { describe, it, expect } from 'vitest';
import { extractCompactEventData, CompactEventData } from '../utils/sharedEventLogic';

export type CompactEventExtraction = CompactEventData;
export const extractEventDataCompact = extractCompactEventData;

describe('Compact Event Extraction Format', () => {
  it('extracts complete event parameters strictly adhering to schema keys', () => {
    const brief = "Asha and Kiran's wedding for 250 guests with 1500000 total budget in traditional style";
    const data = extractCompactEventData(brief);

    expect(data).toHaveProperty('eventType', 'wedding');
    expect(data).toHaveProperty('eventName', "Asha and Kiran's wedding");
    expect(data).toHaveProperty('guestCount', 250);
    expect(data).toHaveProperty('totalBudget', 1500000);
    expect(data).toHaveProperty('contingencyBuffer', 150000); // 10% strict buffer
    expect(data).toHaveProperty('style', 'Traditional');
  });

  it('produces valid JSON without markdown wrapping', () => {
    const brief = "Asha and Kiran's wedding for 250 guests with ₹15,00,000 budget";
    const data = extractCompactEventData(brief);
    const serialized = JSON.stringify(data);

    expect(serialized.startsWith('{')).toBe(true);
    expect(serialized.endsWith('}')).toBe(true);
    expect(serialized).not.toContain('```');
    
    // Verify JSON parses back cleanly
    const parsed = JSON.parse(serialized);
    expect(parsed.totalBudget).toBe(1500000);
    expect(parsed.contingencyBuffer).toBe(150000);
  });

  it('handles missing budget with null contingencyBuffer without price hallucination', () => {
    const brief = "Asha and Kiran's wedding for 250 guests in traditional style";
    const data = extractCompactEventData(brief);

    expect(data.totalBudget).toBeNull();
    expect(data.contingencyBuffer).toBeNull();
    expect(data.style).toBe('Traditional');
  });

  it('defaults style to "Standard" when unspecified', () => {
    const brief = "Summit for 200 attendees with 500000 budget";
    const data = extractCompactEventData(brief);

    expect(data.style).toBe('Standard');
    expect(data.guestCount).toBe(200);
    expect(data.totalBudget).toBe(500000);
    expect(data.contingencyBuffer).toBe(50000);
  });

  it('applies fallback guest count if omitted', () => {
    const brief = "Birthday celebration with 50000 budget";
    const data = extractCompactEventData(brief);

    expect(data.eventType).toBe('birthday');
    expect(data.guestCount).toBe(30);
    expect(data.totalBudget).toBe(50000);
    expect(data.contingencyBuffer).toBe(5000);
  });
});
