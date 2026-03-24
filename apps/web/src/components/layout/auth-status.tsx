"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * ヘッダーに表示するログイン状態インジケーター。
 * ログイン中: メールアドレス + ログアウトボタン
 * 未ログイン: ログインリンク
 */
export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 初回マウント時にセッションを取得
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    // 認証状態の変化を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
      >
        ログイン
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-500">{user.email}</span>
      <button
        onClick={handleLogout}
        className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
      >
        ログアウト
      </button>
    </div>
  );
}
