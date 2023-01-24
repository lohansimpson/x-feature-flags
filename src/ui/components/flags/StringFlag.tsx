import styled from "styled-components";
import React, { FC, useCallback, useMemo } from "react";

type Props = {
    value: string;
    isChanged: boolean;
    onChange: (newVal: string) => void;
}

export const StringFlag: FC<Props> = ({ value, isChanged, onChange }) => {
    const initialValue = useMemo(() => value, []);
    const onInput = useCallback((ev: React.FormEvent<HTMLDivElement>) => {
        const newValue = ev.currentTarget.textContent || '';
        onChange(newValue);
    }, []);

    return (
        <StringFlagInput
            contentEditable="true"
            isChanged={isChanged}
            onInput={onInput}
        >{initialValue}</StringFlagInput>
    );
}

export const StringFlagInput = styled.div<{isChanged: boolean}>`
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

    &::-webkit-scrollbar {
        display: none;
    }
`