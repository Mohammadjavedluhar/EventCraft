import { GoogleGenAI } from '@google/genai';
import {
  validateApiKey,
  extractCompactEventData,
  EVENT_COORDINATOR_SYSTEM_PROMPT,
} from '../src/utils/sharedEventLogic';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (typeof res.removeHeader === 'function') {
    res.removeHeader('X-Powered-By');
  }

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

    const cleanBrief = brief.trim();

    // Ultra-fast compact schema extraction using shared utility
    if (req.body?.format === 'compact') {
      const compactData = extractCompactEventData(cleanBrief);
      return res.status(200).json(compactData);
    }

    const hasValidKey = validateApiKey(process.env.GEMINI_API_KEY);
    if (!hasValidKey) {
      return res.status(200).json({
        source: 'client_deterministic',
        message: 'Processed via client deterministic coordinator engine.',
      });
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
    return res.status(200).json({ source: 'gemini_flash', data: parsedJson });
  } catch {
    // Graceful silent fallback to deterministic coordinator engine
    return res.status(200).json({
      source: 'client_deterministic',
      message: 'Fallback to deterministic coordinator engine.',
    });
  }
}
