'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function ValueProposition() {
  const { locale, t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-28 px-6" ref={ref}>
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className={`text-center mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xs font-medium text-morandi-sage tracking-widest uppercase mb-3">
            {locale === 'zh' ? '对比' : 'Comparison'}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-morandi-text-primary mb-4 tracking-tight">
            {t.value.title[locale]}
          </h2>
          <p className="text-morandi-text-secondary text-lg">
            {t.value.subtitle[locale]}
          </p>
        </div>

        {/* Comparison cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Traditional */}
          <div className="rounded-2xl bg-white/40 border border-morandi-sage/8 p-7">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="font-semibold text-morandi-text-secondary">
                {t.value.headers.traditional[locale]}
              </h3>
            </div>
            <div className="space-y-4">
              {t.value.rows.map((row, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-morandi-text-muted uppercase tracking-wide mb-0.5">
                      {row.aspect[locale]}
                    </p>
                    <p className="text-sm text-morandi-text-secondary">{row.traditional[locale]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MindSpark */}
          <div className="rounded-2xl bg-gradient-to-br from-morandi-sage/8 via-white/60 to-morandi-mint/10 border border-morandi-sage/15 p-7 relative">
            <div className="absolute top-4 right-4">
              <span className="text-[10px] px-2 py-1 rounded-md bg-morandi-sage/10 text-morandi-sage font-semibold tracking-wide uppercase">
                {locale === 'zh' ? '更好' : 'Better'}
              </span>
            </div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-morandi-sage flex items-center justify-center">
                <span className="text-white font-serif text-xs font-semibold">M</span>
              </div>
              <h3 className="font-semibold text-morandi-text-primary">
                {t.value.headers.mindspark[locale]}
              </h3>
            </div>
            <div className="space-y-4">
              {t.value.rows.map((row, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-1 text-morandi-sage shrink-0">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <polyline points="3.5 8.5 6.5 11.5 12.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-medium text-morandi-text-muted uppercase tracking-wide mb-0.5">
                      {row.aspect[locale]}
                    </p>
                    <p className="text-sm text-morandi-text-primary font-medium">{row.mindspark[locale]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
