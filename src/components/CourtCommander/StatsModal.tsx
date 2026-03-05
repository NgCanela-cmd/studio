
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
      <DialogContent className="max-w-4xl w-[95vw] md:w-full bg-background border-border p-0 overflow-hidden rounded-3xl">
        <DialogHeader className="p-5 md:p-8 border-b border-border bg-card/80 backdrop-blur-md">
          <DialogTitle className="text-xl md:text-3xl font-black uppercase tracking-tighter flex items-center gap-2 md:gap-3">
            <BarChart3 className="text-primary h-6 w-6 md:h-8 md:w-8" />
            ESTADÍSTICAS DEL TORNEO
          </DialogTitle>
        </DialogHeader>

        <div className="p-0">
          <Tabs defaultValue="matches" className="w-full">
            <div className="px-4 md:px-8 bg-card/40 border-b border-border">
              <TabsList className="bg-transparent h-12 md:h-16 gap-4 md:gap-8 overflow-x-auto justify-start md:justify-center">
                <TabsTrigger 
                  value="matches" 
                  className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full font-black uppercase tracking-widest text-[10px] md:text-xs flex gap-2 shrink-0"
                >
                  <History className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  Historial
                </TabsTrigger>
                <TabsTrigger 
                  value="players" 
                  className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full font-black uppercase tracking-widest text-[10px] md:text-xs flex gap-2 shrink-0"
                >
                  <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  Ranking
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 md:p-8 h-[70vh] md:h-[500px]">
              <TabsContent value="matches" className="h-full mt-0">
                <ScrollArea className="h-full pr-2 md:pr-4">
                  {matches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20">
                      <Clock className="h-12 w-12 md:h-16 md:w-16 mb-4" />
                      <p className="font-black uppercase tracking-widest text-xs md:text-sm">No hay partidos registrados aún</p>
                    </div>
                  ) : (
                    <div className="space-y-3 md:space-y-4">
                      {matches.map((match) => (
                        <div key={match.id} className="p-4 md:p-6 bg-card border border-border rounded-xl md:rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-primary/50 transition-all">
                          <div className="flex flex-col gap-1 w-full md:w-auto">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                              {format(match.timestamp, 'HH:mm - dd MMM')}
                            </span>
                            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                              <span className={`text-base md:text-xl font-black uppercase tracking-tighter italic truncate ${match.winnerName === match.teamAName ? 'text-primary' : 'text-foreground'}`}>
                                {match.teamAName}
                              </span>
                              <span className="text-[10px] font-black opacity-30 italic shrink-0">VS</span>
                              <span className={`text-base md:text-xl font-black uppercase tracking-tighter italic truncate ${match.winnerName === match.teamBName ? 'text-primary' : 'text-foreground'}`}>
                                {match.teamBName}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
                            <Badge className="gold-gradient font-black text-[9px] md:text-[10px] tracking-widest uppercase py-1 px-3 md:px-4 w-full md:w-auto justify-center">
                              GANADOR: {match.winnerName}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="players" className="h-full mt-0">
                <ScrollArea className="h-full pr-2 md:pr-4">
                  {sortedPlayers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20">
                      <Users className="h-12 w-12 md:h-16 md:w-16 mb-4" />
                      <p className="font-black uppercase tracking-widest text-xs md:text-sm">Registra victorias para ver estadísticas</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      {sortedPlayers.map((player, idx) => (
                        <div key={player.id} className="p-4 md:p-6 bg-card border border-border rounded-xl md:rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-all">
                          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                            <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center font-black text-xs md:text-sm border-2 shrink-0 ${idx === 0 ? 'bg-primary text-background border-primary shadow-lg shadow-primary/20' : 'bg-secondary/50 border-border text-muted-foreground'}`}>
                              {idx + 1}
                            </div>
                            <span className="text-base md:text-xl font-black uppercase tracking-tighter italic truncate">{player.name}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-2xl md:text-3xl font-black text-primary italic leading-none">{player.wins}</span>
                            <span className="text-[8px] md:text-[10px] font-black uppercase opacity-30 mt-2 tracking-widest">Wins</span>
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

//