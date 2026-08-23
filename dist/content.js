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
	//#region src/utils/utils.ts
	async function alogResuilt(func, name = "") {
		let result = await func();
		console.log(name, result);
		return result;
	}
	function findCommonParent(elements) {
		if (elements.length <= 1) return null;
		let parent = elements[0];
		for (let i = 1; i < elements.length; i++) while (parent && !parent.contains(elements[i])) parent = parent.parentElement;
		return parent;
	}
	async function getQuerySelectorAll(targetsList, firstTargetRelativeTo = document.body) {
		const targets = [...targetsList];
		if (targets.length < 2) throw new Error("Need at least 2 targets");
		let finalSelector = "";
		while (targets[0] != firstTargetRelativeTo) {
			if (targets[0] == targets[1]) break;
			let commonAttributes = { nth: 0 };
			commonAttributes.tag = targets[0].nodeName.toLowerCase();
			targets[0] = targets[0].parentElement;
			for (let i = 1; i < targets.length; i++) {
				if (commonAttributes.tag != targets[i].nodeName.toLowerCase()) commonAttributes.tag = void 0;
				if (!targets[i].parentElement) throw new Error("Reached end of html on one target. Probably nubmer of parents varies between targets which is currently unsupported");
				targets[i] = targets[i].parentElement;
			}
			finalSelector = `${commonAttributes.tag ?? "*"}${commonAttributes.nth != 0 ? `:nth-child(${commonAttributes.nth})` : ""}${finalSelector != "" ? `>${finalSelector}` : ""}`;
		}
		while (targets[0] != firstTargetRelativeTo) {
			if (targets[0].id) return `#${targets[0].id}>${finalSelector}`;
			finalSelector = `${targets[0].nodeName.toLowerCase()}>${finalSelector}`;
			targets[0] = targets[0].parentElement;
		}
		if (targets[0] == document.body) finalSelector = `body > ${finalSelector}`;
		return finalSelector;
	}
	//#endregion
	//#region src/utils/dev_utils.ts
	var dev_utils_exports = /* @__PURE__ */ __exportAll({
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
	console.log("DEV UTILS");
	var storage = { local: {
		async get(query) {
			if (query) {
				let obj = {};
				if (localStorage[query]) obj[query] = localStorage[query];
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
	var runtime = { getURL(url) {
		return url;
	} };
	//#endregion
	//#region src/utils/browser_utils.ts
	var browserApi = (() => {
		if (typeof chrome !== "undefined") return chrome;
		if (typeof browser !== "undefined") return browser;
		else {
			console.log("DEMO MODE");
			return dev_utils_exports;
		}
	})();
	function browserStorage() {
		return browserApi.storage.local;
	}
	async function getUrl() {
		return window.location.origin;
	}
	async function getSiteSettings() {
		return alogResuilt(async () => {
			let url = await getUrl();
			if (!url) return { state: "unset" };
			let data = (await browserStorage().get(url))[url];
			if (!data) return { state: "unset" };
			return data;
		}, await getUrl() ?? "");
	}
	async function setSiteSettings(siteSettings) {
		let url = await getUrl();
		if (!url) return false;
		const data = {};
		data[url] = siteSettings;
		await browserStorage().set(data);
		return siteSettings == (await browserStorage().get(url))[url];
	}
	/**
	* Adds listener to browser/Chrome.storage
	* 
	* @param listener - function called on storage change
	* @returns {function} Unsubscribe
	*/
	function subscribeSiteSettings(listener) {
		browserStorage().onChanged.addListener(listener);
		return (() => browserStorage().onChanged.removeListener(listener));
	}
	function listenToIconClick(listener) {
		chrome.runtime.onMessage.addListener((message, sender, response) => {
			if (message.type == "iconClicked") listener();
		});
	}
	//#endregion
	//#region src/utils/createElementShortcuts.ts
	function create(tagIdClass, children = "", attributes = {}) {
		let [tagid, className] = tagIdClass.split(".");
		let [tagName, id] = tagid.split("#");
		const element = document.createElement(tagName);
		if (id) element.id = id;
		if (className) element.className = className;
		if (typeof children == "string") element.innerHTML = children;
		else element.append(...children);
		if (typeof attributes == "object") for (const [key, value] of Object.entries(attributes)) if (key.startsWith("on") && typeof value == "function") element.addEventListener(key.slice(2), value);
		else if (typeof value == "function") console.error(`Cannot assign listener to ${key}`);
		else element.setAttribute(key, value);
		else element.addEventListener("click", attributes);
		return element;
	}
	//#endregion
	//#region src/content/manualSelect.ts
	var selectedElements = [];
	var selector = "";
	var idSelector = "";
	var [addClassWithUndo, undoClassAdd] = (() => {
		let toUndo = [];
		return [(element, className) => {
			if (!element) return;
			element.classList.add(className);
			toUndo.push([element, className]);
		}, () => {
			toUndo.forEach((value) => value[0].classList.remove(value[1]));
			toUndo = [];
		}];
	})();
	function selectItem(event) {
		if (contentElement$1.contains(event.target)) return;
		event.stopImmediatePropagation();
		event.preventDefault();
		event.stopPropagation();
		selectedElements.push(event.target);
		selectedElementsChanged();
	}
	async function selectedElementsChanged() {
		undoClassAdd();
		updateAppearance();
		if (selectedElements.length < 2) return;
		let listItems = selectedElements.map((v, i) => {
			return getItemFromItsChild(v, selectedElements[(i + 1) % selectedElements.length]);
		});
		selector = await getQuerySelectorAll(listItems);
		console.log(selector);
		console.log(selectedElements);
		idSelector = await getQuerySelectorAll(selectedElements, listItems[0]);
		console.log(idSelector);
		document.querySelectorAll(selector).forEach((el) => {
			addClassWithUndo(el, "fil-ext-m-item");
			addClassWithUndo(el.querySelector(idSelector), "fil-ext-m-id");
		});
		addClassWithUndo(findCommonParent(selectedElements), "fil-ext-m-parent");
	}
	function getItemFromItsChild(itemChild, siblingChild) {
		while (itemChild != document.body && itemChild.parentElement && !itemChild.parentElement.contains(siblingChild)) itemChild = itemChild.parentElement;
		return itemChild;
	}
	var contentElement$1 = create("div#filtering-extension-content");
	updateAppearance();
	function Undo() {
		selectedElements.pop();
		selectedElementsChanged();
	}
	function Done() {
		if (selectedElements.length <= 1) throw new Error("Need to select at least 2 items");
		console.log(selector);
		if (!selector) {
			alert("Error getting list selector");
			throw new Error("List item selector is null");
		}
		setSiteSettings({
			state: "working",
			itemSelector: selector,
			idSelector
		});
	}
	function Cancel() {
		setSiteSettings({ state: "idle" });
	}
	function updateAppearance() {
		contentElement$1.innerHTML = "";
		const n = selectedElements.length;
		contentElement$1.append(create("p", n < 2 ? `Click ${n == 0 ? "first" : "second"} list item's unique id` : "Check if whole list is inside blue box and each item is in separate red box"), n >= 2 ? create("p", "You may need to click any item in next row") : "", n >= 1 ? create("button", "Undo", { onclick: Undo }) : "", n > 1 ? create("button", "Done", { onclick: Done }) : "", create("button", "Cancel", { onclick: Cancel }));
	}
	function manualSelect() {
		return {
			enter() {
				console.log("manual-select started");
				selectedElements = [];
				updateAppearance();
				document.body.appendChild(contentElement$1);
				document.addEventListener("click", selectItem, true);
			},
			exit() {
				contentElement$1.remove();
				document.removeEventListener("click", selectItem, true);
				console.log("manual-select ended");
				undoClassAdd();
			}
		};
	}
	//#endregion
	//#region src/content/working.ts
	var itemsListElement = create("div#fil-ext-list");
	var contentElement = create("div#fil-ext-content", [create("div#fil-ext-topbar", [
		create("button", "Favourites", () => showOnly(favourites)),
		create("button", "Not ignored", () => showWithout(ignored)),
		create("button", "All (with ignored)", () => showWithout()),
		create("button", "Ignored", () => showOnly(ignored)),
		create("button", "Sort alphabetically (then choose filtering to apply)", () => {
			items.sort((itemA, itemB) => itemA.id > itemB.id ? 1 : -1);
		}),
		create("button", "Refresh (to get lazyloaded images)", () => setSiteSettings({ state: "unset" })),
		create("button", "Disable extension", () => setSiteSettings({ state: "unset" }))
	]), itemsListElement]);
	var originalItems;
	var items = [];
	var favourites = [];
	var ignored = [];
	var nowShown = ((el) => !ignored.includes(el.id));
	function showFiltered(filteringFunction = nowShown) {
		nowShown = filteringFunction;
		itemsListElement.innerHTML = "";
		items.forEach((el) => {
			if (!filteringFunction(el)) return;
			let element = create("div", el.originalData.innerHTML);
			element.append(create("div.fil-ext-item-controls", [create("button", "Ignore", () => {
				ignored.push(el.id);
				element.remove();
			}), create("button", "Favourite", () => {
				favourites.push(el.id);
				element.style.color = "pink";
			})]));
			itemsListElement.append(element);
		});
	}
	function showWithout(blacklistedIds = []) {
		showFiltered((el) => !blacklistedIds.includes(el.id));
	}
	function showOnly(whitelisted) {
		showFiltered((item) => whitelisted.includes(item.id));
	}
	function updateItems(itemElements, idSelector) {
		itemElements.forEach((el) => {
			let id = el.querySelector(idSelector).innerText;
			if (!id) {
				console.error("id not found");
				return;
			}
			let alreadyListed = false;
			items.forEach((item) => {
				if (item.id != id) return;
				alreadyListed = true;
				item.originalData.innerHTML = el.innerHTML;
			});
			if (alreadyListed) return;
			items.push({
				id,
				originalData: { innerHTML: el.innerHTML }
			});
		});
		showFiltered();
	}
	function workingState() {
		return {
			enter: async () => {
				let config = await getSiteSettings();
				if (config.state != "working" || !config.itemSelector || !config.idSelector) {
					setSiteSettings({ state: "unset" });
					return;
				}
				originalItems = Array.from(document.querySelectorAll(config.itemSelector));
				let parent = findCommonParent(originalItems);
				if (!parent) throw new Error("No parent element found");
				updateItems(originalItems, config.idSelector);
				parent.parentElement?.insertBefore(contentElement, parent);
				parent.style.display = "none";
			},
			exit: () => {
				if (contentElement.parentElement) {
					contentElement.nextSibling.style.display = "block";
					contentElement.remove();
				}
			}
		};
	}
	//#endregion
	//#region src/content.ts
	(async () => {
		let currentState = null;
		const appStateEnterExit = {
			"manual": manualSelect(),
			"working": workingState(),
			"idle": idleState(),
			"preview": idleState(),
			"unset": idleState()
		};
		async function appStateChanged() {
			currentState?.exit();
			currentState = appStateEnterExit[(await getSiteSettings()).state];
			await currentState.enter();
		}
		function idleState() {
			return {
				enter() {},
				exit() {}
			};
		}
		function init() {
			subscribeSiteSettings(appStateChanged);
			listenToIconClick(async () => {
				let currentSettings = await getSiteSettings();
				switch (currentSettings.state) {
					case "idle":
						setSiteSettings({
							...currentSettings,
							state: "working"
						});
						break;
					case "working":
						setSiteSettings({
							...currentSettings,
							state: "idle"
						});
						break;
					case "unset":
						setSiteSettings({ state: "manual" });
						break;
					default: setSiteSettings({ state: "unset" });
				}
			});
			appStateChanged();
			console.log("Content script intalized");
		}
		if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
		else init();
	})();
	//#endregion
})();
