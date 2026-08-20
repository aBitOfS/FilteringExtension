let appStateDebug = "no-config";
// let appStateDebug: validAppStates = "working";
const appStateListeners = [];
export function getAppState() {
    return appStateDebug;
}
export function setAppState(state) {
    appStateDebug = state;
    appStateListeners.forEach((listener) => {
        listener();
    });
}
// ADD UNSUBSCRIBE ON DESTROY
export function listenAppState(listener) {
    appStateListeners.push(listener);
}
let config = {
    itemSelector: "#section_list-items > div > span",
    idSelector: "div > div > div > div > div > h3"
}; // null;
export function setConfig(value) {
    config = value;
}
export function getConfig() {
    return config;
}
