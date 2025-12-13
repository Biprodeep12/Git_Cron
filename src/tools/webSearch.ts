export interface WebSearchOptions {
  limit?: number;
}

/**
 * Mock web search.
 * @param query Non‑empty search query.
 * @param options Optional configuration.
 * @returns Promise resolving to deterministic result string.
 */
export async function webSearch(
  query: string,
  options: WebSearchOptions = {},
): Promise<string> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error('webSearch: query must be a non‑empty string');
  }
  const { limit } = options;
  _void(limit);
  await new Promise(resolve => setTimeout(resolve, 10));
  return `search results for: ${trimmed}`;
}

function _void(_value: unknown): void {}
