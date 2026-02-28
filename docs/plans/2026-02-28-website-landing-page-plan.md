# Mindspark Landing Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a bilingual (中/EN) product landing page for Mindspark integrated into the existing Next.js app, using Morandi aesthetic with glassmorphism effects.

**Architecture:** Use Next.js route groups to separate landing page `(landing)` from the authenticated app `(app)`. The landing page at `/` is public; logged-in users are redirected to `/app`. All landing components live in `components/landing/`. Lightweight i18n via React context + JSON translations.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS 3.4, Clerk auth, TypeScript

---

### Task 1: Route restructuring — Move app to route group

Move the current home page into an `(app)` route group so `/` becomes available for the landing page.

**Files:**
- Create: `app/(app)/page.tsx`
- Create: `app/(app)/layout.tsx`
- Modify: `app/page.tsx` (will be replaced in Task 3)
- Modify: `middleware.ts:3-7`

**Step 1: Create the (app) route group directory**

Run: `mkdir -p app/\(app\)`

**Step 2: Create the app route group layout**

Create `app/(app)/layout.tsx`:

```tsx
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

**Step 3: Create the app page (copy current home)**

Create `app/(app)/page.tsx` with the same content as the current `app/page.tsx`:

```tsx
'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('@/App'), { ssr: false });

export default function AppPage() {
  return <App />;
}
```

**Step 4: Update middleware to make `/` public and protect `/app`**

Modify `middleware.ts`:

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

**Step 5: Verify the app still works at /app**

Run: `npm run dev`
Navigate to `http://localhost:3000/app` — should show the note canvas (requires login).
Navigate to `http://localhost:3000/` — should no longer require login (currently shows old page, will be replaced).

**Step 6: Commit**

```bash
git add app/\(app\)/page.tsx app/\(app\)/layout.tsx middleware.ts
git commit -m "refactor: move app to (app) route group, make / public"
```

---

### Task 2: i18n — Create lightweight translation system

**Files:**
- Create: `lib/i18n/translations.ts`
- Create: `lib/i18n/LanguageContext.tsx`

**Step 1: Create translation strings**

Create `lib/i18n/translations.ts`:

```ts
export type Locale = 'zh' | 'en';

const translations = {
  nav: {
    features: { zh: '功能', en: 'Features' },
    howItWorks: { zh: '使用方式', en: 'How It Works' },
    faq: { zh: '常见问题', en: 'FAQ' },
    getStarted: { zh: '开始使用', en: 'Get Started' },
  },
  hero: {
    tagline: {
      zh: '记录即思考，AI 帮你连点成线',
      en: 'Just note it. AI connects the dots.',
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
      zh: '对比传统 AI 工具',
      en: 'Compared to traditional AI tools',
    },
    headers: {
      aspect: { zh: '对比', en: 'Aspect' },
      traditional: { zh: '传统 AI 工具', en: 'Traditional AI Tools' },
      mindspark: { zh: 'MindSpark', en: 'MindSpark' },
    },
    rows: [
      {
        aspect: { zh: '交互方式', en: 'Interaction' },
        traditional: { zh: '主动提问', en: 'Active prompting' },
        mindspark: { zh: '被动记录', en: 'Passive recording' },
      },
      {
        aspect: { zh: '认知负担', en: 'Cognitive Load' },
        traditional: { zh: '高（需学习提示词）', en: 'High (learn prompting)' },
        mindspark: { zh: '零（用现有习惯）', en: 'Zero (existing habits)' },
      },
      {
        aspect: { zh: '知识管理', en: 'Knowledge Mgmt' },
        traditional: { zh: '散落的对话', en: 'Scattered conversations' },
        mindspark: { zh: '结构化 + 复盘', en: 'Structured + reviewed' },
      },
      {
        aspect: { zh: '学习闭环', en: 'Learning Loop' },
        traditional: { zh: '无', en: 'None' },
        mindspark: {
          zh: '每日复盘 + 间隔重现',
          en: 'Daily review + spaced repetition',
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
          zh: '是的，目前完全免费使用。',
          en: 'Yes, it is completely free to use.',
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
```

**Step 2: Create language context**

Create `lib/i18n/LanguageContext.tsx`:

