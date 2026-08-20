"use strict";
document.addEventListener("DOMContentLoaded", async () => {
    async function mountComponentsForTesting() {
        let demoUrl = window.location.search.slice(1);
        if (demoUrl == "")
            demoUrl = "media-expert.htm";
        let demo = await fetch("./demo/" + demoUrl);
        document.getElementById("sample-content").innerHTML = await demo.text();
        let popupFile = await fetch("./popup/popup.html");
        document.getElementById("popup").innerHTML = await popupFile.text();
        await import("./popup/popup");
        await import("./content/content");
    }
    ;
    document.getElementById("select-demo").addEventListener("change", () => {
        window.location.replace("?" + document.getElementById("select-demo").value);
    });
    mountComponentsForTesting();
});
