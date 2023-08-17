import React from "react";
import { FC } from "react";
import styled from "styled-components";

type Props = {
    value: boolean;
    isChanged: boolean;
    onChange: (newVal: boolean) => void;
};

const icons = {
    checked: chrome.runtime.getURL("assets/icons/checked.svg"),
    uncheked: chrome.runtime.getURL("assets/icons/unchecked.svg"),
    checked_changed: chrome.runtime.getURL("assets/icons/checked_changed.svg"),
    uncheked_changed: chrome.runtime.getURL(
        "assets/icons/unchecked_changed.svg"
    ),
};

export const BooleanFlag: FC<Props> = ({ value, isChanged, onChange }) => {
    const src =
        (value && !isChanged && icons.checked) ||
        (!value && !isChanged && icons.uncheked) ||
        (value && isChanged && icons.checked_changed) ||
        icons.uncheked_changed;

    return (
        <Container>
            <Icon src={src} />
            <Checkbox
                type="checkbox"
                checked={value}
                onClick={() => onChange(!value)}
                isChanged={isChanged}
            />
        </Container>
    );
};

const Container = styled.div`
    /* padding: 10px; */
    border-radius: 3px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
        outline: 5px solid rgba(0, 0, 0, 0.07);
    }
`;

const Checkbox = styled.input<Pick<Props, "isChanged">>`
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: pointer;
`;

const Icon = styled.img`
    width: 18px;
    height: 18px;
`;
