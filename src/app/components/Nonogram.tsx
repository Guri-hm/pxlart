"use client";

import { useState, useRef, useEffect } from 'react';
import NonogramCanvas from '../components/NonogramCanvas';
import GridCanvas from '../components/GridCanvas';
import ColHintsCanvas from '../components/ColHintsCanvas';
import RowHintsCanvas from '../components/RowHintsCanvas';
import BgCanvas from '../components/BgCanvas';
import { Cursors, CursorType } from '../components/Cursors';
import ColorPicker from '../components/ColorPicker';
import EraserIcon from '../components/EraserIcon';
import useResizeObserver from '../components/useResizeObserver';
import { AlertColor, AlertMessageType } from '../components/alertTypes';
import { CustomizedSnackbars } from '../components/CustomizedSnackbars';
import useWindowSize from '../hooks/useWindowSize';
import IconButton from '@mui/material/IconButton';
import ModeIcon from '@mui/icons-material/Mode';
import InfoIcon from '@mui/icons-material/Info';
import RestartAltSharpIcon from '@mui/icons-material/RestartAltSharp';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import { Mode, ModeType } from '../components/modeTypes'
import { ColorType, AllStrokesType, NonogramAnswerType, PxlType } from '../components/strokeTypes'
import { GridCountType, defaultPxlSize, CanvasWrapper } from '../components/gridTypes'
import { HintType } from '../components/HintTypes'
import ClearIcon from '@mui/icons-material/Clear';
import ResetDialog from '../components/ResetDialog'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Timer, calcTimerFromStrokes } from './Timer';
import { useNonogramStatus, removeLocalStrage } from './useNonogramStatus';
import { LocalStrageDialog } from '../components/LocalStrageDialog';
import { coordinate } from './GetPositionInfo';
import useStrokes, { blackColor } from '@/app/hooks/useStrokes';
import { ResultType, enmStatus } from "./NonogramResultType"
import ConfirmationDialog from './ConfirmationDialog';
import MsgProvider from '../context/MsgProvider';
import JoyStickArea from './JoyStickArea';
import styles from "./icon.module.css";
import CloseIcon from '@mui/icons-material/Close';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import BackupIcon from '@mui/icons-material/Backup';
import PrintIcon from '@mui/icons-material/Print';
import QRCode from "./qrcode";

