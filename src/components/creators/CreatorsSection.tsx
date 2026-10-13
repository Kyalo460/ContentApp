"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, AlertCircle } from "lucide-react";

interface Creator {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  isAdmin: boolean;
}

export function CreatorsSection() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/creators");
        if (!res.ok) throw new Error("Failed to load creators");
        const data = await res.json();
        setCreators(data.creators || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="py-24 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Browse creators
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Discover artists, photographers and filmmakers sharing their work.
            </p>
          </div>
          <Link href="/creators" className="btn-ghost">
            View all creators
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse-soft">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-4" />
                <div className="h-4 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
                <div className="h-4 rounded bg-gray-200 dark:bg-gray-700 w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-16 card">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center">
              <User className="w-10 h-10 text-primary-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No creators yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              Be the first to sign up and start sharing your art with the world.
            </p>
            <Link href="/signup" className="btn-primary">
              Get Started
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {creators.map((creator, i) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card-hover p-6 text-center"
              >
                {creator.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={creator.avatarUrl}
                    alt={creator.displayName}
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-4 ring-4 ring-gray-100 dark:ring-gray-800"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 ring-4 ring-gray-100 dark:ring-gray-800">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {creator.displayName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  @{creator.username}
                </p>
                {creator.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {creator.bio}
                  </p>
                )}
                <Link
                  href={`/gallery`}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  View gallery â†’
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
