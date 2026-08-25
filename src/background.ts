import { sendMessage, setupStorage, setupMessagesListener } from "./utils/browserUtils";

(() => {
const scripting = (typeof chrome !== "undefined") ? chrome.scripting : browser.scripting;
const permissions = (typeof chrome !== "undefined") ? chrome.permissions : browser.permissions;


((typeof chrome !== "undefined") ? chrome.action : browser.action).onClicked.addListener(async (tab) => {
    if (!tab.id || !tab.url || !tab.url.startsWith("http")) return; // Needs activeTab for url

    const utils = setupStorage(tab.url);

    // Need to do before any async call:
    registerContentScript(utils);

    if (await notifyIconPressedAndCheckContentScriptPresent(tab.id)) return;
    
    await injectContentScriptOnce(tab.id, utils);

    console.log(await scripting.getRegisteredContentScripts());
});

async function injectContentScriptOnce(tabId: number, utils: ReturnType<typeof setupStorage>) {
    await utils.toggleSiteState("on");
    await scripting.executeScript({
        "target": { "tabId": tabId },
        "files": ["content.js"],
    });
    scripting.insertCSS({
        "target": { "tabId": tabId },
        "files": ["content.css"]
    });
    console.log("Injected one time");

    if (await permissions.contains({"origins": [utils.originMatch]})) return;
    
    sendMessage({type:"askedForPermission"},tabId);
}

async function registerContentScript(utils: ReturnType<typeof setupStorage>) {
permissions.request({ "origins": [utils.originMatch] }, async (granted) => {
    if (granted) {
        if ((await scripting.getRegisteredContentScripts({"ids":[utils.storageKey]})).length == 0) {
            try {
                await scripting.registerContentScripts([{
                    "id":utils.storageKey,
                    "matches":[utils.originMatch],
                    "js":["content.js"],
                    "css":["content.css"],
                    "persistAcrossSessions":true, // ?
                }]);
                console.log("Content Script registered")
            } catch (error) {
                console.log(error);
            }
        } else console.log("Content already registered");
    }
    else console.log("Not granted - working only one time");
});}

async function notifyIconPressedAndCheckContentScriptPresent(tabId: number): Promise<boolean> {
    try {
        console.log("IconClick sent")
        let response = await sendMessage({ type: "iconClicked" }, tabId);
        console.log(response.type)
        return response.type == "IconClick Captured - Content Script present";
    } catch (error) {
        if (error != "Error: Could not establish connection. Receiving end does not exist.") {
            console.log(error);
        }
        return false
    }
}

// setupMessagesListener().listenToMessage()
})()