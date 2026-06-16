import React from "react";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { coordinate } from "./GetPositionInfo";
import { getHex } from './rgba';
import { ColorType } from "./strokeTypes";
import Utils from "../utils/utils";
import useStrokes, { NaNColor } from "../hooks/useStrokes";

type Props = {
    visible: boolean,
    setVisible: any,
    zoomRatio: number,
    canvasPoint: coordinate,
    col: number,
    row: number,
    color: {
        a: number;
        r: number;
        g: number;
        b: number;
    };
}

export function InfoArea({ canvasPoint, col, row, color, setVisible, visible, zoomRatio }: Props) {

    const handleClose = () => {
        setVisible(false);
    }
    return (
        <>
            {visible ?
                <Card sx={{ padding: '10px', position: 'fixed', right: 0, zIndex: 999 }} variant="outlined">
                    <CardContent>
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                            列:{col} 行:{row}
                        </Typography>
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                            x:{canvasPoint.offsetX} y:{canvasPoint.offsetY}
                        </Typography>
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                            拡大率：{zoomRatio}
                        </Typography>
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                            RGBA：{`${color.r},${color.g},${color.b},${color.a}`}
                        </Typography>
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                            HEX：{`${getHex(color)}`}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button size="small" onClick={handleClose}>閉じる</Button>
                    </CardActions>
                </Card>
                :
                <>
                </>
            }
        </>

    );
}

