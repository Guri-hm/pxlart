import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

type DialogProps = {
    open: boolean,
    setOpen: any,
    mainEvent: any,
    removeStrage: any
}
export function LocalStrageDialog(params: DialogProps) {

    const handleClose = () => {
        params.removeStrage();
        params.setOpen(false);
    };
    const handleLoadClick = () => {
        params.setOpen(false);
        params.mainEvent(true);
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
                    {"前回保存した状態に復元しますか？"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        キャンセルすると一時保存データは削除されます
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="inherit">キャンセル</Button>
                    <Button autoFocus onClick={handleLoadClick} variant="contained">
                        復元
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
