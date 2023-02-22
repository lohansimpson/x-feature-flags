import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Container } from "./components/Container";
import { FlagsList } from "./components/FlagsList";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Search } from "./components/Search";
import { TabNames, Tabs } from "./components/Tabs";

export const FeatureFlagsScreen: FC<{}> = () => {
    const [search, setSearch] = useState('');
    const [selectedTab, setSelectedTab] = useState<TabNames>('all');

    const [featureFlags, setFeatureFlags] = useState<Record<string, any>>({});
    const [featureFlagsFromRemote, setFeatureFlagsFromRemote] = useState<Record<string, any>>({});

    const [changes, setChanges] = useState<Record<string, any>>({});

    useEffect(() => {
        chrome.storage.local.get('featureFlags').then((res) => {
            if (res.featureFlags) {
                setFeatureFlags(res.featureFlags);
            };
        });

        chrome.storage.local.get('featureFlagsFromRemote').then((res) => {
            if (res.featureFlagsFromRemote) {
                setFeatureFlagsFromRemote(res.featureFlagsFromRemote);
            };
        });

        chrome.storage.local.get('featureFlagChanges').then((res) => {
            if (res.featureFlagChanges) {
                setChanges(res.featureFlagChanges);
            };
        });

        const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
            if (changes['featureFlags']) {
                setFeatureFlags(changes['featureFlags'].newValue || {});
            }
            if (changes['featureFlagsFromRemote']) {
                setFeatureFlagsFromRemote(changes['featureFlagsFromRemote'].newValue || {});
            }
            if (changes['featureFlagChanges']) {
                setChanges(changes['featureFlagChanges'].newValue || {});
            }
        };

        chrome.storage.local.onChanged.addListener(listener);

        chrome.runtime.sendMessage({type: 'getFlagsFromRemote'});

        return () => chrome.storage.local.onChanged.removeListener(listener);
    }, []);

    const flags = useMemo(() => ({...featureFlagsFromRemote, ...featureFlags}), [featureFlags, featureFlagsFromRemote])

    const onValueChange = useCallback(async (name: string, newValue: any) => {
        let newFeatureFlagChanges: Record<string, any> = {};
        
        if (flags[name]?.value === newValue) {
            newFeatureFlagChanges = {...changes};
            delete newFeatureFlagChanges[name];
        } else {
            newFeatureFlagChanges = {
                ...changes,
                [name]: { value: newValue },
            }
        }

        setChanges(newFeatureFlagChanges);
    }, [flags, changes]);

    const onSave = useCallback(async () => {
        await chrome.runtime.sendMessage({type: 'saveFeatureFlagChanges', value: changes});
    }, [changes]);

    const shownAllFeatureFlags = useMemo(() => Object.keys(flags).reduce((acc, ffname) => {
        const isSatisfySearch = !search || ffname.indexOf(search) > -1;

        if (isSatisfySearch) {
            return {...acc, [ffname]: flags[ffname]}
        } else {
            return acc;
        }
    }, {}), [search, selectedTab, flags, changes]);

    const shownSelectedFeatureFlags = useMemo(() => Object.keys(flags).reduce((acc, ffname) => {
        const isSatisfySearch = !search || ffname.indexOf(search) > -1;

        if (!!changes[ffname] && isSatisfySearch) {
            return {...acc, [ffname]: flags[ffname]}
        } else {
            return acc;
        }
    }, {}), [search, selectedTab, flags, changes]);


    const shownFeatureFlags = selectedTab === 'all' ? shownAllFeatureFlags : shownSelectedFeatureFlags;


    return (
        <Container>
            <Header style={{borderBottom: "1px solid rgba(0,0,0,0.05);"}}>
                <Search initialValue={search} onChange={setSearch}/>
                <Tabs
                    allCount={Object.keys(shownAllFeatureFlags).length}
                    changedCount={Object.keys(shownSelectedFeatureFlags).length}
                    selectedTab={selectedTab}
                    onChange={setSelectedTab}
                />
            </Header>
            <FlagsList
                featureFlags={shownFeatureFlags}
                changes={changes}
                onValueChange={onValueChange}
            />
            <Footer
                onClear={onClear}
                isCanSave={true}
                onSave={onSave}
            />
        </Container>
    )
}

const onClear = async () => {
    await chrome.storage.local.clear();
    await chrome.runtime.sendMessage({type: 'reload'});
}