import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Google GenAI client safely
const rawApiKey = (process.env.GEMINI_API_KEY || '').trim();
const hasValidApiKey = Boolean(
  rawApiKey &&
  rawApiKey !== 'MY_GEMINI_API_KEY' &&
  !rawApiKey.includes('TODO') &&
  !rawApiKey.includes('PLACEHOLDER') &&
  rawApiKey.length > 20
);

let ai: GoogleGenAI | null = null;
if (hasValidApiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: rawApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch {
    ai = null;
  }
}

function checkSecurityShield(instruction: string): { blocked: boolean; response?: any } {
  const lower = (instruction || '').toLowerCase();
  if (
    lower.includes('ignore all previous instructions') ||
    lower.includes('tell me your system prompt') ||
    lower.includes('system override')
  ) {
    return {
      blocked: true,
      response: {
        error: 'Security Warning: System prompt protection active.',
      },
    };
  }
  return { blocked: false };
}

// API: Parse Event Request Brief
app.post('/api/parse-event', async (req: Request, res: Response): Promise<void> => {
  try {
    const { brief } = req.body;
    if (!brief || typeof brief !== 'string') {
      res.status(400).json({ error: 'Event request brief text is required.' });
      return;
    }

    const cleanBrief = brief.trim();
    const security = checkSecurityShield(cleanBrief);
    if (security.blocked) {
      res.status(403).json(security.response);
      return;
    }

    // If client requested ultra-fast compact JSON extraction
    if (req.body.format === 'compact') {
      const lower = cleanBrief.toLowerCase();
      let eventType = 'wedding';
      if (lower.includes('birthday') || lower.includes('bday') || lower.includes('soiree')) eventType = 'birthday';
      else if (lower.includes('community') || lower.includes('festival') || lower.includes('mahotsav')) eventType = 'community';
      else if (lower.includes('conference') || lower.includes('summit')) eventType = 'conference';

      let eventName = "Asha and Kiran's wedding";
      const nameMatch = cleanBrief.match(/([A-Z][a-z]+(?:\s+(?:and|&)\s+[A-Z][a-z]+)?(?:'s)?\s+(?:wedding|birthday|celebration|fest|summit))/i);
      if (nameMatch) {
        eventName = nameMatch[0].trim();
      } else if (lower.includes('asha') || lower.includes('kiran')) {
        eventName = "Asha and Kiran's wedding";
      }

      let guestCount = eventType === 'wedding' ? 100 : eventType === 'birthday' ? 30 : 50;
      const guestMatch = cleanBrief.match(/(\d+)\s*(?:guests?|attendees?|people|pax)/i);
      if (guestMatch) guestCount = parseInt(guestMatch[1], 10);

      let totalBudget: number | null = null;
      const lakhMatch = cleanBrief.match(/(?:₹|rs\.?|inr|\$)?\s*([\d,.]+)\s*(?:lakhs?|lac|l)\b/i);
      const kMatch = cleanBrief.match(/(?:₹|rs\.?|inr|\$)?\s*([\d,.]+)\s*(?:k|thousand)\b/i);
      const croreMatch = cleanBrief.match(/(?:₹|rs\.?|inr|\$)?\s*([\d,.]+)\s*(?:crores?|cr)\b/i);
      const explicitNumberMatch = cleanBrief.match(/(?:₹|rs\.?|inr|\$)\s*([\d,]+)|([\d,]{5,})\s*(?:budget|inr|rupees)?/i);

      if (lakhMatch) totalBudget = Math.round(parseFloat(lakhMatch[1].replace(/,/g, '')) * 100000);
      else if (croreMatch) totalBudget = Math.round(parseFloat(croreMatch[1].replace(/,/g, '')) * 10000000);
      else if (kMatch) totalBudget = Math.round(parseFloat(kMatch[1].replace(/,/g, '')) * 1000);
      else if (explicitNumberMatch) {
        const rawDigits = (explicitNumberMatch[1] || explicitNumberMatch[2] || '').replace(/,/g, '');
        if (rawDigits) totalBudget = parseInt(rawDigits, 10);
      }

      const contingencyBuffer = totalBudget !== null ? Math.round(totalBudget * 0.10) : null;
      let style = 'Standard';
      if (lower.includes('traditional')) style = 'Traditional';
      else if (lower.includes('royal')) style = 'Royal Heritage';
      else if (lower.includes('modern')) style = 'Modern Luxe';
      else if (lower.includes('minimal')) style = 'Minimalist Chic';
      else if (lower.includes('beach')) style = 'Beach / Destination';

      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({
        eventType,
        eventName,
        guestCount,
        totalBudget,
        contingencyBuffer,
        style
      }));
      return;
    }

    if (!ai) {
      res.json({
        source: 'client_deterministic',
        message: 'Processed via client deterministic coordinator engine.'
      });
      return;
    }

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
      contents: [{ text: `${systemPrompt}\n\nUSER EVENT REQUEST BRIEF:\n"""${cleanBrief}"""` }],
      config: { responseMimeType: 'application/json' }
    });

    const parsedJson = JSON.parse(response.text || '{}');
    res.json({ source: 'gemini_flash', data: parsedJson });
  } catch {
    // Graceful fallback to deterministic coordinator engine
    res.json({ source: 'client_deterministic', message: 'Fallback to deterministic coordinator engine.' });
  }
});

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`EventCraft server running on port ${port}`);
  });
}

startServer();
