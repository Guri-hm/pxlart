import React, { useState, useEffect } from "react";
import { RefObject } from "react"
import { offsetPosition, coordinate, getColRowInfo, getPxlInfo, Corner, ColRow, getStartCornerType, getCornerCoordinate, getEndCornerType } from "./GetPositionInfo";
import { ColorType, PxlType, CurrentStrokeType, AllStrokesType } from './strokeTypes';
import useStrokes, { NaNColor } from "../hooks/useStrokes";
import { ModeType, Mode } from "./modeTypes";
import { GridCountType } from "./gridTypes";
import Utils from "../utils/utils";


type MouseOrTouchEventHandler<T = Element> = React.EventHandler<
  React.MouseEvent<T> | React.TouchEvent<T>
>;
type Props = {
  canvasRef: RefObject<HTMLCanvasElement>,
  selectAreaCanvasRef: RefObject<HTMLCanvasElement> | null, //範囲選択
  grid: GridCountType,// キャンバス行数列数
  drawMode: ModeType,
  pxlSize: number,
  rgba: ColorType,
  setCol: any,
  setRow: any,
  setCanvasPoint: any,
  setAllStrokes: any,
  allStrokes: AllStrokesType,
  setZoomRatio: any,
  zoomRatio: number,
  canvasPoint: coordinate,
  setTransformOrigin: any,
  setPickerState: any | undefined
}
type pickerState = {
  displayColorPicker: boolean;
  color: ColorType;
  cursorHoverColor: ColorType;
};
export default function BaseCanvas(params: Props) {

  const { objectEquals } = Utils();
  const { getCtx, createInterpolatedPosition, fillPxl, fillPxls, drawAllstroke, getPxlColor, clearCanvas, uniqueStrokes, getSelectAreaStrokes, getCurrentCanvasStrokes, getMovedStrokes } = useStrokes();
  // 現在（今描いている）ストロークの座標情報を保存
  const [currentStroke, setCurrentStroke] = useState<CurrentStrokeType>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startCR, setStartCR] = useState<ColRow>({
    col: 0,
    row: 0
  });
  const [endCR, setEndCR] = useState<ColRow>({
    col: 0,
    row: 0
  });
  const [moveStartCR, setMoveStartCR] = useState<ColRow>({
    col: 0,
    row: 0
  });
  const [diffCR, setDiffCR] = useState<ColRow>({
    col: 0,
    row: 0
  });

  useEffect(() => {
    if (!params.canvasRef.current) return;

    const handleTouchMove = (event: any) => {
      event.preventDefault();
    }

    const init = (canvas: HTMLCanvasElement) => {

      canvas.width = params.grid.colsCount * params.pxlSize;
      canvas.height = params.grid.rowsCount * params.pxlSize;

      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

      setIsDrawing(false);

      // すべてのストローク情報
      const newAllStrokes: AllStrokesType = {
        strokes: params.allStrokes.strokes
      };

      // キャンバスの塗りを一度リセット
      const ctx = getCtx(canvas);

      // 一度描画をすべてクリア
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawAllstroke(canvas, newAllStrokes, params.pxlSize);
      canvas.removeEventListener("touchmove", handleTouchMove, false);
    }

    init(params.canvasRef.current);

  }, [params.grid, params.pxlSize]);

  useEffect(() => {
    if (!params.canvasRef.current) return;
    const canvas = params.canvasRef.current;
    canvas.style.transformOrigin = `${params.canvasPoint.offsetX}px ${params.canvasPoint.offsetY}px`;
    params.setTransformOrigin({ x: params.canvasPoint.offsetX, y: params.canvasPoint.offsetY });
    if (params.canvasPoint.offsetX == 0 && params.canvasPoint.offsetY == 0) {
      canvas.style.transformOrigin = `${canvas.width / 2}px ${canvas.height / 2}px`;
      params.setTransformOrigin({ x: canvas.width / 2, y: canvas.height / 2 });
    }
    // canvas.style.transformOrigin = `${params.canvasPoint.offsetX}px ${params.canvasPoint.offsetY}px`;
    canvas.style.transform = `scale(${params.zoomRatio})`;
  }, [params.zoomRatio]);

  const updateCursorHoverColor = (newColor: ColorType) => {
    params.setPickerState((prevState: pickerState) => ({
      ...prevState,
      cursorHoverColor: newColor
    }));
  };

  const drawStart: MouseOrTouchEventHandler = async (e) => {

    const down = async (coordinate: coordinate) => {

      if (params.drawMode === Mode.SELECT || params.drawMode === Mode.MOVE) {
        const rcInfo = getColRowInfo(coordinate, params.pxlSize);
        switch (params.drawMode) {
          case Mode.SELECT:
            setStartCR(rcInfo);
            break;
          case Mode.MOVE:
            setMoveStartCR(rcInfo);
            break;
        }
        setIsDrawing(true);
        return;
      }

      let pxl: PxlType = getPxlInfo(coordinate, params.pxlSize, params.drawMode);
      const ctx = getCtx(params.canvasRef.current!);

      switch (params.drawMode) {
        case Mode.ERASE:
          pxl.color = NaNColor;
          break;
        case Mode.SPUIT:
          const cursorHoverColor = getPxlColor(ctx, { c: pxl.c, r: pxl.r }, params.pxlSize);
          params.setPickerState({ displayColorPicker: false, color: cursorHoverColor, cursorHoverColor: cursorHoverColor });
          return;
        default:
          //塗る色
          pxl.color = params.rgba;
          break;
      }

      switch (params.drawMode) {
        case Mode.FILL:
          const strokes = await fillPxls(ctx, params.rgba, pxl, params.pxlSize, params.grid, 5000);
          setCurrentStroke(strokes);

          break;
        default:
          fillPxl(ctx, pxl, params.pxlSize);
          // 現在のストローク情報として座標を保存していく
          setCurrentStroke([pxl]);
          setIsDrawing(true);
          break;
      }
    }
    const coordinate: coordinate = offsetPosition(e, params.zoomRatio);
    params.setCanvasPoint({ offsetX: coordinate.offsetX, offsetY: coordinate.offsetY });

    down(coordinate);
  };

  // 描画中
  const drawMove: MouseOrTouchEventHandler = (e) => {

    const moveCursor = (e: React.MouseEvent | React.TouchEvent, pxlSize: number, setCanvasPoint: any, setCol: any, setRow: any) => {

      const coordinate: coordinate = offsetPosition(e, params.zoomRatio);
      setCanvasPoint({ offsetX: coordinate.offsetX, offsetY: coordinate.offsetY });

      const pxl = getColRowInfo(coordinate, pxlSize);
      setCol(pxl.col + 1);
      setRow(pxl.row + 1);
      const ctx = getCtx(params.canvasRef.current!);
      const cursorHoverColor = getPxlColor(ctx, { c: pxl.col, r: pxl.row }, params.pxlSize);
      updateCursorHoverColor(cursorHoverColor);

    };

    const move = (startCoordinate: coordinate, endCoordinate: coordinate, ajustedX: number = 0, ajustedY: number = 0) => {

      //線形補間
      const lerp = (ctx: CanvasRenderingContext2D, startPxl: PxlType, endPxl: PxlType) => {
        //線形補間(2点間のxの座標のyを取得)
        const num = 10;
        let strokes: PxlType[] = [];
        for (let i = 0, length_i = num; i < length_i; i++) {
          const pxl: PxlType = Object.assign(createInterpolatedPosition(i, num, startPxl, endPxl), { "color": undefined }, { "mode": params.drawMode });
          pxl.color = endPxl.color;
          fillPxl(ctx, pxl, params.pxlSize);
          strokes.push(pxl);
        }

        return strokes;
      }

      let artCanvasCtx: CanvasRenderingContext2D;
      artCanvasCtx = getCtx(params.canvasRef);

      switch (params.drawMode) {
        case Mode.SELECT:
        case Mode.MOVE:

          clearCanvas(params.selectAreaCanvasRef)
          if (params.drawMode == Mode.MOVE) {
            clearCanvas(params.canvasRef)

            drawAllstroke(params.canvasRef, params.allStrokes, params.pxlSize)

            let canvasStrokes: CurrentStrokeType = getCurrentCanvasStrokes(params.allStrokes)
            let selectAreaStrokes: PxlType[] = getSelectAreaStrokes(canvasStrokes, startCR, endCR);

            // 移動元の部分を削除
            for (let i = 0; i < selectAreaStrokes.length; i++) {
              let pxl: PxlType = { color: NaNColor, c: selectAreaStrokes[i].c, r: selectAreaStrokes[i].r, mode: Mode.ERASE };
              fillPxl(artCanvasCtx, pxl, params.pxlSize);
            }

            const drawDragCanvas = (ctx: CanvasRenderingContext2D, strokes: CurrentStrokeType, startCR: ColRow, endCR: ColRow, diffCR: ColRow, pxlSize: number) => {

              let movedStrokes: PxlType[] = getMovedStrokes(ctx, strokes, startCR, endCR, diffCR)
              for (let i = 0; i < movedStrokes.length; i++) {
                fillPxl(ctx, movedStrokes[i], pxlSize)
              }
            }

            // 移動中の部分を描画
            drawDragCanvas(artCanvasCtx, canvasStrokes, startCR, endCR, diffCR, params.pxlSize);
          }

          let selectAreaCanvasCtx: CanvasRenderingContext2D;
          selectAreaCanvasCtx = getCtx(params.selectAreaCanvasRef);

          // 選択範囲の描画
          selectAreaCanvasCtx.beginPath();
          selectAreaCanvasCtx.strokeStyle = "rgb(" + (~~(256 * Math.random())) + ", " + (~~(256 * Math.random())) + ", " + (~~(256 * Math.random())) + ")";
          selectAreaCanvasCtx.setLineDash([10, 5]);
          selectAreaCanvasCtx.rect(startCoordinate.offsetX + ajustedX, startCoordinate.offsetY + ajustedY, endCoordinate.offsetX - startCoordinate.offsetX, endCoordinate.offsetY - startCoordinate.offsetY);
          selectAreaCanvasCtx.lineWidth = 2;
          selectAreaCanvasCtx.stroke();
          return;
      }

      let pxl: PxlType = getPxlInfo(endCoordinate, params.pxlSize, params.drawMode);
      if (params.grid.colsCount <= pxl.c || params.grid.rowsCount <= pxl.r) {
        //isDrawingをFalseにする処理が遅く、後述の処理にいってしまうため
        //キャンバス外で後述の処理を禁止
        return;
      }

      switch (params.drawMode) {
        case Mode.ERASE:
          pxl.color = NaNColor;
          break;
        default:
          pxl.color = params.rgba;
          break;
      }

      //マウスの移動の度に処理を続けるため、1マスの処理に複数回余分に実行される
      //前回ストロークと同じマスを処理するようであればreturnさせる
      const [last] = [...currentStroke].reverse();
      if (objectEquals(last, pxl)) {
        return;
      }
      let strokes: PxlType[] = lerp(artCanvasCtx, currentStroke[currentStroke.length - 1], pxl)

      fillPxl(artCanvasCtx, pxl, params.pxlSize);
      strokes.push(pxl)

      //配列の追加を行う場合は、変更前の値を引数で受け取り状態更新を行う関数型を使う
      setCurrentStroke(oldValue => [...oldValue, ...strokes])
      // setCurrentStroke([...currentStroke, pxl]);
      // カーソルを動かして1ストロークを書き続ける間、現在のストローク情報として座標を保存し続ける
    }

    moveCursor(e, params.pxlSize, params.setCanvasPoint, params.setCol, params.setRow)

    if (!isDrawing) return;

    let startCoordinate: coordinate = { offsetX: 0, offsetY: 0 };
    // 現在のカーソル位置
    let endCoordinate: coordinate = { offsetX: 0, offsetY: 0 };
    endCoordinate = offsetPosition(e, params.zoomRatio);
    let startCornerType = Corner.UL;
    let ajustedX = 0;
    let ajustedY = 0;

    switch (params.drawMode) {
      case Mode.SELECT:
        const endTmpCR: ColRow = getColRowInfo(endCoordinate, params.pxlSize);
        setEndCR(endTmpCR);
        //始点の位置種類を取得
        startCornerType = getStartCornerType(startCR, endTmpCR);
        startCoordinate = getCornerCoordinate(startCR, params.pxlSize, startCornerType)

        endCoordinate = getCornerCoordinate(endTmpCR, params.pxlSize, getEndCornerType(startCornerType))

        break;
      case Mode.MOVE:

        //始点の位置種類を取得
        startCornerType = getStartCornerType(startCR, endCR);
        startCoordinate = getCornerCoordinate(startCR, params.pxlSize, startCornerType)

        //UseStateから終端を計算
        endCoordinate = getCornerCoordinate(endCR, params.pxlSize, getEndCornerType(startCornerType))

        let currentCoordinate: coordinate = offsetPosition(e, params.zoomRatio);
        const currentCR: ColRow = getColRowInfo(currentCoordinate, params.pxlSize);
        // 始点とのズレを計算
        const diffCR: ColRow = { col: currentCR.col - moveStartCR.col, row: currentCR.row - moveStartCR.row };
        setDiffCR(diffCR);
        ajustedX = diffCR.col * params.pxlSize;
        ajustedY = diffCR.row * params.pxlSize;

        break;
      default:
    }

    move(startCoordinate, endCoordinate, ajustedX, ajustedY)
  };

  // 描画完了
  const drawEnd: MouseOrTouchEventHandler = (e) => {
    //スクロール無効化
    e.preventDefault();

    const up = () => {
      setIsDrawing(false);

      switch (params.drawMode) {
        case Mode.MOVE:

          if (!params.canvasRef) return;
          if (!params.canvasRef.current) return;
          const ctx = getCtx(params.canvasRef.current);
          if (typeof ctx === "undefined") return;

          let movedStrokes: PxlType[] = [];
          //元の選択範囲に該当する部分を削除する
          let canvasStrokes: CurrentStrokeType = getCurrentCanvasStrokes(params.allStrokes)
          let selectAreaStrokes: PxlType[] = getSelectAreaStrokes(canvasStrokes, startCR, endCR);
          for (let i = 0; i < selectAreaStrokes.length; i++) {
            let pxl: PxlType = { color: NaNColor, c: selectAreaStrokes[i].c, r: selectAreaStrokes[i].r, mode: Mode.DRAW };
            // fillPxl(ctx, pxl, params.pxlSize);
            movedStrokes.push(pxl);
          }

          let tmpStrokes: PxlType[] = getMovedStrokes(ctx, canvasStrokes, startCR, endCR, diffCR)
          for (let i = 0; i < tmpStrokes.length; i++) {
            // fillPxl(ctx, tmpStrokes[i], params.pxlSize)
            movedStrokes.push(tmpStrokes[i]);
          }

          params.setAllStrokes({
            strokes: [...params.allStrokes.strokes, { pxl: movedStrokes }]
          });

          setStartCR({ col: startCR.col + diffCR.col, row: startCR.row + diffCR.row })
          setEndCR({ col: endCR.col + diffCR.col, row: endCR.row + diffCR.row })
          setDiffCR({ col: 0, row: 0 });

          break;
        default:

          // 1ストロークの描画が終わった時点で、現在のストローク情報をすべてのストローク情報の最新として保存
          params.setAllStrokes({
            strokes: [...params.allStrokes.strokes, { pxl: uniqueStrokes(currentStroke) }]
          });
          // 現在のストローク情報をクリア
          setCurrentStroke([]);
          break;
      }

    }
    up();
  };

  const mouseWheel: MouseOrTouchEventHandler = (e: any) => {

    // 拡大率算出
    let temp = e.deltaY < 0 ? 1 : -1;
    params.zoomRatio += (0.1 * temp);

    // 拡大率は0.1～5まで
    if (params.zoomRatio < 0) {
      params.zoomRatio = 0.1
    } else if (params.zoomRatio > 5) {
      params.zoomRatio = 5
    }

    params.setTransformOrigin({ x: params.canvasPoint.offsetX, y: params.canvasPoint.offsetY });
    // 小数点第二以下切り捨て
    params.zoomRatio = Math.round(params.zoomRatio * 10) / 10;
    params.setZoomRatio(params.zoomRatio);
  };

  return {
    mouseWheel,
    drawEnd,
    drawMove,
    drawStart,
    currentStroke,
    setIsDrawing,
    setCurrentStroke,
    isDrawing,
    startCR,
    endCR,
    diffCR
  }
};