export default function Nonogram({
  params,
  searchParams,
}: {
  params: NonogramAnswerType;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { clearCanvas, getGridForStrokes, getBinarizedStrokes, drawAllstroke, getCurrentCanvasStrokes } = useStrokes();

  const [colorList, setColorList] = useState<string[]>([]);
  const [rgba, setRGBA] = useState<ColorType>(blackColor);
  const [gridVisible, setGridVisible] = useState<boolean>(true);
  const [infoVisible, setInfoVisible] = useState<boolean>(true);
  const [zoomRatio, setZoomRatio] = useState<number>(1);
  const [canvasPoint, setCanvasPoint] = useState<coordinate>({ offsetX: 0, offsetY: 0 });
  const [col, setCol] = useState<number>(0);
  const [row, setRow] = useState<number>(0);
  const [grid, setGrid] = useState<GridCountType>({ rowsCount: 5, colsCount: 5 });
  const [pxlSize, setPxlSize] = useState<number>(defaultPxlSize);
  const [openReset, setOpenReset] = useState(false)
  const [strageDialogOpen, setStrageDialogOpen] = useState(false)
  const [message, setMessage] = useState<AlertMessageType>({ type: AlertColor.info, message: "", open: false });
  const [wrapperSize, setWrapperSize] = useState<CanvasWrapper>();
  const [colHints, setColHints] = useState<HintType[]>([]);
  const [rowHints, setRowHints] = useState<HintType[]>([]);
  const [drawMode, setMode] = useState<ModeType>(Mode.DRAW);
  const [strageStrokes, setStrageStrokes] = useNonogramStatus({
    strokes: [], uuid: params.uuid, count: 300
  });
  const [count, setCount] = useState(strageStrokes.count)
  const [allStrokes, setAllStrokes] = useState<AllStrokesType>({ strokes: [{ pxl: strageStrokes.strokes }] });
  const [resultDaialog, setResultDaialog] = useState<ResultType>({ open: false, result: enmStatus.MISS });
  const [transformOrigin, setTransformOrigin] = useState<CursorType>({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  type ColorResult = {
    hex: string;
    rgb: {
      a: number;
      r: number;
      g: number;
      b: number;
    };
  };
  useEffect(() => {
    // HTML と BODY に対してスタイルを動的に適用
    document.documentElement.style.touchAction = 'none';
    document.body.style.touchAction = 'none';

    // クリーンアップ関数で元に戻す
    return () => {
      document.documentElement.style.touchAction = '';
      document.body.style.touchAction = '';
    };
  }, []);
  useEffect(() => {

    setGrid(getGridForStrokes(getBinarizedStrokes(params.strokes, params.threshold)))

    //測定開始
    if (strageStrokes.count > 0) {
      setCount(calcTimerFromStrokes(params.strokes))
    }
  }, []);

  useEffect(() => {

    if (strageStrokes.strokes.length == 0) {
      return
    }
    if (strageStrokes.uuid != params.uuid) {
      return
    }
    //お絵描きロジック
    setStrageDialogOpen(true);

  }, [strageStrokes]);

  const loadNonogramStatus = () => {
    setAllStrokes({ strokes: [{ pxl: strageStrokes.strokes }] });
    setCount(strageStrokes.count);
    drawAllstroke(canvasRef, { strokes: [{ pxl: strageStrokes.strokes }] }, pxlSize);
    setMessage({ type: AlertColor.success, message: "一時保存から読み込みしました", open: true })

  };

  const saveNonogramStatus = () => {
    const canvasStroke = getCurrentCanvasStrokes(allStrokes);

    setStrageStrokes({
      strokes: canvasStroke, uuid: params.uuid, count: count
    })
    setMessage({ type: AlertColor.success, message: "一時保存しました", open: true })
  };

  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode(event.target.value);
  };
  const addNewColor = (rgba: string) => {
    if (colorList.length > 5) {
      colorList.shift();
    }
    setColorList([...colorList, rgba])
  }

  const changeTextColor = (color: ColorResult) => {
    setRGBA(color.rgb);
  }

  const handleClickOpen = () => {
    setOpenReset(true);
  };

  const resetStrokes = () => {
    clearCanvas(canvasRef);
    setAllStrokes({ strokes: [] });
    setZoomRatio(1);
    setCount(calcTimerFromStrokes(params.strokes))

  }

  const print = () => {
    window.print();

  }

  const theme = createTheme({
    typography: {
      htmlFontSize: 10
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (themeParam) => ({
          html: { fontSize: "62.5%" },
        }),
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            "@media print": {
              display: 'none',
            },
          },
        },
      },
    }
  });

  const divElm = useRef<HTMLDivElement>(null)
  const handleResize = (entries: any) => {
    //この関数内の処理は初期レンダリング時の内容が継続するため、関数外で変化した値が反映されない
    const width = divElm.current!.clientWidth;
    const height = divElm.current!.clientHeight;
    setWrapperSize({ width: width, height: height });
  }
  useResizeObserver([divElm], handleResize);
  const [showSubMenu, setShowSubMenu] = useState(false);
  type pickerState = {
    displayColorPicker: boolean;
    color: {
      [value: string]: number
    };
  };
  const [pickerState, setPickerState] = useState<pickerState>({
    displayColorPicker: false,
    color: rgba,
  })
  const [winWidth, winHeight] = useWindowSize();

  const actions = [
    {
      icon: <ClearIcon />, name: '×マーク', action: () => {
        setMode(Mode.MARK);
        handleClose;
      }
    },
    {
      icon: <ModeIcon />, name: 'ペン', action: () => {
        setMode(Mode.DRAW);
        handleClose;
      }
    },
    {
      icon: <EraserIcon />, name: '消しゴム', action: () => {
        setMode(Mode.ERASE);
      }
    },
    {
      icon: <MoreHorizIcon />, name: 'すべて表示', action: () => {
        setShowSubMenu((prev) => !prev);
      }
    },
  ];
  const uri = typeof window !== 'undefined' ? new URL(window.location.href) : undefined;

  // const uri = new URL(window.location.href);

  return (
    <>
      <MsgProvider msg={message} setMsg={setMessage}>
        <ThemeProvider theme={theme}>
          <Timer visible={infoVisible} setVisible={setInfoVisible} setResultDaialog={setResultDaialog} seconds={count} setSeconds={setCount} />
          <h3 className='text-center m-10'>{params.title}</h3>
          <div className='d-none'>
            {uri && (
              <QRCode url={`${uri.origin}${process.env.root}/nonogram/${params.uuid}`}></QRCode>
            )}
          </div>
          <div className='d-flex f-grow-1'>
            <div className={`no-print slide-menu-wrapper ${showSubMenu ? "show" : ""}`}>
              <div className="slide-menu">
                <Card className="toolBox grid" style={{ height: winHeight - 200 }}>
                  <ColorPicker color={rgba}
                    onChange={changeTextColor} addNewColor={addNewColor} state={pickerState} setState={setPickerState} />
                  <Tooltip arrow title="ペン" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="pen" control={<Radio
                        checked={drawMode === Mode.DRAW}
                        onChange={handleModeChange}
                        value={Mode.DRAW}
                        name="radio-buttons"
                        inputProps={{ 'aria-label': Mode.DRAW }}
                        icon={<ModeIcon />}
                        checkedIcon={<ModeIcon color="primary" />}
                        className={styles.iconStyle}
                      />} label={<Typography className={styles.dMdNone}>ペン</Typography>} />
                    </div>
                  </Tooltip>
                  <Tooltip arrow title="×マーク" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="mark" control={<Radio
                        checked={drawMode === Mode.MARK}
                        onChange={handleModeChange}
                        value={Mode.MARK}
                        name="radio-buttons"
                        inputProps={{ 'aria-label': Mode.MARK }}
                        icon={<ClearIcon />}
                        checkedIcon={<ClearIcon color="primary" />}
                        className={styles.iconStyle}
                      />} label={<Typography className={styles.dMdNone}>×マーク</Typography>} />
                    </div>

                  </Tooltip>
                  <Tooltip arrow title="消しゴム" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="erase" control={<Radio
                        checked={drawMode === Mode.ERASE}
                        onChange={handleModeChange}
                        value={Mode.ERASE}
                        name="radio-buttons"
                        inputProps={{ 'aria-label': Mode.ERASE }}
                        icon={<EraserIcon />}
                        checkedIcon={<EraserIcon colorName="primary" />} className={styles.iconStyle}
                      />} label={<Typography className={styles.dMdNone}>消しゴム</Typography>} />
                    </div>
                  </Tooltip>
                  <Tooltip arrow title="リセット" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="reset" control={<IconButton aria-label="reset" onClick={() => handleClickOpen()} className={styles.iconStyle}>
                        <RestartAltSharpIcon color="error" />
                      </IconButton>} label={<Typography className={styles.dMdNone}>リセット</Typography>} />
                    </div>
                  </Tooltip>
                  <Tooltip arrow title="一時保存" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="save" control={<IconButton aria-label="save" onClick={() => saveNonogramStatus()} className={styles.iconStyle}>
                        <BackupIcon />
                      </IconButton>} label={<Typography className={styles.dMdNone}>一時保存</Typography>} />
                    </div>
                  </Tooltip>
                  <Tooltip arrow title="印刷" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="print" control={<IconButton aria-label="print" onClick={() => print()} className={styles.iconStyle}>
                        <PrintIcon />
                      </IconButton>} label={<Typography className={styles.dMdNone}>印刷</Typography>} />
                    </div>
                  </Tooltip>
                  <Tooltip arrow title="情報" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="info" control={<Checkbox aria-label="info"
                        icon={<InfoIcon />}
                        checkedIcon={<InfoIcon />} checked={infoVisible} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setInfoVisible(event.target.checked)} className={styles.iconStyle}
                      />} label={<Typography className={styles.dMdNone}>情報</Typography>} />
                    </div>
                  </Tooltip>
                </Card>
                <IconButton aria-label="close" onClick={() => setShowSubMenu(false)} className={`${styles.iconStyleForSlider} ${styles.closeIcon} ${styles.largeIcon} ${styles.dMdNone}`}>
                  <CloseIcon />
                </IconButton>
              </div>
            </div>
            <div className="pxl-container f-grow-1 p-10-print" ref={divElm} >
              <ColHintsCanvas grid={grid} zoomRatio={zoomRatio} canvasPoint={canvasPoint} pxlSize={pxlSize} colHints={colHints} transformOrigin={transformOrigin}></ColHintsCanvas>
              <RowHintsCanvas grid={grid} zoomRatio={zoomRatio} canvasPoint={canvasPoint} pxlSize={pxlSize} rowHints={rowHints} transformOrigin={transformOrigin}></RowHintsCanvas>
              <BgCanvas grid={grid} zoomRatio={zoomRatio} canvasPoint={canvasPoint} pxlSize={pxlSize} bgColor="white" transformOrigin={transformOrigin} />
              {/* <AnswerPxlCanvas grid={grid} visible={gridVisible} zoomRatio={zoomRatio} canvasPoint={canvasPoint} pxlSize={pxlSize} /> */}
              <NonogramCanvas canvasRef={canvasRef} grid={grid} drawMode={drawMode} pxlSize={pxlSize} rgba={rgba} setCol={setCol} setRow={setRow} setCanvasPoint={setCanvasPoint} setAllStrokes={setAllStrokes} allStrokes={allStrokes} canvasPoint={canvasPoint} zoomRatio={zoomRatio} setZoomRatio={setZoomRatio} setPxlSize={setPxlSize} wrapperSize={wrapperSize} count={count} nonogramStrokes={params} setColHints={setColHints} setCount={setCount} setRowHints={setRowHints} setResultDaialog={setResultDaialog} setTransformOrigin={setTransformOrigin} transformOrigin={transformOrigin} setPickerState={setPickerState} />
              <GridCanvas grid={grid} visible={gridVisible} zoomRatio={zoomRatio} canvasPoint={canvasPoint} pxlSize={pxlSize} transformOrigin={transformOrigin} />
              <Box sx={{ height: '100%', width: 100, transform: 'translateZ(0px)', flexGrow: 1 }} className={`${styles.dMdNone} events-none no-print`}>
                <SpeedDial
                  ariaLabel="SpeedDial controlled open example"
                  sx={{ position: 'absolute', bottom: 20, left: 16 }}
                  icon={<SpeedDialIcon />}
                  onClose={handleClose}
                  onOpen={handleOpen}
                  open={open}
                >
                  {actions.map((action, index) => (
                    <SpeedDialAction
                      key={index}
                      icon={action.icon}
                      tooltipTitle={action.name}
                      onClick={action.action}
                      tooltipOpen
                      tooltipPlacement='right'
                    />
                  ))}
                </SpeedDial>
              </Box>
              <JoyStickArea canvasPoint={canvasPoint} setCanvasPoint={setCanvasPoint} transformOrigin={transformOrigin} setTransformOrigin={setTransformOrigin} zoomRatio={zoomRatio} setZoomRatio={setZoomRatio} winWidth={winWidth}></JoyStickArea>
            </div>
          </div >
          <div className='d-none print text-center'>
            <div>下のQRコードを読み取って解答してください</div>
            {uri && (
              <QRCode url={`${uri.origin}${process.env.root}/nonogram/${params.uuid}`}></QRCode>
            )}
          </div>
          <LocalStrageDialog open={strageDialogOpen} setOpen={setStrageDialogOpen} mainEvent={loadNonogramStatus} removeStrage={removeLocalStrage}></LocalStrageDialog>
          <ResetDialog open={openReset} setOpen={setOpenReset} clickEvent={resetStrokes} ></ResetDialog>
          <CustomizedSnackbars></CustomizedSnackbars>
          {resultDaialog?.open && <><ConfirmationDialog openDialog={resultDaialog} setOpenDialog={setResultDaialog} nonogramStrokes={params} canvasRef={canvasRef}></ConfirmationDialog></>}
        </ThemeProvider >
      </MsgProvider >

    </>
  )
}
