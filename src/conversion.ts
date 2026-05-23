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
 * followed by a supported unit. Compact x-separated dimensions are allowed
 * only after an inch quote so normal word suffixes are still ignored.
 */
export const inlineRegex = new RegExp(
  `(^|(?<![\\w±+/.\\-])|(?<=["″])\\s*[x×]\\s*)(-?(?:\\d+[-\\s])?\\d+/\\d+|-?\\d+(?:\\.\\d+)?)(\\s*)(${unitKeys})`,
  "gi",
);

type ScrewThreadInfo = {
  tapDrill: string;
  tapDrillInches: number;
};

const screwThreadInfoByCallout: Record<string, ScrewThreadInfo> = {
  "0-80": { tapDrill: "#56", tapDrillInches: 0.0465 },
  "1-64": { tapDrill: "#53", tapDrillInches: 0.0595 },
  "1-72": { tapDrill: "#53", tapDrillInches: 0.0595 },
  "2-56": { tapDrill: "#50", tapDrillInches: 0.07 },
  "2-64": { tapDrill: "#50", tapDrillInches: 0.07 },
  "3-48": { tapDrill: "#47", tapDrillInches: 0.0785 },
  "3-56": { tapDrill: "#45", tapDrillInches: 0.082 },
  "4-40": { tapDrill: "#43", tapDrillInches: 0.089 },
  "4-48": { tapDrill: "#42", tapDrillInches: 0.0935 },
  "5-40": { tapDrill: "#38", tapDrillInches: 0.1015 },
  "5-44": { tapDrill: "#37", tapDrillInches: 0.104 },
  "6-32": { tapDrill: "#36", tapDrillInches: 0.1065 },
  "6-40": { tapDrill: "#33", tapDrillInches: 0.113 },
  "8-32": { tapDrill: "#29", tapDrillInches: 0.136 },
  "8-36": { tapDrill: "#29", tapDrillInches: 0.136 },
  "10-24": { tapDrill: "#25", tapDrillInches: 0.1495 },
  "10-32": { tapDrill: "#21", tapDrillInches: 0.159 },
  "12-24": { tapDrill: "#16", tapDrillInches: 0.177 },
  "12-28": { tapDrill: "#14", tapDrillInches: 0.182 },
  "14-20": { tapDrill: "#10", tapDrillInches: 0.1935 },
  "14-28": { tapDrill: "#3", tapDrillInches: 0.213 },
};

const screwThreadTpiBySize = Object.keys(screwThreadInfoByCallout).reduce<Record<number, number[]>>(
  (acc, callout) => {
    const [size, tpi] = callout.split("-").map(Number);
    acc[size] = [...(acc[size] ?? []), tpi];
    return acc;
  },
  {},
);

const numberDrillInchesBySize: Record<number, number> = {
  1: 0.228,
  2: 0.221,
  3: 0.213,
  4: 0.209,
  5: 0.2055,
  6: 0.204,
  7: 0.201,
  8: 0.199,
  9: 0.196,
  10: 0.1935,
  11: 0.191,
  12: 0.189,
  13: 0.185,
  14: 0.182,
  15: 0.18,
  16: 0.177,
  17: 0.173,
  18: 0.1695,
  19: 0.166,
  20: 0.161,
  21: 0.159,
  22: 0.157,
  23: 0.154,
  24: 0.152,
  25: 0.1495,
  26: 0.147,
  27: 0.144,
  28: 0.1405,
  29: 0.136,
  30: 0.1285,
  31: 0.12,
  32: 0.116,
  33: 0.113,
  34: 0.111,
  35: 0.11,
  36: 0.1065,
  37: 0.104,
  38: 0.1015,
  39: 0.0995,
  40: 0.098,
  41: 0.096,
  42: 0.0935,
  43: 0.089,
  44: 0.086,
  45: 0.082,
  46: 0.081,
  47: 0.0785,
  48: 0.076,
  49: 0.073,
  50: 0.07,
  51: 0.067,
  52: 0.0635,
  53: 0.0595,
  54: 0.055,
  55: 0.052,
  56: 0.0465,
  57: 0.043,
  58: 0.042,
  59: 0.041,
  60: 0.04,
  61: 0.039,
  62: 0.038,
  63: 0.037,
  64: 0.036,
  65: 0.035,
  66: 0.033,
  67: 0.032,
  68: 0.031,
  69: 0.0292,
  70: 0.028,
  71: 0.026,
  72: 0.025,
  73: 0.024,
  74: 0.0225,
  75: 0.021,
  76: 0.02,
  77: 0.018,
  78: 0.016,
  79: 0.0145,
  80: 0.0135,
};

