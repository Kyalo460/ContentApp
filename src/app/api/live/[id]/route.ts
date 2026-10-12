import { NextRequest, NextResponse } from 'next/server'
import { updateLiveStream } from '@/lib/db'
import { supabase } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const patch: Record<string, unknown> = { ...body }
    if (body.status === 'live') patch.startedAt = new Date().toISOString()
    if (body.status === 'ended') patch.endedAt = new Date().toISOString()

    const { data, error } = await updateLiveStream(id, patch)

    if (error) {
      throw error
    }

    return NextResponse.json({ stream: data })
  } catch (error) {
    console.error('Update live stream error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update live stream' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { error } = await supabase
      .from('live_streams')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete live stream error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete live stream' },
      { status: 500 }
    )
  }
}