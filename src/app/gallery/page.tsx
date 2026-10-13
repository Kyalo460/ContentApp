"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, Video, Image as ImageIcon, Filter } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContentCard, Lightbox } from "@/components/content/ContentCard";
import { ContentItem } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";

type FilterType = "all" | "image" | "video";

const filters: { key: FilterType; label: string; icon: typeof Video }[] = [
  { key: "all", label: "All", icon: LayoutGrid },
  { key: "video", label: "Videos", icon: Video },
  { key: "image", label: "Photos", icon: ImageIcon },
];

export default function GalleryPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [selected, setSelected] = useState<ContentItem | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/content");
        if (!res.ok) throw new Error("Failed to load content");
        const data = await res.json();
        if (!cancelled) setItems(data.content || []);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered =
    filter === "all" ? items : items.filter((item) => item.type === filter);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <section className="bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-950 border-b border-gray-100 dark:border-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-primary-700 dark:from-white dark:to-primary-400 bg-clip-text text-transparent">
                Gallery
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                Explore videos and photography from my latest work. Click any
                piece to view it in full.
              </p>
            </motion.div>

            <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2">
              <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mr-2">
                <Filter className="w-4 h-4" />
                Filter
              </span>
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === f.key
                      ? "text-white"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                  }`}
                  aria-pressed={filter === f.key}
                >
                  {filter === f.key && (
                    <motion.div
                      layoutId="activeFilter"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <f.icon className="w-4 h-4" />
                    {f.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="mb-6 break-inside-avoid">
                  <div
                    className="rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse-soft"
                    style={{ height: 200 + (i % 3) * 60 }}
                  />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <motion.div
              layout
              className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((item, i) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    onClick={setSelected}
                    priority={i < 4}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
      <AnimatePresence>
        {selected && (
          <Lightbox item={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-20"
    >
      <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center">
        <ImageIcon className="w-12 h-12 text-primary-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
        No content yet
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        Once your first video or photo is published, it will show up here in
        your gallery.
      </p>
      {user ? (
        <button onClick={() => router.push("/upload")} className="btn-primary">
          Upload Content
        </button>
      ) : (
        <Link href="/signup" className="btn-primary">
          Get Started
        </Link>
      )}
    </motion.div>
  );
}
