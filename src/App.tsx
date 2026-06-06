// src/App.tsx
import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import MuscleModel from './components/MuscleModel';
import { Dumbbell, Clock, Target, MapPin, CheckCircle2, Circle, CheckSquare } from 'lucide-react';

export default function App() {
  const { currentWorkout, userPreferences, generateWorkout, updateSetProgress, finishWorkout } = useApp();

  useEffect(() => {
    if (currentWorkout.length === 0) {
      generateWorkout();
    }
  }, []);

  const handleSelectMuscle = (id: string) => {
    console.log("Músculo inspecionado:", id);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex justify-center items-start antialiased selection:bg-emerald-500/30">
      {/* Container Mobile-First Estrito */}
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
            <span className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase">Rotina Recomendada</span>
            <h2 className="text-base font-bold text-zinc-100 mt-0.5">Sugestão Baseada em Fadiga</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Músculos mais recuperados e prontos para o estímulo</p>
          </div>

          <div className="flex gap-4 text-zinc-400 text-[11px] border-y border-[#1A1A1E] py-3 my-1">
            <div className="flex items-center gap-1">⏱ <span className="text-zinc-200 font-semibold">{userPreferences.duration} min</span></div>
            <div className="flex items-center gap-1"><Dumbbell size={12} /> <span className="text-zinc-200 font-semibold">{currentWorkout.length} Exercícios</span></div>
          </div>

          <button 
            onClick={generateWorkout}
            className="w-full bg-zinc-900 hover:bg-zinc-850 active:scale-[0.98] text-zinc-200 font-bold text-xs tracking-wide uppercase py-3.5 rounded-xl border border-zinc-800 transition-all"
          >
            Trocar / Reconfigurar Sessão
          </button>
        </section>

        {/* GRÁFICO RECHARTS */}
        <section className="w-full">
          <MuscleModel onSelectMuscle={handleSelectMuscle} />
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
              <p className="text-xs text-zinc-500 max-w-[240px]">Seu gráfico de fadiga foi atualizado. Toque no botão acima para gerar uma nova rotina baseada no descanso.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {currentWorkout.map((ex, idx) => (
                <div key={ex.id} className="bg-[#0A0A0C] border border-[#1A1A1E] rounded-2xl p-4 flex flex-col gap-3 transition-all">
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100">{idx + 1}. {ex.name}</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">{ex.sets.length} séries planejadas</p>
                    </div>
                    <span className="text-[9px] text-zinc-400 font-extrabold bg-[#141416] border border-[#27272A] px-2 py-1 rounded-md uppercase tracking-wider">
                      {ex.muscleId}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 mt-1 border-t border-zinc-900 pt-3">
                    {ex.sets.map((set, setIdx) => (
                      <div 
                        key={set.id} 
                        className={`flex justify-between items-center p-2 rounded-xl border transition-all ${
                          set.completed 
                            ? 'bg-emerald-950/20 border-emerald-500/30' 
                            : 'bg-[#121215] border-[#1F1F24]'
                        }`}
                      >
                        <span className="text-xs font-bold text-zinc-400 w-8 pl-1">
                          Série {setIdx + 1}
                        </span>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="number" 
                              inputMode="numeric"
                              value={set.weight}
                              onChange={(e) => updateSetProgress(ex.id, set.id, set.completed, set.reps, Number(e.target.value))}
                              className="w-12 bg-black border border-zinc-800 text-center text-xs font-bold text-zinc-200 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 transition-all"
                            />
                            <span className="text-[10px] text-zinc-500 font-medium">kg</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <input 
                              type="number" 
                              inputMode="numeric"
                              value={set.reps}
                              onChange={(e) => updateSetProgress(ex.id, set.id, set.completed, Number(e.target.value), set.weight)}
                              className="w-10 bg-black border border-zinc-800 text-center text-xs font-bold text-zinc-200 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 transition-all"
                            />
                            <span className="text-[10px] text-zinc-500 font-medium">reps</span>
                          </div>
                        </div>

                        <button
                          onClick={() => updateSetProgress(ex.id, set.id, !set.completed, set.reps, set.weight)}
                          className={`p-1.5 rounded-lg transition-all ${
                            set.completed ? 'text-emerald-400' : 'text-zinc-600 hover:text-zinc-400'
                          }`}
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

        {/* BARRA INFERIOR FIXA FLUTUANTE (DOCK ESTILO APP NATIVO) */}
        {currentWorkout.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-5 pt-2 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none">
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