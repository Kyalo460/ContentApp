import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { uploadToCloudinary, getVideoThumbnailUrl } from '@/lib/cloudinary'
import { createContentItem } from '@/lib/db'

export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const tags = formData.get('tags') as string
    const isPublished = formData.get('isPublished') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const mimeType = file.type
    const isVideo = mimeType.startsWith('video/')
    const resourceType = isVideo ? 'video' : 'image'

    const tagArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []

    const uploadResult = await uploadToCloudinary(buffer, {
      folder: `contentapp/${user.id}`,
      resourceType,
      transformation: isVideo
        ? [{ quality: 'auto', format: 'auto' }]
        : [{ quality: 'auto', format: 'auto', width: 1920, height: 1080, crop: 'limit' }],
    })

    let thumbnailUrl: string | undefined
    if (isVideo) {
      thumbnailUrl = getVideoThumbnailUrl(uploadResult.publicId)
    }

    const contentItem = await createContentItem({
      title: title || file.name,
      description,
      type: isVideo ? 'video' : 'image',
      url: uploadResult.url,
      thumbnailUrl,
      width: uploadResult.width,
      height: uploadResult.height,
      duration: uploadResult.duration,
      fileSize: file.size,
      mimeType,
      tags: tagArray,
      isPublished,
      authorId: user.id,
    })

    if (contentItem.error) {
      throw contentItem.error
    }

    return NextResponse.json({
      success: true,
      content: contentItem.data,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}