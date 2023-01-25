/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/inject/dom/createObserver.ts
const createObserver = (selector, onInputAdded, onInputRemoved) => {
    return new MutationObserver((mutations_list) => {
        mutations_list.forEach((mutation) => {
            const addedNodes = mutation.addedNodes; // wrong typings
            addedNodes.forEach((added_node) => {
                if (added_node.querySelector) {
                    const inputEl = added_node.querySelector(selector);
                    if (!!inputEl) {
                        onInputAdded(inputEl);
                    }
                    ;
                }
            });
            const removedNodes = mutation.removedNodes;
            removedNodes.forEach((removed_node) => {
                if (removed_node.querySelector) {
                    const inputEl = removed_node.querySelector(selector);
                    if (!!inputEl) {
                        onInputRemoved(inputEl);
                    }
                    ;
                }
            });
        });
    });
};

;// CONCATENATED MODULE: ./src/inject/inject.ts

const showModal = () => {
    const background = document.createElement('div');
    background.classList.add('modalBackground');
    background.onclick = closeModal;
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', chrome.runtime.getURL("assets/ui.html"));
    iframe.classList.add('modalIFrame');
    background.appendChild(iframe);
    document.body.appendChild(background);
};
const closeModal = () => {
    const background = document.querySelector('div.modalBackground');
    background?.remove();
};
const onMenuAdded = async (container) => {
    if (container) {
        // icon
        const img = document.createElement('img');
        img.src = chrome.runtime.getURL("assets/tab_icon.svg");
        img.classList.add('featuresIcon');
        // text
        const label = document.createElement('div');
        label.classList.add('featuresLabel');
        label.append(img);
        label.append('Features');
        // Menu element container
        const btnContainer = document.createElement('div');
        btnContainer.classList.add('featuresBtnContainer');
        label.onclick = showModal;
        btnContainer.append(label);
        container.insertBefore(btnContainer, container.lastChild);
    }
};
localStorage.setItem('stf_extension_id', chrome.runtime.id);
chrome.storage.local.onChanged.addListener((changes) => {
    if (changes['featureFlagChanges']) {
        localStorage.setItem('stf_changes', JSON.stringify(changes['featureFlagChanges'].newValue));
    }
});
window.onload = () => {
    // waiting for left menu to appear
    const toolbarObserver = createObserver("nav[role=\"navigation\"][aria-label=\"Primary\"]", onMenuAdded, () => { });
    const reactRoot = document.querySelector("#react-root");
    toolbarObserver.observe(reactRoot, { subtree: true, childList: true });
};

/******/ })()
;