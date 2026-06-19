import { ColorType, PxlType, CurrentStrokeType, AllStrokesType, BinarizationParamsType, RowColType } from '@/app/components/strokeTypes';
import Utils from '../utils/utils';
import { RefObject } from 'react';
import { Mode } from '../components/modeTypes'
import drawGrid from '../components/drawGrid';
import { getHex } from '../components/rgba';
import { GridCountType } from '../components/gridTypes';
import { ColRow } from '../components/GetPositionInfo';

export const NaNColor: ColorType = { r: NaN, g: NaN, b: NaN, a: NaN };
export const blackColor: ColorType = ({ r: 0, g: 0, b: 0, a: 1, });
export const whiteColor: ColorType = ({ r: 255, g: 255, b: 255, a: 1, });
export const Trasparent: ColorType = ({ r: 0, g: 0, b: 0, a: 0, });

export default function useStrokes() {

    const NullColor = { r: null, g: null, b: null, a: null };
    const { objectEquals } = Utils();

    const getCanvas = (canvasRef: RefObject<HTMLCanvasElement> | undefined | null): HTMLCanvasElement => {

        if (canvasRef == null) return document.createElement('canvas');

        //確実にキャンバスを返し、undefinedによるエラーを回避
        if (!canvasRef.current) return document.createElement('canvas');
        return canvasRef.current;
    }
    const getCtx = (canvasRef: RefObject<HTMLCanvasElement> | HTMLCanvasElement | undefined | null): CanvasRenderingContext2D => {

        let canvas: HTMLCanvasElement;
        if (!(canvasRef instanceof HTMLCanvasElement)) {
            canvas = getCanvas(canvasRef);
        } else {
            canvas = canvasRef;
        }
        const ctx = canvas.getContext("2d", {
            willReadFrequently: true //処理高速?
        }) as CanvasRenderingContext2D;

        return ctx;
    }

    const clearCanvas = (canvasRef: RefObject<HTMLCanvasElement> | undefined | null) => {
        const canvas = getCanvas(canvasRef);
        const ctx = getCtx(canvas);

        // 一度描画をすべてクリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    const createInterpolatedPosition = (id: number, numDivision: number, startPxl: PxlType, endPxl: PxlType): RowColType => {
        return {
            c: Math.floor(startPxl.c + id * (endPxl.c - startPxl.c) / numDivision),
            r: Math.floor(startPxl.r + id * (endPxl.r - startPxl.r) / numDivision),
        };
    }

    const getCanvasDataUrl = (originCanvas: HTMLCanvasElement): any => {
        return originCanvas.toDataURL();
    }

    const getBinarizedStrokes = (strokes: CurrentStrokeType, threshold = 180): CurrentStrokeType => {

        const replaceToBinarizedStroke = (pxl: PxlType): PxlType | undefined => {
            if (typeof pxl.color === 'undefined') {
                return undefined;
            }
            if (objectEquals(pxl.color, NaNColor)) {
                return undefined;
            }

            const lightness = 0.299 * pxl.color.r + 0.587 * pxl.color.g + 0.144 * pxl.color.b > threshold ? 255 : 0;
            //軽量化のため、白いピクセルは格納しない
            if (lightness == 255) {
                return undefined;
            }
            pxl.color = { r: lightness, g: lightness, b: lightness, a: 1 };
            return pxl;
        }
        //undefinedを除外
        //参照先が同じだと色が置き換わるためディープコピー
        let pxls = strokes
            .map(value => replaceToBinarizedStroke({ ...value }))
            .filter(
                (item): item is Exclude<typeof item, undefined> => item !== undefined
            );

        return pxls;
    }
    const getBinarizedStrokesWithWhite = (strokes: CurrentStrokeType, threshold = 180, grid: GridCountType): CurrentStrokeType => {

        const replaceToBinarizedStroke = (pxl: PxlType): PxlType | undefined => {
            if (typeof pxl.color === 'undefined') {
                pxl.color = whiteColor;
                return pxl;
            }
            if (objectEquals(pxl.color, NaNColor)) {
                pxl.color = whiteColor;
                return pxl;
            }

            const lightness = 0.299 * pxl.color.r + 0.587 * pxl.color.g + 0.144 * pxl.color.b > threshold ? 255 : 0;
            if (lightness == 255) {
                pxl.color = whiteColor;
                return pxl;
            }
            pxl.color = { r: lightness, g: lightness, b: lightness, a: 1 };
            return pxl;
        }
        //undefinedを除外
        //参照先が同じだと色が置き換わるためディープコピー
        let pxls = strokes
            .map(value => replaceToBinarizedStroke({ ...value }))
            .filter(
                (item): item is Exclude<typeof item, undefined> => item !== undefined
            );

        for (let i = 0; i < grid.rowsCount; i++) {
            for (let j = 0; j < grid.colsCount; j++) {
                let result: PxlType[] = pxls.filter(item => item.r == i && item.c == j);
                if (result.length == 0) {
                    let tmpPxl: PxlType = {
                        c: j,
                        r: i,
                        color: whiteColor,
                        mode: Mode.DRAW
                    }
                    pxls.push(tmpPxl);
                    continue;
                }
            }
        }

        return pxls;
    }

    const fillPxl = (ctx: CanvasRenderingContext2D, pxl: PxlType, pxlSize: number) => {

        if (!pxl) return;
        if (typeof pxl.color === 'undefined') {
            pxl.color = NaNColor;
        }

        //対象箇所を事前にクリア
        ctx.clearRect(pxl.c * pxlSize, pxl.r * pxlSize,
            pxlSize, pxlSize);

        //消しゴムの場合(NaNで判別)は削除でここで終了
        if (pxl.mode == Mode.ERASE || objectEquals(pxl.color, NaNColor) || objectEquals(pxl.color, NullColor)) {
            return;
        }

        let colorRGBA = "rgba(" + [pxl.color.r, pxl.color.g, pxl.color.b, pxl.color.a].join(',') + ")";
        switch (pxl.mode) {
            case Mode.DRAW:
                ctx.fillStyle = colorRGBA;
                ctx.fillRect(pxl.c * pxlSize, pxl.r * pxlSize,
                    pxlSize, pxlSize);
                break;
            case Mode.MARK:
                ctx.strokeStyle = colorRGBA;
                ctx.beginPath();
                ctx.moveTo(pxl.c * pxlSize, pxl.r * pxlSize);
                ctx.lineTo(pxl.c * pxlSize + pxlSize, pxl.r * pxlSize + pxlSize);
                ctx.moveTo(pxl.c * pxlSize, pxl.r * pxlSize + pxlSize);
                ctx.lineTo(pxl.c * pxlSize + pxlSize, pxl.r * pxlSize);
                ctx.stroke()
                return;

            default:
                break;
        }

    }


    const getPxlColor = (ctx: CanvasRenderingContext2D, rc: RowColType, pxlSize: number): ColorType => {
        const getAverageColor = (data: Uint8ClampedArray) => {
            let n = 0;
            let averageColor = { r: 0, g: 0, b: 0, a: 0 };
            /* canvasの左上から[r,g,b,a]の配列を調査 */
            for (let i = 0, len = data.length; i < len; i += 4) {
                // if (data[i + 3] > 0) {
                averageColor.r += data[i];
                averageColor.g += data[i + 1];
                averageColor.b += data[i + 2];
                averageColor.a += data[i + 3] / 255; //描画時にアルファ値100で設定すると、getImageData後に255で取得される
                n++;
                // }
            }

            /* RGBの平均計算 */
            averageColor.r = Math.round(averageColor.r / n);
            averageColor.g = Math.round(averageColor.g / n);
            averageColor.b = Math.round(averageColor.b / n);
            averageColor.a = averageColor.a * 100;
            averageColor.a = Math.round(averageColor.a / n);
            averageColor.a = averageColor.a / 100;

            return averageColor;
        }

        if (typeof ctx === "undefined") return { r: NaN, g: NaN, b: NaN, a: NaN };

        //正方形の中心を1px取得
        //正方形全体を取得すると，隣接するエリアの色も含まれてしまう
        const imagedata = ctx.getImageData(rc.c * pxlSize + pxlSize / 2, rc.r * pxlSize + pxlSize / 2,
            1, 1);
        const targetColor = getAverageColor(imagedata.data);
        return targetColor;
    }

    //キャンバスの塗り状況からストロークを作成
    const createCanvasStrokesFromCanvas = (originalCanvas: HTMLCanvasElement, pxlSize: number, grid: GridCountType): CurrentStrokeType => {
        let pxls: PxlType[]
            = [];
        let tmpPxls: PxlType[]
            = [];
        let shiftNum = 0;
        let isShifted = true;
        for (let i = 0; i < grid.colsCount; i++) {
            tmpPxls = [];
            for (let j = 0; j < grid.rowsCount; j++) {
                let tmpPxl: PxlType = {
                    c: i - shiftNum, //追加しなかった列の分だけ列番号を左にシフトさせる
                    r: j,
                    color: getPxlColor(getCtx(originalCanvas), { c: i, r: j }, pxlSize),
                    mode: Mode.DRAW
                }
                //軽量化のために塗りがない場所は保存しない
                // NaNColor (ctxが未定義) と透明ピクセル (a===0, 未描画) は除外する
                if (objectEquals(tmpPxl.color, NaNColor) || (tmpPxl.color !== undefined && tmpPxl.color.a === 0)) {
                    continue;
                }
                tmpPxls.push(tmpPxl);
            }
            if (tmpPxls.length == 0) {
                // 塗りが0の行は追加しない
                // 塗りが現れたら、シフトを停止する
                isShifted && shiftNum++;
                continue;
            }
            isShifted = false;
            pxls = pxls.concat(tmpPxls);
        }
        return pxls;
    }

    const createCanvasAllStrokesFromCanvas = (originalCanvas: HTMLCanvasElement, pxlSize: number, grid: GridCountType): CurrentStrokeType => {
        const ctx = getCtx(originalCanvas);
        let pxls: PxlType[]
            = [];
        let tmpPxls: PxlType[]
            = [];
        for (let i = 0; i < grid.colsCount; i++) {
            tmpPxls = [];
            for (let j = 0; j < grid.rowsCount; j++) {
                let tmpPxl: PxlType = {
                    c: i,
                    r: j,
                    color: getPxlColor(ctx, { c: i, r: j }, pxlSize),
                    mode: Mode.DRAW
                }
                if (objectEquals(tmpPxl.color, Trasparent)) {
                    tmpPxl.color = { r: 255, g: 255, b: 255, a: 1 };
                }
                if (objectEquals(tmpPxl.color, NaNColor)) {
                    tmpPxl.color = { r: 255, g: 255, b: 255, a: 1 };
                }
                tmpPxls.push(tmpPxl);
            }
            pxls = pxls.concat(tmpPxls);
        }
        return pxls;
    }

    const getBinarizationParams = (canvasRef: RefObject<HTMLCanvasElement>, pxlSize: number, grid: GridCountType, threshold = 180): BinarizationParamsType => {
        const canvas = getCanvas(canvasRef);
        const strokes = createCanvasStrokesFromCanvas(canvas, pxlSize, grid);
        const params: BinarizationParamsType = { strokes: strokes, threshold: threshold };
        return params;
    }

    const trialDraw = (originalCanvas: HTMLCanvasElement, strokes: CurrentStrokeType, pxlSize: number) => {

        //作成元のキャンバスと同サイズで作成
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = originalCanvas.width;
        tmpCanvas.height = originalCanvas.height;

        const ctx = tmpCanvas.getContext("2d", {
            willReadFrequently: true //処理高速?
        }) as CanvasRenderingContext2D;

        for (let i = 0; i < strokes.length; i += 1) {
            fillPxl(ctx, strokes[i], pxlSize)
        }

        return tmpCanvas;
    }

    const uniqueStrokes = (strokes: CurrentStrokeType) => {
        let uniqueStrokes: PxlType[] = [];

        for (let i = 0; i < strokes.length; i++) {
            let result = uniqueStrokes.filter(item => item.r == strokes[i].r && item.c == strokes[i].c);
            if (result.length > 0) continue;
            uniqueStrokes.push(strokes[i]);
        }
        return uniqueStrokes;
    }
    const getSelectAreaStrokes = (strokes: CurrentStrokeType, startCR: ColRow, endCR: ColRow): PxlType[] => {
        let colRange = { max: Math.max(startCR.col, endCR.col), min: Math.min(startCR.col, endCR.col) }
        let rowRange = { max: Math.max(startCR.row, endCR.row), min: Math.min(startCR.row, endCR.row) }

        let selectAreaStrokes: PxlType[] = [];
        for (let i = 0; i < strokes.length; i++) {
            if (strokes[i].c < colRange.min || strokes[i].c > colRange.max) continue;
            if (strokes[i].r < rowRange.min || strokes[i].r > rowRange.max) continue;
            selectAreaStrokes.push(strokes[i]);

        }
        return selectAreaStrokes;
    }

    const getMovedStrokes = (ctx: CanvasRenderingContext2D, strokes: CurrentStrokeType, startCR: ColRow, endCR: ColRow, diffCR: ColRow): PxlType[] => {

        let movesStrokes: PxlType[] = [];
        let colRange = { max: Math.max(startCR.col, endCR.col), min: Math.min(startCR.col, endCR.col) }
        let rowRange = { max: Math.max(startCR.row, endCR.row), min: Math.min(startCR.row, endCR.row) }

        for (let i = 0; i < strokes.length; i++) {
            if (strokes[i].c < colRange.min || strokes[i].c > colRange.max) continue;
            if (strokes[i].r < rowRange.min || strokes[i].r > rowRange.max) continue;
            let ajustedStroke: PxlType = { c: strokes[i].c + diffCR.col, r: strokes[i].r + diffCR.row, color: strokes[i].color, mode: strokes[i].mode }
            movesStrokes.push(ajustedStroke)
        }
        return movesStrokes;
    }

    const getStrokesImgUrl = (canvasRef: RefObject<HTMLCanvasElement>, strokes: CurrentStrokeType, pxlSize: number): string | null => {

        const canvas = getCanvas(canvasRef);
        const trialCanvas = trialDraw(canvas, strokes, pxlSize)
        return trialCanvas.toDataURL();
    }

    const getBinarizedImgUrl = (canvasRef: RefObject<HTMLCanvasElement>, threshold = 180, pxlSize: number, grid: GridCountType, allStrokes: AllStrokesType): string | null => {

        const canvas = getCanvas(canvasRef);
        //2値化
        const getBinarizedCanvas = (originalCanvas: HTMLCanvasElement, threshold = 180, pxlSize: number, grid: GridCountType): HTMLCanvasElement => {

            // const canvasStrokes = createCanvasStrokesFromCanvas(originalCanvas, pxlSize, grid);
            const canvasStrokes = getCurrentCanvasStrokes(allStrokes);

            // 2値化したストロークを取得
            const binarizedStrokes = getBinarizedStrokes(canvasStrokes, threshold)

            const canvas = trialDraw(originalCanvas, binarizedStrokes, pxlSize)
            //グリッド追加
            drawGrid({ canvas: canvas, grid: grid, pxlSize: pxlSize });
            return canvas;
        }
        const binarizedCanvas = getBinarizedCanvas(canvas, threshold, pxlSize, grid);
        return binarizedCanvas.toDataURL();

    }

    const binarize = (canvasRef: RefObject<HTMLCanvasElement>, threshold = 180, pxlSize: number, grid: GridCountType, allStrokes: AllStrokesType) => {

        const canvas = getCanvas(canvasRef);
        // const canvasStrokes = getCurrentCanvasStrokes(allStrokes);
        const canvasStrokes = createCanvasAllStrokesFromCanvas(canvas, pxlSize, grid);
        // 2値化したストロークを取得
        const binarizedStrokes = getBinarizedStrokesWithWhite(canvasStrokes, threshold, grid)
        const strokes: AllStrokesType = { strokes: [{ pxl: binarizedStrokes }] }
        // clearCanvas(canvasRef);
        drawAllstroke(canvas, strokes, pxlSize)
        return binarizedStrokes;
    }



    const getGridForStrokes = (strokes: CurrentStrokeType) => {
        const cols = strokes.map((pxl) => {
            return pxl.c;
        });
        const rows = strokes.map((pxl) => {
            return pxl.r;
        });
        //最低値は4とする
        cols.push(4);
        rows.push(4);
        //行数、列数が0から始まるので1下駄をはかせる
        return { rowsCount: Math.max(...rows) + 1, colsCount: Math.max(...cols) + 1 }
    }
    // const getGridForNonogram = (strokes: CurrentStrokeType, threshold: number): GridCountType => {
    //     //ストロークはカラー状態で保存しているため2値化する
    //     const binarizedStrokes = getBinarizedStrokes(strokes, threshold)

    //     const cols = binarizedStrokes.map((pxl) => {
    //         return pxl.c;
    //     });
    //     const rows = binarizedStrokes.map((pxl) => {
    //         return pxl.r;
    //     });
    //     //最低値は4とする
    //     cols.push(4);
    //     rows.push(4);
    //     //行数、列数が0から始まるので1下駄をはかせる
    //     return { rowsCount: Math.max(...rows) + 1, colsCount: Math.max(...cols) + 1 }
    // }
    function timeout(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const fillPxls = async (ctx: CanvasRenderingContext2D, paintColor: ColorType, pxl: PxlType, pxlSize: number, grid: GridCountType, timeoutMs: number): Promise<PxlType[]> => {

        const pushVerticallyAdjoiningPxl = (ctx: CanvasRenderingContext2D, paintColor: ColorType, basePxl: PxlType, pxlSize: number, grid: GridCountType, startPointColor: ColorType, buffer: PxlType[]) => {

            if (basePxl.r + 1 < grid.rowsCount) {
                let targetPxl: PxlType = {
                    c: basePxl.c,
                    r: basePxl.r + 1,
                    color: getPxlColor(ctx, { c: basePxl.c, r: basePxl.r + 1 }, pxlSize),
                    mode: Mode.DRAW
                }
                if (targetPxl.color) {
                    // console.log("下")
                    // console.log(`列:${targetPxl.c} 行:${targetPxl.r}`)
                    // console.log(`比較：${targetPxl.color?.r}, ${targetPxl.color?.g}, ${targetPxl.color?.b}, ${targetPxl.color?.a}`)
                    if (objectEquals(targetPxl.color, startPointColor)) {
                        //同色の透明度が違う色の場合、アルファ値は高い方が優先されるため、条件付しないと無限ループ
                        if (targetPxl.color.a >= startPointColor.a) {
                            buffer.push(targetPxl)
                        }
                    }
                }
            }

            if (basePxl.r - 1 >= 0) {

                let targetPxl: PxlType = {
                    c: basePxl.c,
                    r: basePxl.r - 1,
                    color: getPxlColor(ctx, { c: basePxl.c, r: basePxl.r - 1 }, pxlSize),
                    mode: Mode.DRAW
                }
                if (targetPxl.color) {
                    // console.log("上")
                    // console.log(`列:${targetPxl.c} 行:${targetPxl.r}`)
                    // console.log(`比較：${targetPxl.color?.r}, ${targetPxl.color?.g}, ${targetPxl.color?.b}, ${targetPxl.color?.a}`)
                    if (objectEquals(targetPxl.color, startPointColor)) {
                        //同色の透明度が違う色の場合、アルファ値は高い方が優先されるため、条件付しないと無限ループ
                        if (targetPxl.color.a >= startPointColor.a) {
                            buffer.push(targetPxl)
                        }
                    }
                }
            }

        }

        //塗り始めのピクセルの色
        //この色と周囲のピクセルの色を比較し、同一であれば塗り対象
        const startPointColor = getPxlColor(ctx, { c: pxl.c, r: pxl.r }, pxlSize);
        const strokes: PxlType[] = [];
        const buffer: PxlType[] = [];
        buffer.push(pxl)
        // console.log(`塗る色：${paintColor.r}, ${paintColor.g}, ${paintColor.b}, ${paintColor.a}`)
        // console.log(`塗りはじめの色：${startPointColor.r}, ${startPointColor.g}, ${startPointColor.b}, ${startPointColor.a}`)

        //塗り始めの場所の色と塗る色が一致する場合は処理しない
        if (objectEquals(paintColor, startPointColor)) {
            // console.log(`処理しない`)
            return [];
        }

        const startTime = Date.now();
        let loopCounter = 0;

        while (buffer.length > 0) {

            //as をつけないとundefined型の可能性を指摘する警告がでる
            const target: PxlType = buffer.pop() as PxlType;

            let leftX = target.c;
            while (leftX >= 0) {

                let tmpPxl: PxlType = {
                    c: leftX,
                    r: target.r,
                    color: getPxlColor(ctx, { c: leftX, r: target.r }, pxlSize),
                    mode: Mode.DRAW
                }

                // console.log("左")
                // console.log(`列:${tmpPxl.c} 行:${tmpPxl.r}`)
                // console.log(`比較：${tmpPxl.color?.r}, ${tmpPxl.color?.g}, ${tmpPxl.color?.b}, ${tmpPxl.color?.a}`)
                //ピクセルが塗り対象か判断
                if (!objectEquals(tmpPxl.color, startPointColor)) {
                    // console.log(`塗らない`)
                    break;
                }
                // console.log(`塗る`)

                //塗る色をセット
                tmpPxl.color = paintColor;
                fillPxl(ctx, tmpPxl, pxlSize);
                strokes.push(tmpPxl);

                //上下の塗り対象を取得
                pushVerticallyAdjoiningPxl(ctx = ctx, paintColor = paintColor, tmpPxl, pxlSize, grid, startPointColor, buffer);
                leftX--;

                loopCounter++;
                if (loopCounter % 100 === 0) { // 100ループごとにチェック
                    if (Date.now() - startTime >= timeoutMs) {
                        console.log(`タイムアウト: ${timeoutMs} ミリ秒`);
                        return strokes;
                    }
                    await timeout(0); // 他のタスクが実行されるようにする
                }
            }

            let rightX = target.c + 1;
            while (rightX < grid.colsCount) {
                let tmpPxl: PxlType = {
                    c: rightX,
                    r: target.r,
                    color: getPxlColor(ctx, { c: rightX, r: target.r }, pxlSize),
                    mode: Mode.DRAW
                }
                // console.log("右")
                // console.log(`列:${tmpPxl.c} 行:${tmpPxl.r}`)
                // console.log(`比較：${tmpPxl.color?.r}, ${tmpPxl.color?.g}, ${tmpPxl.color?.b}, ${tmpPxl.color?.a}`)

                //ピクセルが塗り対象か判断
                if (!objectEquals(tmpPxl.color, startPointColor)) {
                    // console.log(`塗らない`)
                    break;
                }

                // console.log(`塗る`)
                tmpPxl.color = paintColor;
                fillPxl(ctx, tmpPxl, pxlSize);
                strokes.push(tmpPxl);

                //上下の塗り対象を取得
                pushVerticallyAdjoiningPxl(ctx, paintColor, tmpPxl, pxlSize, grid, startPointColor, buffer);
                rightX++;

                loopCounter++;
                if (loopCounter % 100 === 0) { // 100ループごとにチェック
                    if (Date.now() - startTime >= timeoutMs) {
                        console.log(`タイムアウト: ${timeoutMs} ミリ秒`);
                        return strokes;
                    }
                    await timeout(0); // 他のタスクが実行されるようにする
                }
            }
        }
        return strokes;
    };

    const drawAllstroke = (canvasRef: RefObject<HTMLCanvasElement> | HTMLCanvasElement, allStrokes: AllStrokesType, pxlSize: number) => {

        let ctx;
        if ("current" in canvasRef) {
            ctx = getCtx(canvasRef.current!)
        } else {
            ctx = getCtx(canvasRef)
        }
        // 最新のすべてのストローク情報を canvas に描画させる
        for (let i = 0; i < allStrokes.strokes.length; i += 1) {
            const operation = allStrokes.strokes[i];
            for (let j = 0; j < operation.pxl.length; j += 1) {
                const pxl = operation.pxl[j];
                fillPxl(ctx, pxl, pxlSize)
            }
        }
    }

    //全てのストロークから現在のキャンバスの状況を作っているストロークのみ取得
    //同じ座標のものは最新のもののみを残す
    const getCurrentCanvasStrokes = (allStrokes: AllStrokesType): CurrentStrokeType => {

        let canvasStroke: PxlType[] = [];
        const strokeArray = allStrokes.strokes.map(stroke => stroke.pxl);
        //一次元配列に変換
        //逆順に変換
        const flattenedArray = strokeArray.flat().reverse();

        //先勝ちで配列を作成すると、同じ座標に関する最新ストロークのみを入手できる
        canvasStroke = uniqueStrokes(flattenedArray);
        // for (let i = 0; i < flattenedArray.length; i++) {
        //     let result = canvasStroke.filter(item => item.r == flattenedArray[i].r && item.c == flattenedArray[i].c);
        //     //先勝ち
        //     if (result.length > 0) continue;
        //     canvasStroke.push(flattenedArray[i]);
        // }
        return canvasStroke;
    }

    //全てのストロークから現在のキャンバスの各セルの色を16進数で取得
    //同じ座標のものは最新のもののみを残す
    const getCurrentCanvasHexArray = (stroke: CurrentStrokeType, grid: GridCountType): string[] => {

        let hexArray: string[] = [];
        try {
            for (let i = 0; i < grid.rowsCount; i++) {
                for (let j = 0; j < grid.colsCount; j++) {
                    try {
                        let result: PxlType[] = stroke.filter(item => item.r == i && item.c == j);
                        //ストロークから取得しているので，消しゴム後はNaNColorが入ってきてしまうので分岐で白色にする
                        if (result.length > 0) {
                            if (result[0].color && !objectEquals(result[0].color, NaNColor)) {
                                try {
                                    hexArray.push(getHex(result[0].color!));
                                } catch {
                                    alert(`color: ${result[0].color.r},${result[0].color.g},${result[0].color.b},${result[0].color.a}`)
                                    hexArray.push(getHex(whiteColor));
                                } finally {
                                }
                            } else {
                                hexArray.push(getHex(whiteColor));
                            }
                        } else {
                            hexArray.push(getHex(whiteColor));
                        }
                    }
                    catch (error) {
                        if (error instanceof Error) {
                            throw new Error(`行: ${i + 1}, 列: ${j + 1}, エラー: ${error.message}`);
                        } else {
                            throw new Error(`行: ${i + 1}, 列: ${j + 1}`);
                        }
                    }
                }
            }
        } catch (error) {
            throw error;
        }
        return hexArray;
    }

    const getCsvUrl = (canvasRef: RefObject<HTMLCanvasElement>, allStrokes: AllStrokesType, grid: GridCountType, pxlSize: number) => {

        let data: string = "";
        try {
            const canvas = getCanvas(canvasRef);
            const strokes: CurrentStrokeType = createCanvasAllStrokesFromCanvas(canvas, pxlSize, grid);
            let hexArray: string[] = getCurrentCanvasHexArray(strokes, grid)
            for (let i = 0; i < hexArray.length; i++) {
                data += hexArray[i];

                if (i % grid.colsCount == grid.colsCount - 1) {
                    // データ末尾に改行コードを追記
                    data += "\r\n";
                    continue;
                }
                data += ",";
            }
        }
        catch (error) {
            throw error;
        }
        ////////////////////CSV形式へ変換////////////////////
        // BOMを付与（Excelで開いた際のの文字化け対策）
        const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
        // CSV用バイナリデータを作成
        const blob = new Blob([bom, data], { type: "text/csv" });
        // blobからオブジェクトURLを作成
        const objectUrl = URL.createObjectURL(blob);

        return objectUrl;
    }

    const getClearCanvasStrokes = (grid: GridCountType): CurrentStrokeType => {

        const strokes: PxlType[] = [];
        for (let i = 0; i < grid.rowsCount; i++) {
            for (let j = 0; j < grid.colsCount; j++) {
                let eraser: PxlType = {
                    c: j,
                    r: i,
                    color: NaNColor,
                    mode: Mode.ERASE
                }
                strokes.push(eraser);
            }
        }
        return strokes;
    }

    //全体をクリアし，必要な部分を再描画するストロークを取得
    const getReDrawStoke = (strokes: CurrentStrokeType): CurrentStrokeType => {
        const clearStroke: CurrentStrokeType = getClearCanvasStrokes({ rowsCount: 30, colsCount: 30 })
        const redrawStroke = getCurrentCanvasStrokes({
            strokes: [{ pxl: clearStroke }, { pxl: strokes }]
        });
        return redrawStroke;
    }

    return {
        NullColor,
        getCanvasDataUrl,
        getBinarizedStrokes,
        getCurrentCanvasStrokes,
        clearCanvas,
        getCanvas,
        getCtx,
        getPxlColor,
        createInterpolatedPosition,
        getBinarizedImgUrl,
        getBinarizationParams,
        getGridForStrokes,
        fillPxl,
        fillPxls,
        drawAllstroke,
        getCsvUrl,
        uniqueStrokes,
        getSelectAreaStrokes,
        getMovedStrokes,
        binarize,
        getReDrawStoke
    }
}