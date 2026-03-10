"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import AuthModal from "./AuthModal";
import Link from "next/link";

export default function UserStatusBar() {
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) checkPro(supabase);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) checkPro(supabase);
        else {
          setIsPro(false);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function checkPro(supabase: ReturnType<typeof createClient>) {
    try {
      const { data, error } = await supabase.rpc("is_trinity_pro");
      if (!error) setIsPro(data === true);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsPro(false);
  }

  function emailAbbrev(email: string) {
    const [local] = email.split("@");
    return local.length > 8 ? local.slice(0, 8) + "…" : local;
  }

  if (loading) return null;

  return (
    <>
      {/* Inline items — rendered inside the header nav */}
      {!user ? (
        <button
          onClick={() => setShowAuth(true)}
          className="text-[13px] text-[#888] transition-colors hover:text-[#06b6d4]"
        >
          登录
        </button>
      ) : (
        <>
          <span className="text-[12px] text-[#555]">{emailAbbrev(user.email || "")}</span>
          {isPro ? (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
              Pro ✓
            </span>
          ) : (
            <Link
              href="/pricing"
              className="rounded-full bg-[#06b6d4]/10 px-2 py-0.5 text-[11px] font-medium text-[#06b6d4] transition-colors hover:bg-[#06b6d4]/20"
            >
              升级
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="text-[12px] text-[#555] transition-colors hover:text-[#999]"
          >
            退出
          </button>
        </>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
