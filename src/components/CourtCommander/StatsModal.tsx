"use client"

import React from 'react';
import { Match, PlayerStat } from '@/lib/game-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, History, Users, BarChart3, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface StatsModalProps {
  matches: Match[];
  playerStats: PlayerStat[];
  onClose: () => void;
}

export default function StatsModal({ matches, playerStats, onClose }: StatsModalProps) {
  // Ordenar jugadores por victorias
  const sortedPlayers = [...playerStats].sort((a, b) => b.wins - a.wins);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-background border-border p-0 overflow-hidden rounded-3xl">
        <DialogHeader className="p-8 border-b border-border bg-card/80 backdrop-blur-md">
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
            <BarChart3 className="text-primary h-8 w-8" />
            ESTADÍSTICAS DEL TORNEO
          </DialogTitle>
        </DialogHeader>

        <div className="p-0">
          <Tabs defaultValue="matches" className="w-full">
            <div className="px-8 bg-card/40 border-b border-border">
              <TabsList className="bg-transparent h-16 gap-8">
                <TabsTrigger value="matches" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full font-black uppercase tracking-widest text-xs flex gap-2">
                  <History className="h-4 w-4" />
                  Historial de Partidos
                </TabsTrigger>
                <TabsTrigger value="players" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full font-black uppercase tracking-widest text-xs flex gap-2">
                  <Users className="h-4 w-4" />
                  Rendimiento Jugadores
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-8 h-[500px]">
              <TabsContent value="matches" className="h-full mt-0">
                <ScrollArea className="h-full pr-4">
                  {matches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20">
                      <Clock className="h-16 w-16 mb-4" />
                      <p className="font-black uppercase tracking-widest">No hay partidos registrados aún</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {matches.map((match) => (
                        <div key={match.id} className="p-6 bg-card border border-border rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-all">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                              {format(match.timestamp, 'HH:mm - dd MMM')}
                            </span>
                            <div className="flex items-center gap-4">
                              <span className={`text-xl font-black uppercase tracking-tighter italic ${match.winnerName === match.teamAName ? 'text-primary' : 'text-foreground'}`}>
                                {match.teamAName}
                              </span>
                              <span className="text-xs font-black opacity-30 italic">VS</span>
                              <span className={`text-xl font-black uppercase tracking-tighter italic ${match.winnerName === match.teamBName ? 'text-primary' : 'text-foreground'}`}>
                                {match.teamBName}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className="gold-gradient font-black text-[10px] tracking-widest uppercase py-1 px-4">GANADOR: {match.winnerName}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="players" className="h-full mt-0">
                <ScrollArea className="h-full pr-4">
                  {sortedPlayers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20">
                      <Users className="h-16 w-16 mb-4" />
                      <p className="font-black uppercase tracking-widest">Registra victorias para ver estadísticas</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sortedPlayers.map((player, idx) => (
                        <div key={player.id} className="p-6 bg-card border border-border rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-sm border-2 ${idx === 0 ? 'bg-primary text-background border-primary shadow-lg shadow-primary/20' : 'bg-secondary/50 border-border text-muted-foreground'}`}>
                              {idx + 1}
                            </div>
                            <span className="text-xl font-black uppercase tracking-tighter italic">{player.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-3xl font-black text-primary italic leading-none">{player.wins}</span>
                            <span className="text-[10px] font-black uppercase opacity-30 mt-2 tracking-widest">Victorias</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
