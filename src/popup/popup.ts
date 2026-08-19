import { getAppState, setAppState } from "../utils/dev_utils";
(() => {
function init() {
    getAppState();

    document.querySelector("#manual-select-btn")!.addEventListener("click", () => {
        setAppState("manual-select");
    });
    document.querySelector("#manual-select-cancel-btn")!.addEventListener("click", () => {
        setAppState("no-config");
    });
    console.log("Popup script initalized");
}

if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
else init();
})()