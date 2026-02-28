
"use client"

import React, { useState } from 'react';
import LaCancha from './LaCancha';
import LaBanca from './LaBanca';
import { GameState, Player, Team, Match, PlayerStat, KING_THRESHOLD_WINS, KING_THRESHOLD_TOTAL_PLAYERS } from '@/lib/game-types';
import DraftModal from './DraftModal';
import StatsModal from './StatsModal';
import { useToast } from '@/hooks/use-toast';

const INITIAL_STATE: GameState = {
  queue: [],
  teamA: null,
  teamB: null,
  kingOnThrone: null,
  gameType: 'NORMAL',
  matches: [],
  playerStats: {},
};

export default function Dashboard() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [history, setHistory] = useState<GameState[]>([]);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [draftPool, setDraftPool] = useState<Player[]>([]);
  const { toast } = useToast();

  const saveToHistory = (currentState: GameState) => {
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(currentState))].slice(-10));
  };

  const undo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setState(previousState);
    setHistory(prev => prev.slice(0, -1));
    toast({
      title: "Acción revertida",
      description: "Se ha restaurado el estado anterior de la partida.",
    });
  };

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
    if (state.queue.length < count) {
      toast({
        variant: "destructive",
        title: "Jugadores insuficientes",
        description: `Se necesitan al menos ${count} jugadores en la banca. Faltan ${count - state.queue.length}.`,
      });
      return;
    }
    setDraftPool(state.queue.slice(0, count));
    setIsDrafting(true);
  };

  const finalizeDraft = (teamAPlayers: Player[], teamBPlayers: Player[], teamAName: string, teamBName: string) => {
    saveToHistory(state);
    setState(prev => {
      // Si el equipo A ya existía (ganador previo), mantenemos sus victorias pero actualizamos el nombre si cambió
      const existingTeamA = prev.teamA;
      const finalTeamA: Team = existingTeamA ? { 
        ...existingTeamA, 
        name: teamAName,
        players: teamAPlayers 
      } : {
        id: Math.random().toString(36).substr(2, 9),
        name: teamAName,
        players: teamAPlayers,
        wins: 0,
      };

      const finalTeamB: Team = {
        id: Math.random().toString(36).substr(2, 9),
        name: teamBName,
        players: teamBPlayers,
        wins: 0,
      };

      return {
        ...prev,
        teamA: finalTeamA,
        teamB: finalTeamB,
        queue: prev.queue.slice(draftPool.length),
      };
    });
    setIsDrafting(false);
    setDraftPool([]);
  };

  const declareWinner = (winnerSide: 'A' | 'B') => {
    const winner = winnerSide === 'A' ? state.teamA : state.teamB;
    const loser = winnerSide === 'A' ? state.teamB : state.teamA;

    if (!winner || !loser) return;

    saveToHistory(state);
    
    const updatedWinner = { ...winner, wins: winner.wins + 1 };
    const loserPlayersToQueue = loser.players;
    const totalPlayersInSystem = state.queue.length + 10 + (state.kingOnThrone ? 5 : 0);

    // Guardar el nombre original para las estadísticas antes de cualquier cambio de slot
    const newMatch: Match = {
      id: Math.random().toString(36).substr(2, 9),
      teamAName: state.teamA!.name,
      teamBName: state.teamB!.name,
      winnerName: winner.name,
      timestamp: Date.now(),
    };

    const newPlayerStats = { ...state.playerStats };
    winner.players.forEach(player => {
      if (!newPlayerStats[player.id]) {
        newPlayerStats[player.id] = { id: player.id, name: player.name, wins: 0 };
      }
      newPlayerStats[player.id].wins += 1;
    });

    setState(prev => {
      let nextState = {
        ...prev,
        matches: [newMatch, ...prev.matches],
        playerStats: newPlayerStats,
      };

      // Si el ganador es B, ahora pasa a ser el equipo A para el siguiente partido
      // Independientemente de si es NORMAL, ELIMINATOR o FINAL, el ganador siempre queda en Team A
      if (prev.gameType === 'NORMAL') {
        if (updatedWinner.wins >= KING_THRESHOLD_WINS && totalPlayersInSystem >= KING_THRESHOLD_TOTAL_PLAYERS) {
          nextState = {
            ...nextState,
            kingOnThrone: updatedWinner,
            teamA: null,
            teamB: null,
            queue: [...prev.queue, ...loserPlayersToQueue],
            gameType: 'ELIMINATOR'
          };
        } else {
          nextState = {
            ...nextState,
            teamA: updatedWinner, // El ganador (sea A o B) se queda en el slot A
            teamB: null, 
            queue: [...prev.queue, ...loserPlayersToQueue],
          };
        }
      } 
      else if (prev.gameType === 'ELIMINATOR') {
        nextState = {
          ...nextState,
          teamA: updatedWinner,
          teamB: prev.kingOnThrone, 
          kingOnThrone: null,
          queue: [...prev.queue, ...loserPlayersToQueue],
          gameType: 'FINAL'
        };
      }
      else if (prev.gameType === 'FINAL') {
        if (winnerSide === 'B') {
          // Si el retador B gana la final, se convierte en el nuevo equipo A normal
          nextState = {
            ...nextState,
            teamA: updatedWinner,
            teamB: null,
            queue: [...prev.queue, ...loserPlayersToQueue],
            gameType: 'NORMAL'
          };
        } else {
          // Si el Rey gana la final, vuelve al trono con 2 victorias (ya sumó una)
          const newKing = { ...updatedWinner };
          nextState = {
            ...nextState,
            kingOnThrone: newKing,
            teamA: null,
            teamB: null,
            queue: [...prev.queue, ...loserPlayersToQueue],
            gameType: 'ELIMINATOR'
          };
        }
      }
      return nextState;
    });

    toast({
      title: "Victoria Registrada",
      description: `¡${winner.name} ha ganado el encuentro!`,
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background">
      <section className="w-full md:w-3/5 border-r border-border h-full flex flex-col overflow-y-auto custom-scrollbar">
        <LaCancha 
          state={state} 
          onDeclareWinner={declareWinner} 
          onTriggerDraft={triggerDraft}
          onUndo={undo}
          onOpenStats={() => setIsStatsOpen(true)}
          canUndo={history.length > 0}
        />
      </section>

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
          existingTeamA={state.teamA}
        />
      )}

      {isStatsOpen && (
        <StatsModal 
          matches={state.matches} 
          playerStats={Object.values(state.playerStats)} 
          onClose={() => setIsStatsOpen(false)} 
        />
      )}
    </div>
  );
}
