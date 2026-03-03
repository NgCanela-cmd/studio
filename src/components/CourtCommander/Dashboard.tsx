
"use client"

import React, { useState } from 'react';
import LaCancha from './LaCancha';
import LaBanca from './LaBanca';
import { GameState, Player, Team, Match, GameType, KING_THRESHOLD_WINS, KING_THRESHOLD_TOTAL_PLAYERS } from '@/lib/game-types';
import DraftModal from './DraftModal';
import StatsModal from './StatsModal';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Users, Menu } from 'lucide-react';

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
      description: "Se ha restaurado el estado anterior.",
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

  const updatePlayer = (id: string, newName: string) => {
    setState(prev => ({
      ...prev,
      queue: prev.queue.map(p => p.id === id ? { ...p, name: newName } : p),
    }));
  };

  const updateInGamePlayer = (teamId: string, playerId: string, newName: string) => {
    setState(prev => {
      const updateTeamPlayers = (team: Team | null) => {
        if (!team || team.id !== teamId) return team;
        return {
          ...team,
          players: team.players.map(p => p.id === playerId ? { ...p, name: newName } : p)
        };
      };

      return {
        ...prev,
        teamA: updateTeamPlayers(prev.teamA),
        teamB: updateTeamPlayers(prev.teamB),
        kingOnThrone: updateTeamPlayers(prev.kingOnThrone),
      };
    });
  };

  const substitutePlayer = (teamId: string, currentPlayerId: string, substituteId: string) => {
    saveToHistory(state);
    setState(prev => {
      const subIndex = prev.queue.findIndex(p => p.id === substituteId);
      if (subIndex === -1) return prev;

      const substitutePlayer = prev.queue[subIndex];
      let replacedPlayer: Player | null = null;

      const updateTeam = (team: Team | null) => {
        if (!team || team.id !== teamId) return team;
        const players = team.players.map(p => {
          if (p.id === currentPlayerId) {
            replacedPlayer = p;
            return substitutePlayer;
          }
          return p;
        });
        return { ...team, players };
      };

      const newTeamA = updateTeam(prev.teamA);
      const newTeamB = updateTeam(prev.teamB);
      const newKing = updateTeam(prev.kingOnThrone);

      if (!replacedPlayer) return prev;

      const newQueue = [...prev.queue];
      newQueue[subIndex] = replacedPlayer;

      return {
        ...prev,
        teamA: newTeamA,
        teamB: newTeamB,
        kingOnThrone: newKing,
        queue: newQueue
      };
    });

    toast({
      title: "Sustitución Exitosa",
      description: "Los jugadores han intercambiado posiciones y turnos.",
    });
  };

  const movePlayer = (id: string, direction: 'up' | 'down') => {
    setState(prev => {
      const index = prev.queue.findIndex(p => p.id === id);
      if (index === -1) return prev;
      
      const newQueue = [...prev.queue];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (targetIndex < 0 || targetIndex >= newQueue.length) return prev;
      
      [newQueue[index], newQueue[targetIndex]] = [newQueue[targetIndex], newQueue[index]];
      
      return { ...prev, queue: newQueue };
    });
  };

  const triggerDraft = (count: number) => {
    if (state.queue.length < count) {
      toast({
        variant: "destructive",
        title: "Jugadores insuficientes",
        description: `Necesitas ${count} jugadores en la banca. Faltan ${count - state.queue.length}.`,
      });
      return;
    }
    setDraftPool(state.queue.slice(0, count));
    setIsDrafting(true);
  };

  const finalizeDraft = (teamAPlayers: Player[], teamBPlayers: Player[], teamAName: string, teamBName: string) => {
    saveToHistory(state);
    setState(prev => {
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
    const currentTeamA = state.teamA;
    const currentTeamB = state.teamB;
    
    if (!currentTeamA || !currentTeamB) return;

    const winner = winnerSide === 'A' ? currentTeamA : currentTeamB;
    const loser = winnerSide === 'A' ? currentTeamB : currentTeamA;

    saveToHistory(state);
    
    const matchRecord: Match = {
      id: Math.random().toString(36).substr(2, 9),
      teamAName: currentTeamA.name,
      teamBName: currentTeamB.name,
      winnerName: winner.name,
      timestamp: Date.now(),
    };

    const updatedWinner = { ...winner, wins: winner.wins + 1 };
    const loserPlayersToQueue = loser.players;
    const totalPlayersInSystem = state.queue.length + 10 + (state.kingOnThrone ? 5 : 0);

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
        matches: [matchRecord, ...prev.matches],
        playerStats: newPlayerStats,
      };

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
            teamA: updatedWinner,
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
          nextState = {
            ...nextState,
            teamA: updatedWinner,
            teamB: null,
            queue: [...prev.queue, ...loserPlayersToQueue],
            gameType: 'NORMAL'
          };
        } else {
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
      description: `¡${winner.name} ha ganado!`,
    });
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" className="h-16 w-16 rounded-full gold-gradient shadow-2xl">
              <Users className="h-8 w-8 text-background" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-full sm:max-w-md bg-background border-l border-border">
            <LaBanca 
              queue={state.queue} 
              onAddPlayer={addPlayer} 
              onRemovePlayer={removePlayer} 
              onUpdatePlayer={updatePlayer}
              onMovePlayer={movePlayer}
              isDrafting={isDrafting}
              totalInSystem={state.queue.length + (state.teamA ? 5 : 0) + (state.teamB ? 5 : 0) + (state.kingOnThrone ? 5 : 0)}
            />
          </SheetContent>
        </Sheet>
      </div>

      <section className="flex-1 border-r border-border h-full flex flex-col overflow-y-auto custom-scrollbar">
        <LaCancha 
          state={state} 
          onDeclareWinner={declareWinner} 
          onTriggerDraft={triggerDraft}
          onUndo={undo}
          onOpenStats={() => setIsStatsOpen(true)}
          onUpdatePlayer={updateInGamePlayer}
          onSubstitutePlayer={substitutePlayer}
          canUndo={history.length > 0}
        />
      </section>

      <section className="hidden lg:flex w-1/3 xl:w-1/4 h-full flex-col overflow-hidden border-l border-border">
        <LaBanca 
          queue={state.queue} 
          onAddPlayer={addPlayer} 
          onRemovePlayer={removePlayer} 
          onUpdatePlayer={updatePlayer}
          onMovePlayer={movePlayer}
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
