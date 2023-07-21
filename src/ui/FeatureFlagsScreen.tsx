import React, {
    FC,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { Container } from "./components/Container";
import { FlagsList } from "./components/FlagsList";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Search } from "./components/Search";
import { TabNames, Tabs } from "./components/Tabs";
import { useFlags } from "./hooks/useFlags";
import { useSubscriptions } from "./hooks/useSubscriptions";

export const FeatureFlagsScreen: FC<{}> = () => {
    const [search, setSearch] = useState("");
    const [selectedTab, setSelectedTab] = useState<TabNames>("all");

    const {
        shownFlags,
        shownChanges,
        changes: flagsChanges,
        changeFlag,
    } = useFlags({
        search,
    });

    const {
        shownSubscriptions,
        changes: subscriptionsChanges,
        changeSubscription,
    } = useSubscriptions({ search });

    const onSave = useCallback(async () => {
        await chrome.runtime.sendMessage({
            type: "saveFeatureFlagChanges",
            value: flagsChanges,
        });
        await chrome.runtime.sendMessage({
            type: "saveSubscriptionChanges",
            value: subscriptionsChanges,
        });
        await chrome.runtime.sendMessage({ type: "reload" });
    }, [flagsChanges]);

    let content: ReactNode = null;

    switch (selectedTab) {
        case "all":
            content = (
                <FlagsList
                    featureFlags={shownFlags}
                    changes={flagsChanges}
                    onValueChange={changeFlag}
                />
            );
            break;
        case "changed":
            content = (
                <FlagsList
                    featureFlags={shownChanges}
                    changes={flagsChanges}
                    onValueChange={changeFlag}
                />
            );
            break;
        case "subscriptions":
            content = (
                <FlagsList
                    featureFlags={shownSubscriptions}
                    changes={subscriptionsChanges}
                    onValueChange={changeSubscription}
                />
            );
            break;
    }

    return (
        <Container>
            <Header style={{ borderBottom: "1px solid rgba(0,0,0,0.05);" }}>
                <Search initialValue={search} onChange={setSearch} />
                <Tabs
                    allCount={Object.keys(shownFlags).length}
                    changedCount={Object.keys(shownChanges).length}
                    subscriptionsCount={Object.keys(shownSubscriptions).length}
                    selectedTab={selectedTab}
                    onChange={setSelectedTab}
                />
            </Header>
            {content}
            <Footer onClear={onClear} isCanSave={true} onSave={onSave} />
        </Container>
    );
};

const onClear = async () => {
    await chrome.storage.local.clear();
    await chrome.runtime.sendMessage({ type: "reload" });
};
