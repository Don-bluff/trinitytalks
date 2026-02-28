"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import NotionBlockRenderer from "@/components/NotionBlockRenderer";

type NotionBlock = Record<string, unknown>;

type Props = {
  pageId: string;
  backHref: "/column" | "/money";
};

export default function NotionDetailClient({ pageId, backHref }: Props) {
  const [blocks, setBlocks] = useState<NotionBlock[]>([]);
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/notion/page/${encodeURIComponent(pageId)}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch page");
        const data = (await res.json()) as { blocks?: NotionBlock[]; title?: string };
        if (!cancelled) {
          setBlocks(data.blocks ?? []);
          setTitle(data.title ?? "");
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [pageId]);

  const backLabel = backHref === "/column" ? "三元专栏" : "搞钱之路";

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 md:px-8">
      <Link
        href={backHref}
        className="mb-8 inline-flex items-center gap-1 text-xs text-[#555] transition-colors hover:text-[#06b6d4]"
      >
        <span>←</span> <span>{backLabel}</span>
      </Link>

      {loading && (
        <div className="animate-pulse space-y-4 pt-4">
          <div className="h-8 w-2/3 rounded bg-[#1a1a1a]" />
          <div className="h-4 w-full rounded bg-[#151515]" />
          <div className="h-4 w-5/6 rounded bg-[#151515]" />
          <div className="h-4 w-4/6 rounded bg-[#151515]" />
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {!loading && !error && (
        <>
          {title && (
            <h1 className="mb-8 text-3xl font-bold leading-tight text-white md:text-4xl">{title}</h1>
          )}
          <div className="prose-dark">
            <NotionBlockRenderer blocks={blocks} />
          </div>
        </>
      )}
    </div>
  );
}
