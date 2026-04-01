import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import LandingPage from '@/components/landing/LandingPage';

interface HomeProps {
  searchParams: Promise<{ pricing?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { pricing } = await searchParams;
  const { userId } = await auth();
  if (userId && !pricing) {
    redirect('/app');
  }
  return <LandingPage />;
}
