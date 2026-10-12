export type ContentType = 'image' | 'video' | 'live'

export interface ContentItem {
  id: string
  title: string
  description?: string
  type: ContentType
  url: string
  thumbnailUrl?: string
  duration?: number
  width?: number
  height?: number
  fileSize?: number
  mimeType?: string
  tags: string[]
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
  authorId: string
  viewCount: number
  likeCount: number
}

export interface LiveStream {
  id: string
  title: string
  description?: string
  streamKey: string
  playbackUrl: string
  status: 'idle' | 'live' | 'ended'
  startedAt?: string
  endedAt?: string
  viewerCount: number
  maxViewers: number
  thumbnailUrl?: string
  createdAt: string
  updatedAt: string
  authorId: string
}

export interface User {
  id: string
  email: string
  username: string
  displayName: string
  avatarUrl?: string
  bio?: string
  isAdmin: boolean
  createdAt: string
  updatedAt: string
}

export interface UploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
  contentId?: string
}