import { Injectable, Logger } from '@nestjs/common';

export type SearchHit = { title: string; snippet: string; url: string };

@Injectable()
export class WebSearchService {
  private readonly log = new Logger(WebSearchService.name);

  async search(query: string, limit = 3): Promise<SearchHit[]> {
    // 1) Brave Search API (recomendada)
    const braveKey = process.env.BRAVE_API_KEY;
    if (braveKey) {
      try {
        const u = new URL('https://api.search.brave.com/res/v1/web/search');
        u.searchParams.set('q', query);
        u.searchParams.set('count', String(limit));

        const res = await fetch(u.toString(), {
          headers: {
            Accept: 'application/json',
            'X-Subscription-Token': braveKey,
          },
        });

        if (!res.ok) {
          this.log.warn(`Brave HTTP ${res.status}`);
        } else {
          const j: any = await res.json();
          const items: any[] = j?.web?.results || [];
          return items.slice(0, limit).map((it: any) => ({
            title: it.title,
            snippet: it.description,
            url: it.url,
          }));
        }
      } catch (e) {
        this.log.warn(`Brave error: ${e}`);
      }
    }

    // 2) Fallback: SerpAPI (si está configurado)
    const serp = process.env.SERPAPI_KEY;
    if (serp) {
      try {
        const u = new URL('https://serpapi.com/search.json');
        u.searchParams.set('engine', 'google');
        u.searchParams.set('q', query);
        u.searchParams.set('api_key', serp);

        const res = await fetch(u.toString());
        if (!res.ok) {
          this.log.warn(`SerpAPI HTTP ${res.status}`);
        } else {
          const j: any = await res.json();
          const items: any[] = j.organic_results || [];
          return items.slice(0, limit).map((it: any) => ({
            title: it.title,
            snippet:
              it.snippet || (it.snippet_highlighted_words || []).join(' '),
            url: it.link,
          }));
        }
      } catch (e) {
        this.log.warn(`SerpAPI error: ${e}`);
      }
    }

    // 3) Sin proveedores → sin contexto web
    return [];
  }
}
