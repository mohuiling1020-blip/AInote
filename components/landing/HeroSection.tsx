'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';

const MOCK_CARDS = [
  {
    type: 'idea',
    icon: '💡',
    label: { zh: '灵感', en: 'Idea' },
    text: { zh: '用户习惯驱动 AI，而不是反过来', en: 'Let user habits drive AI, not vice versa' },
    color: 'bg-amber-50 border-amber-200/60 text-amber-700',
    labelColor: 'bg-amber-100 text-amber-600',
  },
  {
    type: 'action',
    icon: '✓',
    label: { zh: '待办', en: 'Task' },
    text: { zh: '完成产品 landing page 设计', en: 'Complete product landing page design' },
    color: 'bg-emerald-50 border-emerald-200/60 text-emerald-700',
    labelColor: 'bg-emerald-100 text-emerald-600',
  },
  {
    type: 'query',
    icon: '?',
    label: { zh: '问题', en: 'Question' },
    text: { zh: '如何降低 AI 应用的使用门槛？', en: 'How to lower the barrier to AI app usage?' },
    color: 'bg-blue-50 border-blue-200/60 text-blue-700',
    labelColor: 'bg-blue-100 text-blue-600',
  },
] as const;

export default function HeroSection() {
  const { locale, t } = useLanguage();

  return (
    <section className="min-h-screen flex items-center pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-morandi-cream/25 border border-morandi-cream/40 text-xs font-medium text-morandi-text-secondary tracking-wide uppercase mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-morandi-sage animate-pulse" />
              {locale === 'zh' ? 'AI 驱动的思维笔记' : 'AI-Powered Thinking Notes'}
            </div>

            {/* Tagline */}
            <h1 className="font-serif text-5xl md:text-6xl lg:text-[4.25rem] font-semibold text-morandi-text-primary leading-[1.1] mb-6 tracking-tight">
              {t.hero.tagline[locale]}
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-morandi-text-secondary max-w-lg leading-relaxed mb-10">
              {t.hero.subtitle[locale]}
            </p>

            {/* CTA buttons */}
            <div className="flex items-center gap-4">
              <Link
                href="/sign-up"
                className="group px-7 py-3.5 rounded-xl bg-morandi-sage text-white font-medium hover:bg-morandi-sage/90 transition-all duration-300 hover:shadow-lg hover:shadow-morandi-sage/20 flex items-center gap-2"
              >
                {t.hero.cta[locale]}
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-7 py-3.5 rounded-xl border border-morandi-sage/20 text-morandi-text-primary font-medium hover:bg-morandi-sage/8 transition-all duration-300"
              >
                {locale === 'zh' ? '了解更多' : 'Learn More'}
              </button>
            </div>
          </div>

          {/* Right: Product preview */}
          <div className="relative">
            <div className="rounded-2xl bg-white/60 backdrop-blur-xl border border-morandi-sage/8 shadow-xl shadow-morandi-sage/5 p-5">
              <div className="rounded-xl bg-gradient-to-br from-morandi-paper-warm to-morandi-paper p-6 min-h-[340px] flex flex-col relative">
                {/* Mock app header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-300/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-300/60" />
                    <div className="w-3 h-3 rounded-full bg-green-300/60" />
                  </div>
                  <span className="text-[10px] text-morandi-text-muted font-medium tracking-wider uppercase">
                    MindSpark
                  </span>
                </div>

                {/* Mock cards */}
                <div className="space-y-3 flex-1">
                  {MOCK_CARDS.map((card, i) => (
                    <div
                      key={card.type}
                      className={`rounded-xl p-4 border ${card.color} transition-all duration-500`}
                      style={{
                        opacity: 0,
                        animation: `slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.15 + 0.3}s forwards`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${card.labelColor}`}>
                          {card.label[locale]}
                        </span>
                        <p className="text-sm font-medium">{card.text[locale]}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Floating input */}
                <div className="mt-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 border border-morandi-sage/10 shadow-sm flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-morandi-sage/10 flex items-center justify-center">
                      <span className="text-morandi-sage text-xs">+</span>
                    </div>
                    <span className="text-sm text-morandi-text-muted">
                      {locale === 'zh' ? '记下你的想法...' : 'Capture your thought...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative accent */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-12 bg-morandi-sage/6 blur-2xl rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
