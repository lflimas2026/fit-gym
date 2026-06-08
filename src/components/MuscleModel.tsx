// src/components/MuscleModel.tsx
import React, { useEffect, useState } from 'react';
import { Shield, Activity } from 'lucide-react';

import { useApp } from '../context/AppContext';
import { calculateRecovery } from '../utils/workoutHelpers';

interface MuscleModelProps {
  onSelectMuscle?: (muscleId: string) => void;
}

export default function MuscleModel({ onSelectMuscle }: MuscleModelProps) {
  const [recoveryData, setRecoveryData] = useState<{ [key: string]: number }>({
    chest: 100, back: 100, shoulders: 100, biceps: 100, abs: 100, quads: 100, hams: 100, glutes: 100, calves: 100
  });
  const [loading, setLoading] = useState(true);
  const { workoutHistory } = useApp();

  useEffect(() => {
    async function loadRecovery() {
      try {
        const res = await fetch('/api/muscles-recovery');
        if (res.ok) {
          const data = await res.json();
          setRecoveryData(data);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Erro ao carregar dados de fadiga do D1:", e);
      }
      
      // Fallback local usando o histórico reativo do contexto
      const localData: { [key: string]: number } = {};
      const musclesList = ['chest', 'back', 'shoulders', 'biceps', 'abs', 'quads', 'hams', 'glutes', 'calves'];
      musclesList.forEach(m => {
        localData[m] = calculateRecovery(m, workoutHistory);
      });
      setRecoveryData(localData);
      setLoading(false);
    }
    loadRecovery();
  }, [workoutHistory]);

  const translateMuscle = (id: string) => {
    const names: { [key: string]: string } = {
      chest: 'Peito (Peitoral)',
      back: 'Costas (Dorsais)',
      shoulders: 'Ombros (Deltoides)',
      biceps: 'Braços (Bíceps/Tríceps)',
      abs: 'Core (Abdômen)',
      quads: 'Quadríceps (Frente)',
      hams: 'Posteriores (Atrás)',
      glutes: 'Glúteos',
      calves: 'Panturrilhas'
    };
    return names[id] || id;
  };

  const getBarColor = (percent: number) => {
    if (percent < 30) return 'bg-rose-500';
    if (percent < 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  if (loading) {
    return (
      <div className="py-6 flex flex-col items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Calculando desgaste...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0A0A0C] border border-[#1A1A1E] rounded-2xl p-4 flex flex-col gap-4 shadow-xl">
      <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
        <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
          <Activity size={12} className="text-emerald-400" /> Recuperação Muscular
        </span>
        <span className="text-[9px] text-zinc-500 italic">Atualizado em tempo real</span>
      </div>

      <div className="flex flex-col gap-3">
        {Object.entries(recoveryData).map(([muscleId, percent]) => (
          <div 
            key={muscleId} 
            onClick={() => onSelectMuscle?.(muscleId)}
            className="flex flex-col gap-1 cursor-pointer group select-none"
          >
            <div className="flex justify-between items-center text-[11px] font-bold">
              <span className="text-zinc-400 group-hover:text-white transition-colors">{translateMuscle(muscleId)}</span>
              <span className={percent < 50 ? 'text-amber-400' : 'text-emerald-400'}>{percent}%</span>
            </div>
            
            {/* Trilho da Barra de Fadiga */}
            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-950">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${getBarColor(percent)}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}