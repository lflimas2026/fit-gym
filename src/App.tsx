// src/App.tsx
import React, { useEffect, useState } from 'react';
import { useApp } from './context/AppContext';
import MuscleModel from './components/MuscleModel';
import exerciseData from './assets/data/exercises.json';
import { Dumbbell, Clock, Target, MapPin, CheckCircle2, Circle, CheckSquare, RefreshCw, X } from 'lucide-react';

export default function App() {
  const { currentWorkout, userPreferences, generateWorkout, updateSetProgress, finishWorkout, replaceExercise } = useApp();
  
  // Estados para controlar a gaveta de substituição mobile
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [activeMuscleId, setActiveMuscleId] = useState<string | null>(null);

  useEffect(() => {
    if (currentWorkout.length === 0) {
      generateWorkout();
    }
  }, []);

  const openReplacementModal = (exerciseId: string, muscleId: string) => {
    setActiveExerciseId(exerciseId);
    setActiveMuscleId(muscleId);
    setIsModalOpen(true);
  };

  const handleSelectReplacement = (newBaseId: string) => {
    if (activeExerciseId) {
      replaceExercise(activeExerciseId, newBaseId);
      setIsModalOpen(false);
      setActiveExerciseId(null);
      setActiveMuscleId(null);
    }
  };

  // Filtra as opções de troca baseadas estritamente no grupo muscular do exercício ativo
  const replacementOptions = exerciseData.filter(ex => ex.muscleId === activeMuscleId);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex justify-center items-start antialiased selection:bg-emerald-500/30">
      <div className="w-full max-w-md min-h-screen bg-black flex flex-col gap-6 pt-6 pb-32 px-4 relative">
        
        {/* CABEÇALHO */}
        <header className="flex justify-between items-center px-1">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Fit-Gym</h1>
            <p className="text-xs text-zinc-500 font-medium">Seu laboratório de treino</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-emerald-400">
            FL
          </div>
        </header>

        {/* PÍLULAS DE PREFERÊNCIA */}
        <section className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <span className="bg-[#0A0A0C] border border-[#1A1A1E] text-zinc-300 text-[11px] px-3 py-2 rounded-full whitespace-nowrap flex items-center gap-1.5">
            <MapPin size={12} className="text-emerald-500" />
            {userPreferences.location}
          </span>
          <span className="bg-[#0A0A0C] border border-[#1A1A1E] text-zinc-300 text-[11px] px-3 py-2 rounded-full whitespace-nowrap flex items-center gap-1.5">
            <Clock size={12} className="text-emerald-500" />
            {userPreferences.duration} min
          </span>
          <span className="bg-[#0A0A0C] border border-[#1A1A1E] text-zinc-300 text-[11px] px-3 py-2 rounded-full whitespace-nowrap flex items-center gap-1.5">
            <Target size={12} className="text-emerald-500" />
            {userPreferences.goal}
          </span>
        </section>

        {/* CARD CENTRAL */}
        <section className="w-full bg-[#0A0A0C] rounded-2xl p-4 border border-[#1A1A1E] flex flex-col gap-3 shadow-xl">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase">Rotina Recommended</span>
            <h2 className="text-base font-bold text-zinc-100 mt-0.5">Sugestão Baseada em Fadiga</h2>
          </div>

          <div className="flex gap-4 text-zinc-400 text-[11px] border-y border-[#1A1A1E] py-3 my-1">
            <div className="flex items-center gap-1">⏱ <span className="text-zinc-200 font-semibold">{userPreferences.duration} min</span></div>
            <div className="flex items-center gap-1"><Dumbbell size={12} /> <span className="text-zinc-200 font-semibold">{currentWorkout.length} Exercícios</span></div>
          </div>

          <button 
            onClick={generateWorkout}
            className="w-full bg-zinc-900 hover:bg-zinc-850 active:scale-[0.98] text-zinc-200 font-bold text-xs tracking-wide uppercase py-3.5 rounded-xl border border-zinc-800 transition-all"
          >
            Trocar Todo o Treino
          </button>
        </section>

        {/* GRÁFICO */}
        <section className="w-full">
          <MuscleModel onSelectMuscle={(id) => console.log(id)} />
        </section>

        {/* LISTA DE EXERCÍCIOS INTERATIVA */}
        <section className="w-full flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">Estrutura da Sessão</span>
            <span className="text-[10px] text-zinc-500">{currentWorkout.length} movimentos</span>
          </div>

          {currentWorkout.length === 0 ? (
            <div className="bg-[#0A0A0C] border border-[#1A1A1E] rounded-2xl p-8 text-center flex flex-col items-center gap-2">
              <span className="text-2xl">🎉</span>
              <p className="text-sm font-bold text-zinc-200">Treino Concluído!</p>
              <button onClick={generateWorkout} className="text-xs text-emerald-400 font-bold mt-2 underline">Gerar nova rotina</button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {currentWorkout.map((ex, idx) => (
                <div key={ex.id} className="bg-[#0A0A0C] border border-[#1A1A1E] rounded-2xl p-4 flex flex-col gap-3">
                  
                  {/* Cabeçalho com Botão de Trocar Equivalente */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <h4 className="text-sm font-bold text-zinc-100">{idx + 1}. {ex.name}</h4>
                      <p className="text-xs text-zinc-500 mt-0.5 uppercase tracking-wider font-semibold text-[9px] text-emerald-500">{ex.muscleId}</p>
                    </div>
                    
                    <button
                      onClick={() => openReplacementModal(ex.id, ex.muscleId)}
                      className="flex items-center gap-1 bg-[#121215] border border-zinc-800 hover:border-zinc-700 active:scale-[0.95] text-zinc-400 hover:text-zinc-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      <RefreshCw size={10} />
                      Substituir
                    </button>
                  </div>

                  {/* Linhas de Séries */}
                  <div className="flex flex-col gap-2 mt-1 border-t border-zinc-900 pt-3">
                    {ex.sets.map((set, setIdx) => (
                      <div 
                        key={set.id} 
                        className={`flex justify-between items-center p-2 rounded-xl border transition-all ${
                          set.completed ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-[#121215] border-[#1F1F24]'
                        }`}
                      >
                        <span className="text-xs font-bold text-zinc-400 w-8 pl-1">S{setIdx + 1}</span>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="number" inputMode="numeric" value={set.weight}
                              onChange={(e) => updateSetProgress(ex.id, set.id, set.completed, set.reps, Number(e.target.value))}
                              className="w-12 bg-black border border-zinc-800 text-center text-xs font-bold text-zinc-200 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 transition-all"
                            />
                            <span className="text-[10px] text-zinc-500">kg</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <input 
                              type="number" inputMode="numeric" value={set.reps}
                              onChange={(e) => updateSetProgress(ex.id, set.id, set.completed, Number(e.target.value), set.weight)}
                              className="w-10 bg-black border border-zinc-800 text-center text-xs font-bold text-zinc-200 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 transition-all"
                            />
                            <span className="text-[10px] text-zinc-500">reps</span>
                          </div>
                        </div>

                        <button
                          onClick={() => updateSetProgress(ex.id, set.id, !set.completed, set.reps, set.weight)}
                          className={`p-1.5 rounded-lg transition-all ${set.completed ? 'text-emerald-400' : 'text-zinc-600'}`}
                        >
                          {set.completed ? <CheckCircle2 size={19} /> : <Circle size={19} />}
                        </button>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

        {/* GAVETA INFERIOR DE SUBSTITUIÇÃO (BOTTOM SHEET MOBILE NATIVO) */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 z-50 flex flex-col justify-end transition-all animate-fade-in animate-duration-200">
            {/* Clique fora para fechar */}
            <div className="flex-1" onClick={() => setIsModalOpen(false)}></div>
            
            {/* Painel da Gaveta */}
            <div className="w-full max-w-md bg-[#0A0A0C] border-t border-[#1A1A1E] rounded-t-3xl p-5 flex flex-col max-h-[75vh] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
              
              {/* Linha de Título do Modal */}
              <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wide">Substituir Exercício</h3>
                  <p className="text-xs text-zinc-500">Alternativas para o mesmo estímulo muscular</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="bg-zinc-900 p-2 rounded-full text-zinc-400 border border-zinc-800 active:scale-95">
                  <X size={16} />
                </button>
              </div>

              {/* Lista com Rolagem dos Exercícios Equivalentes */}
              <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2 scrollbar-hide">
                {replacementOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelectReplacement(option.id)}
                    className="w-full text-left bg-[#121215] border border-[#1F1F24] hover:border-emerald-500/50 p-4 rounded-xl flex justify-between items-center transition-all active:scale-[0.99]"
                  >
                    <div>
                      <p className="text-xs font-bold text-zinc-200">{option.name}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-wider font-semibold">Equipamento: {option.equipment}</p>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/20 px-2 py-1 rounded-md border border-emerald-500/20">
                      Selecionar
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BOTÃO FLUTUANTE DE CONCLUSÃO */}
        {currentWorkout.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-5 pt-2 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none">
            <div className="w-full max-w-md pointer-events-auto">
              <button
                onClick={finishWorkout}
                className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-black font-black text-xs tracking-wider uppercase py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
              >
                <CheckSquare size={16} strokeWidth={2.5} />
                Finalizar Treino e Registrar Fadiga
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}