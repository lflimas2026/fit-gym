// src/components/ExerciseDetailsModal.tsx
import React from 'react';
import { X, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ExerciseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  equipment: string;
  muscleId: string;
}

export default function ExerciseDetailsModal({ 
  isOpen, 
  onClose, 
  exerciseName, 
  equipment, 
  muscleId 
}: ExerciseDetailsModalProps) {
  
  const { exercises } = useApp();

  if (!isOpen) return null;

  // 🧠 CONEXÃO REAL: Varre a base mestre de 150 exercícios e localiza o link do GIF correspondente na mosca!
  const matchedExercise = exercises.find(ex => ex.name.toLowerCase() === exerciseName.toLowerCase());
  const currentGifUrl = matchedExercise?.gifUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80';

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col justify-end animate-in fade-in duration-200">
      <div className="flex-1" onClick={onClose}></div>
      <div className="w-full max-w-md bg-[#0A0A0C] border-t border-[#1A1A1E] rounded-t-3xl p-5 flex flex-col max-h-[85vh] shadow-2xl overflow-y-auto scrollbar-hide">
        
        {/* HEADER */}
        <div className="flex justify-between items-start pb-4 border-b border-zinc-900 mb-4">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wide">{exerciseName}</h3>
            <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mt-0.5">{muscleId} • {equipment}</p>
          </div>
          <button onClick={onClose} className="bg-zinc-900 p-2 rounded-full text-zinc-400 border border-zinc-800"><X size={14} /></button>
        </div>

        {/* 🎬 ANIMAÇÃO DO GIF DINÂMICO REAL NO TOPO DO MODAL */}
        <div className="w-full h-56 bg-zinc-950 rounded-2xl border border-zinc-900 overflow-hidden relative mb-4 flex items-center justify-center">
          <img 
            src={currentGifUrl} 
            alt={exerciseName} 
            className="h-full object-contain mix-blend-screen"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80';
            }}
          />
        </div>

        {/* INSTRUÇÕES TÉCNICAS */}
        <div className="flex flex-col gap-3 text-xs text-zinc-400 leading-relaxed">
          <span className="text-[10px] font-black tracking-widest uppercase text-zinc-500">Execução Recomendada</span>
          <p>1. Posicione-se corretamente no aparelho mantendo a coluna alinhada e o core ativado.</p>
          <p>2. Execute o movimento de forma controlada, focando na contração do músculo alvo durante a fase concêntrica.</p>
          <p>3. Retorne à posição inicial resistindo ao peso uniformemente. Evite usar o balanço do corpo.</p>
        </div>

      </div>
    </div>
  );
}