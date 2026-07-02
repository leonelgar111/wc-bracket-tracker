import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import type { ResultsData } from '@/lib/types';
import { REALISTIC, FUN } from '@/lib/brackets';
import { buildPlayerScores } from '@/lib/scoring';
import Dashboard from './components/Dashboard';

export const dynamic = 'force-dynamic';

function readResults(): ResultsData {
  try {
    const p = path.join(process.cwd(), 'data', 'results.json');
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as ResultsData;
  } catch {
    return { winners: { R32: [], R16: [], QF: [], SF: [], Champion: null }, matches: [] };
  }
}


export default function Home() {
  const data = readResults();
  const realistic = buildPlayerScores(REALISTIC, data.winners);
  const fun = buildPlayerScores(FUN, data.winners);

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10"
        style={{
          background: 'rgba(227,227,227,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/wc-logo.jpeg" alt="WC 2026" style={{ height: 60, width: 'auto', flexShrink: 0, borderRadius: 8, background: 'transparent', mixBlendMode: 'multiply' }} />
            {/* Thin divider */}
            <div style={{ width: 1, height: 28, background: 'rgba(0,0,0,0.12)', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', margin: 0 }}>
                World Cup 2026
              </p>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                Bracket Tracker
              </h1>
            </div>
          </div>

          <Link
            href="/admin"
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '7px 14px',
              borderRadius: 10,
              background: 'var(--accent)',
              color: '#ffffff',
              textDecoration: 'none',
            }}
          >
            Admin
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
        <Dashboard
          realistic={realistic}
          fun={fun}
          realisticBrackets={REALISTIC}
          funBrackets={FUN}
          winners={data.winners}
          matches={data.matches}
        />
      </div>
    </main>
  );
}
