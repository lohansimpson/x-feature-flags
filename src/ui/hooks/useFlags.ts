import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  search: string;
};

type Return = {
  shownFlags: Record<string, any>;
  shownChanges: Record<string, any>;
  changes: Record<string, any>;
  changeFlag: (name: string, value: any) => void;
};

export const useFlags = ({ search }: Props): Return => {
  const [featureFlags, setFeatureFlags] = useState<Record<string, any>>({});
  const [featureFlagsFromRemote, setFeatureFlagsFromRemote] = useState<
    Record<string, any>
  >({});

  const [changes, setChanges] = useState<Record<string, any>>({});

  const flags = useMemo(
    () => ({ ...featureFlagsFromRemote, ...featureFlags }),
    [featureFlags, featureFlagsFromRemote]
  );

  useEffect(() => {
    chrome.storage.local.get("featureFlags").then((res) => {
      if (res.featureFlags) {
        setFeatureFlags(res.featureFlags);
      }
    });

    chrome.storage.local.get("featureFlagsFromRemote").then((res) => {
      if (res.featureFlagsFromRemote) {
        setFeatureFlagsFromRemote(res.featureFlagsFromRemote);
      }
    });

    chrome.storage.local.get("featureFlagChanges").then((res) => {
      if (res.featureFlagChanges) {
        setChanges(res.featureFlagChanges);
      }
    });

    const listener = (
      changes: Record<string, chrome.storage.StorageChange>
    ) => {
      if (changes["featureFlags"]) {
        setFeatureFlags(changes["featureFlags"].newValue || {});
      }
      if (changes["featureFlagsFromRemote"]) {
        setFeatureFlagsFromRemote(
          changes["featureFlagsFromRemote"].newValue || {}
        );
      }
      if (changes["featureFlagChanges"]) {
        setChanges(changes["featureFlagChanges"].newValue || {});
      }
    };

    chrome.storage.local.onChanged.addListener(listener);

    chrome.runtime.sendMessage({ type: "getFlagsFromRemote" });

    return () => chrome.storage.local.onChanged.removeListener(listener);
  }, []);

  const shownFeatureFlags = useMemo(
    () =>
      Object.keys(flags).reduce((acc, ffname) => {
        const isSatisfySearch = !search || ffname.indexOf(search) > -1;

        if (isSatisfySearch) {
          return { ...acc, [ffname]: flags[ffname] };
        } else {
          return acc;
        }
      }, {}),
    [search, flags]
  );

  const shownChanges = useMemo(
    () =>
      Object.keys(changes).reduce((acc, ffname) => {
        const isSatisfySearch = !search || ffname.indexOf(search) > -1;

        if (isSatisfySearch) {
          return { ...acc, [ffname]: flags[ffname] };
        } else {
          return acc;
        }
      }, {}),
    [search, changes]
  );

  const onValueChange = useCallback(
    async (name: string, newValue: any) => {
      let newFeatureFlagChanges: Record<string, any> = {};

      if (flags[name]?.value === newValue) {
        newFeatureFlagChanges = { ...changes };
        delete newFeatureFlagChanges[name];
      } else {
        newFeatureFlagChanges = {
          ...changes,
          [name]: { value: newValue },
        };
      }

      setChanges(newFeatureFlagChanges);
    },
    [flags, changes]
  );

  return {
    shownFlags: shownFeatureFlags,
    shownChanges,
    changes,
    changeFlag: onValueChange,
  };
};