```tsx
'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import translations, { type Locale } from './translations';

interface LanguageContextValue {
  locale: Locale;
  toggleLocale: () => void;
  t: typeof translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getDefaultLocale(): Locale {
  if (typeof window === 'undefined') return 'zh';
  const lang = navigator.language;
  return lang.startsWith('zh') ? 'zh' : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(getDefaultLocale);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === 'zh' ? 'en' : 'zh'));
  }, []);

  const value = useMemo(
    () => ({ locale, toggleLocale, t: translations }),
    [locale, toggleLocale]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
```

**Step 3: Commit**

```bash
git add lib/i18n/translations.ts lib/i18n/LanguageContext.tsx
git commit -m "feat: add lightweight i18n system with zh/en translations"
```

---

### Task 3: Landing page shell — Navbar + Hero + basic layout

**Files:**
- Create: `components/landing/Navbar.tsx`
- Create: `components/landing/HeroSection.tsx`
- Create: `components/landing/LandingBackground.tsx`
- Replace: `app/page.tsx` (landing page)

**Step 1: Create the animated background**

Create `components/landing/LandingBackground.tsx`:

```tsx
'use client';

export default function LandingBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Warm base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F5F0E8] via-[#EDE8DC] to-[#E8E3D7]" />

      {/* Floating orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-morandi-mint/30 blur-3xl animate-float-slow" />
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-morandi-cream/25 blur-3xl animate-float-medium" />
      <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-morandi-sage/20 blur-3xl animate-float-fast" />
      <div className="absolute top-[60%] left-[50%] w-[300px] h-[300px] rounded-full bg-morandi-beige/30 blur-3xl animate-float-slow" />
    </div>
  );
}
```

**Step 2: Create the Navbar**

Create `components/landing/Navbar.tsx`:

```tsx
'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';

export default function Navbar() {
  const { locale, toggleLocale, t } = useLanguage();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/60 border-b border-white/40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-morandi-sage to-morandi-mint flex items-center justify-center">
            <span className="text-white font-serif font-semibold text-sm">M</span>
          </div>
          <span className="font-serif font-semibold text-lg text-morandi-text-primary">
            MindSpark
          </span>
        </div>

        {/* Nav links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-8 text-sm text-morandi-text-secondary">
          <button onClick={() => scrollTo('features')} className="hover:text-morandi-sage transition-colors">
            {t.nav.features[locale]}
          </button>
          <button onClick={() => scrollTo('how-it-works')} className="hover:text-morandi-sage transition-colors">
            {t.nav.howItWorks[locale]}
          </button>
          <button onClick={() => scrollTo('faq')} className="hover:text-morandi-sage transition-colors">
            {t.nav.faq[locale]}
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLocale}
            className="text-xs px-3 py-1.5 rounded-full border border-morandi-sage/30 text-morandi-text-secondary hover:bg-morandi-sage/10 transition-colors"
          >
            {locale === 'zh' ? 'EN' : '中文'}
          </button>
          <Link
            href="/sign-up"
            className="text-sm px-4 py-2 rounded-full bg-morandi-sage text-white hover:bg-morandi-sage/90 transition-colors"
          >
            {t.nav.getStarted[locale]}
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

**Step 3: Create the Hero section**

Create `components/landing/HeroSection.tsx`:

```tsx
'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';

