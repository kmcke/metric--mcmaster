// tooltip.ts
// Tooltip management for Metric McMaster
import { convertedAttr } from "./conversion";

let tooltipsVisible = false;
const tooltipDivs: HTMLDivElement[] = [];

/**
 * Shows custom tooltips for all elements with a title and the converted attribute.
 * Creates absolutely positioned tooltip divs near each matching element,
 * styled for visibility and non-interference with page content.
 */
export function showTooltips(): void {
  document.querySelectorAll(`[title][${convertedAttr}]`).forEach((el) => {
    const style = window.getComputedStyle(el);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      (el as HTMLElement).offsetParent === null
    ) {
      return;
    }
    const titleText = el.getAttribute("title") ?? "";
    const rect = (el as HTMLElement).getBoundingClientRect();
    const tooltip = document.createElement("div");
    tooltip.textContent = titleText;
    Object.assign(tooltip.style, {
      position: "absolute",
      background: "rgba(0,0,0,0.8)",
      color: "#fff",
      padding: "2px 4px",
      borderRadius: "3px",
      fontSize: "12px",
      pointerEvents: "none",
      zIndex: "10000",
    } as Partial<CSSStyleDeclaration>);
    document.body.appendChild(tooltip);
    // const tooltipHeight = tooltip.offsetHeight; // Unused variable removed
    tooltip.style.top = `${rect.top + window.scrollY - 4}px`;
    tooltip.style.left = `${rect.left + window.scrollX}px`;
    tooltipDivs.push(tooltip);
  });
  tooltipsVisible = true;
}

/**
 * Hides all currently visible tooltips by removing their divs from the DOM
 * and clearing the internal tooltip tracking array.
 */
export function hideTooltips(): void {
  while (tooltipDivs.length) {
    const t = tooltipDivs.pop();
    t?.remove();
  }
  tooltipsVisible = false;
}

/**
 * Returns whether tooltips are currently visible on the page.
 */
export function areTooltipsVisible(): boolean {
  return tooltipsVisible;
}
