"use client";

import type { CSSProperties, ReactNode } from "react";
import SrtPlayer from "@/components/SrtPlayer";

type Annotations = {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  code?: boolean;
  color?: string;
};

type RichTextItem = {
  plain_text?: string;
  href?: string | null;
  annotations?: Annotations;
  text?: { link?: { url?: string | null } | null };
};

type NotionBlock = {
  id?: string;
  type?: string;
  children?: NotionBlock[];
  [key: string]: unknown;
};

type Props = {
  blocks: NotionBlock[];
};

const colorStyles: Record<string, CSSProperties> = {
  default: {},
  gray: { color: "#9ca3af" },
  brown: { color: "#b08d57" },
  orange: { color: "#fb923c" },
  yellow: { color: "#facc15" },
  green: { color: "#4ade80" },
  blue: { color: "#60a5fa" },
  purple: { color: "#a78bfa" },
  pink: { color: "#f472b6" },
  red: { color: "#f87171" },
  gray_background: { backgroundColor: "#374151", padding: "0 2px", borderRadius: 4 },
  brown_background: { backgroundColor: "#4b2e2a", padding: "0 2px", borderRadius: 4 },
  orange_background: { backgroundColor: "#7c2d12", padding: "0 2px", borderRadius: 4 },
  yellow_background: { backgroundColor: "#713f12", padding: "0 2px", borderRadius: 4 },
  green_background: { backgroundColor: "#14532d", padding: "0 2px", borderRadius: 4 },
  blue_background: { backgroundColor: "#1e3a8a", padding: "0 2px", borderRadius: 4 },
  purple_background: { backgroundColor: "#4c1d95", padding: "0 2px", borderRadius: 4 },
  pink_background: { backgroundColor: "#831843", padding: "0 2px", borderRadius: 4 },
  red_background: { backgroundColor: "#7f1d1d", padding: "0 2px", borderRadius: 4 },
};

function safeRichText(value: unknown): RichTextItem[] {
  return Array.isArray(value) ? (value as RichTextItem[]) : [];
}

function renderRichText(richText: RichTextItem[]): ReactNode {
  if (!richText.length) return null;

  return richText.map((item, index) => {
    const annotations = item.annotations ?? {};
    const color = annotations.color ?? "default";
    const style: CSSProperties = {
      ...(annotations.bold ? { fontWeight: 700 } : {}),
      ...(annotations.italic ? { fontStyle: "italic" } : {}),
      ...(annotations.strikethrough ? { textDecorationLine: "line-through" } : {}),
      ...(annotations.underline ? { textDecorationLine: "underline" } : {}),
      ...(colorStyles[color] ?? {}),
    };

    const textContent = annotations.code ? (
      <code className="rounded bg-[#1f2937] px-1 py-0.5 text-[0.9em]">{item.plain_text}</code>
    ) : (
      item.plain_text
    );

    const url = item.href ?? item.text?.link?.url;
    if (url) {
      return (
        <a
          key={`${item.plain_text ?? "text"}-${index}`}
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="text-[#22d3ee] underline decoration-[#22d3ee]/60 underline-offset-4"
          style={style}
        >
          {textContent}
        </a>
      );
    }

    return (
      <span key={`${item.plain_text ?? "text"}-${index}`} style={style}>
        {textContent}
      </span>
    );
  });
}

function getBlockData(block: NotionBlock): Record<string, unknown> {
  const type = block.type;
  if (!type) return {};
  const data = block[type];
  if (data && typeof data === "object") {
    return data as Record<string, unknown>;
  }
  return {};
}

function getMediaUrl(data: Record<string, unknown>): string | null {
  const mediaType = data.type;
  if (mediaType === "external") {
    const external = data.external as { url?: string } | undefined;
    return external?.url ?? null;
  }
  if (mediaType === "file") {
    const file = data.file as { url?: string } | undefined;
    return file?.url ?? null;
  }
  return null;
}

function renderChildren(children?: NotionBlock[]): ReactNode {
  if (!children?.length) return null;
  return <NotionBlockRenderer blocks={children} />;
}

