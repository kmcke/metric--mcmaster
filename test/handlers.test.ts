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

  test('handleInlineTextNode: McMaster info text with 0.164"', () => {
    const el = createElementFromHTML(
      '<span>Threads are 0.164" in diameter (trade number 8) with 32 threads per inch.</span>',
    );
    const textNode = el.firstChild!;
    handleInlineTextNode(textNode);
    expect(el.getAttribute("title")).toBe('0.164" = 4.17 mm');
    expect(el.hasAttribute(convertedAttr)).toBe(true);
  });

  test("handleInlineTextNode: <span>#8-32 screw</span>", () => {
    const el = createElementFromHTML("<span>#8-32 screw</span>");
    const textNode = el.firstChild!;
    handleInlineTextNode(textNode);
    expect(el.getAttribute("title")).toBe("#8-32 = 4.17 mm\npitch 0.794 mm\ntap 3.45 mm (#29)");
    expect(el.hasAttribute(convertedAttr)).toBe(true);
  });

  test("handleInlineTextNode: bare letter drill size in product detail spec row", () => {
    const table = createElementFromHTML(`
      <table>
        <tbody>
          <tr class="_product-detail-spec-table-row_mhn7k_1">
            <td>Drill Size</td>
            <td><div class="_product-detail-spec-row-value_mhn7k_121">F</div></td>
          </tr>
        </tbody>
      </table>
    `);
    const value = table.querySelector("div")!;
    handleInlineTextNode(value.firstChild!);
    expect(value.getAttribute("title")).toBe("drill 6.53 mm");
    expect(value.hasAttribute(convertedAttr)).toBe(true);
  });

  test("handleInlineTextNode: bare letters outside drill-size spec rows are ignored", () => {
    const table = createElementFromHTML(`
      <table>
        <tbody>
          <tr class="_product-detail-spec-table-row_mhn7k_1">
            <td>Grade</td>
            <td><div class="_product-detail-spec-row-value_mhn7k_121">F</div></td>
          </tr>
        </tbody>
      </table>
    `);
    const gradeValue = table.querySelector("div")!;
    handleInlineTextNode(gradeValue.firstChild!);
    expect(gradeValue.getAttribute("title")).toBe(null);
    expect(gradeValue.hasAttribute(convertedAttr)).toBe(false);
  });

  test("handleInlineTextNode: <span>5 bananas</span> (unsupported unit)", () => {
    const el = createElementFromHTML("<span>5 bananas</span>");
    const textNode = el.firstChild!;
    handleInlineTextNode(textNode);
    expect(el.getAttribute("title")).toBe(null);
    expect(el.hasAttribute(convertedAttr)).toBe(false);
  });

  test("handlers ignore extension tooltip contents", () => {
    const el = createElementFromHTML('<div data-metric-tooltip><div>3/32" = 2.38 mm</div></div>');
    const row = el.firstElementChild!;
    handleInlineTextNode(row.firstChild!);
    expect(row.getAttribute("title")).toBe(null);
    expect(row.hasAttribute(convertedAttr)).toBe(false);
  });

  test("handlers do not double-convert elements", () => {
    const el = createElementFromHTML("<span>2 in</span>");
    el.setAttribute(convertedAttr, "");
    const textNode = el.firstChild!;
    handleInlineTextNode(textNode);
    expect(el.getAttribute("title")).toBe(null);
  });
});
