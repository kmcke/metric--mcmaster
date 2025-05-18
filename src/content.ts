import {
  handleParentMixedSpanNode,
  handleParentMixedParentUnitNode,
  handleSplitSpanQuoteNode,
  handleSplitNumberFractionQuoteNode,
  handleInlineTextNode,
} from "./handlers";
import { showTooltips, hideTooltips, areTooltipsVisible } from "./tooltip";

// DOM traversal and conversion orchestration
function runConversion(): void {
  // Traverse all elements in the body
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    null,
  );
  let node: Node | null = walker.currentNode;
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      handleParentMixedSpanNode(el);
      handleParentMixedParentUnitNode(el);
      handleSplitSpanQuoteNode(el);
      handleSplitNumberFractionQuoteNode(el);
    } else if (node.nodeType === Node.TEXT_NODE) {
      handleInlineTextNode(node);
    }
    node = walker.nextNode();
  }
}

// Listen for toggle from extension

chrome.runtime.onMessage.addListener((msg: { action?: string }) => {
  if (msg.action === "toggleTooltips") {
    if (areTooltipsVisible()) {
      hideTooltips();
    } else {
      showTooltips();
    }
  }
});

function onUserScrollOrWheel(): void {
  if (areTooltipsVisible()) {
    hideTooltips();
  }
}

// Initialize
window.addEventListener("load", () => {
  runConversion();
});
window.addEventListener("scroll", onUserScrollOrWheel, true);
window.addEventListener("wheel", onUserScrollOrWheel, { passive: true });
new MutationObserver(runConversion).observe(document.body, { childList: true, subtree: true });