export default function HeroSection() {
  const { locale, t } = useLanguage();

  return (
    <section className="min-h-screen flex items-center justify-center pt-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-morandi-cream/40 backdrop-blur-sm border border-morandi-cream/60 text-sm text-morandi-text-secondary mb-8">
          <span className="w-2 h-2 rounded-full bg-morandi-sage animate-pulse" />
          {locale === 'zh' ? 'AI 驱动的思维笔记' : 'AI-Powered Thinking Notes'}
        </div>

        {/* Tagline */}
        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold text-morandi-text-primary leading-tight mb-6">
          {t.hero.tagline[locale]}
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-morandi-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          {t.hero.subtitle[locale]}
        </p>

        {/* CTA buttons */}
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="px-8 py-3.5 rounded-full bg-morandi-sage text-white text-lg font-medium hover:bg-morandi-sage/90 transition-all hover:shadow-lg hover:shadow-morandi-sage/20"
          >
            {t.hero.cta[locale]}
          </Link>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3.5 rounded-full border border-morandi-sage/30 text-morandi-text-primary text-lg font-medium hover:bg-morandi-sage/10 transition-all"
          >
            {locale === 'zh' ? '了解更多' : 'Learn More'}
          </button>
        </div>

        {/* Product preview mockup */}
        <div className="mt-16 relative">
          <div className="rounded-2xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl shadow-morandi-sage/10 p-4 md:p-6 max-w-3xl mx-auto">
            <div className="rounded-xl bg-gradient-to-br from-[#F5F0E8] via-[#EDE8DC] to-[#E8E3D7] p-8 min-h-[300px] flex items-center justify-center relative overflow-hidden">
              {/* Simulated app UI */}
              <div className="space-y-4 w-full max-w-md">
                {/* Simulated note cards */}
                {[
                  { type: 'idea', color: 'morandi-cream', icon: '💡', text: locale === 'zh' ? '用户习惯驱动 AI，而不是反过来' : 'Let user habits drive AI, not vice versa' },
                  { type: 'action', color: 'morandi-mint', icon: '✅', text: locale === 'zh' ? '完成产品 landing page 设计' : 'Complete product landing page design' },
                  { type: 'query', color: 'morandi-sage', icon: '❓', text: locale === 'zh' ? '如何降低 AI 应用的使用门槛？' : 'How to lower the barrier to AI app usage?' },
                ].map((card, i) => (
                  <div
                    key={card.type}
                    className={`bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/60 shadow-sm transform transition-all`}
                    style={{ animationDelay: `${i * 0.15}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{card.icon}</span>
                      <p className="text-sm text-morandi-text-primary">{card.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating input bar simulation */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[80%]">
                <div className="bg-white/80 backdrop-blur-xl rounded-full px-5 py-3 border border-white/60 shadow-lg flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-morandi-sage/60" />
                  <span className="text-sm text-morandi-text-secondary/50">
                    {locale === 'zh' ? '记下你的想法...' : 'Capture your thought...'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative glow */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-morandi-sage/10 blur-3xl rounded-full" />
        </div>
      </div>
    </section>
  );
}
```

**Step 4: Replace app/page.tsx with landing page**

Replace `app/page.tsx`:

```tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import LandingPage from '@/components/landing/LandingPage';

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect('/app');
  }
  return <LandingPage />;
}
```

Create `components/landing/LandingPage.tsx` as a client wrapper:

```tsx
'use client';

import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import LandingBackground from './LandingBackground';
import Navbar from './Navbar';
import HeroSection from './HeroSection';

export default function LandingPage() {
  return (
    <LanguageProvider>
      <div className="min-h-screen overflow-y-auto">
        <LandingBackground />
        <Navbar />
        <HeroSection />
      </div>
    </LanguageProvider>
  );
}
```

**Step 5: Verify landing page renders**

Run: `npm run dev`
Navigate to `http://localhost:3000/` (logged out) — should show landing page with hero.
Navigate to `http://localhost:3000/` (logged in) — should redirect to `/app`.

**Step 6: Commit**

```bash
git add components/landing/ app/page.tsx lib/i18n/
git commit -m "feat: add landing page shell with navbar, hero section, and i18n"
```

---

### Task 4: Features section

**Files:**
- Create: `components/landing/FeaturesSection.tsx`
- Modify: `components/landing/LandingPage.tsx`

**Step 1: Create FeaturesSection**

Create `components/landing/FeaturesSection.tsx`:

```tsx
'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const featureIcons = [
  // Smart Classify
  <svg key="classify" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  // AI Process
  <svg key="process" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  // Daily Review
  <svg key="review" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  // Share
  <svg key="share" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
];

const featureColors = [
  'from-morandi-cream/40 to-morandi-cream/10',
  'from-morandi-sage/30 to-morandi-sage/10',
  'from-morandi-mint/40 to-morandi-mint/10',
  'from-morandi-beige/50 to-morandi-beige/10',
];

const featureKeys = ['smartClassify', 'aiProcess', 'dailyReview', 'share'] as const;

export default function FeaturesSection() {
  const { locale, t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="features" className="py-24 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-morandi-text-primary mb-4">
            {t.features.title[locale]}
          </h2>
          <p className="text-morandi-text-secondary text-lg max-w-xl mx-auto">
            {t.features.subtitle[locale]}
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featureKeys.map((key, i) => (
            <div
              key={key}
              className={`group rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 p-8 hover:bg-white/70 transition-all duration-500 hover:shadow-lg hover:shadow-morandi-sage/5 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 100 + 200}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${featureColors[i]} flex items-center justify-center text-morandi-text-primary mb-5 group-hover:scale-110 transition-transform`}>
                {featureIcons[i]}
              </div>
              <h3 className="font-serif text-xl font-semibold text-morandi-text-primary mb-3">
                {t.features[key].title[locale]}
              </h3>
              <p className="text-morandi-text-secondary leading-relaxed">
                {t.features[key].desc[locale]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Create scroll animation hook**

Create `hooks/useScrollAnimation.ts`:

```ts
'use client';

import { useEffect, useRef, useState } from 'react';

export function useScrollAnimation(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}
```

**Step 3: Add FeaturesSection to LandingPage**

Update `components/landing/LandingPage.tsx` — add import and render `<FeaturesSection />` after `<HeroSection />`.

**Step 4: Verify features section**

Run: `npm run dev`
Scroll down on landing page — features should fade in with staggered animation.

**Step 5: Commit**

```bash
git add components/landing/FeaturesSection.tsx hooks/useScrollAnimation.ts components/landing/LandingPage.tsx
git commit -m "feat: add features section with scroll animations"
```

---

### Task 5: How It Works section

**Files:**
- Create: `components/landing/HowItWorks.tsx`
- Modify: `components/landing/LandingPage.tsx`

**Step 1: Create HowItWorks component**

Create `components/landing/HowItWorks.tsx`:

```tsx
'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const stepIcons = ['✏️', '🤖', '🌱'];

const stepKeys = ['step1', 'step2', 'step3'] as const;

export default function HowItWorks() {
  const { locale, t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="how-it-works" className="py-24 px-6" ref={ref}>
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-morandi-text-primary mb-4">
            {t.howItWorks.title[locale]}
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-morandi-sage/30 via-morandi-cream/50 to-morandi-sage/30" />

          {stepKeys.map((key, i) => (
            <div
              key={key}
              className={`text-center transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 150 + 200}ms` }}
            >
              {/* Step number circle */}
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/70 backdrop-blur-sm border border-white/60 shadow-sm mb-6">
                <span className="text-3xl">{stepIcons[i]}</span>
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-morandi-sage text-white text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
              </div>

              <h3 className="font-serif text-xl font-semibold text-morandi-text-primary mb-3">
                {t.howItWorks[key].title[locale]}
              </h3>
              <p className="text-morandi-text-secondary leading-relaxed max-w-xs mx-auto">
                {t.howItWorks[key].desc[locale]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Add to LandingPage**

Update `components/landing/LandingPage.tsx` — import and render `<HowItWorks />` after `<FeaturesSection />`.

**Step 3: Commit**

```bash
git add components/landing/HowItWorks.tsx components/landing/LandingPage.tsx
git commit -m "feat: add how-it-works section with 3-step flow"
```

---

### Task 6: Value Proposition section

**Files:**
- Create: `components/landing/ValueProposition.tsx`
- Modify: `components/landing/LandingPage.tsx`

**Step 1: Create ValueProposition component**

Create `components/landing/ValueProposition.tsx`:

```tsx
'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function ValueProposition() {
  const { locale, t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 px-6" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-morandi-text-primary mb-4">
            {t.value.title[locale]}
          </h2>
          <p className="text-morandi-text-secondary text-lg">
            {t.value.subtitle[locale]}
          </p>
        </div>

        <div className={`rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 overflow-hidden transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <table className="w-full text-sm md:text-base">
            <thead>
              <tr className="border-b border-morandi-sage/10">
                <th className="text-left p-4 md:p-5 font-medium text-morandi-text-secondary w-1/4">
                  {t.value.headers.aspect[locale]}
                </th>
                <th className="text-left p-4 md:p-5 font-medium text-morandi-text-secondary w-[37.5%]">
                  {t.value.headers.traditional[locale]}
                </th>
                <th className="text-left p-4 md:p-5 font-medium text-morandi-sage w-[37.5%]">
                  {t.value.headers.mindspark[locale]} ✨
                </th>
              </tr>
            </thead>
            <tbody>
              {t.value.rows.map((row, i) => (
                <tr key={i} className="border-b border-morandi-sage/5 last:border-0">
                  <td className="p-4 md:p-5 font-medium text-morandi-text-primary">
                    {row.aspect[locale]}
                  </td>
                  <td className="p-4 md:p-5 text-morandi-text-secondary">
                    {row.traditional[locale]}
                  </td>
                  <td className="p-4 md:p-5 text-morandi-sage font-medium">
                    {row.mindspark[locale]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Add to LandingPage**

Update `components/landing/LandingPage.tsx` — import and render `<ValueProposition />` after `<HowItWorks />`.

**Step 3: Commit**

```bash
git add components/landing/ValueProposition.tsx components/landing/LandingPage.tsx
git commit -m "feat: add value proposition comparison table"
```

---

### Task 7: FAQ section

**Files:**
- Create: `components/landing/FAQSection.tsx`
- Modify: `components/landing/LandingPage.tsx`

**Step 1: Create FAQSection component**

Create `components/landing/FAQSection.tsx`:

```tsx
'use client';

import { useState, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function FAQSection() {
  const { locale, t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback((i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  }, []);

  return (
    <section id="faq" className="py-24 px-6" ref={ref}>
      <div className="max-w-3xl mx-auto">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-morandi-text-primary mb-4">
            {t.faq.title[locale]}
          </h2>
        </div>

        <div className="space-y-3">
          {t.faq.items.map((item, i) => (
            <div
              key={i}
              className={`rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 overflow-hidden transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 100 + 200}ms` }}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-white/30 transition-colors"
              >
                <span className="font-medium text-morandi-text-primary">
                  {item.q[locale]}
                </span>
                <span
                  className={`text-morandi-sage transition-transform duration-300 shrink-0 ${
                    openIndex === i ? 'rotate-45' : ''
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="px-5 pb-5 text-morandi-text-secondary leading-relaxed">
                  {item.a[locale]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Add to LandingPage**

Update `components/landing/LandingPage.tsx` — import and render `<FAQSection />` after `<ValueProposition />`.

**Step 3: Commit**

```bash
git add components/landing/FAQSection.tsx components/landing/LandingPage.tsx
git commit -m "feat: add FAQ section with accordion interaction"
```

---

### Task 8: CTA section + Footer

**Files:**
- Create: `components/landing/CTASection.tsx`
- Create: `components/landing/Footer.tsx`
- Modify: `components/landing/LandingPage.tsx`

**Step 1: Create CTASection**

Create `components/landing/CTASection.tsx`:

```tsx
'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import Link from 'next/link';

export default function CTASection() {
  const { locale, t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 px-6" ref={ref}>
      <div className={`max-w-3xl mx-auto text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="rounded-2xl bg-gradient-to-br from-morandi-sage/20 via-morandi-mint/15 to-morandi-cream/20 backdrop-blur-sm border border-white/50 p-12 md:p-16">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-morandi-text-primary mb-4">
            {t.cta.title[locale]}
          </h2>
          <p className="text-morandi-text-secondary text-lg mb-8">
            {t.cta.subtitle[locale]}
          </p>
          <Link
            href="/sign-up"
            className="inline-block px-10 py-4 rounded-full bg-morandi-sage text-white text-lg font-medium hover:bg-morandi-sage/90 transition-all hover:shadow-lg hover:shadow-morandi-sage/25"
          >
            {t.cta.button[locale]}
          </Link>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Create Footer**

Create `components/landing/Footer.tsx`:

```tsx
'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Footer() {
  const { locale, t } = useLanguage();

  return (
    <footer className="py-12 px-6 border-t border-morandi-sage/10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-morandi-text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-morandi-sage to-morandi-mint flex items-center justify-center">
            <span className="text-white font-serif text-xs font-semibold">M</span>
          </div>
          <span className="font-serif font-medium text-morandi-text-primary">MindSpark</span>
          <span className="mx-2">·</span>
          <span>{t.footer.tagline[locale]}</span>
        </div>
        <div>
          {t.footer.builtWith[locale]} · © {new Date().getFullYear()} MindSpark
        </div>
      </div>
    </footer>
  );
}
```

**Step 3: Finalize LandingPage.tsx**

Update `components/landing/LandingPage.tsx` with all sections:

```tsx
'use client';

import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import LandingBackground from './LandingBackground';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import HowItWorks from './HowItWorks';
import ValueProposition from './ValueProposition';
import FAQSection from './FAQSection';
import CTASection from './CTASection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <LanguageProvider>
      <div className="min-h-screen overflow-y-auto">
        <LandingBackground />
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <ValueProposition />
        <FAQSection />
        <CTASection />
        <Footer />
      </div>
    </LanguageProvider>
  );
}
```

**Step 4: Commit**

```bash
git add components/landing/CTASection.tsx components/landing/Footer.tsx components/landing/LandingPage.tsx
git commit -m "feat: add CTA section and footer, complete landing page"
```

---

### Task 9: CSS fix — Override body overflow for landing page

**Files:**
- Modify: `app/globals.css`

The existing `globals.css` sets `body { overflow: hidden }` which blocks scrolling on the landing page. The landing page uses `overflow-y-auto` on its wrapper div, but we should ensure this works correctly.

**Step 1: Verify scrolling works on landing page**

The landing page's wrapper `div` with `overflow-y-auto` should handle scrolling even with `body { overflow: hidden }`. If scrolling doesn't work, update globals.css:

```css
@layer base {
  body {
    margin: 0;
    font-family: 'Inter', sans-serif;
    background-color: transparent;
    color: #4B5563;
  }
}
```

And move `overflow: hidden` to the App component specifically. But first test if the current approach works — the `min-h-screen overflow-y-auto` div should provide its own scroll context.

**Step 2: If scrolling is blocked, fix it**

Add to globals.css a utility or modify body overflow. The safest approach: keep `overflow: hidden` on body but ensure the landing page wrapper has `position: fixed; inset: 0; overflow-y: auto;` or similar.

**Step 3: Commit if changed**

```bash
git add app/globals.css
git commit -m "fix: ensure landing page scrolling works with body overflow"
```

---

### Task 10: Responsive polish + final verification

**Files:**
- May modify any `components/landing/*.tsx` files

**Step 1: Test at mobile breakpoint (375px)**

Run: `npm run dev`
Open DevTools → responsive mode → 375px width.
Verify:
- Navbar: logo + lang toggle + CTA visible, nav links hidden
- Hero: text readable, mockup scales down nicely
- Features: single column
- How It Works: single column, no connecting line
- Value table: horizontal scroll or stacked layout
- FAQ: full width
- Footer: stacked vertically

**Step 2: Test at tablet breakpoint (768px)**

Verify 2-column grid for features, 3-column for how-it-works.

**Step 3: Test at desktop (1280px)**

Full layout as designed.

**Step 4: Test language toggle**

Click 中/EN button — all text should switch immediately without page reload.

**Step 5: Test auth redirect**

- Logged out at `/` → landing page
- Logged in at `/` → redirect to `/app`
- `/app` while logged out → redirect to `/sign-in`

**Step 6: Fix any issues found and commit**

```bash
git add -A
git commit -m "fix: responsive polish and final landing page adjustments"
```

---

### Task 11: Update metadata for SEO

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Update metadata in root layout**

Update `app/layout.tsx` metadata:

```tsx
export const metadata: Metadata = {
  title: 'MindSpark — AI-Powered Thinking Notes',
  description: 'Transform fragmented thoughts into structured knowledge. Just note it — AI connects the dots. 记录即思考，AI 帮你连点成线。',
  keywords: ['AI notes', 'thinking tool', 'knowledge management', 'daily review', 'MindSpark', 'AI笔记', '灵感记录'],
  openGraph: {
    title: 'MindSpark — AI-Powered Thinking Notes',
    description: 'Just note it. AI connects the dots.',
    type: 'website',
  },
};
```

**Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: update metadata for SEO and social sharing"
```

---

## Summary

| Task | Description | Est. Files |
|------|-------------|-----------|
| 1 | Route restructuring (move app to route group) | 4 |
| 2 | i18n system (translations + context) | 2 |
| 3 | Landing shell (Navbar + Hero + background) | 5 |
| 4 | Features section | 2 |
| 5 | How It Works section | 1 |
| 6 | Value Proposition section | 1 |
| 7 | FAQ section | 1 |
| 8 | CTA + Footer | 3 |
| 9 | CSS fix for scrolling | 1 |
| 10 | Responsive polish + verification | varies |
| 11 | SEO metadata | 1 |

**Total new files:** ~15 | **Modified files:** ~4
