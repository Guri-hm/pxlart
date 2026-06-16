'use client'
import { useEffect, useState } from 'react'
import Nonogram from '@/app/components/Nonogram'

export default function NonogramClient({ slug }: { slug: string }) {
  const [data, setData] = useState<any>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    // ビルド時フォールバック用のプレースホルダーは表示しない
    if (!slug || slug === '__placeholder__') {
      setNotFound(true)
      return
    }

    const apiBase = process.env.NEXT_PUBLIC_API_BASE

    // nonogram データ取得
    fetch(`${apiBase}/app/pxlart/getNonogram?id=${slug}`)
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
    fetch(`${apiBase}/app/pxlart/updateDt?id=${slug}`).catch(() => {})
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
