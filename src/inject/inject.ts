import { createObserver } from "./dom/createObserver";

const showModal = () => {
    const background = document.createElement("div");
    background.classList.add("modalBackground");
    background.onclick = closeModal;

    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", chrome.runtime.getURL("assets/ui.html"));
    iframe.classList.add("modalIFrame");

    background.appendChild(iframe);
    document.body.appendChild(background);
};

const closeModal = () => {
    const background = document.querySelector("div.modalBackground");
    background?.remove();
};

const onMenuAdded = async (prevElement: Element) => {
    const alreadyExists = !!prevElement.parentElement!.querySelector(
        ".featuresBtnContainer"
    );

    if (alreadyExists) {
        return;
    }

    // icon
    const img = document.createElement("img");
    const prefersDarkMode = window.matchMedia(
        "(prefers-color-scheme:dark)"
    ).matches;
    img.src = prefersDarkMode
        ? chrome.runtime.getURL("assets/icons/tab_icon_dark_theme.svg")
        : chrome.runtime.getURL("assets/icons/tab_icon.svg");
    img.classList.add("featuresIcon");

    // text
    const label = document.createElement("div");
    label.classList.add("featuresLabel");
    if (prefersDarkMode) {
        label.classList.add("dark");
    }
    label.append(img);

    const text = document.createElement("span");
    text.innerText = "Features";
    label.append(text);

    // Menu element container
    const btnContainer = document.createElement("div");
    btnContainer.classList.add("featuresBtnContainer");
    label.onclick = showModal;

    btnContainer.append(label);
    prevElement.after(btnContainer);
};

localStorage.setItem("stf_extension_id", chrome.runtime.id);

chrome.storage.local.onChanged.addListener((changes) => {
    if (changes["featureFlagChanges"]) {
        if (!changes["featureFlagChanges"].newValue) {
            localStorage.removeItem("stf_changes");
        } else {
            localStorage.setItem(
                "stf_changes",
                JSON.stringify(changes["featureFlagChanges"].newValue)
            );
        }
    }
    if (changes["subscriptionsChanges"]) {
        if (!changes["subscriptionsChanges"].newValue) {
            localStorage.removeItem("stf_subscriptions");
        } else {
            localStorage.setItem(
                "stf_subscriptions",
                JSON.stringify(changes["subscriptionsChanges"].newValue)
            );
        }
    }
});

const menuSelector = 'a[data-testid="AppTabBar_Profile_Link"]';

window.onload = () => {
    // waiting for left menu to appear
    const toolbarObserver = createObserver(menuSelector, onMenuAdded, () => {});
    toolbarObserver.observe(document, { subtree: true, childList: true });

    const currentContainer = document.querySelector(menuSelector);
    if (currentContainer) {
        onMenuAdded(currentContainer);
    }
};
