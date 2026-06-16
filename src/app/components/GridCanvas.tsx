import React, { useState, useEffect, useRef } from "react";
import { GridCountType } from './gridTypes';
import drawGrid from './drawGrid';
import { coordinate } from "./GetPositionInfo";
import { CursorType } from "./Cursors";
import styles from "./gridCanvas.module.css";

type Props = {
    grid: GridCountType,// 行数列数 
    visible: boolean,
    zoomRatio: number,
    canvasPoint: coordinate,
    pxlSize: number,
    transformOrigin: CursorType,
}

export default function GridCanvas(params: Props) {

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

        //グリッド追加
        drawGrid({ canvas: canvas, grid: params.grid, pxlSize: params.pxlSize });

    }, [params.grid, params.pxlSize]);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        canvas.style.display = "none";
        if (params.visible) {
            canvas.style.display = "block";
        }
    }, [params.visible]);

    return (
        <>
            <canvas className={styles.gridCanvas} ref={canvasRef} style={{ transformOrigin: `${params.transformOrigin.x}px ${params.transformOrigin.y}px`, transform: `scale(${params.zoomRatio})` }} />
        </>

    );
}

