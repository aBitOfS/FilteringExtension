// IMPORTANT may need to use local, sync may need Addon Id
// browser.storage.sync.get()

// WON'T WORK ON NOT BACKGROUND SCRIPT
// browserApi.tabs.query({ currentWindow: true, active: true });

import { alogResuilt } from "./utils";
import * as dev_utils from "./dev_utils";

// @ts-expect-error
if (typeof chrome === "undefined") chrome = browser;

const browserApi = (() => {
    if (typeof chrome !== "undefined") return chrome;
    if (typeof browser !== "undefined") return browser;
    else {
        console.log("DEMO MODE");
        return dev_utils;
    }
})();

function browserStorage() { //: chrome.storage.StorageArea {
    return browserApi.storage.local;
}

export type SiteSettings = { state: "unset" | "manual" | "preview", data?: never} |
    { state: "idle" | "working", itemSelector: string, idSelector: string, data?: never}

export function storageKeyFromUrl(url:string): string {
    // registerContentScript demands without https:// and ending /
    return url.split("://")[1].split("/")[0];
}

export async function getSiteSettings(): Promise<SiteSettings> {
    return alogResuilt(async () => {
    let url = storageKeyFromUrl(window.location.origin);

    if (!url) return { state: "unset" };

    let data = (await browserStorage().get(url))[url];
    
    if (!data) return { state: "manual" };

    return data as SiteSettings;
    }, storageKeyFromUrl(window.location.origin) ?? "");
}

export async function setSiteSettings(siteSettings:SiteSettings): Promise<boolean> {
    let url = storageKeyFromUrl(window.location.origin);

    if (!url) return false;

    const data: Record<string,SiteSettings> = {};
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
export function subscribeSiteSettings(listener: (changes: { [name: string]: chrome.storage.StorageChange; }) => void): () => void {
    browserStorage().onChanged.addListener(listener);
    return (() => browserStorage().onChanged.removeListener(listener));
}
export function listenToIconClick(listener: () => void) {
    browserApi.runtime.onMessage.addListener((message,sender,sendResponse) => {
        if (message.type ==  "iconClicked") {
            listener();
            sendResponse({ type: "captured" });
        }
    })
}