"use client";
import { useState, useRef, useEffect } from 'react';
import GridCanvas from '../components/GridCanvas';
import BgCanvas from '../components/BgCanvas';
import { InfoArea } from '../components/InfoArea';
import { getDictRGBA, getHex, invertColor } from '../components/rgba';
import { coordinate } from "../components/GetPositionInfo";
import { CursorType } from '../components/Cursors';
import ColorPicker from '../components/ColorPicker';
import Sliders from '../components/PxlSliders';
import EraserIcon from '../components/EraserIcon';
import NonogramIcon from '../components/NonogramIcon';
import PngIcon from '../components/PngIcon';
import CsvIcon from '../components/CsvIcon';
import useResizeObserver from '../components/useResizeObserver';
import UploadButton from '../components/PixelizeButton';
import { AlertColor, AlertMessageType } from '../components/alertTypes';
import { CustomizedSnackbars } from '../components/CustomizedSnackbars';
import useWindowSize from '../hooks/useWindowSize';
import IconButton from '@mui/material/IconButton';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ModeIcon from '@mui/icons-material/Mode';
import InfoIcon from '@mui/icons-material/Info';
import RestartAltSharpIcon from '@mui/icons-material/RestartAltSharp';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import GridOffIcon from '@mui/icons-material/GridOff';
import GridOnIcon from '@mui/icons-material/GridOn';
import Radio from '@mui/material/Radio';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { Mode, ModeType } from '../components/modeTypes'
import { ColorType, AllStrokesType, CurrentStrokeType, PxlArrayType } from '../components/strokeTypes'
import { GridCountType, defaultPxlSize, CanvasWrapper } from '../components/gridTypes'
import BinarizationDialog from '../components/BinarizationDialog';
import ResetDialog from '../components/ResetDialog';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { usePxlStatus, getStrageStrokes, removeLocalStrage } from './usePxlStatus'
import { LocalStrageDialog } from '../components/LocalStrageDialog';
import useStrokes, { blackColor, Trasparent } from '../hooks/useStrokes';
import PxlArtCanvas from './PxlArtCanvas';
import JoyStickArea from './JoyStickArea';
import MsgProvider from '../context/MsgProvider';
import styles from "./icon.module.css";
import CloseIcon from '@mui/icons-material/Close';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import BackupIcon from '@mui/icons-material/Backup';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import Utils from '../utils/utils';
import ColorizeIcon from '@mui/icons-material/Colorize';
import TabUnselectedIcon from '@mui/icons-material/TabUnselected';
import SettingsOverscanIcon from '@mui/icons-material/SettingsOverscan';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import Brightness5Icon from '@mui/icons-material/Brightness5';
import ContrastIcon from '@mui/icons-material/Contrast';
import GrayscaleDialog from './GrayscaleDialog';
import CsvDialog from './CsvDialog';


