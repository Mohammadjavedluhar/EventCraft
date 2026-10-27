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

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
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
  } catch (err: any) {
    console.warn('AI Parsing fallback triggered:', err?.message);
    res.json({ source: 'client_deterministic', message: 'Fallback to deterministic coordinator engine.' });
  }
});

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
