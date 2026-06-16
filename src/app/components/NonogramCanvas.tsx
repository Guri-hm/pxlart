import React, { useState, useEffect, useContext } from "react";
import { RefObject } from "react"
import { coordinate } from "./GetPositionInfo";
import { ColorType, AllStrokesType, PxlType, NonogramAnswerType } from './strokeTypes';
import { GridCountType, getPxlSize, CanvasWrapper } from './gridTypes';
import BaseCanvas from "@/app/components/BaseCanvas"
import useStrokes from "../hooks/useStrokes";
import { AlertColor } from '../components/alertTypes';
import { ModeType, Mode } from "./modeTypes";
import useNonogram from "../hooks/useNonogram";
import { enmStatus } from "./NonogramResultType"
import { MsgContext } from '../context/MsgContext';
import { CursorType } from "./Cursors";
import styles from "./pxlartcanvas.module.css";

type Props = {
    canvasRef: RefObject<HTMLCanvasElement>,
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
    nonogramStrokes: NonogramAnswerType,
    count: number,
    setCount: any,
    wrapperSize: CanvasWrapper | undefined,
    setPxlSize: any,
    setColHints: any,
    setRowHints: any,
    setResultDaialog: any,
    transformOrigin: CursorType,
    setTransformOrigin: any,
    setPickerState: any,
}

type MouseOrTouchEventHandler<T = Element> = React.EventHandler<
    React.MouseEvent<T> | React.TouchEvent<T>
>;

