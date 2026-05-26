import { expect, test, describe, beforeEach } from "bun:test";
import {
  handleParentMixedSpanNode,
  handleParentMixedParentUnitNode,
  handleSplitSpanQuoteNode,
  handleSplitNumberFractionQuoteNode,
  handleSpecSearchFilterItemElement,
  handleLeafTextElement,
  handleThreadTextElement,
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

  test("handleLeafTextElement: split thread callout in McMaster filter value", () => {
    const el = createElementFromHTML("<div>10<br>-<br>24</div>");
    el.querySelectorAll("br").forEach((br) => br.replaceWith(document.createTextNode("")));
    handleLeafTextElement(el);
    expect(el.getAttribute("title")).toBe("10-24 = 4.83 mm\npitch 1.058 mm\ntap 3.80 mm (#25)");
    expect(el.hasAttribute(convertedAttr)).toBe(true);
  });

  test("handleLeafTextElement: parent containers with child elements are ignored", () => {
    const el = createElementFromHTML("<div><span>10</span><span>-</span><span>24</span></div>");
    handleLeafTextElement(el);
    expect(el.getAttribute("title")).toBe(null);
    expect(el.hasAttribute(convertedAttr)).toBe(false);
  });

  test('handleSpecSearchFilterItemElement: mixed fractions are converted on the filter item', () => {
    const panel = createElementFromHTML(`
      <div id="SpecSrch_Cntnr">
        <div class="_flexTable_88wqr_1">
          <div style="flex-basis: 33%">
            <div title="Click and drag to select a range of values">
              <a href="length~2-1-2/">
                <div>
                  <div>
                    <div>2 <span>1/2"</span></div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    `);
    const column = panel.querySelector("._flexTable_88wqr_1 > div")!;
    const item = panel.querySelector('[title="Click and drag to select a range of values"]')!;
    const child = panel.querySelector("span")!;
    handleParentMixedParentUnitNode(column);
    handleSpecSearchFilterItemElement(item);
    handleInlineTextNode(child.firstChild!);
    expect(column.getAttribute("title")).toBe(null);
    expect(item.getAttribute("title")).toBe('2 1/2" = 63.50 mm');
    expect(item.hasAttribute(convertedAttr)).toBe(true);
    expect(child.getAttribute("title")).toBe(null);
  });

  test('handleThreadTextElement: sidebar value split as <span>1/4"</span>-32', () => {
    const el = createElementFromHTML('<div><span>1/4"</span>-32</div>');
    const child = el.querySelector("span")!;
    handleThreadTextElement(el);
    handleInlineTextNode(child.firstChild!);
    expect(el.getAttribute("title")).toBe('1/4"-32 = 6.35 mm\npitch 0.794 mm');
    expect(el.hasAttribute(convertedAttr)).toBe(true);
    expect(child.getAttribute("title")).toBe(null);
    expect(child.hasAttribute(convertedAttr)).toBe(false);
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
