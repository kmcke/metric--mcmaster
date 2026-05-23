import { expect, test } from "bun:test";
import { convertedAttr } from "../src/conversion";
import {
  hideTooltips,
  extractPrimaryImperialCopyValue,
  extractPrimaryMetricCopyValue,
  getCopyValueForClick,
  isInsideMcMasterSpecSearchScrollContainer,
  prepareHoverTooltips,
  showTooltips,
} from "../src/tooltip";

function makeVisible(el: HTMLElement): void {
  Object.defineProperty(el, "offsetParent", { configurable: true, value: document.body });
}

function metricTooltipCount(): number {
  return document.querySelectorAll("[data-metric-tooltip]").length;
}

test("extracts raw metric number from simple measurement tooltip", () => {
  expect(extractPrimaryMetricCopyValue("2 in = 50.80 mm")).toBe("50.80");
  expect(extractPrimaryMetricCopyValue("3 lb = 1.36 kg")).toBe("1.36");
  expect(extractPrimaryMetricCopyValue("32 °F = 0.0 °C")).toBe("0.0");
});

test("extracts the primary metric value from compound screw tooltips", () => {
  expect(extractPrimaryMetricCopyValue("#8-32 = 4.17 mm\npitch 0.794 mm\ntap 3.45 mm (#29)")).toBe("4.17");
});

test("extracts signed metric tolerance values", () => {
  expect(extractPrimaryMetricCopyValue('±0.005" = ±0.127 mm')).toBe("±0.127");
});

test("returns null when no metric value exists", () => {
  expect(extractPrimaryMetricCopyValue("5 bananas")).toBe(null);
});

test("extracts raw imperial number from conversion tooltip", () => {
  expect(extractPrimaryImperialCopyValue('0.164" = 4.17 mm')).toBe("0.164");
  expect(extractPrimaryImperialCopyValue('3/32" = 2.38 mm')).toBe("3/32");
  expect(extractPrimaryImperialCopyValue('1 1/2" = 38.10 mm')).toBe("1 1/2");
  expect(extractPrimaryImperialCopyValue("2 in = 50.80 mm")).toBe("2");
  expect(extractPrimaryImperialCopyValue("#8-32 = 4.17 mm")).toBe("#8-32");
});

test("plain click copies metric and ctrl-click copies imperial when available", () => {
  expect(getCopyValueForClick('0.164" = 4.17 mm', { ctrlKey: false })).toBe("4.17");
  expect(getCopyValueForClick('0.164" = 4.17 mm', { ctrlKey: true })).toBe("0.164");
  expect(getCopyValueForClick('3/32" = 2.38 mm', { ctrlKey: true })).toBe("3/32");
  expect(getCopyValueForClick("#8-32 = 4.17 mm", { ctrlKey: false })).toBe("4.17");
  expect(getCopyValueForClick("#8-32 = 4.17 mm", { ctrlKey: true })).toBe("#8-32");
});

test("ctrl-click falls back to no copy when there is no imperial value", () => {
  expect(getCopyValueForClick("pitch 0.794 mm", { ctrlKey: false })).toBe("0.794");
  expect(getCopyValueForClick("pitch 0.794 mm", { ctrlKey: true })).toBe(null);
});

test("line-level copy values use the clicked line only", () => {
  expect(getCopyValueForClick("pitch 0.794 mm", { ctrlKey: false })).toBe("0.794");
  expect(getCopyValueForClick("tap 3.45 mm (#29)", { ctrlKey: false })).toBe("3.45");
});

test("detects converted values inside McMaster spec search scroll containers", () => {
  document.body.innerHTML = `
    <div>
      <div id="SpecSrch_Cntnr" class="SpecSrch_CntnrWithSlider">
        <div id="CntxtlSrch_ScrollBody_10000000008187" class="_scrollable_76byo_1">
          <a><span id="inside">8-32</span></a>
        </div>
        <span id="same-section">3/8"</span>
      </div>
      <span id="outside">3/32"</span>
    </div>
  `;

  expect(isInsideMcMasterSpecSearchScrollContainer(document.getElementById("inside")!)).toBe(true);
  expect(isInsideMcMasterSpecSearchScrollContainer(document.getElementById("same-section")!)).toBe(false);
  expect(isInsideMcMasterSpecSearchScrollContainer(document.getElementById("outside")!)).toBe(false);
});

test("does not suppress toolbar overlays outside McMaster spec search filter panel", () => {
  document.body.innerHTML = `
    <div id="scrollable" style="overflow-y: auto;">
      <span id="inside">1/4"</span>
    </div>
  `;
  const scrollable = document.getElementById("scrollable")!;
  Object.defineProperty(scrollable, "clientHeight", { configurable: true, value: 100 });
  Object.defineProperty(scrollable, "scrollHeight", { configurable: true, value: 200 });

  expect(isInsideMcMasterSpecSearchScrollContainer(document.getElementById("inside")!)).toBe(false);
});

test("hover tooltip does not show while toolbar overlays are active", () => {
  document.body.innerHTML = `<span id="value" ${convertedAttr} title='3/32" = 2.38 mm'>3/32"</span>`;
  const value = document.getElementById("value")!;
  makeVisible(value);

  prepareHoverTooltips();
  showTooltips();
  expect(metricTooltipCount()).toBe(1);

  value.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
  expect(metricTooltipCount()).toBe(1);

  hideTooltips();
});

test("toolbar overlays clear an active hover tooltip", () => {
  document.body.innerHTML = `<span id="value" ${convertedAttr} title='3/32" = 2.38 mm'>3/32"</span>`;
  const value = document.getElementById("value")!;
  makeVisible(value);

  prepareHoverTooltips();
  value.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
  expect(metricTooltipCount()).toBe(1);

  showTooltips();
  expect(metricTooltipCount()).toBe(1);

  hideTooltips();
});
