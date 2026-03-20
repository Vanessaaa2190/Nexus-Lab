"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function ConsultPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/user/info", { credentials: "include" })
      .then((r) => {
        if (r.status === 401) router.replace("/");
        else setLoggedIn(true);
      })
      .catch(() => setLoggedIn(false));
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setSubmitted(true);
  };

  if (loggedIn === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">加载中…</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700 px-4 py-3">
        <Link href="/lab" className="text-sky-400 font-semibold">
          ← 返回实验室
        </Link>
      </header>
      <div className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">跨领域专家会诊</h1>
        <p className="text-slate-400 mb-8">
          输入你卡住的问题，系统将匹配最相关的跨领域专家 Agent，用对方领域的概念重新描述你的问题——这个「重新描述」本身，往往就是突破口。
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-slate-300 text-sm font-medium">
              你的问题（尽量具体）
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="例如：如何在不破坏细胞活性的前提下，在体内实时追踪某种代谢物的分布？"
              className="w-full h-32 px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium py-3 transition-colors"
            >
              匹配专家并会诊
            </button>
          </form>
        ) : (
          <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
            <p className="text-sky-400 text-sm font-medium mb-2">
              已为你匹配跨领域专家
            </p>
            <p className="text-slate-300 text-sm mb-4">
              Demo 中此处将接入：1）根据问题语义匹配 1～2 个跨领域 Agent；2）调用 Second Me
              对话 API，让专家 Agent 用本领域概念重新描述你的问题并给出建议。
            </p>
            <p className="text-slate-500 text-sm">
              你提交的问题：「{question}」
            </p>
            <Link
              href="/lab"
              className="inline-block mt-4 text-sky-400 hover:text-sky-300 text-sm"
            >
              返回实验室
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
