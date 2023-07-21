import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
    search: string;
};

type Return = {
    shownSubscriptions: Record<string, any>;
    changes: Record<string, any>;
    changeSubscription: (name: string, value: any) => void;
};

export type SubscriptionMap = Record<string, boolean>;

export const useSubscriptions = ({ search }: Props): Return => {
    const [subscriptions, setSubscriptions] = useState<SubscriptionMap>({});
    const [subscriptionsFromRemote, setSubscriptionsFromRemote] = useState<
        Record<string, boolean>
    >({});

    const allSubscriptions = {
        ...subscriptionsFromRemote,
        ...subscriptions,
    };

    const [changes, setChanges] = useState<Record<string, any>>({});

    useEffect(() => {
        chrome.storage.local.get("subscriptions").then((res) => {
            if (res.subscriptions) {
                setSubscriptions(res.subscriptions);
            }
        });

        chrome.storage.local.get("subscriptionsFromRemote").then((res) => {
            if (res.subscriptionsFromRemote) {
                setSubscriptionsFromRemote(res.subscriptionsFromRemote);
            }
        });

        chrome.storage.local.get("subscriptionsChanges").then((res) => {
            if (res.subscriptionsChanges) {
                setChanges(res.subscriptionsChanges);
            }
        });

        const listener = (
            changes: Record<string, chrome.storage.StorageChange>
        ) => {
            if (changes["subscriptions"]) {
                setSubscriptions(changes["subscriptions"].newValue || {});
            }
            if (changes["subscriptionsFromRemote"]) {
                setSubscriptionsFromRemote(
                    changes["subscriptionsFromRemote"].newValue || {}
                );
            }
            if (changes["subscriptionsChanges"]) {
                setChanges(changes["subscriptionsChanges"].newValue || {});
            }
        };

        chrome.storage.local.onChanged.addListener(listener);

        chrome.runtime.sendMessage({ type: "getSubscriptionsFromRemote" });

        return () => chrome.storage.local.onChanged.removeListener(listener);
    }, []);

    const shownSubscriptions = useMemo(
        () =>
            Object.keys(allSubscriptions).reduce((acc, sname) => {
                const isSatisfySearch = !search || sname.indexOf(search) > -1;

                if (isSatisfySearch) {
                    return {
                        ...acc,
                        [sname]: { value: allSubscriptions[sname] },
                    };
                } else {
                    return acc;
                }
            }, {}),
        [search, allSubscriptions]
    );

    const onValueChange = useCallback(
        (name: string, newValue: any) => {
            let newSubscriptionsChanges: Record<string, any> = {};

            if (allSubscriptions[name] === newValue) {
                newSubscriptionsChanges = { ...changes };
                delete newSubscriptionsChanges[name];
            } else {
                newSubscriptionsChanges = {
                    ...changes,
                    [name]: { value: newValue },
                };
            }

            setChanges(newSubscriptionsChanges);
        },
        [allSubscriptions, changes]
    );

    return {
        shownSubscriptions,
        changes,
        changeSubscription: onValueChange,
    };
};
