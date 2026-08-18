document.addEventListener("DOMContentLoaded", async () => {
    async function mountComponentsForTesting() {
        let demoFile = await fetch("./dev/media_expert.htm");
        // let demoFile = await fetch("./dev/x-kom.htm");
        document.getElementById("sample-content")!.innerHTML = await demoFile.text();
    
        let popupFile = await fetch("./popup.html");
        document.getElementById("popup")!.innerHTML = await popupFile.text();

        await import("./popup");
        
        await import("./content");
    };
    mountComponentsForTesting();
});