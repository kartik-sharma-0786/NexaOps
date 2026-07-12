import { Injectable, Logger } from '@nestjs/common';

const GEMINI_MODEL = 'gemini-flash-latest';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  error?: { message?: string };
};

@Injectable()
export class AiSummaryService {
  private readonly logger = new Logger(AiSummaryService.name);
  private readonly apiKey?: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY not set — AI summaries will use a stub response',
      );
    }
  }

  async summarize(incident: {
    title: string;
    severity: string;
    status: string;
    createdAt: Date;
    events: Array<{ actionType: string; message: string; createdAt: Date }>;
  }): Promise<string> {
    const timeline = incident.events
      .slice()
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(
        (e) => `[${e.createdAt.toISOString()}] ${e.actionType}: ${e.message}`,
      )
      .join('\n');

    const prompt = `You are an SRE assistant. Summarize the following incident concisely in 2-3 sentences for an engineering post-mortem. Focus on: what happened, what actions were taken, and current status. Be factual and professional.

Incident: ${incident.title}
Severity: ${incident.severity}
Status: ${incident.status}
Created: ${incident.createdAt.toISOString()}

Timeline:
${timeline || '(no timeline events yet)'}

Summary:`;

    if (!this.apiKey) {
      return `[AI not configured] Incident "${incident.title}" (${incident.severity}) was created and is currently ${incident.status}. ${incident.events.length} timeline event(s) recorded.`;
    }

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 256,
          // Thinking models spend the token budget on reasoning; disable it
          // so short summaries don't come back empty.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    const data = (await res.json()) as GeminiResponse;
    if (!res.ok) {
      throw new Error(
        `Gemini API error (${res.status}): ${data.error?.message ?? 'unknown'}`,
      );
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text?.trim() ?? '';
  }
}
