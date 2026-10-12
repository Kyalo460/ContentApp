import type { Metadata } from 'next'
import Link from 'next/link'
import { Video, Heart, Sparkles, Shield, Users, Zap, Globe, Code } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'About',
  description: 'About ContentApp — a place for creators to share art, videos and live shows.',
}

const values = [
  {
    icon: Heart,
    title: 'Creators first',
    desc: 'No algorithms deciding who sees your work. Your followers see what you post, in order.',
  },
  {
    icon: Shield,
    title: 'Privacy focused',
    desc: 'No tracking pixels, no selling data, no ads. Your content belongs to you.',
  },
  {
    icon: Zap,
    title: 'Ridiculously fast',
    desc: 'Global CDN delivery means your videos and images load instantly for everyone.',
  },
  {
    icon: Code,
    title: 'Open by design',
    desc: 'Built on open-source tooling and open standards, so you are never locked in.',
  },
]

const stack = [
  { name: 'Next.js', desc: 'React framework & Vercel deployment' },
  { name: 'Supabase', desc: 'Auth, Postgres database & file storage' },
  { name: 'Cloudinary', desc: 'Image & video hosting, optimization, streaming' },
  { name: 'Livepeer / Mux', desc: 'Low-latency live streaming' },
  { name: 'Tailwind CSS', desc: 'Design system & styling' },
  { name: 'Framer Motion', desc: 'Animation & micro-interactions' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <section className="relative overflow-hidden border-b border-gray-100 dark:border-gray-900">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8 border border-primary-100 dark:border-primary-800">
              <Sparkles className="w-4 h-4" />
              About ContentApp
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-primary-700 to-accent-700 dark:from-white dark:via-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
              A home for your art
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
              ContentApp is a simple, beautiful platform for sharing videos, pictures and live shows
              with the people who care about your work. No feed, no noise — just your creativity.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">What we believe</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v) => (
                <div key={v.title} className="card p-6 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-5">
                    <v.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{v.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Built on open source</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  Everything here runs on the free tiers of world-class open services, so hosting
                  stays free while your audience grows. Deploy in minutes, scale to millions.
                </p>
                <ul className="space-y-3">
                  {stack.map((s) => (
                    <li key={s.name} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Users className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{s.name}</span>
                        <span className="block text-sm text-gray-500 dark:text-gray-400">{s.desc}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary-500 via-accent-500 to-primary-600 p-1 shadow-2xl shadow-primary-500/25">
                  <div className="w-full h-full rounded-[calc(1.5rem-2px)] bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
                    <Video className="w-16 h-16 text-primary-500 mb-6" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                      Ready when you are
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                      Upload your first piece and see it come to life in a gallery you own.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href="/upload" className="btn-primary">Upload Content</Link>
                      <Link href="/gallery" className="btn-secondary">
                        <Globe className="w-4 h-4" />
                        Explore
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl bg-accent-500/20 blur-2xl" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-2xl bg-primary-500/20 blur-2xl" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Get in touch</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Questions, feedback or ideas? I&apos;d love to hear from you.
            </p>
            <a href="mailto:hello@contentapp.com" className="btn-secondary">
              hello@contentapp.com
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}