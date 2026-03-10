"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";

type Tab = "login" | "signup";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const supabase = createClient();

    try {
      if (tab === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name } },
        });
        if (error) throw error;
        setSuccess("注册成功！请检查邮箱确认链接。");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-[#1a1a1a] bg-[#111] p-8 shadow-2xl">
        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-[#1a1a1a]">
          {(["login", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); setSuccess(""); }}
              className={`pb-3 text-sm font-medium transition-colors ${
                tab === t
                  ? "border-b-2 border-[#06b6d4] text-[#06b6d4]"
                  : "text-[#555] hover:text-[#999]"
              }`}
            >
              {t === "login" ? "登录" : "注册"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "signup" && (
            <input
              type="text"
              placeholder="昵称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#222] bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder-[#444] outline-none transition-colors focus:border-[#06b6d4]/50"
            />
          )}
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-[#222] bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder-[#444] outline-none transition-colors focus:border-[#06b6d4]/50"
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl border border-[#222] bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder-[#444] outline-none transition-colors focus:border-[#06b6d4]/50"
          />

          {error && <p className="text-xs text-red-400">{error}</p>}
          {success && <p className="text-xs text-green-400">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#06b6d4] py-3 text-sm font-medium text-black transition-all hover:bg-[#06b6d4]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "处理中..." : tab === "login" ? "登录" : "注册"}
          </button>
        </form>
      </div>
    </div>
  );
}
