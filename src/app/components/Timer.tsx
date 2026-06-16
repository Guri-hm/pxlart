import React, { useEffect, useState } from "react";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TimerIcon from '@mui/icons-material/Timer';
import { ResultType, enmStatus } from "./NonogramResultType"
import { CurrentStrokeType, PxlType } from "./strokeTypes";
import { coordinate } from "./GetPositionInfo";

type Props = {
    visible: boolean,
    setVisible: any,
    seconds: number,
    setSeconds: any,
    setResultDaialog: any,
}

export const calcTimerFromStrokes = (strokes: CurrentStrokeType): number => {
    //行数列数の最大数×60秒
    const cols = strokes.map((pxl: PxlType) => {
        return pxl.c;
    });
    const rows = strokes.map((pxl: PxlType) => {
        return pxl.r;
    });
    //最低値は4とする
    cols.push(4);
    rows.push(4);
    //行数、列数が0から始まるので1下駄をはかせる
    return Math.max(Math.max(...cols) + 1, Math.max(...rows) + 1) * 60
}

export function Timer(params: Props) {

    useEffect(() => {
        const tick = () => {
            if (params.seconds > 0) params.setSeconds((prevCount: number) => prevCount - 1)
        }
        const timerId = setInterval(() => {
            tick()
        }, 1000)

        if (params.seconds <= 0) {
            params.setResultDaialog({ open: true, result: enmStatus.MISS });
        }
        // ここではタイマーをクリア
        return () => clearInterval(timerId)
    }, [params.seconds])
    const handleClose = () => {
        params.setVisible(false);
    }
    return (
        <>
            {params.visible == true &&
                <Card className="no-print" sx={{ padding: '10px', position: 'fixed', right: 0, zIndex: 999 }} variant="outlined">
                    <CardContent>
                        <Grid
                            container
                            direction="row"
                            justifyContent="flex-start"
                            alignItems="center"
                        >
                            <TimerIcon></TimerIcon>
                            {params.seconds <= 0 ?
                                "タイムアップ"
                                :
                                `残り${Math.floor(params.seconds % 3600 / 60)}分${("0" + params.seconds % 60).slice(-2)}秒`
                            }
                        </Grid>
                    </CardContent>
                    <CardActions>
                        <Button size="small" onClick={handleClose}>閉じる</Button>
                    </CardActions>
                </Card>
            }
        </>

    );
}

