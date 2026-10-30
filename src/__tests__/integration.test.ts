import { describe, it, expect } from 'vitest';
import { parseEventRequestDeterministic, INSTANT_PRESETS, generateGuestScaledCategories } from '../utils/parser';
import { extractCompactEventData, validateApiKey } from '../utils/sharedEventLogic';
import handler from '../../api/parse-event';

describe('Integration: End-to-End Event Planning Pipeline & API Handler', () => {
  it('parses natural language brief and outputs full compliant event dossier', () => {
    const rawBrief = "Grand 3-day royal Indian wedding celebration in Udaipur for 300 guests with ₹5,00,000 budget.";
    const plan = parseEventRequestDeterministic(rawBrief);

    expect(plan.id).toBeDefined();
    expect(plan.title).toBeDefined();
    expect(plan.eventType).toBe('wedding');
    expect(plan.guestCount.expected).toBe(300);
    expect(plan.budget.totalBudgetAmount).toBe(500000);
    expect(plan.budget.contingencyPercentage).toBe(10.0);
    expect(plan.creativeDirection.colorPalette.length).toBeGreaterThanOrEqual(4);
    expect(plan.logistics.runOfShow.length).toBeGreaterThan(0);
    expect(plan.logistics.keyMilestones.length).toBe(6);
    expect(plan.vendorRfpMatrix.length).toBe(plan.budget.categories.length);
  });

  it('successfully loads and processes all instant presets without error', () => {
    for (const preset of INSTANT_PRESETS) {
      const plan = parseEventRequestDeterministic(preset.text);
      expect(plan.guestCount.expected).toBe(preset.guestCount);
      expect(plan.budget.totalBudgetAmount).toBe(preset.totalBudget);
      expect(plan.budget.categories.some((c) => c.isContingency && c.percentage === 10.0)).toBe(true);
    }
  });

  it('serves compact JSON format via /api/parse-event handler with status 200', async () => {
    interface MockApiResponse {
      eventType?: string;
      guestCount?: number;
      totalBudget?: number | null;
      contingencyBuffer?: number | null;
      style?: string;
      error?: string;
    }
    let statusCode = 0;
    let responseData: MockApiResponse = {};
    const headers: Record<string, string> = {};

    const mockReq = {
      method: 'POST',
      body: {
        brief: "Asha and Kiran's wedding for 250 guests with ₹15,00,000 budget in Traditional style",
        format: 'compact',
      },
    };

    const mockRes = {
      setHeader(k: string, v: string) {
        headers[k] = v;
      },
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: unknown) {
        responseData = data as MockApiResponse;
      },
      end() {},
    };

    await handler(mockReq, mockRes);

    expect(statusCode).toBe(200);
    expect(responseData).toBeDefined();
    expect(responseData.eventType).toBe('wedding');
    expect(responseData.guestCount).toBe(250);
    expect(responseData.totalBudget).toBe(1500000);
    expect(responseData.contingencyBuffer).toBe(150000);
    expect(responseData.style).toBe('Traditional');
  });

  it('returns 400 Bad Request if brief text is missing in API request', async () => {
    let statusCode = 0;
    let responseData: { error?: string } = {};

    const mockReq = {
      method: 'POST',
      body: {},
    };

    const mockRes = {
      setHeader() {},
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: unknown) {
        responseData = data as { error?: string };
      },
      end() {},
    };

    await handler(mockReq, mockRes);

    expect(statusCode).toBe(400);
    expect(responseData.error).toBeDefined();
  });

  it('returns 405 Method Not Allowed for non-POST and non-OPTIONS methods', async () => {
    let statusCode = 0;

    const mockReq = {
      method: 'GET',
    };

    const mockRes = {
      setHeader() {},
      status(code: number) {
        statusCode = code;
        return this;
      },
      json() {},
      end() {},
    };

    await handler(mockReq, mockRes);

    expect(statusCode).toBe(405);
  });

  it('safely distinguishes valid Gemini API keys from placeholders', () => {
    expect(validateApiKey('AIzaSyD-TEST-REAL-KEY-12345678901234567890')).toBe(true);
    expect(validateApiKey('MY_GEMINI_API_KEY')).toBe(false);
    expect(validateApiKey('TODO_INSERT_KEY')).toBe(false);
    expect(validateApiKey('PLACEHOLDER_KEY')).toBe(false);
    expect(validateApiKey('')).toBe(false);
    expect(validateApiKey(undefined)).toBe(false);
  });
});
