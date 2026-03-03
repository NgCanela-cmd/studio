"use client"

import React, { useState, useEffect } from 'react';
import { Player, Team, GameType } from '@/lib/game-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateAiTeamName } from '@/ai/flows/ai-team-name-generator';
import { Sparkles, Loader2, ArrowRight, Lock, Users, TrendingUp, Star } from 'lucide-react';
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

  const handleGenerateNames = async () => {
    setIsGenerating(true);
    try {
      if (!isTeamALocked || isNewlyPromoted) {
        const resultA = await generateAiTeamName({ 
          playerNames: teamAPlayers.map(p => p.name),
          theme: "Reyes del trono, escuadrón dominante, alphas de la cancha, campeones veteranos"
        });
        setTeamAName(resultA.suggestedNames[0]);
      }
      
      if (teamBPlayers.length === 5) {
        const resultB = await generateAiTeamName({ 
          playerNames: teamBPlayers.map(p => p.name),
          theme: "Nuevos retadores, jóvenes promesas, aspirantes hambrientos, challengers"
        });
        setTeamBName(resultB.suggestedNames[0]);
      }
    } catch (error) {
      if (!teamAName) setTeamAName("Dominant Force");
      if (!teamBName) setTeamBName("Hungry Challengers");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (pool.length > 0) {
      handleGenerateNames();
    }
  }, [pool.length]);

  const canConfirm = teamAPlayers.length === 5 && teamBPlayers.length === 5 && teamAName && teamBName;

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-5xl bg-background border-border p-0 overflow-hidden rounded-3xl">
        <DialogHeader className="p-8 border-b border-border bg-card/80 backdrop-blur-md">
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="text-primary h-8 w-8" />
              {isTeamALocked ? "NUEVO DESAFÍO" : "INICIO DE JORNADA"}
            </div>
            <div className="flex gap-2">
              {isNewlyPromoted && (
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30 flex gap-1 items-center px-4">
                  <TrendingUp className="h-3 w-3" /> PROMOCIÓN ALFA
                </Badge>
              )}
              <Badge variant="outline" className="text-xs font-black px-4 py-1">{gameType}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row h-[550px]">
          <div className="w-full md:w-1/2 p-8 border-r border-border overflow-y-auto custom-scrollbar bg-card/20">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6">
              {isTeamALocked ? "RETADORES SELECCIONADOS" : "DRAFT DE JUGADORES"}
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {pool.map((p) => {
                const isSelectedForA = teamAPlayers.find(tp => tp.id === p.id);
                return (
                  <div
                    key={p.id}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl border-2 transition-all",
                      isSelectedForA 
                        ? "bg-primary/10 border-primary text-primary" 
                        : "bg-secondary/20 border-border text-foreground",
                      p.isGuest && "border-yellow-500/30"
                    )}
                    onClick={() => togglePlayer(p)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center font-black",
                        isSelectedForA ? "bg-primary text-background" : "bg-card border-border border-2"
                      )}>
                        {isSelectedForA ? "A" : "B"}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-xl italic uppercase tracking-tighter">{p.name}</span>
                        {p.isGuest && (
                          <div className="flex items-center gap-1 text-[10px] font-black text-yellow-600">
                            <Star className="h-3 w-3 fill-yellow-600" /> INVITADO
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full md:w-1/2 p-8 bg-card/40 flex flex-col gap-8">
            <div className="space-y-4">
              <h4 className="font-black uppercase tracking-tighter text-primary flex items-center gap-2 italic">
                {isTeamALocked ? <Lock className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                EQUIPO A (DEFENSOR)
              </h4>
              <div className="p-6 bg-background border-2 border-primary/20 rounded-2xl">
                <p className="text-2xl font-black mb-4 italic text-primary uppercase tracking-tighter">
                  {teamAName || "Asignando nombre..."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {teamAPlayers.map(p => (
                    <Badge key={p.id} variant="secondary" className={cn("font-bold text-[10px]", p.isGuest && "text-yellow-600")}>
                      {p.name} {p.isGuest && "⭐"}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-black uppercase tracking-tighter text-muted-foreground flex items-center gap-2 italic">
                <Users className="h-4 w-4" />
                EQUIPO B (RETADOR)
              </h4>
              <div className="p-6 bg-background border-2 border-border/50 rounded-2xl">
                <p className="text-2xl font-black mb-4 italic uppercase tracking-tighter">
                  {teamBName || (teamBPlayers.length === 5 ? "Generando..." : "Faltan jugadores...")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {teamBPlayers.map(p => (
                    <Badge key={p.id} variant="secondary" className={cn("font-bold text-[10px]", p.isGuest && "text-yellow-600")}>
                      {p.name} {p.isGuest && "⭐"}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 border-t border-border bg-card/80">
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
