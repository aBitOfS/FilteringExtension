import { SiteSettings, storageKeyFromUrl } from "./utils/browser_utils";

(() => {
// @ts-expect-error
if (typeof chrome === "undefined") chrome = browser;

chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id || !tab.url || !tab.url.startsWith("http")) return; // Needs activeTab for url
    let url = storageKeyFromUrl(tab.url);

    // Need to do before any async call:
    registerContentScript(url);

    if (await notifyIconPressedAndCheckContentScriptPresent(tab.id)) return;
    
    await injectContentScriptOnce(tab.id, url);

    console.log(await chrome.scripting.getRegisteredContentScripts());
});

async function enableContentScriptIfDisabled(url: string) {
    let siteSettings: Record<string,SiteSettings> = (await chrome.storage.local.get(url));
    console.log(siteSettings);
    if (!siteSettings[url]) return;

    if (siteSettings[url].state == "idle") {
        siteSettings[url].state = "working";
        chrome.storage.local.set(siteSettings);
    }
    else if (siteSettings[url].state == "unset") {
        siteSettings[url].state = "manual";
        chrome.storage.local.set(siteSettings);
    }
}

async function injectContentScriptOnce(tabId: number, url: string) {
    await enableContentScriptIfDisabled(url);
    chrome.scripting.executeScript({
        "target": { "tabId": tabId },
        "files": ["content.js"],
    });
    chrome.scripting.insertCSS({
        "target": { "tabId": tabId },
        "files": ["content.css"]
    });
    console.log("Injected one time");
}
async function registerContentScript(url: string) {
chrome.permissions.request({ "origins": [`*://${url}/*`] }, async (granted) => {
    if (granted) {
        if ((await chrome.scripting.getRegisteredContentScripts({"ids":[url]})).length == 0) {
            try {
                // chrome.runtime.lastError
                await chrome.scripting.registerContentScripts([{
                    "id":url,
                    "matches":[`*://${url}/*`],
                    "js":["content.js"],
                    "css":["content.css"],
                    "persistAcrossSessions":true, // ?
                }]);
                console.log("Content Script registered")
            } catch (error) {
                console.log(error);
            }
        } else console.log("Content already registered")
    }
    else console.log("Not granted - working only one time");
});}

async function notifyIconPressedAndCheckContentScriptPresent(tabId: number): Promise<boolean> {
    try {
        console.log("IconClick sent")
        let response = await chrome.tabs.sendMessage(tabId, { type: "iconClicked" });
        console.log(response.type)
        return response.type == "IconClick Captured - Content Script present";
    } catch (error) {
        if (error != "Error: Could not establish connection. Receiving end does not exist.") {
            console.log(error);
        }
        return false
    }
}

chrome.runtime.onMessage.addListener((message,sender,sendResponse) => {
    switch (message.type) {
        // case "registerContentScript":
        //     registerContentScript(message.url)
        //     break;
    }
});
})()