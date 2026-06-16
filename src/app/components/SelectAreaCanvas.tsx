import React, { useEffect, useRef, useState } from "react";
import styles from "./sacanvas.module.css";
import { ColRow, Corner, CornerType, Direction, DirectionType, coordinate, getCornerCoordinate, getStartCornerType, getTwoPointsDistance } from "./GetPositionInfo";
import { RefObject } from "react"
import { AllStrokesType, CurrentStrokeType, PxlType } from './strokeTypes';
import { ModeType, Mode } from "./modeTypes";
import { GridCountType } from './gridTypes';
import { CursorType } from "./Cursors";
import useStrokes from "../hooks/useStrokes";

type Props = {
    selectAreaCanvasRef: RefObject<HTMLCanvasElement>, //範囲選択
    grid: GridCountType,// キャンバス行数列数
    drawMode: ModeType,
    pxlSize: number,
    allStrokes: AllStrokesType,
    zoomRatio: number,
    canvasPoint: coordinate,
    transformOrigin: CursorType,
    startCR: ColRow,
    endCR: ColRow,
    drawStart: any,
    drawMove: any,
    drawEnd: any,
    diffCR: ColRow,
    isDrawing: boolean,
    setCol: any,
    setRow: any,
    setCanvasPoint: any,
    col: number,
    row: number,
    mouseWheel: any
}
type MouseOrTouchEventHandler<T = Element> = React.EventHandler<
    React.MouseEvent<T> | React.TouchEvent<T>
>;

export default function SelectAreaCanvas(params: Props) {

    const [isInSelectArea, setIsIn] = useState<boolean>(false);

    useEffect(() => {
        if (!params.selectAreaCanvasRef.current) {
            throw new Error("error");
        }
        const canvas = params.selectAreaCanvasRef.current;

        canvas.width = params.grid.colsCount * params.pxlSize;
        canvas.height = params.grid.rowsCount * params.pxlSize;

        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        if (!ctx) {
            throw new Error("error");
        }

    }, [params.grid, params.pxlSize]);

    const leave: MouseOrTouchEventHandler = (e) => {
        if (params.isDrawing) {
            params.drawEnd(e)
        }
        params.setCanvasPoint({ offsetX: 0, offsetY: 0 });
        params.setCol(0);
        params.setRow(0);
    }


    useEffect(() => {
        const isIn = (drawMode: ModeType): boolean => {

            switch (drawMode) {

                case Mode.MOVE:
                    let currentStartCR: ColRow = { col: params.startCR.col + params.diffCR.col, row: params.startCR.row + params.diffCR.row };
                    let currentEndCR: ColRow = { col: params.endCR.col + params.diffCR.col, row: params.endCR.row + params.diffCR.row };

                    // col と row は最小値を1で管理しているので、比較対象を+１する
                    let colRange = { max: Math.max(currentStartCR.col, currentEndCR.col) + 1, min: Math.min(currentStartCR.col, currentEndCR.col) + 1 }
                    let rowRange = { max: Math.max(currentStartCR.row, currentEndCR.row) + 1, min: Math.min(currentStartCR.row, currentEndCR.row) + 1 }
                    if (!(params.col >= colRange.min && params.col <= colRange.max)) return false;
                    if (!(params.row >= rowRange.min && params.row <= rowRange.max)) return false;
                    return true;
            }
            return false;
        }
        setIsIn(isIn(params.drawMode))

    }, [params.col, params.row]);

    return (
        <>
            <canvas className={`${styles.cnvsSelectAreaCanvas} ${isInSelectArea ? styles.move : ''}`} ref={params.selectAreaCanvasRef} style={{ transformOrigin: `${params.transformOrigin.x}px ${params.transformOrigin.y}px`, transform: `scale(${params.zoomRatio})` }} onMouseDown={params.drawStart}
                onMouseMove={params.drawMove}
                onMouseUp={params.drawEnd}
                onTouchStart={params.drawStart}
                onTouchMove={params.drawMove}
                onTouchEnd={params.drawEnd}
                onMouseLeave={leave}
                onWheel={params.mouseWheel}
            />
        </>

    );
}

