import React, { useState, useEffect, useRef } from "react";
import { GridCountType } from './gridTypes';
import { HintType } from "./HintTypes";
import { offsetPosition, coordinate, getColRowInfo, ColRow } from "./GetPositionInfo";
import { CursorType } from "./Cursors";
// /** @jsxImportSource @emotion/react */
// import { css } from "@emotion/react";

type Props = {
    grid: GridCountType,// 行数列数 
    zoomRatio: number,
    canvasPoint: coordinate,
    pxlSize: number,
    colHints: HintType[],
    transformOrigin: CursorType,

}
type MouseOrTouchEventHandler<T = Element> = React.EventHandler<
    React.MouseEvent<T> | React.TouchEvent<T>
>;

export default function ColHintsCanvas(params: Props) {
    const [translateY, setTranslateY] = useState<number>(-10);
    const [markList, setMarkList] = useState<ColRow[]>([]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {

        if (!params.colHints) {
            return;
        }
        init_canvas();

        function init_canvas() {
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
            // キャンバスに罫線を描画する
            function drawRule(height: number) {

                // 線の色
                ctx.strokeStyle = "#1e90ff";

                // 線の太さ
                ctx.lineWidth = 2;
                // 点線
                ctx.setLineDash([1, 2]);
                ctx.beginPath();

                // 縦線
                for (let i = 0; i < params.grid.colsCount + 1; i++) {
                    ctx.moveTo((i * params.pxlSize), 0);
                    ctx.lineTo((i * params.pxlSize), height);
                }
                ctx.stroke();

                // 5の倍数は実線にする
                ctx.beginPath();
                ctx.setLineDash([]);
                // 縦線
                for (let i = 0; i < params.grid.colsCount + 1; i++) {
                    if (i % 5 != 0) {
                        continue;
                    }
                    ctx.moveTo((i * params.pxlSize), 0);
                    ctx.lineTo((i * params.pxlSize), height);
                }
                ctx.stroke();

            }
            const drawHint = (ctx: CanvasRenderingContext2D, hint: HintType) => {

                if (!(typeof hint.number === 'number')) {
                    return;
                }

                const colorRGBA = "rgba(" + [0, 0, 0, 1].join(',') + ")";
                ctx.fillStyle = colorRGBA;
                ctx.textAlign = "right";
                ctx.font = `${params.pxlSize - 5}px DotGothic16`;
                ctx.fillText(String(hint.number), hint.c * params.pxlSize + 22, hint.r * params.pxlSize + params.pxlSize - 3, params.pxlSize);
            }
            for (let i = 0; i < params.colHints!.length; i++) {
                drawHint(ctx, params.colHints![i]);
            }
            const rows = params.colHints.map((hint) => {
                return hint.r;
            });
            const height = (Math.max(...rows) + 1) * params.pxlSize;

            setTranslateY(height);
            drawRule(height);
            markList.map(mark => setMark(mark, params.pxlSize));
        }

    }, [params.colHints, params.pxlSize, markList]);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.style.transformOrigin = `${params.canvasPoint.offsetX}px ${params.canvasPoint.offsetY}px`;
            if (params.canvasPoint.offsetX == 0 && params.canvasPoint.offsetY == 0) {
                canvas.style.transformOrigin = `${canvas.width / 2}px ${canvas.height / 2}px`;
            }
            canvas.style.transform = `scale(${params.zoomRatio}) translateY(${-(translateY)}px)`;
        }
    }, [params.zoomRatio, translateY]);

    const setMark = (mark: ColRow, pxlSize: number) => {

        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.beginPath();
        ctx.moveTo(mark.col * pxlSize, mark.row * pxlSize);
        ctx.lineTo(mark.col * pxlSize + pxlSize, mark.row * pxlSize + pxlSize);
        ctx.moveTo(mark.col * pxlSize, mark.row * pxlSize + pxlSize);
        ctx.lineTo(mark.col * pxlSize + pxlSize, mark.row * pxlSize);
        ctx.stroke()
    }

    const drawStart: MouseOrTouchEventHandler = (e) => {

        const down = (coordinate: coordinate) => {
            const crInfo: ColRow = getColRowInfo(coordinate, params.pxlSize);
            //マーク済みならば、マークを除去して再描画
            const result = markList.filter(mark => !(mark.col == crInfo.col && mark.row == crInfo.row));

            //一致するものがあれば数が減っている
            if (markList.length > result.length) {
                setMarkList(result)
            } else {
                setMark(crInfo, params.pxlSize);
                setMarkList([...markList, crInfo])
            }
        };
        down(offsetPosition(e, params.zoomRatio));
    }
    return (
        <>
            <style>
                {`@media print {.colHints{transform:scale(1.0) translateY(${-(translateY)}px) !important;}}`}
            </style>
            <canvas className="colHints" ref={canvasRef} onMouseDown={drawStart} style={{ transformOrigin: `${params.transformOrigin.x}px ${params.transformOrigin.y}px` }} />
        </>

    );
}

