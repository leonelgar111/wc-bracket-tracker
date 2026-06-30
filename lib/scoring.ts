import type { PlayerBracket, Winners, PlayerScore } from './types';

const STAGE_POINTS = { R32: 1, R16: 2, QF: 4, SF: 8 } as const;
const STAGE_MAX_WINNERS = { R32: 16, R16: 8, QF: 4, SF: 2 } as const;
const CHAMPION_BONUS = 16;

export const MAX_SCORE = 80;

export function computeScore(bracket: PlayerBracket, winners: Winners): number {
  let total = 0;
  for (const stage of ['R32', 'R16', 'QF', 'SF'] as const) {
    const actual = new Set(winners[stage]);
    for (const team of bracket[stage]) {
      if (actual.has(team)) total += STAGE_POINTS[stage];
    }
  }
  if (winners.Champion && bracket.Champion === winners.Champion) {
    total += CHAMPION_BONUS;
  }
  return total;
}

export function computeMaxScore(bracket: PlayerBracket): number {
  let total = 0;
  for (const stage of ['R32', 'R16', 'QF', 'SF'] as const) {
    const maxCorrect = Math.min(bracket[stage].length, STAGE_MAX_WINNERS[stage]);
    total += maxCorrect * STAGE_POINTS[stage];
  }
  return total + CHAMPION_BONUS;
}

export function buildPlayerScores(
  brackets: Record<string, PlayerBracket>,
  winners: Winners,
): PlayerScore[] {
  return Object.values(brackets).map((b) => ({
    name: b.name,
    points: computeScore(b, winners),
    maxPoints: computeMaxScore(b),
    champion: b.Champion,
  }));
}
