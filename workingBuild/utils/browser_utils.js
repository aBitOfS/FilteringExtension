// IMPORTANT may need to use local, sync may need Addon Id
// browser.storage.sync.get()
// NEED TO MANUALLY CHANGE browser.runtime.getURL("../utils/browser_utils")
import { alogResuilt } from "./utils";
export async function getUrl() {
    let tabs = await browser.tabs.query({ currentWindow: true, active: true });
    if (tabs.length == 0) {
        return null;
    }
    ;
    return tabs[0].url ?? null;
}
export async function getSiteSettings() {
    return alogResuilt(async () => {
        let url = getUrl();
        if (!url)
            return { state: "idle" };
        let data = (await browser.storage.sync.get(url)).url;
        if (!data)
            return { state: "idle" };
        return data;
    }, await getUrl() ?? "");
}
export async function setSiteSettings(siteSettings) {
    let url = getUrl();
    if (!url)
        return false;
    await browser.storage.sync.set({ url: siteSettings });
    return siteSettings == (await browser.storage.sync.get(url)).url;
}
/**
 * Adds listener to browser/Chrome.storage
 *
 * @param listener - function called on storage change
 * @returns {function} Unsubscribe
 */
export function subscribeSiteSettings(listener) {
    browser.storage.sync.onChanged.addListener(listener);
    return (() => browser.storage.sync.onChanged.removeListener(listener));
}
export function getUrlTo(url) {
    return url;
    // return browser.runtime.getURL(url);
}
