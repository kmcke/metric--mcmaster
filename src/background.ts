/**
 * Sends the content-script toggle message to a tab when the tab has an id.
 * Used by both the toolbar button and the keyboard command so both entry
 * points keep identical behavior.
 */
function toggleTooltipsForTab(tab: chrome.tabs.Tab): void {
  if (tab.id !== undefined) {
    chrome.tabs.sendMessage(tab.id, { action: "toggleTooltips" });
  }
}

chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
  toggleTooltipsForTab(tab);
});

chrome.commands.onCommand.addListener((command) => {
  if (command !== "toggle-tooltips") return;

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab) toggleTooltipsForTab(tab);
  });
});
