import React, { FC, useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { Flag } from "./flags/Flag";

type Props = {
    featureFlags: Record<string, any>;
    changes: Record<string, any>;
    onValueChange: (name: string, newValue: any) => void;
}

export const FlagsList: FC<Props> = ({ featureFlags, changes, onValueChange }) => {
    const featureFlagNames = Object.keys(featureFlags);

    return (
        <Container>
            {featureFlagNames.map((ffk) => 
                <Flag
                    key={ffk}
                    name={ffk}
                    isChanged={!!changes[ffk]}
                    value={changes[ffk]?.value ?? featureFlags[ffk]?.value}
                    onChange={(newValue) => onValueChange(ffk, newValue)}
                />
            )}
        </Container>
    )
};

export const Container = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px 0;
`