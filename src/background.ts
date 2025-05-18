/**
 * Background script for the extension.
 * Listens for the extension action (toolbar button) being clicked.
 * When clicked, sends a message to the active tab to toggle tooltips.
 */
chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
  if (tab.id !== undefined) {
    chrome.tabs.sendMessage(tab.id, { action: "toggleTooltips" });
  }
});
