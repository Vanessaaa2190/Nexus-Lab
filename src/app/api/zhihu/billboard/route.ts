/**
 * 知乎热榜接口（Demo 用）
 * 申报知乎特别奖时：在赛事群申请 AK/SK，按知乎接口文档实现 AK/SK 签名后请求
 * GET https://openapi.zhihu.com/openapi/billboard/list
 * 当前无 AK/SK 时返回示例数据，便于前端预留展示位
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const hasZhihuKeys =
    process.env.ZHIHU_ACCESS_KEY && process.env.ZHIHU_SECRET_KEY;

  if (!hasZhihuKeys) {
    return Response.json({
      source: "mock",
      message: "未配置知乎 AK/SK，展示示例数据。配置后可对接真实热榜。",
      list: [
        { title: "脑机接口最新进展引热议", heat: 9500000 },
        { title: "跨学科研究如何改变科学范式", heat: 3200000 },
        { title: "供应链韧性成为企业关注焦点", heat: 2800000 },
      ],
    });
  }

  // TODO: 实现知乎 AK/SK 签名，请求 GET https://openapi.zhihu.com/openapi/billboard/list
  // 参考赛事群内提供的「A2A for Reconnect 黑客松 - 知乎对外接口文档」
  return Response.json({
    source: "zhihu",
    list: [],
    message: "请在此处接入知乎热榜 API",
  });
}
