import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req) {
  try {
    const { topic } = await req.json()
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `You are a YouTube psychology channel scriptwriter. Write a complete video script for the topic: "${topic}". Return ONLY a JSON object with these fields: { "title": "YouTube title max 70 chars", "description": "YouTube description 200-300 words", "tags": ["tag1","tag2","tag3","tag4","tag5"], "script": "Full narration script plain text only around 800 words" }`
      }]
    })
    const text = message.content[0].text
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)[0])
    return NextResponse.json(json)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
