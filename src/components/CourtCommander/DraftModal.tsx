
"use client"

import React, { useState, useEffect } from 'react';
import { Player, Team, GameType } from '@/lib/game-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateAiTeamName } from '@/ai/flows/ai-team-name-generator';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraftModalProps {
  pool: Player[];
  gameType: GameType;
  existingTeamA?: Team | null;
  onCancel: () => void;
  onConfirm: (teamAPlayers: Player[], teamBPlayers: Player[], teamAName: string, teamBName: string) => void;
}

export default function DraftModal({ pool, gameType, existingTeamA, onCancel, onConfirm }: DraftModalProps) {
  // Si ya hay un equipo A, teamAPlayers será el existente. Si no, seleccionamos del pool.
  const isTeamALocked = !!existingTeamA;
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>(existingTeamA?.players || []);
  const [teamAName, setTeamAName] = useState(existingTeamA?.name || '');
  const [teamBName, setTeamBName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Los jugadores que no están en el equipo A van al B
  const teamBPlayers = pool.filter(p => !teamAPlayers.find(tp => tp.id === p.id));

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
      // Solo generamos nombre para el equipo A si no existe
      if (!isTeamALocked && teamAPlayers.length === 5) {
        const resultA = await generateAiTeamName({ 
          playerNames: teamAPlayers.map(p => p.name),
          theme: "Intimidante y poderoso"
        });
        setTeamAName(resultA.suggestedNames[0]);
      }
      
      // Siempre generamos nombre para el equipo B (que es el nuevo retador)
      if (teamBPlayers.length === 5) {
        const resultB = await generateAiTeamName({ 
          playerNames: teamBPlayers.map(p => p.name),
          theme: "Rápido y técnico"
        });
        setTeamBName(resultB.suggestedNames[0]);
      }
    } catch (error) {
      console.error("AI Error:", error);
      if (!isTeamALocked) setTeamAName("Equipo Alpha");
      setTeamBName("Equipo Bravo");
    } finally {
      setIsGenerating(false);
    }
  };

  // Efecto inicial: si el equipo A ya está en cancha y el pool tiene 5 (los retadores), generamos nombre para B
  useEffect(() => {
    if (isTeamALocked && pool.length === 5) {
      handleGenerateNames();
    }
  }, [pool.length]);

  // Si drafteamos 10 (cancha vacía), generamos nombres cuando A tenga sus 5
  useEffect(() => {
    if (!isTeamALocked && teamAPlayers.length === 5 && pool.length === 10) {
      handleGenerateNames();
    }
  }, [teamAPlayers.length]);

  const canConfirm = teamAPlayers.length === 5 && teamBPlayers.length === 5 && teamAName && teamBName;

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl bg-background border-border p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-border bg-card/50">
          <DialogTitle className="text-2xl font-black uppercase tracking-widest flex items-center gap-2">
            Draft de Equipos: {gameType}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row h-[500px]">
          <div className="w-full md:w-1/2 p-6 border-r border-border overflow-y-auto custom-scrollbar">
            <h3 className="text-sm font-bold text-muted-foreground uppercase mb-4 tracking-tighter">
              {isTeamALocked ? "Nuevos Retadores (Equipo B)" : `Selecciona jugadores para Equipo A (${pool.length} disponibles)`}
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {pool.map((p) => {
                const isSelectedForA = teamAPlayers.find(tp => tp.id === p.id);
                const isForcedB = isTeamALocked;
                
                return (
                  <button
                    key={p.id}
                    disabled={isTeamALocked}
                    onClick={() => togglePlayer(p)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                      isSelectedForA 
                        ? "bg-primary/20 border-primary text-primary" 
                        : isForcedB 
                          ? "bg-secondary/10 border-border text-foreground/50 opacity-80"
                          : "bg-secondary/30 border-border text-foreground hover:border-primary/50"
                    )}
                  >
                    <span className="font-bold text-lg">{p.name}</span>
                    <Badge variant={isSelectedForA ? "default" : isForcedB ? "secondary" : "outline"} className="font-bold">
                      {isSelectedForA ? "EQUIPO A" : "EQUIPO B"}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full md:w-1/2 p-6 bg-card/30 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  Equipo A {isTeamALocked && "(VENCEDOR)"}
                </h4>
                <Badge className="gold-gradient">5 / 5</Badge>
              </div>
              <div className="p-4 bg-background border border-border rounded-xl min-h-[100px]">
                <p className="text-xl font-black mb-4 italic text-primary">{teamAName || "Seleccionando..."}</p>
                <div className="flex flex-wrap gap-2">
                  {teamAPlayers.map(p => (
                    <Badge key={p.id} variant="secondary" className="font-medium">{p.name}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center h-8 relative">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
               <span className="relative z-10 bg-card px-3 text-xs font-black italic opacity-50">VS</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black uppercase tracking-widest text-muted-foreground">Equipo B (RETADOR)</h4>
                <Badge variant="outline">5 / 5</Badge>
              </div>
              <div className="p-4 bg-background border border-border rounded-xl min-h-[100px]">
                {teamBName ? (
                  <p className="text-xl font-black mb-4 italic">{teamBName}</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground italic">Generando estrategia...</p>
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {teamBPlayers.map(p => (
                    <Badge key={p.id} variant="secondary" className="font-medium">{p.name}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 border-t border-border bg-card/50">
          <Button variant="ghost" onClick={onCancel} className="font-bold">CANCELAR</Button>
          <Button 
            disabled={!canConfirm || isGenerating}
            onClick={() => onConfirm(teamAPlayers, teamBPlayers, teamAName, teamBName)}
            className="px-8 gold-gradient font-black tracking-widest h-12"
          >
            {isGenerating ? (
              <>CONFIGURANDO <Loader2 className="ml-2 h-4 w-4 animate-spin" /></>
            ) : (
              <>LANZAR PARTIDO <ArrowRight className="ml-2 h-5 w-5" /></>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
