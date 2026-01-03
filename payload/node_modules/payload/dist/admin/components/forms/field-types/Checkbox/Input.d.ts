import React from 'react';
import './index.scss';
type CheckboxInputProps = {
    onToggle: React.FormEventHandler<HTMLInputElement>;
    inputRef?: React.MutableRefObject<HTMLInputElement>;
    readOnly?: boolean;
    checked?: boolean;
    partialChecked?: boolean;
    name?: string;
    id?: string;
    label?: string;
    'aria-label'?: string;
    required?: boolean;
};
export declare const CheckboxInput: React.FC<CheckboxInputProps>;
export {};
