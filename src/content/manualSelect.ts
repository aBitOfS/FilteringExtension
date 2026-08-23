import { AppStateBehavior } from "./content";
import { create } from "../utils/createElementShortcuts";
import { findCommonParent, getQuerySelectorAll } from "../utils/utils";
import { setSiteSettings } from "../utils/browser_utils";

let selectedElements: HTMLElement[] = []
let selector = "";
let idSelector = "";

const [addClassWithUndo, undoClassAdd] = (() => {
    let toUndo: [Element,string][] = [];
    return [(element: Element | null, className: string) => {
        if (!element) return;
        element.classList.add(className);
        toUndo.push([element,className]);
    }, () => {
        toUndo.forEach((value) => value[0].classList.remove(value[1]));
        toUndo = [];
    }]
})()

function selectItem(event: MouseEvent) {
    if (contentElement.contains(event.target as HTMLElement)) return;
    
    event.stopImmediatePropagation();
    event.preventDefault();
    event.stopPropagation();

    selectedElements.push(event.target as HTMLElement);
    selectedElementsChanged();
}
async function selectedElementsChanged() {
    undoClassAdd();

    updateAppearance();
    if (selectedElements.length < 2) return;

    let listItems = selectedElements.map((v,i) => {
        return getItemFromItsChild(v,selectedElements[(i+1)%selectedElements.length]);
    })
    selector = await getQuerySelectorAll(listItems);
    console.log(selector)

    // Add Handle different selectors (like recommended products)

    console.log(selectedElements);
    idSelector = await getQuerySelectorAll(selectedElements,listItems[0]);
    console.log(idSelector)
    document.querySelectorAll(selector).forEach((el) => {
        addClassWithUndo(el,"fil-ext-m-item");
        addClassWithUndo(el.querySelector(idSelector),"fil-ext-m-id");
    });
    addClassWithUndo(findCommonParent(selectedElements),"fil-ext-m-parent");
}

function getItemFromItsChild(itemChild: HTMLElement, siblingChild: HTMLElement): HTMLElement {
    // let c = 0
    // console.log(itemChild);
    while (itemChild != document.body && itemChild.parentElement && !itemChild.parentElement.contains(siblingChild)) {
        // console.log(itemChild, itemChild.parentElement, c);
        itemChild = itemChild.parentElement;
        // c++;
        // if (c > 100) throw new Error("Infinite look in getItemFromItsChild");
    }
    return itemChild;
}

function getQuerySelector(listItem: HTMLElement | null, relativeTo: HTMLElement = document.body): string | null {
    let selector = "";
    
    // let c = 0
    while (listItem && listItem != relativeTo) {
        if (listItem.id) {
            selector = `#${listItem.id} > ${selector}`;
            break;
        }
        selector = ` > ${selector}`;
        // listItem.classList.forEach((value: string) => {
        //     selector = `.${value}${selector}`;
        // })
        selector = `${listItem.nodeName.toLowerCase()}${selector}`;
        listItem = listItem.parentElement;
        // console.log(selector);
        // c++;
        // if (c > 1000) throw new Error("Infinite look in getQuerySelector");
    }
    if (listItem == document.body) selector = `body > ${selector}`;
    return selector.slice(0,-3);
}

const contentElement = create("div#filtering-extension-content");
updateAppearance();


function Undo() {
    selectedElements.pop();
    selectedElementsChanged();
}
function Done() {
    if (selectedElements.length <= 1) throw new Error("Need to select at least 2 items");
    
    console.log(selector);
    if (!selector) { alert("Error getting list selector"); throw new Error("List item selector is null")}

    setSiteSettings({ state: "working", itemSelector: selector, idSelector: idSelector});
}
function Cancel() { setSiteSettings({ state: "idle" }) }
function updateAppearance() {
    contentElement.innerHTML = "";
    
    const n = selectedElements.length;

    contentElement.append(
        create("p",n < 2 ? (`Click ${n == 0 ? "first" : "second"} list item's unique id`) :
            "Check if whole list is inside blue box and each item is in separate red box"),
        (n >= 2 ? create("p","You may need to click any item in next row") : ""),
        (n >= 1 ? create("button","Undo",{onclick: Undo}) : ""),
        (n > 1 ? create("button","Done",{onclick: Done}) : ""),
        create("button","Cancel",{onclick: Cancel })
    );
}

export function manualSelect(): AppStateBehavior {

    return {
        enter() {
            console.log("manual-select started");
            selectedElements = [];
            updateAppearance();
            document.body.appendChild(contentElement);
            document.addEventListener("click", selectItem, true);
        },
        exit() {
            contentElement.remove();
            document.removeEventListener("click", selectItem, true);
            console.log("manual-select ended");
            undoClassAdd();
        }
    }
}
