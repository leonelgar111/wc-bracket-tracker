'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Match, ResultsData, Stage, Winners } from '@/lib/types';
import { flag } from '@/lib/flags';

const STAGES: Stage[] = ['R32', 'R16', 'QF', 'SF', 'Final'];

const STAGE_LABELS: Record<string, string> = {
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF: 'Quarterfinals',
  SF: 'Semifinals',
  Final: 'Final',
};

const STAGE_COLORS: Record<string, { bg: string; color: string }> = {
  R32:   { bg: '#e8f7ee', color: '#1a7f3c' },
  R16:   { bg: '#e8f2ff', color: '#005ec4' },
  QF:    { bg: '#fff3e0', color: '#b35900' },
  SF:    { bg: '#f3e8ff', color: '#7900cc' },
  Final: { bg: '#ffe8ea', color: '#cc001a' },
};

function normalizeCodes(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

function codesToString(codes: string[]): string {
  return codes.join(', ');
}

const blankMatch = (): Omit<Match, 'id'> => ({
  stage: 'R32',
  homeTeam: '',
  awayTeam: '',
  homeScore: null,
  awayScore: null,
  venue: '',
  date: new Date().toISOString().slice(0, 10),
  time: '',
  notes: '',
});

export default function AdminPage() {
  const [data, setData] = useState<ResultsData | null>(null);
  const [winnersInput, setWinnersInput] = useState<Record<string, string>>({
    R32: '', R16: '', QF: '', SF: '', Champion: '',
  });
  const [newMatch, setNewMatch] = useState<Omit<Match, 'id'>>(blankMatch());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    const res = await fetch('/api/results');
    const json = (await res.json()) as ResultsData;
    setData(json);
    setWinnersInput({
      R32: codesToString(json.winners.R32),
      R16: codesToString(json.winners.R16),
      QF: codesToString(json.winners.QF),
      SF: codesToString(json.winners.SF),
      Champion: json.winners.Champion ?? '',
    });
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function saveWinners() {
    if (!data) return;
    setSaving(true);
    const winners: Winners = {
      R32: normalizeCodes(winnersInput.R32),
      R16: normalizeCodes(winnersInput.R16),
      QF: normalizeCodes(winnersInput.QF),
      SF: normalizeCodes(winnersInput.SF),
      Champion: winnersInput.Champion.trim().toUpperCase() || null,
    };
    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winners, matches: data.matches }),
    });
    setSaving(false);
    if (res.ok) {
      showToast('Winners saved & published!');
      await loadData();
    } else {
      showToast('Save failed', false);
    }
  }

  async function addMatch() {
    if (!data) return;
    if (!newMatch.homeTeam || !newMatch.awayTeam) {
      showToast('Enter both teams', false);
      return;
    }
    const match: Match = {
      ...newMatch,
      id: crypto.randomUUID(),
      homeTeam: newMatch.homeTeam.toUpperCase(),
      awayTeam: newMatch.awayTeam.toUpperCase(),
    };
    const matches = [match, ...data.matches];
    setSaving(true);
    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winners: data.winners, matches }),
    });
    setSaving(false);
    if (res.ok) {
      showToast('Match added!');
      setNewMatch(blankMatch());
      await loadData();
    } else {
      showToast('Save failed', false);
    }
  }

  async function deleteMatch(id: string) {
    if (!data) return;
    const matches = data.matches.filter((m) => m.id !== id);
    await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winners: data.winners, matches }),
    });
    showToast('Match removed');
    await loadData();
  }

  if (!data) {
    return (
      <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <div className="max-w-lg mx-auto px-4 pt-20 text-center" style={{ color: 'var(--text-tertiary)' }}>
          Loading…
        </div>
      </main>
    );
  }

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
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
              ← Back
            </Link>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Admin
            </h1>
          </div>
          {toast && (
            <span
              className="text-sm font-medium px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: toast.ok ? '#e8f7ee' : '#ffe8ea',
                color: toast.ok ? '#1a7f3c' : '#cc001a',
              }}
            >
              {toast.msg}
            </span>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6 pb-16 flex flex-col gap-6">

        {/* ── Round Winners ── */}
        <section>
          <h2
            className="uppercase tracking-wider font-semibold mb-3"
            style={{ fontSize: 12, color: 'var(--text-secondary)' }}
          >
            Round Winners
          </h2>
          <div className="card divide-y" style={{ borderColor: 'var(--border)' }}>
            {(['R32','R16','QF','SF'] as const).map((stage) => (
              <div key={stage} className="px-4 py-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {STAGE_LABELS[stage]}
                  <span className="ml-1 font-normal" style={{ color: 'var(--text-tertiary)' }}>
                    (comma-separated 3-letter codes)
                  </span>
                </label>
                <input
                  type="text"
                  value={winnersInput[stage]}
                  onChange={(e) => setWinnersInput((p) => ({ ...p, [stage]: e.target.value }))}
                  placeholder={`e.g. FRA, BRA, MEX`}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(0,0,0,0.10)',
                  }}
                />
              </div>
            ))}
            <div className="px-4 py-3">
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                Champion
              </label>
              <input
                type="text"
                value={winnersInput.Champion}
                onChange={(e) => setWinnersInput((p) => ({ ...p, Champion: e.target.value }))}
                placeholder="e.g. FRA"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(0,0,0,0.10)',
                }}
              />
            </div>
          </div>

          <button
            onClick={saveWinners}
            disabled={saving}
            className="w-full mt-3 py-3 rounded-xl font-semibold text-sm text-white transition-opacity"
            style={{ background: 'var(--accent)', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Saving…' : 'Save & Publish Results'}
          </button>
        </section>

        {/* ── Add Match ── */}
        <section>
          <h2
            className="uppercase tracking-wider font-semibold mb-3"
            style={{ fontSize: 12, color: 'var(--text-secondary)' }}
          >
            Log a Match (leave scores blank for upcoming)
          </h2>
          <div className="card px-4 py-4 flex flex-col gap-3">
            {/* Stage */}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                Stage
              </label>
              <select
                value={newMatch.stage}
                onChange={(e) => setNewMatch((p) => ({ ...p, stage: e.target.value as Stage }))}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(0,0,0,0.10)',
                }}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                ))}
              </select>
            </div>

            {/* Teams + Score */}
            <div className="grid grid-cols-5 gap-2 items-end">
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Home
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={newMatch.homeTeam}
                  onChange={(e) => setNewMatch((p) => ({ ...p, homeTeam: e.target.value.toUpperCase() }))}
                  placeholder="USA"
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none uppercase"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(0,0,0,0.10)',
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-center" style={{ color: 'var(--text-secondary)' }}>H</label>
                  <input
                    type="number"
                    min={0}
                    value={newMatch.homeScore ?? ''}
                    onChange={(e) => setNewMatch((p) => ({ ...p, homeScore: e.target.value === '' ? null : parseInt(e.target.value) }))}
                    className="w-full rounded-lg px-2 py-2 text-sm text-center outline-none"
                    style={{
                      background: 'var(--bg)',
                      color: 'var(--text-primary)',
                      border: '1px solid rgba(0,0,0,0.10)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-center" style={{ color: 'var(--text-secondary)' }}>A</label>
                  <input
                    type="number"
                    min={0}
                    value={newMatch.awayScore ?? ''}
                    onChange={(e) => setNewMatch((p) => ({ ...p, awayScore: e.target.value === '' ? null : parseInt(e.target.value) }))}
                    className="w-full rounded-lg px-2 py-2 text-sm text-center outline-none"
                    style={{
                      background: 'var(--bg)',
                      color: 'var(--text-primary)',
                      border: '1px solid rgba(0,0,0,0.10)',
                    }}
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Away
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={newMatch.awayTeam}
                  onChange={(e) => setNewMatch((p) => ({ ...p, awayTeam: e.target.value.toUpperCase() }))}
                  placeholder="MEX"
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none uppercase"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(0,0,0,0.10)',
                  }}
                />
              </div>
            </div>

            {/* Venue */}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                Venue
              </label>
              <input
                type="text"
                value={newMatch.venue}
                onChange={(e) => setNewMatch((p) => ({ ...p, venue: e.target.value }))}
                placeholder="MetLife Stadium, New Jersey"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(0,0,0,0.10)',
                }}
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                Date
              </label>
              <input
                type="date"
                value={newMatch.date}
                onChange={(e) => setNewMatch((p) => ({ ...p, date: e.target.value }))}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(0,0,0,0.10)',
                }}
              />
            </div>

            {/* Kickoff time */}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                Kickoff time <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional, e.g. 3:00 PM ET)</span>
              </label>
              <input
                type="text"
                value={newMatch.time ?? ''}
                onChange={(e) => setNewMatch((p) => ({ ...p, time: e.target.value }))}
                placeholder="3:00 PM ET"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(0,0,0,0.10)',
                }}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                Notes <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="text"
                value={newMatch.notes ?? ''}
                onChange={(e) => setNewMatch((p) => ({ ...p, notes: e.target.value }))}
                placeholder="e.g. won on penalties"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(0,0,0,0.10)',
                }}
              />
            </div>

            <button
              onClick={addMatch}
              disabled={saving}
              className="w-full py-2.5 rounded-xl font-semibold text-sm transition-opacity"
              style={{
                background: 'transparent',
                color: 'var(--accent)',
                border: '1.5px solid rgba(0,0,0,0.2)',
                opacity: saving ? 0.6 : 1,
              }}
            >
              Add Match
            </button>
          </div>
        </section>

        {/* ── Match Log ── */}
        {data.matches.length > 0 && (
          <section>
            <h2
              className="uppercase tracking-wider font-semibold mb-3"
              style={{ fontSize: 12, color: 'var(--text-secondary)' }}
            >
              Match Log
            </h2>
            <div className="flex flex-col gap-2">
              {[...data.matches]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((m) => {
                  const sc = STAGE_COLORS[m.stage] ?? STAGE_COLORS.Final;
                  return (
                    <div key={m.id} className="card px-4 py-3 flex items-center gap-3">
                      <span
                        className="stage-badge shrink-0"
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {m.stage}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {flag(m.homeTeam)} {m.homeTeam} {m.homeScore ?? '–'} – {m.awayScore ?? '–'} {m.awayTeam} {flag(m.awayTeam)}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                          {m.date}{m.venue ? ` · ${m.venue}` : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteMatch(m.id)}
                        className="shrink-0 text-xs px-2 py-1 rounded-lg"
                        style={{ color: '#cc001a', background: '#ffe8ea' }}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
