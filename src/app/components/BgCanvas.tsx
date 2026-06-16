import React, { useEffect, useRef } from "react";
import { GridCountType } from './gridTypes';
import styles from "./bgcanvas.module.css";
import { coordinate } from "./GetPositionInfo";
import { CursorType } from "./Cursors";

type Props = {
    grid: GridCountType,// 行数列数 
    zoomRatio: number,
    canvasPoint: coordinate,
    pxlSize: number,
    bgColor: string | null,
    transformOrigin: CursorType,

}

export default function BgCanvas(params: Props) {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (!canvasRef.current) {
            throw new Error("error");
        }
        const canvas = canvasRef.current;

        canvas.width = params.grid.colsCount * params.pxlSize;
        canvas.height = params.grid.rowsCount * params.pxlSize;

        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        if (!ctx) {
            throw new Error("error");
        }

    }, [params.grid, params.pxlSize]);

    let className = styles.cnvsBgTrans
    if (params.bgColor == "white") {
        className = styles.cnvsBgWhite
    }
    return (
        <>
            <style>
                {`@media print {.bgcanvas{transform:scale(1.0) !important;}}`}
            </style>
            <canvas className={`${className} bgcanvas`} ref={canvasRef} style={{ transformOrigin: `${params.transformOrigin.x}px ${params.transformOrigin.y}px`, transform: `scale(${params.zoomRatio})` }} />
        </>

    );
}

