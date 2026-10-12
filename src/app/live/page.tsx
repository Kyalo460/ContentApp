'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Radio,
  CircleDot,
  Users,
  Play,
  Settings2,
  AlertCircle,
  Loader2,
  Video,
  MonitorPlay,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/components/auth/AuthProvider'
import { LiveStream } from '@/lib/types'

export default function LivePage() {
  const { user } = useAuth()
  const [streams, setStreams] = useState<LiveStream[]>([])
  const [loading, setLoading] = useState(true)
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/live')
        const data = await res.json()
        setStreams(data.streams || [])
      } catch {
        setStreams([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const liveStream = streams.find((s) => s.status === 'live')
  const upcoming = streams.filter((s) => s.status !== 'live')

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <section className="bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-950 border-b border-gray-100 dark:border-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-medium">
                  <CircleDot className="w-4 h-4 animate-pulse" />
                  Streaming
                </span>
                {liveStream && (
                  <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                    <Users className="w-4 h-4" />
                    {liveStream.viewerCount} watching
                  </span>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">Live Shows</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                Showcase your art in real time. Stream from OBS or directly from your phone to all your
                followers at once — no recording, no editing, just live.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Player section */}
              <div className="lg:col-span-2 space-y-8">
                {liveStream ? (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card overflow-hidden">
                    <div className="relative bg-black aspect-video">
                      <video
                        src={liveStream.playbackUrl}
                        controls
                        autoPlay
                        playsInline
                        poster={liveStream.thumbnailUrl}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-bold uppercase tracking-wide">Live</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {liveStream.viewerCount} viewers
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{liveStream.title}</h2>
                      {liveStream.description && (
                        <p className="text-gray-600 dark:text-gray-400">{liveStream.description}</p>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card aspect-video flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-gray-900 to-gray-800 border-0"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-6 shadow-2xl shadow-red-500/30 animate-pulse-soft">
                      <Video className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">No live show right now</h2>
                    <p className="text-gray-400 max-w-md mb-8">
                      When you go live, the stream will appear here and your followers will be notified.
                    </p>
                    {user ? (
                      <Link href="/dashboard/live" className="btn-primary">
                        <Radio className="w-5 h-5" />
                        Start a Live Show
                      </Link>
                    ) : (
                      <Link href="/login" className="btn-primary">
                        Sign in to go live
                      </Link>
                    )}
                  </motion.div>
                )}

                {/* Upcoming / past streams */}
                {upcoming.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Other streams</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {upcoming.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setActiveStream(s)}
                          className="card-hover p-4 flex gap-4 text-left"
                        >
                          <div className="w-24 h-16 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <MonitorPlay className="w-6 h-6 text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{s.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{s.status}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Setup sidebar */}
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    <Settings2 className="w-5 h-5 text-primary-500" />
                    Go live in 3 steps
                  </h3>
                  <ol className="space-y-4 text-sm">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold text-xs">1</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Create a stream in your <Link href="/dashboard/live" className="text-primary-600 dark:text-primary-400 hover:underline">dashboard</Link> to get a stream key.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold text-xs">2</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Open <span className="font-medium text-gray-900 dark:text-gray-100">OBS Studio</span> (free, open source), add a Media Source and paste the URL + key.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold text-xs">3</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Click <span className="font-medium text-gray-900 dark:text-gray-100">Start Streaming</span> — you&apos;re live automatically.
                      </span>
                    </li>
                  </ol>
                </div>

                <div className="card p-6 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Recommended tools</h3>
                  <ul className="space-y-3 text-sm">
                    {[
                      { name: 'OBS Studio', desc: 'Free, open-source streaming software' },
                      { name: 'Livepeer', desc: 'Decentralized streaming, 1000 min/mo free' },
                      { name: 'Mux', desc: 'Live streams, 1000 min/mo free' },
                      { name: 'Cloudflare Stream', desc: 'Alternative, pay as you go' },
                    ].map((tool) => (
                      <li key={tool.name} className="flex items-start gap-2">
                        <Play className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{tool.name}</span>
                          <span className="block text-gray-500 dark:text-gray-400">{tool.desc}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card p-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    Note
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ingest and playback URLs are generated by your streaming provider (Livepeer or Mux).
                    Configure them in <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">.env.local</code> to
                    enable streaming.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {activeStream && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setActiveStream(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="w-full max-w-4xl bg-gray-900 rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <video src={activeStream.playbackUrl} controls autoPlay className="w-full aspect-video bg-black" />
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-1">{activeStream.title}</h2>
              <p className="text-gray-400 text-sm capitalize">{activeStream.status}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}