'use client';

import { useState } from 'react';
import type { Match, PlayerScore, PlayerBracket, Winners } from '@/lib/types';
import { flag } from '@/lib/flags';
import { MAX_SCORE } from '@/lib/scoring';

interface DashboardProps {
  realistic: PlayerScore[];
  fun: PlayerScore[];
  realisticBrackets: Record<string, PlayerBracket>;
  funBrackets: Record<string, PlayerBracket>;
  winners: Winners;
  matches: Match[];
}

// Gold / silver / bronze / gray / gray
const RANK_COLORS = ['#d4a017', '#8a8a8a', '#a0693a', '#9b9b9b', '#9b9b9b'];

// Gradient fills for progress bars — left-to-right, darker → lighter
const RANK_FILLS = [
  'linear-gradient(90deg, #b87c00, #f0ca40)',
  'linear-gradient(90deg, #686868, #adadad)',
  'linear-gradient(90deg, #7e5030, #c88a50)',
  'linear-gradient(90deg, #7e7e7e, #b4b4b4)',
  'linear-gradient(90deg, #7e7e7e, #b4b4b4)',
];

// Shadow hierarchy — #1 clearly elevated, ranks 2-5 recede
const CARD_SHADOWS = [
  '0 16px 48px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12)',
  '0 2px 10px rgba(0,0,0,0.07)',
  '0 2px 8px rgba(0,0,0,0.06)',
  '0 1px 4px rgba(0,0,0,0.05)',
  '0 1px 4px rgba(0,0,0,0.05)',
];

const AVATARS: Record<string, string> = {
  Adan:   '/avatars/adan.png',
  Abe:    '/avatars/abe.png',
  Joey:   '/avatars/joey.png',
  Carlos: '/avatars/carlos.png',
};

const STAGE_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  R32:   { label: 'R32',   bg: '#e6f4ea', color: '#276b3a' },
  R16:   { label: 'R16',   bg: '#e8edf8', color: '#2c4da0' },
  QF:    { label: 'QF',    bg: '#fef3e2', color: '#a05d00' },
  SF:    { label: 'SF',    bg: '#f2eaf9', color: '#6c2da0' },
  Final: { label: 'Final', bg: '#fdeaea', color: '#a02020' },
};

const ROUND_CONFIG = [
  { key: 'R32' as const, label: 'Round of 32',   pts: 1  },
  { key: 'R16' as const, label: 'Round of 16',   pts: 2  },
  { key: 'QF'  as const, label: 'Quarterfinals', pts: 4  },
  { key: 'SF'  as const, label: 'Semifinals',    pts: 8  },
];

function formatDate(iso: string) {
  if (!iso) return '';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Team pick chip ──────────────────────────────────────────────────────────

type PickStatus = 'correct' | 'wrong' | 'pending';

function TeamChip({
  team, status, pts, dark,
}: {
  team: string; status: PickStatus; pts: number; dark?: boolean;
}) {
  type Cfg = { bg: string; color: string; icon: string; label: string };
  const light: Record<PickStatus, Cfg> = {
    correct: { bg: '#e6f4ea', color: '#276b3a', icon: '✓', label: `+${pts}` },
    wrong:   { bg: 'rgba(0,0,0,0.05)', color: '#a3a3a3', icon: '✗', label: '0' },
    pending: { bg: 'rgba(0,0,0,0.04)', color: '#8a8a8a', icon: '·', label: '' },
  };
  const darkMap: Record<PickStatus, Cfg> = {
    correct: { bg: 'rgba(80,200,100,0.18)', color: '#6ee89a', icon: '✓', label: `+${pts}` },
    wrong:   { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.32)', icon: '✗', label: '0' },
    pending: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', icon: '·', label: '' },
  };
  const cfg = dark ? darkMap[status] : light[status];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 500,
        background: cfg.bg,
        color: cfg.color,
        lineHeight: 1.4,
      }}
    >
      <span style={{ fontWeight: 700, fontSize: 11 }}>{cfg.icon}</span>
      <span>{flag(team)} {team}</span>
      {cfg.label && <span style={{ fontWeight: 700, fontSize: 11 }}>{cfg.label}</span>}
    </span>
  );
}

// ── Expanded pick breakdown ─────────────────────────────────────────────────

