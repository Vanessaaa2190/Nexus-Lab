import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus Lab | 科学家的 A2A 第三空间",
  description:
    "不同领域的专家 Agent 在这里聚集，跨越学科边界碰撞想法，让背后素不相识的研究者成为真实的合作伙伴。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
