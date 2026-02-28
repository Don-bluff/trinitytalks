"use client";

import { useEffect, useRef, useState } from "react";

type SrtEntry = {
  index: number;
  start: number; // seconds
  end: number;   // seconds
  text: string;
};

function parseSrtTime(timeStr: string): number {
  // Format: HH:MM:SS,mmm
  const [timePart, msPart] = timeStr.split(",");
  const [hh, mm, ss] = timePart.split(":").map(Number);
  const ms = Number(msPart ?? 0);
  return hh * 3600 + mm * 60 + ss + ms / 1000;
}

function parseSrt(content: string): SrtEntry[] {
  const entries: SrtEntry[] = [];
  // Normalize line endings
  const text = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  const blocks = text.split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 2) continue;

    const indexLine = lines[0].trim();
    const timeLine = lines[1].trim();
    const textLines = lines.slice(2).join("\n").trim();

    const index = parseInt(indexLine, 10);
    if (isNaN(index)) continue;

    const timeMatch = timeLine.match(
      /(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/
    );
    if (!timeMatch) continue;

    const start = parseSrtTime(timeMatch[1]);
    const end = parseSrtTime(timeMatch[2]);

    entries.push({ index, start, end, text: textLines });
  }

  return entries;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Props = {
  srtUrl: string;
  audioUrl?: string;
};

export default function SrtPlayer({ srtUrl, audioUrl }: Props) {
  const [entries, setEntries] = useState<SrtEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  // Fetch and parse the SRT file
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(srtUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch SRT: ${res.status}`);
        return res.text();
      })
      .then((text) => {
        const parsed = parseSrt(text);
        setEntries(parsed);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load subtitles");
        setLoading(false);
      });
  }, [srtUrl]);

  // Auto-scroll to active subtitle
  useEffect(() => {
    if (activeRef.current && listRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentTime]);

  const activeIndex = entries.findIndex(
    (e) => currentTime >= e.start && currentTime <= e.end
  );

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = parseFloat(e.target.value);
    audio.currentTime = t;
    setCurrentTime(t);
  };

  const handleSubtitleClick = (entry: SrtEntry) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = entry.start;
    setCurrentTime(entry.start);
    if (!isPlaying) {
      audio.play().catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-[#111] p-4 text-[#9ca3af] text-sm">
        Loading subtitles…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-[#111] p-4 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-[#111] overflow-hidden">
      {/* Audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
          preload="metadata"
        />
      )}

      {/* Controls bar */}
      {audioUrl && (
        <div className="flex items-center gap-3 border-b border-[#1a1a1a] px-4 py-3">
          <button
            onClick={handlePlayPause}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#06b6d4] text-black hover:bg-[#22d3ee] transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
                <rect x="0" y="0" width="4" height="14" rx="1" />
                <rect x="8" y="0" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
                <polygon points="0,0 12,7 0,14" />
              </svg>
            )}
          </button>

          <span className="text-xs text-[#9ca3af] w-10 shrink-0 tabular-nums">
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 accent-[#06b6d4] cursor-pointer"
          />

          <span className="text-xs text-[#9ca3af] w-10 shrink-0 text-right tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      )}

      {/* Subtitle list */}
      <div
        ref={listRef}
        className="max-h-72 overflow-y-auto divide-y divide-[#1a1a1a]"
      >
        {entries.length === 0 ? (
          <p className="px-4 py-3 text-sm text-[#9ca3af]">No subtitles found.</p>
        ) : (
          entries.map((entry, i) => {
            const isActive = i === activeIndex;
            return (
              <div
                key={entry.index}
                ref={isActive ? activeRef : null}
                onClick={() => handleSubtitleClick(entry)}
                className={`flex gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                  isActive
                    ? "bg-[#06b6d4]/10 border-l-2 border-[#06b6d4]"
                    : "hover:bg-[#1a1a1a] border-l-2 border-transparent"
                }`}
              >
                <span className="shrink-0 text-xs text-[#4b5563] tabular-nums pt-0.5 w-14">
                  {formatTime(entry.start)}
                </span>
                <p
                  className={`text-sm leading-relaxed ${
                    isActive ? "text-[#06b6d4]" : "text-[#e5e5e5]"
                  }`}
                >
                  {entry.text}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
