import { loadSettings, saveDecimalPlaces } from "./settings";

const input = document.getElementById("decimalPlaces") as HTMLInputElement | null;
const status = document.getElementById("status");
let statusTimer: number | null = null;

function showStatus(text: string): void {
  if (!status) return;
  status.textContent = text;
  if (statusTimer != null) window.clearTimeout(statusTimer);
  statusTimer = window.setTimeout(() => {
    status.textContent = "";
  }, 1200);
}

async function initialize(): Promise<void> {
  if (!input) return;
  const settings = await loadSettings();
  input.value = String(settings.decimalPlaces);
  input.addEventListener("change", async () => {
    input.value = String(await saveDecimalPlaces(input.value));
    showStatus("Saved");
  });
}

void initialize();
