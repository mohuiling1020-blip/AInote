export type Locale = 'zh' | 'en';

const translations = {
  nav: {
    features: { zh: '功能', en: 'Features' },
    howItWorks: { zh: '使用方式', en: 'How It Works' },
    pricing: { zh: '定价', en: 'Pricing' },
    faq: { zh: '常见问题', en: 'FAQ' },
    getStarted: { zh: '开始使用', en: 'Get Started' },
  },
  hero: {
    tagline: {
      zh: '让灵感生长',
      en: 'Let your sparks grow.',
    },
    subtitle: {
      zh: '不用刻意和 AI 对话，只需随手记录。MindSpark 自动帮你整理、回答、拓展每一条想法。',
      en: "No need to chat with AI deliberately. Just capture your thoughts — MindSpark automatically organizes, answers, and expands every idea.",
    },
    cta: { zh: '免费开始使用', en: 'Get Started Free' },
  },
  features: {
    title: { zh: '核心功能', en: 'Core Features' },
    subtitle: {
      zh: '让 AI 融入你的思考习惯，而不是改变它',
      en: 'Let AI blend into your thinking habits, not change them',
    },
    smartClassify: {
      title: { zh: '智能分类', en: 'Smart Classification' },
      desc: {
        zh: 'AI 自动识别笔记类型 — 待办、问题、灵感、资源，无需手动标签',
        en: 'AI auto-categorizes your notes — tasks, questions, ideas, resources. No manual tagging needed.',
      },
    },
    aiProcess: {
      title: { zh: 'AI 深度处理', en: 'Deep AI Processing' },
      desc: {
        zh: '待办自动分解步骤，问题即时解答，灵感拓展延伸',
        en: 'Tasks auto-decomposed into steps, questions answered instantly, ideas creatively expanded.',
      },
    },
    dailyReview: {
      title: { zh: '每日复盘', en: 'Daily Review' },
      desc: {
        zh: 'AI 语义总结 + 主题聚类 + 历史灵感间隔重现，帮你温故知新',
        en: 'AI semantic summaries, theme clustering, and spaced repetition of past insights.',
      },
    },
    share: {
      title: { zh: '一键分享', en: 'One-Click Share' },
      desc: {
        zh: '生成精美卡片，轻松分享到社交媒体',
        en: 'Generate beautiful cards to share on social media.',
      },
    },
  },
  howItWorks: {
    title: { zh: '三步开始', en: 'How It Works' },
    step1: {
      title: { zh: '随手记录', en: 'Capture' },
      desc: {
        zh: '任何时候，记下脑海中的想法',
        en: 'Jot down any thought, anytime',
      },
    },
    step2: {
      title: { zh: 'AI 自动处理', en: 'AI Processes' },
      desc: {
        zh: '自动分类，智能扩展，无需额外操作',
        en: 'Auto-classify, intelligently expand — zero effort',
      },
    },
    step3: {
      title: { zh: '复盘成长', en: 'Review & Grow' },
      desc: {
        zh: 'AI 每日复盘帮你发现思维模式和遗忘的灵感',
        en: 'Daily AI review surfaces patterns and forgotten gems',
      },
    },
  },
  value: {
    title: { zh: '为什么选择 MindSpark?', en: 'Why MindSpark?' },
    subtitle: {
      zh: '对比传统笔记 / 备忘录',
      en: 'Compared to traditional notes & memos',
    },
    headers: {
      aspect: { zh: '对比', en: 'Aspect' },
      traditional: { zh: '传统笔记 / 备忘录', en: 'Traditional Notes' },
      mindspark: { zh: 'MindSpark', en: 'MindSpark' },
    },
    rows: [
      {
        aspect: { zh: '记录之后', en: 'After Capture' },
        traditional: { zh: '记了就忘，石沉大海', en: 'Written and forgotten' },
        mindspark: { zh: 'AI 自动分类、扩展、回答', en: 'AI auto-classifies, expands, answers' },
      },
      {
        aspect: { zh: '待办管理', en: 'Task Mgmt' },
        traditional: { zh: '手动拆解，容易遗漏', en: 'Manual breakdown, easy to miss' },
        mindspark: { zh: 'AI 自动分解步骤', en: 'AI auto-decomposes into steps' },
      },
      {
        aspect: { zh: '知识回顾', en: 'Review' },
        traditional: { zh: '靠自觉翻看，很少回顾', en: 'Rarely revisited' },
        mindspark: { zh: '每日 AI 复盘 + 间隔重现', en: 'Daily AI review + spaced repetition' },
      },
      {
        aspect: { zh: '灵感价值', en: 'Idea Value' },
        traditional: { zh: '零散碎片，无法串联', en: 'Scattered fragments, no connections' },
        mindspark: {
          zh: 'AI 主题聚类，连点成线',
          en: 'AI clusters themes, connects the dots',
        },
      },
    ],
  },
  faq: {
    title: { zh: '常见问题', en: 'FAQ' },
    items: [
      {
        q: { zh: 'MindSpark 免费吗？', en: 'Is MindSpark free?' },
        a: {
          zh: '提供免费版，包含每日 20 条 AI 处理等核心功能。升级 Pro 可解锁无限 AI 处理和高级复盘等全部能力。',
          en: 'Yes! The free plan includes 20 AI processes per day and core features. Upgrade to Pro for unlimited AI and advanced review.',
        },
      },
      {
        q: { zh: '我的数据安全吗？', en: 'Is my data safe?' },
        a: {
          zh: '你的数据通过 Supabase 加密存储，我们不会出售或共享你的数据。',
          en: 'Your data is encrypted via Supabase. We never sell or share your data.',
        },
      },
      {
        q: {
          zh: '支持哪些平台？',
          en: 'What platforms are supported?',
        },
        a: {
          zh: 'Web 应用，可在任何浏览器中使用，支持桌面和移动端。',
          en: 'Web app accessible from any browser, desktop and mobile.',
        },
      },
      {
        q: {
          zh: '使用了什么 AI 模型？',
          en: 'What AI models are used?',
        },
        a: {
          zh: '我们使用 Google Gemini 和通义千问，针对不同任务选择最优模型。',
          en: 'We use Google Gemini and Qwen, selecting the optimal model for each task.',
        },
      },
    ],
  },
  pricing: {
    title: { zh: '简单透明的定价', en: 'Simple, Transparent Pricing' },
    subtitle: {
      zh: '从免费开始，随时升级解锁更多能力',
      en: 'Start free, upgrade anytime for more power',
    },
    monthly: { zh: '月付', en: 'Monthly' },
    yearly: { zh: '年付', en: 'Yearly' },
    yearlyDiscount: { zh: '省 20%', en: 'Save 20%' },
    perMonth: { zh: '/月', en: '/mo' },
    billedYearly: { zh: '按年计费', en: 'billed yearly' },
    free: {
      name: { zh: '免费版', en: 'Free' },
      price: { monthly: '0', yearly: '0' },
      desc: {
        zh: '适合个人轻量使用，体验 AI 笔记的魅力',
        en: 'Perfect for trying out AI-powered notes',
      },
      cta: { zh: '免费开始', en: 'Get Started Free' },
      features: [
        { zh: '每日 20 条 AI 处理', en: '20 AI processes per day' },
        { zh: '智能分类', en: 'Smart classification' },
        { zh: '每日复盘（基础版）', en: 'Daily review (basic)' },
        { zh: '一键分享卡片', en: 'One-click share cards' },
        { zh: '7 天历史灵感回顾', en: '7-day insight history' },
      ],
    },
    pro: {
      name: { zh: '专业版', en: 'Pro' },
      price: { monthly: '9.9', yearly: '7.9' },
      currency: { zh: '¥', en: '$' },
      desc: {
        zh: '释放全部 AI 能力，让每一条灵感都不被辜负',
        en: 'Unlock full AI power — never let a spark fade',
      },
      cta: { zh: '升级 Pro', en: 'Upgrade to Pro' },
      badge: { zh: '最受欢迎', en: 'Most Popular' },
      features: [
        { zh: '无限 AI 处理', en: 'Unlimited AI processes' },
        { zh: '智能分类 + 自定义标签', en: 'Smart classification + custom tags' },
        { zh: '每日复盘（高级版 + 主题聚类）', en: 'Daily review (advanced + theme clustering)' },
        { zh: '一键分享卡片', en: 'One-click share cards' },
        { zh: '无限历史灵感回顾', en: 'Unlimited insight history' },
        { zh: '优先使用新功能', en: 'Early access to new features' },
        { zh: '优先客服支持', en: 'Priority support' },
      ],
    },
  },
  cta: {
    title: {
      zh: '准备好让思考更有力量了吗？',
      en: 'Ready to supercharge your thinking?',
    },
    subtitle: {
      zh: '免费开始，无需信用卡',
      en: 'Start free, no credit card required',
    },
    button: { zh: '立即开始', en: 'Start Now' },
  },
  footer: {
    tagline: {
      zh: '记录即思考，AI 连点成线',
      en: 'Just note it. AI connects the dots.',
    },
    builtWith: { zh: '用 ❤️ 和 AI 构建', en: 'Built with ❤️ and AI' },
  },
} as const;

export type TranslationKey = typeof translations;
export default translations;
