'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud,
  X,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileVideo,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'

interface FileWithPreview {
  id: string
  file: File
  preview: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

const ACCEPTED = {
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif'],
  'video/*': ['.mp4', '.mov', '.webm', '.avi', '.mkv'],
}

const MAX_SIZE = 500 * 1024 * 1024 // 500MB

export default function UploadPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/upload')
    }
  }, [authLoading, user, router])

  const onDrop = useCallback((accepted: File[]) => {
    const withPreviews = accepted.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      progress: 0,
      status: 'pending' as const,
    }))
    setFiles((prev) => [...prev, ...withPreviews])
    if (!title && withPreviews[0]) {
      setTitle(withPreviews[0].file.name.replace(/\.[^/.]+$/, ''))
    }
  }, [title])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED as unknown as Record<string, string[]>,
    maxSize: MAX_SIZE,
    disabled: uploading,
  })

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id)
      if (target?.preview) URL.revokeObjectURL(target.preview)
      return prev.filter((f) => f.id !== id)
    })
  }

  const patchFile = (id: string, patch: Partial<FileWithPreview>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0) return

    setUploading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setUploading(false)
      router.push('/login?redirect=/upload')
      return
    }

    for (const f of files) {
      try {
        patchFile(f.id, { status: 'uploading', progress: 5 })
        const body = new FormData()
        body.append('file', f.file)
        body.append('title', title || f.file.name)
        body.append('description', description)
        body.append('tags', tags)
        body.append('isPublished', String(isPublished))

        const res = await new Promise<{ ok: boolean; body: XMLHttpRequest }>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('POST', '/api/upload')
          xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`)
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) patchFile(f.id, { progress: Math.round((ev.loaded / ev.total) * 90) + 5 })
          }
          xhr.onload = () => resolve({ ok: xhr.status >= 200 && xhr.status < 300, body: xhr })
          xhr.onerror = () => reject(new Error('Network error during upload'))
          xhr.send(body)
        })

        if (!res.ok) throw new Error(res.body.responseText || 'Upload failed')
        patchFile(f.id, { status: 'success', progress: 100 })
      } catch (err) {
        patchFile(f.id, { status: 'error', error: err instanceof Error ? err.message : 'Upload failed' })
      }
    }

    setUploading(false)
  }

  const doneCount = files.filter((f) => f.status === 'success').length

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-primary-700 dark:from-white dark:to-primary-400 bg-clip-text text-transparent">
              Upload Content
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-10">
              Share your latest video or artwork with your followers.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.01]'
                  : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-gray-50 dark:hover:bg-gray-900/50'
              } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
            >
              <input {...getInputProps()} aria-label="Upload files" />
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <motion.div
                  animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-6 shadow-xl shadow-primary-500/25"
                >
                  <UploadCloud className="w-10 h-10 text-white" strokeWidth={2} />
                </motion.div>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {isDragActive ? 'Drop it right here' : 'Drag & drop files here'}
                </p>
                <p className="text-gray-500 dark:text-gray-400 mb-4">or click to browse</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Supports images and videos up to 500MB
                </p>
              </div>
            </div>

            {/* Rejections */}
            {fileRejections.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Some files were rejected:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {fileRejections.map(({ file, errors }) => (
                      <li key={file.name}>
                        {file.name} — {errors[0]?.code === 'file-too-large' ? 'exceeds 500MB' : errors[0]?.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* File list */}
            <AnimatePresence>
              {files.length > 0 && (
                <motion.div layout className="space-y-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Files ({files.length})
                  </h2>
                  {files.map((f) => (
                    <motion.div
                      key={f.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                    >
                      {f.preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f.preview} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center flex-shrink-0">
                          {f.file.type.startsWith('video/') ? (
                            <FileVideo className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                          )}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{f.file.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {(f.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>

                        {f.status !== 'pending' && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full ${
                                  f.status === 'error'
                                    ? 'bg-red-500'
                                    : f.status === 'success'
                                    ? 'bg-green-500'
                                    : 'bg-gradient-to-r from-primary-500 to-accent-500'
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${f.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-9 text-right">
                              {f.status === 'error' ? '!' : `${f.progress}%`}
                            </span>
                          </div>
                        )}
                        {f.error && <p className="text-xs text-red-500 mt-1">{f.error}</p>}
                      </div>

                      {f.status === 'success' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                      ) : f.status === 'uploading' ? (
                        <Loader2 className="w-5 h-5 text-primary-500 animate-spin flex-shrink-0" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeFile(f.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 flex-shrink-0 transition-colors"
                          aria-label={`Remove ${f.file.name}`}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Metadata */}
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Details</h2>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input"
                    placeholder="Give your content a title"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="input resize-none"
                    placeholder="Tell your followers about this piece..."
                  />
                </div>
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags <span className="text-gray-400 font-normal">(comma separated)</span>
                  </label>
                  <input
                    id="tags"
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="input"
                    placeholder="art, portrait, digital"
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Publish immediately
                  </span>
                </label>
              </motion.div>
            )}

            {/* Submit */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={files.length === 0 || uploading}
                className="btn-primary px-8 py-3.5 text-base disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5" />
                    {doneCount > 0 ? `Upload ${files.length - doneCount} remaining` : `Upload ${files.length || ''} file${files.length === 1 ? '' : 's'}`}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-ghost"
                disabled={uploading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}