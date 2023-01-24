import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

type Props = {
    value: Object;
    isChanged: boolean;
    onChange: (newVal: Object) => void;
}

export const OtherFlag: FC<Props> = ({ value, isChanged, onChange }) => {
    const [isError, setIsError] = useState(false);
    const initialValue = useMemo(() => value, []);
    const onInput = useCallback((ev: React.FormEvent<HTMLDivElement>) => {
        const newValue = ev.currentTarget.textContent || '';
        let objectValue: Object | null = null;
        try {
            objectValue = JSON.parse(newValue);
        } catch(_) {}

        if (objectValue) {
            setIsError(false);
            onChange(objectValue);
        } else {
            setIsError(true);
        }
    }, []);

    return (
        <OtherFlagInput
            contentEditable="true"
            isError={isError}
            isChanged={isChanged}
            onInput={onInput}
        >{JSON.stringify(initialValue)}</OtherFlagInput>
    );
}

export const OtherFlagInput = styled.div<{isError: boolean, isChanged: boolean}>`
    background-color: #F0F3F4;
    border-width: 0;
    border-radius: 5px;
    padding: 5px 10px;
    box-sizing: border-box;
    font-size: 13px;
    font-weight: 500;
    justify-content: center;
    align-items: center;
    max-width: 150px;
    min-width: 20px;
    max-height: 30px;
    white-space: nowrap;
    overflow: auto;

    ${props => props.isChanged ? `
        background-color: white;
        outline: solid 2px #4B99E9;
    ` : ''}

    ${props => props.isError ? `
        outline: solid 2px red;
    ` : ''}


    &::-webkit-scrollbar {
        display: none;
    }
`