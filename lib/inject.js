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

const getBreakPointPosition = () => {
    const script = [...document.scripts].find((s) => s.innerText.indexOf('window.__INITIAL_STATE__=') > -1)?.innerText;
    if (script) {
        const html = document.documentElement.outerHTML;
        const startPoisition = document.documentElement.outerHTML.indexOf(script);
        const endPosition = startPoisition + script.length;
        const substr = html.substring(0, endPosition);
        const lineNumber = (substr.match(/\n/g) || []).length;
        const lastLineStarts = substr.lastIndexOf('\n');
        const columnNumber = endPosition - lastLineStarts;
        return {
            line: lineNumber,
            column: columnNumber,
        };
    }
    return;
};
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
const createSwitch = (onClick) => {
    const featuresSwitchContainer = document.createElement('div');
    featuresSwitchContainer.classList.add('featuresSwitchContainer');
    const featureSwitchTrack = document.createElement('div');
    featureSwitchTrack.classList.add('featureSwitchTrack');
    const featureSwitchButton = document.createElement('div');
    featureSwitchButton.classList.add('featureSwitchButton');
    const featureSwitchCheckbox = document.createElement('input');
    featureSwitchCheckbox.setAttribute('type', 'checkbox');
    featureSwitchCheckbox.classList.add('featureSwitchCheckbox');
    featureSwitchCheckbox.onclick = onClick;
    featuresSwitchContainer.appendChild(featureSwitchTrack);
    featuresSwitchContainer.appendChild(featureSwitchButton);
    featuresSwitchContainer.appendChild(featureSwitchCheckbox);
    return featuresSwitchContainer;
};
const onMenuAdded = async (userButton) => {
    const container = userButton?.parentElement?.parentElement;
    if (container) {
        // Secret Features text
        const label = document.createElement('div');
        label.classList.add('featuresLabel');
        label.innerText = 'Secret Features';
        label.onclick = showModal;
        // Switch
        const switchEl = createSwitch(async () => {
            const container = document.querySelector('div.featuresBtnContainer');
            if (container) {
                const isEnableFeaturesState = await chrome.storage.local.get('isEnableFeatures');
                const isEnableFeatures = isEnableFeaturesState.isEnableFeatures ?? false;
                if (isEnableFeatures) {
                    container.classList.add('disabled');
                }
                else {
                    container.classList.remove('disabled');
                    const { featureFlagChanges } = await chrome.storage.local.get('featureFlagChanges');
                    if (!featureFlagChanges || Object.keys(featureFlagChanges).length === 0) {
                        await chrome.storage.local.set({ isShowFeatures: true });
                    }
                }
                await chrome.runtime.sendMessage({ type: 'isEnableFeatures', value: !isEnableFeatures });
            }
        });
        // Menu element container
        const btnContainer = document.createElement('div');
        btnContainer.classList.add('featuresBtnContainer');
        btnContainer.appendChild(label);
        btnContainer.appendChild(switchEl);
        const isEnableFeaturesState = await chrome.storage.local.get('isEnableFeatures');
        const isEnableFeatures = isEnableFeaturesState.isEnableFeatures ?? false;
        if (!isEnableFeatures) {
            btnContainer.classList.add('disabled');
        }
        container.prepend(btnContainer);
        const { isShowFeatures } = await chrome.storage.local.get('isShowFeatures');
        console.log('>>> isShowFeatures', isShowFeatures);
        if (isShowFeatures) {
            await chrome.storage.local.set({ 'isShowFeatures': false });
            showModal();
        }
    }
};
// waiting for left menu to appear
const toolbarObserver = createObserver("div[data-testid=\"SideNav_AccountSwitcher_Button\"]", onMenuAdded, () => { });
const reactRoot = document.querySelector("#react-root");
toolbarObserver.observe(reactRoot, { subtree: true, childList: true });

/******/ })()
;