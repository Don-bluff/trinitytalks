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
        const response = await fetch(`/api/notion/database/${encodeURIComponent(dbId)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }

        const data = (await response.json()) as { items?: NotionListItem[] };
        if (!cancelled) {
          setItems(data.items ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dbId]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10 md:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#e5e5e5] md:text-3xl">{pageTitle}</h1>
          <p className="mt-2 text-sm text-[#9ca3af]">{pageSubtitle}</p>
        </div>
        <Link
          href="/"
          className="rounded-md border border-[#222222] bg-[#111111] px-3 py-2 text-sm text-[#d1d5db] transition-colors hover:border-[#06b6d4]/60 hover:text-[#06b6d4]"
        >
          Back
        </Link>
      </div>

      {loading ? <p className="text-[#9ca3af]">Loading...</p> : null}
      {error ? <p className="text-red-400">{error}</p> : null}

      {!loading && !error ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`${basePath}/${item.id}`}
              className="group block overflow-hidden rounded-xl border border-[#222222] bg-[#111111] transition-all hover:-translate-y-[1px] hover:border-[#06b6d4]/60"
            >
              {item.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.cover}
                  alt={item.title}
                  className="h-44 w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                />
              ) : (
                <div className="h-44 w-full bg-gradient-to-br from-[#111111] via-[#171717] to-[#0f172a]" />
              )}
              <div className="p-4">
                <h2 className="line-clamp-2 text-lg font-medium text-[#e5e5e5]">{item.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <p className="text-[#9ca3af]">No published content yet.</p>
      ) : null}
    </div>
  );
}