const letterDrillInchesBySize: Record<string, number> = {
  A: 0.234,
  B: 0.238,
  C: 0.242,
  D: 0.246,
  E: 0.25,
  F: 0.257,
  G: 0.261,
  H: 0.266,
  I: 0.272,
  J: 0.277,
  K: 0.281,
  L: 0.29,
  M: 0.295,
  N: 0.302,
  O: 0.316,
  P: 0.323,
  Q: 0.332,
  R: 0.339,
  S: 0.348,
  T: 0.358,
  U: 0.368,
  V: 0.377,
  W: 0.386,
  X: 0.397,
  Y: 0.404,
  Z: 0.413,
};

const numberSizeKeys = Object.keys(numberDrillInchesBySize)
  .sort((a, b) => Number(b) - Number(a))
  .join("|");

const screwGaugeSizes = Object.keys(screwThreadTpiBySize)
  .sort((a, b) => Number(b) - Number(a))
  .join("|");

/**
 * Regex to match numbered machine screw thread callouts such as #8-32 or 2-56.
 */
export const screwThreadRegex = new RegExp(
  `(^|[^\\w#])(#?)(${screwGaugeSizes})\\s*-\\s*(\\d{2,3})(?!\\d)(?:\\s+(?:machine\\s+)?screws?|\\s+threads?)?`,
  "g",
);

/**
 * Regex to match fractional or decimal inch thread callouts such as 1/4"-20.
 */
