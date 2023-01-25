import { createObserver } from "./dom/createObserver";

const showModal = () => {
    const background = document.createElement('div');
    background.classList.add('modalBackground');
    background.onclick = closeModal;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', chrome.runtime.getURL("assets/ui.html"));
    iframe.classList.add('modalIFrame'); 

    background.appendChild(iframe);
    document.body.appendChild(background);
}

const closeModal = () => {
    const background = document.querySelector('div.modalBackground');
    background?.remove();
}

const onMenuAdded = async (container: Element) => {
    if (container) {
        // icon
        const img = document.createElement('img');
        const prefersDarkMode = window.matchMedia("(prefers-color-scheme:dark)").matches;
        img.src = prefersDarkMode ? 
              chrome.runtime.getURL("assets/tab_icon_dark_theme.svg")
            : chrome.runtime.getURL("assets/tab_icon.svg");
        img.classList.add('featuresIcon');

        // text
        const label = document.createElement('div');
        label.classList.add('featuresLabel');
        label.append(img);

        const text = document.createElement('span');
        text.innerText = 'Features';
        label.append(text);

        // Menu element container
        const btnContainer = document.createElement('div');
        btnContainer.classList.add('featuresBtnContainer');
        label.onclick = showModal;

        btnContainer.append(label);
        container.insertBefore(btnContainer, container.lastChild);
    }
}

localStorage.setItem('stf_extension_id', chrome.runtime.id);

chrome.storage.local.onChanged.addListener((changes) => {
    if (changes['featureFlagChanges']) {
        localStorage.setItem('stf_changes', JSON.stringify(changes['featureFlagChanges'].newValue));
    }
});

window.onload = () => {
    // waiting for left menu to appear
    const toolbarObserver = createObserver("nav[role=\"navigation\"][aria-label=\"Primary\"]", onMenuAdded, () => {});
    const reactRoot = document.querySelector("#react-root") as unknown as Node;
    toolbarObserver.observe(reactRoot, { subtree: true, childList: true });
}