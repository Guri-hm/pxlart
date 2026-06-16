import React from "react";
import IconButton from '@mui/material/IconButton';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import styles from "./zoom.module.css";

type Props = {
    setZoomRatio: any,
    zoomRatio: number,
}

export default function Zoom(params: Props) {
    const handleZoom = (value: number) => {
        // 拡大率算出
        let newRatio = params.zoomRatio + value

        // 拡大率は0.1～5まで
        if (newRatio < 0) {
            newRatio = 0.1
        } else if (newRatio > 5) {
            newRatio = 5
        }

        // 小数点第二以下切り捨て
        newRatio = Math.round(newRatio * 10) / 10;
        params.setZoomRatio(newRatio);
    }
    return (
        <div className={styles.zoomButtons}>
            <IconButton aria-label="zoomin" size="small" className={styles.zoomIcon} onClick={() => {
                handleZoom(0.1)
            }}>
                <ZoomInIcon />
            </IconButton>
            <IconButton aria-label="zoomout" size="small" className={styles.zoomIcon} onClick={() => {
                handleZoom(-0.1)
            }}>
                <ZoomOutIcon />
            </IconButton>
        </div>

    );
}

