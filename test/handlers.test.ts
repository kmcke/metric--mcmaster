import { expect, test, describe, beforeEach } from "bun:test";
import {
  handleParentMixedSpanNode,
  handleParentMixedParentUnitNode,
  handleSplitSpanQuoteNode,
  handleSplitNumberFractionQuoteNode,
  handleInlineTextNode,
} from "../src/handlers";
import { convertedAttr } from "../src/conversion";

function createElementFromHTML(html: string): Element {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild!;
}

describe("handlers integration with DOM structures", () => {
  beforeEach(() => {
    // Clean up any global document state if needed
    document.body.innerHTML = "";
  });

  test('handleParentMixedSpanNode: <span>1 <span>1/2" (38.10 mm)</span></span>', () => {
    const el = createElementFromHTML('<span>1 <span>1/2" (38.10 mm)</span></span>');
    handleParentMixedSpanNode(el);
    expect(el.getAttribute("title")).toBe('1 1/2" = 38.10 mm');
    expect(el.hasAttribute(convertedAttr)).toBe(true);
  });

  test('handleParentMixedParentUnitNode: <span>1 1/2"</span>', () => {
    const el = createElementFromHTML('<span>1 1/2"</span>');
    handleParentMixedParentUnitNode(el);
    expect(el.getAttribute("title")).toBe('1 1/2" = 38.10 mm');
    expect(el.hasAttribute(convertedAttr)).toBe(true);
  });

  test('handleSplitSpanQuoteNode: <span><span>1/2</span> <span>"</span></span>', () => {
    const el = createElementFromHTML('<span><span>1/2</span> <span>"</span></span>');
    handleSplitSpanQuoteNode(el);
    expect(el.getAttribute("title")).toBe('1/2" = 12.70 mm');
    expect(el.hasAttribute(convertedAttr)).toBe(true);
  });

  test('handleSplitNumberFractionQuoteNode: <span>1 <span>1/2</span> "</span>', () => {
    const el = createElementFromHTML('<span>1 <span>1/2</span> "</span>');
    handleSplitNumberFractionQuoteNode(el);
    expect(el.getAttribute("title")).toBe('1 1/2" = 38.10 mm');
    expect(el.hasAttribute(convertedAttr)).toBe(true);
  });

  test("handleInlineTextNode: <span>2 in</span>", () => {
    const el = createElementFromHTML("<span>2 in</span>");
    const textNode = el.firstChild!;
    handleInlineTextNode(textNode);
    expect(el.getAttribute("title")).toBe("2 in = 50.80 mm");
    expect(el.hasAttribute(convertedAttr)).toBe(true);
  });

  test("handleInlineTextNode: <span>3/4 in</span>", () => {
    const el = createElementFromHTML("<span>3/4 in</span>");
    const textNode = el.firstChild!;
    handleInlineTextNode(textNode);
    expect(el.getAttribute("title")).toBe("3/4 in = 19.05 mm");
    expect(el.hasAttribute(convertedAttr)).toBe(true);
  });

  test("handleInlineTextNode: <span>5 bananas</span> (unsupported unit)", () => {
    const el = createElementFromHTML("<span>5 bananas</span>");
    const textNode = el.firstChild!;
    handleInlineTextNode(textNode);
    expect(el.getAttribute("title")).toBe(null);
    expect(el.hasAttribute(convertedAttr)).toBe(false);
  });

  test("handlers do not double-convert elements", () => {
    const el = createElementFromHTML("<span>2 in</span>");
    el.setAttribute(convertedAttr, "");
    const textNode = el.firstChild!;
    handleInlineTextNode(textNode);
    expect(el.getAttribute("title")).toBe(null);
  });
});
