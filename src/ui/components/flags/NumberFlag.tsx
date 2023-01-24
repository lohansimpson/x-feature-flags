import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

type Props = {
    value: number;
    isChanged: boolean;
    onChange: (newVal: number) => void;
}

export const NumberFlag: FC<Props> = ({ value, isChanged, onChange }) => {
    const [isError, setIsError] = useState(false);
    const initialValue = useMemo(() => value, []);
    const onInput = useCallback((ev: React.FormEvent<HTMLDivElement>) => {
        const newValue = ev.currentTarget.textContent || '';
        if (/^-?\d+$/.test(newValue)) {
            setIsError(false);
            onChange(parseInt(newValue));
        } else {
            setIsError(true);
        }
    }, []);

    return (
        <NumberFlagInput
            contentEditable="true"
            isError={isError}
            isChanged={isChanged}
            onInput={onInput}
        >{initialValue}</NumberFlagInput>
    );
}

export const NumberFlagInput = styled.div<{isError: boolean, isChanged: boolean}>`
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