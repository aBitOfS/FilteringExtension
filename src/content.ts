// Manually remove exports = {} from generated js file

import { listenToIconClick, setSiteSettings, SiteSettings } from "./utils/browser_utils";

export interface AppStateBehavior { enter(): void; exit(): void }

import { getSiteSettings, subscribeSiteSettings } from "./utils/browser_utils";
import { manualSelect } from "./content/manualSelect";
import { workingState } from "./content/working";

(async () => {
let currentState: AppStateBehavior | null = null;

const appStateEnterExit: Record<SiteSettings["state"], AppStateBehavior> = {
    "manual": manualSelect(),
    "working": workingState(),
    "idle": idleState(), "preview": idleState(), "unset": idleState()
};

async function appStateChanged() {
    currentState?.exit();
    currentState = appStateEnterExit[(await getSiteSettings()).state];
    await currentState.enter();
}

function idleState(): AppStateBehavior { return {enter() {},exit() {}}}

function init() {
    subscribeSiteSettings(appStateChanged);
    listenToIconClick(async () => {
        let currentSettings: SiteSettings = await getSiteSettings();
        switch (currentSettings.state) {
            case "idle":
                setSiteSettings({...currentSettings, state: "working"});
                break;
            case "working":
                setSiteSettings({...currentSettings, state: "idle"});
                break;
            case "unset":
                setSiteSettings({state:"manual"});
                break;
            default:
                setSiteSettings({state: "unset"});
                break;
        }
    })
    appStateChanged();

    // Add styles (here or in manifest.json)

    console.log("Content script intalized")
}

if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
else init();
})();