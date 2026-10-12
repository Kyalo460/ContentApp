'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Radio,
  Copy,
  Check,
  CircleDot,
  ArrowLeft,
  AlertCircle,
  Loader2,
  ExternalLink,
  Play,
  Square,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { LiveStream } from '@/lib/types'

// Livepeer (free tier: 1000 streaming minutes/month) â€” https://livepeer.studio
const rtmpBaseUrl = 'rtmp://rtmp.livepeer.studio/live'

export default function DashboardLivePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [stream, setStream] = useState<LiveStream | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [ending, setEnding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 pt-16">
          <div className="text-center card p-12 max-w-md">
            <Radio className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Sign in required</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You need to be signed in to start a live show.</p>
            <Link href="/login?redirect=/dashboard/live" className="btn-primary">Sign In</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const createStream = async () => {
    setCreating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setCreating(false)
        return
      }

      const res = await fetch('/api/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ title: title || 'Untitled stream', description, status: 'idle' }),
      })
      if (!res.ok) {
        throw new Error('Failed to create stream')
      }
      const data = await res.json()
      setStream(data.stream)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create stream')
    } finally {
      setCreating(false)
    }
  }

  const goLive = async () => {
    if (!stream) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await fetch(`/api/live/${stream.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ status: 'live' }),
        })
      }
      setStream({ ...stream, status: 'live', startedAt: new Date().toISOString() })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start stream')
    }
  }

  const endStream = async () => {
    if (!stream) return
    setEnding(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await fetch(`/api/live/${stream.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ status: 'ended' }),
        })
      }
      setStream(null)
      router.push('/live')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end stream')
    } finally {
      setEnding(false)
    }
  }


  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-primary-700 dark:from-white dark:to-primary-400 bg-clip-text text-transparent">
              Start a Live Show
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-10">
            Set up a stream, then broadcast from OBS or your phone.
          </p>

          {!stream ? (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={(e) => { e.preventDefault(); createStream(); }}
              className="space-y-6 p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
            >
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="stitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stream title</label>
                <input id="stitle" value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Live studio session" />
              </div>
              <div>
                <label htmlFor="sdesc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea id="sdesc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="input resize-none" placeholder="What will you be showing?" />
              </div>
              <button type="submit" disabled={creating} className="btn-primary w-full py-3.5">
                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Radio className="w-5 h-5" /> Create Stream</>}
              </button>
            </motion.form>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              {stream.status === 'live' && (
                <div className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500 text-white font-bold uppercase tracking-wider text-sm">
                  <CircleDot className="w-4 h-4 animate-pulse" />
                  You are live
                </div>
              )}

              <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{stream.title}</h2>

              <div>
                <CopyField label="RTMP Ingest URL" value={rtmpBaseUrl} copy={copy} copied={copied} id="ingest" />
                <CopyField label="Stream Key" value={stream.streamKey} copy={copy} copied={copied} id="key" secret />

                {stream.playbackUrl ? (
                  <CopyField label="Playback URL" value={stream.playbackUrl} copy={copy} copied={copied} id="playback" />
                ) : (
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
                    Playback URL appears once your provider creates the stream.
                  </div>
                )}
              </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Play className="w-4 h-4 text-primary-500" />
                    Next: open OBS Studio
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Settings â†’ Stream â†’ Service: <span className="font-medium">Custom</span>, then paste the ingest URL and key.
                  </p>
                  <a href="https://obsproject.com/download" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline">
                    Download OBS (free)
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                {stream.status !== 'live' ? (
                  <button onClick={goLive} className="btn-primary flex-1">
                    <Radio className="w-5 h-5" />
                    Go Live Now
                  </button>
                ) : (
                  <button onClick={endStream} disabled={ending} className="btn-danger flex-1">
                    {ending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Square className="w-5 h-5" /> End Stream</>}
                  </button>
                )}
                <button onClick={() => setStream(null)} className="btn-ghost">Reset</button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function CopyField({ label, value, copy, copied, id, secret }: {
  label: string
  value: string
  copy: (text: string, key: string) => void
  copied: string | null
  id: string
  secret?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <div className="flex gap-2">
        <input
          readOnly
          value={value}
          type={secret ? 'password' : 'text'}
          onFocus={(e) => e.currentTarget.select()}
          className="input font-mono text-sm"
        />
        <button
          type="button"
          onClick={() => copy(value, id)}
          className={`px-4 rounded-xl border transition-colors flex-shrink-0 ${
            copied === id
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          aria-label={`Copy ${label}`}
        >
          {copied === id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}
