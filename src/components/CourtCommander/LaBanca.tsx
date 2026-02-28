"use client"

import React, { useState } from 'react';
import { Player } from '@/lib/game-types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, UserPlus, Clock, Users, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LaBancaProps {
  queue: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
  isDrafting: boolean;
  totalInSystem: number;
}

export default function LaBanca({ queue, onAddPlayer, onRemovePlayer, isDrafting, totalInSystem }: LaBancaProps) {
  const [newName, setNewName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddPlayer(newName.trim());
      setNewName('');
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-card/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-secondary rounded-lg flex items-center justify-center">
            <Users className="text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-widest">La Banca</h2>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-[10px] font-bold py-0">{queue.length} EN COLA</Badge>
              <Badge variant="secondary" className="text-[10px] font-bold py-0 bg-primary/10 text-primary border-primary/20">{totalInSystem} TOTAL</Badge>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <Input 
          placeholder="Nombre del jugador..." 
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="bg-background border-border py-6 text-lg focus:ring-primary"
        />
        <Button type="submit" size="icon" className="h-[52px] w-[52px] gold-gradient">
          <UserPlus />
        </Button>
      </form>

      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-3 pb-6">
          {queue.length === 0 ? (
            <div className="text-center py-12 opacity-30">
              <p className="text-lg font-medium">Banca vacía</p>
              <p className="text-sm">Registra jugadores para empezar</p>
            </div>
          ) : (
            queue.map((player, idx) => (
              <div 
                key={player.id} 
                className="group flex items-center justify-between p-4 bg-background border border-border rounded-xl hover:border-primary/50 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-lg font-bold">{player.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(player.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {idx < 10 && (
                    <div className="flex items-center justify-center h-8 w-8 text-primary opacity-30 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onRemovePlayer(player.id)}
                    className="text-muted-foreground hover:text-accent hover:bg-accent/10 h-10 w-10"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {isDrafting && (
        <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20 animate-pulse">
          <p className="text-primary font-black text-center uppercase tracking-tighter">Draft en progreso...</p>
        </div>
      )}
    </div>
  );
}