import { NextRequest, NextResponse } from 'next/server'
import { getLiveStreams, createLiveStream } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import { createLivepeerStream } from '@/lib/livepeer'

export async function GET() {
  try {
    const { data, error } = await getLiveStreams()

    if (error) {
      throw error
    }

    return NextResponse.json({ streams: data })
  } catch (error) {
    console.error('Fetch live streams error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch live streams' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description } = body

    // Create the ingest stream on the provider so we can show a real stream key.
    const provider = await createLivepeerStream(title || 'Untitled stream')
    if (!provider) {
      return NextResponse.json(
        { error: 'Streaming provider not configured. Set LIVEPEER_API_KEY.' },
        { status: 503 }
      )
    }

    const { data, error } = await createLiveStream({
      title: title || 'Untitled stream',
      description,
      streamKey: provider.streamKey,
      playbackUrl: provider.playbackUrl,
      status: 'idle',
      authorId: user.id,
    })

    if (error) {
      throw error
    }

    return NextResponse.json({ stream: data })
  } catch (error) {
    console.error('Create live stream error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create live stream' },
      { status: 500 }
    )
  }
}