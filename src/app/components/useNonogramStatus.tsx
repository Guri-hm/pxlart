import { useCallback, useEffect, useState } from 'react'
import { StorokesStrageType } from './strokeTypes'

/**
 * ストロークを保存するローカルストレージのキー名。
 */
const STORAGE_KEY_ALL_STROKES = `${process.env.domain}${process.env.clientPort}/nonogram`;
/**
 * ストローク保存を扱うためのフック。
 */
export function useNonogramStatus(
    defaultValue: StorokesStrageType
): [strokes: StorokesStrageType, setStrolkes: (strokes: StorokesStrageType) => void] {
    const [strokesInternal, setStrokesInternal] = useState(defaultValue)

    // クライアントでの初期レンダリング直後にローカルストレージの設定を反映
    useEffect(() => {
        let json: string = localStorage.getItem(STORAGE_KEY_ALL_STROKES) || "";
        if (json !== "") {
            setStrokesInternal(JSON.parse(json) as StorokesStrageType)
        }
    }, [setStrokesInternal])

    // 外部からのセッター呼び出し時にローカルストレージに値を保存する
    const setStrolkes = useCallback(
        (strokeStrage: StorokesStrageType) => {
            localStorage.setItem(STORAGE_KEY_ALL_STROKES, JSON.stringify(strokeStrage))
            // setStrokesInternal(lastStrokes)
        },
        [setStrokesInternal]
    )
    return [strokesInternal, setStrolkes]
}

export const getStrageStrokes = (): any => {
    let json: string = localStorage.getItem(STORAGE_KEY_ALL_STROKES) || "";
    if (json !== "") {
        return JSON.parse(json) as StorokesStrageType
    }
    return null;
}

export const removeLocalStrage = () => {
    localStorage.removeItem(STORAGE_KEY_ALL_STROKES);

}

