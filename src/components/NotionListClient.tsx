"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NotionListItem = {
  id: string;
  title: string;
  cover: string | null;
  isDraft: boolean;
  isEng: boolean;
};

type Props = {
  dbId: string;
  basePath: "/column" | "/money";
  pageTitle: string;
  pageSubtitle: string;
};

export default function NotionListClient({ dbId, basePath, pageTitle, pageSubtitle }: Props) {
  const [items, setItems] = useState<NotionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/notion/database/${encodeURIComponent(dbId)}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = (await res.json()) as { items?: NotionListItem[] };
        if (!cancelled) setItems(data.items ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [dbId]);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8">
      {/* Header */}
      <div className="mb-10">
        <Link href="/" className="mb-4 inline-flex items-center gap-1 text-xs text-[#555] transition-colors hover:text-[#06b6d4]">
          <span>←</span> <span>首页</span>
        </Link>
        <h1 className="text-3xl font-bold text-white md:text-4xl">{pageTitle}</h1>
        <p className="mt-2 text-sm text-[#666]">{pageSubtitle}</p>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-[#1a1a1a] bg-[#111]">
              <div className="h-40 rounded-t-xl bg-[#181818]" />
              <div className="p-4"><div className="h-4 w-3/4 rounded bg-[#1a1a1a]" /></div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Grid */}
      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`${basePath}/${item.id}`}
              className="group overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#111] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#06b6d4]/30 hover:shadow-lg hover:shadow-[#06b6d4]/5"
            >
              {item.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.cover}
                  alt={item.title}
                  className="h-40 w-full object-cover opacity-85 transition-all duration-500 group-hover:opacity-100 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-[#111] to-[#0a1628]">
                  <span className="text-3xl opacity-20">✦</span>
                </div>
              )}
              <div className="p-4">
                <h2 className="line-clamp-2 text-[15px] font-medium leading-snug text-[#e5e5e5] transition-colors group-hover:text-white">
                  {item.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="flex flex-col items-center py-20 text-[#555]">
          <span className="text-4xl mb-3">✦</span>
          <p className="text-sm">暂无已发布内容</p>
        </div>
      )}
    </div>
  );
}
