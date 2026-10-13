"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, User, Search, AlertCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/components/auth/AuthProvider";

interface Creator {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  isAdmin: boolean;
}

export default function CreatorsPage() {
  const { user } = useAuth();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [filtered, setFiltered] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/creators");
        if (!res.ok) throw new Error("Failed to load creators");
        const data = await res.json();
        const list = data.creators || [];
        if (!cancelled) {
          setCreators(list);
          setFiltered(list);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
          setCreators([]);
          setFiltered([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(creators); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    const q = query.toLowerCase();
    const next = creators.filter(
      (c) =>
        c.username.toLowerCase().includes(q) ||
        c.displayName.toLowerCase().includes(q) ||
        (c.bio || "").toLowerCase().includes(q),
    );
    setFiltered(next);
  }, [query, creators]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <section className="bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-950 border-b border-gray-100 dark:border-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Creators
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Browse creators and their latest work. No sign-in required to
                explore.
              </p>
            </motion.div>

            <div className="relative max-w-md mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search creators..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input pl-10"
                aria-label="Search creators"
              />
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
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
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 card">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                No creators yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {query
                  ? "No creators match that search. Try a different term."
                  : "Creators will appear here once they sign up and publish content."}
              </p>
              {user ? null : (
                <Link href="/signup" className="btn-primary">
                  Get Started
                </Link>
              )}
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filtered.map((creator, i) => (
                <motion.div
                  key={creator.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="card-hover p-6 text-center"
                >
                  {creator.avatarUrl ? ( // eslint-disable-next-line @next/next/no-img-element
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
                    View gallery \u2192
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {creators.length > 0 && !loading && !error && (
            <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
              <Users className="w-4 h-4 inline mr-1" />
              {filtered.length} {filtered.length === 1 ? "creator" : "creators"}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
