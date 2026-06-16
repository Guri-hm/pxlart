import { useState, useEffect, useRef } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

type DialogProps = {
    open: boolean,
    setOpen: any,
    clickEvent: any
}
export default function ResetDialog(params: DialogProps) {

    const handleClose = () => {
        params.setOpen(false);
    };

    const handleResetClick = () => {
        params.clickEvent();
        params.setOpen(false);
    };

    return (
        <>
            <Dialog
                open={params.open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"リセットします。よろしいですか？"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        リセットすると、元に戻すことができません
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="inherit" variant="outlined">キャンセル</Button>
                    <Button onClick={handleResetClick} autoFocus color="error" variant="contained" startIcon={<DeleteIcon />}>
                        リセット
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}