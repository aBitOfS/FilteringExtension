if (typeof chrome === "undefined") chrome = browser;

chrome.action.onClicked.addListener((tab) => {
    if (!tab.id) return;

    chrome.tabs.sendMessage(tab.id, { type: "iconClicked" },{},(response) => {});
    //     ^^^^ runtime for communication to popup/background/all tabs
    // Similar to listening to storage change and:
    // chrome.storage.local.set({"iconClick": new Date()})
    // But want only active tab
});