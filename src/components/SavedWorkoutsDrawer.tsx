import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Play, Trash2, Bookmark } from 'lucide-react';

interface SavedWorkout {
  id: string;
  name: string;
  exerciseIds: string[];
}

interface SavedWorkoutsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWorkout: (exerciseIds: string[]) => void;
}

export default function SavedWorkoutsDrawer({ isOpen, onClose, onStartWorkout }: SavedWorkoutsDrawerProps) {
  const { exercises } = useApp();
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);

  useEffect(() => {
    if (isOpen) {
      const data = localStorage.getItem('fitgym_saved_workouts');
      if (data) {
        try {
          setSavedWorkouts(JSON.parse(data));
        } catch (e) {
          setSavedWorkouts([]);
        }
      } else {
        setSavedWorkouts([]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartWorkout = (workout: SavedWorkout) => {
    onStartWorkout(workout.exerciseIds);
    onClose();
  };

  const handleDeleteWorkout = (id: string, name: string) => {
    const updated = savedWorkouts.filter(w => w.id !== id);
    setSavedWorkouts(updated);
    localStorage.setItem('fitgym_saved_workouts', JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col justify-end transition-all">
      {/* Camada de clique fora para fechar */}
      <div className="flex-1" onClick={onClose}></div>
      
      {/* Corpo da Gaveta */}
      <div className="w-full max-w-md bg-[#0A0A0C] border-t border-[#1A1A1E] rounded-t-3xl p-5 flex flex-col max-h-[80vh] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
              <Bookmark size={16} className="text-amber-400" />
              Treinos Salvos
            </h3>
            <p className="text-xs text-zinc-500">Suas rotinas customizadas</p>
          </div>
          <button 
            onClick={onClose} 
            className="bg-zinc-900 p-2 rounded-full text-zinc-400 border border-zinc-800 active:scale-95 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Lista de Itens com Rolagem */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3 scrollbar-hide">
          {savedWorkouts.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
              <span className="text-2xl">💾</span>
              <p>Nenhum treino customizado salvo ainda.</p>
              <p className="text-[10px] text-zinc-600 max-w-[200px]">Crie um treino do zero clicando em "Criar do Zero" na aba de treino.</p>
            </div>
          ) : (
            savedWorkouts.map((workout) => {
              // Encontra os nomes dos exercícios correspondentes
              const workoutExercisesNames = workout.exerciseIds
                .map(id => exercises.find(ex => ex.id === id)?.name)
                .filter((name): name is string => !!name);

              return (
                <div 
                  key={workout.id} 
                  className="bg-[#121215] border border-[#1F1F24] rounded-xl p-4 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start border-b border-zinc-900 pb-2">
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">{workout.name}</h4>
                      <p className="text-[9px] text-zinc-500 font-semibold uppercase mt-0.5">{workout.exerciseIds.length} exercícios</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartWorkout(workout)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-black p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                        title="Iniciar Treino"
                      >
                        <Play size={12} fill="currentColor" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorkout(workout.id, workout.name)}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-rose-500 p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                        title="Excluir Treino"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Nomes dos exercícios */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">Exercícios</span>
                    <ul className="list-disc list-inside text-[10px] text-zinc-400 font-medium space-y-0.5">
                      {workoutExercisesNames.map((name, idx) => (
                        <li key={idx} className="truncate">{name}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
