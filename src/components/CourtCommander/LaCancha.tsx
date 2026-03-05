
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
  onUpdateTeamName: (teamId: string, newName: string) => void;
  onSubstitutePlayer: (teamId: string, currentPlayerId: string, substituteId: string) => void;
  canUndo: boolean;
}

export default function LaCancha({ state, onDeclareWinner, onTriggerDraft, onUndo, onOpenStats, onUpdatePlayer, onUpdateTeamName, onSubstitutePlayer, canUndo }: LaCanchaProps) {
  const { teamA, teamB, kingOnThrone, gameType, queue } = state;
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEditingPlayer = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditValue(player.name);
  };

  const startEditingTeam = (team: Team) => {
    setEditingTeamId(team.id);
    setEditValue(team.name);
  };

  const saveEditingPlayer = (teamId: string) => {
    if (editingPlayerId && editValue.trim()) {
      onUpdatePlayer(teamId, editingPlayerId, editValue.trim());
      setEditingPlayerId(null);
    }
  };

  const saveEditingTeam = () => {
    if (editingTeamId && editValue.trim()) {
      onUpdateTeamName(editingTeamId, editValue.trim());
      setEditingTeamId(null);
    }
  };

  const cancelEditing = () => {
    setEditingPlayerId(null);
    setEditingTeamId(null);
  };

  const renderEmptySlot = (side: 'A' | 'B') => {
    const isInitialGame = !teamA && !teamB;
    const requiredPlayers = side === 'A' && isInitialGame ? 10 : 5;
    const shouldShowDraft = (side === 'A' && isInitialGame) || (side === 'B' && teamA && !teamB);

    if (!shouldShowDraft && !isInitialGame) return (
      <Card className="flex-1 border-dashed border-border/20 flex items-center justify-center bg-transparent min-h-[300px]">
         <p className="text-muted-foreground italic text-xs uppercase tracking-widest opacity-20 text-center">Esperando retador</p>
      </Card>
    );

    return (
      <Card className="flex-1 border-dashed border-2 flex items-center justify-center bg-transparent min-h-[300px]">
        <div className="text-center p-6 md:p-8">
          <div className="relative inline-block mb-4">
            <Users className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground opacity-20" />
            <UserPlus className="absolute -bottom-1 -right-1 h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <h3 className="text-sm md:text-base font-bold uppercase tracking-widest mb-2 opacity-50">
            {isInitialGame ? 'NUEVO PARTIDO' : 'DRAFT RETADOR'}
          </h3>
          <Button onClick={() => onTriggerDraft(requiredPlayers)} className="px-5 md:px-6 gold-gradient font-black tracking-widest h-10 shadow-xl text-xs md:text-sm">
            REALIZAR DRAFT ({requiredPlayers})
          </Button>
        </div>
      </Card>
    );
  };

  const renderPlayerRow = (p: Player, idx: number, teamId: string) => (
    <div key={p.id} className={cn(
      "group flex items-center justify-between p-2 md:p-2.5 rounded-lg border border-white/5 text-sm md:text-base",
      p.isGuest ? "bg-yellow-500/10 border-yellow-500/20" : "bg-secondary/30"
    )}>
      <div className="flex items-center gap-2 md:gap-3 flex-1 overflow-hidden">
        <span className="text-primary/40 font-black text-[9px] md:text-xs w-4 shrink-0">{idx + 1}</span>
        {editingPlayerId === p.id ? (
          <div className="flex items-center gap-2 flex-1">
            <Input 
              value={editValue} 
              onChange={(e) => setEditValue(e.target.value)} 
              className="h-7 bg-background border-primary text-[10px] font-bold" 
              autoFocus 
              onKeyDown={(e) => { if (e.key === 'Enter') saveEditingPlayer(teamId); if (e.key === 'Escape') cancelEditing(); }}
            />
            <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500" onClick={() => saveEditingPlayer(teamId)}><Check className="h-3 w-3" /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-accent" onClick={cancelEditing}><X className="h-3 w-3" /></Button>
          </div>
        ) : (
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold tracking-tight truncate text-xs md:text-sm">{p.name}</span>
            {p.isGuest && <span className="text-[7px] font-black text-yellow-600 uppercase flex items-center gap-0.5"><Star className="h-2 w-2 fill-yellow-600" /> Invitado</span>}
          </div>
        )}
      </div>
      
      {editingPlayerId !== p.id && (
        <div className="flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 md:h-7 md:w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-green-500 transition-opacity"><ArrowLeftRight className="h-3 w-3" /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-0 bg-card border-border shadow-2xl rounded-xl overflow-hidden" align="end">
              <div className="p-2 border-b border-border bg-secondary/20"><p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Sustituir por:</p></div>
              <ScrollArea className="h-40">
                <div className="p-1">
                  {queue.length === 0 ? <p className="p-3 text-[10px] text-center text-muted-foreground italic">No hay jugadores</p> : queue.map((benchPlayer) => (
                    <button key={benchPlayer.id} onClick={() => onSubstitutePlayer(teamId, p.id, benchPlayer.id)} className="w-full text-left px-2 py-1.5 rounded-md hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between">
                      <div className="flex flex-col overflow-hidden"><span className="font-bold text-xs truncate">{benchPlayer.name}</span>{benchPlayer.isGuest && <span className="text-[7px] text-yellow-600 font-black">INVITADO</span>}</div>
                      <ArrowLeftRight className="h-2.5 w-2.5 opacity-30" />
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="icon" className="h-6 w-6 md:h-7 md:w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity" onClick={() => startEditingPlayer(p)}><Pencil className="h-3 w-3" /></Button>
        </div>
      )}
    </div>
  );

  const renderTeamCard = (team: Team, side: 'A' | 'B') => {
    const isKing = team.id === kingOnThrone?.id || (gameType === 'FINAL' && side === 'B');

    return (
      <Card className={cn("flex-1 relative overflow-hidden transition-all duration-300 min-h-[350px] flex flex-col", isKing ? "border-primary border-2 throne-glow" : "border-border")}>
        {/* CardContent Padding Reduced from p-4 to p-[11px] (16-5) */}
        <CardContent className="p-[11px] md:p-[19px] flex flex-col flex-1">
          <div className="flex justify-between items-start mb-3 md:mb-5 shrink-0">
            <div className="flex-1 overflow-hidden">
              {editingTeamId === team.id ? (
                <div className="flex items-center gap-2 mb-1">
                  <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-7 font-black uppercase italic text-xs" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') saveEditingTeam(); if (e.key === 'Escape') cancelEditing(); }} />
                  <Check className="h-3 w-3 text-primary cursor-pointer" onClick={saveEditingTeam} />
                </div>
              ) : (
                <div className="flex items-center gap-2 group/title">
                  <h3 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-primary leading-none truncate max-w-[180px]">{team.name}</h3>
                  <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/title:opacity-100 cursor-pointer" onClick={() => startEditingTeam(team)} />
                </div>
              )}
              <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-[10px] md:text-xs mt-1">
                <Trophy className="h-3 w-3 shrink-0" />
                <span>{team.wins} {team.wins === 1 ? 'Victoria' : 'Victorias'}</span>
              </div>
            </div>
            {isKing && <Crown className="h-6 w-6 md:h-8 md:w-8 text-primary shrink-0 animate-bounce" />}
          </div>

          <div className="flex-1 mb-3 md:mb-5 overflow-y-auto pr-1.5 custom-scrollbar min-h-[180px]">
            <div className="space-y-1.5">
              {team.players.map((p, idx) => renderPlayerRow(p, idx, team.id))}
            </div>
          </div>

          <Button className="w-full py-4 md:py-8 text-xl md:text-2xl font-black rounded-lg md:rounded-xl gold-gradient shrink-0" onClick={() => onDeclareWinner(side)}>VICTORIA</Button>
        </CardContent>
      </Card>
    );
  };

  const renderThroneSection = () => {
    if (!kingOnThrone) return (
      <div className="text-center py-4">
        <Crown className="mx-auto h-8 w-8 md:h-10 md:w-10 text-muted-foreground opacity-20 mb-1" />
        <p className="text-muted-foreground font-black uppercase tracking-widest text-[9px] md:text-[10px] opacity-50">Trono Disponible</p>
      </div>
    );

    return (
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl py-3">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="h-6 w-6 md:h-8 md:w-8 text-background shrink-0" />
          {editingTeamId === kingOnThrone.id ? (
            <div className="flex items-center gap-2">
              <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-7 md:h-8 text-lg md:text-xl font-black italic text-background bg-primary border-background" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') saveEditingTeam(); if (e.key === 'Escape') cancelEditing(); }} />
              <Check className="h-4 w-4 md:h-5 md:w-5 text-background cursor-pointer" onClick={saveEditingTeam} />
            </div>
          ) : (
            <div className="flex items-center gap-2 group/throne">
              <h2 className="text-xl md:text-3xl font-black text-background uppercase tracking-tighter italic text-center truncate max-w-[250px] md:max-w-none">REY: {kingOnThrone.name}</h2>
              <Pencil className="h-4 w-4 md:h-5 md:w-5 text-background/50 opacity-0 group-hover/throne:opacity-100 cursor-pointer" onClick={() => startEditingTeam(kingOnThrone)} />
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-1.5 w-full px-3">
          {kingOnThrone.players.map(p => (
            <div key={p.id} className={cn("group relative flex items-center rounded-full px-2.5 md:px-3 py-0.5 border", p.isGuest ? "bg-yellow-500/20 border-yellow-500/40" : "bg-background/20 border-background/30 backdrop-blur-sm")}>
              {editingPlayerId === p.id ? (
                <div className="flex items-center gap-1"><Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-4 md:h-5 w-16 md:w-20 bg-background text-[9px] font-black" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') saveEditingPlayer(kingOnThrone.id); if (e.key === 'Escape') cancelEditing(); }} /><Check className="h-2.5 w-2.5 text-background cursor-pointer" onClick={() => saveEditingPlayer(kingOnThrone.id)} /></div>
              ) : (
                <><span className="text-[9px] md:text-[10px] font-black text-background uppercase">{p.name} {p.isGuest && "⭐"}</span><div className="flex items-center gap-1 ml-1.5"><Popover><PopoverTrigger asChild><ArrowLeftRight className="h-2.5 w-2.5 text-background/50 hover:text-background cursor-pointer md:opacity-0 md:group-hover:opacity-100 transition-opacity" /></PopoverTrigger><PopoverContent className="w-52 p-0 bg-card border-border shadow-2xl rounded-xl overflow-hidden" align="center"><div className="p-2 border-b border-border bg-secondary/20"><p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground text-left">Sustituir por:</p></div><ScrollArea className="h-40"><div className="p-1">{queue.map((benchPlayer) => (<button key={benchPlayer.id} onClick={() => onSubstitutePlayer(kingOnThrone.id, p.id, benchPlayer.id)} className="w-full text-left px-2 py-1.5 rounded-md hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"><div className="flex flex-col"><span className="font-bold text-xs truncate">{benchPlayer.name}</span>{benchPlayer.isGuest && <span className="text-[7px] text-yellow-600 font-black">INVITADO</span>}</div><ArrowLeftRight className="h-2.5 w-2.5 opacity-30" /></button>))}</div></ScrollArea></PopoverContent></Popover><Pencil className="h-2.5 w-2.5 text-background/50 hover:text-background cursor-pointer md:opacity-0 md:group-hover:opacity-100 transition-opacity" onClick={() => startEditingPlayer(p)}/></div></>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    /* Padding Reduced from p-4 to p-[11px] (16-5) and md:p-6 to md:p-[19px] (24-5) */
    <div className="p-[11px] md:p-[19px] flex flex-col min-h-full gap-5 max-w-7xl mx-auto w-full">
      <header className="flex flex-col sm:flex-row items-center justify-between bg-card/50 p-[11px] rounded-xl border border-border gap-3 shrink-0">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="h-9 w-9 md:h-11 md:w-11 bg-primary rounded-lg flex items-center justify-center shadow-lg shrink-0"><Swords className="text-background h-5 w-5 md:h-6 md:w-6" /></div>
          <div><h1 className="text-lg md:text-xl font-black uppercase tracking-tighter text-primary leading-none">La Cancha</h1><p className="text-muted-foreground text-[7px] md:text-[9px] font-bold tracking-widest uppercase">GESTIÓN DE BATALLAS EN VIVO</p></div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <Button variant="ghost" size="sm" onClick={onOpenStats} className="text-muted-foreground hover:text-primary font-black italic tracking-tighter gap-1.5 text-[9px] md:text-xs"><BarChart3 className="h-3.5 w-3.5" />ESTADÍSTICAS</Button>
          {canUndo && <Button variant="outline" size="sm" onClick={onUndo} className="border-primary/50 text-primary hover:bg-primary/10 font-black italic tracking-tighter gap-1.5 text-[9px] md:text-xs h-8"><RotateCcw className="h-3.5 w-3.5" />DESHACER</Button>}
          <div className="px-2.5 md:px-3 py-1 bg-accent/20 border border-accent/30 rounded-full flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" /><span className="text-accent font-black tracking-tighter uppercase text-[9px] md:text-[10px]">{gameType}</span></div>
        </div>
      </header>

      {/* Throne Section - Height Reduced */}
      <div className={cn("rounded-2xl transition-all duration-500 min-h-[120px] md:min-h-[140px] flex items-center justify-center overflow-hidden relative border-2 shrink-0", kingOnThrone ? "gold-gradient throne-glow border-primary/50" : "bg-card/30 border-dashed border-border")}>
        {renderThroneSection()}
      </div>

      {/* Teams Container */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 items-stretch pb-8">
        {teamA ? renderTeamCard(teamA, 'A') : renderEmptySlot('A')}
        
        <div className="flex flex-row lg:flex-col items-center justify-center gap-3 shrink-0">
          <div className="h-px w-8 lg:w-px lg:h-8 bg-border" />
          <div className="h-10 w-10 md:h-14 md:w-14 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-inner z-10 shrink-0">
            <span className="font-black text-lg md:text-xl italic tracking-tighter text-muted-foreground">VS</span>
          </div>
          <div className="h-px w-8 lg:w-px lg:h-8 bg-border" />
        </div>

        {teamB ? renderTeamCard(teamB, 'B') : renderEmptySlot('B')}
      </div>
    </div>
  );
}

//