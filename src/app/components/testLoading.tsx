'use client'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// Hooks
import useLoading from '../hooks/useLoading'
import Loading from '../loading'

export default function TestLoading() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    // パス
    const siteUrl: string = (process.env.NEXT_PUBLIC_SITE_URL) ? process.env.NEXT_PUBLIC_SITE_URL : "http://localhost:3000"  // サイトオリジンURL
    const currentUrl: string = siteUrl + pathname
    // 現在ページのURLパス
    const loading = useLoading()
    // ページローディングのカスタムフック呼び出し

    // ページローディングを表示させる関数
    function handleStartLoading() {
        loading.start()
    }

    // ページ移動検知
    useEffect(() => {
        const links = document.getElementsByTagName('a') // 現在表示しているページのすべてのaタグを取得

        // ページ移動完了後にページローディングを非表示にする
        setTimeout(() => {
            // ローディングを停止
            loading.stop()
        }, 1000);

        // 各aタグにイベントリスナーを追加
        for (let i = 0; i < links.length; i++) {
            // 現在開いているページ以外に移動するaタグにクリックイベントを追加
            // ※ 現在開いているページにもクリックイベントを追加するとページローディングが消えなくなる可能性が出ちゃう
            if (
                currentUrl !== links[i].href &&
                links[i].href.startsWith(siteUrl)
            ) {
                links[i].addEventListener('click', handleStartLoading)
            }
        }

        // コンポーネント破棄時にイベントリスナーを削除
        return () => {
            for (let i = 0; i < links.length; i++) {
                links[i].removeEventListener('click', handleStartLoading)
            }
        }
    }, [pathname, searchParams])

    return (
        <>
            {loading.value &&
                <Loading></Loading>
            }
        </>
    )
}