import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { script } = await req.json()
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: script,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.55, similarity_boost: 0.75 }
        })
      }
    )
    if (!response.ok) throw new Error('ElevenLabs API failed')
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return NextResponse.json({ audio: base64 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
