

chrome.scripting.registerContentScripts([
    {
        id: `isolated_context_inject_${Math.random()}`,
        matches: ["https://twitter.com/*", "https://x.com/*"],
        css: ["assets/css/inject.css"],
        js: ["lib/inject.js"],
        runAt: "document_start",
    },
    {
        id: `main_context_inject_${Math.random()}`,
        world: "MAIN",
        matches: ["https://twitter.com/*", "https://x.com/*"],
        js: ["lib/inject_main.js"],
        runAt: "document_start",
    },
]);

// listening for messages
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log(">>> request", request);
    switch (request.type) {
        case "saveFeatureFlagChanges":
            await chrome.storage.local.set({
                featureFlagChanges: request.value,
            });
            break;
        case "saveSubscriptionsChanges":
            await chrome.storage.local.set({
                subscriptionsChanges: request.value,
            });
            break;
        case "reload":
            setTimeout(async () => {
                await chrome.tabs.reload();
            }, 200);
            break;
        case "getFlagsFromRemote":
            try {
                const json = await (
                    await fetch(
                        "https://x-flags.msoftwarecorp.com/flags.json",
                        { cache: "no-store", headers: { "x-feature-flags-extension": "true" } }
                    )
                ).json();
                await chrome.storage.local.set({
                    featureFlagsFromRemote: json,
                });
            } catch (e) {
                console.error(e);
            }
            break;
        case "getSubscriptionsFromRemote":
            try {
                const json: Array<{ name: string; value: string }> = await (
                    await fetch(
                        "https://x-flags.msoftwarecorp.com/subscriptions.json",
                        { cache: "no-store",
                            headers: {
                                "x-feature-flags-extension": "true",
                            },
                        }
                    )
                ).json();

                const subFromRemoteMap = json.reduce((acc, sub) => {
                    return { ...acc, [sub.name]: sub.value === "true" };
                }, {} as Record<string, any>);

                await chrome.storage.local.set({
                    subscriptionsFromRemote: subFromRemoteMap,
                });
            } catch (e) {
                console.error(e);
            }
            break;
        case "reload":
            await chrome.tabs.reload();
            break;
    }

    return true;
});

chrome.runtime.onMessageExternal.addListener(
    async (request, sender, sendResponse) => {
        switch (request.type) {
            case "initialState":
                console.log(">>> setting initial state");

                const subscriptionsRaw =
                    request.value.userClaim.config.subscriptions;
                const subscriptionsMap = Object.keys(subscriptionsRaw).reduce(
                    (acc, key) => {
                        return {
                            ...acc,
                            [key]: subscriptionsRaw[key].value === "true",
                        };
                    },
                    {} as Record<string, boolean>
                );

                await chrome.storage.local.set({
                    featureFlags: request.value.featureSwitch.user.config,
                    subscriptions: subscriptionsMap,
                });
                break;
        }
        return true;
    }
);


import rules from './rules'; 
chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: rules.map((rule) => rule.id), addRules: rules });