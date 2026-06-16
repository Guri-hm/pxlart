'use strict'

import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import React from 'react'
import IconButton from '@mui/material/IconButton';
import ResizeGridIcon from './ResizeGridIcon';
import { GridCountType } from './gridTypes';
import { useState } from 'react';
import styles from "./slider.module.css";
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';

const marks = [
    {
        value: 1,
        label: '×1',
    },
    {
        value: 30,
        label: '×30',
    },
];

type Props = {
    grid: GridCountType,
    setGrid: any,
    className: string,
};

type MyState = {
    displaySliders: boolean;
};

export default function Sliders(params: Props) {

    const [states, setStates] = useState<MyState>({
        displaySliders: false,
    })

    const handleChangeWidth = (event: Event, newValue: number | number[]) => {
        newValue = Array.isArray(newValue) ? newValue[0] : newValue;
        const grid: GridCountType = { rowsCount: params.grid.rowsCount, colsCount: newValue };
        params.setGrid(grid)
    };

    const handleChangeHeight = (event: Event, newValue: number | number[]) => {
        newValue = Array.isArray(newValue) ? newValue[0] : newValue;
        const grid: GridCountType = { rowsCount: newValue, colsCount: params.grid.colsCount };
        params.setGrid(grid)
    };

    const handleClick = () => {
        setStates({ ...states, displaySliders: !states.displaySliders })
    };

    const handleClose = () => {
        setStates({ ...states, displaySliders: false })
    };

    return (
        <>
            <Tooltip arrow title="サイズ変更" disableInteractive>
                <div className={styles.dMd50}>
                    <FormControlLabel className='mx-auto' value="resize" control={<IconButton aria-label="delete" onClick={handleClick} className={params.className}>
                        <ResizeGridIcon />
                    </IconButton>} label={<Typography className={styles.dMdNone}>サイズ変更</Typography>} />
                </div>
            </Tooltip>
            {states.displaySliders ? <div className={styles.popover}>
                <div className={styles.cover} onClick={handleClose} />
                <div className={styles.panel} >
                    <Typography id="width-slider-label" gutterBottom>
                        横
                        <span id="width-value">{params.grid.colsCount}</span>
                    </Typography>
                    <Slider value={params.grid.colsCount} defaultValue={5} step={1} marks={marks} min={1} max={30} valueLabelDisplay="auto" onChange={handleChangeWidth} />
                    <Typography id="height-slider-label" gutterBottom>
                        縦
                        <span id="height-value">{params.grid.rowsCount}</span>
                    </Typography>
                    <Slider value={params.grid.rowsCount} defaultValue={5} step={1} marks={marks} min={1} max={30} valueLabelDisplay="auto" onChange={handleChangeHeight} />
                </div>
            </div> : null}
        </ >
    )
}
