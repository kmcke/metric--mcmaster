import { expect, test } from "bun:test";
import {
  convertInlineText,
  convertAmbiguousSpecValueTooltip,
  convertScrewSizeText,
  convertSupportedText,
  convertTooltipText,
  convertToleranceText,
  getDecimalPlaces,
  normalizeDecimalPlaces,
  setDecimalPlaces,
} from "../src/conversion";

test("inches to mm", () => {
  expect(convertInlineText("1 in")).toBe("1 in = 25.40 mm");
});

test("feet to m", () => {
  expect(convertInlineText("2 ft")).toBe("2 ft = 0.61 m");
});

test("pounds to kg", () => {
  expect(convertInlineText("3 lb")).toBe("3 lb = 1.36 kg");
});

test("Fahrenheit to Celsius", () => {
  expect(convertInlineText("32 °F")).toBe("32 °F = 0.00 °C");
});

test("decimal places are configurable for normal metric values", () => {
  expect(normalizeDecimalPlaces(1)).toBe(2);
  expect(normalizeDecimalPlaces(9)).toBe(8);
  expect(normalizeDecimalPlaces("4")).toBe(4);

  setDecimalPlaces(4);
  expect(getDecimalPlaces()).toBe(4);
  expect(convertInlineText('3/16"')).toBe('3/16" = 4.7625 mm');
  expect(convertTooltipText("#8 screw")).toBe("screw 4.1656 mm");
  expect(convertTooltipText('5/16"-24')).toBe('5/16"-24 = 7.9375 mm\npitch 1.0583 mm');
  expect(convertTooltipText('+/-0.005"')).toBe("±0.1270 mm");

  setDecimalPlaces(2);
});

test("fractional inches to mm", () => {
  expect(convertInlineText("1 1/2 in")).toBe("1 1/2 in = 38.10 mm");
  expect(convertInlineText("3/4 in")).toBe("3/4 in = 19.05 mm");
  expect(convertTooltipText('1/4"x3/8"')).toBe('1/4" = 6.35 mm\n3/8" = 9.52 mm');
  expect(convertTooltipText("1/4″×3/8″")).toBe("1/4″ = 6.35 mm\n3/8″ = 9.52 mm");
});

test("negative and zero values", () => {
  expect(convertInlineText("0 ft")).toBe("0 ft = 0.00 m");
  expect(convertInlineText("-5 °F")).toBe("-5 °F = -20.56 °C");
  expect(convertSupportedText("-0.5 in")).toBe("-0.5 in = -12.70 mm");
  expect(convertTooltipText("-0.5 in")).toBe("-0.5 in = -12.70 mm");
});

test("unsupported units", () => {
  expect(convertInlineText("5 bananas")).toBe("5 bananas");
  expect(convertTooltipText('box3/8"')).toBe(null);
});

test("multiple conversions in one string", () => {
  expect(convertInlineText("2 in and 3 ft")).toBe("2 in = 50.80 mm and 3 ft = 0.91 m");
});

test("no conversion needed", () => {
  expect(convertInlineText("100 mm")).toBe("100 mm");
});

test("prime/double-prime symbols", () => {
  expect(convertInlineText("5″")).toBe("5″ = 127.00 mm");
  expect(convertInlineText("6′")).toBe("6′ = 1.83 m");
});

test("numbered screw thread callouts include major diameter", () => {
  expect(convertScrewSizeText("2-56")).toBe("2-56 = 2.18 mm\npitch 0.454 mm\ntap 1.78 mm (#50)");
  expect(convertScrewSizeText("#8-32")).toBe("#8-32 = 4.17 mm\npitch 0.794 mm\ntap 3.45 mm (#29)");
});

test("inch thread callouts include diameter and pitch", () => {
  expect(convertScrewSizeText('1/4"-32')).toBe('1/4"-32 = 6.35 mm\npitch 0.794 mm');
  expect(convertTooltipText('5/16"-18')).toBe('5/16"-18 = 7.94 mm\npitch 1.411 mm');
  expect(convertTooltipText("3/8″-16")).toBe("3/8″-16 = 9.52 mm\npitch 1.587 mm");
  expect(convertSupportedText('1/4"-32')).toBe('1/4"-32 = 6.35 mm\npitch 0.794 mm');
});

