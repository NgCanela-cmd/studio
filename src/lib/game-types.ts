export type Player = {
  id: string;
  name: string;
  registeredAt: number;
  ticketNumber: number;
  isGuest: boolean;
};

export type Team = {
  id: string;
  name: string;
  players: Player[];
  wins: number;
};

export type GameType = 'NORMAL' | 'ELIMINATOR' | 'FINAL';

export type Match = {
  id: string;
  teamAName: string;
  teamBName: string;
  winnerName: string;
  timestamp: number;
};

export type PlayerStat = {
  id: string;
  name: string;
  wins: number;
};

export type GameState = {
  queue: Player[];
  teamA: Team | null;
  teamB: Team | null;
  kingOnThrone: Team | null;
  gameType: GameType;
  matches: Match[];
  playerStats: Record<string, PlayerStat>;
  nextTicketNumber: number;
};

export const KING_THRESHOLD_WINS = 2;
export const KING_THRESHOLD_TOTAL_PLAYERS = 20;
export const TEAM_SIZE = 5;
export const ELIMINATOR_POOL_SIZE = 10;
export const MAX_GUESTS_ON_COURT = 2;
