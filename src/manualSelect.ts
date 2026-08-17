import { AppStateBehavior } from "./content";

let _selectedElement: HTMLElement | null = null;
const getSelectedElement = () => _selectedElement;
function setSelectedElement(value: HTMLElement | null) {
    if (_selectedElement == value) return
    if (_selectedElement) {
        _selectedElement.classList.remove("filtering-extension-selected");
    }

    _selectedElement = value;
    if (_selectedElement) {
        _selectedElement.classList.add("filtering-extension-selected");
    }
}

const contentElement = createControlsElement();

function createControlsElement() {
    const contentElement = document.createElement("div");
    contentElement.id = "filtering-extension-content";

    const parentButton = document.createElement("button");
    parentButton.innerText = "UP";
    parentButton.addEventListener("click",selectParent);

    const firstChildButton = document.createElement("button");
    firstChildButton.innerText = "1ST CHILD";
    firstChildButton.addEventListener("click",select1stChild);

    contentElement.append(parentButton, firstChildButton)

    return contentElement;

}
function onMove(ev: MouseEvent) {
    if (ev.shiftKey) return;
    if (contentElement.contains(ev.target as HTMLElement)) return;
    setSelectedElement((ev.target as HTMLElement)?.parentElement);
}
function selectParent() {
    setSelectedElement(getSelectedElement()?.parentElement ?? null);
}
function select1stChild() {
    setSelectedElement(getSelectedElement()?.firstChild as HTMLElement);
}

export default function(): AppStateBehavior {

    return {
        enter() {
            console.log("manual-select started");
            document.body.appendChild(contentElement);
            document.addEventListener("mousemove", onMove);
        },
        exit() {
            contentElement.remove();
            document.removeEventListener("mousemove", onMove);
            setSelectedElement(null);
            console.log("manual-select ended");
        }
    }
}