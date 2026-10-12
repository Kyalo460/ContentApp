import { NextRequest, NextResponse } from 'next/server'
import { getContentItems } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams

    const { data, error } = await getContentItems({
      type: (searchParams.get('type') as 'image' | 'video' | 'live' | null) || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      publishedOnly: searchParams.get('publishedOnly') !== 'false',
    })

    if (error) {
      throw error
    }

    return NextResponse.json({ content: data })
  } catch (error) {
    // Let Next.js prune/prerender-control digests propagate instead of logging them.
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error
    }
    console.error('Fetch content error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch content' },
      { status: 500 }
    )
  }
}