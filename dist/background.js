(function() {
	//#region src/background.ts
	if (typeof chrome === "undefined") chrome = browser;
	chrome.action.onClicked.addListener((tab) => {
		if (!tab.id) return;
		chrome.tabs.sendMessage(tab.id, { type: "iconClicked" }, {}, (response) => {});
	});
	//#endregion
})();
