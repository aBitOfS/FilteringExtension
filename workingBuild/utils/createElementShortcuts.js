export function create(tagIdClass, children = "", attributes = {}) {
    let [tagid, className] = tagIdClass.split(".");
    let [tagName, id] = tagid.split("#");
    const element = document.createElement(tagName);
    if (id)
        element.id = id;
    if (className)
        element.className = className;
    if (typeof (children) == "string")
        element.innerHTML = children;
    else
        element.append(...children);
    if (typeof (attributes) == "object") {
        for (const [key, value] of Object.entries(attributes)) {
            if (key.startsWith("on") && typeof (value) == "function") {
                element.addEventListener(key.slice(2), value);
            }
            else if (typeof (value) == "function") {
                console.error(`Cannot assign listener to ${key}`);
            }
            else {
                element.setAttribute(key, value);
            }
        }
    }
    else {
        element.addEventListener("click", attributes);
    }
    return element;
}
