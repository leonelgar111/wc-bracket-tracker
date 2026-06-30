import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WC 2026 Bracket Tracker',
  description: 'World Cup 2026 bracket predictions leaderboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
