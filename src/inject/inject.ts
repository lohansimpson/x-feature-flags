// Add type declaration at the top of the file
declare global {
    interface Window {
        __INITIAL_STATE__?: {
            featureSwitch?: {
                user?: {
                    config?: {
                        [key: string]: {
                            value: boolean;
                        };
                    };
                };
            };
        };
    }
}

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

 // Check if the feature flag is enabled for new UI
const isFeatureFlagEnabled = () => {
    try {
        const changes = localStorage.getItem("stf_changes");
        if (changes) {
            const parsedChanges = JSON.parse(changes);
            if (parsedChanges["rweb_sourcemap_migration"]?.value === true) {
                return true;
            }
        }
        
        // Check in window.__INITIAL_STATE__ if available
        if (window.__INITIAL_STATE__?.featureSwitch?.user?.config?.["rweb_sourcemap_migration"]?.value === true) {
            return true;
        }
    } catch (e) {
        console.error("Error checking feature flag:", e);
    }
    return false;
};

const onMenuAdded = async (prevElement: Element) => {

      // Inject CSS to hide button in modal
      const style = document.createElement('style');
      style.textContent = `
          [aria-modal="true"] .featuresBtnContainer {
              display: none !important;
          }
      `;
      document.head.appendChild(style);

     // Check if the button container already exists
    const alreadyExists = !!prevElement.parentElement!.querySelector(
        ".featuresBtnContainer"
    );

    if (alreadyExists) {
        return;
    }

    // Create the container that will hold the button
    const btnContainer = document.createElement("div");
    btnContainer.classList.add("featuresBtnContainer");
    btnContainer.style.cssText = "min-height: 50px; width: 100%; display: flex; align-items: center;";

    // Create the button element
    const button = document.createElement("div");
    button.role = "button";
    button.style.cssText = `
        background-color: transparent;
        outline-style: none;
        transition-property: background-color, box-shadow;
        transition-duration: 0.2s;
        cursor: pointer;
        border-radius: 9999px;
        min-height: 50px;
        width: 100%;
    `;

    // Create the inner container for content
    const innerContainer = document.createElement("div");
    innerContainer.style.cssText = `
        padding: 0 12px;
        min-height: 50px;
        display: flex;
        align-items: center;
    `;

    // Create and style the icon
    const iconContainer = document.createElement("div");
    iconContainer.style.cssText = "min-width: 26.25px; display: flex; justify-content: center;";
    const img = document.createElement("img");
    const prefersDarkMode = window.matchMedia("(prefers-color-scheme:dark)").matches;
    img.src = prefersDarkMode
        ? chrome.runtime.getURL("assets/icons/tab_icon_dark_theme.svg")
        : chrome.runtime.getURL("assets/icons/tab_icon.svg");
    img.style.cssText = `
        width: 1.5rem; 
        height: 1.5rem;
        opacity: 0.6;
        transition: opacity 0.2s;
    `;
    iconContainer.appendChild(img);

    // Create and style the text
    const text = document.createElement("span");
   
    text.style.cssText = `
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 20px;
        line-height: 24px;
        overflow-wrap: break-word;
        min-width: 0px;
        color: ${prefersDarkMode ? 'rgba(231, 233, 234, 0.6)' : 'rgba(15, 20, 25, 0.6)'};
        transition: color 0.2s;
    `;

    // Add hover effect
    button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = prefersDarkMode ? 'rgba(231, 233, 234, 0.1)' : 'rgba(15, 20, 25, 0.1)';
        img.style.opacity = '1';
        text.style.color = prefersDarkMode ? 'rgb(231, 233, 234)' : 'rgb(15, 20, 25)';
    });
    button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = 'transparent';
        img.style.opacity = '0.6';
        text.style.color = prefersDarkMode ? 'rgba(231, 233, 234, 0.6)' : 'rgba(15, 20, 25, 0.6)';
    });

    // Assemble the components
    innerContainer.appendChild(iconContainer);
    button.appendChild(innerContainer);
    btnContainer.appendChild(button);

    // Add click handler
    button.onclick = showModal;

    // Insert into the DOM
    if (isFeatureFlagEnabled()) {
        prevElement.after(btnContainer);
    } else {
        // Old placement logic for when feature flag is disabled
        const oldBtnContainer = document.createElement("div");
        oldBtnContainer.classList.add("featuresBtnContainer");
        if (prefersDarkMode) {
            oldBtnContainer.classList.add("dark");
        }
        
        const oldLabel = document.createElement("div");
        oldLabel.classList.add("featuresLabel");
        if (prefersDarkMode) {
            oldLabel.classList.add("dark");
        }
        
        const oldImg = document.createElement("img");
        oldImg.src = img.src;
        oldImg.classList.add("featuresIcon");
        
        const oldText = document.createElement("span");
        oldText.innerText = "Features";
        
        oldLabel.append(oldImg);
        oldLabel.append(oldText);
        oldLabel.onclick = showModal;
        oldBtnContainer.append(oldLabel);
        prevElement.after(oldBtnContainer);
    }
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
