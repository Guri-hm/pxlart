import React, { RefObject, useState, useContext } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import styles from './dialog.module.css'
import useStrokes from '@/app/hooks/useStrokes';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import { ResultType, enmStatus } from "./NonogramResultType"
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import { NonogramAnswerType } from './strokeTypes';
import Confetti from './Confetti';
import { MsgContext } from '../context/MsgContext';
import { AlertColor, AlertMessageType } from './alertTypes';
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send';
const evaluations = [
    '易しい',
    '普通',
    '難しい',
];
const icons = [
    <SentimentVerySatisfiedIcon key={0} />,
    <SentimentNeutralIcon key={1} />,
    <SentimentVeryDissatisfiedIcon key={2} />,
];

export interface ConfirmationDialogRawProps {
    id: string;
    keepMounted: boolean;
    value: string;
    answer: string;
    uuid: string | undefined;
    openDialog: { open: boolean, result: number };
    setOpenDialog: any;
    url: string;
    onClose: (value?: string) => void;
}

function ConfirmationDialogRaw(props: ConfirmationDialogRawProps) {
    const { onClose, value: valueProp, openDialog, setOpenDialog, answer, url, uuid, ...other } = props;
    const [value, setValue] = useState(valueProp);
    const radioGroupRef = React.useRef<HTMLElement>(null);
    const { setMsg } = useContext(MsgContext);
    const [loading, setLoading] = React.useState(false);

    const handleEvaluation = () => {
        if (value == null) {
            return;
        }

        setLoading(true);

        const evaluation = (data: { evaluation: number, uuid: string | undefined }) => {

            const handleErrors = (res: any) => {
                if (res.ok) {
                    return res;
                }

                switch (res.status) {
                    case 400: throw Error('INVALID_TOKEN');
                    case 401: throw Error('UNAUTHORIZED');
                    case 500: throw Error('INTERNAL_SERVER_ERROR');
                    case 502: throw Error('BAD_GATEWAY');
                    case 404: throw Error('NOT_FOUND');
                    default: throw Error('UNHANDLED_ERROR');
                }
            };

            fetch(`${process.env.NEXT_PUBLIC_API_BASE}/app/pxlart/evaluation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // JSON形式のデータのヘッダー
                },
                body: JSON.stringify(data) // JSON形式のデータ
            })
                .then(handleErrors)//サーバーサイドのエラーステータスを処理
                .then(res => {
                    return res.json()
                })
                .then((json) => {

                    if (json["result"] == "false") { //Flask側で"false"と判断されたらアラートする
                        throw new Error(json["message"])
                    }
                    const msg: AlertMessageType = { message: json["message"], type: AlertColor.info, open: true };
                    setMsg(msg);
                    setOpenDialog((prevState: ResultType) => ({ ...prevState, result: enmStatus.THANK }));

                }).catch(error => {
                    const msg: AlertMessageType = { message: (error.message == null) ? '通信に失敗しました' : error.message, type: AlertColor.error, open: true };
                    setMsg(msg);
                    return false;
                })
        };
        const data = { evaluation: evaluations.indexOf(value), uuid: uuid }
        evaluation(data);

    };

    const handleCancel = () => {
        setOpenDialog((prevState: ResultType) => ({ ...prevState, result: enmStatus.THANK }));
    };

    const handleOk = () => {
        setOpenDialog((prevState: ResultType) => ({ ...prevState, result: enmStatus.EVALUATION }));
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue((event.target as HTMLInputElement).value);
    };
    const handleBack = () => {
        window.location.replace(`${process.env.root}/nonogram`)
    };
    const handleRetry = () => {
        window.location.reload();
    };

    const handleEntering = () => {
        if (radioGroupRef.current != null) {
            radioGroupRef.current.focus();
        }
    };

    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
            maxWidth="xs"
            TransitionProps={{ onEntering: handleEntering }}
            open={openDialog?.open}
            {...other}
        >
            {openDialog?.result == enmStatus.SUCCESS &&
                <>
                    <DialogTitle>正解です！</DialogTitle>
                    <DialogContent dividers>
                        答えは「{answer}」
                        <Box sx={{ my: '2rem', display: 'flex', justifyContent: 'center', mx: 'auto', maxWidth: 300 }} >
                            <img src={url} className={styles.img} />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleOk}>次へ</Button>
                    </DialogActions>
                </>
            }
            {(openDialog?.result == enmStatus.EVALUATION || openDialog?.result == enmStatus.MISS) &&
                <>
                    <DialogTitle>{openDialog?.result == enmStatus.MISS ? "時間切れ" : "評価"}</DialogTitle>
                    <DialogContent dividers>
                        難易度の評価にご協力ください
                        <RadioGroup
                            ref={radioGroupRef}
                            aria-label="ringtone"
                            name="ringtone"
                            value={value}
                            onChange={handleChange}
                        >
                            {evaluations.map((option, index) => (
                                <FormControlLabel
                                    value={option}
                                    key={option}
                                    control={<Radio checkedIcon={icons[index]} />}
                                    label={option}

                                />
                            ))}
                        </RadioGroup>
                    </DialogContent>
                    <DialogActions>
                        <Button autoFocus onClick={handleCancel}>
                            キャンセル
                        </Button>
                        <LoadingButton
                            onClick={handleEvaluation}
                            endIcon={<SendIcon />}
                            loading={loading}
                            loadingPosition="end"
                            variant="contained"
                        >
                            <span>送信</span>
                        </LoadingButton>
                    </DialogActions>
                </>
            }
            {openDialog?.result == enmStatus.THANK &&
                <>
                    <DialogContent dividers>
                        ありがとうございました
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleBack}>戻る</Button>
                        <Button onClick={handleRetry}>もう一度遊ぶ</Button>
                    </DialogActions>
                </>
            }
        </Dialog>
    );
}

export interface ConfirmationDialogProps {
    openDialog: { open: boolean, result: number };
    setOpenDialog: any;
    canvasRef: RefObject<HTMLCanvasElement>;
    nonogramStrokes: NonogramAnswerType,
}

export default function ConfirmationDialog(props: ConfirmationDialogProps) {
    const { getCanvasDataUrl } = useStrokes();
    const { openDialog, setOpenDialog, nonogramStrokes, canvasRef } = props;
    const [value, setValue] = React.useState(evaluations[1]);
    const url = getCanvasDataUrl(canvasRef.current!)

    const handleClose = (newValue?: string) => {
        setOpenDialog((prevState: ResultType) => ({ ...prevState, open: false }));
        if (newValue) {
            setValue(newValue);
        }
    };

    return (
        <>
            {(openDialog?.result == enmStatus.SUCCESS) && <Confetti></Confetti>}
            <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                <ConfirmationDialogRaw
                    id="ringtone-menu"
                    keepMounted
                    openDialog={openDialog}
                    setOpenDialog={setOpenDialog}
                    onClose={handleClose}
                    value={value}
                    answer={nonogramStrokes.answer}
                    uuid={nonogramStrokes.uuid}
                    url={url}
                />
            </Box>
        </>
    );
}