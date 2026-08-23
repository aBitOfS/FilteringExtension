import { AppStateBehavior } from "./content";
import { create } from "../utils/createElementShortcuts";
import { findCommonParent, getConfig, setAppState } from "../utils/dev_utils";

const itemsListElement = create("div#fil-ext-list");
const contentElement = create("div#fil-ext-content",[
    create("div#fil-ext-topbar",[
        create("button","Favourites",() => showOnly(favourites)),
        create("button","Not ignored", () => showWithout(ignored)),
        create("button","All (with ignored)", () => showWithout()),
        create("button","Ignored", () => showOnly(ignored)),
        create("button","Disable extension", () => setAppState("no-config")),
        create("button","Sort alphabetically (then choose filtering to apply)", () => {
            items.sort((itemA, itemB) => (itemA.id > itemB.id ? 1 : -1));
        })
    ]),
    itemsListElement
]);

function showFiltered(filteringFunction: (item: ItemType) => boolean) {
    itemsListElement.innerHTML = "";

    items.forEach((el) => {
        if (! filteringFunction(el)) return;
        
        let element = create("div",el.originalData.innerHTML);
        element.append(
            create("div.fil-ext-item-controls",[
                create("button","Ignore", () => {
                    ignored.push(el.id);
                    element.remove();
                }),
                create("button","Favourite", () => {
                    favourites.push(el.id);
                    element.style.color = "pink";
                })
            ])
        );
        itemsListElement.append(element);
    });
}

function showWithout(blacklistedIds: string[] = []) {
    showFiltered((el) => !blacklistedIds.includes(el.id))
}
function showOnly(whitelisted: string[]) {
    showFiltered((item) => whitelisted.includes(item.id));
}

type ItemType = { id: string, originalData: { innerHTML: string}, addedData?: object };
let originalItems: HTMLElement[];
let items: ItemType[] = [];

let favourites: string[] = [];
let ignored: string[] = [];

function updateItems(itemElements: HTMLElement[], idSelector: string) {
    itemElements.forEach((el) => {
        let id = (el.querySelector(idSelector) as HTMLElement).innerText;
        if (!id) {console.error("id not found"); return;}

        let alreadyListed = false;
        items.forEach((item) => {
            if (item.id != id) return;

            alreadyListed = true;
            // vvv Hope this modifies reference, not copy vvv
            item.originalData.innerHTML = el.innerHTML;
            // Check it
        });
        if (alreadyListed) return;

        items.push({id: id, originalData: { innerHTML: el.innerHTML }});
    });
}

export function workingState(): AppStateBehavior {
    return { enter: () => {
        let config = getConfig();
        if (! config) { setAppState("no-config"); return }

        console.log(config);

        originalItems = Array.from(document.querySelectorAll(config.itemSelector)); 
        let parent = findCommonParent(originalItems);
        
        if (!parent || !parent.parentElement) throw new Error("No parent (or its parent) element found");

        updateItems(originalItems, config.idSelector);

        parent.parentElement.insertBefore(contentElement,parent);
        parent.style.display = "none";

        showWithout(ignored);
    }, exit: () => {
        if (contentElement.parentElement) {
            (contentElement.nextSibling! as HTMLElement).style.display = "block";
            contentElement.remove();
        }
    }};
}