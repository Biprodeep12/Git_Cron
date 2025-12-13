/**
 * Performs a mock web search. The function validates the input query and
 * returns a deterministic string that can be used in unit tests. It accepts
 * an optional options object that may be extended later.
 *
 * @example
 * await webSearch('cats');
 * // => 'search results for: cats'
 *
 * @param query   – The search query string. Must be non‑empty after trimming.
 * @param options – Optional configuration, e.g. a future `limit` feature.
 * @returns A promise that resolves to a string representing the mock search
 *          results.
 * @throws {Error} If the query is empty or only whitespace.
 */
export async function webSearch(query, options = {}) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
        throw new Error('webSearch: query must be a non‑empty string');
    }
    const { limit } = options;
    _void(limit);
    await new Promise((resolve) => setTimeout(resolve, 10));
    return `search results for: ${trimmedQuery}`;
}
/**
 * Utility that no‑ops a value so the compiler does not complain about
 * unused‑parameter warnings when the implementation is a stub.
 */
function _void(_value) { }
