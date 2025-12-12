export interface WebSearchOptions {
  /**
   * The maximum number of results to return. Currently not used but kept for
   * future expansion of the mock implementation.
   */
  limit?: number;
}

/**
 * Performs a mock web search. The function validates the input query and
 * returns a deterministic string that can be used in unit tests.  It accepts
 * an optional options object that may be extended later.
 *
 * @param query   – The search query string. Must be non‑empty after trimming.
 * @param options – Optional configuration, e.g. a future `limit` feature.
 * @returns A promise that resolves to a string representing the mock search
 *          results.
 * @throws Will throw an {@link Error} if the query is empty or only whitespace.
 */
export async function webSearch(
  query: string,
  options: WebSearchOptions = {},
): Promise<string> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    throw new Error('webSearch: query must be a non‑empty string');
  }

  // Optional limit is currently unused, but keeping the destructure keeps the
  // signature clear if the feature is added later.
  const { limit } = options;
  _void(limit); // keep unused variable warning silence

  // Simulate async work (e.g., an HTTP request) without external dependencies.
  await new Promise((resolve) => setTimeout(resolve, 10));

  return `search results for: ${trimmedQuery}`;
}

/**
 * Utility that no‑ops a value so the compiler does not complain about unused
 * parameters when the implementation is a stub.
 */
function _void(_value: unknown): void {}