export default function NonogramCanvas(params: Props) {

    const { getBinarizedStrokes, drawAllstroke, getCurrentCanvasStrokes, getCtx, fillPxl, clearCanvas, uniqueStrokes } = useStrokes();
    const { drawStart, drawMove, mouseWheel, currentStroke, setCurrentStroke, setIsDrawing } = BaseCanvas({ canvasRef: params.canvasRef, selectAreaCanvasRef: null, setPickerState: params.setPickerState, grid: params.grid, drawMode: params.drawMode, pxlSize: params.pxlSize, rgba: params.rgba, setCol: params.setCol, setRow: params.setRow, setCanvasPoint: params.setCanvasPoint, setAllStrokes: params.setAllStrokes, allStrokes: params.allStrokes, setZoomRatio: params.setZoomRatio, zoomRatio: params.zoomRatio, canvasPoint: params.canvasPoint, setTransformOrigin: params.setTransformOrigin })
    const { getColHint, getRowHint } = useNonogram();
    const { setMsg } = useContext(MsgContext);

    const leave: MouseOrTouchEventHandler = (e) => {
        drawEnd(e)
    }
    // 描画完了(ノノグラムのみの独自定義)
    const drawEnd: MouseOrTouchEventHandler = (e) => {
        //スクロール無効化
        e.preventDefault();
        const up = () => {
            const reduceTime = (missCount: number) => {
                params.setCount(params.count - 30 * missCount);
            }
            const isMiss = (pxl: PxlType): boolean => {

                const binarizatedStrokes = getBinarizedStrokes(params.nonogramStrokes.strokes, params.nonogramStrokes?.threshold);
                const result = binarizatedStrokes.filter(item => item.c == pxl.c && item.r == pxl.r);
                if (result.length == 0) {
                    return true;
                }
                return false;
            }
            setIsDrawing(false);
            // 1ストロークの描画が終わった時点で、現在のストローク情報をすべてのストローク情報の最新として保存
            const strokes = uniqueStrokes(currentStroke);
            params.setAllStrokes({
                strokes: [...params.allStrokes.strokes, { pxl: strokes }]
            });
            let missCount = 0;
            for (let i = 0; i < strokes.length; i++) {
                const pxl: PxlType = strokes[i];

                if (pxl.mode != Mode.DRAW) return;

                if (isMiss(pxl)) {
                    missCount++;
                    //間違いであれば、×マークに変更
                    const ctx = getCtx(params.canvasRef.current!);
                    pxl.mode = Mode.MARK
                    fillPxl(ctx, pxl, params.pxlSize);
                }
            }

            setCurrentStroke([]);

            if (missCount == 0) return;
            reduceTime(missCount);
            setMsg({ type: AlertColor.warning, message: `ミス！-${30 * missCount}秒`, open: true })
            // 現在のストローク情報をクリア
        }
        up();
    };

    //Nonogramの解答状況を管理
    useEffect(() => {

        const canvasStroke = getCurrentCanvasStrokes(params.allStrokes);
        const drawStrokeWithoutMode = canvasStroke.filter(pxl => pxl?.mode == Mode.DRAW).map(pxl => ({ r: pxl.r, c: pxl.c }));
        const binarizatedStrokes = getBinarizedStrokes(params.nonogramStrokes.strokes, params.nonogramStrokes?.threshold);
        const answerStrokeWithoutMode = binarizatedStrokes.map(pxl => ({ r: pxl.r, c: pxl.c }));
        // const answerStrokeWithoutMode = params.nonogramStrokes.strokes.map(pxl => ({ r: pxl.r, c: pxl.c }));

        const hashSort = (val: any) => {
            // json化して戻すことで、元データの書き換えを防ぐ
            let hash = JSON.parse(JSON.stringify(val));

            // 連想配列処理
            if (typeof hash === "object") {
                var flg = 0;
                for (var i in hash) {
                    if (typeof hash[i] === "object") {
                        hash[i] = JSON.stringify(hashSort(hash[i]));
                    }
                    flg++;
                }
                if (flg <= 1) {
                    return JSON.stringify(hash)
                }
                if (typeof hash.length === "undefined") {
                    let keys = Object.keys(hash).sort();
                    let newHash: any = {};
                    for (let i = 0; i < keys.length; i++) {
                        newHash[keys[i]] = hash[keys[i]];
                    }
                    return newHash;
                }
                else {
                    hash.sort(function (a: any, b: any) {
                        if (a < b) return -1;
                        if (a > b) return 1;
                        return 0;
                    });
                    return hash;
                }
            }
            // その他タイプはそのまま返す
            else {
                return hash;
            }
        }
        //連想配列の比較はソート後にJSON化
        if (JSON.stringify(hashSort(drawStrokeWithoutMode)) == JSON.stringify(hashSort(answerStrokeWithoutMode))) {
            clearCanvas(params.canvasRef)
            drawAllstroke(params.canvasRef, { strokes: [{ pxl: params.nonogramStrokes.strokes }] }, params.pxlSize);
            params.setResultDaialog({ open: true, result: enmStatus.SUCCESS });
        }
    }, [params.allStrokes]);

    useEffect(() => {

        if (!params.wrapperSize) return;

        //ストロークはカラー状態で保存しているため2値化する
        const binarizedStrokes = getBinarizedStrokes(params.nonogramStrokes.strokes, params.nonogramStrokes.threshold)
        //下はノノグラム用のロジック
        const colHints = getColHint(binarizedStrokes, params.grid);
        const hintRows = colHints.map((hint) => {
            return hint.r;
        });
        const rowHints = getRowHint(binarizedStrokes, params.grid);
        const hintCols = rowHints.map((hint) => {
            return hint.c;
        });
        const defaultPxlSize = 25;    // 表示倍率
        const mobileWidth = 600; //ブレークポイント
        // グリッドのマス目の大きさを計算
        // let tmpPxlSize: number = getPxlSize(params.wrapperSize, { rowsCount: params.grid.rowsCount + (Math.max(...hintRows) + 1), colsCount: params.grid.colsCount + (Math.max(...hintCols) + 1) });
        //画面幅が狭い場合は初期倍率を変更する
        if (params.wrapperSize.width < mobileWidth) {
            let tmpColRatio = params.wrapperSize.width / ((params.grid.colsCount + (Math.max(...hintCols) + 1)) * params.pxlSize)
            let tmpRowRatio = params.wrapperSize.height / ((params.grid.rowsCount + (Math.max(...hintRows) + 1)) * params.pxlSize)
            params.setZoomRatio(Math.min(tmpColRatio, tmpRowRatio))
        }
        params.setPxlSize(defaultPxlSize);
        // params.setPxlSize(getPxlSize(params.wrapperSize, { rowsCount: params.grid.rowsCount + (Math.max(...hintRows) + 1) * 2, colsCount: params.grid.colsCount + (Math.max(...hintCols) + 1) * 2 }));

        params.setColHints(colHints);
        params.setRowHints(rowHints);

    }, [params.grid, params.wrapperSize]);

    const Cursors = (drawMode: ModeType) => {

        let url;
        switch (drawMode) {
            case Mode.ERASE:
                url = styles.erase
                break;
            case Mode.DRAW:
                url = styles.pen
                break;
            case Mode.MARK:
                url = styles.mark
                break;
        }
        return url;
    }

    return (

        <>
            <style>
                {`@media print {.nonogramcanvas{transform:scale(1.0) !important;}}`}
            </style>
            <canvas ref={params.canvasRef}
                onMouseDown={drawStart}
                onMouseMove={drawMove}
                onMouseUp={drawEnd}
                onTouchStart={drawStart}
                onTouchMove={drawMove}
                onTouchEnd={drawEnd}
                onMouseLeave={leave}
                onWheel={mouseWheel}
                style={{ transformOrigin: `${params.transformOrigin.x}px ${params.transformOrigin.y}px` }}
                className={`${Cursors(params.drawMode)} nonogramcanvas`}
            />
        </>
    );
};

