/**
 * Canonical catalog for community-aware tagging. Used to build embedding texts
 * (keyword-dense bilingual tab profile). Keep in sync with
 * client `features/community/lib/community-config.ts`.
 */
export type CommunityId =
    | "language-learning"
    | "tool-sharing"
    | "daily-topic"
    | "video-sharing";

export type CommunityTabDefinition = {
    key: string;
    label: string;
    tag: string;
    /** Short Chinese semantics — what posts belong here */
    tagMeaning: string;
    /** English semantics to improve matching on English content */
    tagMeaningEn: string;
    /**
     * High-signal bilingual keywords used to make tab embeddings dense and
     * discriminative. Keep each term SHORT and STRONGLY TOPICAL.
     */
    keywords: string[];
};

export type CommunityCatalogEntry = {
    id: CommunityId;
    title: string;
    description: string;
    tabs: CommunityTabDefinition[];
};

export const COMMUNITY_CATALOG: CommunityCatalogEntry[] = [
    {
        id: "language-learning",
        title: "语言学习社区",
        description:
            "一起练语言、分享学习方法、提问与答疑。帖子应围绕学外语、口语、词汇、语法、资源推荐与语言交换。",
        tabs: [
            {
                key: "english",
                label: "英语",
                tag: "language-english",
                tagMeaning:
                    "英语学习：英语教程、词汇语法、口语听力、雅思托福、英文阅读与写作练习。",
                tagMeaningEn:
                    "English learning: spoken English, idioms, pronunciation, grammar, vocabulary, IELTS/TOEFL, reading and writing practice.",
                keywords: [
                    "英语", "英文", "英语学习", "口语", "听力", "语法", "词汇", "单词",
                    "英文阅读", "英文写作", "发音", "native expressions", "idioms",
                    "phrases", "collocation", "phrasal verbs", "spoken English",
                    "English learning", "English grammar", "English vocabulary",
                    "pronunciation", "listening", "writing", "reading",
                    "IELTS", "TOEFL", "雅思", "托福",
                ],
            },
            {
                key: "chinese",
                label: "中文",
                tag: "language-chinese",
                tagMeaning:
                    "中文学习：普通话、汉字、拼音、HSK、对外汉语、中文阅读与写作。",
                tagMeaningEn:
                    "Chinese learning: Mandarin, Hanzi, Pinyin, HSK prep, Chinese as a second language, reading and writing.",
                keywords: [
                    "中文", "中文学习", "普通话", "汉语", "汉字", "拼音", "声调",
                    "HSK", "对外汉语", "成语", "中文阅读", "中文写作",
                    "Mandarin", "Chinese learning", "Hanzi", "Pinyin",
                    "Chinese characters", "Chinese grammar", "Chinese vocabulary",
                    "Chinese as a second language",
                ],
            },
            {
                key: "turkish",
                label: "土耳其语",
                tag: "language-turkish",
                tagMeaning:
                    "土耳其语学习：土语入门、词汇、语法、练习与土耳其语资源。",
                tagMeaningEn:
                    "Turkish learning: beginner lessons, Turkish vocabulary, grammar drills, speaking practice and learning resources.",
                keywords: [
                    "土耳其语", "土语", "土耳其语学习", "土耳其语词汇", "土耳其语语法",
                    "Turkish", "Turkish learning", "Türkçe", "Turkish vocabulary",
                    "Turkish grammar", "Turkish speaking", "Turkish resources",
                ],
            },
        ],
    },
    {
        id: "tool-sharing",
        title: "实用工具分享社区",
        description:
            "沉淀学习、工作、生活中的高效工具与实践。帖子应介绍具体软件、插件、网站、工作流或效率技巧。",
        tabs: [
            {
                key: "study",
                label: "学习",
                tag: "tools-study",
                tagMeaning:
                    "学习类工具：笔记、背单词、课程管理、专注计时、知识库与学习向 App/网站。",
                tagMeaningEn:
                    "Study tools: note-taking apps, flashcards, course planners, focus timers, PKM and learning-focused websites/apps.",
                keywords: [
                    "学习工具", "笔记", "笔记软件", "背单词", "Anki", "抽认卡", "闪卡",
                    "课程管理", "专注", "番茄钟", "Pomodoro", "知识库", "PKM",
                    "Obsidian", "Notion",
                    "study tools", "note-taking", "flashcards", "focus timer",
                    "course planner", "learning app",
                ],
            },
            {
                key: "work",
                label: "工作",
                tag: "tools-work",
                tagMeaning:
                    "工作类工具：协作、项目管理、文档、表格、自动化、设计与开发效率工具。",
                tagMeaningEn:
                    "Work tools: collaboration, project management, docs/spreadsheets, automation, design and developer productivity tools.",
                keywords: [
                    "工作工具", "协作", "办公", "项目管理", "文档", "表格",
                    "自动化", "效率", "设计工具", "开发工具",
                    "collaboration", "project management", "docs",
                    "spreadsheets", "automation", "design",
                    "developer tools", "productivity",
                ],
            },
            {
                key: "life",
                label: "生活",
                tag: "tools-life",
                tagMeaning:
                    "生活类工具：健康、记账、出行、家务、日程与日常效率小工具。",
                tagMeaningEn:
                    "Life tools: health tracking, budgeting, travel planners, home routines, calendar and everyday productivity utilities.",
                keywords: [
                    "生活工具", "健康", "记账", "理财", "出行", "旅行", "家务",
                    "日程", "日历", "待办", "健身",
                    "health", "budgeting", "travel", "calendar", "todo",
                    "home routines", "utilities", "everyday apps",
                ],
            },
        ],
    },
    {
        id: "daily-topic",
        title: "每日话题讨论社区",
        description:
            "围绕不同主题展开日常讨论与观点交流。帖子应是观点、讨论、随笔或热点思考，而非纯工具教程。",
        tabs: [
            {
                key: "emotion",
                label: "情感",
                tag: "topic-emotion",
                tagMeaning:
                    "情感与人际：情绪、关系、心理健康、家庭友情爱情相关讨论。",
                tagMeaningEn:
                    "Emotion and relationships: feelings, communication, mental health, family, friendship and love discussions.",
                keywords: [
                    "情感", "情绪", "心情", "心理", "心理健康", "焦虑", "抑郁",
                    "人际关系", "家庭", "朋友", "友情", "爱情", "亲情",
                    "emotion", "feelings", "mental health", "relationships",
                    "family", "friendship", "love",
                ],
            },
            {
                key: "tech",
                label: "科技",
                tag: "topic-tech",
                tagMeaning:
                    "泛科技话题：互联网、硬件软件趋势、数码生活（非单一工具测评时可归此类）。",
                tagMeaningEn:
                    "General tech topics: internet trends, software/hardware news, digital life and broader technology viewpoints.",
                keywords: [
                    "科技", "互联网", "IT", "硬件", "软件", "数码", "数码生活",
                    "技术趋势", "极客",
                    "tech", "technology", "internet", "software", "hardware",
                    "digital life", "gadgets",
                ],
            },
            {
                key: "ai",
                label: "AI",
                tag: "topic-ai",
                tagMeaning:
                    "人工智能：大模型、AIGC、机器学习应用、AI 产品与伦理讨论。",
                tagMeaningEn:
                    "AI topics: LLMs, AIGC, machine learning applications, AI products and ethics discussions.",
                keywords: [
                    "AI", "人工智能", "大模型", "LLM", "AIGC", "机器学习",
                    "深度学习", "神经网络", "ChatGPT", "GPT", "Claude",
                    "Gemini", "prompt", "AI 产品", "AI 伦理",
                    "machine learning", "deep learning", "neural networks",
                    "transformer", "generative AI",
                ],
            },
            {
                key: "growth",
                label: "自我成长",
                tag: "topic-growth",
                tagMeaning:
                    "自我成长：习惯、职业思考、阅读感悟、目标管理与个人发展。",
                tagMeaningEn:
                    "Self-growth: habits, career reflection, reading notes, goal setting and personal development.",
                keywords: [
                    "自我成长", "成长", "习惯", "好习惯", "自律", "职业发展",
                    "职场", "职业思考", "读书笔记", "阅读感悟", "目标管理",
                    "时间管理",
                    "personal growth", "self improvement", "habits", "career",
                    "reading notes", "goal setting", "productivity mindset",
                ],
            },
        ],
    },
    {
        id: "video-sharing",
        title: "视频分享社区",
        description:
            "分享教程、见闻、精彩片段和你喜欢的视频内容。帖子应明确涉及视频创作、推荐或观看体验。",
        tabs: [
            {
                key: "tutorial",
                label: "教程",
                tag: "video-tutorial",
                tagMeaning:
                    "视频教程：操作演示、教学类视频、系列课程与技能向视频内容。",
                tagMeaningEn:
                    "Tutorial videos: walkthroughs, how-to lessons, structured courses and skill-based video content.",
                keywords: [
                    "教程", "视频教程", "教学视频", "入门教程", "系列课程",
                    "实战教程", "操作演示",
                    "tutorial", "how to", "walkthrough", "step by step",
                    "course", "lesson",
                ],
            },
            {
                key: "vlog",
                label: "Vlog",
                tag: "video-vlog",
                tagMeaning:
                    "Vlog 与生活记录：日常、旅行、见闻类视频分享与创作心得。",
                tagMeaningEn:
                    "Vlog and life records: daily life, travel stories, experiences and video creation notes.",
                keywords: [
                    "Vlog", "vlog", "视频日记", "生活记录", "日常", "旅行视频",
                    "旅拍", "见闻",
                    "daily life", "travel vlog", "life record", "video diary",
                ],
            },
            {
                key: "recommend",
                label: "推荐",
                tag: "video-recommend",
                tagMeaning:
                    "视频推荐：片单、频道安利、影评剧评与值得看的视频合集。",
                tagMeaningEn:
                    "Video recommendations: playlists, channel picks, film/show reviews and must-watch collections.",
                keywords: [
                    "视频推荐", "片单", "频道推荐", "安利", "合集", "影评", "剧评",
                    "must watch", "recommendation", "playlist",
                    "channel picks", "review",
                ],
            },
        ],
    },
];

export type TabScoreMeta = {
    communityId: CommunityId;
    tabKey: string;
    label: string;
    tag: string;
};

export const TAB_CLASSIFICATION_ROWS: Array<
    TabScoreMeta & { catalog: CommunityCatalogEntry; tab: CommunityTabDefinition }
> = COMMUNITY_CATALOG.flatMap((catalog) =>
    catalog.tabs.map((tab) => ({
        communityId: catalog.id,
        tabKey: tab.key,
        label: tab.label,
        tag: tab.tag,
        catalog,
        tab,
    }))
);
