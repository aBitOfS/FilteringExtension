(function() {
	//#region \0rolldown/runtime.js
	var __defProp = Object.defineProperty;
	var __exportAll = (all, no_symbols) => {
		let target = {};
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
		if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
		return target;
	};
	//#endregion
	//#region src/utils/dev_utils.ts
	var dev_utils_exports = /* @__PURE__ */ __exportAll({
		devStartContentScript: () => devStartContentScript,
		getStorage: () => getStorage,
		runtime: () => runtime,
		setStorage: () => setStorage,
		setUrl: () => setUrl,
		storage: () => storage,
		tabs: () => tabs
	});
	var url = "default";
	function setUrl(value) {
		url = value;
	}
	function setStorage(value) {
		localStorage = value;
	}
	function getStorage() {
		return localStorage;
	}
	var localStorage = {};
	var listeners = [];
	console.warn("DEV_UTILS loaded (shouldn't if it's built as extension)");
	var storage = { local: {
		async get(query) {
			if (query) {
				let obj = {};
				if (localStorage[query]) obj[query] = localStorage[query];
				else obj[query] = { "state": "unset" };
				return obj;
			}
			return localStorage;
		},
		set(data) {
			Object.entries(data).forEach((value) => {
				localStorage[value[0]] = value[1];
			});
			listeners.forEach((listener) => {
				listener(data);
			});
		},
		onChanged: {
			addListener(listener) {
				listeners.push(listener);
			},
			removeListener(listener) {
				listeners.filter((value) => {
					return value != listener;
				});
			}
		}
	} };
	var tabs = { async query(queryInfo) {
		return [{ url }];
	} };
	var listenersToStart = [];
	var runtime = {
		getURL(url) {
			return url;
		},
		onMessage: { addListener(callback) {
			listenersToStart.push(callback);
		} }
	};
	function devStartContentScript() {
		listenersToStart.forEach((value) => {
			value({ type: "iconClicked" }, null, (a) => {});
		});
	}
	(() => {
		if (typeof chrome !== "undefined") return chrome;
		if (typeof browser !== "undefined") return browser;
		else {
			console.log("DEMO MODE");
			return dev_utils_exports;
		}
	})();
	function storageKeyFromUrl(url) {
		return url.split("://")[1].split("/")[0];
	}
	//#endregion
	//#region src/background.ts
	(() => {
		if (typeof chrome === "undefined") chrome = browser;
		chrome.action.onClicked.addListener(async (tab) => {
			if (!tab.id || !tab.url || !tab.url.startsWith("http")) return;
			let url = storageKeyFromUrl(tab.url);
			registerContentScript(url);
			if (await notifyIconPressedAndCheckContentScriptPresent(tab.id)) return;
			await injectContentScriptOnce(tab.id, url);
			console.log(await chrome.scripting.getRegisteredContentScripts());
		});
		async function enableContentScriptIfDisabled(url) {
			let siteSettings = await chrome.storage.local.get(url);
			console.log(siteSettings);
			if (!siteSettings[url]) return;
			if (siteSettings[url].state == "idle") {
				siteSettings[url].state = "working";
				chrome.storage.local.set(siteSettings);
			} else if (siteSettings[url].state == "unset") {
				siteSettings[url].state = "manual";
				chrome.storage.local.set(siteSettings);
			}
		}
		async function injectContentScriptOnce(tabId, url) {
			await enableContentScriptIfDisabled(url);
			chrome.scripting.executeScript({
				"target": { "tabId": tabId },
				"files": ["content.js"]
			});
			chrome.scripting.insertCSS({
				"target": { "tabId": tabId },
				"files": ["content.css"]
			});
			console.log("Injected one time");
		}
		async function registerContentScript(url) {
			chrome.permissions.request({ "origins": [`*://${url}/*`] }, async (granted) => {
				if (granted) {
					if ((await chrome.scripting.getRegisteredContentScripts({ "ids": [url] })).length == 0) try {
						await chrome.scripting.registerContentScripts([{
							"id": url,
							"matches": [`*://${url}/*`],
							"js": ["content.js"],
							"css": ["content.css"],
							"persistAcrossSessions": true
						}]);
						console.log("Content Script registered");
					} catch (error) {
						console.log(error);
					}
					else console.log("Content already registered");
				} else console.log("Not granted - working only one time");
			});
		}
		async function notifyIconPressedAndCheckContentScriptPresent(tabId) {
			try {
				console.log("IconClick sent");
				let response = await chrome.tabs.sendMessage(tabId, { type: "iconClicked" });
				console.log(response.type);
				return response.type == "IconClick Captured - Content Script present";
			} catch (error) {
				if (error != "Error: Could not establish connection. Receiving end does not exist.") console.log(error);
				return false;
			}
		}
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			message.type;
		});
	})();
	//#endregion
})();
