import { getAppState, listenAppState, validAppStates } from "./dev_utils";
import manualSelect from "./manualSelect";
import { workingState } from "./working";

export interface AppStateBehavior { enter(): void; exit(): void }

(() => {
// interface AppState {
//     type: string,
//     props: Record<string,string>,
// }

let currentState: AppStateBehavior | null = null;

const appStateEnterExit: Record<validAppStates, AppStateBehavior> = {
    "manual-select": manualSelect(),
    "working": workingState(),
    "no-config": idleState(),
};

function appStateChanged() {
    currentState?.exit();
    currentState = appStateEnterExit[getAppState()];
    currentState.enter();
}

function idleState(): AppStateBehavior { return {enter() {},exit() {}}}

function init() {
    listenAppState(appStateChanged);
    appStateChanged();

    // Add styles (here or in manifest.json)

    console.log("Content script intalized")
}

if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
else init();
})();