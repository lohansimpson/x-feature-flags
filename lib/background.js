/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

chrome.scripting.registerContentScripts([
    {
        id: `isolated_context_inject_${Math.random()}`,
        matches: ["https://twitter.com/*"],
        css: ["css/inject.css"],
        js: ["lib/inject.js"],
        runAt: "document_start",
    },
    {
        id: `main_context_inject_${Math.random()}`,
        world: "MAIN",
        matches: ["https://twitter.com/*"],
        js: ["lib/inject_main.js"],
        runAt: "document_start",
    },
]);
// listening for messages
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log('>>>', request.type);
    switch (request.type) {
        case 'saveFeatureFlagChanges':
            await chrome.storage.local.set({ featureFlagChanges: request.value });
            setTimeout(async () => {
                await chrome.tabs.reload();
            }, 200);
            break;
        case 'getFlagsFromRemote':
            try {
                const json = await (await fetch('https://twitter-feature-flags.web.app/flags.json', { cache: 'no-store' })).json();
                await chrome.storage.local.set({ featureFlagsFromRemote: json });
            }
            catch (e) {
                console.error(e);
            }
            break;
        case 'reload':
            await chrome.tabs.reload();
            break;
    }
    return true;
});
chrome.runtime.onMessageExternal.addListener(async (request, sender, sendResponse) => {
    switch (request.type) {
        case 'initialState':
            console.log('>>> setting initial state');
            await chrome.storage.local.set({ featureFlags: request.value.featureSwitch.user.config });
            break;
    }
    return true;
});

/******/ })()
;