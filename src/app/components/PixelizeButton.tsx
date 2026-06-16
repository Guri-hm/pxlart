
import { useState, useEffect, useContext } from 'react';
import FileButton from './FileButton';
import PixelizeIcon from './PixelizeIcon';
import { AlertMessageType, AlertColor } from './alertTypes';
import { AllStrokesType, PxlType } from './strokeTypes';
import { Mode } from './modeTypes';
import { MsgContext } from '../context/MsgContext';
import Overlay from './Overlay';

type Props = {
    allStrokes: AllStrokesType,
    setAllStrokes: any,
    setGrid: any,
    className: string,
}

export default function PixelizeButton(params: Props) {

    type FileObj = {
        image: string | Blob;
    }
    const [shouldShow, setShow] = useState(false);
    const [postFileData, setPostFileData] = useState<FileObj>();
    const { setMsg } = useContext(MsgContext);

    useEffect(() => {
        if (typeof postFileData === "undefined") return;

        const upload = () => {

            const setJson = (newValue: string | string[]) => {

                let y = newValue.length;
                if (y == 0) return;

                const setImgStroke = (img: string | string[]) => {

                    let strokes: PxlType[] = [];
                    for (let y = 0; y < img.length; y++) {
                        for (let x = 0; x < img[y].length; x++) {
                            let colorRGBA = "rgba(" + [img[y][x][0], img[y][x][1], img[y][x][2], 255].join(',') + ")";
                            if (colorRGBA == 'rgba(255,255,255,255)') continue;

                            strokes.push({ c: x, r: y, color: { r: parseInt(img[y][x][0]), g: parseInt(img[y][x][1]), b: parseInt(img[y][x][2]), a: parseInt('255') }, mode: Mode.DRAW });
                        }
                    }
                    const nowAllStrokes = params.allStrokes.strokes;
                    params.setAllStrokes({
                        strokes: [...nowAllStrokes, { pxl: strokes }]
                    });
                }

                setImgStroke(newValue as string);

                let x = newValue[0].length;
                params.setGrid({ colsCount: x, rowsCount: y })
                setShow(false);
                setMsg({ type: AlertColor.success, message: "画像から作成しました", open: true })
            };

            const handleErrors = (res: any) => {
                if (res.ok) {
                    return res;
                }

                switch (res.status) {
                    case 400: throw Error('INVALID_TOKEN');
                    case 401: throw Error('UNAUTHORIZED');
                    case 500: throw Error('INTERNAL_SERVER_ERROR');
                    case 502: throw Error('BAD_GATEWAY');
                    case 404: throw Error('NOT_FOUND');
                    default: throw Error('UNHANDLED_ERROR');
                }
            };

            let formData = new FormData();
            if (typeof postFileData == 'undefined') {
                return false;
            }
            formData.append("image", postFileData.image);

            fetch(`${process.env.NEXT_PUBLIC_API_BASE}/app/pxlart/`, {
                method: 'POST',
                body: formData,
            })
                .then(handleErrors)//サーバーサイドのエラーステータスを処理
                .then(res => {
                    return res.json()
                })
                .then((json) => {
                    if (json["result"] == "false") { //Flask側で"false"と判断されたらアラートする
                        throw new Error(json["message"])
                    }
                    setJson(json);
                }).catch(error => {

                    const msg: AlertMessageType = { message: (error.message == null) ? '通信に失敗しました' : error.message, type: AlertColor.error, open: true };
                    setMsg(msg);
                    setShow(false);

                    return false;
                })
        };

        setShow(true);
        const msg: AlertMessageType = { message: '画像をアップロードしています', type: AlertColor.info, open: true };
        setMsg(msg);

        upload();

    }, [postFileData]);

    const changeUploadFile = async (event: any) => {
        const { files } = event.target;
        setPostFileData({
            ...postFileData,
            image: files[0],
        });
        event.target.value = '';
    };

    return (
        <>
            {shouldShow ? <Overlay></Overlay> : null}
            <FileButton className={`primary w-100 ${params.className}`}
                name="image"
                onChange={changeUploadFile} icon={PixelizeIcon}
            >
            </FileButton>
        </>
    );
}