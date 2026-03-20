"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  COLLISION_TOPICS,
  MOCK_MATCHED_AGENTS,
  type CollisionTopic,
  type MatchedAgent,
} from "@/lib/mockLab";

interface BillboardItem {
  title: string;
  heat?: number;
}

export default function LabPage() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [billboard, setBillboard] = useState<BillboardItem[]>([]);

  useEffect(() => {
    fetch("/api/user/info", { credentials: "include" })
      .then((r) => {
        if (r.status === 401) {
          router.replace("/");
          return;
        }
        setLoggedIn(true);
      })
      .catch(() => setLoggedIn(false));
  }, [router]);

  useEffect(() => {
    fetch("/api/zhihu/billboard")
      .then((r) => r.json())
      .then((data) => data.list && setBillboard(data.list))
      .catch(() => {});
  }, []);

  if (loggedIn === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">加载中…</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-sky-400 font-semibold">
          ← Nexus Lab
        </Link>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">实验室</h1>
        <p className="text-slate-400 mb-8">
          跨领域碰撞、志趣匹配与专家会诊，让不期而遇的对话每天发生。
        </p>

        {billboard.length > 0 && (
          <section className="mb-10 p-4 rounded-xl bg-slate-800/30 border border-slate-700">
            <h2 className="text-slate-300 font-medium mb-2">
              今日知乎热榜（可与碰撞话题结合 · 知乎特别奖）
            </h2>
            <ul className="space-y-1 text-sm text-slate-400">
              {billboard.map((item, i) => (
                <li key={i}>
                  {item.title}
                  {item.heat != null && (
                    <span className="text-slate-500 ml-2">
                      {(item.heat / 10000).toFixed(0)}万
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-10">
          <h2 className="text-slate-300 font-medium mb-3">今日碰撞话题</h2>
          <p className="text-slate-500 text-sm mb-4">
            由碰撞引擎基于「结构—功能—条件」同构生成的跨领域假设，可结合知乎热榜展开讨论。
          </p>
          <ul className="space-y-4">
            {COLLISION_TOPICS.map((t) => (
              <CollisionCard key={t.id} topic={t} />
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-slate-300 font-medium mb-3">为你匹配的跨领域 Agent</h2>
          <p className="text-slate-500 text-sm mb-4">
            按研究风格与领域互补匹配，可发起会话或会诊。
          </p>
          <ul className="space-y-3">
            {MOCK_MATCHED_AGENTS.map((a) => (
              <AgentCard key={a.id} agent={a} />
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-slate-300 font-medium mb-3">跨领域专家会诊</h2>
          <p className="text-slate-500 text-sm mb-4">
            带着卡住的问题来，系统匹配最相关的跨领域专家 Agent，用对方领域的概念重新描述你的问题。
          </p>
          <Link
            href="/lab/consult"
            className="inline-flex items-center justify-center rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium px-6 py-3 transition-colors"
          >
            发起会诊
          </Link>
        </section>
      </div>
    </main>
  );
}

function CollisionCard({ topic }: { topic: CollisionTopic }) {
  return (
    <li className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
      <div className="flex gap-2 text-xs text-sky-400 mb-2">
        <span>{topic.domainA}</span>
        <span>×</span>
        <span>{topic.domainB}</span>
      </div>
      <h3 className="text-white font-medium mb-2">{topic.title}</h3>
      <p className="text-slate-400 text-sm mb-2">{topic.summary}</p>
      <p className="text-slate-300 text-sm italic border-l-2 border-sky-500/50 pl-3">
        {topic.hypothesis}
      </p>
      {topic.sourceHint && (
        <p className="text-slate-500 text-xs mt-2">{topic.sourceHint}</p>
      )}
    </li>
  );
}

function AgentCard({ agent }: { agent: MatchedAgent }) {
  return (
    <li className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center text-slate-400 text-lg">
        {agent.name.slice(0, 1)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium">{agent.name}</p>
        <p className="text-sky-400/80 text-sm">{agent.domain}</p>
        <p className="text-slate-500 text-sm truncate">{agent.oneLine}</p>
      </div>
      <span className="text-xs text-slate-500 shrink-0">匹配</span>
    </li>
  );
}
