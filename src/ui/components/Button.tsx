import styled from "styled-components";

export const Button = styled.button<{ disabled: boolean }>`
    font-weight: bold;
    color: white;
    height: 40px;
    font-size: 16px;
    text-align: center;
    vertical-align: center;
    padding: 0 20px;
    border-radius: 100px;
    border-width: 0;
    user-select: none;

    background-color: rgb(29, 155, 240);
    cursor: pointer;

    ${ ({disabled}) => disabled ? `
        pointer-events: none;
        opacity: 0.4;
    ` : ''}

    transition: all 0.2s;

    &:hover {
        background-color: rgb(26,140,216);
    }
`;


export const ButtonLink = styled.button`
    font-weight: 500;
    color: #91A0B0;
    height: 30px;
    font-size: 14px;
    text-align: center;
    vertical-align: center;
    padding: 0 15px;
    border-radius: 100px;
    border-width: 0;
    user-select: none;

    background-color: transparent;
    cursor: pointer;

    transition: all 0.2s;

    &:hover {
        color: #788695;
        background-color: rgb(145,160,176, 0.1);
    }
`;