import { AppStateBehavior } from "./content";
import { create } from "./createElementShortcuts";
import { setAppState } from "./dev_utils";

let selectedElements: HTMLElement[] = []
let commonParent: HTMLElement | null = null;

function selectItem(event: MouseEvent) {
    if (contentElement.contains(event.target as HTMLElement)) return
    event.stopImmediatePropagation();

    selectedElements.push(event.target as HTMLElement);

    if (commonParent) commonParent.classList.remove("filtering-extension-selected");

    commonParent = findCommonParent(selectedElements);
    commonParent?.classList.add("filtering-extension-selected");
    
    updateAppearance();
}

function findCommonParent(elements: HTMLElement[]): HTMLElement | null {
    if (elements.length <= 1) return null;
    let parent: HTMLElement | null = elements[0]
    for (let i = 1; i < elements.length; i++) {
        while (parent && !parent.contains(elements[i])) {
            parent = parent.parentElement;
        }
    }
    return parent;
}

function getItemFromItsChild(itemChild: HTMLElement, siblingChild: HTMLElement): HTMLElement {
    while (itemChild.parentElement && !itemChild.parentElement.contains(siblingChild)) {
        itemChild = itemChild.parentElement;
    }
    return itemChild;
}
function getListItemSelector(listItems: HTMLElement[]): string | null {
    if (listItems.length <= 1) return null;
    
    let listItem = getItemFromItsChild(listItems[0],listItems[1]);
    
    
}

const contentElement = create("div#filtering-extension-content");
updateAppearance();

function updateAppearance() {
    contentElement.innerHTML = "";

    const n = selectedElements.length;
    contentElement.append(
        create("p",n < 2 ? (`Click ${n == 0 ? "first" : "second"} list item`) :
            "Check if whole list is inside blue box and each item is in separate red box"),
        (n > 2 ? create("p","You may need to click any item in next row") : ""),
        (n > 1 ? create("button","Undo",{onclick: () => { selectedElements.pop(); updateAppearance(); }}) : ""),
        create("button","Cancel",{onclick: () => setAppState("no-config")})
    );
}

export default function(): AppStateBehavior {

    return {
        enter() {
            console.log("manual-select started");
            selectedElements = [];
            updateAppearance();
            document.body.appendChild(contentElement);
            document.addEventListener("pointerdown", selectItem, true);
        },
        exit() {
            contentElement.remove();
            document.removeEventListener("pointerdown", selectItem, true);
            console.log("manual-select ended");
        }
    }
}