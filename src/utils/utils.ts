export async function alogResuilt<T>(func: () => T, name: string = ""): Promise<T> {
    let result = await func();
    console.log(name,result);
    return result
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

function getNodesFromParentToChild(child: HTMLElement, parent: HTMLElement) {
    if (!parent.contains(child)) throw new Error("Parent doesn't contain child");
    
    let nodes = [];
    nodes.unshift(child);

    while (child != parent) {
        child = child.parentElement!;
        nodes.unshift(child);
    }
    return nodes;
}

export function getChildIndex(child: ChildNode, ofSameType: boolean = false) {
    let i = 1;
    let a = 0;

    let tag = child.nodeName;
    // vvv Hope it runs in order! vvv
    child.parentNode!.childNodes.forEach((el) => {
        if (el == child) a = i;
        if (!ofSameType || el.nodeName == tag) i++;
    })
    // console.log(a,child.parentElement!.innerHTML,child);
    return a;
}

export async function getQuerySelectorAll(targetsList: HTMLElement[], firstTargetRelativeTo: HTMLElement = document.body) {
    const targets = [...targetsList];
    if (targets.length < 2) throw new Error("Need at least 2 targets");

    let finalSelector = "";

    while (targets[0] != firstTargetRelativeTo) {
        if (targets[0] == targets[1]) break;

        // May use tags list instead
        let commonAttributes: {tag?:keyof HTMLElementTagNameMap, nth:number} = {nth: 0};
        
        commonAttributes.tag = targets[0].nodeName.toLowerCase() as keyof HTMLElementTagNameMap;
        
        // DISABLED - works different than assumed
        // commonAttributes.nth = getChildIndex(targets[0]);

        targets[0] = targets[0].parentElement!;

        for (let i = 1; i < targets.length; i++) {
            if (commonAttributes.tag != targets[i].nodeName.toLowerCase() as keyof HTMLElementTagNameMap) {
                commonAttributes.tag = undefined;
            }
            // if (commonAttributes.nth != 0 && commonAttributes.nth != getChildIndex(targets[i])) {
            //     commonAttributes.nth = 0;
            // }

            if (!targets[i].parentElement) throw new Error("Reached end of html on one target. Probably nubmer of parents varies between targets which is currently unsupported");

            targets[i] = targets[i].parentElement!;
        }
        finalSelector = `${commonAttributes.tag ?? "*"}${commonAttributes.nth != 0 ? `:nth-child(${commonAttributes.nth})`
            : ""}${finalSelector != "" ? `>${finalSelector}` : ""}`;
    }

    // Relative to checked only for first -> can be different for others without having relativeTo[] list foreach target
    // if (!targets.every((el) => el == targets[0])) throw new Error("Different lenghts of paths unimplemented");
    // So to allow this, no error on different relativeTo

    while (targets[0] != firstTargetRelativeTo) {
        if (targets[0].id) return `#${targets[0].id}>${finalSelector}`;

        finalSelector = `${targets[0].nodeName.toLowerCase()}>${finalSelector}`;
        targets[0] = targets[0].parentElement!;
    }

    if (targets[0] == document.body) finalSelector = `body > ${finalSelector }`;
    return finalSelector;
}

export function getQuerySelector(target: HTMLElement | null, relativeTo: HTMLElement = document.body): string | null {
    let selector = "";

    if (!relativeTo.contains(target)) throw new Error("RelativeTo doesn't contain target");
    
    while (target && target != relativeTo) {
        if (relativeTo == document.body && target.id) {
            selector = `#${target.id} > ${selector}`;
            break;
        }
        selector = ` > ${selector}`;
        // target.classList.forEach((value: string) => {
        //     selector = `.${value}${selector}`;
        // })
        selector = `${target.nodeName.toLowerCase()}${selector}`;
        target = target.parentElement;
    }
    if (target == document.body) selector = `body > ${selector}`;
    return selector.slice(0,-3);
}