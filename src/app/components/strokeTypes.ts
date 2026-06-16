
import { ModeType } from "./modeTypes"
export type RowColType = {
    c: number,
    r: number
};
export type ColorType = {
    r: number; g: number; b: number; a: number
};
export type PxlType = RowColType & {
    color: ColorType | undefined,
    mode: ModeType | undefined
};
export type CurrentStrokeType = PxlType[] | [];
export type PxlArrayType = {
    pxl: CurrentStrokeType;
}[];
export type AllStrokesType = {
    strokes: PxlArrayType | [];
};
export type BinarizationParamsType = {
    strokes: CurrentStrokeType;
    threshold: number;
};

export type NonogramAnswerType = {
    strokes: CurrentStrokeType;
    threshold: number;
    title: string;
    answer: string;
    uuid: string | undefined
};
export type StorokesStrageType = {
    strokes: CurrentStrokeType;
    uuid: string | undefined;
    count: number
};