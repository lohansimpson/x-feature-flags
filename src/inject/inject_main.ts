const CHANGES_KEY = "stf_changes";
const SUBSCRIPTIONS_KEY = "stf_subscriptions";
const EXTENSIONID_KEY = "stf_extension_id";

let __INITIAL_STATE_COPY__: any = {};
Object.defineProperty(window, "__INITIAL_STATE__", {
    get: () => __INITIAL_STATE_COPY__,
    set: (newVal) => {
        const extensionId = localStorage.getItem(EXTENSIONID_KEY)!;
        chrome.runtime.sendMessage(extensionId, {
            type: "initialState",
            value: newVal,
        });

        const changesString = localStorage.getItem(CHANGES_KEY);
        const subscriptionString = localStorage.getItem(SUBSCRIPTIONS_KEY);

        let changes = {};
        if (changesString) {
            try {
                changes = JSON.parse(changesString);
            } catch (e) {
                console.error("Corrupted changes state, cleaning...");
                localStorage.removeItem(CHANGES_KEY);
            }
        }

        let subscriptions = {};
        if (subscriptionString) {
            try {
                subscriptions = JSON.parse(subscriptionString);
            } catch (e) {
                console.error("Corrupted subscriptions state, cleaning...");
                localStorage.removeItem(SUBSCRIPTIONS_KEY);
            }
        }

        __INITIAL_STATE_COPY__ = newVal;
        __INITIAL_STATE_COPY__.featureSwitch.user.config = {
            ...__INITIAL_STATE_COPY__.featureSwitch.user.config,
            ...changes,
        };

        // const rawSubscriptions = {
        //     ...__INITIAL_STATE_COPY__.userClaim.config.subscriptions,
        //     ...subscriptions,
        // };

        // __INITIAL_STATE_COPY__.userClaim.config.subscriptions = {};
        // for (const sub of Object.keys(rawSubscriptions)) {
        //     if (rawSubscriptions[sub].value === true) {
        //         __INITIAL_STATE_COPY__.userClaim.config.subscriptions[sub] =
        //             rawSubscriptions[sub];
        //     }
        // }
    },
    configurable: true,
});
