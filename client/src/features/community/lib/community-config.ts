export type CommunityId =
  | "language-learning"
  | "tool-sharing"
  | "daily-topic"
  | "video-sharing";

export type CommunityTab = {
  key: string;
  label: string;
  tag: string;
};

export type CommunityConfig = {
  id: CommunityId;
  title: string;
  description: string;
  homeDescription: string;
  tabs: CommunityTab[];
};

export const COMMUNITY_CONFIGS: CommunityConfig[] = [
  {
    id: "language-learning",
    title: "语言学习社区",
    description: "一起练语言、分享学习方法、提问与答疑。",
    homeDescription: "Practice English, Chinese, Turkish and more.",
    tabs: [
      { key: "english", label: "英语", tag: "language-english" },
      { key: "chinese", label: "中文", tag: "language-chinese" },
      { key: "turkish", label: "土耳其语", tag: "language-turkish" },
    ],
  },
  {
    id: "tool-sharing",
    title: "实用工具分享社区",
    description: "沉淀学习、工作、生活中的高效工具与实践。",
    homeDescription: "Discover useful tools for study, work and life.",
    tabs: [
      { key: "study", label: "学习", tag: "tools-study" },
      { key: "work", label: "工作", tag: "tools-work" },
      { key: "life", label: "生活", tag: "tools-life" },
    ],
  },
  {
    id: "daily-topic",
    title: "每日话题讨论社区",
    description: "围绕不同主题展开日常讨论与观点交流。",
    homeDescription: "Talk about emotion, tech, AI and growth.",
    tabs: [
      { key: "emotion", label: "情感", tag: "topic-emotion" },
      { key: "tech", label: "科技", tag: "topic-tech" },
      { key: "ai", label: "AI", tag: "topic-ai" },
      { key: "growth", label: "自我成长", tag: "topic-growth" },
    ],
  },
  {
    id: "video-sharing",
    title: "视频分享社区",
    description: "分享教程、见闻、精彩片段和你喜欢的视频内容。",
    homeDescription: "Share tutorial, vlog and interesting videos.",
    tabs: [
      { key: "tutorial", label: "教程", tag: "video-tutorial" },
      { key: "vlog", label: "Vlog", tag: "video-vlog" },
      { key: "recommend", label: "推荐", tag: "video-recommend" },
    ],
  },
];

export const COMMUNITY_CONFIG_MAP: Record<CommunityId, CommunityConfig> =
  COMMUNITY_CONFIGS.reduce(
    (acc, community) => {
      acc[community.id] = community;
      return acc;
    },
    {} as Record<CommunityId, CommunityConfig>
  );

export function isCommunityId(value: string): value is CommunityId {
  return Object.prototype.hasOwnProperty.call(COMMUNITY_CONFIG_MAP, value);
}
