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

/**
 * Original "26" tournament badge.
 * Trophy silhouette is entirely custom geometry — no reference to any
 * official FIFA or World Cup trophy design.
 *
 * Structure: wide flat rim → sides taper inward → rounded bottom →
 * thin stem → two-tier base. Handles are simple D-curve strokes.
 */
function HeaderBadge() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, lineHeight: 1, flexShrink: 0 }}>
      {/* "2" */}
      <span style={{
        fontSize: 30,
        fontWeight: 900,
        color: '#111111',
        letterSpacing: '-0.03em',
        lineHeight: 1,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
      }}>2</span>

      {/* Original trophy silhouette — viewBox 0 0 22 24 */}
      <svg
        width="22"
        height="24"
        viewBox="0 0 22 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hdrGold" x1="11" y1="0" x2="11" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#f8d860" />
            <stop offset="48%"  stopColor="#d4a017" />
            <stop offset="100%" stopColor="#9a7000" />
          </linearGradient>
        </defs>

        {/* Cup bowl: wide flat rim, sides taper inward, rounded bottom */}
        <path
          d="M3,1 L19,1 L16,13 Q11,17 6,13 Z"
          fill="url(#hdrGold)"
        />

        {/* Rim highlight — thin brighter strip along the top edge */}
        <rect x="3" y="1" width="16" height="2" rx="1" fill="#fce97a" opacity="0.55" />

        {/* Left ear handle */}
        <path
          d="M3,6 Q1.5,6 1.5,10 Q1.5,13 3,11"
          stroke="url(#hdrGold)"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Right ear handle */}
        <path
          d="M19,6 Q20.5,6 20.5,10 Q20.5,13 19,11"
          stroke="url(#hdrGold)"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Stem */}
        <rect x="9" y="15" width="4" height="4" fill="#d4a017" />

        {/* Base upper band */}
        <rect x="7" y="19" width="8" height="1.5" rx="0.75" fill="#d4a017" />

        {/* Base lower (slightly wider, darker) */}
        <rect x="5" y="20.5" width="12" height="2" rx="1" fill="#9a7000" />
      </svg>

      {/* "6" */}
      <span style={{
        fontSize: 30,
        fontWeight: 900,
        color: '#111111',
        letterSpacing: '-0.03em',
        lineHeight: 1,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
      }}>6</span>
    </div>
  );
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
          {/* Badge + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <HeaderBadge />
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
