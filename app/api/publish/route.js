import { google } from 'googleapis'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { videoUrl, title, description, tags, accessToken } = await req.json()

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
    oauth2Client.setCredentials({ access_token: accessToken })
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

    const videoRes = await fetch(videoUrl)
    const videoArrayBuffer = await videoRes.arrayBuffer()
    const videoBuffer = Buffer.from(videoArrayBuffer)

    const { Readable } = require('stream')
    const stream = new Readable()
    stream.push(videoBuffer)
    stream.push(null)

    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: title,
          description: description || '',
          tags: tags || [],
          categoryId: '27'
        },
        status: { privacyStatus: 'public' }
      },
      media: { mimeType: 'video/mp4', body: stream }
    })

    return NextResponse.json({
      videoId: response.data.id,
      url: 'https://youtube.com/watch?v=' + response.data.id
    })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
