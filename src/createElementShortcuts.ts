
export type TagWithIdClass = keyof HTMLElementTagNameMap |
    `${keyof HTMLElementTagNameMap}#${string}` |
    `${keyof HTMLElementTagNameMap}.${string}` |
    `${keyof HTMLElementTagNameMap}#${string}`;

export function create(tagIdClass: TagWithIdClass): HTMLElement;
export function create(tagIdClass: TagWithIdClass, childrenOrText: HTMLElement[] | string): HTMLElement;
export function create(tagIdClass: TagWithIdClass, childrenOrText: HTMLElement[] | string, attributes: Record<string,string | ((a: Event) => void)>): HTMLElement;

export function create(tagIdClass: TagWithIdClass, children: HTMLElement[] | string = "", attributes: Record<string,string | ((a: Event) => void)> = {}) {
    let [tagid,className] = (tagIdClass as string).split(".");
    let [tagName,id] = (tagid as string).split("#");

    const element = document.createElement(tagName);

    if (id) element.id = id;
    if (className) element.className = className;

    for (const [key, value] of Object.entries(attributes)) {
        if (key.startsWith("on") && typeof(value) == "function") {
            element.addEventListener(key.slice(2),value)
        } else if (typeof(value) == "function") { console.error(`Cannot assign listener to ${key}`)}
        else {
            element.setAttribute(key, value);
        }
    }
    
    element.append(...children);
    return element;
}