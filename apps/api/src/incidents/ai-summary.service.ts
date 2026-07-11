import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class AiSummaryService {
  private readonly logger = new Logger(AiSummaryService.name);
  private readonly client?: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    } else {
      this.logger.warn(
        'ANTHROPIC_API_KEY not set — AI summaries will use a stub response',
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
        (e) =>
          `[${e.createdAt.toISOString()}] ${e.actionType}: ${e.message}`,
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

    if (!this.client) {
      return `[AI not configured] Incident "${incident.title}" (${incident.severity}) was created and is currently ${incident.status}. ${incident.events.length} timeline event(s) recorded.`;
    }

    const message = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    });

    const block = message.content[0];
    return block.type === 'text' ? block.text.trim() : '';
  }
}
