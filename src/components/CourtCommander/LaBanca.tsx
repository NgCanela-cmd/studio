
"use client"

import React, { useState } from 'react';
import { Player } from '@/lib/game-types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, UserPlus, Clock, Users, ArrowRight, ChevronUp, ChevronDown, Pencil, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LaBancaProps {
  queue: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
  onUpdatePlayer: (id: string, name: string) => void;
  onMovePlayer: (id: string, direction: 'up' | 'down') => void;
  isDrafting: boolean;
  totalInSystem: number;
}

export default function LaBanca({ queue, onAddPlayer, onRemovePlayer, onUpdatePlayer, onMovePlayer, isDrafting, totalInSystem }: LaBancaProps) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddPlayer(newName.trim());
      setNewName('');
    }
  };

  const handleStartEdit = (player: Player) => {
    setEditingId(player.id);
    setEditValue(player.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editValue.trim()) {
      onUpdatePlayer(editingId, editValue.trim());
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
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
                className={cn(
                  "group flex items-center justify-between p-4 bg-background border border-border rounded-xl transition-all shadow-sm",
                  editingId === player.id ? "border-primary ring-1 ring-primary/20" : "hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  
                  <div className="flex-1">
                    {editingId === player.id ? (
                      <div className="flex items-center gap-2">
                        <Input 
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 py-0 bg-secondary/50 border-primary/50 text-sm font-bold"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                        />
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={handleSaveEdit}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-accent" onClick={handleCancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <p className="text-lg font-bold leading-tight">{player.name}</p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(player.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Reordering Controls */}
                  <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-muted-foreground hover:text-primary"
                      disabled={idx === 0}
                      onClick={() => onMovePlayer(player.id, 'up')}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-muted-foreground hover:text-primary"
                      disabled={idx === queue.length - 1}
                      onClick={() => onMovePlayer(player.id, 'down')}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center ml-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleStartEdit(player)}
                      className="text-muted-foreground hover:text-primary h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onRemovePlayer(player.id)}
                      className="text-muted-foreground hover:text-accent hover:bg-accent/10 h-9 w-9"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
