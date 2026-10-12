'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950" />
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 rounded-full bg-accent-500/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl"
        >
          <div className="flex justify-center mb-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              ContentApp
            </div>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  )
}