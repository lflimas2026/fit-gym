// src/components/LogTab.tsx
import React, { useEffect, useState } from 'react';
import { Calendar, Dumbbell, MapPin, CheckCircle2 } from 'lucide-react';

interface LocalWorkout {
  id: string;
  date: string;
  location: string;
  sets: { id: string; exerciseId: string; reps: number; weight: number }[];
}

export default function LogTab() {
  const [history, setHistory] = useState<LocalWorkout[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/workouts');
        if (res.ok) {
          const data = await res.json();
          // Garante que os treinos mais recentes apareçam no topo
          const sorted = data.sort((a: any, b: any) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setHistory(sorted);
        }
      } catch (err) {
        console.error("Erro ao buscar histórico do D1:", err);
      } finally {
        setLoadingLogs(false);
      }
    }
    fetchLogs();
  }, []);

  if (loadingLogs) {
    return (
      <div className="py-12 flex flex-col justify-center items-center gap-2">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Carregando histórico...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-[#0A0A0C] border border-[#1A1A1E] rounded-2xl p-8 text-center flex flex-col items-center gap-1.5 animate-in fade-in duration-200">
        <span className="text-xl">📭</span>
        <p className="text-xs font-bold text-zinc-400">Nenhum treino registrado</p>
        <p className="text-[10px] text-zinc-600 max-w-[200px] mx-auto leading-normal">
          Complete e finalize a sua primeira rotina recomendada para ver os relatórios aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">
      <div className="flex flex-col gap-0.5 px-1">
        <span className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">Linha do Tempo</span>
        <h2 className="text-sm font-bold text-zinc-200">Histórico de Sessões Concluídas</h2>
      </div>

      <div className="flex flex-col gap-3">
        {history.map((workout) => {
          const dateObj = new Date(workout.date);
          const formattedDate = dateObj.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
          const formattedTime = dateObj.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div 
              key={workout.id} 
              className="bg-[#0A0A0C] border border-[#1A1A1E] rounded-2xl p-4 flex flex-col gap-3.5 shadow-md hover:border-zinc-800 transition-colors"
            >
              {/* Meta-dados do treino */}
              <div className="flex justify-between items-center border-b border-zinc-950 pb-2.5">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Calendar size={13} className="text-emerald-500" />
                  <span className="text-xs font-bold text-zinc-300">{formattedDate}</span>
                  <span className="text-[10px] text-zinc-600 font-medium">às {formattedTime}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md text-zinc-400 font-semibold">
                  <MapPin size={10} className="text-zinc-500" />
                  {workout.location}
                </div>
              </div>

              {/* Resumo rápido do volume */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-950/20 border border-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                    <Dumbbell size={13} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-200">Sessão Finalizada</p>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      Volume total de {workout.sets?.length || 0} séries anotadas
                    </p>
                  </div>
                </div>
                <div className="text-emerald-400">
                  <CheckCircle2 size={16} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}