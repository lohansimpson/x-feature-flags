import React, { FC } from 'react';
import styled from "styled-components";
import { Button, ButtonLink } from './Button';


type Props = {
    isCanSave: boolean;
    onSave: () => void;
    onClear: () => void;
}

export const Footer: FC<Props> = ({ isCanSave, onSave, onClear}) => {
   return (
    <Container>
        <Block></Block>
        <Block>
            <Button disabled={!isCanSave} onClick={onSave}>Save Changes</Button>
        </Block>
        <Block style={{justifyContent: 'flex-end'}}>
            <ButtonLink onClick={onClear}>Clear State</ButtonLink>
        </Block>
    </Container>
   ); 
};


const Container = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: stretch;
    align-items: center;
    padding: 15px;
`

const Block = styled.div`
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
`