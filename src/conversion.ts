// conversion.ts
// Conversion utilities and helpers for Metric McMaster

/**
 * Map of imperial unit keys to conversion functions that return formatted metric strings.
 * Handles inches, feet, pounds, and Fahrenheit.
 */
export const converters: Record<string, (v: number) => string> = {
  in: (v) => (v * 25.4).toFixed(2) + " mm",
  '"': (v) => (v * 25.4).toFixed(2) + " mm",
  "″": (v) => (v * 25.4).toFixed(2) + " mm",
  ft: (v) => (v * 0.3048).toFixed(2) + " m",
  "'": (v) => (v * 0.3048).toFixed(2) + " m",
  "′": (v) => (v * 0.3048).toFixed(2) + " m",
  lb: (v) => (v * 0.453592).toFixed(2) + " kg",
  "°F": (v) => (((v - 32) * 5) / 9).toFixed(1) + " °C",
};

/**
 * Regex-safe string of all supported unit keys for use in matching.
 */
export const unitKeys = Object.keys(converters)
  .map((k) => k.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"))
  .join("|");

/**
 * Attribute name used to mark elements that have already been converted.
 */
export const convertedAttr = "data-metric-converted";

/**
 * Regex to match inline imperial measurements (including negative, fractional, and decimal forms)
 * followed by a supported unit.
 */
export const inlineRegex = new RegExp(
  `(-?(?:\\d+[-\\s])?\\d+/\\d+|-?\\d+(?:\\.\\d+)?)\\s*(${unitKeys})`,
  "gi",
);

/**
 * Parses a string representing an imperial number (whole, fraction, or decimal).
 * Returns the numeric value or null if parsing fails.
 * Examples: "1 1/2" => 1.5, "3/4" => 0.75, "2" => 2
 */
export function parseImperialNumber(str: string): number | null {
  let m = str.match(/^(\d+)[\s-]+(\d+)\/(\d+)$/);
  if (m) return +m[1] + +m[2] / +m[3];
  m = str.match(/^(\d+)\/(\d+)$/);
  if (m) return +m[1] / +m[2];
  const f = parseFloat(str);
  return isNaN(f) ? null : f;
}

/**
 * Converts all inline imperial measurements in a string to metric equivalents.
 * Returns the string with conversions appended (e.g. "2 in" => "2 in = 50.80 mm").
 */
export function convertInlineText(text: string): string {
  inlineRegex.lastIndex = 0;
  return text.replace(inlineRegex, (match, numStr, unit) => {
    const num = parseImperialNumber(numStr);
    const conv = converters[unit];
    return num != null && conv ? `${match} = ${conv(num)}` : match;
  });
}
