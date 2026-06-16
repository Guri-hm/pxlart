import styles from "./joystick.module.css";
import { coordinate } from "./GetPositionInfo";
import { CursorType } from "./Cursors";
import Zoom from './Zoom';
import { Joystick } from 'react-joystick-component';

type IJoystickUpdateEvent = {
    type: string;
    x: number | null;
    y: number | null;
    direction: string | null;
    distance: number | null;
};

type Props = {
    setCanvasPoint: any;
    canvasPoint: coordinate,
    transformOrigin: CursorType,
    setTransformOrigin: any,
    zoomRatio: number,
    setZoomRatio: any,
    winWidth: number
}

export default function JoyStickArea(params: Props) {

    const action = (event: IJoystickUpdateEvent) => {
        let volume = Number(params.winWidth / 15 / params.zoomRatio)
        params.setTransformOrigin({ x: params.transformOrigin.x - Number(event.x) * volume, y: params.transformOrigin.y + Number(event.y) * volume })
    }

    return (
        <>
            <div className={`${styles.joystickArea} ${styles.noPrint}`}>
                <Zoom zoomRatio={params.zoomRatio} setZoomRatio={params.setZoomRatio}></Zoom>
                <Joystick stickSize={30} size={50} move={action} baseColor="#f3f3f3" stickColor="#6e7575"></Joystick>
            </div>
        </>

    );
}

