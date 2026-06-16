import { GridCountType } from './gridTypes';
type Props = {
    canvas: HTMLCanvasElement,
    grid: GridCountType,// 行数列数 
    pxlSize: number

}

export default function drawCanvas(params: Props) {

    const ctx = params.canvas.getContext("2d") as CanvasRenderingContext2D;
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
    for (let i = 0; i < params.grid.colsCount + 1; i++) {
        ctx.moveTo((i * params.pxlSize), 0);
        ctx.lineTo((i * params.pxlSize), params.canvas.height);
    }

    // 横線
    for (let i = 0; i < params.grid.rowsCount + 1; i++) {
        ctx.moveTo(0, (i * params.pxlSize));
        ctx.lineTo(params.canvas.width, (i * params.pxlSize));
    }
    ctx.stroke();

    // 5の倍数は実線にする
    ctx.beginPath();
    ctx.setLineDash([]);
    // 縦線
    for (let i = 1; i < params.grid.colsCount; i++) {
        if (i % 5 != 0) {
            continue;
        }
        ctx.moveTo((i * params.pxlSize), 0);
        ctx.lineTo((i * params.pxlSize), params.canvas.height);
    }
    // 横線
    for (let i = 1; i < params.grid.rowsCount; i++) {
        if (i % 5 != 0) {
            continue;
        }
        ctx.moveTo(0, (i * params.pxlSize));
        ctx.lineTo(params.canvas.width, (i * params.pxlSize));
    }
    ctx.stroke();

}