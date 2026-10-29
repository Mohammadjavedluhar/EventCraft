import { GoogleGenAI } from '@google/genai';
import {
  validateApiKey,
  extractCompactEventData,
  EVENT_COORDINATOR_SYSTEM_PROMPT,
} from '../src/utils/sharedEventLogic';

interface ApiRequest {
  method?: string;
  body?: {
    brief?: string;
    format?: string;
  };
}

interface ApiResponse {
  setHeader(name: string, value: string): void;
  removeHeader?(name: string): void;
  status(code: number): ApiResponse;
  json(body: unknown): void;
  end(): void;
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (typeof res.removeHeader === 'function') {
    res.removeHeader('X-Powered-By');
  }

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { brief } = req.body || {};
    if (!brief || typeof brief !== 'string') {
      res.status(400).json({ error: 'Event request brief text is required.' });
      return;
    }

    const cleanBrief = brief.trim();

    // Ultra-fast compact schema extraction using shared utility
    if (req.body?.format === 'compact') {
      const compactData = extractCompactEventData(cleanBrief);
      res.status(200).json(compactData);
      return;
    }

    const hasValidKey = validateApiKey(process.env.GEMINI_API_KEY);
    if (!hasValidKey) {
      res.status(200).json({
        source: 'client_deterministic',
        message: 'Processed via client deterministic coordinator engine.',
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: (process.env.GEMINI_API_KEY || '').trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ text: `${EVENT_COORDINATOR_SYSTEM_PROMPT}\n\nUSER EVENT REQUEST BRIEF:\n"""${cleanBrief}"""` }],
      config: { responseMimeType: 'application/json' },
    });

    const parsedJson = JSON.parse(response.text || '{}');
    res.status(200).json({ source: 'gemini_flash', data: parsedJson });
  } catch {
    // Graceful silent fallback to deterministic coordinator engine
    res.status(200).json({
      source: 'client_deterministic',
      message: 'Fallback to deterministic coordinator engine.',
    });
  }
}
