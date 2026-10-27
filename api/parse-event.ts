import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { brief } = req.body || {};
    if (!brief || typeof brief !== 'string') {
      return res.status(400).json({ error: 'Event request brief text is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        source: 'client_deterministic',
        message: 'Processed via client deterministic coordinator engine.'
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemPrompt = `You are an expert logistics coordinator and creative director for events. Your job is to parse user event requests—specifically tracking the number of guests/attendees—and output clear, structural event data.

CRITICAL LOGIC RULES:
1. Guest-Driven Scaling: Dynamically adjust the budget allocation and venue/catering recommendations based on the number of people attending (e.g., higher catering ratio for larger crowds, smaller cozy venues for minor counts).
2. No Price Hallucination: Never guess specific vendor prices; provide percentage-based budget allocations matching the scale of the guest count.
3. Safety Margins: Always include a 10% contingency buffer for last-minute guest additions.
4. Fallbacks: If the user doesn't specify the number of people, assume a logical default fallback (e.g., 100 guests for weddings, 30 for birthdays) and explicitly state it in your response description.

Return valid JSON conforming to this exact structure:
{
  "title": "string",
  "eventType": "conference" | "gala" | "wedding" | "product_launch" | "retreat" | "exhibition" | "private_celebration" | "other",
  "format": "in_person" | "hybrid" | "virtual",
  "guestCount": {
    "min": number,
    "max": number,
    "expected": number,
    "isEstimated": boolean,
    "fallbackApplied": boolean,
    "fallbackDescription": "Explicit statement if fallback was applied (e.g. Notice: No guest count was specified in your brief. Assumed a logical default fallback of 100 guests for weddings, 30 for birthdays...)"
  },
  "duration": { "days": number, "hoursPerDay": number, "summary": "string" },
  "targetSeasonOrDate": "string",
  "location": {
    "cityOrRegion": "string",
    "venueTypeRecommendation": "string (scaled to guest count)",
    "spaceRequirementsSqFt": number
  },
  "budget": {
    "totalBudgetProvided": boolean,
    "totalBudgetAmount": number | null,
    "currency": "USD ($)",
    "contingencyPercentage": 10.0,
    "categories": [
      {
        "id": "string",
        "name": "string",
        "percentage": number,
        "description": "string (explaining guest scaling)",
        "isContingency": boolean,
        "scopeNotes": ["string"]
      }
    ]
  },
  "creativeDirection": {
    "conceptTitle": "string",
    "tagline": "string",
    "narrative": "string",
    "colorPalette": [{ "name": "string", "hex": "#HEX", "role": "string" }],
    "materiality": ["string"],
    "lightingDesign": { "ambient": "string", "focal": "string", "accent": "string" },
    "sensoryProfile": { "acoustic": "string", "olfactory": "string", "taste": "string" },
    "spatialZones": [{ "name": "string", "capacityPercentage": number, "description": "string", "keyElements": ["string"] }]
  },
  "ambiguitiesAndFallbacks": [
    { "field": "string", "issue": "string", "fallbackApplied": "string", "severity": "low" | "medium" | "high" }
  ]
}

REMEMBER: All category percentages MUST sum up to exactly 100.0%, and ONE of those categories MUST be named "Contingency & Last-Minute Guest Buffer" with isContingency: true and percentage: 10.0. Never hallucinate specific vendor prices.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ text: `${systemPrompt}\n\nUSER EVENT REQUEST BRIEF:\n"""${brief.trim()}"""` }],
      config: { responseMimeType: 'application/json' }
    });

    const parsedJson = JSON.parse(response.text || '{}');
    return res.status(200).json({ source: 'gemini_flash', data: parsedJson });
  } catch (err: any) {
    console.warn('Vercel serverless function AI fallback:', err?.message);
    return res.status(200).json({
      source: 'client_deterministic',
      message: 'Fallback to deterministic coordinator engine.'
    });
  }
}
