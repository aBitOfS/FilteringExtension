export type validAppStates = "no-config" | "manual-select"

let appStateDebug: validAppStates = "no-config";
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
    // itemTemplate: string,
}
let config: AppConfig | null = null;
export function setConfig(value: AppConfig | null) {
    config = value;
}
export function getConfig() {
    return config;
}