import { expect, test } from "bun:test";
import { convertInlineText } from "../src/conversion";

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
  expect(convertInlineText("32 °F")).toBe("32 °F = 0.0 °C");
});

test("fractional inches to mm", () => {
  expect(convertInlineText("1 1/2 in")).toBe("1 1/2 in = 38.10 mm");
  expect(convertInlineText("3/4 in")).toBe("3/4 in = 19.05 mm");
});

test("negative and zero values", () => {
  expect(convertInlineText("0 ft")).toBe("0 ft = 0.00 m");
  expect(convertInlineText("-5 °F")).toBe("-5 °F = -20.6 °C");
});

test("unsupported units", () => {
  expect(convertInlineText("5 bananas")).toBe("5 bananas");
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
