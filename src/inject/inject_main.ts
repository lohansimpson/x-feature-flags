const CHANGES_KEY = "stf_changes";
const SUBSCRIPTIONS_KEY = "stf_subscriptions";
const EXTENSIONID_KEY = "stf_extension_id";

type ClaimsResource = { rest_id: string };
type SubscriptionMap = Record<string, { value: boolean }>;

let __INITIAL_STATE_COPY__: any = {};
Object.defineProperty(window, "__INITIAL_STATE__", {
    get: () => __INITIAL_STATE_COPY__,
    set: (newVal) => {
        const extensionId = localStorage.getItem(EXTENSIONID_KEY)!;
        
        // Only proceed if we have the required properties
        if (newVal?.featureSwitch?.user?.config) {
            chrome.runtime.sendMessage(extensionId, {
                type: "initialState",
                value: newVal,
            });

            const changesString = localStorage.getItem(CHANGES_KEY);
            let changes = {};
            if (changesString) {
                try {
                    changes = JSON.parse(changesString);
                } catch (e) {
                    console.error("Corrupted changes state, cleaning...");
                    localStorage.removeItem(CHANGES_KEY);
                }
            }

            const subString = localStorage.getItem(SUBSCRIPTIONS_KEY);
            let subscriptions: SubscriptionMap = {};
            if (subString) {
                try {
                    subscriptions = JSON.parse(subString);
                } catch (e) {
                    console.error("Corrupted subscriptions state, cleaning...");
                    localStorage.removeItem(SUBSCRIPTIONS_KEY);
                }
            }

            __INITIAL_STATE_COPY__ = newVal;
            
            // Only modify if the properties exist
            if (__INITIAL_STATE_COPY__.featureSwitch?.user?.config) {
                __INITIAL_STATE_COPY__.featureSwitch.user.config = {
                    ...__INITIAL_STATE_COPY__.featureSwitch.user.config,
                    ...changes,
                };
            }

            if (__INITIAL_STATE_COPY__.userClaim?.config) {
                __INITIAL_STATE_COPY__.userClaim.config.subscriptions =
                    __INITIAL_STATE_COPY__.userClaim.config.subscriptions ?? {};
                    for (const s of Object.keys(subscriptions)) {
                        if (subscriptions[s].value === false) {
                            delete __INITIAL_STATE_COPY__.userClaim.config.subscriptions[s];
                        } else {
                            __INITIAL_STATE_COPY__.userClaim.config.subscriptions[s] = {
                                value: "true",
                            };
                    }
                }
            }
        } else {
            __INITIAL_STATE_COPY__ = newVal;
        }
    },
    configurable: true,
});

// Function to edit network responses
const intercept_response = function (
    urlpattern: RegExp,
    callback: (text: string) => string
) {
    const open_prototype = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function () {
        const isMatchingPattern = arguments["1"].match(urlpattern);

        if (isMatchingPattern) {
            this.addEventListener("readystatechange", (event: any) => {
                if (this.readyState === 4) {
                    var response = callback(event.target.responseText);
                    Object.defineProperty(this, "response", { writable: true });
                    Object.defineProperty(this, "responseText", {
                        writable: true,
                    });
                    (this.responseText as any) = response;
                    if (this.responseType === "json") {
                        (this.response as any) = JSON.parse(this.responseText);
                    } else {
                        (this.response as any) = this.responseText;
                    }
                }
            });
        }
        return open_prototype.apply(this, arguments as any);
    };
};

// Modifying network responses

const subscriptionString = localStorage.getItem(SUBSCRIPTIONS_KEY);
let subscriptions: SubscriptionMap = {};
if (subscriptionString) {
    try {
        subscriptions = JSON.parse(subscriptionString);

        // intercepting subscription request
        intercept_response(/GetUserClaims/g, (text: string) => {
            const json = JSON.parse(text);

            if (json["data"]["viewer_v2"]["claims"].length === 0) {
                json["data"]["viewer_v2"]["claims"].push({
                    resources: [],
                });
            }

            let resources = json["data"]["viewer_v2"]["claims"][0][
                "resources"
            ] as ClaimsResource[];

            // removing all overwriting items and then adding ones that are turned on
            // can be optimised, but this is easy to understand
            for (const s of Object.keys(subscriptions)) {
                if (subscriptions[s]) {
                    resources = resources.filter(
                        (r) => r["rest_id"] !== "feature/" + s
                    );
                }
            }

            for (const s of Object.keys(subscriptions)) {
                if (subscriptions[s].value === true) {
                    resources.push({ rest_id: "feature/" + s });
                }
            }

            json["data"]["viewer_v2"]["claims"][0]["resources"] = resources;
            const responseText = JSON.stringify(json, null, 2);

            return responseText;
        });

        // removing "application pending" shenaningans
        intercept_response(/useVerifiedOrgFeaturesQuery/g, (text: string) => {
            const json = JSON.parse(text);
            json["data"]["viewer"]["user_results"]["result"][
                "verified_organization_features"
            ] = ["BusinessAdminPortalAccess", "upfrontPaymentAccess"];

            const responseText = JSON.stringify(json, null, 2);

            return responseText;
        });
    } catch (e) {
        console.error("Corrupted subscriptions state, cleaning...");
        localStorage.removeItem(SUBSCRIPTIONS_KEY);
    }
}

