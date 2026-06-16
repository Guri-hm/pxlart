import { useState, useEffect, useRef, RefObject, useContext } from "react";
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import Brightness1RoundedIcon from '@mui/icons-material/Brightness1Rounded';
import Brightness1OutlinedIcon from '@mui/icons-material/Brightness1Outlined';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import styles from './dialog.module.css'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import QRCode from "./qrcode";
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { AlertColor, AlertMessageType } from '../components/alertTypes';
import CustomTextarea from '../components/CustomTextarea';
import { NonogramAnswerType, BinarizationParamsType, } from "./strokeTypes";
import useStrokes from '@/app/hooks/useStrokes';
import { GridCountType } from '../components/gridTypes'
import { MsgContext } from '../context/MsgContext';
import { AllStrokesType } from './strokeTypes';
import Overlay from './Overlay';

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
const BinarizedImg = ({ canvasRef, threshold, setThreshold, grid, pxlSize, allStrokes }: any) => {

    const { getBinarizedImgUrl } = useStrokes();

    const binarizedImgRef = useRef<HTMLImageElement>(null);
    useEffect(() => {
        if (!binarizedImgRef.current) {
            throw new Error("error");
        }
        const img = binarizedImgRef.current;
        //Null合体演算子
        img.src = getBinarizedImgUrl(canvasRef, threshold, pxlSize, grid, allStrokes) ?? '';
    }, [threshold]);

    const handleChange = (event: Event, newValue: number | number[]) => {
        setThreshold(newValue as number);
    };

    return (
        <>
            <Box sx={{ my: '2rem', mx: 'auto', maxWidth: 300 }} >
                <img ref={binarizedImgRef} className={styles.img} />
            </Box>
            <Typography gutterBottom>しきい値</Typography>
            <Brightness1OutlinedIcon />
            <Slider className={styles.slider} aria-label="Volume" defaultValue={threshold} value={threshold} onChange={handleChange} min={0} max={255} step={1} valueLabelDisplay="auto" />
            <Brightness1RoundedIcon />
        </>
    );
};

type DialogProps = {
    open: boolean,
    setOpen: any,
    canvasRef: RefObject<HTMLCanvasElement>,
    pxlSize: number,
    grid: GridCountType,
    allStrokes: AllStrokesType,
}

