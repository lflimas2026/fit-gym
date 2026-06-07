// src/components/RecoveryTab.tsx
import React from 'react';
import MuscleModel from './MuscleModel';
import { Shield, Sparkles } from 'lucide-react';

export default function RecoveryTab() {
  return (
    <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">
      <div className="flex flex-col gap-0.5 px-1">
        <span className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">Estado de Regeneração</span>
        <h2 className="text-sm font-bold text-zinc-200">Balanço de Fadiga Acumulada</h2>
      </div>

      {/* Gráfico Muscular Centralizado */}
      <div className="bg-[#0A0A0C] border border-[#1A1A1E] rounded-2xl p-4 flex justify-center shadow-xl">
        <MuscleModel onSelectMuscle={(id) => console.log("Inspecionando músculo:", id)} />
      </div>

      <div className="p-4 rounded-xl bg-emerald-950/10 border border-emerald-500/10 flex gap-2.5 items-start">
        <Sparkles size={14} className="text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-zinc-500 leading-normal">
          <strong className="text-zinc-400">Análise da IA:</strong> Seus músculos superiores estão completamente recuperados e prontos para estímulos de alta intensidade. Pernas demandam mais 24h de descanso metabólico.
        </p>
      </div>
    </div>
  );
}