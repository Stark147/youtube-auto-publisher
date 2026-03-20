import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { title } = await req.json()
    const timeline = {
      background: '#000000',
      tracks: [
        {
          clips: [{
            asset: {
              type: 'title',
              text: title,
              style: 'blockbuster',
              color: '#FFD700',
              size: 'large',
              background: 'transparent',
              position: 'center'
            },
            start: 0,
            length: 10
          }]
        }
      ]
    }
    const res = await fetch('https://api.shotstack.io/' + process.env.SHOTSTACK_ENV + '/render', {
      method: 'POST',
      headers: { 'x-api-key': process.env.SHOTSTACK_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeline, output: { format: 'mp4', resolution: 'sd' } })
    })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'Shotstack: ' + err }, { status: 500 })
    }
    const data = await res.json()
    if (!data.response || !data.response.id) {
      return NextResponse.json({ error: 'No render ID: ' + JSON.stringify(data) }, { status: 500 })
    }
    return NextResponse.json({ renderId: data.response.id })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const res = await fetch('https://api.shotstack.io/' + process.env.SHOTSTACK_ENV + '/render/' + id, {
      headers: { 'x-api-key': process.env.SHOTSTACK_API_KEY }
    })
    const data = await res.json()
    return NextResponse.json({ status: data.response.status, url: data.response.url, error: data.response.error })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