export default function BinarizationDialog(params: DialogProps) {
    const [threshold, setThreshold] = useState<number>(180);
    const [url, setUrl] = useState<string>("");
    const [code, setCode] = useState<string>("");
    const [answer, setAnswer] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const textInput = useRef<HTMLInputElement>(null);
    const [inputAnswerError, setInputAnswerError] = useState(false);
    const [inputTitleError, setInputTitleError] = useState(false);
    const { setMsg } = useContext(MsgContext);
    const { getBinarizationParams } = useStrokes();
    const [shouldShow, setShow] = useState(false);

    const handleClickCopy = () => {
        if (!textInput.current) return;
        textInput.current.focus();
        if (navigator.clipboard) {
            navigator.clipboard.writeText(textInput.current.value);
        }
        alert("クリップボードにコピーしました")
    };

    const handleClose = () => {
        params.setOpen(false);
        setUrl("");
        setCode("");
        setTitle("");
        setAnswer("");
    };

    const handleClick = () => {

        setShow(true)
        if (title.length == 0) {
            const msg: AlertMessageType = { message: 'タイトルを入力してください', type: AlertColor.error, open: true };
            setMsg(msg);
            return;
        }
        if (answer.length == 0) {
            const msg: AlertMessageType = { message: '答えを入力してください', type: AlertColor.error, open: true };
            setMsg(msg);
            return;
        }
        if (inputAnswerError || inputTitleError) {
            const msg: AlertMessageType = { message: '入力内容に誤りがあります', type: AlertColor.error, open: true };
            setMsg(msg);
            return;
        }

        const registStrokes = (data: NonogramAnswerType) => {

            if (data.strokes.length == 0 || data.threshold == 0) {
                const msg: AlertMessageType = { message: '答えがありません', type: AlertColor.error, open: true };
                setMsg(msg);
                return;
            }

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

            fetch(`${process.env.NEXT_PUBLIC_API_BASE}/app/pxlart/regist`, {
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
                    const uri = new URL(window.location.href);
                    const redirectUrl = `${uri.origin}${process.env.root}/nonogram/${json["uuid"]}`;
                    setUrl(redirectUrl);
                    setCode(json["code"]);

                }).catch(error => {

                    const msg: AlertMessageType = { message: (error.message == null) ? '通信に失敗しました' : error.message, type: AlertColor.error, open: true };
                    setMsg(msg);
                }).finally(() => setShow(false))
        };

        //2値化するストロークとしきい値を取得
        const binarizedStrokes: BinarizationParamsType = getBinarizationParams(params.canvasRef, params.pxlSize, params.grid, threshold);
        const data: NonogramAnswerType = { strokes: binarizedStrokes.strokes, threshold: binarizedStrokes.threshold, title: title, answer: answer, uuid: undefined }
        registStrokes(data);
    };

    return (
        <>
            {shouldShow ? <Overlay></Overlay> : null}
            <Dialog
                fullScreen={fullScreen}
                open={params.open}
                onClose={handleClose}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle variant="h5" id="responsive-dialog-title">
                    {(url.length == 0) ?
                        'お絵描きロジックを作成しますか？' :
                        '二次元バーコードを読み取ってアクセスできます'
                    }
                </DialogTitle>
                <DialogContent>
                    {(url.length == 0) ?
                        <Container>
                            <Grid container rowSpacing={4}>
                                <Grid item xs={12} textAlign='center' sx={{ minWidth: { sm: "150px" } }}>
                                    <BinarizedImg canvasRef={params.canvasRef} pxlSize={params.pxlSize} threshold={threshold} setThreshold={setThreshold} grid={params.grid} allStrokes={params.allStrokes} />
                                </Grid>
                                <Grid item xs={12} textAlign='center' sx={{ minWidth: { sm: "150px" } }}>
                                    <Box
                                        sx={{
                                            width: 500,
                                            maxWidth: '100%',
                                            mx: 'auto',
                                        }}
                                    >
                                        <Box sx={{ my: 2 }}>
                                            <CustomTextarea label="タイトル" helperText="お絵描きロジックの説明に使用します(20字以内)" setText={setTitle} text={title} error={inputTitleError} setError={setInputTitleError}></CustomTextarea>
                                        </Box>
                                        <Box sx={{ my: 2 }}>
                                            <CustomTextarea label="答え" helperText="お絵描きロジックの正解時に使用します(20字以内) " setText={setAnswer} text={answer} error={inputAnswerError} setError={setInputAnswerError}></CustomTextarea>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Container>

                        :
                        <>
                            <QrCodeImg url={url} />
                            <Box
                                sx={{
                                    mt: '30px',
                                    maxWidth: '100%',
                                }}
                            >
                                <Box sx={{ my: 2 }}>
                                    <TextField fullWidth label="URL" id="fullWidth" multiline maxRows={3} size="medium" value={url} inputRef={textInput} onFocus={event => {
                                        event.target.select();
                                    }} />
                                </Box>
                                <Box sx={{ my: 2 }}>
                                    <TextField fullWidth label="削除コード" size="medium" value={code} onFocus={event => {
                                        event.target.select();
                                    }} helperText="削除するためのものなので、メモしておいてください" />
                                </Box>
                            </Box>
                        </>

                    }
                </DialogContent>
                <DialogActions>
                    {(url.length == 0) ?
                        <>
                            <Button autoFocus onClick={handleClose} color="inherit" variant="outlined">
                                キャンセル
                            </Button>
                            <Button onClick={handleClick} variant="contained" startIcon={<QrCode2Icon />}>
                                作成
                            </Button>
                        </>
                        :
                        <>
                            <Button onClick={handleClickCopy} variant="outlined">コピー</Button>
                            <Button onClick={handleClose} color="inherit" variant="outlined">閉じる</Button>
                        </>
                    }
                </DialogActions>
            </Dialog >
        </>
    );
}