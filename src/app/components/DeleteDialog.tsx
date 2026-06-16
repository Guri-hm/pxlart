import { useState, useRef, useContext } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { MsgContext } from '../context/MsgContext';
import { AlertColor, AlertMessageType } from "./alertTypes";
import { DeleteNonogram } from "./DeleteNonogram"
import Overlay from './Overlay';
import Nonogram from "./Nonogram";

type DialogProps = {
    state: { open: boolean, uuid: string },
    setState: any,
    event: any
}
export default function DeleteDialog(params: DialogProps) {

    const inputRef = useRef<HTMLInputElement>(null);
    const [inputError, setInputError] = useState(false);
    const { setMsg } = useContext(MsgContext);
    const [shouldShow, setShow] = useState(false);
    const deleteData = async (uuid: string, code: string) => {
        setShow(true)
        let result = await DeleteNonogram(uuid, code, setMsg)
        // propを変更することで再レンダリングさせる
        if (result) {
            params.event(uuid)
        }
        setShow(false)
    }
    const handleClose = () => {
        params.setState({ open: false, uuid: '' });
    };

    const handleDeleteClick = () => {
        let msg: AlertMessageType = { message: '', type: AlertColor.error, open: true };

        if (!inputRef.current) {
            return
        }
        const ref = inputRef.current;
        if (!ref.validity.valid) {
            msg.message = 'コードの入力に誤りがあります'
            setMsg(msg)
            return
        }
        if (ref.value == '') {
            msg.message = 'コードが入力されていません'
            setMsg(msg)
            return
        }
        deleteData(params.state.uuid, ref.value)
        params.setState({ open: false, uuid: '' });
    };

    const handleChange = () => {
        if (inputRef.current) {
            const ref = inputRef.current;
            if (!ref.validity.valid) {
                setInputError(true);
            } else {
                setInputError(false);
            }
        }

    };

    return (
        <>
            {shouldShow ? <Overlay></Overlay> : null}

            <Dialog
                open={params.state.open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"削除します"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        削除コードを入力してください
                    </DialogContentText>
                    <TextField
                        autoFocus
                        error={inputError}
                        inputProps={{ maxLength: 6, pattern: "^[a-zA-Z0-9_]+$" }}
                        required
                        id="code"
                        name="削除コード"
                        label="削除コード"
                        fullWidth
                        variant="standard"
                        defaultValue=""
                        helperText={inputRef?.current?.validationMessage}
                        onChange={handleChange}
                        inputRef={inputRef}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="inherit" variant="outlined">キャンセル</Button>
                    <Button onClick={handleDeleteClick} color="error" variant="contained" startIcon={<DeleteIcon />}>
                        削除
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}