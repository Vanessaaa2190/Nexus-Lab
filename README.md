# Nexus Lab Demo

科学家的 A2A 第三空间 · A2A for Reconnect 黑客松 Demo

## 功能

- **Second Me OAuth 登录**：满足比赛「接入 Second Me OAuth 授权登录」要求
- **个人 Agent 身份**：展示用户头像、昵称、兴趣标签（Shades）
- **今日碰撞话题**：跨领域假设示例（材料×神经、生态×经济、语言×生物）
- **匹配的跨领域 Agent**：示例卡片，展示志趣匹配概念
- **跨领域专家会诊**：输入问题 → 匹配专家（Demo 为占位，可接 Second Me 对话 API）

## 本地运行

1. 在 [Second Me 开发者平台](https://develop.second.me/) 创建应用，获取 Client ID 与 Client Secret。
2. 复制环境变量示例并填写：
   ```bash
   cp .env.local.example .env.local
   ```
   编辑 `.env.local`，填入：
   - `SECONDME_CLIENT_ID`
   - `SECONDME_CLIENT_SECRET`
   - `SECONDME_REDIRECT_URI=http://localhost:3000/api/auth/callback`
3. 安装依赖并启动：
   ```bash
   npm install
   npm run dev
   ```
4. 打开 http://localhost:3000 ，点击「使用 Second Me 登录进入实验室」。

## 部署（Vercel）

1. 将本目录或仓库连接到 Vercel。
2. 在 Vercel 项目设置中配置环境变量（同上），并将 `SECONDME_REDIRECT_URI` 改为 `https://你的域名/api/auth/callback`。
3. 在 Second Me 开发者平台中，将应用的「重定向 URI」增加一条：`https://你的域名/api/auth/callback`。
4. 部署后提交到比赛时填写该可访问的 Demo 地址。

## 知乎特别奖（可选）

- 在 `.env.local` 中配置知乎 AK/SK（需在赛事群申请）。
- 在「今日碰撞话题」或会诊流程中接入：热榜 `GET /openapi/billboard/list`、可信搜 `GET /openapi/search/global`、圈子发帖/评论等。
- 提交时勾选「知乎特别奖」并说明使用的接口与场景。

## 技术栈

- Next.js 14 (App Router)、TypeScript、Tailwind CSS
- Second Me OAuth2、用户信息 API

## 项目说明

- 项目构思与比赛优化版文档见仓库根目录：`nexuslab_项目简介.md`、`nexuslab_项目简介_比赛优化版.md`。
