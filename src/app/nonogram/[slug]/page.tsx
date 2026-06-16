import NonogramClient from './NonogramClient'
import "../../styles/pxl.css"
import "../../styles/nonogram.css"

// ビルド時に既存の nonogram UUID を静的ページとして生成する。
// API が利用できない場合はダミーを返してビルドを通す。
// ビルド後に追加された nonogram は 404.html の SPA リダイレクト経由でクライアント側描画される。
export async function generateStaticParams() {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/app/pxlart/getNonograms`
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) throw new Error('fetch failed')
    const nonograms = await response.json()
    if (!Array.isArray(nonograms) || nonograms.length === 0) throw new Error('empty')
    return nonograms.map((n: any) => ({ slug: n.uuid }))
  } catch {
    // ビルドを失敗させないためのフォールバック
    return [{ slug: '__placeholder__' }]
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  return <NonogramClient slug={params.slug} />
}
