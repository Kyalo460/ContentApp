import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadToCloudinary(
  file: Buffer | string,
  options: {
    folder?: string
    resourceType?: 'image' | 'video' | 'raw' | 'auto'
    transformation?: unknown
    publicId?: string
  } = {}
): Promise<{ url: string; publicId: string; width?: number; height?: number; duration?: number }> {
  const { folder = 'contentapp', resourceType = 'auto', transformation, publicId } = options

  const uploadOptions: Record<string, unknown> = {
    folder,
    resource_type: resourceType,
  }
  if (transformation) uploadOptions.transformation = transformation
  if (publicId) uploadOptions.public_id = publicId

  const result = await new Promise<{
    secure_url: string
    public_id: string
    width?: number
    height?: number
    duration?: number
  }>((resolve, reject) => {
    const callback = (error: unknown, res?: unknown) => {
      if (error) {
        reject(error instanceof Error ? error : new Error(String(error)))
        return
      }
      if (!res) {
        reject(new Error('No result from Cloudinary'))
        return
      }
      resolve(res as { secure_url: string; public_id: string; width?: number; height?: number; duration?: number })
    }

    if (typeof file === 'string') {
      cloudinary.uploader.upload(file, uploadOptions, callback)
    } else {
      const stream = cloudinary.uploader.upload_stream(uploadOptions, callback)
      stream.end(file)
    }
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    duration: result.duration,
  }
}

export function getCloudinaryUrl(publicId: string, options: Record<string, unknown> = {}): string {
  return cloudinary.url(publicId, { secure: true, ...options })
}

export function getVideoThumbnailUrl(publicId: string, time = '00:00:01'): string {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'jpg',
    start_offset: time,
    width: 1280,
    height: 720,
    crop: 'fill',
    gravity: 'center',
    secure: true,
  })
}

export function getOptimizedImageUrl(publicId: string, width?: number, height?: number): string {
  return cloudinary.url(publicId, {
    resource_type: 'image',
    ...(width && height ? { width, height, crop: 'fill', gravity: 'auto' } : width ? { width, crop: 'scale' } : {}),
    quality: 'auto',
    format: 'auto',
    secure: true,
  })
}

export function getVideoUrl(publicId: string, options: Record<string, unknown> = {}): string {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    quality: 'auto',
    format: 'auto',
    ...options,
    secure: true,
  })
}