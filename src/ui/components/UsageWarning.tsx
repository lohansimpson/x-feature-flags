import React, { FC } from "react";
import { Button } from "./Button";
import styled from "styled-components";

type Props = {
    onConfirm: () => void;
};

export const UsageWarning: FC<Props> = ({ onConfirm }) => {
    return (
        <Container data-testid="usage-warning">
            <Title>☢️ Use this extension at your own risk ☢️</Title>
            Changing feature flags can activate work-in-progress features,
            however they are usually incomplete, can include bugs and might
            change before release.
            <br />
            <br />
            In rare cases changing flags can also introduce permanent bugs to
            your account.
            <br />
            <br />
            <br />
            <Button onClick={onConfirm} disabled={false}>
                I understand
            </Button>
        </Container>
    );
};

const Container = styled.div`
    padding: 20px;
    box-sizing: border-box;
    margin: 0 20px;
    display: flex;
    flex-direction: column;
    font-size: 14px;
    background-color: #f0f3f4;
    border-radius: 10px;
`;

const Title = styled.div`
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    text-align: center;
`;
