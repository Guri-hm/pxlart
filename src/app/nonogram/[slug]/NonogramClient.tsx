'use client'
import { useEffect, useState } from 'react'
import Nonogram from '@/app/components/Nonogram'

export default function NonogramClient({ slug }: { slug: string }) {
  const [data, setData] = useState<any>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    // ビルド後に追加されたノノグラムは静的ファイルが存在しないため、
    // 404.html が sessionStorage に UUID を保存して __placeholder__ にリダイレクトする。
    // ここでその UUID を読み取り、実際のノノグラムデータを取得する。
    let actualSlug = slug
    if (slug === '__placeholder__') {
      const redirectUuid = sessionStorage.getItem('nonogram_redirect_uuid')
      if (redirectUuid) {
        sessionStorage.removeItem('nonogram_redirect_uuid')
        actualSlug = redirectUuid
        // URLを正しいパスに更新（履歴には残さない）
        window.history.replaceState(null, '', `/nonogram/${redirectUuid}/`)
      } else {
        setNotFound(true)
        return
      }
    }

    const apiBase = process.env.NEXT_PUBLIC_API_BASE

    // nonogram データ取得
    fetch(`${apiBase}/app/pxlart/getNonogram?id=${actualSlug}`)
      .then(res => {
        if (!res.ok) throw new Error(`${res.status}`)
        return res.json()
      })
      .then(json => {
        if (json.result === 'false') throw new Error(json.message)
        setData(json)
      })
      .catch(() => setNotFound(true))

    // 閲覧数・更新日時の記録 (失敗しても問題なし)
    fetch(`${apiBase}/app/pxlart/updateDt?id=${actualSlug}`).catch(() => {})
  }, [slug])

  if (notFound) {
    return (
      <div className="wrapper">
        <div className="container">
          <p>ページが見つかりませんでした</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="wrapper">
        <div className="container">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return <Nonogram params={data} searchParams={{ undefined: undefined }} />
}
