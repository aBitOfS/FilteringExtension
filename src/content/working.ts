import { AppStateBehavior } from "../content";
import { create } from "../utils/createElementShortcuts";
import { getSiteSettings, setSiteSettings } from "../utils/browser_utils";
import { findCommonParent } from "../utils/utils";

const itemsListElement = create("div#fil-ext-list");
const contentElement = create("div#fil-ext-content",[
    create("div#fil-ext-topbar",[
        create("button","Favourites",() => showOnly(favourites)),
        create("button","Not ignored", () => showWithout(ignored)),
        create("button","All (with ignored)", () => showWithout()),
        create("button","Ignored", () => showOnly(ignored)),
        create("button","Sort alphabetically", () => {
            items.sort((itemA, itemB) => (itemA.id > itemB.id ? 1 : -1));
            showFiltered();
        }),
        create("button","Refresh (to get lazyloaded images)", () => setSiteSettings({ state: "unset"})),
        create("button","Disable extension", () => setSiteSettings({ state: "unset"}))
    ]),
    itemsListElement
]);

type ItemType = { id: string, originalData: { innerHTML: string}, addedData?: object };
let originalItems: HTMLElement[];
let items: ItemType[] = [];

let favourites: string[] = [];
let ignored: string[] = [];

let nowShown: (item: ItemType) => boolean = ((el) => !ignored.includes(el.id));
function showFiltered(filteringFunction: (item: ItemType) => boolean = nowShown) {
    nowShown = filteringFunction;
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

function updateItems(itemElements: HTMLElement[], idSelector: string) {
    itemElements.forEach((el) => {
        let id = (el.querySelector(idSelector) as HTMLElement)?.innerText;
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
    showFiltered();
}

export function workingState(): AppStateBehavior {
    return { enter: async () => {
        let config = await getSiteSettings();
        if (config.state != "working" || ! config.itemSelector || ! config.idSelector) { setSiteSettings({ state: "unset" }); return }

        originalItems = Array.from(document.querySelectorAll(config.itemSelector)); 
        let parent = findCommonParent(originalItems);

        if (!parent) throw new Error("No parent element found");

        originalItems.forEach((el) => {
            let id = el.querySelector(config.idSelector) as HTMLElement;
            if (!id) {console.error("1. id not found"); return;}

            // items.push({id: id.innerText, originalData: { innerHTML: el.innerHTML }});
        });

        updateItems(originalItems, config.idSelector);

        parent.parentElement?.insertBefore(contentElement,parent);
        parent.style.display = "none";
    }, exit: () => {
        if (contentElement.parentElement) {
            (contentElement.nextSibling! as HTMLElement).style.display = "block";
            contentElement.remove();
        }
    }};
}