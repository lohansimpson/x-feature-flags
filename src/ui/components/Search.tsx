import React, { ChangeEventHandler, FC, useEffect, useState } from "react";
import styled from "styled-components";

type Props = {
    initialValue?: string;
    onChange: (newValue: string) => void;
}

export const Search: FC<Props> = ({ initialValue = '', onChange }) => {
    const [inputValue, setInputValue] = useState(initialValue);

    useEffect(() => {
        setInputValue(initialValue);
    }, [initialValue]);
    
    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        const newText = event.target.value;
        setInputValue(newText);
        onChange(newText);
    }

    return (
        <Container>
            <SearchInput placeholder="Search Features" value={inputValue} onChange={handleChange}/>
        </Container>
    );
}

const Container = styled.div`
    padding: 15px 15px 0 15px;
    width: 100%;
    box-sizing: border-box;
`

const SearchInput = styled.input`
    background-color: #F0F3F4;
    text-align: center;
    border-radius: 100px;
    width: 100%;
    height: 40px;
    padding: 0 20px;
    font-weight: 500;
    box-sizing: border-box;
    border-width: 0;
    font-size: 15px;
    
    &:focus {
        background-color: white;
        outline-style: solid;
        outline-width: 2px;
        outline-color: rgb(29, 155, 240);
        text-align: left;
    }
`