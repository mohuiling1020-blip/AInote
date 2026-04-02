'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const featureKeys = ['smartClassify', 'aiProcess', 'dailyReview', 'share'] as const;

const featureAccents = [
  { border: 'border-l-amber-400', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  { border: 'border-l-violet-400', iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
  { border: 'border-l-emerald-400', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { border: 'border-l-sky-400', iconBg: 'bg-sky-50', iconColor: 'text-sky-600' },
];

const featureIcons = [
  // Smart Classify — sparkle / star
  <svg key="classify" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  // AI Process — cube / processor
  <svg key="process" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  // Daily Review — book
  <svg key="review" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  // Share — share
  <svg key="share" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
];

export default function FeaturesSection() {
  const { locale, t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="features" className="py-28 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className={`max-w-2xl mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xs font-medium text-morandi-sage tracking-widest uppercase mb-3">
            {locale === 'zh' ? '功能' : 'Features'}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-morandi-text-primary mb-4 tracking-tight">
            {t.features.title[locale]}
          </h2>
          <p className="text-morandi-text-secondary text-lg leading-relaxed">
            {t.features.subtitle[locale]}
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {featureKeys.map((key, i) => {
            const accent = featureAccents[i];
            return (
              <div
                key={key}
                className={`group rounded-2xl bg-white/55 backdrop-blur-sm border border-morandi-sage/8 border-l-[3px] ${accent.border} p-7 hover:bg-white/75 transition-all duration-500 hover:shadow-lg hover:shadow-morandi-sage/5 hover:-translate-y-0.5 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 100 + 200}ms` }}
              >
                <div className={`w-11 h-11 rounded-xl ${accent.iconBg} flex items-center justify-center ${accent.iconColor} mb-5`}>
                  {featureIcons[i]}
                </div>
                <h3 className="text-lg font-semibold text-morandi-text-primary mb-2.5">
                  {t.features[key].title[locale]}
                </h3>
                <p className="text-morandi-text-secondary leading-relaxed text-[15px]">
                  {t.features[key].desc[locale]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
