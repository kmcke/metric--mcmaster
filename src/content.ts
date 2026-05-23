import {
  handleParentMixedSpanNode,
  handleParentMixedParentUnitNode,
  handleSplitSpanQuoteNode,
  handleSplitNumberFractionQuoteNode,
  handleLeafTextElement,
  handleThreadTextElement,
  handleInlineTextNode,
} from "./handlers";
import { showTooltips, hideTooltips, areTooltipsVisible, prepareHoverTooltips } from "./tooltip";

/**
 * Returns whether a node is part of the extension's own tooltip UI.
 * Conversion traversal skips these nodes so generated tooltip text is not
 * converted again.
 */
function isInsideMetricTooltip(node: Node): boolean {
  const el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : (node as ChildNode).parentElement;
  return Boolean(el?.closest("[data-metric-tooltip]"));
}

/**
 * Walks the current document and applies all DOM conversion handlers.
 * This is run on initial load and after mutations because McMaster updates
 * product tables and filters dynamically.
 */
function runConversion(): void {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    null,
  );
  let node: Node | null = walker.currentNode;
  while (node) {
    if (isInsideMetricTooltip(node)) {
      node = walker.nextNode();
      continue;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      handleParentMixedSpanNode(el);
      handleParentMixedParentUnitNode(el);
      handleSplitSpanQuoteNode(el);
      handleSplitNumberFractionQuoteNode(el);
      handleThreadTextElement(el);
      handleLeafTextElement(el);
    } else if (node.nodeType === Node.TEXT_NODE) {
      handleInlineTextNode(node);
    }
    node = walker.nextNode();
  }
  prepareHoverTooltips();
}

chrome.runtime.onMessage.addListener((msg: { action?: string }) => {
  if (msg.action === "toggleTooltips") {
    if (areTooltipsVisible()) {
      hideTooltips();
    } else {
      showTooltips();
    }
  }
});

/**
 * Hides persistent overlay tooltips when the page moves.
 * Hover tooltips are intentionally left to their own mouse-tracking lifecycle.
 */
function onUserScrollOrWheel(): void {
  if (areTooltipsVisible()) {
    hideTooltips();
  }
}

/**
 * Performs initial conversion setup and watches for McMaster DOM updates.
 */
function initialize(): void {
  runConversion();
  new MutationObserver(runConversion).observe(document.body, { childList: true, subtree: true });
}

// Initialize
if (document.body) {
  initialize();
} else {
  window.addEventListener("DOMContentLoaded", initialize, { once: true });
}
window.addEventListener("scroll", onUserScrollOrWheel, true);
window.addEventListener("wheel", onUserScrollOrWheel, { passive: true });
