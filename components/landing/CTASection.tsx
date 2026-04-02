'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import Link from 'next/link';

export default function CTASection() {
  const { locale, t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-28 px-6" ref={ref}>
      <div className={`max-w-4xl mx-auto text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="relative rounded-3xl bg-morandi-sage p-14 md:p-20 overflow-hidden">
          {/* Decorative pattern */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-morandi-sage via-morandi-sage to-[#5A6B5E]" />

          <div className="relative z-10">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">
              {t.cta.title[locale]}
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-md mx-auto">
              {t.cta.subtitle[locale]}
            </p>
            <Link
              href="/sign-up"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-morandi-sage font-semibold hover:bg-white/95 transition-all duration-300 hover:shadow-lg hover:shadow-black/10"
            >
              {t.cta.button[locale]}
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
