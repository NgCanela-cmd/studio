
"use client"

import React from 'react';
import { GameState, Team } from '@/lib/game-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Trophy, Swords, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LaCanchaProps {
  state: GameState;
  onDeclareWinner: (side: 'A' | 'B') => void;
  onTriggerDraft: (count: number) => void;
}

export default function LaCancha({ state, onDeclareWinner, onTriggerDraft }: LaCanchaProps) {
  const { teamA, teamB, kingOnThrone, gameType } = state;

  const renderTeamCard = (team: Team | null, side: 'A' | 'B') => {
    if (!team) {
      return (
        <Card className="flex-1 border-dashed border-2 flex items-center justify-center bg-transparent">
          <div className="text-center p-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4 font-medium">Esperando equipo...</p>
            <Button 
              variant="outline" 
              onClick={() => {
                // Si la cancha está vacía por completo, pedimos 10 para formar ambos.
                // Si ya hay un equipo A, solo pedimos 5 para el retador (B).
                const count = (!teamA && !teamB) ? 10 : 5;
                onTriggerDraft(count);
              }}
              className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
            >
              Realizar Draft
            </Button>
          </div>
        </Card>
      );
    }

    const isKing = team.id === kingOnThrone?.id || (gameType === 'FINAL' && side === 'B');

    return (
      <Card className={cn(
        "flex-1 relative overflow-hidden transition-all duration-300",
        isKing ? "border-primary border-2 throne-glow" : "border-border"
      )}>
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-3xl font-bold tracking-tight mb-1">{team.name}</h3>
              <div className="flex items-center gap-2 text-primary font-bold">
                <Trophy className="h-5 w-5" />
                <span>{team.wins} {team.wins === 1 ? 'Victoria' : 'Victorias'}</span>
              </div>
            </div>
            {isKing && <Crown className="h-10 w-10 text-primary animate-pulse" />}
          </div>

          <div className="space-y-2 mb-8 flex-1">
            {team.players.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-md bg-secondary/50 text-lg">
                <span className="text-primary/60 font-mono text-sm">{idx + 1}</span>
                <span className="font-medium">{p.name}</span>
              </div>
            ))}
          </div>

          <Button 
            className="w-full py-8 text-2xl font-black rounded-xl gold-gradient shadow-lg hover:scale-[1.02] transition-transform"
            onClick={() => onDeclareWinner(side)}
          >
            DECLARAR GANADOR
          </Button>
        </CardContent>
        {isKing && <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rotate-45 translate-x-12 -translate-y-12" />}
      </Card>
    );
  };

  return (
    <div className="p-6 flex flex-col h-full gap-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
            <Swords className="text-background" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-primary">La Cancha</h1>
            <p className="text-muted-foreground text-sm font-medium tracking-tight">
              SISTEMA DE GESTIÓN EN TIEMPO REAL
            </p>
          </div>
        </div>
        <div className="px-4 py-2 bg-accent/20 border border-accent/30 rounded-full">
          <span className="text-accent font-black tracking-tighter uppercase text-sm">
            Estado: {gameType}
          </span>
        </div>
      </header>

      <div className={cn(
        "rounded-2xl p-6 transition-all duration-500 min-h-[160px] flex items-center justify-center overflow-hidden relative",
        kingOnThrone ? "gold-gradient throne-glow" : "bg-card border-2 border-dashed border-border"
      )}>
        {kingOnThrone ? (
          <>
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="h-8 w-8 text-background" />
                <h2 className="text-3xl font-black text-background uppercase tracking-tight">El Rey en el Trono</h2>
              </div>
              <p className="text-background/80 font-bold text-xl">{kingOnThrone.name}</p>
              <div className="mt-4 flex gap-2">
                {kingOnThrone.players.map(p => (
                   <span key={p.id} className="px-2 py-1 bg-background/20 rounded text-background text-xs font-bold">{p.name}</span>
                ))}
              </div>
            </div>
            <Crown className="absolute -right-4 -bottom-4 h-48 w-48 text-background/10 -rotate-12" />
          </>
        ) : (
          <div className="text-center">
            <Crown className="mx-auto h-12 w-12 text-muted-foreground opacity-30 mb-2" />
            <p className="text-muted-foreground font-semibold uppercase tracking-widest">Trono Vacante</p>
          </div>
        )}
      </div>

      <div className="flex-1 flex gap-6">
        {renderTeamCard(teamA, 'A')}
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-border flex items-center justify-center">
            <span className="font-black text-2xl italic">VS</span>
          </div>
        </div>
        {renderTeamCard(teamB, 'B')}
      </div>
    </div>
  );
}
