import fetch from 'node-fetch';

export interface WebSearchOptions {
  limit?: number;
  safeSearch?: 'off' | 'moderate' | 'strict';
  region?: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export async function webSearch(
  query: string,
  options: WebSearchOptions = {},
): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error('webSearch: query must be a non-empty string');
  }

  const { limit = 10, safeSearch = 'moderate', region = 'wt-wt' } = options;
  if (limit < 1 || limit > 50) {
    throw new Error('limit must be between 1 and 50');
  }

  const apiKey = process.env.WEB_SEARCH_API_KEY;
  if (!apiKey) {
    throw new Error('WEB_SEARCH_API_KEY environment variable not set');
  }

  try {
    const params = new URLSearchParams({
      q: trimmed,
      format: 'json',
      no_redirect: '1',
      no_html: '1',
      safesearch: safeSearch,
      kl: region,
    });

    const response = await fetch(
      `https://api.duckduckgo.com/?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Search API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = (await response.json()) as {
      AbstractText?: string;
      Results?: Array<{
        FirstURL: string;
        Text: string;
        Title: string;
      }>;
    };

    if (!data.Results || !Array.isArray(data.Results) || data.Results.length === 0) {
      return [];
    }

    return data.Results.slice(0, limit).map(result => ({
      title: result.Title || 'Untitled',
      url: result.FirstURL || '',
      snippet: result.Text || '',
    }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to search for "${trimmed}": ${errorMessage}`);
  }
}