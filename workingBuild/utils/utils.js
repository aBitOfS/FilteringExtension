export function findCommonParent(elements) {
    if (elements.length <= 1)
        return null;
    let parent = elements[0];
    for (let i = 1; i < elements.length; i++) {
        while (parent && !parent.contains(elements[i])) {
            parent = parent.parentElement;
        }
    }
    return parent;
}
export async function alogResuilt(func, name = "") {
    let result = await func();
    console.log(name, result);
    return result;
}