function ExpandedDetails({
  bracket, winners, dark,
}: {
  bracket: PlayerBracket; winners: Winners; dark?: boolean;
}) {
  const labelColor = dark ? 'rgba(255,255,255,0.45)' : '#8a8a8a';
  const subtotalColor = (earned: number) =>
    dark
      ? (earned > 0 ? '#6ee89a' : 'rgba(255,255,255,0.3)')
      : (earned > 0 ? '#276b3a' : '#a3a3a3');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {ROUND_CONFIG.map(({ key, label, pts }) => {
        const actual = winners[key] ?? [];
        const hasResults = actual.length > 0;
        const actualSet = new Set(actual);
        const earned = bracket[key].filter(t => actualSet.has(t)).length * pts;

        return (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: labelColor, textTransform: 'uppercase' }}>
                {label}
                <span style={{ fontWeight: 400 }}> · +{pts}pt each</span>
              </span>
              {hasResults && (
                <span style={{ fontSize: 12, fontWeight: 700, color: subtotalColor(earned) }}>
                  +{earned}pt
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {bracket[key].map(team => {
                const status: PickStatus = !hasResults ? 'pending'
                  : actualSet.has(team) ? 'correct' : 'wrong';
                return <TeamChip key={team} team={team} status={status} pts={pts} dark={dark} />;
              })}
            </div>
          </div>
        );
      })}

      {/* Champion */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: labelColor, textTransform: 'uppercase' }}>
            Champion <span style={{ fontWeight: 400 }}>· +16pt bonus</span>
          </span>
          {winners.Champion && (
            <span style={{ fontSize: 12, fontWeight: 700, color: subtotalColor(winners.Champion === bracket.Champion ? 16 : 0) }}>
              {winners.Champion === bracket.Champion ? '+16pt' : '+0pt'}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <TeamChip
            team={bracket.Champion}
            status={!winners.Champion ? 'pending' : winners.Champion === bracket.Champion ? 'correct' : 'wrong'}
            pts={16}
            dark={dark}
          />
        </div>
      </div>
    </div>
  );
}

// ── Player card ─────────────────────────────────────────────────────────────

function PlayerCard({
  rank, player, bracket, winners,
}: {
  rank: number; player: PlayerScore; bracket: PlayerBracket; winners: Winners;
}) {
  const [open, setOpen] = useState(false);
  const pct = Math.round((player.points / MAX_SCORE) * 100);
  const dark = rank === 1;
  const rankColor    = RANK_COLORS[rank - 1] ?? '#9b9b9b';
  const gradientFill = RANK_FILLS[rank - 1]  ?? RANK_FILLS[4];
  const cardShadow   = CARD_SHADOWS[rank - 1] ?? CARD_SHADOWS[4];

  const textPrimary   = dark ? '#ffffff' : '#111111';
  const textSecondary = dark ? 'rgba(255,255,255,0.38)' : '#a3a3a3';
  const textTertiary  = dark ? 'rgba(255,255,255,0.22)' : '#c0c0c0';
  const trackBg       = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const expandedBg    = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';
  const dividerColor  = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';

  return (
    <div
      style={{
        background: dark ? '#1a1a1a' : '#ffffff',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: cardShadow,
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px 8px' }}>
          {/* Rank */}
          <span style={{ fontSize: 16, fontWeight: 800, color: rankColor, width: 22, flexShrink: 0, lineHeight: 1, textAlign: 'center' }}>
            {rank}
          </span>

          {/* Avatar */}
          {AVATARS[player.name] ? (
            <img
              src={AVATARS[player.name]}
              alt={player.name}
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                objectFit: 'cover',
                objectPosition: '50% 15%',
                flexShrink: 0,
                border: `2px solid ${dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.07)'}`,
              }}
            />
          ) : (
            <div style={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              flexShrink: 0,
              background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 17,
              fontWeight: 700,
              color: dark ? 'rgba(255,255,255,0.55)' : '#9b9b9b',
            }}>
              {player.name[0]}
            </div>
          )}

          {/* Name + champion — secondary text lighter and smaller */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: 15, color: textPrimary, margin: 0, lineHeight: 1.3 }}>
              {player.name}
            </p>
            <p style={{ fontSize: 11, color: textSecondary, margin: '3px 0 0', letterSpacing: '0.01em' }}>
              {flag(player.champion)}&nbsp;{player.champion}
            </p>
          </div>

          {/* Points — dominant data point */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: 34, fontWeight: 900, color: textPrimary, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {player.points}
            </span>
            <span style={{ fontSize: 11, marginLeft: 2, color: textTertiary }}>
              /{MAX_SCORE}
            </span>
          </div>

          {/* Chevron */}
          <span
            style={{
              color: textTertiary,
              fontSize: 10,
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.25s ease',
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            ▼
          </span>
        </div>

        {/* Progress bar — thicker, gradient fill */}
        <div style={{ padding: '0 20px 16px' }}>
          <div className="progress-track" style={{ background: trackBg }}>
            <div className="progress-fill" style={{ width: `${pct}%`, background: gradientFill }} />
          </div>
        </div>
      </button>

      {/* Animated expand */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.28s ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              margin: '0 12px 12px',
              background: expandedBg,
              borderRadius: 14,
              padding: 16,
              borderTop: `1px solid ${dividerColor}`,
            }}
          >
            <ExpandedDetails bracket={bracket} winners={winners} dark={dark} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Match cards ─────────────────────────────────────────────────────────────

function CompletedMatchCard({ match }: { match: Match }) {
  const s = STAGE_STYLES[match.stage] ?? STAGE_STYLES.Final;
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="stage-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{formatDate(match.date)}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{flag(match.homeTeam)} {match.homeTeam}</span>
        <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          {match.homeScore} – {match.awayScore}
        </span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{match.awayTeam} {flag(match.awayTeam)}</span>
      </div>
      {match.venue && (
        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>📍 {match.venue}</p>
      )}
      {match.notes && (
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3, fontStyle: 'italic' }}>{match.notes}</p>
      )}
    </div>
  );
}

