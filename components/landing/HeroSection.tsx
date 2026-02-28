'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';

const MOCK_CARDS = [
  {
    type: 'idea',
    icon: '\u{1F4A1}',
    text: { zh: '用户习惯驱动 AI，而不是反过来', en: 'Let user habits drive AI, not vice versa' },
  },
  {
    type: 'action',
    icon: '\u2705',
    text: { zh: '完成产品 landing page 设计', en: 'Complete product landing page design' },
  },
  {
    type: 'query',
    icon: '\u2753',
    text: { zh: '如何降低 AI 应用的使用门槛？', en: 'How to lower the barrier to AI app usage?' },
  },
] as const;

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
                {MOCK_CARDS.map((card, i) => (
                  <div
                    key={card.type}
                    className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/60 shadow-sm"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{card.icon}</span>
                      <p className="text-sm text-morandi-text-primary">{card.text[locale]}</p>
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
