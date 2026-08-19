export type validAppStates = "no-config" | "manual-select" | "working";

let appStateDebug: validAppStates = "no-config";
// let appStateDebug: validAppStates = "working";
const appStateListeners: (() => void)[]= []

export function getAppState() {
    return appStateDebug;
}

export function setAppState(state: validAppStates) {
    appStateDebug = state;
    appStateListeners.forEach((listener) => {
        listener();
    });
}

// ADD UNSUBSCRIBE ON DESTROY
export function listenAppState(listener: () => void) {
    appStateListeners.push(listener);
}

export interface AppConfig {
    itemSelector: string,
    idSelector: string,
    // itemTemplate: string,
}
let config: AppConfig | null = {
    itemSelector: "#section_list-items > div > span",
    idSelector: "div > div > div > div > div > h3"
}; // null;
export function setConfig(value: AppConfig | null) {
    config = value;
}
export function getConfig() {
    return config;
}

export function findCommonParent(elements: HTMLElement[]): HTMLElement | null {
    if (elements.length <= 1) return null;
    let parent: HTMLElement | null = elements[0]
    for (let i = 1; i < elements.length; i++) {
        while (parent && !parent.contains(elements[i])) {
            parent = parent.parentElement;
        }
    }
    return parent;
}