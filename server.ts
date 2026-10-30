import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  validateApiKey,
  checkSecurityShield,
  extractCompactEventData,
  EVENT_COORDINATOR_SYSTEM_PROMPT,
} from './src/utils/sharedEventLogic';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;

const app = express();

// Disable framework version disclosure to comply with SonarCloud security rule S5689
app.disable('x-powered-by');

// Standard OWASP security headers
app.use((_req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Google GenAI client safely using shared validator
const rawApiKey = (process.env.GEMINI_API_KEY || '').trim();
const hasValidApiKey = validateApiKey(rawApiKey);

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

    // If client requested ultra-fast compact JSON extraction, use shared utility
    if (req.body.format === 'compact') {
      const compactData = extractCompactEventData(cleanBrief);
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(compactData));
      return;
    }

    if (!ai) {
      res.json({
        source: 'client_deterministic',
        message: 'Processed via client deterministic coordinator engine.',
      });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ text: `${EVENT_COORDINATOR_SYSTEM_PROMPT}\n\nUSER EVENT REQUEST BRIEF:\n"""${cleanBrief}"""` }],
      config: { responseMimeType: 'application/json' },
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

  const host = '0.0.0.0';
  const numericPort = Number(process.env.PORT) || 3000;
  app.listen(numericPort, host, () => {
    console.log(`EventCraft server running on http://${host}:${numericPort}`);
  });
}

// FIX S9383: Mark floating promise as explicitly discarded
void startServer();
