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
import Box from '@mui/material/Box';
import { CurrentStrokeType, } from "./strokeTypes";
import useStrokes from '@/app/hooks/useStrokes';
import { GridCountType } from '../components/gridTypes'
import { AllStrokesType } from './strokeTypes';


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
                <img ref={binarizedImgRef} className={styles.img} alt="" />
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
    setAllStrokes: any,
}

export default function GrayscaleDialog(params: DialogProps) {
    const [threshold, setThreshold] = useState<number>(180);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const { binarize } = useStrokes();

    const handleClose = () => {
        params.setOpen(false);
    };

    const handleClick = () => {

        const binarizedStrokes: CurrentStrokeType = binarize(params.canvasRef, threshold, params.pxlSize, params.grid, params.allStrokes);
        params.setAllStrokes({
            strokes: [...params.allStrokes.strokes, { pxl: binarizedStrokes }]
        });
        params.setOpen(false);
    };

    return (
        <>
            <Dialog
                fullScreen={fullScreen}
                open={params.open}
                onClose={handleClose}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle variant="h5" id="responsive-dialog-title">
                    白黒2色に変換しますか?
                </DialogTitle>
                <DialogContent>
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
                                </Box>
                            </Grid>
                        </Grid>
                    </Container>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleClose} color="inherit" variant="outlined">
                        キャンセル
                    </Button>
                    <Button onClick={handleClick} variant="contained">
                        変換
                    </Button>
                </DialogActions>
            </Dialog >
        </>
    );
}