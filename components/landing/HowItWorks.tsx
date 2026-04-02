'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const stepKeys = ['step1', 'step2', 'step3'] as const;

const stepDetails = [
  {
    number: '01',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    number: '02',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V11h3a3 3 0 0 1 3 3v1" />
        <path d="M8 9.5A4 4 0 0 1 12 2" />
        <circle cx="12" cy="18" r="4" />
        <path d="M12 14v-3" />
      </svg>
    ),
  },
  {
    number: '03',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const { locale, t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="how-it-works" className="py-28 px-6" ref={ref}>
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xs font-medium text-morandi-sage tracking-widest uppercase mb-3">
            {locale === 'zh' ? '使用方式' : 'How It Works'}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-morandi-text-primary tracking-tight">
            {t.howItWorks.title[locale]}
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px">
            <div className="w-full h-full bg-gradient-to-r from-morandi-sage/25 via-morandi-cream/40 to-morandi-sage/25" />
          </div>

          {stepKeys.map((key, i) => (
            <div
              key={key}
              className={`text-center transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 150 + 200}ms` }}
            >
              {/* Step circle */}
              <div className="relative inline-flex items-center justify-center w-[72px] h-[72px] rounded-2xl bg-white/70 backdrop-blur-sm border border-morandi-sage/10 shadow-sm mb-6">
                <span className="text-morandi-sage">{stepDetails[i].icon}</span>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-morandi-sage text-white text-[10px] flex items-center justify-center font-semibold">
                  {stepDetails[i].number}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-morandi-text-primary mb-2.5">
                {t.howItWorks[key].title[locale]}
              </h3>
              <p className="text-morandi-text-secondary leading-relaxed max-w-xs mx-auto text-[15px]">
                {t.howItWorks[key].desc[locale]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
