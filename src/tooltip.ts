// tooltip.ts
// Tooltip management for Metric McMaster
import { convertedAttr } from "./conversion";

let tooltipsVisible = false;
const tooltipDivs: HTMLDivElement[] = [];
let hoverTooltip: HTMLDivElement | null = null;
let hoverHideTimer: number | null = null;
let hoverSource: Element | null = null;
let lastPointerPosition: { clientX: number; clientY: number } | null = null;
const hoverHideDelayMs = 100;
const hoverTooltipBackground = "rgba(0,0,0,0.68)";
const overlayTooltipBackground = "rgba(0,0,0,0.8)";

/**
 * Extracts the first copyable metric number from one tooltip line.
 * Plain clicks copy this value without its unit for CAD input fields.
 */
export function extractPrimaryMetricCopyValue(text: string): string | null {
  const match = text.match(/([±+-]?\d+(?:\.\d+)?)\s*(?:mm|m|kg|°C)\b/);
  return match?.[1] ?? null;
}

/**
 * Extracts the first copyable source imperial value from one tooltip line.
 * Ctrl-click uses this for traceability back to the original McMaster value.
 */
export function extractPrimaryImperialCopyValue(text: string): string | null {
  const threadMatch = text.match(/#?\d{1,2}-\d{2,3}(?=\s*=)/);
  if (threadMatch) return threadMatch[0];
  const fractionMatch = text.match(/([±+-]?(?:\d+[-\s]+)?\d+\/\d+)\s*(?:"|″|in\b)/i);
  if (fractionMatch) return fractionMatch[1];
  const match = text.match(/([±+-]?\d+(?:\.\d+)?)\s*(?:"|″|in\b|ft\b|lb\b|°F\b)/i);
  return match?.[1] ?? null;
}

/**
 * Returns the value that should be copied for a tooltip-row click.
 */
export function getCopyValueForClick(text: string, event: Pick<MouseEvent, "ctrlKey">): string | null {
  return event.ctrlKey ? extractPrimaryImperialCopyValue(text) : extractPrimaryMetricCopyValue(text);
}

/**
 * Copies text using the clipboard API with a textarea fallback for older pages.
 */
async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const input = document.createElement("textarea");
  input.value = text;
  input.style.position = "fixed";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.focus();
  input.select();
  document.execCommand("copy");
  input.remove();
}

/**
 * Shows per-row copy feedback without changing tooltip width.
 */
function markTooltipLineCopied(row: HTMLDivElement, tooltip: HTMLDivElement, rowBackground: string): void {
  const originalText = row.textContent ?? "";
  const tooltipWidth = tooltip.getBoundingClientRect().width;
  const rowWidth = row.getBoundingClientRect().width;
  const originalTransition = row.style.transition;
  const rows = Array.from(tooltip.children).filter((child): child is HTMLDivElement => child instanceof HTMLDivElement);
  tooltip.style.width = `${tooltipWidth}px`;
  tooltip.style.boxSizing = "border-box";
  row.style.width = `${rowWidth}px`;
  row.textContent = "Copied";
  row.style.transition = "none";
  row.style.backgroundColor = "rgb(24,128,72)";
  row.getBoundingClientRect();
  window.setTimeout(() => {
    row.style.transition = "background-color 450ms ease";
    row.style.backgroundColor = rowBackground;
  }, 80);
  window.setTimeout(() => {
    row.textContent = originalText;
    rows.forEach((tooltipRow) => {
      tooltipRow.style.backgroundColor = "rgba(0,0,0,0)";
    });
    row.style.transition = originalTransition;
    row.style.width = "";
    tooltip.style.width = "";
  }, 650);
}

/**
 * Places a hover tooltip near the source element while keeping it in viewport.
 */
function positionHoverTooltip(tooltip: HTMLDivElement, rect: DOMRect): void {
  const margin = 8;
  const xOffset = 12;
  const yOffset = 18;
  const preferredTop = rect.top + window.scrollY + yOffset;
  const maxTop = window.scrollY + window.innerHeight - tooltip.offsetHeight - margin;
  const top = Math.min(Math.max(window.scrollY + margin, preferredTop), maxTop);
  const preferredLeft = rect.left + window.scrollX + xOffset;
  const maxLeft = window.scrollX + window.innerWidth - tooltip.offsetWidth - margin;
  const left = Math.min(Math.max(window.scrollX + margin, preferredLeft), maxLeft);
  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}

/**
 * Places persistent overlay tooltips at the source element origin.
 */
function positionOverlayTooltip(tooltip: HTMLDivElement, rect: DOMRect): void {
  const margin = 8;
  const maxTop = window.scrollY + window.innerHeight - tooltip.offsetHeight - margin;
  const maxLeft = window.scrollX + window.innerWidth - tooltip.offsetWidth - margin;
  const top = Math.min(Math.max(window.scrollY + margin, rect.top + window.scrollY), maxTop);
  const left = Math.min(Math.max(window.scrollX + margin, rect.left + window.scrollX), maxLeft);
  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}

/**
 * Builds the custom tooltip DOM. Each newline becomes an independently
 * copyable row when that line has a metric value.
 */
function createTooltip(titleText: string, options: { hover?: boolean } = {}): HTMLDivElement {
  const tooltip = document.createElement("div");
  tooltip.setAttribute("data-metric-tooltip", "");
  let hasCopyableLine = false;
  const firstCopyValue = extractPrimaryMetricCopyValue(titleText);
  if (firstCopyValue) tooltip.dataset.metricCopyValue = firstCopyValue;
  const tooltipBackground = options.hover ? hoverTooltipBackground : overlayTooltipBackground;
  const rowBackground = tooltipBackground;

  for (const line of titleText.split("\n")) {
    const row = document.createElement("div");
    row.textContent = line;
    const rowCopyValue = extractPrimaryMetricCopyValue(line);
    if (rowCopyValue) {
      hasCopyableLine = true;
      row.dataset.metricCopyValue = rowCopyValue;
      row.addEventListener("click", async (event) => {
        const valueToCopy = getCopyValueForClick(line, event);
        if (!valueToCopy) return;
        event.preventDefault();
        event.stopPropagation();
        await copyToClipboard(valueToCopy);
        markTooltipLineCopied(row, tooltip, rowBackground);
      });
      row.addEventListener("mouseenter", () => {
        row.style.backgroundColor = "rgba(255,255,255,0.14)";
      });
      row.addEventListener("mouseleave", () => {
        row.style.backgroundColor = "rgba(0,0,0,0)";
      });
    }
    Object.assign(row.style, {
      backgroundColor: "rgba(0,0,0,0)",
      borderRadius: "2px",
      boxSizing: "border-box",
      cursor: rowCopyValue ? "pointer" : "default",
      display: "block",
      margin: "0",
      padding: "1px 2px",
      transition: "background-color 450ms ease",
      whiteSpace: "pre",
      width: "100%",
    } as Partial<CSSStyleDeclaration>);
    tooltip.appendChild(row);
  }

  Object.assign(tooltip.style, {
    position: "absolute",
    background: tooltipBackground,
    color: "#fff",
    padding: "2px 4px",
    borderRadius: "3px",
    fontSize: "12px",
    lineHeight: "1.35",
    maxWidth: "220px",
    whiteSpace: "pre",
    cursor: "default",
    pointerEvents: hasCopyableLine ? "auto" : "none",
    userSelect: "none",
    zIndex: "10000",
  } as Partial<CSSStyleDeclaration>);
  return tooltip;
}

/**
 * Returns whether an element is currently visible enough to position a tooltip.
 */
function isElementVisible(el: Element): boolean {
  const style = window.getComputedStyle(el);
  return style.display !== "none" && style.visibility !== "hidden" && (el as HTMLElement).offsetParent !== null;
}

/**
 * Safely tests a generated McMaster class string against a pattern.
 */
function hasClassNameMatch(el: Element, pattern: RegExp): boolean {
  return typeof el.className === "string" && pattern.test(el.className);
}

/**
 * Returns whether an element can scroll based on CSS overflow and dimensions.
 */
function hasScrollableOverflow(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  const overflow = `${style.overflow} ${style.overflowX} ${style.overflowY}`.toLowerCase();
  const canScroll = el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
  return /\b(auto|scroll|overlay)\b/.test(overflow) && canScroll;
}

/**
 * Returns whether a converted value is inside one of McMaster's scrollable
 * filter panes. Persistent overlay tooltips skip those panes to avoid clutter;
 * hover tooltips still work there.
 */
export function isInsideMcMasterSpecSearchScrollContainer(el: Element): boolean {
  const specSearchContainer = el.closest("#SpecSrch_Cntnr");
  if (!specSearchContainer) return false;

  let current = el.parentElement;
  while (current && current !== document.body && current !== specSearchContainer) {
    if (
      /ScrollBody/i.test(current.id) ||
      hasClassNameMatch(current, /(?:^|\s)_scrollable(?:_|\s|$)/i) ||
      hasScrollableOverflow(current)
    ) {
      return true;
    }
    current = current.parentElement;
  }

  return false;
}

/**
 * Reads the stored metric tooltip text from either data-metric-title or title.
 */
function getMetricTitle(el: Element): string {
  return el.getAttribute("data-metric-title") ?? el.getAttribute("title") ?? "";
}

/**
 * Cancels a pending hover-tooltip hide timer.
 */
function clearHoverHideTimer(): void {
  if (hoverHideTimer != null) {
    window.clearTimeout(hoverHideTimer);
    hoverHideTimer = null;
  }
}

/**
 * Removes the active hover tooltip and clears hover tracking state.
 */
function hideHoverTooltip(): void {
  clearHoverHideTimer();
  document.removeEventListener("mousemove", onHoverMouseMove, true);
  hoverTooltip?.remove();
  hoverTooltip = null;
  hoverSource = null;
  lastPointerPosition = null;
}

/**
 * Returns whether a viewport point is inside a rectangle with optional padding.
 */
function isPointInsideRect(point: Pick<MouseEvent, "clientX" | "clientY">, rect: DOMRect, padding = 4): boolean {
  return (
    point.clientX >= rect.left - padding &&
    point.clientX <= rect.right + padding &&
    point.clientY >= rect.top - padding &&
    point.clientY <= rect.bottom + padding
  );
}

/**
 * Returns whether the latest pointer position is inside the source or tooltip.
 */
function isPointerInsideHoverTarget(point: Pick<MouseEvent, "clientX" | "clientY">): boolean {
  const targetRects = [hoverSource, hoverTooltip]
    .filter((el): el is Element => Boolean(el))
    .map((el) => el.getBoundingClientRect());

  return targetRects.some((rect) => isPointInsideRect(point, rect));
}

/**
 * Returns whether a mouse transition stayed within the active hover pair.
 */
function isRelatedHoverTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Node)) return false;
  return Boolean(hoverSource?.contains(target) || hoverTooltip?.contains(target));
}

/**
 * Schedules hover-tooltip removal after a short grace period.
 */
function scheduleHideHoverTooltip(): void {
  clearHoverHideTimer();
  hoverHideTimer = window.setTimeout(() => {
    if (!lastPointerPosition || !isPointerInsideHoverTarget(lastPointerPosition)) hideHoverTooltip();
  }, hoverHideDelayMs);
}

/**
 * Tracks pointer movement so users can move from the source into the tooltip.
 */
function onHoverMouseMove(event: MouseEvent): void {
  lastPointerPosition = { clientX: event.clientX, clientY: event.clientY };
  if (isPointerInsideHoverTarget(event)) {
    clearHoverHideTimer();
  } else if (hoverTooltip && hoverHideTimer == null) {
    scheduleHideHoverTooltip();
  }
}

/**
 * Opens a hover tooltip unless persistent overlay mode is active.
 */
function showHoverTooltip(el: Element): void {
  if (tooltipsVisible) return;
  const titleText = getMetricTitle(el);
  if (!titleText || !isElementVisible(el)) return;

  hideHoverTooltip();
  el.setAttribute("data-metric-title", titleText);
  el.removeAttribute("title");

  const tooltip = createTooltip(titleText, { hover: true });
  tooltip.addEventListener("mouseenter", clearHoverHideTimer);
  tooltip.addEventListener("mouseleave", (event) => {
    if (isRelatedHoverTarget(event.relatedTarget)) return;
    scheduleHideHoverTooltip();
  });
  document.body.appendChild(tooltip);
  positionHoverTooltip(tooltip, (el as HTMLElement).getBoundingClientRect());
  hoverTooltip = tooltip;
  hoverSource = el;
  document.addEventListener("mousemove", onHoverMouseMove, true);
}

/**
 * Converts native title attributes into custom hover tooltip bindings.
 * The original text is stored in data-metric-title so browser-native tooltips
 * do not appear on top of the extension tooltip.
 */
export function prepareHoverTooltips(): void {
  document
    .querySelectorAll(
      `[title][${convertedAttr}]:not([data-metric-hover-bound]), [data-metric-title][${convertedAttr}]:not([data-metric-hover-bound])`,
    )
    .forEach((el) => {
      const titleText = el.getAttribute("title");
      if (titleText) {
        el.setAttribute("data-metric-title", titleText);
        el.removeAttribute("title");
      }
      el.setAttribute("data-metric-hover-bound", "");
      el.addEventListener("mouseenter", () => showHoverTooltip(el));
      el.addEventListener("mouseleave", (event) => {
        if (isRelatedHoverTarget((event as MouseEvent).relatedTarget)) return;
        scheduleHideHoverTooltip();
      });
    });
}

/**
 * Shows persistent overlay tooltips for converted elements.
 * This is the toolbar button / Alt+X behavior and is intentionally separate
 * from hover mode.
 */
export function showTooltips(): void {
  hideHoverTooltip();
  document.querySelectorAll(`[${convertedAttr}]`).forEach((el) => {
    if (!isElementVisible(el)) return;
    if (isInsideMcMasterSpecSearchScrollContainer(el)) return;
    const titleText = getMetricTitle(el);
    if (!titleText) return;
    const rect = (el as HTMLElement).getBoundingClientRect();
    const tooltip = createTooltip(titleText);
    document.body.appendChild(tooltip);
    positionOverlayTooltip(tooltip, rect);
    tooltipDivs.push(tooltip);
  });
  tooltipsVisible = true;
}

/**
 * Hides all currently visible persistent overlay tooltips.
 */
export function hideTooltips(): void {
  while (tooltipDivs.length) {
    const t = tooltipDivs.pop();
    t?.remove();
  }
  tooltipsVisible = false;
}

/**
 * Returns whether persistent overlay tooltips are currently visible.
 */
export function areTooltipsVisible(): boolean {
  return tooltipsVisible;
}
