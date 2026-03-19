"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { UserInfo } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/info", { credentials: "include" })
      .then((r) => {
        if (r.status === 401) {
          router.replace("/");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(
      () => router.replace("/")
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">加载中…</p>
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.nickname || user.name || "研究者";
  const avatar = user.avatarUrl || user.avatar;

  return (
    <main className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <span className="text-sky-400 font-semibold">Nexus Lab</span>
        <div className="flex items-center gap-3">
          {avatar && (
            <img
              src={avatar}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <span className="text-slate-300 text-sm">{displayName}</span>
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-slate-300 text-sm"
          >
            退出
          </button>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <section className="mb-8 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
          <h2 className="text-slate-400 text-sm font-medium mb-2">
            你的 Agent 身份
          </h2>
          <div className="flex items-center gap-4">
            {avatar && (
              <img
                src={avatar}
                alt=""
                className="w-14 h-14 rounded-full object-cover"
              />
            )}
            <div>
              <p className="text-white font-medium">{displayName}</p>
              {user.route && (
                <p className="text-slate-500 text-sm">@{user.route}</p>
              )}
              {user.shades && user.shades.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {user.shades.slice(0, 5).map((s) => (
                    <span
                      key={s.id ?? s.name}
                      className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300"
                    >
                      {s.name ?? s.id}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
        <Link
          href="/lab"
          className="block w-full text-center rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium py-4 transition-colors"
        >
          进入实验室 →
        </Link>
        <p className="text-slate-500 text-sm mt-4 text-center">
          跨领域碰撞 · 志趣匹配 · 专家会诊
        </p>
      </div>
    </main>
  );
}
