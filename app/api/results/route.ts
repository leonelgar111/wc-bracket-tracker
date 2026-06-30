import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { ResultsData } from '@/lib/types';

const DATA_PATH = path.join(process.cwd(), 'data', 'results.json');

const DEFAULT_DATA: ResultsData = {
  winners: { R32: [], R16: [], QF: [], SF: [], Champion: null },
  matches: [],
};

function readData(): ResultsData {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8')) as ResultsData;
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

function writeData(data: ResultsData): void {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  return NextResponse.json(readData());
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<ResultsData>;
  const current = readData();
  const updated: ResultsData = {
    winners: body.winners ?? current.winners,
    matches: body.matches ?? current.matches,
  };
  writeData(updated);
  return NextResponse.json({ success: true });
}
