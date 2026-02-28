import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'MindSpark — AI-Powered Thinking Notes',
  description: 'Transform fragmented thoughts into structured knowledge. Just note it — AI connects the dots. 记录即思考，AI 帮你连点成线。',
  keywords: ['AI notes', 'thinking tool', 'knowledge management', 'daily review', 'MindSpark', 'AI笔记', '灵感记录'],
  openGraph: {
    title: 'MindSpark — AI-Powered Thinking Notes',
    description: 'Just note it. AI connects the dots.',
    type: 'website',
  },
};

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // If Clerk is not configured yet, render without auth wrapper
  if (!clerkPublishableKey) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>{children}</body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>{children}</body>
      </html>
    </ClerkProvider>
  );
}
