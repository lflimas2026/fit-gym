// src/components/ExerciseDetailsModal.tsx
import React from 'react';
import { X, Dumbbell, ShieldAlert, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ExerciseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  equipment: string;
  muscleId: string;
}

export default function ExerciseDetailsModal({ isOpen, onClose, exerciseName, equipment, muscleId }: ExerciseDetailsModalProps) {
  const { exercises } = useApp();

  if (!isOpen) return null;

  // Busca o exercício correspondente no estado global para capturar os dados do ExerciseDB
  const matchedExercise = exercises.find(ex => ex.name === exerciseName);
  
  // Trata as instruções vindas do banco D1 (SQLite salva arrays como String JSON)
  let structuredInstructions: string[] = [];
  if (matchedExercise?.instructions) {
    try {
      structuredInstructions = JSON.parse(matchedExercise.instructions);
    } catch (e) {
      // Fallback caso seja texto puro
      structuredInstructions = [matchedExercise.instructions];
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col justify-end transition-all animate-in fade-in duration-200">
      {/* Área superior clicável para fechar */}
      <div className="flex-1" onClick={onClose}></div>
      
      {/* Corpo da Gaveta Estilo iOS */}
      <div className="w-full max-w-md bg-[#0A0A0C] border-t border-[#1A1A1E] rounded-t-3xl p-5 flex flex-col max-h-[85vh] shadow-[0_-10px_40px_rgba(0,0,0,0.6)] overflow-y-auto scrollbar-hide">
        
        {/* Barra de Arrastar Simbólica */}
        <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-4 shrink-0" />

        {/* Cabeçalho */}
        <div className="flex justify-between items-start pb-4 border-b border-zinc-900 mb-4">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wide pr-4">{exerciseName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
                {muscleId}
              </span>
              <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                <Dumbbell size={10} /> {equipment}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="bg-zinc-900 p-2 rounded-full text-zinc-400 border border-zinc-800 active:scale-95 shrink-0">
            <X size={14} />
          </button>
        </div>

        {/* REPRODUTOR DE MÍDIA ANIMADA (EXERCISEDB) */}
        <div className="w-full bg-[#121215] border border-[#1F1F24] rounded-2xl aspect-video overflow-hidden flex items-center justify-center relative group mb-5">
          {matchedExercise?.gifUrl ? (
            <img 
              src={matchedExercise.gifUrl} 
              alt={exerciseName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-600 text-center px-4">
              <ShieldAlert size={24} className="text-zinc-700" />
              <p className="text-[11px] font-bold uppercase tracking-wide">Animação não carregada</p>
              <p className="text-[9px] max-w-[220px]">Os dados ricos do ExerciseDB aparecerão assim que a ingestão massiva for disparada.</p>
            </div>
          )}
        </div>

        {/* GUIA PASSO A PASSO TÉCNICO */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[11px] font-black tracking-widest text-zinc-400 uppercase">Instruções de Execução</h4>
          
          {structuredInstructions.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">Nenhum guia passo a passo disponível para este movimento.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {structuredInstructions.map((step, stepIdx) => (
                <div key={stepIdx} className="bg-[#121215] border border-[#1F1F24]/60 p-3 rounded-xl flex items-start gap-3">
                  <span className="w-5 h-5 rounded-md bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {stepIdx + 1}
                  </span>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">{step}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dica de Segurança */}
        <div className="mt-6 p-3 rounded-xl bg-amber-950/10 border border-amber-500/10 flex gap-2.5 items-start">
          <CheckCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-zinc-500 leading-normal">
            <strong className="text-zinc-400">Dica do Fit-Gym:</strong> Concentre-se na cadência do movimento (2s na descida, 2s na subida) para maximizar o recrutamento de fibras e a hipertrofia.
          </p>
        </div>

      </div>
    </div>
  );
}