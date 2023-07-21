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

export const FeatureFlagsScreen: FC<{}> = () => {
    const [search, setSearch] = useState("");
    const [selectedTab, setSelectedTab] = useState<TabNames>("all");

    const { shownFlags, shownChanges, changes, changeFlag } = useFlags({
        search,
    });

    const onSave = useCallback(async () => {
        await chrome.runtime.sendMessage({
            type: "saveFeatureFlagChanges",
            value: changes,
        });
    }, [changes]);

    let content: ReactNode = null;

    switch (selectedTab) {
        case "all":
            content = (
                <FlagsList
                    featureFlags={shownFlags}
                    changes={changes}
                    onValueChange={changeFlag}
                />
            );
            break;
        case "changed":
            content = (
                <FlagsList
                    featureFlags={shownChanges}
                    changes={changes}
                    onValueChange={changeFlag}
                />
            );
            break;
        case "subscriptions":
            content = <div>Subscriptions</div>;
            break;
    }

    return (
        <Container>
            <Header style={{ borderBottom: "1px solid rgba(0,0,0,0.05);" }}>
                <Search initialValue={search} onChange={setSearch} />
                <Tabs
                    allCount={Object.keys(shownFlags).length}
                    changedCount={Object.keys(shownChanges).length}
                    subscriptionsCount={Object.keys({}).length}
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
