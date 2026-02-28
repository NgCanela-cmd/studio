export type Player = {
  id: string;
  name: string;
  registeredAt: number;
};

export type Team = {
  id: string;
  name: string;
  players: Player[];
  wins: number;
};

export type GameType = 'NORMAL' | 'ELIMINATOR' | 'FINAL';

export type GameState = {
  queue: Player[];
  teamA: Team | null;
  teamB: Team | null;
  kingOnThrone: Team | null;
  gameType: GameType;
};

export const KING_THRESHOLD_WINS = 2;
export const KING_THRESHOLD_TOTAL_PLAYERS = 20;
export const TEAM_SIZE = 5;
export const ELIMINATOR_POOL_SIZE = 10;