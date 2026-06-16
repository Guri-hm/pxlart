'use client'
import { useEffect, useState } from 'react'
import NonogramCards from '../components/NonogramCards';

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

export default function Page() {
  const [items, setItems] = useState<Nonogram[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/app/pxlart/getNonograms`
    fetch(url, { method: 'GET' })
      .then(res => {
        if (!res.ok) throw new Error(`${res.status}`)
        return res.json()
      })
      .then(json => {
        if (json['result'] == 'false') throw new Error(json['message'])
        setItems(json)
        setLoading(false)
      })
      .catch(err => {
        console.error('error', err)
        setError(true)
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div className="wrapper">
      <div className="container">
        <p>Loading...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="wrapper">
      <div className="container">
        <p>データの取得に失敗しました</p>
      </div>
    </div>
  )

  return (
    <>
      <div className="wrapper">
        <div className="container">
          <h2 className='text-center'>お絵描きロジック</h2>
          <NonogramCards items={items}></NonogramCards>
        </div>
      </div >
    </>
  )
}
