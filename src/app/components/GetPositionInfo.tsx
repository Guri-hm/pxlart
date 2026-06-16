import { ModeType } from "./modeTypes";
import { PxlType } from "./strokeTypes";
export interface coordinate {
    offsetX: number,
    offsetY: number
};
export interface ColRow {
    col: number,
    row: number
};
export const Corner = {
    UL: 'upperLeft' as string,
    UR: 'upperRight' as string,
    LL: 'lowerLeft' as string,
    LR: 'lowerRight' as string,
} as const;
export type CornerType = typeof Corner[keyof typeof Corner];
export const Direction = {
    width: 'width' as string,
    height: 'height' as string,
} as const;
export type DirectionType = typeof Direction[keyof typeof Direction];


export const offsetPosition = (e: React.MouseEvent | React.TouchEvent, scale: number) => {
    if (e.nativeEvent instanceof TouchEvent) {
        const rect = (e.target as any).getBoundingClientRect();
        const coordinate: coordinate = {
            //マイナス値は0にする
            offsetX: Math.max((e.nativeEvent.touches[0].clientX - window.scrollX - rect.left) / scale, 0),
            offsetY: Math.max((e.nativeEvent.touches[0].clientY - window.scrollY - rect.top) / scale, 0)
        }
        return coordinate;
    }

    // Mouse Event
    return { offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY };
};

export const getCornerCoordinate = (crInfo: ColRow, pxlSize: number, corner: CornerType): coordinate => {
    let coordinate: coordinate = {
        offsetX: 0,
        offsetY: 0
    }
    switch (corner) {
        case Corner.UL:
            coordinate = { offsetX: crInfo.col * pxlSize, offsetY: crInfo.row * pxlSize };
            break;
        case Corner.UR:
            coordinate = { offsetX: (crInfo.col + 1) * pxlSize, offsetY: crInfo.row * pxlSize };
            break;
        case Corner.LL:
            coordinate = { offsetX: crInfo.col * pxlSize, offsetY: (crInfo.row + 1) * pxlSize };
            break;
        case Corner.LR:
            coordinate = { offsetX: (crInfo.col + 1) * pxlSize, offsetY: (crInfo.row + 1) * pxlSize };
            break;
    }
    return coordinate;
}

export const getStartCornerType = (startCR: ColRow, endCR: ColRow): CornerType => {

    let corner: CornerType = Corner.UL;
    if (endCR.row - startCR.row >= 0) {
        if (endCR.col - startCR.col >= 0) {
            corner = Corner.UL;
        } else {
            corner = Corner.UR;
        }
    } else {
        if (endCR.col - startCR.col >= 0) {
            corner = Corner.LL;
        } else {
            corner = Corner.LR;
        }
    }
    return corner;
}

export const getEndCornerType = (corner: CornerType) => {

    let endCorner: CornerType = Corner.UL;
    switch (corner) {
        case Corner.UL:
            endCorner = Corner.LR;
            break;
        case Corner.UR:
            endCorner = Corner.LL;
            break;
        case Corner.LL:
            endCorner = Corner.UR;
            break;
        case Corner.LR:
            endCorner = Corner.UL;
            break;
    }
    return endCorner;
}

export const getTwoPointsDistance = (startCR: ColRow, endCR: ColRow, pxlSize: number, direction: DirectionType) => {
    const calcAbs = (startVal: number, endVal: number): number => {
        let absVal = Math.abs(endVal - startVal);
        return absVal;
    };
    let distance: number = 0;
    let startCorner: CornerType = getStartCornerType(startCR, endCR);
    let endCorner: CornerType = getEndCornerType(startCorner);

    switch (direction) {
        case Direction.width:
            distance = calcAbs(getCornerCoordinate(startCR, pxlSize, startCorner).offsetX, getCornerCoordinate(endCR, pxlSize, endCorner).offsetX)
            break;
        case Direction.height:
            distance = calcAbs(getCornerCoordinate(startCR, pxlSize, startCorner).offsetY, getCornerCoordinate(endCR, pxlSize, endCorner).offsetY)
            break;
    }

    return distance;
}

export const getColRowInfo = (coordinate: coordinate, pxlSize: number) => {
    const rcInfo: ColRow =
    {
        col: (Math.floor(coordinate.offsetX / pxlSize))
        , row: (Math.floor(coordinate.offsetY / pxlSize))
    };
    return rcInfo;
}
export const getPxlInfo = (coordinate: coordinate, pxlSize: number, mode: ModeType) => {
    const rcInfo = getColRowInfo(coordinate, pxlSize)
    const pxl: PxlType =
    {
        c: rcInfo.col
        , r: rcInfo.row
        , color: undefined
        , mode: mode
    };
    return pxl;
}



