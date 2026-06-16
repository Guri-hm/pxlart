import React, { useState, useEffect, useRef } from "react";

type Props = {
    canvas_width: number,// キャンバス横幅 
    canvas_height: number,// キャンバス縦幅 
    pxlSize: number,
    zoomRatio: number,
    pointX: number,
    pointY: number,
}

export default function PointerCanvas(params: Props) {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (!canvasRef.current) {
            throw new Error("error");
        }
        const canvas = canvasRef.current;

        canvas.width = params.canvas_width * params.pxlSize;
        canvas.height = params.canvas_height * params.pxlSize;

        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        if (!ctx) {
            throw new Error("error");
        }

    }, [params.canvas_width, params.canvas_height, params.pxlSize]);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.style.transformOrigin = `${params.pointX}px ${params.pointY}px`;
            canvas.style.transform = `scale(${params.zoomRatio})`;
        }
    }, [params.zoomRatio]);


    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d") as CanvasRenderingContext2D;
            if (!ctx) {
                throw new Error("error");
            }

            ctx.clearRect(0, 0, params.canvas_width * params.pxlSize, params.canvas_height * params.pxlSize)

            // モード：消しゴムのときは白固定
            ctx.strokeStyle = "rgba(0, 0, 0, 1)";

            ctx.lineWidth = 10; // 太さ
            ctx.lineCap = "round"; // 円

            ctx.beginPath();
            ctx.moveTo(params.pointX, params.pointY);
            ctx.lineTo(params.pointX, params.pointY); // 開始座標と終了座標を同じ
            ctx.stroke(); // 描画
            ctx.closePath();
        }
    }, [params.pointX, params.pointY]);

    return (
        <>
            <canvas id="cnvsBg" ref={canvasRef} width={600} height={450} />
        </>

    );
}