function renderSingleBlock(block: NotionBlock): ReactNode {
  const type = block.type;
  const data = getBlockData(block);

  switch (type) {
    case "paragraph":
      return <p className="leading-8 text-[#d4d4d4]">{renderRichText(safeRichText(data.rich_text))}</p>;
    case "heading_1":
      return <h1 className="text-3xl font-semibold text-[#f3f4f6]">{renderRichText(safeRichText(data.rich_text))}</h1>;
    case "heading_2":
      return <h2 className="text-2xl font-semibold text-[#f3f4f6]">{renderRichText(safeRichText(data.rich_text))}</h2>;
    case "heading_3":
      return <h3 className="text-xl font-semibold text-[#f3f4f6]">{renderRichText(safeRichText(data.rich_text))}</h3>;
    case "quote":
      return (
        <blockquote className="border-l-2 border-[#22d3ee] pl-4 italic text-[#d1d5db]">
          {renderRichText(safeRichText(data.rich_text))}
        </blockquote>
      );
    case "callout": {
      const iconObj = data.icon as { emoji?: string } | undefined;
      const icon = iconObj?.emoji ?? "💡";
      return (
        <div className="rounded-lg border border-[#1f2937] bg-[#0f172a] p-4 text-[#d1d5db]">
          <div className="flex items-start gap-3">
            <span>{icon}</span>
            <div>{renderRichText(safeRichText(data.rich_text))}</div>
          </div>
          {renderChildren(block.children)}
        </div>
      );
    }
    case "code": {
      const language = typeof data.language === "string" ? data.language : "plain text";
      return (
        <pre className="overflow-x-auto rounded-lg border border-[#1f2937] bg-[#0b1220] p-4 text-sm text-[#d1d5db]">
          <code>
            <span className="mb-2 block text-xs uppercase tracking-wide text-[#60a5fa]">{language}</span>
            {safeRichText(data.rich_text).map((item, index) => (
              <span key={`${item.plain_text ?? "code"}-${index}`}>{item.plain_text}</span>
            ))}
          </code>
        </pre>
      );
    }
    case "divider":
      return <hr className="border-[#222222]" />;
    case "toggle":
      return (
        <details className="rounded-md border border-[#222222] bg-[#111111] p-3">
          <summary className="cursor-pointer text-[#d1d5db]">{renderRichText(safeRichText(data.rich_text))}</summary>
          <div className="mt-3">{renderChildren(block.children)}</div>
        </details>
      );
    case "bookmark": {
      const url = typeof data.url === "string" ? data.url : "";
      return (
        <a
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="block rounded-md border border-[#222222] bg-[#111111] px-4 py-3 text-[#22d3ee] hover:border-[#22d3ee]/50"
        >
          {url}
        </a>
      );
    }
    case "embed": {
      const url = typeof data.url === "string" ? data.url : "";
      return (
        <a
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="block rounded-md border border-[#222222] bg-[#111111] px-4 py-3 text-[#22d3ee] hover:border-[#22d3ee]/50"
        >
          Embedded content: {url}
        </a>
      );
    }
    case "image": {
      const url = getMediaUrl(data);
      const caption = renderRichText(safeRichText(data.caption));
      if (!url) return null;
      return (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Notion image" className="w-full rounded-lg border border-[#1f2937]" />
          {caption ? <figcaption className="mt-2 text-sm text-[#9ca3af]">{caption}</figcaption> : null}
        </figure>
      );
    }
    case "audio": {
      const url = getMediaUrl(data);
      if (!url) return null;
      return <audio controls src={url} className="w-full" preload="none" />;
    }
    case "video": {
      const url = getMediaUrl(data);
      if (!url) return null;
      return <video controls src={url} className="w-full rounded-lg border border-[#1f2937]" preload="metadata" />;
    }
    case "file": {
      const url = getMediaUrl(data);
      const name = typeof data.name === "string" ? data.name : "Download file";
      if (!url) return null;
      // Render SRT player for subtitle files
      if (name.toLowerCase().endsWith(".srt")) {
        return <SrtPlayer srtUrl={url} />;
      }
      return (
        <a
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex rounded-md border border-[#222222] bg-[#111111] px-3 py-2 text-[#22d3ee] hover:border-[#22d3ee]/50"
        >
          {name}
        </a>
      );
    }
    default:
      return null;
  }
}

export default function NotionBlockRenderer({ blocks }: Props) {
  const elements: ReactNode[] = [];
  let listBuffer: NotionBlock[] = [];
  let listType: "bulleted_list_item" | "numbered_list_item" | null = null;

  const flushList = () => {
    if (!listType || listBuffer.length === 0) return;

    const ListTag = listType === "bulleted_list_item" ? "ul" : "ol";
    const className =
      listType === "bulleted_list_item"
        ? "list-disc space-y-2 pl-6 text-[#d4d4d4]"
        : "list-decimal space-y-2 pl-6 text-[#d4d4d4]";

    elements.push(
      <ListTag key={`list-${elements.length}`} className={className}>
        {listBuffer.map((block, index) => {
          const data = getBlockData(block);
          return (
            <li key={block.id ?? `item-${index}`}>
              <div>{renderRichText(safeRichText(data.rich_text))}</div>
              {block.children?.length ? <div className="mt-2">{renderChildren(block.children)}</div> : null}
            </li>
          );
        })}
      </ListTag>,
    );

    listBuffer = [];
    listType = null;
  };

  for (const block of blocks) {
    if (block.type === "bulleted_list_item" || block.type === "numbered_list_item") {
      if (!listType || listType === block.type) {
        listType = block.type;
        listBuffer.push(block);
        continue;
      }

      flushList();
      listType = block.type;
      listBuffer.push(block);
      continue;
    }

    flushList();
    const rendered = renderSingleBlock(block);
    if (rendered) {
      elements.push(
        <div key={block.id ?? `block-${elements.length}`} className="my-4">
          {rendered}
        </div>,
      );
    }
  }

  flushList();

  return <article className="space-y-2 text-base">{elements}</article>;
}
