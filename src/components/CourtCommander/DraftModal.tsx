"use client"

import React, { useState, useEffect } from 'react';
import { Player, Team, GameType } from '@/lib/game-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateAiTeamName } from '@/ai/flows/ai-team-name-generator';
import { Sparkles, Loader2, ArrowRight, Lock, Users, TrendingUp } from 'lucide-react';
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
  // Un equipo se considera "promovido" si acaba de ganar como retador (tiene exactamente 1 victoria)
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
      // Si el equipo A es nuevo o acaba de ser promovido tras ganar como retador
      if (!isTeamALocked || (isNewlyPromoted && teamAPlayers.length === 5)) {
        const resultA = await generateAiTeamName({ 
          playerNames: teamAPlayers.map(p => p.name),
          theme: "Dominantes, veteranos, reyes de la pista, escuadrón alfa"
        });
        setTeamAName(resultA.suggestedNames[0]);
      }
      
      if (teamBPlayers.length === 5) {
        const resultB = await generateAiTeamName({ 
          playerNames: teamBPlayers.map(p => p.name),
          theme: "Retadores, jóvenes promesas, bravo challengers, hambrientos"
        });
        setTeamBName(resultB.suggestedNames[0]);
      }
    } catch (error) {
      if (!teamAName) setTeamAName("Alpha Squad");
      if (!teamBName) setTeamBName("Bravo Challengers");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (pool.length === 5 || pool.length === 10) {
      if (!isTeamALocked || (isNewlyPromoted && !isGenerating && teamAName === existingTeamA?.name)) {
        handleGenerateNames();
      } else if (isTeamALocked && teamBName === '') {
        handleGenerateNames();
      }
    }
  }, [pool.length, teamAPlayers.length]);

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
                  <TrendingUp className="h-3 w-3" /> PROMOCIÓN ALPHA
                </Badge>
              )}
              <Badge variant="outline" className="text-xs font-black px-4 py-1">{gameType}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row h-[550px]">
          <div className="w-full md:w-1/2 p-8 border-r border-border overflow-y-auto custom-scrollbar bg-card/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                {isTeamALocked ? "RETADORES DISPONIBLES" : `DRAFT DE JUGADORES (POOL: ${pool.length})`}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {pool.map((p) => {
                const isSelectedForA = teamAPlayers.find(tp => tp.id === p.id);
                const isForcedB = isTeamALocked;
                
                return (
                  <button
                    key={p.id}
                    disabled={isTeamALocked}
                    onClick={() => togglePlayer(p)}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left group",
                      isSelectedForA 
                        ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5" 
                        : isForcedB 
                          ? "bg-secondary/20 border-border text-foreground/80 hover:border-primary/50"
                          : "bg-secondary/20 border-border/50 text-foreground hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center font-black text-sm border-2",
                        isSelectedForA ? "bg-primary text-background border-primary" : "bg-card border-border"
                      )}>
                        {isSelectedForA ? "A" : "B"}
                      </div>
                      <span className="font-black text-xl italic tracking-tighter uppercase">{p.name}</span>
                    </div>
                    {isTeamALocked && <ArrowRight className="h-4 w-4 opacity-30 group-hover:translate-x-1 transition-transform" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full md:w-1/2 p-8 bg-card/40 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black uppercase tracking-tighter text-primary flex items-center gap-2 italic">
                  {isTeamALocked ? <Lock className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                  EQUIPO A {isTeamALocked && "(GANADOR)"}
                </h4>
                <Badge className="gold-gradient text-[10px] font-black">{teamAPlayers.length} / 5</Badge>
              </div>
              <div className="p-6 bg-background border-2 border-primary/20 rounded-2xl shadow-inner min-h-[120px]">
                <p className="text-2xl font-black mb-4 italic text-primary uppercase tracking-tighter">
                  {teamAName || "Asignando nombre..."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {teamAPlayers.map(p => (
                    <Badge key={p.id} variant="secondary" className="font-bold text-[10px] px-3 py-1 bg-secondary/50 border-0">{p.name}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center h-4 relative">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50"></div></div>
               <span className="relative z-10 bg-card px-4 text-[10px] font-black italic opacity-30 tracking-widest uppercase">VS</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black uppercase tracking-tighter text-muted-foreground flex items-center gap-2 italic">
                  <Users className="h-4 w-4" />
                  EQUIPO B (RETADOR)
                </h4>
                <Badge variant="outline" className="text-[10px] font-black">{teamBPlayers.length} / 5</Badge>
              </div>
              <div className="p-6 bg-background border-2 border-border/50 rounded-2xl shadow-inner min-h-[120px]">
                {teamBName ? (
                  <p className="text-2xl font-black mb-4 italic uppercase tracking-tighter">{teamBName}</p>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground italic font-medium">
                      {teamBPlayers.length === 5 ? "Generando nombre..." : "Faltan jugadores..."}
                    </p>
                    {teamBPlayers.length === 5 && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {teamBPlayers.map(p => (
                    <Badge key={p.id} variant="secondary" className="font-bold text-[10px] px-3 py-1 bg-secondary/50 border-0">{p.name}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 border-t border-border bg-card/80 backdrop-blur-md">
          <Button variant="ghost" onClick={onCancel} className="font-black uppercase tracking-widest text-xs">CANCELAR</Button>
          <Button 
            disabled={!canConfirm || isGenerating}
            onClick={() => onConfirm(teamAPlayers, teamBPlayers, teamAName, teamBName)}
            className="px-12 gold-gradient font-black tracking-widest h-14 text-lg rounded-2xl shadow-xl shadow-primary/20 group"
          >
            {isGenerating ? (
              <>PREPARANDO <Loader2 className="ml-2 h-5 w-5 animate-spin" /></>
            ) : (
              <>LANZAR ENCUENTRO <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" /></>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}