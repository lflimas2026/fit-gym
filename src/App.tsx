// src/App.tsx
import React, { useEffect, useState } from 'react';
import { useApp, LocationType } from './context/AppContext';
import HistoryDrawer from './components/HistoryDrawer';
import RestTimer from './components/RestTimer';
import ExerciseDetailsModal from './components/ExerciseDetailsModal';
import MyPlanDrawer from './components/MyPlanDrawer';

import RecoveryTab from './components/RecoveryTab';
import LogTab from './components/LogTab';
import RecordsTab from './components/RecordsTab';

import { 
  Dumbbell, MapPin, CheckCircle2, Circle, CheckSquare, RefreshCw, X, 
  History, Info, Trophy, Activity, CalendarDays, SlidersHorizontal,
  Flame, PlusCircle, Bookmark, Zap, Clock, Sparkles
} from 'lucide-react';

export default function App() {
  const { 
    currentWorkout, 
    userPreferences, 
    exercises, 
    loading, 
    userPlan,
    updateUserPlan,
    generateWorkout, 
    updateSetProgress, 
    finishWorkout, 
    replaceExercise, 
    changeLocationSetting 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'workout' | 'recovery' | 'log' | 'body'>('workout');

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSplitMenu, setShowSplitMenu] = useState(false);
  
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [activeMuscleId, setActiveMuscleId] = useState<string | null>(null);
  
  const [showTimer, setShowTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(60);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedExerciseDetails, setSelectedExerciseDetails] = useState<{ name: string; equipment: string; muscleId: string } | null>(null);

  const [musclePercentages, setMusclePercentages] = useState<{ [key: string]: number }>({});

  // Carrega as porcentagens de fadiga reais do D1 para exibir na aba Workout
  useEffect(() => {
    async function loadSummaryData() {
      try {
        const res = await fetch('/api/muscles-recovery');
        if (res.ok) setMusclePercentages(await res.json());
      } catch (e) {
        console.error(e);
      }
    }
    if (activeTab === 'workout') {
      loadSummaryData();
    }
  }, [activeTab, currentWorkout]);

  useEffect(() => {
    if (!loading && currentWorkout.length === 0 && exercises.length > 0) {
      generateWorkout();
    }
  }, [loading, exercises]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-zinc-400 flex flex-col justify-center items-center gap-3">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold tracking-widest uppercase text-zinc-500">Conectando ao Cloudflare D1...</p>
      </div>
    );
  }

  const openReplacementModal = (exerciseId: string, muscleId: string) => {
    setActiveExerciseId(exerciseId);
    setActiveMuscleId(muscleId);
    setIsModalOpen(true);
  };

  const openDetailsModal = (baseId: string, name: string, muscleId: string) => {
    const matchedEx = exercises.find(ex => ex.id === baseId);
    setSelectedExerciseDetails({
      name: name,
      muscleId: muscleId,
      equipment: matchedEx ? matchedEx.equipment : 'bodyweight'
    });
    setIsDetailsOpen(true);
  };

  const handleSelectReplacement = (newBaseId: string) => {
    if (activeExerciseId) {
      replaceExercise(activeExerciseId, newBaseId);
      setIsModalOpen(false);
      setActiveExerciseId(null);
      setActiveMuscleId(null);
    }
  };

  const handleLocationChange = (type: LocationType) => {
    changeLocationSetting(type);
    setTimeout(() => { generateWorkout(); }, 50);
  };

  const handleSetToggle = (exerciseId: string, setId: string, currentCompleted: boolean, reps: number, weight: number) => {
    const nextCompletedState = !currentCompleted;
    updateSetProgress(exerciseId, setId, nextCompletedState, reps, weight);
    if (nextCompletedState) {
      setShowTimer(false);
      setTimeout(() => {
        setTimerDuration(60);
        setShowTimer(true);
      }, 50);
    }
  };

  const changeSplitFromTop = (newSplit: string) => {
    updateUserPlan({ splitPreference: newSplit });
    setShowSplitMenu(false);
    setTimeout(() => { generateWorkout(); }, 50);
  };

  const changeDurationFromTop = (mins: number) => {
    updateUserPlan({ duration: mins });
    setTimeout(() => { generateWorkout(); }, 50);
  };

  const changeGoalFromTop = (targetGoal: string) => {
    updateUserPlan({ goal: targetGoal });
    setTimeout(() => { generateWorkout(); }, 50);
  };

  const replacementOptions = exercises.filter(ex => {
    if (ex.muscleId !== activeMuscleId) return false;
    if (userPreferences.location === 'Apenas Halteres') return ex.equipment === 'dumbbell' || ex.equipment === 'bodyweight';
    if (userPreferences.location === 'Peso Corporal') return ex.equipment === 'bodyweight';
    return true;
  });

  const uniqueWorkoutMuscles = Array.from(new Set(currentWorkout.map(e => e.muscleId).filter(m => m !== 'cardio')));

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex justify-center items-start antialiased selection:bg-emerald-500/30">
      <div className="w-full max-w-md min-h-screen bg-black flex flex-col gap-6 pt-6 pb-32 px-4 relative">
        
        {/* HEADER */}
        <header className="flex justify-between items-center px-1">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Fit-Gym</h1>
            <p className="text-xs text-zinc-500 font-medium">Seu laboratório de treino</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="w-9 h-9 rounded-full bg-[#0A0A0C] border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-all shadow-md"
            >
              <History size={16} />
            </button>
            <div 
              onClick={() => setIsPlanOpen(true)}
              className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-emerald-400 cursor-pointer hover:border-emerald-500 transition-all active:scale-95 shadow-md"
            >
              FL
            </div>
          </div>
        </header>

        {/* MÁQUINA DE ESTADOS DAS ABAS */}
        <main className="w-full flex-1">
          {activeTab === 'workout' && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-200">
              
              {/* TREINO DO DIA E MENU FLUTUANTE DE TROCA DE SPLIT */}
              <section className="bg-[#0A0A0C] border border-[#1A1A1E] rounded-2xl p-4 shadow-xl relative">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/10">
                      Treino do Dia
                    </span>
                    <h2 className="text-sm font-black text-zinc-100 mt-1.5 uppercase tracking-wide">
                      {userPlan.splitPreference}
                    </h2>
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setShowSplitMenu(!showSplitMenu)}
                      className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-[11px] font-bold text-zinc-300 flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <SlidersHorizontal size={11} /> Trocar
                    </button>
                    
                    {showSplitMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-[#121215] border border-[#1F1F24] rounded-xl shadow-2xl z-50 p-1.5">
                        {['Treino Recomendado', 'Dia de Push (Peito/Ombros)', 'Dia de Pull (Costas/Bíceps)', 'Dia de Legs (Pernas)', 'Corpo inteiro'].map((splitOpt) => (
                          <button
                            key={splitOpt}
                            onClick={() => changeSplitFromTop(splitOpt)}
                            className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
                          >
                            {splitOpt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* CARDS DE CUSTOMIZAÇÃO RÁPIDA */}
              <section className="grid grid-cols-2 gap-2.5">
                <div onClick={() => { if (currentWorkout[0]) openReplacementModal(currentWorkout[0].id, currentWorkout[0].muscleId); }} className="bg-[#0A0A0C] border border-[#1A1A1E] p-3 rounded-xl flex flex-col gap-2 cursor-pointer hover:border-zinc-800 transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950/20 border border-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                    <Flame size={14} />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-wide">Escolher Músculo</h3>
                    <p className="text-[9px] text-zinc-500 mt-0.5">Focar grupo específico</p>
                  </div>
                </div>

                <div onClick={() => setIsPlanOpen(true)} className="bg-[#0A0A0C] border border-[#1A1A1E] p-3 rounded-xl flex flex-col gap-2 cursor-pointer hover:border-zinc-800 transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-blue-950/20 border border-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-black transition-all">
                    <PlusCircle size={14} />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-wide">Criar do Zero</h3>
                    <p className="text-[9px] text-zinc-500 mt-0.5">Montar bloco manual</p>
                  </div>
                </div>

                <div onClick={() => setActiveTab('log')} className="bg-[#0A0A0C] border border-[#1A1A1E] p-3 rounded-xl flex flex-col gap-2 cursor-pointer hover:border-zinc-800 transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-amber-950/20 border border-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-all">
                    <Bookmark size={14} />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-wide">Treinos Salvos</h3>
                    <p className="text-[9px] text-zinc-500 mt-0.5">Rotinas criadas do zero</p>
                  </div>
                </div>

                <div onClick={() => generateWorkout()} className="bg-[#0A0A0C] border border-[#1A1A1E] p-3 rounded-xl flex flex-col gap-2 cursor-pointer hover:border-zinc-800 transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-purple-950/20 border border-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-all">
                    <Zap size={14} />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-wide">Sob Demanda</h3>
                    <p className="text-[9px] text-zinc-500 mt-0.5">Gerar instantâneo</p>
                  </div>
                </div>
              </section>

              {/* SELETOR DE TEMPO DISPONÍVEL */}
              <section className="flex flex-col gap-1.5 px-0.5">
                <label className="text-[9px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1">
                  <Clock size={10} /> Quanto tempo tenho disponível
                </label>
                <div className="grid grid-cols-5 gap-1.5 bg-[#0A0A0C] border border-[#1A1A1E] p-1 rounded-xl">
                  {[15, 30, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => changeDurationFromTop(mins)}
                      className={`py-2 rounded-lg text-center text-[10px] font-bold border transition-all ${
                        userPlan.duration === mins 
                          ? 'bg-[#121215] border-[#1F1F24] text-emerald-400 font-black' 
                          : 'bg-transparent border-transparent text-zinc-500'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </section>

              {/* SELETOR DE TIPO DE TREINO */}
              <section className="flex flex-col gap-1.5 px-0.5">
                <label className="text-[9px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1">
                  <Sparkles size={10} /> Tipo de Treino
                </label>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  {[
                    'Ficar mais forte', 'Ganhar Massa Muscular', 'Definir', 
                    'Reduzir peso corporal', 'Melhorar condicionamento fisico', 
                    'Praticar Powerlifting', 'Praticar levantamento de peso olímpico'
                  ].map((goalOpt) => {
                    const isSelected = userPlan.goal === goalOpt;
                    return (
                      <button
                        key={goalOpt}
                        onClick={() => changeGoalFromTop(goalOpt)}
                        className={`text-[10px] px-3.5 py-2 rounded-xl whitespace-nowrap font-bold transition-all border ${
                          isSelected 
                            ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/30 font-black' 
                            : 'bg-[#0A0A0C] border-[#1A1A1E] text-zinc-500'
                        }`}
                      >
                        {goalOpt}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* MÚSCULOS ALVO E PORCENTAGEM DE DESCANSO REAL DO D1 */}
              <section className="bg-[#0A0A0C] border border-[#1A1A1E] rounded-2xl p-4 shadow-xl">
                <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase block mb-3">
                  Músculos Alvo e Descanso
                </span>
                <div className="flex flex-col gap-2.5">
                  {uniqueWorkoutMuscles.map((mId) => {
                    const pct = musclePercentages[mId] ?? 100;
                    return (
                      <div key={mId} className="flex justify-between items-center text-xs">
                        <span className="font-bold text-zinc-300 capitalize">{mId}</span>
                        <div className="flex items-center gap-3 w-2/3">
                          <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${pct < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={`text-[10px] font-bold w-12 text-right ${pct < 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {pct}% OK
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* SELETOR DE LOCALIZAÇÃO */}
              <section className="flex flex-col gap-1.5 px-0.5">
                <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">Ambiente</span>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {(['Academia Completa', 'Apenas Halteres', 'Peso Corporal'] as LocationType[]).map((loc) => {
                    const isSelected = userPreferences.location === loc;
                    return (
                      <button
                        key={loc}
                        onClick={() => handleLocationChange(loc)}
                        className={`text-[10px] px-4 py-2.5 rounded-full whitespace-nowrap flex items-center gap-1.5 font-bold transition-all border ${
                          isSelected ? 'bg-zinc-900 text-white border-zinc-700' : 'bg-[#0A0A0C] border-[#1A1A1E] text-zinc-500'
                        }`}
                      >
                        <MapPin size={10} />
                        {loc}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* EXERCÍCIOS DO DIA */}
              <section className="w-full flex flex-col gap-3">
                <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase px-0.5">
                  Exercícios do Dia
                </span>
                
                {currentWorkout.map((ex, idx) => (
                  <div key={ex.id} className="bg-[#0A0A0C] border border-[#1A1A1E] rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2 cursor-pointer group select-none" onClick={() => openDetailsModal(ex.baseExerciseId, ex.name, ex.muscleId)}>
                        <h4 className="text-xs font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                          {idx + 1}. {ex.name}
                          <Info size={11} className="text-zinc-600 group-hover:text-emerald-500 shrink-0" />
                        </h4>
                        <p className="text-[9px] mt-0.5 uppercase tracking-wider font-semibold text-emerald-500">{ex.muscleId}</p>
                      </div>
                      <button onClick={() => openReplacementModal(ex.id, ex.muscleId)} className="flex items-center gap-1 bg-[#121215] border border-zinc-800 text-zinc-400 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all active:scale-95">
                        <RefreshCw size={10} /> Substituir
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 mt-1 border-t border-zinc-900 pt-3">
                      {ex.sets.map((set, setIdx) => (
                        <div key={set.id} className={`flex justify-between items-center p-2 rounded-xl border transition-all ${set.completed ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-[#121215] border-[#1F1F24]'}`}>
                          <span className="text-xs font-bold text-zinc-400 w-8 pl-1">S{setIdx + 1}</span>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <input type="number" inputMode="numeric" value={set.weight} onChange={(e) => updateSetProgress(ex.id, set.id, set.completed, set.reps, Number(e.target.value))} className="w-12 bg-black border border-zinc-800 text-center text-xs font-bold text-zinc-200 py-1.5 rounded-lg focus:outline-none" />
                              <span className="text-[10px] text-zinc-500">kg</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <input type="number" inputMode="numeric" value={set.reps} onChange={(e) => updateSetProgress(ex.id, set.id, set.completed, Number(e.target.value), set.weight)} className="w-10 bg-black border border-zinc-800 text-center text-xs font-bold text-zinc-200 py-1.5 rounded-lg focus:outline-none" />
                              <span className="text-[10px] text-zinc-500">reps</span>
                            </div>
                          </div>
                          <button onClick={() => handleSetToggle(ex.id, set.id, set.completed, set.reps, set.weight)} className={`p-1.5 rounded-lg ${set.completed ? 'text-emerald-400' : 'text-zinc-600'}`}>
                            {set.completed ? <CheckCircle2 size={19} /> : <Circle size={19} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>

            </div>
          )}

          {activeTab === 'recovery' && <RecoveryTab />}
          {activeTab === 'log' && <LogTab />}
          {activeTab === 'body' && <RecordsTab />}
        </main>

        {/* MODAL DE SUBSTITUIÇÃO */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 z-50 flex flex-col justify-end transition-all">
            <div className="flex-1" onClick={() => setIsModalOpen(false)}></div>
            <div className="w-full max-w-md bg-[#0A0A0C] border-t border-[#1A1A1E] rounded-t-3xl p-5 flex flex-col max-h-[75vh] shadow-2xl">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                <h3 className="text-sm font-black text-white uppercase tracking-wide">Substituir Exercício</h3>
                <button onClick={() => setIsModalOpen(false)} className="bg-zinc-900 p-2 rounded-full text-zinc-400 border border-zinc-800 active:scale-95"><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2 scrollbar-hide">
                {replacementOptions.map((option) => (
                  <button key={option.id} onClick={() => handleSelectReplacement(option.id)} className="w-full text-left bg-[#121215] border border-[#1F1F24] p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-zinc-200">{option.name}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-wider font-semibold">Equipamento: {option.equipment}</p>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/20 px-2 py-1 rounded-md border border-emerald-500/20">Selecionar</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODAIS TRANSVERSAIS */}
        <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
        {isDetailsOpen && selectedExerciseDetails && (
          <ExerciseDetailsModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} exerciseName={selectedExerciseDetails.name} equipment={selectedExerciseDetails.equipment} muscleId={selectedExerciseDetails.muscleId} />
        )}
        {showTimer && <RestTimer initialSeconds={timerDuration} onClose={() => setShowTimer(false)} />}
        <MyPlanDrawer isOpen={isPlanOpen} onClose={() => setIsPlanOpen(false)} />

        {/* BOTÃO FLUTUANTE DE FINALIZAÇÃO */}
        {activeTab === 'workout' && currentWorkout.length > 0 && (
          <div className="fixed bottom-16 left-0 right-0 z-40 flex justify-center px-4 pb-3 pt-2 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
            <div className="w-full max-w-md pointer-events-auto">
              <button onClick={finishWorkout} className="w-full bg-emerald-500 text-black font-black text-xs tracking-wider uppercase py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.25)]">
                <CheckSquare size={16} strokeWidth={2.5} /> Finalizar Treino e Registrar Fadiga
              </button>
            </div>
          </div>
        )}

        {/* BARRA DE NAVEGAÇÃO INFERIOR FIXA */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#070709] border-t border-[#16161A] z-40 flex justify-center px-4">
          <div className="w-full max-w-md h-full grid grid-cols-4">
            <button onClick={() => setActiveTab('workout')} className={`flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'workout' ? 'text-emerald-400' : 'text-zinc-600'}`}>
              <Dumbbell size={18} />
              <span className="text-[9px] font-black uppercase tracking-wider">Workout</span>
            </button>
            <button onClick={() => setActiveTab('recovery')} className={`flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'recovery' ? 'text-emerald-400' : 'text-zinc-600'}`}>
              <Activity size={18} />
              <span className="text-[9px] font-black uppercase tracking-wider">Recovery</span>
            </button>
            <button onClick={() => setActiveTab('log')} className={`flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'log' ? 'text-emerald-400' : 'text-zinc-600'}`}>
              <CalendarDays size={18} />
              <span className="text-[9px] font-black uppercase tracking-wider">Log</span>
            </button>
            <button onClick={() => setActiveTab('body')} className={`flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'body' ? 'text-emerald-400' : 'text-zinc-600'}`}>
              <Trophy size={18} />
              <span className="text-[9px] font-black uppercase tracking-wider">Body</span>
            </button>
          </div>
        </nav>

      </div>
    </div>
  );
}