export const inchThreadRegex = /(^|[^\w#])((?:\d+[-\s]+)?\d+\/\d+|\d+(?:\.\d+)?)\s*("|″|in\b)\s*-\s*(\d{2,3})(?!\d)/gi;

/**
 * Regex to match explicit screw gauge references while avoiding bare catalog/drill numbers.
 */
export const screwGaugeRegex = new RegExp(
  `(^|[^\\w#])#(${screwGaugeSizes})(\\s+(?:machine\\s+)?screws?|\\s+thread(?:ed)?|\\s+holes?)\\b`,
  "gi",
);

/**
 * Regex to match explicit trailing number-drill references such as #29 drill.
 */
export const numberDrillRegex = new RegExp(`(^|[^\\w#])#(${numberSizeKeys})\\s+(?:size\\s+)?drills?\\b`, "gi");

/**
 * Regex to match bare #number values where screw and drill meanings may both
 * apply. Explicit screw/drill/thread wording is excluded and handled by more
 * specific patterns first.
 */
export const ambiguousNumberSizeRegex = new RegExp(
  `(^|[^\\w#])#(${numberSizeKeys})(?!\\d)(?!\\s*(?:\\)|-|=|major\\b|drill\\b|screws?\\b|machine\\b|thread(?:ed)?\\b|holes?\\b))`,
  "gi",
);

/**
 * Regex to match leading explicit letter drill references such as drill size F.
 * This accepts lowercase letters because the surrounding words disambiguate it.
 */
export const leadingLetterDrillRegex = /(^|[^\w#])(?:letter\s+)?drill\s+size\s+([A-Z])\b/gi;

/**
 * Regex to match trailing explicit letter drill references such as F drill.
 * The letter must be uppercase to avoid matching prose like "a drill".
 */
export const trailingLetterDrillRegex = /(^|[^\w#])([A-Z])\s+(?:size\s+)?drills?\b/g;

/**
 * Regex to match tolerance notation that should not be treated as a normal
 * signed dimension. Lower-only values are left to the inline unit converter.
 */
export const toleranceRegex = /(^|[^\w])(\+\/-|±|\+)\s*(\d+(?:\.\d+)?)\s*(?:"|″|in\b)/gi;

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
  const inchThreadRanges = collectInchThreadRanges(text);
  inlineRegex.lastIndex = 0;
  return text.replace(inlineRegex, (match, prefix, numStr, unitSpace, unit, offset) => {
    const sourceStart = offset + prefix.length;
    if (inchThreadRanges.some(([start, end]) => sourceStart >= start && sourceStart < end)) return match;
    const num = parseImperialNumber(numStr);
    const conv = converters[unit];
    return num != null && conv ? `${prefix}${numStr}${unitSpace}${unit} = ${conv(num)}` : match;
  });
}

/**
 * Returns the Unified numbered screw major diameter in inches.
 * Numbered screw sizes follow 0.060 + size * 0.013 inches.
 */
export function screwMajorDiameterInches(size: number): number | null {
  if (!(size in screwThreadTpiBySize)) return null;
  return 0.06 + size * 0.013;
}

/**
 * Formats a numbered screw major diameter as a metric display string.
 */
function formatScrewDiameter(size: number): string | null {
  const diameterInches = screwMajorDiameterInches(size);
  if (diameterInches == null) return null;
  return `${(diameterInches * 25.4).toFixed(2)} mm`;
}

/**
 * Formats a numbered drill size as a metric display string.
 */
function formatNumberDrillDiameter(size: number): string | null {
  const diameterInches = numberDrillInchesBySize[size];
  if (diameterInches == null) return null;
  return `${(diameterInches * 25.4).toFixed(2)} mm`;
}

/**
 * Formats a letter drill size as a metric display string.
 */
function formatLetterDrillDiameter(size: string): string | null {
  const diameterInches = letterDrillInchesBySize[size.toUpperCase()];
  if (diameterInches == null) return null;
  return `${(diameterInches * 25.4).toFixed(2)} mm`;
}

/**
 * Converts otherwise ambiguous bare spec values when the McMaster row label
 * proves the value is a drill size. This intentionally handles only a single
 * bare letter value, such as "F" in a "Drill Size" row.
 */
export function convertAmbiguousSpecValueTooltip(valueText: string, labelText: string): string | null {
  if (!/\b(?:tap\s+)?drill\s+size\b|\bdrill\s+bit\s+size\b/i.test(labelText)) return null;
  const letterMatch = valueText.trim().match(/^[A-Z]$/i);
  if (!letterMatch) return null;
  const diameter = formatLetterDrillDiameter(letterMatch[0]);
  return diameter ? `drill ${diameter}` : null;
}

/**
 * Returns whether a numbered screw callout is in the supported thread table.
 */
function isStandardScrewThread(size: number, tpi: number): boolean {
  return screwThreadTpiBySize[size]?.includes(tpi) ?? false;
}

/**
 * Formats thread pitch from threads-per-inch as millimeters per thread.
 */
function formatPitch(tpi: number): string {
  return `pitch ${(25.4 / tpi).toFixed(3)} mm`;
}

/**
 * Formats the tap drill diameter for a supported screw thread callout.
 */
function formatTapDrill(size: number, tpi: number): string | null {
  const tapDrill = screwThreadInfoByCallout[`${size}-${tpi}`];
  if (!tapDrill) return null;
  return `tap ${(tapDrill.tapDrillInches * 25.4).toFixed(2)} mm (${tapDrill.tapDrill})`;
}

/**
 * Preserves whether the source thread callout used a leading #.
 */
function formatThreadCallout(hash: string, size: number, tpi: number): string {
  return `${hash}${size}-${tpi}`;
}

/**
 * Formats an inch thread callout with its major diameter and pitch.
 */
function formatInchThreadCallout(sizeText: string, unit: string, tpi: number): string | null {
  const diameterInches = parseImperialNumber(sizeText);
  if (diameterInches == null) return null;
  const source = unit.toLowerCase() === "in" ? `${sizeText} in-${tpi}` : `${sizeText}${unit}-${tpi}`;
  return `${source} = ${(diameterInches * 25.4).toFixed(2)} mm\n${formatPitch(tpi)}`;
}

/**
 * Converts numbered imperial machine screw sizes to major diameter tooltips.
 * Handles thread callouts such as #8-32 and explicit gauge references such as #8 screw.
 */
export function convertScrewSizeText(text: string): string {
  inchThreadRegex.lastIndex = 0;
  const withInchThreadCallouts = text.replace(inchThreadRegex, (match, prefix, sizeText, unit, tpiStr) => {
    const replacement = formatInchThreadCallout(sizeText, unit, Number(tpiStr));
    return replacement ? `${prefix}${replacement}` : match;
  });

  screwThreadRegex.lastIndex = 0;
  const withThreadCallouts = withInchThreadCallouts.replace(screwThreadRegex, (match, prefix, hash, sizeStr, tpiStr) => {
    const size = Number(sizeStr);
    const tpi = Number(tpiStr);
    const diameter = formatScrewDiameter(size);
    if (!diameter || !isStandardScrewThread(size, tpi)) return match;
    const callout = formatThreadCallout(hash, size, tpi);
    const tapDrill = formatTapDrill(size, tpi);
    const suffix = tapDrill ? `\n${formatPitch(tpi)}\n${tapDrill}` : `\n${formatPitch(tpi)}`;
    return `${prefix}${callout} = ${diameter}${suffix}`;
  });

  screwGaugeRegex.lastIndex = 0;
  const withExplicitGauges = withThreadCallouts.replace(screwGaugeRegex, (match, prefix, sizeStr) => {
    const diameter = formatScrewDiameter(Number(sizeStr));
    return diameter ? `${prefix}screw ${diameter}` : match;
  });

  numberDrillRegex.lastIndex = 0;
  const withExplicitNumberDrills = withExplicitGauges.replace(numberDrillRegex, (match, prefix, sizeStr) => {
    const drillDiameter = formatNumberDrillDiameter(Number(sizeStr));
    return drillDiameter ? `${prefix}drill ${drillDiameter}` : match;
  });

  ambiguousNumberSizeRegex.lastIndex = 0;
  const withNumberDrills = withExplicitNumberDrills.replace(ambiguousNumberSizeRegex, (match, prefix, sizeStr, offset, fullText) => {
    const size = Number(sizeStr);
    const drillDiameter = formatNumberDrillDiameter(size);
    const screwDiameter = formatScrewDiameter(size);
    if (fullText.slice(0, offset + prefix.length).toLowerCase().endsWith("tap drill ")) {
      return drillDiameter ? `${prefix}${drillDiameter}` : match;
    }
    if (screwDiameter && drillDiameter) return `${prefix}screw ${screwDiameter}\nor drill ${drillDiameter}`;
    if (drillDiameter) return `${prefix}drill ${drillDiameter}`;
    return match;
  });

  leadingLetterDrillRegex.lastIndex = 0;
  const withLeadingLetterDrills = withNumberDrills.replace(leadingLetterDrillRegex, (match, prefix, size) => {
    const drillDiameter = formatLetterDrillDiameter(size);
    return drillDiameter ? `${prefix}drill ${drillDiameter}` : match;
  });

  trailingLetterDrillRegex.lastIndex = 0;
  return withLeadingLetterDrills.replace(trailingLetterDrillRegex, (match, prefix, size) => {
    const drillDiameter = formatLetterDrillDiameter(size);
    return drillDiameter ? `${prefix}drill ${drillDiameter}` : match;
  });
}

/**
 * Converts explicit tolerance notation to metric while preserving the source
 * sign notation. Bidirectional +/- is displayed as ± on the metric side.
 */
export function convertToleranceText(text: string): string {
  toleranceRegex.lastIndex = 0;
  return text.replace(toleranceRegex, (match, prefix, sign, valueStr) => {
    const inches = Number(valueStr);
    if (Number.isNaN(inches)) return match;
    const metricSign = sign === "+/-" ? "±" : sign;
    return `${prefix}${sign}${valueStr}" = ${metricSign}${(inches * 25.4).toFixed(3)} mm`;
  });
}

/**
 * Appends a value only once while preserving discovery order.
 */
function addUnique(values: string[], value: string): void {
  if (!values.includes(value)) values.push(value);
}

/**
 * Collects screw, number-drill, and letter-drill tooltip lines from raw text.
 * This returns tooltip text only and does not rewrite the original text.
 */
function collectScrewTooltips(text: string): string[] {
  const values: string[] = [];

  inchThreadRegex.lastIndex = 0;
  let inchThreadMatch: RegExpExecArray | null;
  while ((inchThreadMatch = inchThreadRegex.exec(text))) {
    const callout = formatInchThreadCallout(inchThreadMatch[2], inchThreadMatch[3], Number(inchThreadMatch[4]));
    if (callout) addUnique(values, callout);
  }

  screwThreadRegex.lastIndex = 0;
  let threadMatch: RegExpExecArray | null;
  while ((threadMatch = screwThreadRegex.exec(text))) {
    const size = Number(threadMatch[3]);
    const tpi = Number(threadMatch[4]);
    const diameter = formatScrewDiameter(size);
    if (!diameter || !isStandardScrewThread(size, tpi)) continue;
    const callout = formatThreadCallout(threadMatch[2], size, tpi);
    const tapDrill = formatTapDrill(size, tpi);
    addUnique(values, tapDrill ? `${callout} = ${diameter}\n${formatPitch(tpi)}\n${tapDrill}` : `${callout} = ${diameter}\n${formatPitch(tpi)}`);
  }

  screwGaugeRegex.lastIndex = 0;
  let gaugeMatch: RegExpExecArray | null;
  while ((gaugeMatch = screwGaugeRegex.exec(text))) {
    const diameter = formatScrewDiameter(Number(gaugeMatch[2]));
    if (diameter) addUnique(values, `screw ${diameter}`);
  }

  numberDrillRegex.lastIndex = 0;
  let numberDrillMatch: RegExpExecArray | null;
  while ((numberDrillMatch = numberDrillRegex.exec(text))) {
    const drillDiameter = formatNumberDrillDiameter(Number(numberDrillMatch[2]));
    if (drillDiameter) addUnique(values, `drill ${drillDiameter}`);
  }

  ambiguousNumberSizeRegex.lastIndex = 0;
  let ambiguousMatch: RegExpExecArray | null;
  while ((ambiguousMatch = ambiguousNumberSizeRegex.exec(text))) {
    const prefix = ambiguousMatch[1];
    const offset = ambiguousMatch.index;
    const size = Number(ambiguousMatch[2]);
    const drillDiameter = formatNumberDrillDiameter(size);
    const screwDiameter = formatScrewDiameter(size);
    if (text.slice(0, offset + prefix.length).toLowerCase().endsWith("tap drill ")) {
      if (drillDiameter) addUnique(values, `drill ${drillDiameter}`);
      continue;
    }
    if (screwDiameter && drillDiameter) addUnique(values, `screw ${screwDiameter}\nor drill ${drillDiameter}`);
    else if (drillDiameter) addUnique(values, `drill ${drillDiameter}`);
  }

  leadingLetterDrillRegex.lastIndex = 0;
  let letterDrillMatch: RegExpExecArray | null;
  while ((letterDrillMatch = leadingLetterDrillRegex.exec(text))) {
    const size = letterDrillMatch[2];
    const drillDiameter = formatLetterDrillDiameter(size);
    if (drillDiameter) addUnique(values, `drill ${drillDiameter}`);
  }

  trailingLetterDrillRegex.lastIndex = 0;
  while ((letterDrillMatch = trailingLetterDrillRegex.exec(text))) {
    const size = letterDrillMatch[2];
    const drillDiameter = formatLetterDrillDiameter(size);
    if (drillDiameter) addUnique(values, `drill ${drillDiameter}`);
  }

  return values;
}

/**
 * Collects metric tolerance tooltip lines from raw text.
 */
function collectToleranceTooltips(text: string): string[] {
  const values: string[] = [];
  toleranceRegex.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = toleranceRegex.exec(text))) {
    const inches = Number(match[3]);
    const metricSign = match[2] === "+/-" ? "±" : match[2];
    if (!Number.isNaN(inches)) addUnique(values, `${metricSign}${(inches * 25.4).toFixed(3)} mm`);
  }
  return values;
}

/**
 * Collects plain unit-conversion tooltip lines from raw text.
 */
function collectInlineTooltips(text: string): string[] {
  const values: string[] = [];
  const inchThreadRanges = collectInchThreadRanges(text);
  inlineRegex.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = inlineRegex.exec(text))) {
    const sourceStart = match.index + match[1].length;
    if (inchThreadRanges.some(([start, end]) => sourceStart >= start && sourceStart < end)) continue;
    const numStr = match[2];
    const unitSpace = match[3];
    const unit = match[4];
    const num = parseImperialNumber(numStr);
    const conv = converters[unit];
    if (num != null && conv) addUnique(values, `${numStr}${unitSpace}${unit} = ${conv(num)}`);
  }
  return values;
}

/**
 * Returns source ranges occupied by inch thread callouts.
 */
function collectInchThreadRanges(text: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  inchThreadRegex.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = inchThreadRegex.exec(text))) {
    ranges.push([match.index + match[1].length, match.index + match[0].length]);
  }
  return ranges;
}

