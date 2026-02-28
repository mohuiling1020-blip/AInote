'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function ValueProposition() {
  const { locale, t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 px-6" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-morandi-text-primary mb-4">
            {t.value.title[locale]}
          </h2>
          <p className="text-morandi-text-secondary text-lg">
            {t.value.subtitle[locale]}
          </p>
        </div>

        <div className={`rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 overflow-x-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <table className="w-full text-sm md:text-base">
            <thead>
              <tr className="border-b border-morandi-sage/10">
                <th className="text-left p-4 md:p-5 font-medium text-morandi-text-secondary w-1/4">
                  {t.value.headers.aspect[locale]}
                </th>
                <th className="text-left p-4 md:p-5 font-medium text-morandi-text-secondary w-[37.5%]">
                  {t.value.headers.traditional[locale]}
                </th>
                <th className="text-left p-4 md:p-5 font-medium text-morandi-sage w-[37.5%]">
                  {t.value.headers.mindspark[locale]} ✨
                </th>
              </tr>
            </thead>
            <tbody>
              {t.value.rows.map((row, i) => (
                <tr key={i} className="border-b border-morandi-sage/5 last:border-0">
                  <td className="p-4 md:p-5 font-medium text-morandi-text-primary">
                    {row.aspect[locale]}
                  </td>
                  <td className="p-4 md:p-5 text-morandi-text-secondary">
                    {row.traditional[locale]}
                  </td>
                  <td className="p-4 md:p-5 text-morandi-sage font-medium">
                    {row.mindspark[locale]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
