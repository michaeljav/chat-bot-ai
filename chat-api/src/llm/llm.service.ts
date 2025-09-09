import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { GoogleGenAI, DynamicRetrievalConfigMode } from '@google/genai';

type GenResult = { text: string; grounded: boolean; sources: string[] };

@Injectable()
export class LlmService {
  private readonly apiKey =
    process.env.LLM_API_KEY || process.env.GOOGLE_API_KEY;

  private readonly prefer = (
    process.env.LLM_MODEL || 'gemini-2.5-flash'
  ).trim();
  private readonly fallbacks = ['gemini-2.0-flash', 'gemini-1.5-flash'];

  private readonly domain = (process.env.LLM_DOMAIN || '').trim();

  private ai?: GoogleGenAI;
  private ensure() {
    if (!this.apiKey) {
      throw new BadRequestException(
        'Missing LLM_API_KEY (or GOOGLE_API_KEY) in environment.https://aistudio.google.com/app/apikey?utm_source=chatgpt.com ',
      );
    }
    if (!this.ai) this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  async answer(message: string, allowWeb: boolean): Promise<GenResult> {
    this.ensure();

    const hasDomain = !!this.domain;
    const system = hasDomain
      ? `You are an expert on ${this.domain}.
Only answer questions strongly related to ${this.domain}.
If off-topic, politely refuse and suggest a related query.
Be concise and helpful.`
      : `You are a helpful assistant.
Be concise and helpful. If you used web search, cite sources when appropriate.`;

    const prompt = `${system}\nUser: "${message}"`;

    const models = [this.prefer, ...this.fallbacks];
    let lastErr: any = null;

    for (const modelId of models) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          return await this.generateWithModel(modelId, prompt, allowWeb);
        } catch (err: any) {
          lastErr = err;
          const status = err?.status;
          const msg = String(err?.message || '');

          if (status === 401 || status === 403) {
            throw new UnauthorizedException(
              'Gemini authentication failed. Check your API key.',
            );
          }

          const overloaded =
            status === 503 ||
            /unavailable|overloaded|resource has been exhausted/i.test(msg);
          if (!overloaded) break;

          await new Promise((r) => setTimeout(r, attempt * 600));
        }
      }
    }

    if (lastErr?.status === 503) {
      throw new ServiceUnavailableException(
        'Model is overloaded right now. Please try again shortly.',
      );
    }
    throw new InternalServerErrorException(
      lastErr?.message || 'Gemini call failed.',
    );
  }

  private async generateWithModel(
    modelId: string,
    prompt: string,
    allowWeb: boolean,
  ): Promise<GenResult> {
    // ---- Try modern googleSearch tool ----
    try {
      const res = await this.ai!.models.generateContent({
        model: modelId,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        ...(allowWeb ? { config: { tools: [{ googleSearch: {} }] } } : {}),
      });

      const text =
        (res as any).text ??
        (res as any).response?.candidates?.[0]?.content?.parts?.[0]?.text ??
        '';

      const { grounded, sources } = this.extractGrounding(res);
      return { text: String(text || '').trim(), grounded, sources };
    } catch (err: any) {
      const status = err?.status;
      const msg = String(err?.message || '');

      // If the model doesn't support googleSearch, try legacy tool
      const toolMismatch =
        allowWeb &&
        /google[_ ]?search/i.test(msg) &&
        status !== 401 &&
        status !== 403;

      if (!toolMismatch) throw err;

      const res2 = await this.ai!.models.generateContent({
        model: modelId,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          tools: [
            {
              googleSearchRetrieval: {
                dynamicRetrievalConfig: {
                  mode: DynamicRetrievalConfigMode.MODE_DYNAMIC,
                  dynamicThreshold: 0.5,
                },
              },
            },
          ],
        },
      });

      const text2 =
        (res2 as any).text ??
        (res2 as any).response?.candidates?.[0]?.content?.parts?.[0]?.text ??
        '';

      const { grounded, sources } = this.extractGrounding(res2);
      return { text: String(text2 || '').trim(), grounded, sources };
    }
  }

  private extractGrounding(res: any): { grounded: boolean; sources: string[] } {
    const gm =
      res?.response?.candidates?.[0]?.groundingMetadata ??
      res?.response?.groundingMetadata ??
      null;

    const atts = gm?.groundingAttributions ?? [];
    const urls: string[] = atts
      .map((a: any) => a?.web?.uri || a?.sourceId || '')
      .filter(Boolean);

    return { grounded: urls.length > 0, sources: urls };
  }
}
