"use client"

import React, { useState } from 'react';
import { Player, Team, GameType } from '@/lib/game-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Lock, Users, Star } from 'lucide-react';
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
  
  // Nombres predeterminados solicitados
  const DEFAULT_NAME_A = "Dominant Force";
  const DEFAULT_NAME_B = "Hungry Challengers";

  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>(existingTeamA?.players || []);
  const [teamAName, setTeamAName] = useState(existingTeamA?.name || DEFAULT_NAME_A);
  const [teamBName, setTeamBName] = useState(DEFAULT_NAME_B);

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

  // Ahora el botón de varita simplemente restablece los nombres predeterminados sin usar IA
  const handleResetName = (target: 'A' | 'B') => {
    if (target === 'A') setTeamAName(DEFAULT_NAME_A);
    else setTeamBName(DEFAULT_NAME_B);
  };

  const canConfirm = teamAPlayers.length === 5 && teamBPlayers.length === 5 && teamAName.trim() !== '' && teamBName.trim() !== '';

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-5xl bg-background border-border p-0 overflow-hidden rounded-3xl h-[92vh] max-h-[92vh] flex flex-col">
        <DialogHeader className="p-5 md:p-6 border-b border-border bg-card/80 backdrop-blur-md shrink-0">
          <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Users className="text-primary h-5 w-5 md:h-7 md:w-7" />
              <span className="truncate">{isTeamALocked ? "NUEVO DESAFÍO" : "INICIO DE JORNADA"}</span>
            </div>
            <div className="flex gap-1.5">
              {isNewlyPromoted && (
                <Badge className="hidden sm:flex bg-green-500/20 text-green-500 border-green-500/30 px-3 py-0.5 text-[10px]">PROMOCIÓN ALFA</Badge>
              )}
              <Badge variant="outline" className="px-3 py-0.5 text-[10px]">{gameType}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row h-full min-h-0">
            {/* Columna Izquierda: Selección de jugadores */}
            <div className="w-full md:w-1/2 p-5 md:p-6 border-b md:border-b-0 md:border-r border-border bg-card/20 flex flex-col">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 shrink-0">
                {isTeamALocked ? "RETADORES SELECCIONADOS" : "DRAFT DE JUGADORES"}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {pool.map((p) => {
                  const isSelectedForA = teamAPlayers.find(tp => tp.id === p.id);
                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "flex items-center justify-between p-2.5 md:p-3.5 rounded-xl border-2 cursor-pointer transition-all",
                        isSelectedForA ? "bg-primary/10 border-primary text-primary" : "bg-secondary/20 border-border text-foreground"
                      )}
                      onClick={() => togglePlayer(p)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("h-7 w-7 md:h-8 md:w-8 rounded-full flex items-center justify-center font-black text-[10px] md:text-xs", isSelectedForA ? "bg-primary text-background" : "bg-card border-border border-2")}>
                          {isSelectedForA ? "A" : "B"}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-base md:text-lg italic uppercase tracking-tighter truncate max-w-[120px] md:max-w-none">{p.name}</span>
                          {p.isGuest && <div className="flex items-center gap-0.5 text-[7px] md:text-[8px] font-black text-yellow-600 uppercase"><Star className="h-2 w-2 fill-yellow-600" /> Invitado</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Columna Derecha: Configuración de Equipos */}
            <div className="w-full md:w-1/2 p-5 md:p-6 bg-card/40 flex flex-col gap-5 md:gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-black uppercase tracking-tighter text-primary flex items-center gap-2 italic text-xs md:text-sm">
                    {isTeamALocked ? <Lock className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />} EQUIPO A (DEFENSOR)
                  </h4>
                  {(!isTeamALocked || isNewlyPromoted) && (
                    <Button variant="ghost" size="icon" onClick={() => handleResetName('A')} title="Restablecer nombre" className="h-7 w-7">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </Button>
                  )}
                </div>
                <Input 
                  placeholder="Nombre del equipo A..." 
                  value={teamAName} 
                  onChange={(e) => setTeamAName(e.target.value)}
                  readOnly={isTeamALocked && !isNewlyPromoted}
                  className="bg-background border-primary/20 text-base md:text-lg font-black uppercase italic h-10"
                />
                <div className="flex flex-wrap gap-1.5 p-1">
                  {teamAPlayers.map(p => (
                    <Badge key={p.id} variant="secondary" className="font-bold text-[9px] px-1.5 py-0">
                      {p.name} {p.isGuest && "⭐"}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-black uppercase tracking-tighter text-muted-foreground flex items-center gap-2 italic text-xs md:text-sm">
                    <Users className="h-3.5 w-3.5" /> EQUIPO B (RETADOR)
                  </h4>
                  <Button variant="ghost" size="icon" onClick={() => handleResetName('B')} title="Restablecer nombre" className="h-7 w-7">
                     <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </Button>
                </div>
                <Input 
                  placeholder="Nombre del equipo B..." 
                  value={teamBName} 
                  onChange={(e) => setTeamBName(e.target.value)}
                  className="bg-background border-border text-base md:text-lg font-black uppercase italic h-10"
                />
                <div className="flex flex-wrap gap-1.5 p-1">
                  {teamBPlayers.map(p => (
                    <Badge key={p.id} variant="secondary" className="font-bold text-[9px] px-1.5 py-0">
                      {p.name} {p.isGuest && "⭐"}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-5 md:p-6 border-t border-border bg-card/80 shrink-0 flex flex-row justify-end gap-2.5">
          <Button variant="ghost" onClick={onCancel} className="font-black uppercase tracking-widest text-[9px] md:text-[10px] h-9">CANCELAR</Button>
          <Button 
            disabled={!canConfirm}
            onClick={() => onConfirm(teamAPlayers, teamBPlayers, teamAName, teamBName)}
            className="px-5 md:px-8 gold-gradient font-black tracking-widest h-10 md:h-12 text-sm md:text-base rounded-xl flex-1 md:flex-none"
          >
            LANZAR ENCUENTRO
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
//