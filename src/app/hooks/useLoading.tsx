'use client'
import { useAtom } from 'jotai'

// States
import { loadingAtom } from '../components/loadingAtom'

export default function useLoading() {
    const [value, setValue] = useAtom(loadingAtom)

    // ローディング開始
    const start = () => {
        setValue(true)
    }

    // ローディング終了
    const stop = () => {
        setValue(false)
    }

    return {
        value,
        start,
        stop
    }
}