import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req) {
  try {
    const { topic } = await req.json()
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 })
    }
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: 'You are a YouTube scriptwriter. Write a short 60-second video script for the topic: "' + topic + '". Return ONLY a JSON object with these fields: { "title": "YouTube title max 70 chars", "description": "YouTube description 100-150 words", "tags": ["tag1","tag2","tag3"], "script": "the full narration script" }'
      }]
    })
    const text = message.content[0].text
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)[0])
    return NextResponse.json(json)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
