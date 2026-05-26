import { normalizeDecimalPlaces, setDecimalPlaces } from "./conversion";

export const decimalPlacesSettingKey = "decimalPlaces";
export const defaultDecimalPlaces = 2;

export type ExtensionSettings = {
  decimalPlaces: number;
};

/**
 * Reads extension settings and applies them to conversion formatting.
 */
export async function loadSettings(): Promise<ExtensionSettings> {
  const stored = await chrome.storage.sync.get({ [decimalPlacesSettingKey]: defaultDecimalPlaces });
  const decimalPlaces = normalizeDecimalPlaces(stored[decimalPlacesSettingKey]);
  setDecimalPlaces(decimalPlaces);
  return { decimalPlaces };
}

/**
 * Saves the decimal-place setting after clamping it to the supported range.
 */
export async function saveDecimalPlaces(value: unknown): Promise<number> {
  const decimalPlaces = normalizeDecimalPlaces(value);
  await chrome.storage.sync.set({ [decimalPlacesSettingKey]: decimalPlaces });
  setDecimalPlaces(decimalPlaces);
  return decimalPlaces;
}
