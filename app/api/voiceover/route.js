import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { script } = await req.json()
    const key = process.env.AZURE_SPEECH_KEY
    const region = process.env.AZURE_SPEECH_REGION
    if (!key || !region) return NextResponse.json({ error: 'Missing Azure credentials' }, { status: 500 })
    const ssml = `<speak version='1.0' xml:lang='en-US'><voice name='en-US-JennyNeural'><prosody rate='-10%' pitch='-5%'>${script}</prosody></voice></speak>`
    const response = await fetch('https://' + region + '.tts.speech.microsoft.com/cognitiveservices/v1', {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-48khz-192kbitrate-mono-mp3'
      },
      body: ssml
    })
    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: 'Azure TTS: ' + err }, { status: 500 })
    }
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return NextResponse.json({ audio: base64 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
