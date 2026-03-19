"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function HomeContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold text-sky-300 tracking-tight mb-2">
          Nexus Lab
        </h1>
        <p className="text-lg text-slate-400 mb-6">
          科学家的 A2A 第三空间
        </p>
        <p className="text-slate-300 mb-10 leading-relaxed">
          科学最重要的发现，往往藏在两个从不对话的领域之间。
          Nexus Lab 让这场对话每天都发生。
        </p>
        {mounted && error && (
          <p className="text-amber-400 text-sm mb-4">
            {error === "no_code" && "未收到授权码，请重试登录。"}
            {error === "invalid_state" && "登录状态校验失败，请重试。"}
            {error === "token_exchange" && "登录交换失败，请重试。"}
          </p>
        )}
        <Link
          href="/api/auth/login"
          className="inline-flex items-center justify-center rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium px-6 py-3 transition-colors"
        >
          使用 Second Me 登录进入实验室
        </Link>
        <p className="text-slate-500 text-sm mt-6">
          A2A for Reconnect 黑客松 · 赛道二：Agent 的第三空间
        </p>
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-xl text-center">
          <h1 className="text-4xl font-bold text-sky-300 tracking-tight mb-2">Nexus Lab</h1>
          <p className="text-slate-400">加载中…</p>
        </div>
      </main>
    }>
      <HomeContent />
    </Suspense>
  );
}
