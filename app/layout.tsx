import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MindSpark - Morandi Diffuse',
  description: 'Transform fragmented thoughts into structured knowledge',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

