import TextField from '@mui/material/TextField';
import { useState, useRef } from "react";

type Props = {
    text: string,
    setText: any,
    error: boolean,
    setError: any,
    label: string,
    helperText: string
}

export default function CustomTextarea(params: Props) {

    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = () => {
        if (inputRef.current) {
            const ref = inputRef.current;
            ref.setCustomValidity("")
            if (!ref.validity.valid) {
                let pattern = new RegExp(/[!"#$%&'()\*\+\-\.,\/:;<=>?@\[\\\]^_`{|}~]/g);
                if (pattern.test(ref.value)) {
                    ref.setCustomValidity("記号は使用できません")
                }
                params.setError(true);
            } else {
                params.setError(false);
                params.setText(inputRef.current.value)
            }
        }
    };


    return (
        <>
            <TextField
                inputRef={inputRef}
                error={params.error}
                inputProps={{ maxLength: 20, pattern: "^[ーぁ-んァ-ン一-龯a-zA-Zａ-ｚＡ-Ｚ0-9]+$" }}
                fullWidth id="outlined-basic" label={params.label} variant="outlined" helperText={params.error ? inputRef?.current?.validationMessage : params.helperText}
                onChange={handleInputChange} required defaultValue={params.text} />
        </>

    );
}

