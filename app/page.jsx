'use client'
import { useState } from 'react'

const steps = ['Generating Script', 'Creating Voiceover', 'Rendering Video', 'Publishing to YouTube']

export default function Home() {
  const [topic, setTopic] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function generate() {
    if (!topic || !accessToken) return alert('Please enter both topic and access token')
    setLoading(true)
    setError('')
    setResult(null)
    setCurrentStep(0)

    try {
      setStatus('Generating script with Claude...')
      const scriptRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      })
      const scriptData = await scriptRes.json()
      if (!scriptRes.ok) throw new Error(scriptData.error || 'Failed to generate script')

      setCurrentStep(1)
      setStatus('Creating voiceover with ElevenLabs...')
      const voiceRes = await fetch('/api/voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: scriptData.script })
      })
      const voiceData = await voiceRes.json()
      if (!voiceRes.ok) throw new Error(voiceData.error || 'Failed to create voiceover')

      setCurrentStep(2)
      setStatus('Rendering video with Shotstack...')
      const videoRes = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: voiceData.audio, title: scriptData.title })
      })
      const videoData = await videoRes.json()
      if (!videoRes.ok) throw new Error(videoData.error || 'Failed to start video render')

      setStatus('Waiting for video to render (this takes 3-5 minutes)...')
      let videoUrl = null
      let attempts = 0
      while (!videoUrl && attempts < 60) {
        await new Promise(r => setTimeout(r, 5000))
        const pollRes = await fetch(`/api/video?id=${videoData.renderId}`)
        const pollData = await pollRes.json()
        if (pollData.status === 'done') videoUrl = pollData.url
        else if (pollData.status === 'failed') throw new Error('Video render failed')
        attempts++
      }
      if (!videoUrl) throw new Error('Video render timed out')

      setCurrentStep(3)
      setStatus('Publishing to YouTube...')
      const pubRes = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          title: scriptData.title,
          description: scriptData.description,
          tags: scriptData.tags,
          accessToken
        })
      })
      const pubData = await pubRes.json()
      if (!pubRes.ok) throw new Error(pubData.error || 'Failed to publish to YouTube')

      setResult(pubData)
      setStatus('Video published successfully!')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: '60px auto', padding: '0 24px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>YouTube Auto Publisher</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Type a topic. Get a published YouTube video.</p>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>Video topic</label>
        <input value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="e.g. Why smart people self-sabotage"
          style={{ width: '100%', padding: '10px 14px', fontSize: 15, border: '1px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>YouTube access token</label>
        <input value={accessToken} onChange={e => setAccessToken(e.target.value)}
          placeholder="Paste your OAuth access token"
