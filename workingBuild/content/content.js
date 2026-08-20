(async () => {

function create(tagIdClass, children = "", attributes = {}) {
    let [tagid, className] = tagIdClass.split(".");
    let [tagName, id] = tagid.split("#");
    const element = document.createElement(tagName);
    if (id)
        element.id = id;
    if (className)
        element.className = className;
    if (typeof (children) == "string")
        element.innerHTML = children;
    else
        element.append(...children);

    if (typeof (attributes) == "object") {
        for (const [key, value] of Object.entries(attributes)) {
            if (key.startsWith("on") && typeof (value) == "function") {
                element.addEventListener(key.slice(2), value);
            }
            else if (typeof (value) == "function") {
                console.error(`Cannot assign listener to ${key}`);
            }
            else {
                element.setAttribute(key, value);
            }
        }
    }
    else {
        element.addEventListener("click", attributes);
    }
    return element;
}

    function findCommonParent(elements) {
    if (elements.length <= 1)
        return null;
    let parent = elements[0];
    for (let i = 1; i < elements.length; i++) {
        while (parent && !parent.contains(elements[i])) {
            parent = parent.parentElement;
        }
    }
    return parent;
}
async function alogResuilt(func, name = "") {
    let result = await func();
    console.log(name, result);
    return result;
}


    // IMPORTANT may need to use local, sync may need Addon Id
    // browser.storage.local.get()
    // NEED TO MANUALLY CHANGE browser.runtime.getURL("../utils/browser_utils")
    async function getUrl() {
        // let tabs = await browser.tabs.query({ currentWindow: true, active: true });
        // if (tabs.length == 0) {
        //     return null;
        // }
        // ;
        // return tabs[0].url ?? null;
        return "abc"
    }
    async function getSiteSettings() {
        return alogResuilt(async () => {
            let url = await getUrl();
            if (!url)
                return { state: "idle" };
            let data = (await browser.storage.local.get(url))[url];
            if (!data)
                return { state: "idle" };
            return data;
        }, await getUrl() ?? "");
    }
    async function setSiteSettings(siteSettings) {
        return alogResuilt(async () => {
            let url = "abc";
        
            if (!url) return false;
        
            const data = {};
            data[url] = siteSettings;
            await browser.storage.local.set(data);

            console.log(await browser.storage.local.get())
            
            return siteSettings == (await browser.storage.local.get(url)).url;
        },siteSettings);
    }
    /**
     * Adds listener to browser/Chrome.storage
     *
     * @param listener - function called on storage change
     * @returns {function} Unsubscribe
     */
    function subscribeSiteSettings(listener) {
        browser.storage.local.onChanged.addListener(listener);
        return (() => browser.storage.local.onChanged.removeListener(listener));
    }
    function getUrlTo(url) {
        // return url;
        return browser.runtime.getURL(url);
    }
    

    const itemsListElement = create("div#fil-ext-list");
    const customListElement = create("div#fil-ext-content", [
        create("div#fil-ext-topbar", [
            create("button", "Favourites", () => showOnly(favourites)),
            create("button", "Not ignored", () => showWithout(ignored)),
            create("button", "All (with ignored)", () => showWithout()),
            create("button", "Ignored", () => showOnly(ignored)),
            create("button", "Disable extension", () => setSiteSettings({ state: "idle" }))
        ]),
        itemsListElement
    ]);
    function showFiltered(filteringFunction) {
        itemsListElement.innerHTML = "";
        items.forEach((el) => {
            if (!filteringFunction(el))
                return;
            let element = create("div", el.originalData.innerHTML);
            element.append(create("div.fil-ext-item-controls", [
                create("button", "Ignore", () => {
                    ignored.push(el.id);
                    element.remove();
                }),
                create("button", "Favourite", () => {
                    favourites.push(el.id);
                    element.style.color = "pink";
                })
            ]));
            itemsListElement.append(element);
        });
    }
    function showWithout(blacklistedIds = []) {
        itemsListElement.innerHTML = "";
        items.forEach((el) => {
            if (blacklistedIds.includes(el.id))
                return;
            let element = create("div", el.originalData.innerHTML);
            element.append(create("div.fil-ext-item-controls", [
                create("button", "Ignore", () => {
                    ignored.push(el.id);
                    element.remove();
                }),
                create("button", "Favourite", () => {
                    favourites.push(el.id);
                    element.style.color = "pink";
                })
            ]));
            itemsListElement.append(element);
        });
    }
    function showOnly(whitelisted) {
        showFiltered((item) => whitelisted.includes(item.id));
    }
    let originalItems;
    let items = [];
    let favourites = [];
    let ignored = [];
    function workingState() {
        return { enter: async () => {
                let config = await getSiteSettings();
                if (config.state != "working" || !config.itemSelector || !config.idSelector) {
                    setSiteSettings({ state: "idle" });
                    return;
                }
                originalItems = Array.from(document.querySelectorAll(config.itemSelector));
                originalItems.forEach((el) => {
                    let id = el.querySelector(config.idSelector);
                    if (!id) {
                        console.error("id not found");
                        return;
                    }
                    items.push({ id: id.innerText, originalData: { innerHTML: el.innerHTML } });
                });
                let parent = findCommonParent(originalItems);
                console.log(parent);
                if (!parent)
                    throw new Error("No parent element found");
                parent.parentElement?.insertBefore(customListElement, parent);
                parent.style.display = "none";
                showWithout(ignored);
            }, exit: () => {
                customListElement.nextSibling.style.display = "block";
                customListElement.remove();
            } };
    }
    
    let selectedElements = [];
    let selector = "";
    let idSelector = "";
    const [addClassWithUndo, undoClassAdd] = (() => {
        let toUndo = [];
        return [(element, className) => {
                if (!element)
                    return;
                element.classList.add(className);
                toUndo.push([element, className]);
            }, () => {
                toUndo.forEach((value) => value[0].classList.remove(value[1]));
                toUndo = [];
            }];
    })();
    function selectItem(event) {
        console.log(customManualElement,event.target,customManualElement.contains(event.target));
        if (customManualElement.contains(event.target))
            return;
        console.log("PREVENTED")
        event.stopImmediatePropagation();
        event.preventDefault();
        event.stopPropagation();
        selectedElements.push(event.target);
        undoClassAdd();
        updateAppearance();
        if (selectedElements.length < 2)
            return;
        let listItem = getItemFromItsChild(selectedElements[0], selectedElements[1]);
        selector = getQuerySelector(listItem) ?? "";
        // Add Handle different selectors (like recommended products)
        if (selector != "") {
            idSelector = getQuerySelector(selectedElements[0], listItem) ?? "";
            document.querySelectorAll(selector).forEach((el) => {
                addClassWithUndo(el, "fil-ext-m-item");
                addClassWithUndo(el.querySelector(idSelector), "fil-ext-m-id");
            });
            addClassWithUndo(findCommonParent(selectedElements), "fil-ext-m-parent");
        }
    }
    function getItemFromItsChild(itemChild, siblingChild) {
        // let c = 0
        // console.log(itemChild);
        while (itemChild != document.body && itemChild.parentElement && !itemChild.parentElement.contains(siblingChild)) {
            // console.log(itemChild, itemChild.parentElement, c);
            itemChild = itemChild.parentElement;
            // c++;
            // if (c > 100) throw new Error("Infinite look in getItemFromItsChild");
        }
        return itemChild;
    }
    function getQuerySelector(listItem, relativeTo = document.body) {
        let selector = "";
        // let c = 0
        while (listItem && listItem != relativeTo) {
            if (listItem.id) {
                selector = `#${listItem.id} > ${selector}`;
                break;
            }
            selector = ` > ${selector}`;
            // listItem.classList.forEach((value: string) => {
            //     selector = `.${value}${selector}`;
            // })
            selector = `${listItem.nodeName.toLowerCase()}${selector}`;
            listItem = listItem.parentElement;
            // console.log(selector);
            // c++;
            // if (c > 1000) throw new Error("Infinite look in getQuerySelector");
        }
        if (listItem == document.body)
            selector = `body > ${selector}`;
        return selector.slice(0, -3);
    }
    const customManualElement = create("div#filtering-extension-content");
    updateAppearance();
    function Undo() {
        selectedElements.pop();
        updateAppearance();
    }
    function Done() {
        if (selectedElements.length <= 1)
            throw new Error("Need to select at least 2 items");
        console.log(selector);
        if (!selector) {
            alert("Error getting list selector");
            throw new Error("List item selector is null");
        }
        setSiteSettings({ state: "working", itemSelector: selector, idSelector: idSelector });
    }
    function Cancel() { console.log("CANCEL"); setSiteSettings({ state: "idle" }); }
    function updateAppearance() {
        customManualElement.innerHTML = "";
        const n = selectedElements.length;
        customManualElement.append(create("p", n < 2 ? (`Click ${n == 0 ? "first" : "second"} list item's unique id`) :
            "Check if whole list is inside blue box and each item is in separate red box"), (n > 2 ? create("p", "You may need to click any item in next row") : ""), (n > 1 ? create("button", "Undo", Undo) : ""), (n > 1 ? create("button", "Done", Done) : ""), create("button", "Cancel", Cancel));
    }
    function manualSelect() {
        return {
            enter() {
                console.log("manual-select started");
                selectedElements = [];
                updateAppearance();
                document.body.appendChild(customManualElement);
                document.addEventListener("click", selectItem, true);
            },
            exit() {
                customManualElement.remove();
                document.removeEventListener("click", selectItem, true);
                console.log("manual-select ended");
                undoClassAdd();
            }
        };
    }
    
    // interface AppState {
    //     type: string,
    //     props: Record<string,string>,
    // }
    let currentState = null;
    const appStateEnterExit = {
        "manual": manualSelect(),
        "working": workingState(),
        "idle": idleState(),
        "preview": idleState()
    };
    async function appStateChanged() {
        currentState?.exit();
        currentState = appStateEnterExit[(await getSiteSettings()).state];
        await currentState.enter();
    }
    function idleState() { return { enter() { }, exit() { } }; }
    function init() {
        subscribeSiteSettings(appStateChanged);
        appStateChanged();
        // Add styles (here or in manifest.json)
        console.log("Content script intalized");
    }
    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", init);
    else
        init();
})();
