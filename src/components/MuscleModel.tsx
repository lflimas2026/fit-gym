// src/components/MuscleModel.tsx
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { calculateRecovery, getFitbodColor } from '../utils/workoutHelpers';
import { useApp } from '../context/AppContext';

interface MuscleModelProps {
  onSelectMuscle: (id: string) => void;
}

export default function MuscleModel({ onSelectMuscle }: MuscleModelProps) {
  const { workoutHistory } = useApp();
  
  // Lista de mapeamento dos grupos musculares controlados pelo app
  const staticMuscles = [
    { id: 'chest',     name: 'Peito (Peitoral)' },
    { id: 'back',      name: 'Costas (Dorsais)' },
    { id: 'shoulders', name: 'Ombros (Deltoides)' },
    { id: 'biceps',    name: 'Braços (Bíceps/Tríceps)' },
    { id: 'abs',       name: 'Core (Abdômen)' },
    { id: 'quads',     name: 'Quadríceps (Frente)' },
    { id: 'hams',      name: 'Posteriores (Atrás)' },
    { id: 'glutes',    name: 'Glúteos' },
    { id: 'calves',    name: 'Panturrilhas' },
  ];

  // Recalcula o percentual e a cor de cada músculo sempre que o histórico mudar
  const chartData = useMemo(() => {
    return staticMuscles.map(muscle => {
      const recoveryPercentage = calculateRecovery(muscle.id, workoutHistory);
      return {
        ...muscle,
        recovery: recoveryPercentage,
        color: getFitbodColor(recoveryPercentage)
      };
    });
  }, [workoutHistory]);

  const handleBarClick = (state: any) => {
    if (state && state.activePayload && onSelectMuscle) {
      onSelectMuscle(state.activePayload[0].payload.id);
    }
  };

  return (
    <div className="w-full bg-[#0A0A0C] rounded-2xl p-4 border border-[#1A1A1E]">
      <div className="mb-4 flex justify-between items-center px-1">
        <span className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">
          Recuperação Muscular
        </span>
        <span className="text-[10px] text-zinc-500 italic">
          Toque na barra para inspecionar
        </span>
      </div>

      <div className="w-full h-[290px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: -15, bottom: 0 }} onClick={handleBarClick}>
            <YAxis dataKey="name" type="category" tick={{ fill: '#A1A1AA', fontSize: 11 }} axisLine={false} tickLine={false} width={135} />
            <XAxis type="number" domain={[0, 100]} hide />
            <Tooltip
              cursor={{ fill: '#16161A', opacity: 0.4 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#121214] border border-[#27272A] px-3 py-1.5 rounded-lg text-[11px] text-zinc-200 shadow-2xl">
                      Status: <span className="font-bold" style={{ color: data.color }}>{data.recovery}% pronto</span>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="recovery" radius={[4, 4, 4, 4]} barSize={8} className="cursor-pointer">
              {chartData.map((entry) => (
                <Cell 
                  key={entry.id} 
                  fill={entry.color}
                  style={{
                    filter: `drop-shadow(0px 0px 3px ${entry.color}22)`,
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}