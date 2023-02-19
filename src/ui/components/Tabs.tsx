import React, { FC } from "react";
import styled from "styled-components";

export type TabNames = 'all' | 'changed';
type Props = {
    selectedTab: TabNames;
    onChange: (newTab: TabNames) => void;
    allCount: number;
    changedCount: number;
}
export const Tabs: FC<Props> = ({ selectedTab, onChange, allCount, changedCount }) => {
    return (
        <Container>
            <Tab onClick={() => onChange('all')}>
                <TabLabel selected={selectedTab === 'all'}>Features <CountLabel>&nbsp;{allCount}</CountLabel></TabLabel>
            </Tab>
            <Tab onClick={() => onChange('changed')}>
                <TabLabel selected={selectedTab === 'changed'}>Changes Only <CountLabel>&nbsp;{changedCount}</CountLabel></TabLabel>
            </Tab>
        </Container>
    )
}


const Container = styled.div`
    padding-top: 5px;
    height: 40px;
    width: 100%;
    display: flex;
    flex-direction: row;
`;

const Tab = styled.div`
    flex: 1;
    height: 100%;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
        background-color: rgba(15,20,25,0.1);
    }
`;

const TabLabel = styled.div<{selected: boolean}>`
    font-size: 14px;
    font-weight: 500;
    height: 100%;
    padding: 0 10px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    ${props => props.selected ? `
        color: black;
        border-bottom: 3px solid rgb(29,155,240);
    `:`
        color: rgb(83, 100, 113);
    `}
`

const CountLabel = styled.span`
    color: rgba(0,0,0,0.3);
    margin-left: 5px;
`