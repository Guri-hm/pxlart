import { BsFillEraserFill } from "react-icons/bs";
import { BsPencilFill } from "react-icons/bs";
import { CgColorBucket } from "react-icons/cg";
import { Mode, ModeType } from '../components/modeTypes'
import styles from './cursor.module.css';
import ColorizeIcon from '@mui/icons-material/Colorize';

export type CursorType = {
    x: number,
    y: number
}
type Props = {
    isHover: boolean,
    cursor: CursorType,
    drawMode: ModeType,
}

export function Cursors(params: Props) {

    const pos = {

        top: params.cursor.y,
        left: params.cursor.x,
    };

    let cursor;
    switch (params.drawMode) {
        case Mode.ERASE:
            cursor = <BsFillEraserFill style={Object.assign({}, pos, { display: params.isHover ? 'flex' : 'none' })} className={styles.cursor} />;
            break;
        case Mode.DRAW:
        case Mode.MARK:
            cursor = <BsPencilFill style={Object.assign({}, pos, { display: params.isHover ? 'flex' : 'none' })} className={styles.cursor} />;
            break;
        case Mode.FILL:
            cursor = <CgColorBucket style={Object.assign({}, pos, { display: params.isHover ? 'flex' : 'none' })} className={styles.cursor} />;
            break;
        case Mode.SPUIT:
            cursor = <ColorizeIcon style={Object.assign({}, pos, { display: params.isHover ? 'flex' : 'none' })} className={styles.cursor} />;
            break;

    }


    return (
        <>
            {cursor}
        </>

    );
}

