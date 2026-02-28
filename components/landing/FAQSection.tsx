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
