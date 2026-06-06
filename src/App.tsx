// src/App.tsx
import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import MuscleModel from './components/MuscleModel';
import { Dumbbell, Clock, Target, MapPin } from 'lucide-react';

export default function App() {
  const { currentWorkout, userPreferences, generateWorkout } = useApp();

  // Força o algoritmo a criar a primeira rotina baseada em fadiga ao abrir o app
  useEffect(() => {
    if (currentWorkout.length === 0) {
      generateWorkout();
    }
  }, []);

  const handleSelectMuscle = (id: string) => {
    console.log("Músculo selecionado no painel:", id);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex justify-center items-start antialiased px-4">
      {/* Container Responsivo com Aspecto de App Mobile */}
      <div className="w-full max-w-md min-h-screen bg-black flex flex-col gap-5 pt-6 pb-10">
        
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

        {/* PÍLULAS DE PREFERÊNCIA DO PRE-TREINO */}
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

        {/* CARD DO TREINO DO DIA */}
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
            className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-black font-bold text-xs tracking-wide uppercase py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)]"
          >
            Iniciar Novo Treino
          </button>
        </section>

        {/* RECHARTS MODEL */}
        <section className="w-full">
          <MuscleModel onSelectMuscle={handleSelectMuscle} />
        </section>

        {/* LISTA DE EXERCÍCIOS DA SESSÃO */}
        <section className="w-full flex flex-col gap-2.5">
          <div className="flex justify-between items-center px-1">
            <span className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">Estrutura da Sessão</span>
            <span className="text-[10px] text-zinc-500">{currentWorkout.length} movimentos</span>
          </div>

          <div className="flex flex-col gap-2">
            {currentWorkout.map((ex, idx) => (
              <div key={ex.id} className="bg-[#0A0A0C] border border-[#1A1A1E] rounded-xl p-3.5 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">{idx + 1}. {ex.name}</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{ex.sets.length} séries de trabalho</p>
                </div>
                <span className="text-[10px] text-zinc-400 font-bold bg-[#141416] border border-[#27272A] px-2 py-1 rounded-md">
                  {ex.muscleId.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}