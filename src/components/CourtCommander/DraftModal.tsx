"use client"

import React, { useState } from 'react';
import { Player, Team, GameType } from '@/lib/game-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateAiTeamName } from '@/ai/flows/ai-team-name-generator';
import { Sparkles, Loader2, Lock, Users, TrendingUp, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraftModalProps {
  pool: Player[];
  gameType: GameType;
  existingTeamA?: Team | null;
  onCancel: () => void;
  onConfirm: (teamAPlayers: Player[], teamBPlayers: Player[], teamAName: string, teamBName: string) => void;
}

export default function DraftModal({ pool, gameType, existingTeamA, onCancel, onConfirm }: DraftModalProps) {
  const isTeamALocked = !!existingTeamA;
  const isNewlyPromoted = existingTeamA?.wins === 1;
  
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>(existingTeamA?.players || []);
  const [teamAName, setTeamAName] = useState(existingTeamA?.name || '');
  const [teamBName, setTeamBName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const teamBPlayers = isTeamALocked 
    ? pool 
    : pool.filter(p => !teamAPlayers.find(tp => tp.id === p.id));

  const togglePlayer = (player: Player) => {
    if (isTeamALocked) return;
    if (teamAPlayers.find(p => p.id === player.id)) {
      setTeamAPlayers(prev => prev.filter(p => p.id !== player.id));
    } else if (teamAPlayers.length < 5) {
      setTeamAPlayers(prev => [...prev, player]);
    }
  };

  const handleAiWand = async (target: 'A' | 'B') => {
    setIsGenerating(true);
    try {
      const players = target === 'A' ? teamAPlayers : teamBPlayers;
      const theme = target === 'A' ? "Reyes dominantes, campeones" : "Retadores, hambrientos";
      const result = await generateAiTeamName({ 
        playerNames: players.map(p => p.name),
        theme 
      });
      if (target === 'A') setTeamAName(result.suggestedNames[0]);
      else setTeamBName(result.suggestedNames[0]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const canConfirm = teamAPlayers.length === 5 && teamBPlayers.length === 5 && teamAName && teamBName;

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-5xl bg-background border-border p-0 overflow-hidden rounded-3xl max-h-[92vh] flex flex-col">
        <DialogHeader className="p-8 border-b border-border bg-card/80 backdrop-blur-md shrink-0">
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="text-primary h-8 w-8" />
              {isTeamALocked ? "NUEVO DESAFÍO" : "INICIO DE JORNADA"}
            </div>
            <div className="flex gap-2">
              {isNewlyPromoted && (
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30 px-4">PROMOCIÓN ALFA</Badge>
              )}
              <Badge variant="outline" className="px-4 py-1">{gameType}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="w-full md:w-1/2 p-8 border-r border-border bg-card/20 flex flex-col overflow-hidden">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6 shrink-0">
              {isTeamALocked ? "RETADORES SELECCIONADOS" : "DRAFT DE JUGADORES"}
            </h3>
            <ScrollArea className="flex-1">
              <div className="grid grid-cols-1 gap-3 pr-4">
                {pool.map((p) => {
                  const isSelectedForA = teamAPlayers.find(tp => tp.id === p.id);
                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all",
                        isSelectedForA ? "bg-primary/10 border-primary text-primary" : "bg-secondary/20 border-border text-foreground"
                      )}
                      onClick={() => togglePlayer(p)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center font-black", isSelectedForA ? "bg-primary text-background" : "bg-card border-border border-2")}>
                          {isSelectedForA ? "A" : "B"}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-xl italic uppercase tracking-tighter">{p.name}</span>
                          {p.isGuest && <div className="flex items-center gap-1 text-[10px] font-black text-yellow-600"><Star className="h-3 w-3 fill-yellow-600" /> INVITADO</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="w-full md:w-1/2 p-8 bg-card/40 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-black uppercase tracking-tighter text-primary flex items-center gap-2 italic">
                  {isTeamALocked ? <Lock className="h-4 w-4" /> : <Users className="h-4 w-4" />} EQUIPO A (DEFENSOR)
                </h4>
                {(!isTeamALocked || isNewlyPromoted) && (
                  <Button variant="ghost" size="icon" onClick={() => handleAiWand('A')} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
                  </Button>
                )}
              </div>
              <Input 
                placeholder="Nombre del equipo A..." 
                value={teamAName} 
                onChange={(e) => setTeamAName(e.target.value)}
                readOnly={isTeamALocked && !isNewlyPromoted}
                className="bg-background border-primary/20 text-xl font-black uppercase italic"
              />
              <div className="flex flex-wrap gap-2">
                {teamAPlayers.map(p => (
                  <Badge key={p.id} variant="secondary" className="font-bold text-[10px]">
                    {p.name} {p.isGuest && "⭐"}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-black uppercase tracking-tighter text-muted-foreground flex items-center gap-2 italic">
                  <Users className="h-4 w-4" /> EQUIPO B (RETADOR)
                </h4>
                <Button variant="ghost" size="icon" onClick={() => handleAiWand('B')} disabled={isGenerating}>
                   {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
                </Button>
              </div>
              <Input 
                placeholder="Nombre del equipo B..." 
                value={teamBName} 
                onChange={(e) => setTeamBName(e.target.value)}
                className="bg-background border-border text-xl font-black uppercase italic"
              />
              <div className="flex flex-wrap gap-2">
                {teamBPlayers.map(p => (
                  <Badge key={p.id} variant="secondary" className="font-bold text-[10px]">
                    {p.name} {p.isGuest && "⭐"}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 border-t border-border bg-card/80 shrink-0">
          <Button variant="ghost" onClick={onCancel} className="font-black uppercase tracking-widest text-xs">CANCELAR</Button>
          <Button 
            disabled={!canConfirm || isGenerating}
            onClick={() => onConfirm(teamAPlayers, teamBPlayers, teamAName, teamBName)}
            className="px-12 gold-gradient font-black tracking-widest h-14 text-lg rounded-2xl"
          >
            {isGenerating ? "PREPARANDO..." : "LANZAR ENCUENTRO"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
