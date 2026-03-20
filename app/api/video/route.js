import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { audioBase64, title } = await req.json()
    const timeline = {
      background: '#0a0a1a',
      tracks: [
        {
          clips: [{
            asset: { type: 'video', src: 'https://cdn.coverr.co/videos/coverr-aerial-view-of-city-at-night-1634/1080p.mp4', trim: 0, volume: 0 },
            start: 0,
            length: 30,
            fit: 'cover',
            opacity: 0.4
          }]
        },
        {
          clips: [{
            asset: { type: 'audio', src: 'data:audio/mpeg;base64,' + audioBase64 },
            start: 0,
            length: 30
          }]
        },
        {
          clips: [{
            asset: { type: 'title', text: title, style: 'minimal', color: '#FFD700', size: 'large', background: 'transparent', position: 'bottom' },
            start: 0,
            length: 5
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
      return NextResponse.json({ error: 'Shotstack submit: ' + err }, { status: 500 })
    }
    const data = await res.json()
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
    const status = data.response.status
    const url = data.response.url
    return NextResponse.json({ status, url, message: data.response.error || '' })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
