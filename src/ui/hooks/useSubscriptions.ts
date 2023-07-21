import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
    search: string;
};

type Return = {
    shownSubscriptions: Record<string, any>;
    changes: Record<string, any>;
    changeSubscription: (name: string, value: any) => void;
};

export const useSubscriptions = ({ search }: Props): Return => {
    const [subscriptions, setSubscriptions] = useState<Record<string, any>>({});
    const [changes, setChanges] = useState<Record<string, any>>({});

    useEffect(() => {
        chrome.storage.local.get("subscriptions").then((res) => {
            if (res.subscriptions) {
                setSubscriptions(res.subscriptions);
            }
        });

        chrome.storage.local.get("subscriptionsChanges").then((res) => {
            if (res.subscriptionChanges) {
                setChanges(res.subscriptionChanges);
            }
        });

        const listener = (
            changes: Record<string, chrome.storage.StorageChange>
        ) => {
            if (changes["subscriptions"]) {
                setSubscriptions(changes["featureFlags"].newValue || {});
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
            Object.keys(subscriptions).reduce((acc, sname) => {
                const isSatisfySearch = !search || sname.indexOf(search) > -1;

                if (isSatisfySearch) {
                    return { ...acc, [sname]: subscriptions[sname] };
                } else {
                    return acc;
                }
            }, {}),
        [search, subscriptions]
    );

    const onValueChange = useCallback(
        async (name: string, newValue: any) => {
            let newSubscriptionsChanges: Record<string, any> = {};

            if (subscriptions[name]?.value === newValue) {
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
        [subscriptions, changes]
    );

    return {
        shownSubscriptions,
        changes,
        changeSubscription: onValueChange,
    };
};
