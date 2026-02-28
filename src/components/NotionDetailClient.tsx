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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/notion/page/${encodeURIComponent(pageId)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch page");
        }

        const data = (await response.json()) as { blocks?: NotionBlock[] };
        if (!cancelled) {
          setBlocks(data.blocks ?? []);
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
  }, [pageId]);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-8">
      <div className="mb-8">
        <Link
          href={backHref}
          className="inline-flex rounded-md border border-[#222222] bg-[#111111] px-3 py-2 text-sm text-[#d1d5db] transition-colors hover:border-[#06b6d4]/60 hover:text-[#06b6d4]"
        >
          Back
        </Link>
      </div>

      {loading ? <p className="text-[#9ca3af]">Loading...</p> : null}
      {error ? <p className="text-red-400">{error}</p> : null}
      {!loading && !error ? <NotionBlockRenderer blocks={blocks} /> : null}
    </div>
  );
}
