'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Play, ImageIcon, Eye, Heart, Clock, Maximize2 } from 'lucide-react'
import { ContentItem } from '@/lib/types'
import { format, formatDistanceToNow } from 'date-fns'

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

interface ContentCardProps {
  item: ContentItem
  onClick: (item: ContentItem) => void
  priority?: boolean
}

export function ContentCard({ item, onClick, priority = false }: ContentCardProps) {
  const [hovering, setHovering] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isVideo = item.type === 'video'

  const handleMouseEnter = () => {
    setHovering(true)
    if (videoRef.current && isVideo) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    }
  }

  const handleMouseLeave = () => {
    setHovering(false)
    if (videoRef.current && isVideo) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(item)}
      className="group relative break-inside-avoid mb-6 cursor-pointer rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 ring-1 ring-gray-200/60 dark:ring-gray-700/60 hover:ring-primary-400/60"
    >
      {/* Media */}
      <div className="relative">
        {isVideo ? (
          <>
            <video
              ref={videoRef}
              src={item.url}
              poster={item.thumbnailUrl}
              muted
              loop
              playsInline
              preload={priority ? 'auto' : 'metadata'}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {!hovering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-opacity">
                <div className="w-14 h-14 rounded-full bg-white/95 dark:bg-gray-900/95 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 text-primary-600 dark:text-primary-400 ml-1" fill="currentColor" />
                </div>
              </div>
            )}
          </>
        ) : (
          item.url && (
            <div className="relative aspect-auto">
              <Image
                src={item.thumbnailUrl || item.url}
                alt={item.title}
                width={item.width && item.width > 0 ? item.width : 800}
                height={item.height && item.height > 0 ? item.height : 800}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={priority}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )
        )}

        {/* Type badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
          {isVideo ? <Play className="w-3.5 h-3.5" fill="currentColor" /> : <ImageIcon className="w-3.5 h-3.5" />}
          {isVideo ? 'Video' : 'Image'}
        </div>

        {/* Expand button */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-2 rounded-lg bg-black/60 backdrop-blur-sm text-white">
            <Maximize2 className="w-4 h-4" />
          </div>
        </div>

        {/* Duration badge */}
        {isVideo && item.duration ? (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm text-white text-xs font-medium">
            <Clock className="w-3 h-3" />
            {formatDuration(item.duration)}
          </div>
        ) : null}

        {/* Hover overlay with stats */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <h3 className="text-white font-semibold text-base mb-1 line-clamp-1">{item.title}</h3>
          {item.description && (
            <p className="text-white/80 text-sm line-clamp-2 mb-3">{item.description}</p>
          )}
          <div className="flex items-center gap-4 text-white/90 text-sm">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {item.viewCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4" />
              {item.likeCount.toLocaleString()}
            </span>
            <span className="ml-auto text-white/70 text-xs">
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface LightboxProps {
  item: ContentItem | null
  onClose: () => void
}

export function Lightbox({ item, onClose }: LightboxProps) {
  const [liked, setLiked] = useState(false)

  if (!item) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-6xl max-h-full flex flex-col lg:flex-row gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          {item.type === 'video' ? (
            <video
              src={item.url}
              poster={item.thumbnailUrl}
              controls
              autoPlay
              playsInline
              className="max-w-full max-h-[75vh] rounded-xl shadow-2xl"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- remote, user-provided media URLs are already optimized by the CDN
            <img
              src={item.url}
              alt={item.title}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
            />
          )}
        </div>

        {/* Info panel */}
        <div className="lg:w-80 flex-shrink-0 bg-gray-900/80 backdrop-blur rounded-2xl p-6 border border-white/10 overflow-y-auto max-h-[75vh] lg:max-h-[80vh]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">{item.title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {item.description && (
            <p className="text-gray-300 text-sm leading-relaxed mb-6">{item.description}</p>
          )}

          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                liked
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} />
              {item.likeCount + (liked ? 1 : 0)}
            </button>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Eye className="w-4 h-4" />
              {item.viewCount.toLocaleString()} views
            </div>
          </div>

          <dl className="space-y-3 text-sm border-t border-white/10 pt-4">
            <div className="flex justify-between">
              <dt className="text-gray-500">Type</dt>
              <dd className="text-gray-300 capitalize">{item.type}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Published</dt>
              <dd className="text-gray-300">
                {item.publishedAt ? format(new Date(item.publishedAt), 'MMM d, yyyy') : '—'}
              </dd>
            </div>
            {item.width && item.height ? (
              <div className="flex justify-between">
                <dt className="text-gray-500">Dimensions</dt>
                <dd className="text-gray-300">
                  {item.width} × {item.height}
                </dd>
              </div>
            ) : null}
            {item.fileSize ? (
              <div className="flex justify-between">
                <dt className="text-gray-500">File size</dt>
                <dd className="text-gray-300">
                  {(item.fileSize / 1024 / 1024).toFixed(1)} MB
                </dd>
              </div>
            ) : null}
          </dl>

          {item.tags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-gray-500 text-sm mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-white/10 text-gray-300 text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}