test("explicit numbered screw gauges include major diameter", () => {
  expect(convertScrewSizeText("#8 screw")).toBe("screw 4.17 mm");
  expect(convertTooltipText("#8 screws")).toBe("screw 4.17 mm");
  expect(convertTooltipText("#8 threaded hole")).toBe("screw 4.17 mm");
});

test("ambiguous bare number sizes include screw and drill meanings when both exist", () => {
  expect(convertScrewSizeText("#8")).toBe("screw 4.17 mm\nor drill 5.05 mm");
  expect(convertScrewSizeText("part #8")).toBe("part screw 4.17 mm\nor drill 5.05 mm");
});

test("ambiguous bare drill-only number sizes include drill meaning", () => {
  expect(convertScrewSizeText("#29")).toBe("drill 3.45 mm");
});

test("tap-drill number sizes use drill diameter", () => {
  expect(convertScrewSizeText("tap drill #29")).toBe("tap drill 3.45 mm");
  expect(convertTooltipText("tap drill #29")).toBe("drill 3.45 mm");
  expect(convertTooltipText("tap drill #8")).toBe("drill 5.05 mm");
});

test("explicit trailing number-drill sizes use drill diameter", () => {
  expect(convertScrewSizeText("#29 drill")).toBe("drill 3.45 mm");
  expect(convertTooltipText("#29 drill")).toBe("drill 3.45 mm");
  expect(convertTooltipText("#8 drill")).toBe("drill 5.05 mm");
});

test("explicit letter drill sizes include diameter", () => {
  expect(convertScrewSizeText("drill size F")).toBe("drill 6.53 mm");
  expect(convertScrewSizeText("drill size f")).toBe("drill 6.53 mm");
  expect(convertScrewSizeText("letter drill size Q")).toBe("drill 8.43 mm");
  expect(convertScrewSizeText("F drill")).toBe("drill 6.53 mm");
});

test("bare letters are not treated as drill sizes", () => {
  expect(convertScrewSizeText("Size F")).toBe("Size F");
  expect(convertScrewSizeText("Grade A")).toBe("Grade A");
  expect(convertTooltipText("use a drill")).toBe(null);
  expect(convertTooltipText("use a size drill")).toBe(null);
  expect(convertScrewSizeText("f drill")).toBe("f drill");
});

test("bare letter drill sizes convert only with drill-size spec label context", () => {
  expect(convertAmbiguousSpecValueTooltip("F", "Drill Size")).toBe("drill 6.53 mm");
  expect(convertAmbiguousSpecValueTooltip("Q", "Tap Drill Size")).toBe("drill 8.43 mm");
  expect(convertAmbiguousSpecValueTooltip("F drill", "Drill Size")).toBe(null);
  expect(convertAmbiguousSpecValueTooltip("F", "Grade")).toBe(null);
});

test("tolerances convert to metric without dropping plus/minus meaning", () => {
  expect(convertToleranceText('±0.005"')).toBe('±0.005" = ±0.127 mm');
  expect(convertToleranceText('+/-0.005"')).toBe('+/-0.005" = ±0.127 mm');
  expect(convertToleranceText('+0.005"')).toBe('+0.005" = +0.127 mm');
  expect(convertToleranceText("+0.005 in")).toBe('+0.005" = +0.127 mm');
  expect(convertToleranceText("-0.5 in")).toBe("-0.5 in");
  expect(convertSupportedText('Tolerance ±0.005"')).toBe('Tolerance ±0.005" = ±0.127 mm');
  expect(convertSupportedText('Tolerance +/-0.005"')).toBe('Tolerance +/-0.005" = ±0.127 mm');
  expect(convertSupportedText('Tolerance +0.005"')).toBe('Tolerance +0.005" = +0.127 mm');
  expect(convertTooltipText('+/-0.005"')).toBe("±0.127 mm");
  expect(convertTooltipText('+0.005"')).toBe("+0.127 mm");
  expect(convertTooltipText("+0.005 in")).toBe("+0.127 mm");
});

test("nonstandard screw-like ranges are not converted", () => {
  expect(convertScrewSizeText("2-55")).toBe("2-55");
});

test("supported text combines measurement and screw conversions", () => {
  expect(convertSupportedText("#8-32 x 1/2 in")).toBe(
    "#8-32 = 4.17 mm\npitch 0.794 mm\ntap 3.45 mm (#29) x 1/2 in = 12.70 mm",
  );
});
