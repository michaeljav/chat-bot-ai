import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';

// Canonical shape used by the controller
export type ChatResult = {
  text: string;
  grounded: boolean;
  sources: string[];
  domain?: string;
};

@Injectable()
export class ChatService {
  constructor(private readonly llm: LlmService) {}

  private hasApiKey(): boolean {
    return !!(process.env.LLM_API_KEY || process.env.GOOGLE_API_KEY);
  }

  async replyTo(
    message: string,
    flags?: { useLLM?: boolean; useWeb?: boolean },
  ): Promise<ChatResult> {
    const domain = (process.env.LLM_DOMAIN || '').trim();

    if (flags?.useLLM && this.hasApiKey()) {
      try {
        const out = await this.llm.answer(message, !!flags.useWeb); // { text, grounded, sources }
        return { ...out, domain };
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[ChatService] LLM failed, falling back:', e);
      }
    }

    // Fallback: deterministic reply (works without API key)
    return { text: `Bot: ${message}`, grounded: false, sources: [], domain };
  }
}
