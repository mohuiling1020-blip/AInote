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
    <section id="faq" className="py-28 px-6" ref={ref}>
      <div className="max-w-2xl mx-auto">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xs font-medium text-morandi-sage tracking-widest uppercase mb-3">
            {locale === 'zh' ? '常见问题' : 'FAQ'}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-morandi-text-primary tracking-tight">
            {t.faq.title[locale]}
          </h2>
        </div>

        <div className="space-y-2">
          {t.faq.items.map((item, i) => (
            <div
              key={i}
              className={`rounded-xl border border-morandi-sage/8 overflow-hidden transition-all duration-700 ${
                openIndex === i ? 'bg-white/60' : 'bg-white/35 hover:bg-white/50'
              } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 80 + 200}ms` }}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 transition-colors duration-200"
              >
                <span className="font-medium text-morandi-text-primary text-[15px]">
                  {item.q[locale]}
                </span>
                <span
                  className={`text-morandi-sage transition-transform duration-300 shrink-0 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="px-5 pb-5 text-morandi-text-secondary leading-relaxed text-[15px]">
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
