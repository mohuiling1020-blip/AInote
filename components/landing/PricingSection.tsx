'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import Link from 'next/link';

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="3.5 8.5 6.5 11.5 12.5 5.5" />
    </svg>
  );
}

export default function PricingSection() {
  const { locale, t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();
  const [isYearly, setIsYearly] = useState(false);

  const pricing = t.pricing;
  const freePlan = pricing.free;
  const proPlan = pricing.pro;

  const proPrice = isYearly ? proPlan.price.yearly : proPlan.price.monthly;
  const currency = proPlan.currency[locale];

  return (
    <section id="pricing" className="py-28 px-6" ref={ref}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xs font-medium text-morandi-sage tracking-widest uppercase mb-3">
            {locale === 'zh' ? '定价' : 'Pricing'}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-morandi-text-primary mb-4 tracking-tight">
            {pricing.title[locale]}
          </h2>
          <p className="text-morandi-text-secondary text-lg max-w-xl mx-auto">
            {pricing.subtitle[locale]}
          </p>
        </div>

        {/* Billing Toggle */}
        <div className={`flex items-center justify-center gap-3 mb-14 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className={`text-sm transition-colors duration-200 ${!isYearly ? 'text-morandi-text-primary font-medium' : 'text-morandi-text-muted'}`}>
            {pricing.monthly[locale]}
          </span>
          <button
            onClick={() => setIsYearly(prev => !prev)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${isYearly ? 'bg-morandi-sage' : 'bg-morandi-sage/25'}`}
            aria-label="Toggle billing period"
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${isYearly ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className={`text-sm transition-colors duration-200 ${isYearly ? 'text-morandi-text-primary font-medium' : 'text-morandi-text-muted'}`}>
            {pricing.yearly[locale]}
          </span>
          {isYearly && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-semibold">
              {pricing.yearlyDiscount[locale]}
            </span>
          )}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Card */}
          <div
            className={`rounded-2xl bg-white/50 border border-morandi-sage/8 p-8 flex flex-col transition-all duration-500 hover:shadow-lg hover:shadow-morandi-sage/5 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <h3 className="text-xl font-semibold text-morandi-text-primary mb-2">
              {freePlan.name[locale]}
            </h3>
            <p className="text-morandi-text-secondary text-sm mb-6 leading-relaxed">
              {freePlan.desc[locale]}
            </p>

            <div className="mb-8">
              <span className="font-serif text-4xl font-semibold text-morandi-text-primary">
                {locale === 'zh' ? '¥' : '$'}{freePlan.price.monthly}
              </span>
              <span className="text-morandi-text-muted text-sm ml-1">
                {pricing.perMonth[locale]}
              </span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {freePlan.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-morandi-text-secondary">
                  <span className="text-morandi-sage-light mt-0.5 shrink-0"><CheckIcon /></span>
                  {feat[locale]}
                </li>
              ))}
            </ul>

            <Link
              href="/sign-up"
              className="block text-center px-6 py-3 rounded-xl border border-morandi-sage/20 text-morandi-sage font-medium hover:bg-morandi-sage/8 transition-all duration-200"
            >
              {freePlan.cta[locale]}
            </Link>
          </div>

          {/* Pro Card */}
          <div
            className={`relative rounded-2xl bg-gradient-to-br from-morandi-sage/10 via-white/70 to-morandi-mint/10 border-2 border-morandi-sage/20 p-8 flex flex-col transition-all duration-500 hover:shadow-xl hover:shadow-morandi-sage/10 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '350ms' }}
          >
            {/* Badge */}
            <span className="absolute -top-3 left-6 text-[10px] px-3 py-1 rounded-md bg-morandi-sage text-white font-semibold tracking-wide">
              {proPlan.badge[locale]}
            </span>

            <h3 className="text-xl font-semibold text-morandi-text-primary mb-2">
              {proPlan.name[locale]}
            </h3>
            <p className="text-morandi-text-secondary text-sm mb-6 leading-relaxed">
              {proPlan.desc[locale]}
            </p>

            <div className="mb-8">
              <span className="font-serif text-4xl font-semibold text-morandi-text-primary">
                {currency}{proPrice}
              </span>
              <span className="text-morandi-text-muted text-sm ml-1">
                {pricing.perMonth[locale]}
              </span>
              {isYearly && (
                <span className="block text-xs text-morandi-text-muted mt-1">
                  {pricing.billedYearly[locale]}
                </span>
              )}
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {proPlan.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-morandi-text-secondary">
                  <span className="text-morandi-sage mt-0.5 shrink-0"><CheckIcon /></span>
                  {feat[locale]}
                </li>
              ))}
            </ul>

            <Link
              href="/sign-up"
              className="block text-center px-6 py-3 rounded-xl bg-morandi-sage text-white font-medium hover:bg-morandi-sage/90 transition-all duration-200 hover:shadow-lg hover:shadow-morandi-sage/20"
            >
              {proPlan.cta[locale]}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
