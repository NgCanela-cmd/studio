
"use client"

import React, { useState } from 'react';
import LaCancha from './LaCancha';
import LaBanca from './LaBanca';
import { GameState, Player, Team, Match, KING_THRESHOLD_WINS, KING_THRESHOLD_TOTAL_PLAYERS, MAX_GUESTS_ON_COURT } from '@/lib/game-types';
import DraftModal from './DraftModal';
import StatsModal from './StatsModal';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

const INITIAL_STATE: GameState = {
  queue: [],
  teamA: null,
  teamB: null,
  kingOnThrone: null,
  gameType: 'NORMAL',
  matches: [],
  playerStats: {},
  nextTicketNumber: 1,
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

  const addPlayer = (name: string, isGuest: boolean = false) => {
    setState(prev => ({
      ...prev,
      queue: [...prev.queue, {
        id: Math.random().toString(36).substr(2, 9),
        name,
        registeredAt: Date.now(),
        ticketNumber: prev.nextTicketNumber,
        isGuest,
      }],
      nextTicketNumber: prev.nextTicketNumber + 1,
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

  const updateTeamName = (teamId: string, newName: string) => {
    setState(prev => {
      if (prev.teamA?.id === teamId) return { ...prev, teamA: { ...prev.teamA, name: newName } };
      if (prev.teamB?.id === teamId) return { ...prev, teamB: { ...prev.teamB, name: newName } };
      if (prev.kingOnThrone?.id === teamId) return { ...prev, kingOnThrone: { ...prev.kingOnThrone, name: newName } };
      return prev;
    });
  };

  const countGuests = (team: Team | null) => {
    if (!team) return 0;
    return team.players.filter(p => p.isGuest).length;
  };

  const substitutePlayer = (teamId: string, currentPlayerId: string, substituteId: string) => {
    const substitutePlayer = state.queue.find(p => p.id === substituteId);
    if (!substitutePlayer) return;

    if (substitutePlayer.isGuest) {
      const currentPlayer = [...(state.teamA?.players || []), ...(state.teamB?.players || []), ...(state.kingOnThrone?.players || [])].find(p => p.id === currentPlayerId);
      if (currentPlayer && !currentPlayer.isGuest) {
        const totalGuestsOnCourt = countGuests(state.teamA) + countGuests(state.teamB) + countGuests(state.kingOnThrone);
        if (totalGuestsOnCourt >= MAX_GUESTS_ON_COURT) {
          toast({
            variant: "destructive",
            title: "Límite de Invitados",
            description: "No se pueden añadir más invitados. El límite es 2 en cancha.",
          });
          return;
        }
      }
    }

    saveToHistory(state);
    setState(prev => {
      const subIndex = prev.queue.findIndex(p => p.id === substituteId);
      const subPlayer = prev.queue[subIndex];
      let replacedPlayer: Player | null = null;

      const updateTeam = (team: Team | null) => {
        if (!team || team.id !== teamId) return team;
        const players = team.players.map(p => {
          if (p.id === currentPlayerId) {
            replacedPlayer = p;
            return subPlayer;
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
    let maxGuestsAllowed = 0;
    const isFirstMatch = !state.teamA && !state.teamB;

    if (isFirstMatch) {
      const totalMembersInQueue = state.queue.filter(p => !p.isGuest).length;
      maxGuestsAllowed = totalMembersInQueue > 12 ? 0 : 2;
    } else {
      const guestsInA = countGuests(state.teamA);
      const guestsInKing = countGuests(state.kingOnThrone);
      maxGuestsAllowed = MAX_GUESTS_ON_COURT - (guestsInA + guestsInKing);
    }

    const pool: Player[] = [];
    let currentGuestCount = 0;

    for (const player of state.queue) {
      if (pool.length < count) {
        if (!player.isGuest) {
          pool.push(player);
        } else if (currentGuestCount < maxGuestsAllowed) {
          pool.push(player);
          currentGuestCount++;
        }
      }
    }

    if (pool.length < count) {
      toast({
        variant: "destructive",
        title: "Draft no disponible",
        description: `No hay suficientes jugadores válidos siguiendo la regla de invitados (Faltan ${count - pool.length}).`,
      });
      return;
    }

    setDraftPool(pool);
    setIsDrafting(true);
  };

  const finalizeDraft = (teamAPlayers: Player[], teamBPlayers: Player[], teamAName: string, teamBName: string) => {
    saveToHistory(state);
    setState(prev => {
      const finalTeamA: Team = prev.teamA ? { ...prev.teamA, name: teamAName, players: teamAPlayers } : {
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

      const poolIds = new Set(draftPool.map(p => p.id));
      const remainingQueue = prev.queue.filter(p => !poolIds.has(p.id));

      return {
        ...prev,
        teamA: finalTeamA,
        teamB: finalTeamB,
        queue: remainingQueue,
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
    const losersSortedByTicket = [...loser.players].sort((a, b) => a.ticketNumber - b.ticketNumber);

    const totalPlayersInSystem = state.queue.length + 10 + (state.kingOnThrone ? 5 : 0);
    const newPlayerStats = { ...state.playerStats };
    winner.players.forEach(player => {
      if (!newPlayerStats[player.id]) newPlayerStats[player.id] = { id: player.id, name: player.name, wins: 0 };
      newPlayerStats[player.id].wins += 1;
    });

    setState(prev => {
      let nextState = { ...prev, matches: [matchRecord, ...prev.matches], playerStats: newPlayerStats };
      const updatedQueue = [...prev.queue, ...losersSortedByTicket];

      if (prev.gameType === 'NORMAL') {
        if (updatedWinner.wins >= KING_THRESHOLD_WINS && totalPlayersInSystem >= KING_THRESHOLD_TOTAL_PLAYERS) {
          nextState = { ...nextState, kingOnThrone: updatedWinner, teamA: null, teamB: null, queue: updatedQueue, gameType: 'ELIMINATOR' };
        } else {
          nextState = { ...nextState, teamA: updatedWinner, teamB: null, queue: updatedQueue };
        }
      } else if (prev.gameType === 'ELIMINATOR') {
        nextState = { ...nextState, teamA: updatedWinner, teamB: prev.kingOnThrone, kingOnThrone: null, queue: updatedQueue, gameType: 'FINAL' };
      } else if (prev.gameType === 'FINAL') {
        if (winnerSide === 'B') {
          nextState = { ...nextState, teamA: updatedWinner, teamB: null, queue: updatedQueue, gameType: 'NORMAL' };
        } else {
          nextState = { ...nextState, kingOnThrone: updatedWinner, teamA: null, teamB: null, queue: updatedQueue, gameType: 'ELIMINATOR' };
        }
      }
      return nextState;
    });

    toast({ title: "Victoria Registrada", description: `¡${winner.name} ha ganado!` });
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
            <SheetHeader className="sr-only">
              <SheetTitle>La Banca</SheetTitle>
              <SheetDescription>Gestión de la cola de espera de jugadores</SheetDescription>
            </SheetHeader>
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

      {/* Main Content Area with Scroll - Reduced Padding by 5px (Implicit via flex-1) */}
      <section className="flex-1 border-r border-border h-full flex flex-col overflow-y-auto custom-scrollbar bg-background/50">
        <LaCancha 
          state={state} 
          onDeclareWinner={declareWinner} 
          onTriggerDraft={triggerDraft}
          onUndo={undo}
          onOpenStats={() => setIsStatsOpen(true)}
          onUpdatePlayer={updateInGamePlayer}
          onUpdateTeamName={updateTeamName}
          onSubstitutePlayer={substitutePlayer}
          canUndo={history.length > 0}
        />
      </section>

      {/* Sidebar for Desktop */}
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
