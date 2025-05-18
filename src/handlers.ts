// handlers.ts
// DOM node handlers for Metric McMaster
import { converters, convertedAttr, convertInlineText } from "./conversion";

/**
 * Checks if an element has already been converted or is a direct child of <body>.
 * Prevents duplicate conversions and avoids converting top-level elements.
 */
export function isConverted(el: Element): boolean {
  return el.hasAttribute(convertedAttr) || el.parentElement === document.body;
}

/**
 * Handles elements where a mixed fraction is split between a text node and a child span,
 * e.g. <span>1 <span>1/2" (38.10 mm)</span></span>.
 * Sets a tooltip with the metric conversion if a match is found.
 */
export function handleParentMixedSpanNode(el: Element): void {
  if (isConverted(el)) return;
  const ch = Array.from(el.childNodes);
  if (
    ch.length === 2 &&
    ch[0].nodeType === Node.TEXT_NODE &&
    ch[1].nodeType === Node.ELEMENT_NODE &&
    (ch[1] as Element).childNodes.length === 1 &&
    ch[1].firstChild?.nodeType === Node.TEXT_NODE
  ) {
    const whole = ch[0].textContent?.trim() ?? "";
    const spanText = ch[1].textContent?.trim() ?? "";
    const m = spanText.match(/^([0-9]+)\/([0-9]+)(['"″])\s+\(.*?mm\)$/);
    if (m && /^\d+$/.test(whole)) {
      const num = +m[1],
        den = +m[2],
        unit = m[3];
      const total = +whole + num / den;
      const conv = converters[unit];
      if (conv) {
        el.setAttribute("title", `${whole} ${num}/${den}${unit} = ${conv(total)}`);
        el.setAttribute(convertedAttr, "");
      }
    }
  }
}

/**
 * Handles elements where a mixed fraction and unit are in a single text node,
 * e.g. <span>1 1/2"</span>.
 * Sets a tooltip with the metric conversion if a match is found.
 */
export function handleParentMixedParentUnitNode(el: Element): void {
  if (isConverted(el)) return;
  const text = el.textContent?.trim() ?? "";
  const m = text.match(/^(\d+)\s+(\d+)\/(\d+)(['"″])/);
  if (m) {
    const whole = +m[1],
      num = +m[2],
      den = +m[3],
      unit = m[4];
    const total = whole + num / den;
    const conv = converters[unit];
    if (conv) {
      el.setAttribute("title", `${whole} ${num}/${den}${unit} = ${conv(total)}`);
      el.setAttribute(convertedAttr, "");
    }
  }
}

/**
 * Handles elements where a fraction and a quote symbol are split into two children,
 * e.g. <span><span>1/2</span> <span>"</span></span> (with or without whitespace text nodes).
 * Sets a tooltip with the metric conversion if a match is found.
 */
export function handleSplitSpanQuoteNode(el: Element): void {
  if (el.hasAttribute(convertedAttr)) return;
  // Filter out whitespace-only text nodes
  const ch = Array.from(el.childNodes).filter(
    (n) => !(n.nodeType === Node.TEXT_NODE && !n.textContent?.trim()),
  );
  if (ch.length !== 2) return;
  const [first, second] = ch;
  function extractFrac(node: Node): string | null {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent?.trim() ?? null;
    if ((node as Element).childNodes.length === 1)
      return extractFrac((node as Element).firstChild!);
    return null;
  }
  const frac = extractFrac(first);
  let restText: string | null = null;
  if (second.nodeType === Node.TEXT_NODE) {
    restText = second.textContent?.trim() ?? null;
  } else if (
    second.nodeType === Node.ELEMENT_NODE &&
    (second as Element).childNodes.length === 1 &&
    (second as Element).firstChild?.nodeType === Node.TEXT_NODE
  ) {
    restText = (second as Element).firstChild?.textContent?.trim() ?? null;
  } else {
    return;
  }
  if (!frac || !/^\d+\/\d+$/.test(frac) || !restText || !restText.startsWith('"')) return;
  const [num, den] = frac.split("/");
  const total = +num / +den;
  const conv = converters['"'];
  if (!conv) return;
  el.setAttribute("title", `${frac}" = ${conv(total)}`);
  el.setAttribute(convertedAttr, "");
}

/**
 * Handles elements where a whole number, a fraction, and a quote symbol are split into three children,
 * e.g. <span>1 <span>1/2</span> "</span>.
 * Sets a tooltip with the metric conversion if a match is found.
 */
export function handleSplitNumberFractionQuoteNode(el: Element): void {
  if (isConverted(el)) return;
  const ch = Array.from(el.childNodes);
  if (
    ch.length === 3 &&
    ch[0].nodeType === Node.TEXT_NODE &&
    ch[1].nodeType === Node.ELEMENT_NODE &&
    ch[2].nodeType === Node.TEXT_NODE
  ) {
    const wholeStr = ch[0].textContent?.trim() ?? "";
    const frac = ch[1].textContent?.trim() ?? "";
    if (
      /^\d+$/.test(wholeStr) &&
      /^\d+\/\d+$/.test(frac) &&
      ch[2].textContent?.trim().startsWith('"')
    ) {
      const whole = +wholeStr;
      const [num, den] = frac.split("/");
      const total = whole + +num / +den;
      const conv = converters['"'];
      if (conv) {
        el.setAttribute("title", `${whole} ${num}/${den}" = ${conv(total)}`);
        el.setAttribute(convertedAttr, "");
      }
    }
  }
}

/**
 * Handles a text node containing an imperial measurement, converting it and setting a tooltip
 * on its parent element if a conversion is found.
 * Used for inline text conversions (e.g. <span>2 in</span>).
 */
export function handleInlineTextNode(node: Node): void {
  const parent = (node as ChildNode).parentElement;
  if (!parent || isConverted(parent)) return;
  const orig = node.textContent ?? "";
  const conv = convertInlineText(orig);
  if (conv !== orig) {
    parent.setAttribute("title", conv);
    parent.setAttribute(convertedAttr, "");
  }
}
