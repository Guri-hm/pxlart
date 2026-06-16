import React, { useState } from 'react'
import { SketchPicker } from 'react-color'
import IconButton from '@mui/material/IconButton';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import Tooltip from '@mui/material/Tooltip';
import styles from "./picker.module.css";
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';

type MyProps = {
    color: {
        [value: string]: number
    }
    onChange?: Function;
    addNewColor: any;
    state: pickerState;
    setState: any;
};
type pickerState = {
    displayColorPicker: boolean;
    color: {
        [value: string]: number
    };
};
type ColorResult = {
    hex: string;
    rgb: {
        a: number;
        r: number;
        g: number;
        b: number;
    };
};

export default function ColorPicker(params: MyProps) {

    const [color, setColor] = useState<{
        [value: string]: number
    }>(params.state.color);

    const handleClick = () => {
        params.setState({ ...params.state, displayColorPicker: !params.state.displayColorPicker })
    };

    const handleClose = () => {
        params.setState({ ...params.state, displayColorPicker: false, color: color })
        params.addNewColor(`rgba(${params.state.color.r}, ${params.state.color.g}, ${params.state.color.b}, ${params.state.color.a})`,);
    };

    const handleChange = (color: ColorResult) => {
        if (params.onChange) {
            params.onChange(color)
        }
        setColor(color.rgb)
    };

    return (
        <>
            <Tooltip arrow title="色" disableInteractive>
                <div className={styles.dMd50}>
                    <FormControlLabel className='mx-auto' value="color" control={<IconButton aria-label="color" onClick={handleClick} className={styles.iconStyle}>
                        <ColorLensIcon />
                    </IconButton>} label={<Typography className={styles.dMdNone}>色</Typography>} />

                </div>
            </Tooltip>
            {
                params.state.displayColorPicker ? <div className={styles.popover}>
                    <div className={styles.cover} onClick={handleClose} ></div>
                    <SketchPicker className={styles.picker} color={color} onChange={handleChange} />
                </div> : null
            }
        </>
    )
}
