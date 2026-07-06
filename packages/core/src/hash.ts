/**
 * SHA-256 hex digest of the input, used as the audit anchor (`textHash`).
 * Uses Web Crypto so it runs unchanged in Node 20+, edge runtimes, and browsers.
 */
export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
