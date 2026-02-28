'use client';

import dynamic from 'next/dynamic';

const DailyReviewPage = dynamic(
  () => import('@/components/daily-review/DailyReviewPage').then(mod => ({ default: mod.DailyReviewPage })),
  { ssr: false },
);

export default function DailyReviewRoute() {
  return <DailyReviewPage />;
}
