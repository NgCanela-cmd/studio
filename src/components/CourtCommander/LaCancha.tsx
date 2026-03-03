"use client"

import React, { useState } from 'react';
import { GameState, Team, Player } from '@/lib/game-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Crown, Trophy, Swords, Users, UserPlus, RotateCcw, BarChart3, Pencil, Check, X, ArrowLeftRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LaCanchaProps {
  state: GameState;
  onDeclareWinner: (side: 'A' | 'B') => void;
  onTriggerDraft: (count: number) => void;
  onUndo: () => void;
  onOpenStats: () => void;
  onUpdatePlayer: (teamId: string, playerId: string, newName: string) => void;
  onSubstitutePlayer: (teamId: string, currentPlayerId: string, substituteId: string) => void;
  canUndo: boolean;
}

export default function LaCancha({ state, onDeclareWinner, onTriggerDraft, onUndo, onOpenStats, onUpdatePlayer, onSubstitutePlayer, canUndo }: LaCanchaProps) {
  const { teamA, teamB, kingOnThrone, gameType, queue } = state;
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEditing = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditValue(player.name);
  };

  const saveEditing = (teamId: string) => {
    if (editingPlayerId && editValue.trim()) {
      onUpdatePlayer(teamId, editingPlayerId, editValue.trim());
      setEditingPlayerId(null);
    }
  };

  const cancelEditing = () => {
    setEditingPlayerId(null);
  };

  const renderEmptySlot = (side: 'A' | 'B') => {
    const isInitialGame = !teamA && !teamB;
    const requiredPlayers = side === 'A' && isInitialGame ? 10 : 5;
    const shouldShowDraft = (side === 'A' && isInitialGame) || (side === 'B' && teamA && !teamB);

    if (!shouldShowDraft && !isInitialGame) return (
      <Card className="flex-1 border-dashed border-border/20 flex items-center justify-center bg-transparent min-h-[400px]">
         <p className="text-muted-foreground italic text-xs uppercase tracking-widest opacity-20">Esperando draft</p>
      </Card>
    );

    return (
      <Card className="flex-1 border-dashed border-2 flex items-center justify-center bg-transparent min-h-[400px]">
        <div className="text-center p-8">
          <div className="relative inline-block mb-4">
            <Users className="h-16 w-16 text-muted-foreground opacity-20" />
            <UserPlus className="absolute -bottom-1 -right-1 h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold uppercase tracking-widest mb-1 opacity-50">
            {isInitialGame ? 'NUEVO PARTIDO' : 'RETADOR'}
          </h3>
          <Button 
            onClick={() => onTriggerDraft(requiredPlayers)}
            className="px-8 gold-gradient font-black tracking-widest h-12 shadow-xl"
          >
            REALIZAR DRAFT ({requiredPlayers})
          </Button>
        </div>
      </Card>
    );
  };

  const renderPlayerRow = (p: Player, idx: number, teamId: string) => (
    <div key={p.id} className={cn(
      "group flex items-center justify-between p-3 rounded-xl border border-white/5 text-lg",
      p.isGuest ? "bg-yellow-500/10 border-yellow-500/20" : "bg-secondary/30"
    )}>
      <div className="flex items-center gap-3 flex-1 overflow-hidden">
        <span className="text-primary/40 font-black text-xs w-4 shrink-0">{idx + 1}</span>
        {editingPlayerId === p.id ? (
          <div className="flex items-center gap-2 flex-1">
            <Input 
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-8 bg-background border-primary text-sm font-bold"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEditing(teamId);
                if (e.key === 'Escape') cancelEditing();
              }}
            />
            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={() => saveEditing(teamId)}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-accent" onClick={cancelEditing}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col">
            <span className="font-bold tracking-tight truncate">{p.name}</span>
            {p.isGuest && <span className="text-[8px] font-black text-yellow-600 uppercase flex items-center gap-0.5"><Star className="h-2 w-2 fill-yellow-600" /> Invitado</span>}
          </div>
        )}
      </div>
      
      {editingPlayerId !== p.id && (
        <div className="flex items-center gap-1">
          {/* Sustitución Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-green-500 transition-opacity"
              >
                <ArrowLeftRight className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0 bg-card border-border shadow-2xl rounded-2xl overflow-hidden" align="end">
              <div className="p-3 border-b border-border bg-secondary/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sustituir por:</p>
              </div>
              <ScrollArea className="h-48">
                <div className="p-1">
                  {queue.length === 0 ? (
                    <p className="p-4 text-xs text-center text-muted-foreground italic">No hay jugadores en la banca</p>
                  ) : (
                    queue.map((benchPlayer) => (
                      <button
                        key={benchPlayer.id}
                        onClick={() => onSubstitutePlayer(teamId, p.id, benchPlayer.id)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"
                      >
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-bold text-sm truncate">{benchPlayer.name}</span>
                          {benchPlayer.isGuest && <span className="text-[8px] text-yellow-600 font-black">INVITADO</span>}
                        </div>
                        <ArrowLeftRight className="h-3 w-3 opacity-30" />
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity"
            onClick={() => startEditing(p)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );

  const renderTeamCard = (team: Team, side: 'A' | 'B') => {
    const isKing = team.id === kingOnThrone?.id || (gameType === 'FINAL' && side === 'B');

    return (
      <Card className={cn(
        "flex-1 relative overflow-hidden transition-all duration-300 min-h-[400px]",
        isKing ? "border-primary border-2 throne-glow" : "border-border"
      )}>
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h3 className="text-3xl font-black italic tracking-tighter mb-1 uppercase text-primary leading-none truncate">{team.name}</h3>
              <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm">
                <Trophy className="h-4 w-4 shrink-0" />
                <span>{team.wins} {team.wins === 1 ? 'Victoria' : 'Victorias'}</span>
              </div>
            </div>
            {isKing && <Crown className="h-10 w-10 text-primary shrink-0 animate-bounce" />}
          </div>

          <div className="space-y-2 mb-8 flex-1">
            {team.players.map((p, idx) => renderPlayerRow(p, idx, team.id))}
          </div>

          <Button 
            className="w-full py-10 text-3xl font-black rounded-2xl gold-gradient"
            onClick={() => onDeclareWinner(side)}
          >
            VICTORIA
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderThroneSection = () => {
    if (!kingOnThrone) {
      return (
        <div className="text-center">
          <Crown className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-2" />
          <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-50">Trono Disponible</p>
        </div>
      );
    }

    return (
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">
        <div className="flex items-center gap-4 mb-3">
          <Crown className="h-10 w-10 text-background shrink-0" />
          <h2 className="text-3xl md:text-4xl font-black text-background uppercase tracking-tighter italic text-center">Rey del Trono</h2>
        </div>
        <p className="text-background font-black text-2xl uppercase tracking-widest mb-4 italic text-center">{kingOnThrone.name}</p>
        
        <div className="flex flex-wrap justify-center gap-2 w-full">
          {kingOnThrone.players.map(p => (
            <div key={p.id} className={cn(
              "group relative flex items-center rounded-full px-4 py-1 border",
              p.isGuest ? "bg-yellow-500/20 border-yellow-500/40" : "bg-background/20 border-background/30 backdrop-blur-sm"
            )}>
              {editingPlayerId === p.id ? (
                <div className="flex items-center gap-1">
                  <Input 
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="h-6 w-24 bg-background text-[10px] font-black"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEditing(kingOnThrone.id);
                      if (e.key === 'Escape') cancelEditing();
                    }}
                  />
                  <Check className="h-3 w-3 text-background cursor-pointer" onClick={() => saveEditing(kingOnThrone.id)} />
                </div>
              ) : (
                <>
                  <span className="text-[11px] font-black text-background uppercase">{p.name} {p.isGuest && "⭐"}</span>
                  <div className="flex items-center gap-1 ml-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <ArrowLeftRight className="h-3 w-3 text-background/50 hover:text-background cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" />
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-0 bg-card border-border shadow-2xl rounded-2xl overflow-hidden" align="center">
                        <div className="p-3 border-b border-border bg-secondary/20">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-left">Sustituir por:</p>
                        </div>
                        <ScrollArea className="h-48">
                          <div className="p-1">
                            {queue.map((benchPlayer) => (
                              <button
                                key={benchPlayer.id}
                                onClick={() => onSubstitutePlayer(kingOnThrone.id, p.id, benchPlayer.id)}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"
                              >
                                <div className="flex flex-col">
                                  <span className="font-bold text-sm truncate">{benchPlayer.name}</span>
                                  {benchPlayer.isGuest && <span className="text-[8px] text-yellow-600 font-black">INVITADO</span>}
                                </div>
                                <ArrowLeftRight className="h-3 w-3 opacity-30" />
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                    <Pencil 
                      className="h-3 w-3 text-background/50 hover:text-background cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" 
                      onClick={() => startEditing(p)}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 flex flex-col h-full gap-6 max-w-7xl mx-auto w-full">
      <header className="flex flex-col sm:flex-row items-center justify-between bg-card/50 p-4 rounded-2xl border border-border gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shrink-0">
            <Swords className="text-background h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-primary leading-none">La Cancha</h1>
            <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              GESTIÓN DE BATALLAS EN VIVO
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onOpenStats}
            className="text-muted-foreground hover:text-primary font-black italic tracking-tighter gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            ESTADÍSTICAS
          </Button>
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
        "rounded-3xl p-6 md:p-8 transition-all duration-500 min-h-[160px] flex items-center justify-center overflow-hidden relative border-2",
        kingOnThrone ? "gold-gradient throne-glow border-primary/50" : "bg-card/30 border-dashed border-border"
      )}>
        {renderThroneSection()}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 items-stretch">
        {teamA ? renderTeamCard(teamA, 'A') : renderEmptySlot('A')}
        
        <div className="flex flex-row lg:flex-col items-center justify-center gap-4">
          <div className="h-px w-full lg:w-px lg:h-full bg-border" />
          <div className="h-16 w-16 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-inner relative z-10 shrink-0">
            <span className="font-black text-2xl italic tracking-tighter text-muted-foreground">VS</span>
          </div>
          <div className="h-px w-full lg:w-px lg:h-full bg-border" />
        </div>

        {teamB ? renderTeamCard(teamB, 'B') : renderEmptySlot('B')}
      </div>
    </div>
  );
}
