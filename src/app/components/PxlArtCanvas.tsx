import React, { useEffect, useRef } from "react";
import { RefObject } from "react"
import { coordinate } from "./GetPositionInfo";
import { ColorType, AllStrokesType } from './strokeTypes';
import { ModeType, Mode } from "./modeTypes";
import BaseCanvas from "@/app/components/BaseCanvas"
import { GridCountType, getPxlSize, CanvasWrapper } from './gridTypes';
import { CursorType } from "./Cursors";
import styles from "./pxlartcanvas.module.css";
import SelectAreaCanvas from './SelectAreaCanvas';

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
    wrapperSize: CanvasWrapper | undefined,
    setPxlSize: any,
    transformOrigin: CursorType,
    setTransformOrigin: any,
    setPickerState: any,
    col: number,
    row: number,
}
type MouseOrTouchEventHandler<T = Element> = React.EventHandler<
    React.MouseEvent<T> | React.TouchEvent<T>
>;
export default function PxlArtCanvas(params: Props) {

    const selectAreaCanvasRef = useRef<HTMLCanvasElement>(null);
    const { drawStart, drawMove, drawEnd, mouseWheel, isDrawing, startCR, endCR, diffCR } = BaseCanvas({ canvasRef: params.canvasRef, selectAreaCanvasRef: selectAreaCanvasRef, grid: params.grid, drawMode: params.drawMode, pxlSize: params.pxlSize, rgba: params.rgba, setCol: params.setCol, setRow: params.setRow, setCanvasPoint: params.setCanvasPoint, setAllStrokes: params.setAllStrokes, allStrokes: params.allStrokes, setZoomRatio: params.setZoomRatio, zoomRatio: params.zoomRatio, canvasPoint: params.canvasPoint, setTransformOrigin: params.setTransformOrigin, setPickerState: params.setPickerState })

    useEffect(() => {

        if (!params.wrapperSize) return;
        params.setPxlSize(getPxlSize(params.wrapperSize, params.grid));
        return;

    }, [params.grid, params.wrapperSize]);

    const leave: MouseOrTouchEventHandler = (e) => {
        if (isDrawing) {
            drawEnd(e)
        }
        params.setCanvasPoint({ offsetX: 0, offsetY: 0 });
        params.setCol(0);
        params.setRow(0);

    }

    const Cursors = (drawMode: ModeType) => {

        let url;
        switch (drawMode) {
            case Mode.ERASE:
                url = styles.erase
                break;
            case Mode.DRAW:
            case Mode.MARK:
                url = styles.pen
                break;
            case Mode.FILL:
                url = styles.fill
                break;
            case Mode.SPUIT:
                url = styles.spuit
                break;
        }
        return url;
    }

    return (

        <>
            <canvas ref={params.canvasRef} width={600} height={450}
                onMouseDown={drawStart}
                onMouseMove={drawMove}
                onMouseUp={drawEnd}
                onTouchStart={drawStart}
                onTouchMove={drawMove}
                onTouchEnd={drawEnd}
                onMouseLeave={leave}
                onWheel={mouseWheel}
                style={{ transformOrigin: `${params.transformOrigin.x}px ${params.transformOrigin.y}px` }}
                className={Cursors(params.drawMode)}
            />
            {
                params.drawMode === Mode.SELECT || params.drawMode === Mode.MOVE ?
                    <SelectAreaCanvas setCanvasPoint={params.setCanvasPoint} setCol={params.setCol} setRow={params.setRow} grid={params.grid} drawMode={params.drawMode} pxlSize={params.pxlSize} allStrokes={params.allStrokes} canvasPoint={params.canvasPoint} zoomRatio={params.zoomRatio} transformOrigin={params.transformOrigin} diffCR={diffCR} startCR={startCR} endCR={endCR} drawStart={drawStart} drawMove={drawMove} drawEnd={drawEnd} isDrawing={isDrawing} selectAreaCanvasRef={selectAreaCanvasRef} col={params.col} row={params.row} mouseWheel={mouseWheel}></SelectAreaCanvas>
                    : null
            }
        </>

    );

};