/**
 * Builds a tooltip only when the whole string is a thread callout.
 */
export function convertThreadTooltipText(text: string): string | null {
  const trimmed = text.trim();
  const tooltip = convertTooltipText(trimmed);
  if (!tooltip) return null;

  inchThreadRegex.lastIndex = 0;
  const inchMatch = inchThreadRegex.exec(trimmed);
  if (inchMatch && inchMatch.index + inchMatch[1].length === 0 && inchThreadRegex.lastIndex === trimmed.length) return tooltip;

  screwThreadRegex.lastIndex = 0;
  const screwMatch = screwThreadRegex.exec(trimmed);
  if (screwMatch && screwMatch.index + screwMatch[1].length === 0 && screwThreadRegex.lastIndex === trimmed.length) return tooltip;

  return null;
}

/**
 * Rewrites supported text by appending metric conversions inline.
 * This is used in tests and conversion helpers; DOM tooltips usually use
 * convertTooltipText so the page text itself is not changed.
 */
export function convertSupportedText(text: string): string {
  return convertScrewSizeText(convertToleranceText(convertInlineText(text)));
}

/**
 * Builds the tooltip text for a source string without changing the source.
 * Multiple conversion families are collected and joined with newlines so each
 * row can be copied independently in the custom tooltip UI.
 */
export function convertTooltipText(text: string): string | null {
  const values = [
    ...collectScrewTooltips(text),
    ...collectToleranceTooltips(text),
    ...collectInlineTooltips(text),
  ];
  return values.length ? values.join("\n") : null;
}
