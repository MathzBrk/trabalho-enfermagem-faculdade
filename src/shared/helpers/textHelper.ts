/**
 * Text Normalization Helpers
 *
 * Provides utility functions to normalize text inputs for consistency in storage and comparison.
 * These functions ensure that user input variations (case sensitivity, extra spaces, etc.)
 * are handled uniformly across the application.
 *
 * Normalization strategy:
 * - Trim leading/trailing whitespace
 * - Convert to lowercase for case-insensitive comparison
 * - Replace multiple consecutive spaces with single space
 * - Handle edge cases (null, undefined, empty strings)
 */

/**
 * Normalizes a vaccine name for consistent storage and comparison
 *
 * @param name - Raw vaccine name input
 * @returns Normalized vaccine name (trimmed, lowercase, single-spaced)
 *
 * @example
 * normalizeVaccineName("  Tríplice  Viral  ") // "tríplice viral"
 * normalizeVaccineName("COVID-19") // "covid-19"
 * normalizeVaccineName("") // ""
 * normalizeVaccineName(null) // ""
 */
export function normalizeVaccineName(name: string | null | undefined): string {
  if (!name) {
    return '';
  }

  return name
    .trim() // Remove leading/trailing whitespace
    .toLowerCase() // Convert to lowercase for case-insensitive comparison
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
}

/**
 * Normalizes a manufacturer name for consistent storage and comparison
 *
 * @param manufacturer - Raw manufacturer name input
 * @returns Normalized manufacturer name (trimmed, lowercase, single-spaced)
 *
 * @example
 * normalizeManufacturerName("  BUTANTAN  ") // "butantan"
 * normalizeManufacturerName("Pfizer-BioNTech") // "pfizer-biontech"
 * normalizeManufacturerName("") // ""
 * normalizeManufacturerName(null) // ""
 */
export function normalizeManufacturerName(
  manufacturer: string | null | undefined,
): string {
  if (!manufacturer) {
    return '';
  }

  return manufacturer
    .trim() // Remove leading/trailing whitespace
    .toLowerCase() // Convert to lowercase for case-insensitive comparison
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
}

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

  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}
