import React, { useState, useEffect, useRef } from "react";
import { GridCountType } from './gridTypes';
import { coordinate } from "../components/GetPositionInfo";
import styles from "./gridCanvas.module.css";

type Props = {
    grid: GridCountType,// 行数列数 
    visible: boolean,
    zoomRatio: number,
    canvasPoint: coordinate,
    pxlSize: number
}

export default function AnswerPxlCanvas(params: Props) {

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

        init_canvas();

        // キャンバスに罫線を描画する
        function drawRule() {

            // 線の色
            ctx.strokeStyle = "#1e90ff";

            // 線の太さ
            ctx.lineWidth = 2;

            // 破線
            if (ctx.setLineDash) {
                ctx.setLineDash([1, 2]);
            }

            ctx.beginPath();

            // 縦線
            for (var i = 0; i < params.grid.colsCount + 1; i++) {
                ctx.moveTo((i * params.pxlSize), 0);
                ctx.lineTo((i * params.pxlSize), canvas.height);
            }

            // 横線
            for (var i = 0; i < params.grid.rowsCount + 1; i++) {
                ctx.moveTo(0, (i * params.pxlSize));
                ctx.lineTo(canvas.width, (i * params.pxlSize));
            }

            ctx.stroke();
        }

        function init_canvas() {
            drawRule();
        }

    }, [params.grid, params.pxlSize]);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.style.display = "none";
            if (params.visible) {
                canvas.style.display = "block";
            }
        }
    }, [params.visible]);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.style.transformOrigin = `${params.canvasPoint.offsetX}px ${params.canvasPoint.offsetY}px`;
            canvas.style.transform = `scale(${params.zoomRatio})`;
        }
    }, [params.zoomRatio]);

    return (
        <>
            <canvas className={styles.eventNone} ref={canvasRef} width={600} height={450} />
        </>

    );
}

