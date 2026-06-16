import { AlertColor, AlertMessageType } from './alertTypes';

async function fetchDelete(uuid: string, code: string, setMsg: any) {

    // const data = await import(`data/${slug}.md`)
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/app/pxlart/delete`;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // JSON形式のデータのヘッダー
        },
        body: JSON.stringify({ uuid: uuid, code: code }) // JSON形式のデータ
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

    const response = await fetch(url, options)
        .then(handleErrors)//サーバーサイドのエラーステータスを処理
        .then(res => {
            return res.json()
        })
        .then((json) => {

            if (json["result"] == "false") { //Flask側で"false"と判断されたらアラートする
                throw new Error(json["message"])
            }
            let msg: AlertMessageType = { message: json["message"], type: AlertColor.info, open: true };
            setMsg(msg);
            return true;
        }).catch(error => {
            let msg: AlertMessageType = { message: (error.message == null) ? '通信に失敗しました' : error.message, type: AlertColor.error, open: true };
            setMsg(msg);
            return false;
        })
    return response;
}

export const DeleteNonogram = async (uuid: string, code: string, setMsg: any) => {

    let result = await fetchDelete(uuid, code, setMsg);
    return result;
    // return (
    //     <>
    //         {(json.hasOwnProperty('evaluation') && evaluations[json.evaluation])}
    //         {(json.hasOwnProperty('evaluation') && icons[json.evaluation])}
    //     </>
    // );
}
