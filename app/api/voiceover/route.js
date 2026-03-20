import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { script } = await req.json()
    const apiKey = process.env.ELEVENLABS_API_KEY
    const voiceId = process.env.ELEVENLABS_VOICE_ID
    if (!apiKey) return NextResponse.json({ error: 'Missing ELEVENLABS_API_KEY' }, { status: 500 })
    if (!voiceId) return NextResponse.json({ error: 'Missing ELEVENLABS_VOICE_ID' }, { status: 500 })
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: script, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.55, similarity_boost: 0.75 } })
    })
    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json({ error: 'ElevenLabs: ' + errText }, { status: 500 })
    }
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return NextResponse.json({ audio: base64 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
