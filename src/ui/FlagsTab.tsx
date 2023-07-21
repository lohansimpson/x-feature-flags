import React, { FC, useCallback, useMemo } from "react";
import { FlagsList } from "./components/FlagsList";

type Props = {
    search: string;
    flags: Record<string, any>;
    changes: Record<string, any>;
    setFlagsChanges: (changes: Record<string, any>) => void;
};

export const FlagsTab: FC<Props> = ({
    search,
    flags,
    changes,
    setFlagsChanges,
}) => {
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
        [search, flags, changes]
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

            setFlagsChanges(newFeatureFlagChanges);
        },
        [flags, changes]
    );

    return (
        <FlagsList
            featureFlags={shownFeatureFlags}
            changes={changes}
            onValueChange={onValueChange}
        />
    );
};
