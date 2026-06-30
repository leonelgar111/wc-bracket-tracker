export type Stage = 'R32' | 'R16' | 'QF' | 'SF' | 'Final';

export interface PlayerBracket {
  name: string;
  R32: string[];
  R16: string[];
  QF: string[];
  SF: string[];
  Champion: string;
}

export interface Match {
  id: string;
  stage: Stage;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  venue: string;
  date: string;
  time?: string;
  notes?: string;
}

export interface Winners {
  R32: string[];
  R16: string[];
  QF: string[];
  SF: string[];
  Champion: string | null;
}

export interface ResultsData {
  winners: Winners;
  matches: Match[];
}

export interface PlayerScore {
  name: string;
  points: number;
  maxPoints: number;
  champion: string;
}
