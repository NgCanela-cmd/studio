
"use client"

import React from 'react';
import { GameState, Team } from '@/lib/game-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Trophy, Swords, Users, UserPlus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LaCanchaProps {
  state: GameState;
  onDeclareWinner: (side: 'A' | 'B') => void;
  onTriggerDraft: (count: number) => void;
  onUndo: () => void;
  canUndo: boolean;
}

export default function LaCancha({ state, onDeclareWinner, onTriggerDraft, onUndo, canUndo }: LaCanchaProps) {
  const { teamA, teamB, kingOnThrone, gameType } = state;

  const renderEmptySlot = (side: 'A' | 'B') => {
    const isInitialGame = !teamA && !teamB;
    const requiredPlayers = isInitialGame ? 10 : 5;

    return (
      <Card className="flex-1 border-dashed border-2 flex items-center justify-center bg-transparent min-h-[400px]">
        <div className="text-center p-8">
          <div className="relative inline-block mb-4">
            <Users className="h-16 w-16 text-muted-foreground opacity-20" />
            <UserPlus className="absolute -bottom-1 -right-1 h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold uppercase tracking-widest mb-1 opacity-50">
            {side === 'A' ? 'Equipo Principal' : 'Retador'}
          </h3>
          <p className="text-muted-foreground mb-6 text-sm max-w-[200px] mx-auto">
            {isInitialGame 
              ? "Cancha vacía. Inicia un draft de 10 jugadores." 
              : "Esperando un nuevo equipo para desafiar al ganador."}
          </p>
          <Button 
            onClick={() => onTriggerDraft(requiredPlayers)}
            className="px-8 gold-gradient font-black tracking-widest h-12 shadow-xl hover:scale-105 transition-transform"
          >
            REALIZAR DRAFT ({requiredPlayers})
          </Button>
        </div>
      </Card>
    );
  };

  const renderTeamCard = (team: Team, side: 'A' | 'B') => {
    const isKing = team.id === kingOnThrone?.id || (gameType === 'FINAL' && side === 'B');

    return (
      <Card className={cn(
        "flex-1 relative overflow-hidden transition-all duration-300 min-h-[400px]",
        isKing ? "border-primary border-2 throne-glow" : "border-border"
      )}>
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-3xl font-black italic tracking-tighter mb-1 uppercase text-primary leading-none">{team.name}</h3>
              <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm">
                <Trophy className="h-4 w-4" />
                <span>{team.wins} {team.wins === 1 ? 'Victoria' : 'Victorias'} consecutivas</span>
              </div>
            </div>
            {isKing && <Crown className="h-10 w-10 text-primary animate-bounce" />}
          </div>

          <div className="space-y-2 mb-8 flex-1">
            {team.players.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-white/5 text-lg group hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-primary/40 font-black text-xs w-4">{idx + 1}</span>
                  <span className="font-bold tracking-tight">{p.name}</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
              </div>
            ))}
          </div>

          <Button 
            className="w-full py-10 text-3xl font-black rounded-2xl gold-gradient shadow-2xl hover:scale-[1.03] active:scale-95 transition-all border-b-4 border-black/20"
            onClick={() => onDeclareWinner(side)}
          >
            VICTORIA
          </Button>
        </CardContent>
        {isKing && <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rotate-45 translate-x-12 -translate-y-12" />}
      </Card>
    );
  };

  return (
    <div className="p-6 flex flex-col h-full gap-6">
      <header className="flex items-center justify-between bg-card/50 p-4 rounded-2xl border border-border">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Swords className="text-background h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-primary leading-none">La Cancha</h1>
            <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Live Battle Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {canUndo && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onUndo}
              className="border-primary/50 text-primary hover:bg-primary/10 font-black italic tracking-tighter gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              DESHACER
            </Button>
          )}
          <div className="px-4 py-2 bg-accent/20 border border-accent/30 rounded-full flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-accent font-black tracking-tighter uppercase text-xs">
              {gameType}
            </span>
          </div>
        </div>
      </header>

      <div className={cn(
        "rounded-3xl p-8 transition-all duration-500 min-h-[160px] flex items-center justify-center overflow-hidden relative border-2",
        kingOnThrone ? "gold-gradient throne-glow border-primary/50" : "bg-card/30 border-dashed border-border"
      )}>
        {kingOnThrone ? (
          <>
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex items-center gap-4 mb-3">
                <Crown className="h-10 w-10 text-background" />
                <h2 className="text-4xl font-black text-background uppercase tracking-tighter italic">Rey del Trono</h2>
              </div>
              <p className="text-background font-black text-2xl uppercase tracking-widest">{kingOnThrone.name}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {kingOnThrone.players.map(p => (
                   <span key={p.id} className="px-3 py-1 bg-background/20 rounded-full text-background text-[10px] font-black uppercase border border-background/20">{p.name}</span>
                ))}
              </div>
            </div>
            <Crown className="absolute -right-8 -bottom-8 h-64 w-64 text-background/10 -rotate-12" />
          </>
        ) : (
          <div className="text-center">
            <Crown className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-2" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-50">Trono Disponible</p>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 items-stretch">
        {teamA ? renderTeamCard(teamA, 'A') : renderEmptySlot('A')}
        
        <div className="flex flex-row lg:flex-col items-center justify-center gap-4">
          <div className="h-px w-full lg:w-px lg:h-full bg-border" />
          <div className="h-16 w-16 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-inner relative z-10">
            <span className="font-black text-2xl italic tracking-tighter text-muted-foreground">VS</span>
          </div>
          <div className="h-px w-full lg:w-px lg:h-full bg-border" />
        </div>

        {teamB ? renderTeamCard(teamB, 'B') : renderEmptySlot('B')}
      </div>
    </div>
  );
}
