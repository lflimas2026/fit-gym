// src/components/ExerciseDetailsModal.tsx
import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getExercisePromptAndInstructions } from '../utils/workoutHelpers';

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
  
  const { exercises, getOrGenerateExerciseImage, getMuscleFallbackImage } = useApp();

  if (!isOpen) return null;

  // 🧠 Procura ignorando acentos ou diferenças de caixa alta/baixa
  const matchedExercise = exercises.find(ex => ex.name.trim().toLowerCase() === exerciseName.trim().toLowerCase());
  
  // Dynamic AI Image, instructions, and prompt
  let currentImageUrl = '';
  let technicalInstructions = '';
  let generationPrompt = '';

  if (matchedExercise) {
    currentImageUrl = getOrGenerateExerciseImage(
      matchedExercise.id,
      matchedExercise.name,
      matchedExercise.muscleId,
      matchedExercise.equipment
    );
    const details = getExercisePromptAndInstructions(
      matchedExercise.name,
      matchedExercise.muscleId,
      matchedExercise.equipment
    );
    technicalInstructions = details.instructions;
    generationPrompt = details.prompt;
  } else {
    currentImageUrl = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80';
    technicalInstructions = "Mantenha a postura alinhada, execute o movimento concentrando-se na contração do músculo alvo e retorne de forma lenta e controlada.";
    generationPrompt = `Detailed 3D fitness guide illustration of ${exerciseName}.`;
  }

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

        {/* 🎬 IMAGEM DO EXERCÍCIO GERADA POR IA NO TOPO DO MODAL */}
        <div className="w-full h-56 bg-zinc-950 rounded-2xl border border-zinc-900 overflow-hidden relative mb-4 flex items-center justify-center">
          <img 
            src={currentImageUrl} 
            alt={exerciseName} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getMuscleFallbackImage(muscleId);
            }}
          />
        </div>

        {/* INSTRUÇÕES TÉCNICAS */}
        <div className="flex flex-col gap-3 text-xs text-zinc-400 leading-relaxed">
          <span className="text-[10px] font-black tracking-widest uppercase text-zinc-500">Execução Recomendada</span>
          <p className="text-zinc-300 font-semibold bg-zinc-900/40 p-3 rounded-xl border border-zinc-900/80">
            {technicalInstructions}
          </p>
        </div>

        {/* PROMPT DE GERAÇÃO DA IA */}
        <div className="mt-4 p-3 bg-zinc-950 rounded-xl border border-zinc-900 flex flex-col gap-1.5">
          <span className="text-[8px] font-black tracking-widest uppercase text-emerald-400">Prompt de Instrução da IA</span>
          <p className="text-[10px] text-zinc-500 italic leading-relaxed">"{generationPrompt}"</p>
        </div>

      </div>
    </div>
  );
}