let url: string = "default";
export function setUrl(value: string) {
    url = value;
}
export function setStorage(value: Record<string,object>) {
    localStorage = value;
}
export function getStorage() {
    return localStorage;
}
let localStorage: Record<string,object> = {};
let listeners: ((a: any) => void)[] = [];
console.warn("DEV_UTILS loaded (shouldn't if it's built as extension)");

export const storage =  {
    local: {
        async get(query: string | null) {
            if (query) {
                let obj: Record<string,object> = {};
                if (localStorage[query]) {
                    obj[query] = localStorage[query]; 
                }
                else {
                    obj[query] = {"state":"unset"};
                }
                return obj;
            }
            return localStorage;
        },
        set(data: object) {
            Object.entries(data).forEach((value) => {
                localStorage[value[0]] = value[1]
            })
            listeners.forEach((listener) => {
                listener(data);
            })
        },
        onChanged: {
            addListener(listener: (a: any) => void) {
                listeners.push(listener);
            },
            removeListener(listener: (a: any) => void) {
                listeners.filter((value) => {
                    return value != listener;
                })
            }
        }
    }
};
export const tabs =  {
    async query(queryInfo: { currentWindow: true, active: true }) {
// { active?: boolean; pinned?: boolean; audible?: boolean; muted?: boolean; highlighted?: boolean; frozen?: boolean; discarded?: boolean; autoDiscardable?: boolean; currentWindow?: boolean; lastFocusedWindow?: boolean; status?: chrome.tabs.TabStatus; title?: string; url?: string | string[]; groupId?: number; splitViewId?: number; windowId?: number; windowType?: chrome.tabs.WindowType; index?: number; }) {
        return [{
            url: url
        }]
    },
};

const listenersToStart: ((message: any, sender: any, sendResponse: (response?: any) => void) => (boolean | Promise<any>) | undefined)[] = [];
export const runtime = {
    getURL(url: string) {
        return url;
    },
    onMessage: {
        addListener(callback: (message: any, sender: any, sendResponse: (response?: any) => void) => (boolean | Promise<any>) | undefined) {
            listenersToStart.push(callback)
        }
    }
}

export function devStartContentScript() {
    listenersToStart.forEach((value) => {
        value({ type: "iconClicked" }, null, (a: any) => {});
    })
}