export default function Pxlart() {

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { clearCanvas, getGridForStrokes, drawAllstroke, getCurrentCanvasStrokes, getCsvUrl, getReDrawStoke } = useStrokes();
  type pickerState = {
    displayColorPicker: boolean;
    color: ColorType;
    cursorHoverColor: ColorType;
  };
  const [pickerState, setPickerState] = useState<pickerState>({
    displayColorPicker: false,
    color: blackColor,
    cursorHoverColor: Trasparent
  })

  const [colorList, setColorList] = useState<string[]>([]);
  const [whiteTheme, setWhiteTheme] = useState<boolean>(true);
  const [themeMode, setThemeMode] = useState<string>("#f7f7f7");
  const [gridVisible, setGridVisible] = useState<boolean>(true);
  const [infoVisible, setInfoVisible] = useState<boolean>(false);
  const [zoomRatio, setZoomRatio] = useState<number>(1);
  const [transformOrigin, setTransformOrigin] = useState<CursorType>({ x: 0, y: 0 });
  const [canvasPoint, setCanvasPoint] = useState<coordinate>({ offsetX: 0, offsetY: 0 });
  const [col, setCol] = useState<number>(0);
  const [row, setRow] = useState<number>(0);
  const [grid, setGrid] = useState<GridCountType>({ rowsCount: 20, colsCount: 20 });
  const [pxlSize, setPxlSize] = useState<number>(defaultPxlSize);
  const [openReset, setOpenReset] = useState(false)
  const [openBinarization, setOpenBinarization] = useState(false)
  const [openGrayscale, setOpenGrayscale] = useState(false)
  const [openCsvDialog, setOpenCsvDialog] = useState(false)
  const [strageDialogOpen, setStrageDialogOpen] = useState(false)
  const [message, setMessage] = useState<AlertMessageType>({ type: AlertColor.info, message: "", open: false });
  const [wrapperSize, setWrapperSize] = useState<CanvasWrapper>();
  const [drawMode, setMode] = useState<ModeType>(Mode.DRAW);
  const [strageStrokes, setStrageStrokes] = usePxlStatus([]);
  const [allStrokes, setAllStrokes] = useState<AllStrokesType>({ strokes: strageStrokes.length > 0 ? [{ pxl: strageStrokes }] : [] });
  // undo したストローク情報を保存
  const [undoStrokes, setUndoStrokes] = useState<AllStrokesType>({
    strokes: []
  });
  const [open, setOpen] = useState(false);
  const { yyyyMMddHHmmss } = Utils();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
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

  // キーボードショートカット: Ctrl+Z → undo / Ctrl+Y or Ctrl+Shift+Z → redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allStrokes, undoStrokes]);
  useEffect(() => {
    if (strageStrokes.length > 0) {
      setStrageDialogOpen(true);
    }
  }, [strageStrokes]);

  useEffect(() => {

    addNewColor(`rgba(${pickerState.color.r}, ${pickerState.color.g}, ${pickerState.color.b}, ${pickerState.color.a})`)

  }, [pickerState.color]);

  const handleThemeModeChange = (isWhiteMode: boolean) => {
    if (isWhiteMode) {
      setThemeMode("#f7f7f7");
    } else {
      setThemeMode("#131313");
    }
    setWhiteTheme(isWhiteMode);
  };

  const loadStrokes = () => {
    const nowAllStrokes = allStrokes.strokes;
    drawAllstroke(canvasRef, { strokes: [{ pxl: strageStrokes }] }, pxlSize);
    setAllStrokes({
      strokes: [...nowAllStrokes, { pxl: strageStrokes }]
    });
    setGrid(getGridForStrokes(strageStrokes))
    setMessage({ type: AlertColor.success, message: "一時保存から読み込みしました", open: true })
  };
  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode(event.target.value);
  };
  const handleModeClick = (event: any) => {
    //React.MouseEvent<HTMLInputElement>にするとtarget.valueが存在しないと警告される
    drawMode == Mode.SELECT ? event.target.value = Mode.DRAW : "";
    drawMode == Mode.MOVE ? event.target.value = Mode.SELECT : "";

    setMode(event.target.value);
  };

  const addNewColor = (rgba: string) => {
    // colorList の最後尾の要素を取得
    const lastColor = colorList[colorList.length - 1];

    // 最後尾の要素が rgba と同じでない場合のみ追加
    if (lastColor !== rgba) {
      if (colorList.length > 5) {
        colorList.shift();
      }
      setColorList([...colorList, rgba]);
    }
  }

  type ColorResult = {
    hex: string;
    rgb: {
      a: number;
      r: number;
      g: number;
      b: number;
    };
  };
  // const changeTextColor = (color: ColorResult) => {
  //   // setPickerState({ ...pickerState, color: color.rgb });
  // }

  const handleClickOpen = () => {
    setOpenReset(true);
  };

  const theme = createTheme({
    typography: {
      htmlFontSize: 10,
      fontFamily: [
        'DotGothic16',
      ].join(','),
    }
  });

  const resetStrokes = () => {
    clearCanvas(canvasRef);
    setAllStrokes({ strokes: [] });
    setGrid({ colsCount: 20, rowsCount: 20 });
    setZoomRatio(1);
  }

  const divElm = useRef<HTMLDivElement>(null)
  const handleResize = (entries: any) => {
    //この関数内の処理は初期レンダリング時の内容が継続するため、関数外で変化した値が反映されない
    const width = divElm.current!.clientWidth;
    const height = divElm.current!.clientHeight;
    setWrapperSize({ width: width, height: height });
  }
  useResizeObserver([divElm], handleResize);

  const [winWidth, winHeight] = useWindowSize();


  const handleValueChange = (event: React.SyntheticEvent, newValue: string) => {
    const rgba: ColorType | null = getDictRGBA(newValue);
    if (rgba == null) {
      return;
    }
    setPickerState({ ...pickerState, color: rgba });
  };
  const InitializeBinalizationDialog = () => {
    setOpenBinarization(true);
  };
  const InitializeGrayscaleDialog = () => {
    setOpenGrayscale(true);
  };
  const exportCsv = () => {
    try {
      const url: string = getCsvUrl(canvasRef, allStrokes, grid, pxlSize);
      let link = document.createElement("a");
      link.href = url;
      link.download = `${yyyyMMddHHmmss()}.csv`;
      link.click();
    }
    catch (error) {
      if (error instanceof Error) {
        setMessage({ type: AlertColor.error, message: error.message, open: true })
      } else {
        setMessage({ type: AlertColor.error, message: "予期しないエラーが発生しました", open: true })
      }
    }
  };

  const importCsv = (importedStrokes: AllStrokesType, importedGrid: GridCountType) => {
    clearCanvas(canvasRef);
    drawAllstroke(canvasRef, importedStrokes, pxlSize);
    setAllStrokes(importedStrokes);
    setGrid(importedGrid);
    setUndoStrokes({ strokes: [] });
    setMessage({ type: AlertColor.success, message: "CSVから読み込みました", open: true });
  };

  const saveCurrentStrokes = () => {
    const canvasStroke = getCurrentCanvasStrokes(allStrokes);

    setStrageStrokes(canvasStroke);
    setMessage({ type: AlertColor.success, message: "一時保存しました", open: true })
  };

  const saveAsImage = () => {
    let link = document.createElement("a");
    link.href = canvasRef.current!.toDataURL("image/png");
    link.download = `${yyyyMMddHHmmss()}.png`;
    link.click();
    setMessage({ type: AlertColor.success, message: "画像として保存します", open: true })
  };

  //取り消し
  const undo = () => {
    // 一度描画をすべてクリア
    clearCanvas(canvasRef);

    // redo 用に最新のストロークを保存しておく
    if (allStrokes.strokes.length == 0) {
      //0の場合、redo処理がエラーになるので、ここで返す
      return;
    }
    const lastStroke = allStrokes.strokes.slice(-1)[0];
    const nowUndoStrokes = undoStrokes.strokes;
    setUndoStrokes({
      strokes: [...nowUndoStrokes, lastStroke]
    });

    // すべてのストローク情報から最後の配列を取り除く
    const newAllStrokes: AllStrokesType = {
      strokes: allStrokes.strokes.slice(0, -1)
    };

    drawAllstroke(canvasRef, newAllStrokes, pxlSize);

    // 最新のすべてのストローク情報を保存
    setAllStrokes({ strokes: [...newAllStrokes.strokes] });
  };


  const redo = () => {

    if (undoStrokes.strokes.length == 0) return;

    // undo したストローク情報から最新のストロークを復元（描画）させる
    const lastUndo: AllStrokesType = { strokes: [undoStrokes.strokes.slice(-1)[0]] };
    drawAllstroke(canvasRef, lastUndo, pxlSize);

    // undoStrokes の一番後ろのストロークを削除する
    const newUndoStrokes = undoStrokes.strokes.slice(0, -1);
    setUndoStrokes({ strokes: [...newUndoStrokes] });

    // redo したストロークをすべてのストローク情報に戻す
    setAllStrokes({
      strokes: [...allStrokes.strokes, lastUndo.strokes[0]]
    });
  };

  const load = () => {

    const localStrageStrokes: CurrentStrokeType | null = getStrageStrokes();

    if (localStrageStrokes == null) {
      setMessage({ type: AlertColor.warning, message: "保存データがありません", open: true })
      return;
    }

    const redrawStroke = getReDrawStoke(localStrageStrokes);
    drawAllstroke(canvasRef, { strokes: [{ pxl: redrawStroke }] }, pxlSize);
    setMessage({ type: AlertColor.success, message: "一時保存から読み込みしました", open: true })

    const nowAllStrokes = allStrokes.strokes;
    setAllStrokes({
      strokes: [...nowAllStrokes, { pxl: redrawStroke }]
    });

    setGrid(getGridForStrokes(localStrageStrokes))
  }

  const [showSubMenu, setShowSubMenu] = useState(false);

  const actions = [
    {
      icon: <ColorLensIcon />, name: '色', action: () => {
        setPickerState({ ...pickerState, displayColorPicker: !pickerState.displayColorPicker })
      }
    },
    {
      icon: <ModeIcon />, name: 'ペン', action: () => {
        setMode(Mode.DRAW);
        handleClose;
      }
    },
    {
      icon: <FormatColorFillIcon />, name: '塗りつぶし', action: () => {
        setMode(Mode.FILL);
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


  return (
    <>
      <MsgProvider setMsg={setMessage} msg={message}>
        <ThemeProvider theme={theme}>
          <InfoArea visible={infoVisible} setVisible={setInfoVisible} zoomRatio={zoomRatio} canvasPoint={canvasPoint} col={col} row={row} color={pickerState.cursorHoverColor} />
          <div className='d-flex f-grow-1' style={{ backgroundColor: themeMode }}>
            <div className={`slide-menu-wrapper ${showSubMenu ? "show" : ""}`}>
              <div className="slide-menu">
                <Card className="toolBox grid" style={{ height: winHeight - 200 }} variant="outlined">

                  <ColorPicker color={pickerState.color}
                    addNewColor={addNewColor} state={pickerState} setState={setPickerState} />
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
                  <Tooltip arrow title="塗りつぶし" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="fill" control={<Radio
                        checked={drawMode === Mode.FILL}
                        onChange={handleModeChange}
                        value={Mode.FILL}
                        name="radio-buttons"
                        inputProps={{ 'aria-label': Mode.FILL }}
                        icon={<FormatColorFillIcon />}
                        checkedIcon={<FormatColorFillIcon color="primary" />} className={styles.iconStyle} />} label={<Typography className={styles.dMdNone}>塗りつぶし</Typography>} />

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
                  <Tooltip arrow title="スポイトツール" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="spuit" control={<Radio
                        checked={drawMode === Mode.SPUIT}
                        onChange={handleModeChange}
                        value={Mode.SPUIT}
                        name="radio-buttons"
                        inputProps={{ 'aria-label': Mode.SPUIT }}
                        icon={<ColorizeIcon />}
                        checkedIcon={<ColorizeIcon color="primary" />} className={styles.iconStyle}
                      />} label={<Typography className={styles.dMdNone}>スポイトツール</Typography>} />
                    </div>
                  </Tooltip>
                  <Tooltip arrow title="範囲選択" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="select" control={<Radio
                        checked={drawMode === Mode.SELECT || drawMode === Mode.MOVE}
                        onClick={handleModeClick}
                        value={Mode.SELECT}
                        name="radio-buttons"
                        inputProps={{ 'aria-label': Mode.SELECT }}
                        icon={<TabUnselectedIcon />}
                        checkedIcon={<TabUnselectedIcon color="primary" />} className={styles.iconStyle}
                      />} label={<Typography className={styles.dMdNone}>範囲選択</Typography>} />
                    </div>
                  </Tooltip>
                  <Tooltip arrow title="移動ツール" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="move" control={<Radio
                        disabled={!(drawMode === Mode.SELECT || drawMode === Mode.MOVE)}
                        checked={drawMode === Mode.MOVE}
                        onClick={() => setMode(drawMode === Mode.MOVE ? Mode.SELECT : Mode.MOVE)}
                        value={Mode.MOVE}
                        name="radio-buttons"
                        inputProps={{ 'aria-label': Mode.MOVE }}
                        icon={<SettingsOverscanIcon />}
                        checkedIcon={<SettingsOverscanIcon color="primary" />} className={styles.iconStyle}
                      />} label={<Typography className={styles.dMdNone}>移動ツール</Typography>} />
                    </div>
                  </Tooltip>
                  <Tooltip arrow title="取り消し" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="undo" control={<IconButton aria-label="undo" onClick={() => undo()} className={styles.iconStyle}>
                        <UndoIcon />
                      </IconButton>} label={<Typography className={styles.dMdNone}>取り消し</Typography>} />
                    </div>
                  </Tooltip>
                  <Tooltip arrow title="やり直し" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="redo" control={<IconButton aria-label="redo" onClick={() => redo()} className={styles.iconStyle}>
                        <RedoIcon />
                      </IconButton>} label={<Typography className={styles.dMdNone}>やり直し</Typography>} />
                    </div>
                  </Tooltip>
                  <Tooltip arrow title="リセット" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="reset" control={<IconButton aria-label="reset" onClick={() => handleClickOpen()} className={styles.iconStyle}>
                        <RestartAltSharpIcon color="error" />
                      </IconButton>} label={<Typography className={styles.dMdNone}>リセット</Typography>} />
                    </div>
                  </Tooltip>
                  <Tooltip arrow title="グリッド表示" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="grid" control={<Checkbox aria-label="grid"
                        icon={<GridOffIcon />}
                        checkedIcon={<GridOnIcon />} checked={gridVisible} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setGridVisible(event.target.checked)} className={styles.iconStyle}
                      />} label={<Typography className={styles.dMdNone}>グリッド表示</Typography>} />
                    </div>
                  </Tooltip>
                  <Tooltip arrow title="テーマ" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="theme" control={<Checkbox aria-label="theme"
                        icon={<Brightness1Icon />}
                        checkedIcon={<Brightness5Icon />} checked={whiteTheme} onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleThemeModeChange(event.target.checked)} className={styles.iconStyle}
                      />} label={<Typography className={styles.dMdNone}>テーマ</Typography>} />
                    </div>
                  </Tooltip>
                  <Sliders grid={grid} setGrid={setGrid} className={styles.iconStyle} />
                  <Tooltip arrow title="画像から作成" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="pixelize" control={<UploadButton allStrokes={allStrokes} setAllStrokes={setAllStrokes} setGrid={setGrid} className={styles.iconStyle}></UploadButton>} label={<Typography className={styles.dMdNone}>画像から作成</Typography>} />
                    </div>
                  </Tooltip>
                  <Tooltip arrow title="一時保存" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="save" control={<IconButton aria-label="save" onClick={() => saveCurrentStrokes()} className={styles.iconStyle}>
                        <BackupIcon />
                      </IconButton>} label={<Typography className={styles.dMdNone}>一時保存</Typography>} />
                    </div>
                  </Tooltip>
                  <Tooltip arrow title="一時保存から読込" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="load" control={<IconButton aria-label="load" onClick={() => load()} className={styles.iconStyle}>
                        <CloudDownloadIcon />
                      </IconButton>} label={<Typography className={styles.dMdNone}>一時保存から読込</Typography>} />
                    </div>
                  </Tooltip>
                  <Tooltip arrow title="PNG形式で保存" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="saveAsImage" control={<IconButton aria-label="saveAsImage" onClick={() => saveAsImage()} className={styles.iconStyle}>
                        <PngIcon />
                      </IconButton>} label={<Typography className={styles.dMdNone}>PNG形式で保存</Typography>} />
                    </div>
                  </Tooltip>
                  <Tooltip arrow title="CSV" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="csv" control={<IconButton aria-label="csv" onClick={() => setOpenCsvDialog(true)} className={styles.iconStyle}>
                        <CsvIcon />
                      </IconButton>} label={<Typography className={styles.dMdNone}>CSV</Typography>} />
                    </div>
                  </Tooltip>
                  <Tooltip arrow title="白黒変換" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="grayscale" control={<IconButton aria-label="grayscale" onClick={() => InitializeGrayscaleDialog()} className={styles.iconStyle}>
                        <ContrastIcon />
                      </IconButton>} label={<Typography className={styles.dMdNone}>白黒変換</Typography>} />
                    </div>
                  </Tooltip>
                  <Tooltip arrow title="お絵描きロジック変換" disableInteractive>
                    <div className={styles.dMd50}>
                      <FormControlLabel className='mx-auto' value="nonogram" control={<IconButton aria-label="binarization" onClick={() => InitializeBinalizationDialog()} className={styles.iconStyle}>
                        <NonogramIcon />
                      </IconButton>} label={<Typography className={styles.dMdNone}>お絵描きロジック変換</Typography>} />
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
            <div className="pxl-container f-grow-1" ref={divElm} >

              <BgCanvas grid={grid} zoomRatio={zoomRatio} canvasPoint={canvasPoint} pxlSize={pxlSize} bgColor="" transformOrigin={transformOrigin} />
              <PxlArtCanvas canvasRef={canvasRef} grid={grid} drawMode={drawMode} pxlSize={pxlSize} rgba={pickerState.color} setPickerState={setPickerState} setCol={setCol} setRow={setRow} setCanvasPoint={setCanvasPoint} setAllStrokes={setAllStrokes} allStrokes={allStrokes} canvasPoint={canvasPoint} zoomRatio={zoomRatio} setZoomRatio={setZoomRatio} setPxlSize={setPxlSize} wrapperSize={wrapperSize} setTransformOrigin={setTransformOrigin} transformOrigin={transformOrigin} col={col} row={row} />
              <GridCanvas grid={grid} visible={gridVisible} zoomRatio={zoomRatio} canvasPoint={canvasPoint} pxlSize={pxlSize} transformOrigin={transformOrigin} />
              <Box sx={{ height: '100%', width: 100, transform: 'translateZ(0px)', flexGrow: 1 }} className={styles.dMdNone}>
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
          <LocalStrageDialog open={strageDialogOpen} setOpen={setStrageDialogOpen} mainEvent={loadStrokes} removeStrage={removeLocalStrage}></LocalStrageDialog>
          <ResetDialog open={openReset} setOpen={setOpenReset} clickEvent={resetStrokes} ></ResetDialog>
          <BinarizationDialog open={openBinarization} setOpen={setOpenBinarization} canvasRef={canvasRef} grid={grid} pxlSize={pxlSize} allStrokes={allStrokes}></BinarizationDialog>
          <GrayscaleDialog open={openGrayscale} setOpen={setOpenGrayscale} canvasRef={canvasRef} grid={grid} pxlSize={pxlSize} allStrokes={allStrokes} setAllStrokes={setAllStrokes}></GrayscaleDialog>
          <CsvDialog
            open={openCsvDialog}
            onClose={() => setOpenCsvDialog(false)}
            onExport={exportCsv}
            onImport={importCsv}
            onError={(msg) => setMessage({ type: AlertColor.error, message: msg, open: true })}
          />
          <CustomizedSnackbars></CustomizedSnackbars>
          <Box sx={{ mx: 'auto', height: 30 }}>
            <BottomNavigation showLabels onChange={handleValueChange} sx={{ height: 'auto' }}>
              {colorList.map((rgba, index) => (
                <BottomNavigationAction key={index} label={getHex(rgba)} style={{ backgroundColor: rgba, flexBasis: 'auto', width: 'auto', minWidth: 'unset', color: invertColor(getHex(rgba)), height: 30 }} value={rgba} />
              ))}
            </BottomNavigation>
          </Box >
          <div style={{
            backgroundColor: "rgba(" + [pickerState.color.r, pickerState.color.g, pickerState.color.b, pickerState.color.a].join(',') + ")",
            height: '20px'
          }}></div>
        </ThemeProvider>
      </MsgProvider>
    </>
  )
}
