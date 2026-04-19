export type CommunityId =
  | "language-learning"
  | "tool-sharing"
  | "daily-topic"
  | "video-sharing";

export type CommunityTab = {
  key: string;
  label: string;
  tag: string;
  /** Semantics for ML / editors — keep in sync with server `community-catalog.ts` */
  tagMeaning: string;
  /** English semantics to improve matching on English content */
  tagMeaningEn: string;
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
      {
        key: "english",
        label: "英语",
        tag: "language-english",
        tagMeaning:
          "英语学习：英语教程、词汇语法、口语听力、雅思托福、英文阅读与写作练习。",
        tagMeaningEn:
          "English learning: spoken English, idioms, pronunciation, grammar, vocabulary, IELTS/TOEFL, reading and writing practice.",
      },
      {
        key: "chinese",
        label: "中文",
        tag: "language-chinese",
        tagMeaning:
          "中文学习：普通话、汉字、拼音、HSK、对外汉语、中文阅读与写作。",
        tagMeaningEn:
          "Chinese learning: Mandarin, Hanzi, Pinyin, HSK prep, Chinese as a second language, reading and writing.",
      },
      {
        key: "turkish",
        label: "土耳其语",
        tag: "language-turkish",
        tagMeaning:
          "土耳其语学习：土语入门、词汇、语法、练习与土耳其语资源。",
        tagMeaningEn:
          "Turkish learning: beginner lessons, Turkish vocabulary, grammar drills, speaking practice and learning resources.",
      },
    ],
  },
  {
    id: "tool-sharing",
    title: "实用工具分享社区",
    description: "沉淀学习、工作、生活中的高效工具与实践。",
    homeDescription: "Discover useful tools for study, work and life.",
    tabs: [
      {
        key: "study",
        label: "学习",
        tag: "tools-study",
        tagMeaning:
          "学习类工具：笔记、背单词、课程管理、专注计时、知识库与学习向 App/网站。",
        tagMeaningEn:
          "Study tools: note-taking apps, flashcards, course planners, focus timers, PKM and learning-focused websites/apps.",
      },
      {
        key: "work",
        label: "工作",
        tag: "tools-work",
        tagMeaning:
          "工作类工具：协作、项目管理、文档、表格、自动化、设计与开发效率工具。",
        tagMeaningEn:
          "Work tools: collaboration, project management, docs/spreadsheets, automation, design and developer productivity tools.",
      },
      {
        key: "life",
        label: "生活",
        tag: "tools-life",
        tagMeaning:
          "生活类工具：健康、记账、出行、家务、日程与日常效率小工具。",
        tagMeaningEn:
          "Life tools: health tracking, budgeting, travel planners, home routines, calendar and everyday productivity utilities.",
      },
    ],
  },
  {
    id: "daily-topic",
    title: "每日话题讨论社区",
    description: "围绕不同主题展开日常讨论与观点交流。",
    homeDescription: "Talk about emotion, tech, AI and growth.",
    tabs: [
      {
        key: "emotion",
        label: "情感",
        tag: "topic-emotion",
        tagMeaning:
          "情感与人际：情绪、关系、心理健康、家庭友情爱情相关讨论。",
        tagMeaningEn:
          "Emotion and relationships: feelings, communication, mental health, family, friendship and love discussions.",
      },
      {
        key: "tech",
        label: "科技",
        tag: "topic-tech",
        tagMeaning:
          "泛科技话题：互联网、硬件软件趋势、数码生活（非单一工具测评时可归此类）。",
        tagMeaningEn:
          "General tech topics: internet trends, software/hardware news, digital life and broader technology viewpoints.",
      },
      {
        key: "ai",
        label: "AI",
        tag: "topic-ai",
        tagMeaning:
          "人工智能：大模型、AIGC、机器学习应用、AI 产品与伦理讨论。",
        tagMeaningEn:
          "AI topics: LLMs, AIGC, machine learning applications, AI products and ethics discussions.",
      },
      {
        key: "growth",
        label: "自我成长",
        tag: "topic-growth",
        tagMeaning:
          "自我成长：习惯、职业思考、阅读感悟、目标管理与个人发展。",
        tagMeaningEn:
          "Self-growth: habits, career reflection, reading notes, goal setting and personal development.",
      },
    ],
  },
  {
    id: "video-sharing",
    title: "视频分享社区",
    description: "分享教程、见闻、精彩片段和你喜欢的视频内容。",
    homeDescription: "Share tutorial, vlog and interesting videos.",
    tabs: [
      {
        key: "tutorial",
        label: "教程",
        tag: "video-tutorial",
        tagMeaning:
          "视频教程：操作演示、教学类视频、系列课程与技能向视频内容。",
        tagMeaningEn:
          "Tutorial videos: walkthroughs, how-to lessons, structured courses and skill-based video content.",
      },
      {
        key: "vlog",
        label: "Vlog",
        tag: "video-vlog",
        tagMeaning:
          "Vlog 与生活记录：日常、旅行、见闻类视频分享与创作心得。",
        tagMeaningEn:
          "Vlog and life records: daily life, travel stories, experiences and video creation notes.",
      },
      {
        key: "recommend",
        label: "推荐",
        tag: "video-recommend",
        tagMeaning:
          "视频推荐：片单、频道安利、影评剧评与值得看的视频合集。",
        tagMeaningEn:
          "Video recommendations: playlists, channel picks, film/show reviews and must-watch collections.",
      },
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