function UpcomingMatchCard({ match }: { match: Match }) {
  const s = STAGE_STYLES[match.stage] ?? STAGE_STYLES.Final;
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="stage-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          {formatDate(match.date)}{match.time ? ` · ${match.time}` : ''}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{flag(match.homeTeam)} {match.homeTeam}</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)' }}>vs</span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{match.awayTeam} {flag(match.awayTeam)}</span>
      </div>
      {match.venue && (
        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>📍 {match.venue}</p>
      )}
      {match.notes && (
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3, fontStyle: 'italic' }}>{match.notes}</p>
      )}
    </div>
  );
}

// ── Section label ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 10px 4px' }}>
      {children}
    </h2>
  );
}

// ── Root Dashboard ──────────────────────────────────────────────────────────

export default function Dashboard({
  realistic, fun, realisticBrackets, funBrackets, winners, matches,
}: DashboardProps) {
  const [tab, setTab] = useState<'realistic' | 'fun'>('realistic');

  const players  = tab === 'realistic' ? realistic : fun;
  const brackets = tab === 'realistic' ? realisticBrackets : funBrackets;
  const sorted   = [...players].sort((a, b) => b.points - a.points);

  const completed = [...matches]
    .filter(m => m.homeScore != null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const upcoming = [...matches]
    .filter(m => m.homeScore == null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div>
      {/* Tab bar */}
      <div className="tab-bar" style={{ marginBottom: 20 }}>
        <button className={`tab-pill ${tab === 'realistic' ? 'active' : ''}`} onClick={() => setTab('realistic')}>
          Realistic
        </button>
        <button className={`tab-pill ${tab === 'fun' ? 'active' : ''}`} onClick={() => setTab('fun')}>
          Fun
        </button>
      </div>

      {/* Scoring legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {[
          { label: 'R32', pts: '1pt' },
          { label: 'R16', pts: '2pt' },
          { label: 'QF',  pts: '4pt' },
          { label: 'SF',  pts: '8pt' },
          { label: 'Champion', pts: '+16pt' },
        ].map(({ label, pts }) => (
          <span
            key={label}
            style={{
              fontSize: 11,
              fontWeight: 500,
              padding: '3px 9px',
              borderRadius: 7,
              background: 'rgba(0,0,0,0.07)',
              color: 'var(--text-tertiary)',
            }}
          >
            {label} = {pts}
          </span>
        ))}
      </div>

      {/* Leaderboard */}
      <section style={{ marginBottom: 32 }}>
        <SectionLabel>Leaderboard</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.map((p, i) => (
            <PlayerCard
              key={p.name}
              rank={i + 1}
              player={p}
              bracket={brackets[p.name]}
              winners={winners}
            />
          ))}
        </div>
      </section>

      {/* Two-column results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
        <section>
          <SectionLabel>Recent Results</SectionLabel>
          {completed.length === 0 ? (
            <div className="card" style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
              No results yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {completed.map(m => <CompletedMatchCard key={m.id} match={m} />)}
            </div>
          )}
        </section>

        <section>
          <SectionLabel>Upcoming Games</SectionLabel>
          {upcoming.length === 0 ? (
            <div className="card" style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
              No upcoming games
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcoming.map(m => <UpcomingMatchCard key={m.id} match={m} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
