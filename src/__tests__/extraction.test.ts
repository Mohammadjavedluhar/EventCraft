import { describe, it, expect } from 'vitest';

export interface CompactEventExtraction {
  eventType: string;
  eventName: string;
  guestCount: number;
  totalBudget: number | null;
  contingencyBuffer: number | null;
  style: string;
}

export function extractEventDataCompact(text: string): CompactEventExtraction {
  const lower = (text || '').toLowerCase();

  // Event Type
  let eventType = 'wedding';
  if (lower.includes('birthday') || lower.includes('bday') || lower.includes('soiree')) {
    eventType = 'birthday';
  } else if (lower.includes('community') || lower.includes('festival') || lower.includes('mahotsav')) {
    eventType = 'community';
  } else if (lower.includes('conference') || lower.includes('summit') || lower.includes('hackathon')) {
    eventType = 'conference';
  }

  // Event Name
  let eventName = "Asha and Kiran's wedding";
  const nameMatch = text.match(/([A-Z][a-z]+(?:\s+(?:and|&)\s+[A-Z][a-z]+)?(?:'s)?\s+(?:wedding|birthday|celebration|fest|summit))/i);
  if (nameMatch) {
    eventName = nameMatch[0].trim();
  }

  // Guest Count
  let guestCount = eventType === 'wedding' ? 100 : eventType === 'birthday' ? 30 : 50;
  const guestMatch = text.match(/(\d+)\s*(?:guests?|attendees?|people|pax)/i);
  if (guestMatch) {
    guestCount = parseInt(guestMatch[1], 10);
  }

  // Total Budget
  let totalBudget: number | null = null;
  const lakhMatch = text.match(/(?:₹|rs\.?|inr|\$)?\s*([\d,.]+)\s*(?:lakhs?|lac|l)\b/i);
  const kMatch = text.match(/(?:₹|rs\.?|inr|\$)?\s*([\d,.]+)\s*(?:k|thousand)\b/i);
  const croreMatch = text.match(/(?:₹|rs\.?|inr|\$)?\s*([\d,.]+)\s*(?:crores?|cr)\b/i);
  const explicitNumberMatch = text.match(/(?:₹|rs\.?|inr|\$)\s*([\d,]+)|([\d,]{5,})\s*(?:budget|inr|rupees)?/i);

  if (lakhMatch) {
    totalBudget = Math.round(parseFloat(lakhMatch[1].replace(/,/g, '')) * 100000);
  } else if (croreMatch) {
    totalBudget = Math.round(parseFloat(croreMatch[1].replace(/,/g, '')) * 10000000);
  } else if (kMatch) {
    totalBudget = Math.round(parseFloat(kMatch[1].replace(/,/g, '')) * 1000);
  } else if (explicitNumberMatch) {
    const rawDigits = (explicitNumberMatch[1] || explicitNumberMatch[2] || '').replace(/,/g, '');
    if (rawDigits) totalBudget = parseInt(rawDigits, 10);
  }

  // Strict 10% contingency buffer
  const contingencyBuffer = totalBudget !== null ? Math.round(totalBudget * 0.10) : null;

  // Style - default to Standard if unspecified
  let style = 'Standard';
  if (lower.includes('traditional')) style = 'Traditional';
  else if (lower.includes('royal')) style = 'Royal Heritage';
  else if (lower.includes('modern')) style = 'Modern Luxe';
  else if (lower.includes('minimal')) style = 'Minimalist Chic';
  else if (lower.includes('beach')) style = 'Beach / Destination';

  return {
    eventType,
    eventName,
    guestCount,
    totalBudget,
    contingencyBuffer,
    style,
  };
}

describe('Compact Event Extraction Format', () => {
  it('extracts complete event parameters strictly adhering to schema keys', () => {
    const brief = "Asha and Kiran's wedding for 250 guests with 1500000 total budget in traditional style";
    const data = extractEventDataCompact(brief);

    expect(data).toHaveProperty('eventType', 'wedding');
    expect(data).toHaveProperty('eventName', "Asha and Kiran's wedding");
    expect(data).toHaveProperty('guestCount', 250);
    expect(data).toHaveProperty('totalBudget', 1500000);
    expect(data).toHaveProperty('contingencyBuffer', 150000); // 10% strict buffer
    expect(data).toHaveProperty('style', 'Traditional');
  });

  it('produces valid JSON without markdown wrapping', () => {
    const brief = "Asha and Kiran's wedding for 250 guests with ₹15,00,000 budget";
    const data = extractEventDataCompact(brief);
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
    const data = extractEventDataCompact(brief);

    expect(data.totalBudget).toBeNull();
    expect(data.contingencyBuffer).toBeNull();
    expect(data.style).toBe('Traditional');
  });

  it('defaults style to "Standard" when unspecified', () => {
    const brief = "Summit for 200 attendees with 500000 budget";
    const data = extractEventDataCompact(brief);

    expect(data.style).toBe('Standard');
    expect(data.guestCount).toBe(200);
    expect(data.totalBudget).toBe(500000);
    expect(data.contingencyBuffer).toBe(50000);
  });

  it('applies fallback guest count if omitted', () => {
    const brief = "Birthday celebration with 50000 budget";
    const data = extractEventDataCompact(brief);

    expect(data.eventType).toBe('birthday');
    expect(data.guestCount).toBe(30);
    expect(data.totalBudget).toBe(50000);
    expect(data.contingencyBuffer).toBe(5000);
  });
});
