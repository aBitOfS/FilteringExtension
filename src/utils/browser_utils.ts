// IMPORTANT may need to use local, sync may need Addon Id
// browser.storage.sync.get()

// WON'T WORK ON NOT BACKGROUND SCRIPT
// browserApi.tabs.query({ currentWindow: true, active: true });

import { alogResuilt } from "./utils";
import * as dev_utils from "./dev_utils";

const browserApi = (() => {
    if (typeof chrome !== "undefined") return chrome;
    if (typeof browser !== "undefined") return browser;
    else {
        console.log("DEMO MODE");
        return dev_utils;
    }
})();
// const { alogResuilt }: typeof import("./utils") = await import(browserApi.runtime.getURL("./utils"));

function browserStorage() { //: chrome.storage.StorageArea {
    return browserApi.storage.local;
}

export type SiteSettings = { state: "unset" | "manual" | "preview", data?: never} |
    { state: "idle" | "working", itemSelector: string, idSelector: string, data?: never}

export async function getUrl(): Promise<string | null> {
    // WON'T WORK ON NOT BACKGROUND SCRIPT

    // let tabs = await browserApi.tabs.query({ currentWindow: true, active: true });
    // if (tabs.length == 0) { return null;};

    // return tabs[0].url ?? null;
    return window.location.origin
}
export async function getSiteSettings(): Promise<SiteSettings> {
    return alogResuilt(async () => {
    let url = await getUrl();

    if (!url) return { state: "unset" };

    let data = (await browserStorage().get(url))[url];
    
    if (!data) return { state: "unset" };

    return data as SiteSettings;
    }, await getUrl() ?? "");
}

export async function setSiteSettings(siteSettings:SiteSettings): Promise<boolean> {
    let url = await getUrl();

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
    browserApi.runtime.onMessage.addListener((message,sender,response) => {
        if (message.type ==  "iconClicked") {
            listener();
        }
    })
    // chrome.storage.local.onChanged.addListener((changes) => {
    //     if (changes["iconClick"]) listener();
    // });
}