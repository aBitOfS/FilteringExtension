import { AppStateBehavior } from "./content";
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
        create("button","Disable extension", () => setSiteSettings({ state: "idle"}))
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
    itemsListElement.innerHTML = "";

    items.forEach((el) => {
        if (blacklistedIds.includes(el.id)) return;
        
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
function showOnly(whitelisted: string[]) {
    showFiltered((item) => whitelisted.includes(item.id));
}


type ItemType = { id: string, originalData: { innerHTML: string}, addedData?: object };
let originalItems: HTMLElement[];
let items: ItemType[] = [];

let favourites: string[] = [];
let ignored: string[] = [];

export function workingState(): AppStateBehavior {
    return { enter: async () => {
        let config = await getSiteSettings();
        if (config.state != "working" || ! config.itemSelector || ! config.idSelector) { setSiteSettings({ state: "idle" }); return }

        originalItems = Array.from(document.querySelectorAll(config.itemSelector)); 
        originalItems.forEach((el) => {
            let id = el.querySelector(config.idSelector) as HTMLElement;
            if (!id) {console.error("id not found"); return;}

            items.push({id: id.innerText, originalData: { innerHTML: el.innerHTML }});
        });
        
        let parent = findCommonParent(originalItems);
        console.log(parent);
        if (!parent) throw new Error("No parent element found");

        parent.parentElement?.insertBefore(contentElement,parent);
        parent.style.display = "none";

        showWithout(ignored);
    }, exit: () => {
        (contentElement.nextSibling! as HTMLElement).style.display = "block";
        contentElement.remove();
    }};
}