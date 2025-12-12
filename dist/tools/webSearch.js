/**
 * A lightweight, asynchronous stub that mimics a real web‑search
 * operation.  It is deliberately deterministic and performs no network I/O,
 * making it suitable for unit tests that need predictable results.
 *
 * @param query   A non‑empty search string.  Leading and trailing
 *                whitespace is trimmed before any processing.
 * @param options Optional configuration.  Currently only {@link limit}
 *                is recognised; any other options are ignored.
 *
 * @returns A promise that resolves to a human‑readable string containing
 *          the search query.  The resolved value can be used in tests or
 *          as a stand‑in for an actual HTTP response.
 *
 * @throws {TypeError}  If {@link query} is not a string.
 * @throws {Error}      If {@link query} is empty or only whitespace.
 * @throws {TypeError}  If {@link options.limit} is provided but is not a
 *                      positive integer.
 *
 * @example
 * ```ts
 * await webSearch("TypeScript"); // "search results for: TypeScript"
 * ```
 */
export async function webSearch(query, options = {}) {
    // --- Input validation ----------------------------------------------------
    if (typeof query !== "string") {
        throw new TypeError("webSearch: query must be a string");
    }
    const trimmed = query.trim();
    if (trimmed === "") {
        throw new Error("webSearch: query must be a non‑empty string");
    }
    if (options.limit !== undefined) {
        const { limit } = options;
        if (!Number.isInteger(limit) || limit <= 0) {
            throw new TypeError("webSearch: limit must be an integer greater than zero");
        }
    }
    // --- Simulate async behaviour ------------------------------------------
    // The 10ms delay mirrors the latency of an HTTP request without
    // incurring real network traffic.
    await new Promise((resolve) => setTimeout(resolve, 10));
    // --- Return deterministic result --------------------------------------
    return `search results for: ${trimmed}`;
}
