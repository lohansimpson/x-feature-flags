import React, { FC, ReactNode } from "react";
import styled from "styled-components";
import { BooleanFlag } from "./BooleanFlag";
import { NumberFlag } from "./NumberFlag";
import { OtherFlag } from "./OtherFlag";
import { StringFlag } from "./StringFlag";

type Props = {
    isChanged: boolean;
    name: string;
    value: any;
    onChange: (newValue: any) => void;
}

export const Flag: FC<Props> = ({ name, value, isChanged, onChange }) => {
    let valueEl: ReactNode = null;

    switch (typeof value) {
        case 'boolean':
            valueEl = <BooleanFlag value={value} isChanged={isChanged} onChange={onChange} />;
            break;
        case 'number':
            valueEl = <NumberFlag value={value} isChanged={isChanged} onChange={onChange} />;
            break;
        case 'string':
            valueEl = <StringFlag value={value} isChanged={isChanged} onChange={onChange} />;
            break;
        case 'object':
        default:
            valueEl = <OtherFlag value={value} isChanged={isChanged} onChange={onChange} />;
            break;
    }


    return (
        <Container>
            <Label isChanged={isChanged}>{name}</Label>
            {valueEl}
        </Container>
    );
}

const Container = styled.div`
    padding: 5px 10px 5px 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    max-width: 100%;
`

export const Label = styled.div<{ isChanged: boolean }>`
    font-size: 14px;
    font-weight: ${props  => props.isChanged ? '500' : '400'};
    color: #101419;
    padding-right: 20px;
    word-break: break-word;
`;