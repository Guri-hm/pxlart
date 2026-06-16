'use client'
import { useState } from 'react';
import { DndContext, useSensor, useSensors, MouseSensor as LibMouseSensor, TouchSensor as LibTouchSensor } from "@dnd-kit/core";
import { Draggable } from './Draggable';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import { Droppable } from "./Droppable";
import { CustomizedSnackbars } from '../components/CustomizedSnackbars';
import MsgProvider from '../context/MsgProvider';
import { AlertColor, AlertMessageType } from '../components/alertTypes';
import DeleteDialog from '../components/DeleteDialog';
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

//評価部分はクライエント側での読込
//遅延読込しないと、ブラウザのコンソールにエラーが出る
const color = "rgb(" + (~~(256 * Math.random())) + ", " + (~~(256 * Math.random())) + ", " + (~~(256 * Math.random())) + ")";

const theme = createTheme({
    components: {
        // Name of the component
        MuiCard: {
            styleOverrides: {
                // Name of the slot
                root: {
                    // Some CSS
                    userSelect: "none",
                    margin: 1,
                    borderLeft: color,
                    borderLeftWidth: "4px",
                    borderLeftStyle: "solid",
                },
            },
        },
    },
    typography: {
        htmlFontSize: 10,
        fontFamily: [
            'DotGothic16',
        ].join(','),
    }
});

type Props = {
    items: Nonogram[],
}

type Nonogram = {
    title: string,
    answer: string,
    uuid: string,
    created_at: string,
    id: number,
    view_count: number,
    evaluation: number,
    delete_flag: number
}
function shouldHandleEvent(element: HTMLElement | null) {
    let cur = element;

    while (cur) {
        if (cur.dataset && cur.dataset.dndkitDisabledDndFlag) {
            return false;
        }
        cur = cur.parentElement;
    }

    return true;
}

// LibMouseSensor を override してドラッグ無効にする
class MouseSensor extends LibMouseSensor {
    static activators = [
        {
            eventName: "onMouseDown" as const,
            handler: ({ nativeEvent: event }: React.MouseEvent): boolean => {
                return shouldHandleEvent(event.target as HTMLElement);
            },
        },
    ];
}
class TouchSensor extends LibTouchSensor {
    static activators = [
        {
            eventName: "onTouchStart" as const,
            handler: ({ nativeEvent: event }: React.TouchEvent): boolean => {
                return shouldHandleEvent(event.target as HTMLElement);
            },
        },
    ];
}
export default function NonogramCards(params: Props) {
    const [message, setMessage] = useState<AlertMessageType>({ type: AlertColor.info, message: "", open: false });
    const [dialog, setDialog] = useState({
        open: false,
        uuid: '',
    })

    const removeDOM = (uuid: string) => {
        params.items = params.items.filter(function (x: Nonogram) { return x.uuid != uuid });
    }
    const mouseSensor = useSensor(MouseSensor);
    const touchSensor = useSensor(TouchSensor);
    const sensors = useSensors(mouseSensor, touchSensor);

    return (
        <MsgProvider setMsg={setMessage} msg={message}>

            <ThemeProvider theme={theme}>
                <DndContext
                    sensors={sensors}
                    modifiers={[restrictToWindowEdges]}
                    onDragEnd={(event) => {
                        const { over, active } = event;
                        if (over == null || active.data.current == null) {
                            return;
                        }
                        // setMessage({ type: AlertColor.success, message: active.data.current.uuid, open: true })
                        let uuid: string = active.data.current.uuid;
                        setDialog({ open: true, uuid: uuid })
                    }}
                >
                    <Grid container spacing={3} sx={{ padding: 1 }}>
                        {params.items.map((item: Nonogram, index: number) =>
                            <Grid key={item.id} item xs={6} sm={4} md={3}>
                                <Draggable key={item.id} item={item} />
                            </Grid >
                        )}
                    </Grid>
                    <CustomizedSnackbars></CustomizedSnackbars>
                    <Droppable id="dropArea"></Droppable>
                </DndContext>
                <DeleteDialog state={dialog} setState={setDialog} event={removeDOM}></DeleteDialog>
            </ThemeProvider>
        </MsgProvider>

    );
};

