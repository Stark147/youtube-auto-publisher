import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { audioUrl, title } = await req.json()
    const elements = [
      {
        type: 'text',
        text: title,
        fill_color: '#FFD700',
        font_family: 'Montserrat',
        font_weight: '700',
        font_size: '8 vmin',
        y_alignment: '50%',
        width: '80%',
        height: '30%'
      }
    ]
    if (audioUrl) {
      elements.push({
        type: 'audio',
        source: audioUrl,
        duration: null
      })
    }
    const res = await fetch('https://api.creatomate.com/v1/renders', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.CREATOMATE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        output_format: 'mp4',
        width: 1280,
        height: 720,
        fill_color: '#0a0a1a',
        elements: elements
      })
    })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'Creatomate: ' + err }, { status: 500 })
    }
    const data = await res.json()
    return NextResponse.json({ renderId: data[0].id })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const res = await fetch('https://api.creatomate.com/v1/renders/' + id, {
      headers: { 'Authorization': 'Bearer ' + process.env.CREATOMATE_API_KEY }
    })
    const data = await res.json()
    const status = data.status === 'succeeded' ? 'done' : data.status === 'failed' ? 'failed' : 'pending'
    return NextResponse.json({ status, url: data.url })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
