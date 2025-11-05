/**
 * Normalizes general text input
 * Generic function that can be used for any text that requires normalization
 *
 * @param text - Raw text input
 * @returns Normalized text (trimmed, lowercase, single-spaced)
 *
 * @example
 * normalizeText("  Hello   World  ") // "hello world"
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) {
    return '';
  }

  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}
