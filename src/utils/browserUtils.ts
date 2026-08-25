// IMPORTANT may need to use local, sync may need Addon Id
// browser.storage.sync.get()

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

export type SiteSettings = { state: "unset" | "manual" | "preview", data?: never} |
    { state: "idle" | "working", itemSelector: string, idSelector: string, data?: never}

function browserStorage() { //: chrome.storage.StorageArea {
    return browserApi.storage.local;
}

export function setupStorage(url: string) {
    const storageKey = url.split("://")[1].split("/")[0]
    const originMatch = `*://${storageKey}/*`;

    async function getSiteSettings(): Promise<SiteSettings> {
        return alogResuilt(async () => {
        let url = storageKey;

        if (!url) return { state: "unset" };

        let data = (await browserStorage().get(url))[url];
        
        if (!data) return { state: "manual" };

        return data as SiteSettings;
        }, storageKey ?? "");
    }
    async function setSiteSettings(siteSettings:SiteSettings): Promise<boolean> {
        let url = storageKey;

        if (!url) return false;

        const data: Record<string,SiteSettings> = {};
        data[url] = siteSettings;
        await browserStorage().set(data);
        
        return siteSettings == await getSiteSettings();
    }
    async function toggleSiteState(mode: undefined | "on" | "off") {
        let currentSettings: SiteSettings = await getSiteSettings();
        switch (currentSettings.state) {
            case "idle":
                if (mode != "off") setSiteSettings({...currentSettings, state: "working"});
                break;
            case "working":
                if (mode != "on") setSiteSettings({...currentSettings, state: "idle"});
                break;
            case "unset":
                if (mode != "off") setSiteSettings({state:"manual"});
                break;
            case "manual":
                if (mode != "on") setSiteSettings({state: "unset"});
                break;
            case "preview":
                if (mode != "on") setSiteSettings({state: "unset"});
                break;
            default: currentSettings satisfies never // throw error if not everything handled
        }
    }

    return {
        storageKey, getSiteSettings, setSiteSettings, toggleSiteState, originMatch
    }
}
export function setupMessagesListener() {
    const messageListeners: { [K in keyof BrowserMessageMap]?:(message: BrowserMessageMap[K],sender: chrome.runtime.MessageSender,sendResponse: (response?: any) => void) => boolean } = {};

    function setupMessageListener() {
        browserApi.runtime.onMessage.addListener((message,sender,sendResponse) => {
            let listener = messageListeners[message.type as keyof BrowserMessageMap];
            if (listener) listener(message,sender,sendResponse);
        });
    }

    function listenToMessage<K extends keyof BrowserMessageMap>(message: K, listener: (message: BrowserMessageMap[K],sender: chrome.runtime.MessageSender,sendResponse: (response?: any) => void) => boolean) {
        if (Object.keys.length == 0) setupMessageListener();

        // @ts-expect-error // TO FIX
        messageListeners[message] = listener;
        return listenToMessage;
    }
    return {
        listenToMessage
    }
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

// export function sendMessage<K extends keyof BrowserMessageMap>(type: K, payload: BrowserMessageMap[K] , toTabId: number | undefined) {\
export async function sendMessage(message: BrowserMessageMap[keyof BrowserMessageMap] , toTabId: number | undefined = undefined): Promise<any> {
    if (toTabId) {
        return await chrome.tabs.sendMessage(toTabId,message);
    } else {
        return await chrome.runtime.sendMessage(message);
    }
}