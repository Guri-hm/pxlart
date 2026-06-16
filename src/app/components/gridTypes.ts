
export const defaultPxlSize = 25;    // 表示倍率
export type CanvasWrapper = {
    width: number,
    height: number
}
export type GridCountType = {
    rowsCount: number; colsCount: number;
};

export const getPxlSize = (wrapper: CanvasWrapper, rcCount: GridCountType): number => {
    if (!wrapper) return 0;
    let pxlWidth = defaultPxlSize;
    let pxlHeight = defaultPxlSize;
    if (wrapper.width < rcCount.colsCount * defaultPxlSize) {
        pxlWidth = wrapper.width / rcCount.colsCount
    }
    if (wrapper.height < rcCount.rowsCount * defaultPxlSize) {
        pxlHeight = wrapper.height / rcCount.rowsCount
    }
    return Math.min(pxlWidth, pxlHeight);
}