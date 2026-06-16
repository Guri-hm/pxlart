import React, { useContext } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { MsgContext } from '../context/MsgContext';

export function CustomizedSnackbars() {
    const { msg, setMsg } = useContext(MsgContext);

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setMsg((prevState: any) => ({ ...prevState, open: false }));
    };

    return (
        <Snackbar open={msg.open} autoHideDuration={4000} onClose={handleClose}>
            <Alert onClose={handleClose} severity={msg.type} sx={{ width: '100%', fontSize: '1.6rem' }}>
                {msg.message}
            </Alert>
        </Snackbar>
    );
}
