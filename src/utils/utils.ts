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

export async function alogResuilt<T>(func: () => T, name: string = ""): Promise<T> {
    let result = await func();
    console.log(name,result);
    return result
}