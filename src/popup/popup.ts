(async () => {
const browserApi = await (async () => {
    if (typeof chrome !== "undefined") return chrome;
    if (typeof browser !== "undefined") return browser;
    else {
        console.log("DEMO MODE");
        return await import("../utils/dev_utils");
    }
})();
const { setSiteSettings } = await import(browserApi.runtime.getURL("../utils/browser_utils"));

function init() {

    document.querySelector("#manual-select-btn")!.addEventListener("click", () => {
        setSiteSettings({state: "manual"});
    });
    console.log("Popup script initalized");
}

if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
else init();
})();