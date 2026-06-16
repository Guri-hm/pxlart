'use client'

import { useState, useRef } from 'react';
import Grid from '@mui/material/Grid';
import QRCode from "./qrcode";
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

type Props = {
    url: string,
}

export interface SimpleDialogProps {
    open: boolean;
    onClose: () => void;
    url: string
}
function SimpleDialog(props: SimpleDialogProps) {
    const { onClose, open, url } = props;
    const textInput = useRef<HTMLInputElement>(null);

    const QrCodeImg = ({ url }: any) => {

        return (
            <Container>
                <Grid container rowSpacing={4}>
                    <Grid item xs={12} textAlign='center'>
                        <QRCode url={url} />
                    </Grid>
                </Grid>
            </Container>
        );
    }

    const handleClickCopy = () => {
        if (!textInput.current) return;
        textInput.current.focus();
        if (navigator.clipboard) {
            navigator.clipboard.writeText(textInput.current.value);
        }
        alert("クリップボードにコピーしました")
    };
    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle>お絵描きロジックのリンク</DialogTitle>
            <DialogContent>
                <QrCodeImg url={url}></QrCodeImg>
                <Box
                    sx={{
                        mt: '30px',
                        maxWidth: '100%',
                    }}
                >
                    <TextField fullWidth label="URL" id="fullWidth" multiline maxRows={3} size="medium" value={url} inputRef={textInput} onFocus={event => {
                        event.target.select();
                    }} />
                </Box>
            </DialogContent>
            <DialogActions data-dndkit-disabled-dnd-flag="true">
                <Button onClick={handleClickCopy} variant="outlined">コピー</Button>
                <Button onClick={onClose} color="inherit" variant="outlined">閉じる</Button>
            </DialogActions>
        </Dialog>
    );
}


export default function NonogramQr(params: Props) {

    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    return (
        <>
            <Link onClick={handleClickOpen} sx={{ marginLeft: '10px', cursor: 'pointer' }} data-dndkit-disabled-dnd-flag="true">紹介する</Link>
            <SimpleDialog
                open={open}
                onClose={handleClose}
                url={params.url}
            />
        </>
    );
};

