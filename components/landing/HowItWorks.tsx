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
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-morandi-text-primary mb-4">
            {t.howItWorks.title[locale]}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-morandi-sage/30 via-morandi-cream/50 to-morandi-sage/30" />

          {stepKeys.map((key, i) => (
            <div
              key={key}
              className={`text-center transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 150 + 200}ms` }}
            >
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
