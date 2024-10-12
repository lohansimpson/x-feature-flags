import { createObserver } from "./dom/createObserver";

const showModal = () => {
    const btnContainer = document.querySelector(".featuresBtnContainer");
    btnContainer?.classList.add("active");
    const background = document.createElement("div");
    
    background.classList.add("modalBackground");
    background.onclick = closeModal;

    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", chrome.runtime.getURL("assets/ui.html"));
    iframe.classList.add("modalIFrame");

    background.appendChild(iframe);
    document.body.appendChild(background);
    btnContainer?.classList.remove("active");

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
    if (prefersDarkMode) {
        btnContainer.classList.add("dark");
    }
    label.onclick = (e) => {
        e.preventDefault();
        btnContainer.classList.toggle("active");
        showModal();
    };


    btnContainer.append(label);
    prevElement.after(btnContainer);

    // Add new button


    const img_2 = document.createElement("img");

    img_2.src = prefersDarkMode
        ? chrome.runtime.getURL("assets/icons/tv_icon_dark_theme.svg")
        : chrome.runtime.getURL("assets/icons/tv_icon_light.svg");
    img_2.classList.add("TVIcon");


    const newButton = document.createElement("div");
    newButton.classList.add("newFeatureBtn");
    if (prefersDarkMode) {
        newButton.classList.add("dark");
    }
    newButton.append(img_2);

    const newButtonText = document.createElement("span");
    newButtonText.innerText = "Tv Mode";
    newButton.append(newButtonText);

    const btnContainer_2 = document.createElement("div");
    btnContainer_2.classList.add("newBtnContainer");
    if (prefersDarkMode) {
        btnContainer_2.classList.add("dark");
    }
    newButton.onclick = (e) => {
        e.preventDefault();
        // Add your new feature functionality here
        console.log("New feature button clicked");
    };

    // Insert the new button after the btnContainer
    btnContainer_2.append(newButton);
    btnContainer.after(btnContainer_2);
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
