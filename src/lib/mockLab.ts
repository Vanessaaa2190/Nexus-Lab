/**
 * Demo 用：跨领域碰撞与匹配的示例数据
 * 正式版可对接知乎热榜、可信搜与真实 Agent 匹配
 */

export interface CollisionTopic {
  id: string;
  domainA: string;
  domainB: string;
  title: string;
  summary: string;
  hypothesis: string;
  sourceHint?: string;
}

export interface MatchedAgent {
  id: string;
  name: string;
  domain: string;
  style: string;
  avatar?: string;
  oneLine: string;
}

export const COLLISION_TOPICS: CollisionTopic[] = [
  {
    id: "1",
    domainA: "材料科学",
    domainB: "神经科学",
    title: "高应激条件下的信号稳定传导",
    summary:
      "材料科学中碳纳米管在极端条件下维持导电稳定性，与神经科学中髓鞘在神经冲动传递中的绝缘与稳定作用，在「结构—功能—条件」上存在同构。",
    hypothesis:
      "可验证假设：借鉴碳纳米管表面修饰策略，设计髓鞘修复或神经接口材料，在特定应激条件下测试信号传导稳定性。",
    sourceHint: "可结合知乎热榜「脑机接口」等话题展开讨论",
  },
  {
    id: "2",
    domainA: "生态学",
    domainB: "经济学",
    title: "资源流动与网络韧性",
    summary:
      "生态系统中养分循环与物种网络韧性，与供应链与金融网络中的资源流动、节点失效传播具有结构相似性。",
    hypothesis:
      "可验证假设：用生态网络韧性指标（如关键种、模块度）分析供应链关键节点，预测系统性风险。",
    sourceHint: "知乎热榜「供应链」「碳中和」可作讨论入口",
  },
  {
    id: "3",
    domainA: "语言学",
    domainB: "计算生物学",
    title: "序列的语法与进化",
    summary:
      "自然语言的句法结构与 DNA/蛋白质序列的「语法」与进化约束，都可形式化为序列上的规则与变异。",
    hypothesis:
      "可验证假设：将句法解析或语义表示方法迁移到序列 motif 发现，或反之用进化模型分析语言变迁。",
  },
];

export const MOCK_MATCHED_AGENTS: MatchedAgent[] = [
  {
    id: "a1",
    name: "材料与界面",
    domain: "材料科学",
    style: "偏实验验证，喜欢从现象反推机制",
    oneLine: "专注纳米材料与生物界面，对跨领域类比很感兴趣",
  },
  {
    id: "a2",
    name: "神经与计算",
    domain: "神经科学",
    style: "偏建模与仿真，善于抽象",
    oneLine: "做神经环路与类脑计算，希望和材料/物理背景的人碰撞",
  },
  {
    id: "a3",
    name: "系统与网络",
    domain: "生态学 / 复杂系统",
    style: "系统思维，喜欢找普适规律",
    oneLine: "研究生态与供应链网络的共性，寻找可迁移的指标",
  },
];
