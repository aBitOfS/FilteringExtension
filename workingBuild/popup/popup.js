
(() => {
async function alogResuilt(func, name = "") {
    let result = await func();
    console.log(name, result);
    return result;
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

    function init() {
        document.querySelector("#manual-select-btn").addEventListener("click", () => {
            setSiteSettings({ state: "manual" });
        });
        console.log("Popup script initalized");
    }
    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", init);
    else
        init();
})();
