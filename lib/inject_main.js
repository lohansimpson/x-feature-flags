/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

const CHANGES_KEY = 'stf_changes';
const SUBSCRIPTIONS_KEY = 'stf_subscriptions';
const EXTENSIONID_KEY = 'stf_extension_id';
let __INITIAL_STATE_COPY__ = {};
Object.defineProperty(window, '__INITIAL_STATE__', {
    get: () => __INITIAL_STATE_COPY__,
    set: (newVal) => {
        const extensionId = localStorage.getItem(EXTENSIONID_KEY);
        chrome.runtime.sendMessage(extensionId, { type: 'initialState', value: newVal });
        const changesString = localStorage.getItem(CHANGES_KEY);
        const subscriptionString = localStorage.getItem(SUBSCRIPTIONS_KEY);
        // console.log('>>> changesString', changesString);
        // console.log('>>> subscriptionString', subscriptionString);
        // console.log('>>> newVal', newVal);
        let changes = {};
        if (changesString) {
            try {
                changes = JSON.parse(changesString);
            }
            catch (e) {
                console.error('Corrupted changes state, cleaning...');
                localStorage.removeItem(CHANGES_KEY);
            }
        }
        let subscriptions = {};
        if (subscriptionString) {
            try {
                subscriptions = JSON.parse(subscriptionString);
            }
            catch (e) {
                console.error('Corrupted subscriptions state, cleaning...');
                localStorage.removeItem(SUBSCRIPTIONS_KEY);
            }
        }
        __INITIAL_STATE_COPY__ = newVal;
        // Uncomment to enable debug menu
        // __INITIAL_STATE_COPY__.featureSwitch.debug = { tweet_awards_web_coin_purchase_enabled: {
        //     type: "boolean",
        //     description: "Experiment",
        //     enumeration_values: [true, false],
        //     owner: "Elon",
        // }};
        __INITIAL_STATE_COPY__.featureSwitch.user.config = {
            ...__INITIAL_STATE_COPY__.featureSwitch.user.config,
            ...changes
        };
        __INITIAL_STATE_COPY__.userClaim.config.subscriptions = {
            ...__INITIAL_STATE_COPY__.userClaim.config.subscriptions,
            ...subscriptions
        };
    },
    configurable: true,
});

/******/ })()
;