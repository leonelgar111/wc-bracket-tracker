import { NextResponse } from 'next/server';
import type { ResultsData } from '@/lib/types';
import { readResults, writeResults } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await readResults();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<ResultsData>;
  const current = await readResults();
  const updated: ResultsData = {
    winners: body.winners ?? current.winners,
    matches: body.matches ?? current.matches,
  };
  await writeResults(updated);
  return NextResponse.json({ success: true });
}
