import NonogramClient from './NonogramClient'
import "../../styles/pxl.css"
import "../../styles/nonogram.css"

// ビルド時に既存の nonogram UUID を静的ページとして生成する。
// __placeholder__ は常に含める（404.html→sessionStorage経由でビルド後追加分を表示するため必須）
export async function generateStaticParams() {
  const base = [{ slug: '__placeholder__' }]
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/app/pxlart/getNonograms`
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) throw new Error('fetch failed')
    const nonograms = await response.json()
    if (!Array.isArray(nonograms) || nonograms.length === 0) return base
    return [...base, ...nonograms.map((n: any) => ({ slug: n.uuid }))]
  } catch {
    return base
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  return <NonogramClient slug={params.slug} />
}
