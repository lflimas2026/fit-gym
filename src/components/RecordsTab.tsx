import React, { useEffect, useState } from 'react';
import { Trophy, Dumbbell, Flame } from 'lucide-react';

interface RecordItem {
  exerciseId: string;
  exerciseName: string;
  muscleId: string;
  estimated1RM: number;
  maxWeight: number;
  maxReps: number;
}

import { useApp } from '../context/AppContext';

export default function RecordsTab() {
  const { records, loading } = useApp();

  if (loading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Calculando marcas históricas...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-[#0A0A0C] border border-[#1A1A1E] rounded-2xl p-8 text-center flex flex-col items-center gap-2">
        <span className="text-xl">🏆</span>
        <p className="text-xs font-bold text-zinc-400">Nenhum recorde registrado ainda.</p>
        <p className="text-[10px] text-zinc-600 max-w-[200px]">Conclua séries com carga no seu treino para computar seu primeiro 1RM!</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center gap-1.5 px-1">
        <Trophy size={14} className="text-amber-500" />
        <span className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">Hall de Cargas Máximas (1RM)</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {records.map((rec) => (
          <div key={rec.exerciseId} className="bg-[#0A0A0C] border border-[#1A1A1E] rounded-xl p-3.5 flex justify-between items-center transition-all hover:border-zinc-800">
            <div className="flex flex-col gap-0.5">
              <h5 className="text-xs font-bold text-zinc-200">{rec.exerciseName}</h5>
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                <span className="text-emerald-500 uppercase tracking-wider font-semibold">{rec.muscleId}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5"><Dumbbell size={10} /> Máx: {rec.maxWeight}kg</span>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <div className="flex items-center gap-1 bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                <Flame size={12} className="text-emerald-400 animate-pulse" />
                <span className="text-xs font-black text-emerald-400">{Math.round(rec.estimated1RM)} <span className="text-[9px] font-normal">kg</span></span>
              </div>
              <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-1">1RM Estimado</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}