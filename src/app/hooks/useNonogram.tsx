import { ColorType, PxlType, CurrentStrokeType, AllStrokesType, StorokesStrageType, BinarizationParamsType, NonogramAnswerType, PxlArrayType, RowColType } from '@/app/components/strokeTypes';
import Utils from '../utils/utils';
import { RefObject } from 'react';
import { ModeType, Mode } from '../components/modeTypes'
import drawGrid from '../components/drawGrid';
import { GridCountType } from '../components/gridTypes';
import { HintType } from '../components/HintTypes';

export default function useNonogram() {

    const getColHint = (stroke: CurrentStrokeType, grid: GridCountType): HintType[] => {

        let hintArray: HintType[] = [];
        //各列の数字を取得
        for (let i = 0; i < grid.colsCount; i++) {
            let filterResult = stroke.filter(value => value.c == i)
            let seq = 0;
            let hintCount = 0;
            // console.log(filterResult)
            //1列全てが塗りなし
            if (filterResult.length == 0) {
                hintArray.push({ c: i, r: hintCount, number: seq });
                continue;
            }
            seq = 1;
            filterResult.sort((a, b) => a.r > b.r ? 1 : -1);
            for (let j = 0; j < filterResult.length; j++) {
                //最後
                if (j + 1 == filterResult.length) {
                    hintArray.push({ c: i, r: hintCount, number: seq });
                    break;
                }
                //下のマスと連続しない場合(strokeは黒塗部分のみしか格納していないため)
                if (filterResult[j].r + 1 != filterResult[j + 1].r) {
                    hintArray.push({ c: i, r: hintCount, number: seq });
                    seq = 1;
                    hintCount++;
                    continue;
                }
                //下のマスと連続する
                seq++;
            }
        }
        return hintArray;
    }

    const getRowHint = (stroke: CurrentStrokeType, grid: GridCountType): HintType[] => {

        let hintArray: HintType[] = [];

        //各行の数字を取得
        for (let i = 0; i < grid.rowsCount; i++) {

            let filterResult = stroke.filter(value => value.r == i)
            let seq = 0;
            let hintCount = 0;
            //1行全てが塗りなし
            if (filterResult.length == 0) {
                hintArray.push({ c: hintCount, r: i, number: seq });
                continue;
            }
            seq = 1;
            filterResult.sort((a, b) => a.c > b.c ? 1 : -1);
            for (let j = 0; j < filterResult.length; j++) {
                //最後
                if (j + 1 == filterResult.length) {
                    hintArray.push({ c: hintCount, r: i, number: seq });
                    break;
                }
                //右のマスと連続しない場合(strokeは黒塗部分のみしか格納していないため)
                if (filterResult[j].c + 1 != filterResult[j + 1].c) {
                    hintArray.push({ c: hintCount, r: i, number: seq });
                    seq = 1;
                    hintCount++;
                    continue;
                }
                //下のマスと連続する
                seq++;
            }
        }
        return hintArray;
    }

    return {
        getRowHint,
        getColHint,
    }
}