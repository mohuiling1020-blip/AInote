'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const featureIcons = [
  <svg key="classify" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  <svg key="process" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  <svg key="review" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
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
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-morandi-text-primary mb-4">
            {t.features.title[locale]}
          </h2>
          <p className="text-morandi-text-secondary text-lg max-w-xl mx-auto">
            {t.features.subtitle[locale]}
          </p>
        </div>

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
