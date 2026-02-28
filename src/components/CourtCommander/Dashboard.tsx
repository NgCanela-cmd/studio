"use client"

import React, { useState, useEffect } from 'react';
import LaCancha from './LaCancha';
import LaBanca from './LaBanca';
import { GameState, Player, Team, GameType, KING_THRESHOLD_WINS, KING_THRESHOLD_TOTAL_PLAYERS, TEAM_SIZE, ELIMINATOR_POOL_SIZE } from '@/lib/game-types';
import DraftModal from './DraftModal';
import { Crown } from 'lucide-react';

const INITIAL_STATE: GameState = {
  queue: [],
  teamA: null,
  teamB: null,
  kingOnThrone: null,
  gameType: 'NORMAL',
};

export default function Dashboard() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftPool, setDraftPool] = useState<Player[]>([]);

  const addPlayer = (name: string) => {
    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      registeredAt: Date.now(),
    };
    setState(prev => ({
      ...prev,
      queue: [...prev.queue, newPlayer],
    }));
  };

  const removePlayer = (id: string) => {
    setState(prev => ({
      ...prev,
      queue: prev.queue.filter(p => p.id !== id),
    }));
  };

  const triggerDraft = (count: number) => {
    if (state.queue.length < count) return;
    setDraftPool(state.queue.slice(0, count));
    setIsDrafting(true);
  };

  const finalizeDraft = (teamAPlayers: Player[], teamBPlayers: Player[], teamAName: string, teamBName: string) => {
    const newTeamA: Team = {
      id: Math.random().toString(36).substr(2, 9),
      name: teamAName,
      players: teamAPlayers,
      wins: 0,
    };
    const newTeamB: Team = {
      id: Math.random().toString(36).substr(2, 9),
      name: teamBName,
      players: teamBPlayers,
      wins: 0,
    };

    setState(prev => ({
      ...prev,
      teamA: newTeamA,
      teamB: newTeamB,
      queue: prev.queue.slice(draftPool.length),
    }));
    setIsDrafting(false);
  };

  const declareWinner = (winnerSide: 'A' | 'B') => {
    const winner = winnerSide === 'A' ? state.teamA : state.teamB;
    const loser = winnerSide === 'A' ? state.teamB : state.teamA;

    if (!winner || !loser) return;

    const updatedWinner = { ...winner, wins: winner.wins + 1 };
    const loserPlayersToQueue = loser.players;
    const totalPlayersInSystem = state.queue.length + 10 + (state.kingOnThrone ? 5 : 0);

    // LOGIC FOR NORMAL GAME
    if (state.gameType === 'NORMAL') {
      // Check for King transition
      if (updatedWinner.wins >= KING_THRESHOLD_WINS && totalPlayersInSystem >= KING_THRESHOLD_TOTAL_PLAYERS) {
        setState(prev => ({
          ...prev,
          kingOnThrone: updatedWinner,
          teamA: null,
          teamB: null,
          queue: [...prev.queue, ...loserPlayersToQueue],
          gameType: 'ELIMINATOR'
        }));
      } else {
        // Winner stays, loser to end of queue, draft 5 new for B
        setState(prev => ({
          ...prev,
          teamA: updatedWinner,
          teamB: null, // Ready for next draft
          queue: [...prev.queue, ...loserPlayersToQueue],
        }));
      }
    } 
    // LOGIC FOR ELIMINATOR
    else if (state.gameType === 'ELIMINATOR') {
      // Winner becomes Challenger, Loser to end of queue
      setState(prev => ({
        ...prev,
        teamA: updatedWinner,
        teamB: prev.kingOnThrone, // The King comes down to face the winner
        kingOnThrone: null,
        queue: [...prev.queue, ...loserPlayersToQueue],
        gameType: 'FINAL'
      }));
    }
    // LOGIC FOR FINAL
    else if (state.gameType === 'FINAL') {
      const isKingWinner = winner.id === state.kingOnThrone?.id || (winnerSide === 'B' && state.gameType === 'FINAL'); // Simple check: side B was king

      if (winnerSide === 'B') {
        // King Defended (Side B was the king descending)
        setState(prev => ({
          ...prev,
          teamA: updatedWinner,
          teamB: null,
          queue: [...prev.queue, ...loserPlayersToQueue],
          gameType: 'NORMAL'
        }));
      } else {
        // Golpe de Estado! Winner becomes King, gets 2 wins immediately
        const newKing = { ...updatedWinner, wins: 2 };
        setState(prev => ({
          ...prev,
          kingOnThrone: newKing,
          teamA: null,
          teamB: null,
          queue: [...prev.queue, ...loserPlayersToQueue],
          gameType: 'ELIMINATOR'
        }));
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background">
      {/* 60% Left Section: La Cancha */}
      <section className="w-full md:w-3/5 border-r border-border h-full flex flex-col overflow-y-auto custom-scrollbar">
        <LaCancha 
          state={state} 
          onDeclareWinner={declareWinner} 
          onTriggerDraft={triggerDraft}
        />
      </section>

      {/* 40% Right Section: La Banca */}
      <section className="w-full md:w-2/5 h-full flex flex-col overflow-hidden">
        <LaBanca 
          queue={state.queue} 
          onAddPlayer={addPlayer} 
          onRemovePlayer={removePlayer} 
          isDrafting={isDrafting}
          totalInSystem={state.queue.length + (state.teamA ? 5 : 0) + (state.teamB ? 5 : 0) + (state.kingOnThrone ? 5 : 0)}
        />
      </section>

      {isDrafting && (
        <DraftModal 
          pool={draftPool} 
          onCancel={() => setIsDrafting(false)} 
          onConfirm={finalizeDraft}
          gameType={state.gameType}
        />
      )}
    </div>
  );
}