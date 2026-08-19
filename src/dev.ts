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
    function listenToDemoChoice() {
	document.getElementById("demo-choice").addEventListener("change",async (el) => {
		let demo = await fetch("./demo/"+el.target.value);	
		document.getElementById("sample-content")!.innerHTML = await demo.text();

		// Imitate webpage change
    }

    mountComponentsForTesting();

    listenToDemoChoice();
});
