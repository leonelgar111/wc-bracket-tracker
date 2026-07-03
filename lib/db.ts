import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import type { ResultsData } from './types';

const DEFAULT_DATA: ResultsData = {
  winners: { R32: [], R16: [], QF: [], SF: [], Champion: null },
  matches: [],
};

// Reuse pool across requests in the long-running Node.js server process
const g = global as typeof globalThis & { _pgPool?: Pool };
if (!g._pgPool) {
  g._pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Render Postgres requires SSL; skip cert verification for managed DBs
    ...(process.env.DATABASE_URL ? { ssl: { rejectUnauthorized: false } } : {}),
  });
}
const pool = g._pgPool;

// Init runs once per process — creates table and seeds from results.json if empty
let _init: Promise<void> | null = null;

function ensureInit(): Promise<void> {
  if (!_init) _init = doInit();
  return _init;
}

async function doInit(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS results (
      id   INTEGER PRIMARY KEY,
      data JSONB   NOT NULL
    )
  `);

  // Seed from the committed results.json on first ever run
  const jsonPath = path.join(process.cwd(), 'data', 'results.json');
  let seed: ResultsData = DEFAULT_DATA;
  try {
    seed = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as ResultsData;
  } catch { /* fall back to empty default */ }

  await pool.query(
    `INSERT INTO results (id, data) VALUES (1, $1) ON CONFLICT (id) DO NOTHING`,
    [JSON.stringify(seed)]
  );
}

export async function readResults(): Promise<ResultsData> {
  try {
    await ensureInit();
    const { rows } = await pool.query<{ data: ResultsData }>(
      'SELECT data FROM results WHERE id = 1'
    );
    return rows[0]?.data ?? structuredClone(DEFAULT_DATA);
  } catch (err) {
    console.error('[db] readResults failed:', err);
    return structuredClone(DEFAULT_DATA);
  }
}

export async function writeResults(data: ResultsData): Promise<void> {
  await ensureInit();
  await pool.query(
    `INSERT INTO results (id, data) VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
    [JSON.stringify(data)]
  );
}
