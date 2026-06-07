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
  Flame, PlusCircle, Bookmark, Zap, Clock, Sparkles, Plus, Search, Play
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
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);

  // CONTROLES DE INTERFACE
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSplitMenu, setShowSplitMenu] = useState(false);
  
  // CRIAR TREINO DO ZERO
  const [isCreateFromZeroOpen, setIsCreateFromZeroOpen] = useState(false);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [customWorkoutName, setCustomWorkoutName] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ESCOLHER MÚSCULO
  const [isChooseMuscleOpen, setIsChooseMuscleOpen] = useState(false);
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string | null>(null);

  // ADICIONAR EXERCÍCIO AVULSO
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);

  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [activeMuscleId, setActiveMuscleId] = useState<string | null>(null);
  
  const [showTimer, setShowTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(60);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedExerciseDetails, setSelectedExerciseDetails] = useState<{ id: string; name: string; equipment: string; muscleId: string } | null>(null);

  const [musclePercentages, setMusclePercentages] = useState<{ [key: string]: number }>({});

  const musclesList = ['chest', 'back', 'shoulders', 'biceps', 'abs', 'quads', 'hams', 'glutes', 'calves'];
  const fallbackImg = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=100&q=80';

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
        <p className="text-xs font-bold tracking-widest uppercase text-zinc-500">Conectando ao laboratório...</p>
      </div>
    );
  }

  const openReplacementModal = (exerciseId: string, muscleId: string) => {
    setActiveExerciseId(exerciseId);
    setActiveMuscleId(muscleId);
    setIsModalOpen(true);
  };

  const openDetailsModal = (baseId: string, name: string, muscleId: string) => {
    setSelectedExerciseDetails({
      id: baseId,
      name: name,
      muscleId: muscleId,
      equipment: exercises.find(ex => ex.id === baseId)?.equipment || 'machine'
    });
    setIsDetailsOpen(true);
  };

  const handleSelectReplacement = (newBaseId: string) => {
    if (activeExerciseId) {
      replaceExercise(activeExerciseId, newBaseId);
    } else {
      replaceExercise('avulso_add', newBaseId);
    }
    setIsModalOpen(false);
    setIsAddExerciseOpen(false);
    setIsChooseMuscleOpen(false);
    setActiveExerciseId(null);
    setActiveMuscleId(null);
  };

  const handleLocationChange = (type: LocationType) => {
    changeLocationSetting(type);
    setIsWorkoutStarted(false);
    setTimeout(() => { generateWorkout(); }, 50);
  };

  const handleSetToggle = (exerciseId: string, setId: string, currentCompleted: boolean, reps: number, weight: number) => {
    if (!isWorkoutStarted) {
      alert("Toque em INICIAR TREINO no rodapé antes de marcar as séries!");
      return;
    }
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
    setIsWorkoutStarted(false);
    setTimeout(() => { generateWorkout(); }, 50);
  };

  const changeDurationFromTop = (mins: number) => {
    updateUserPlan({ duration: mins });
    setIsWorkoutStarted(false);
    setTimeout(() => { generateWorkout(); }, 50);
  };

  const changeGoalFromTop = (targetGoal: string) => {
    updateUserPlan({ goal: targetGoal });
    setIsWorkoutStarted(false);
    setTimeout(() => { generateWorkout(); }, 50);
  };

  const handleToggleSelectExercise = (id: string) => {
    setSelectedExerciseIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleConfirmSaveWorkoutName = () => {
    if (!customWorkoutName.trim()) return;
    alert(`Treino "${customWorkoutName}" salvo com sucesso!`);
    setShowNameModal(false);
    setIsCreateFromZeroOpen(false);
    setSelectedExerciseIds([]);
    setCustomWorkoutName('');
  };

  const filteredExercisesList = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.muscleId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const finalReplacementOptions = exercises.filter(ex => 
    ex.muscleId.toLowerCase() === activeMuscleId?.toLowerCase()
  );

  const finalChooseMuscleExercises = exercises.filter(ex => 
    ex.muscleId.toLowerCase() === selectedMuscleFilter?.toLowerCase()
  );

  const uniqueWorkoutMuscles = Array.from(new Set(currentWorkout.map(e => e.muscleId).filter(m => m !== 'cardio')));

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex justify-center items-start antialiased">
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
              className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-emerald-400 cursor-pointer"
            >
              FL
            </div>
          </div>
        </header>

        <main className="w-full flex-1">
          {activeTab === 'workout' && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-200">
              
              {/* TREINO DO DIA */}
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
                      className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-[11px] font-bold text-zinc-300 flex items-center gap-1"
                    >
                      <SlidersHorizontal size={11} /> Trocar
                    </button>
                    
                    {showSplitMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-[#121215] border border-[#1F1F24] rounded-xl shadow-2xl z-50 p-1.5">
                        {['Treino Recomendado', 'Dia de Push', 'Dia de Pull', 'Dia de Legs', 'Corpo inteiro'].map((splitOpt) => (
                          <button
                            key={splitOpt}
                            onClick={() => changeSplitFromTop(splitOpt)}
                            className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white"
                          >
                            {splitOpt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* TEMPO */}
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
                        userPlan.duration === mins ? 'bg-[#121215] border-[#1F1F24] text-emerald-400 font-black' : 'bg-transparent border-transparent text-zinc-500'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </section>

              {/* TIPO DE TREINO */}
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
                          isSelected ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/30 font-black' : 'bg-[#0A0A0C] border-[#1A1A1E] text-zinc-500'
                        }`}
                      >
                        {goalOpt}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* MÚSCULOS ALVO */}
              <section className="bg-[#0A0A0C] border border-[#1A1A1E] rounded-2xl p-4 shadow-xl">
                <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase block mb-3">
                  Músculos Alvo de Hoje
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

              {/* LISTA EXERCÍCIOS DO DIA COM IMAGENS INTEGRADAS E BLINDADAS */}
              <section className="w-full flex flex-col gap-3">
                <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase px-0.5">
                  Exercícios do Dia
                </span>
                
                {currentWorkout.map((ex, idx) => {
                  return (
                    <div key={ex.id} className="bg-[#0A0A0C] border border-[#1A1A1E] rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-3">
                        
                        {/* 🖼️ MINIATURA DO MOVIMENTO TOTALMENTE BLINDADA CONTRA COLAPSO DE LAYOUT */}
                        <div className="w-12 h-12 min-w-[48px] min-h-[48px] bg-white rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center p-0.5 flex-shrink-0 shadow-inner">
                          <img 
                        src={ex.gifUrl} 
                        alt={ex.name} 
                        className="w-full h-full object-cover rounded-lg block" 
                        loading="lazy"
                        // Removi o onError para que, se falhar, ele apenas fique vazio e não coloque a imagem dos halteres
/>
/>
                        </div>

                        <div className="flex-1 cursor-pointer group" onClick={() => openDetailsModal(ex.baseExerciseId, ex.name, ex.muscleId)}>
                          <h4 className="text-xs font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                            {idx + 1}. {ex.name}
                            <Info size={11} className="text-zinc-600 shrink-0" />
                          </h4>
                          <p className="text-[9px] mt-0.5 uppercase tracking-wider font-semibold text-emerald-500">{ex.muscleId}</p>
                        </div>
                        
                        <button onClick={() => openReplacementModal(ex.id, ex.muscleId)} className="flex items-center gap-1 bg-[#121215] border border-zinc-800 text-zinc-400 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex-shrink-0">
                          <RefreshCw size={10} /> Substituir
                        </button>
                      </div>

                      <div className="flex flex-col gap-2 mt-1 border-t border-zinc-900 pt-3">
                        {ex.sets.map((set, setIdx) => (
                          <div key={set.id} className={`flex justify-between items-center p-2 rounded-xl border transition-all ${set.completed ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-[#121215] border-[#1F1F24]'}`}>
                            <span className="text-xs font-bold text-zinc-400 w-8 pl-1">S{setIdx + 1}</span>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <input type="number" disabled={!isWorkoutStarted} value={set.weight} onChange={(e) => updateSetProgress(ex.id, set.id, set.completed, set.reps, Number(e.target.value))} className="w-12 bg-black border border-zinc-800 text-center text-xs font-bold text-zinc-200 py-1.5 rounded-lg focus:outline-none" />
                                <span className="text-[10px] text-zinc-500">kg</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <input type="number" disabled={!isWorkoutStarted} value={set.reps} onChange={(e) => updateSetProgress(ex.id, set.id, set.completed, Number(e.target.value), set.weight)} className="w-10 bg-black border border-zinc-800 text-center text-xs font-bold text-zinc-200 py-1.5 rounded-lg focus:outline-none" />
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
                  );
                })}

                <button 
                  onClick={() => setIsAddExerciseOpen(true)}
                  className="w-full bg-[#0A0A0C] border border-dashed border-zinc-800 hover:border-emerald-500/40 p-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-zinc-500 hover:text-emerald-400 transition-all mt-1"
                >
                  <Plus size={14} /> Adicionar Exercício Avulso
                </button>
              </section>

              {/* AMBIENTE */}
              <section className="flex flex-col gap-1.5 px-0.5 pt-1">
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

              {/* 4 CARDS NO FINAL DA TELA */}
              <section className="grid grid-cols-2 gap-2.5 pt-4 border-t border-zinc-900">
                <div onClick={() => setIsChooseMuscleOpen(true)} className="bg-[#0A0A0C] border border-[#1A1A1E] p-3 rounded-xl flex flex-col gap-2 cursor-pointer hover:border-zinc-800 transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950/20 border border-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black">
                    <Flame size={14} />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-wide">Escolher Músculo</h3>
                    <p className="text-[9px] text-zinc-500 mt-0.5">Focar grupo específico</p>
                  </div>
                </div>

                <div onClick={() => { setIsCreateFromZeroOpen(true); setSearchQuery(''); }} className="bg-[#0A0A0C] border border-[#1A1A1E] p-3 rounded-xl flex flex-col gap-2 cursor-pointer hover:border-zinc-800 transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-blue-950/20 border border-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-black">
                    <PlusCircle size={14} />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-wide">Criar do Zero</h3>
                    <p className="text-[9px] text-zinc-500 mt-0.5">Montar bloco manual</p>
                  </div>
                </div>

                <div onClick={() => setActiveTab('log')} className="bg-[#0A0A0C] border border-[#1A1A1E] p-3 rounded-xl flex flex-col gap-2 cursor-pointer hover:border-zinc-800 transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-amber-950/20 border border-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-black">
                    <Bookmark size={14} />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-wide">Treinos Salvos</h3>
                    <p className="text-[9px] text-zinc-500 mt-0.5">Rotinas criadas do zero</p>
                  </div>
                </div>

                <div onClick={() => generateWorkout()} className="bg-[#0A0A0C] border border-[#1A1A1E] p-3 rounded-xl flex flex-col gap-2 cursor-pointer hover:border-zinc-800 transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-purple-950/20 border border-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-black">
                    <Zap size={14} />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-wide">Sob Demanda</h3>
                    <p className="text-[9px] text-zinc-500 mt-0.5">Gerar instantâneo</p>
                  </div>
                </div>
              </section>

            </div>
          )}

          {activeTab === 'recovery' && <RecoveryTab />}
          {activeTab === 'log' && <LogTab />}
          {activeTab === 'body' && <RecordsTab />}
        </main>

        {/* GAVETA: CRIAR TREINO DO ZERO */}
        {isCreateFromZeroOpen && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-bottom duration-200">
            <header className="p-4 border-b border-zinc-900 flex justify-between items-center bg-[#070709]">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wide">Criar Treino do Zero</h3>
                <p className="text-[10px] text-zinc-500">{selectedExerciseIds.length} selecionados</p>
              </div>
              <button onClick={() => setIsCreateFromZeroOpen(false)} className="p-2 bg-zinc-900 rounded-full text-zinc-400 border border-zinc-800"><X size={14} /></button>
            </header>

            <div className="p-3 bg-[#0A0A0C] border-b border-zinc-900">
              <div className="w-full bg-zinc-900 rounded-xl px-3 py-2 flex items-center gap-2 border border-zinc-800">
                <Search size={14} className="text-zinc-500" />
                <input type="text" placeholder="Buscar exercício da base..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent text-xs text-zinc-200 outline-none" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-5 bg-black scrollbar-hide">
              {musclesList.map((muscleGroup) => {
                const groupExercises = exercises.filter(ex => ex.muscleId.toLowerCase() === muscleGroup.toLowerCase());
                const filteredGroup = groupExercises.filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()));
                
                if (filteredGroup.length === 0) return null;

                return (
                  <div key={muscleGroup} className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest pl-1 border-l-2 border-emerald-500">
                      {muscleGroup}
                    </span>
                    
                    <div className="flex flex-col gap-1.5">
                      {filteredGroup.map((ex) => {
                        const isSelected = selectedExerciseIds.includes(ex.id);
                        return (
                          <div 
                            key={ex.id}
                            onClick={() => handleToggleSelectExercise(ex.id)}
                            className={`p-3.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all gap-3 ${
                              isSelected ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-[#0A0A0C] border-[#1A1A1E]'
                            }`}
                          >
                            <div className="w-10 h-10 min-w-[40px] min-h-[40px] bg-white rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center p-0.5 flex-shrink-0">
                              <img src={ex.gifUrl || fallbackImg} alt="" className="w-full h-full object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }} />
                            </div>
                            <span className="text-xs font-bold text-white flex-1">{ex.name}</span>
                            <div className={`w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-700'}`}>
                              {isSelected && <span className="text-[9px] font-black">✓</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-zinc-900 bg-[#070709] pb-8">
              <button 
                onClick={() => setShowNameModal(true)}
                disabled={selectedExerciseIds.length === 0}
                className="w-full bg-emerald-500 text-black py-3.5 rounded-xl font-black text-xs uppercase"
              >
                Salvar Grupo de Exercícios
              </button>
            </div>
          </div>
        )}

        {/* GAVETA: ESCOLHER MÚSCULO ALVO */}
        {isChooseMuscleOpen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex flex-col justify-end animate-in fade-in duration-200">
            <div className="flex-1" onClick={() => setIsChooseMuscleOpen(false)}></div>
            <div className="w-full max-w-md bg-[#0A0A0C] border-t border-[#1A1A1E] rounded-t-3xl p-5 flex flex-col max-h-[80vh] shadow-2xl">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-900 mb-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wide">Escolher Músculo Alvo</h3>
                  <p className="text-[10px] text-zinc-500">Selecione o grupo muscular para injetar exercícios</p>
                </div>
                <button onClick={() => { setIsChooseMuscleOpen(false); setSelectedMuscleFilter(null); }} className="bg-zinc-900 p-2 rounded-full text-zinc-400 border border-zinc-800"><X size={14} /></button>
              </div>

              {!selectedMuscleFilter ? (
                <div className="grid grid-cols-2 gap-2 overflow-y-auto py-2 scrollbar-hide">
                  {musclesList.map((m) => (
                    <button 
                      key={m}
                      onClick={() => setSelectedMuscleFilter(m)}
                      className="p-4 bg-[#121215] border border-[#1F1F24] rounded-xl text-left text-xs font-bold text-zinc-300 hover:border-emerald-500/40 uppercase tracking-wide"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-hide animate-in slide-in-from-right duration-150">
                  <div className="flex justify-between items-center bg-zinc-900/40 p-2 rounded-xl mb-1">
                    <span className="text-[10px] font-black uppercase text-emerald-400 pl-1">Exibindo: {selectedMuscleFilter}</span>
                    <button onClick={() => setSelectedMuscleFilter(null)} className="text-[10px] text-zinc-500 font-bold underline px-2">Voltar</button>
                  </div>
                  {finalChooseMuscleExercises.map((option) => (
                    <button 
                      key={option.id}
                      onClick={() => handleSelectReplacement(option.id)}
                      className="w-full text-left bg-[#121215] border border-[#1F1F24] p-2.5 rounded-xl flex justify-between items-center gap-3"
                    >
                      <div className="w-10 h-10 min-w-[40px] min-h-[40px] bg-white rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center p-0.5 flex-shrink-0">
                        <img src={option.gifUrl || fallbackImg} alt="" className="w-full h-full object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }} />
                      </div>
                      <span className="text-xs font-bold text-zinc-200 flex-1">{option.name}</span>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/10 flex-shrink-0">Injetar</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* GAVETA: SUBSTITUIR EXERCÍCIO */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/85 z-50 flex flex-col justify-end">
            <div className="flex-1" onClick={() => setIsModalOpen(false)}></div>
            <div className="w-full max-w-md bg-[#0A0A0C] border-t border-[#1A1A1E] rounded-t-3xl p-5 flex flex-col max-h-[75vh] shadow-2xl">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-900 mb-3">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wide">Substituir Exercício</h3>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Grupo Alvo: {activeMuscleId}</p>
                </div>
                <button onClick={() => window.dispatchEvent(new CustomEvent('closeModal')) || setIsModalOpen(false)} className="bg-zinc-900 p-2 rounded-full text-zinc-400 border border-zinc-800"><X size={14} /></button>
              </div>
              <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-2 scrollbar-hide">
                {finalReplacementOptions.map((option) => (
                  <button key={option.id} onClick={() => handleSelectReplacement(option.id)} className="w-full text-left bg-[#121215] border border-[#1F1F24] p-4 rounded-xl flex justify-between items-center hover:border-zinc-700 transition-colors gap-3">
                    <div className="w-11 h-11 min-w-[44px] min-h-[44px] bg-white rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center p-0.5 flex-shrink-0">
                      <img src={option.gifUrl || fallbackImg} alt="" className="w-full h-full object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-zinc-200">{option.name}</p>
                      <p className="text-[9px] text-zinc-500 uppercase font-semibold mt-0.5">{option.equipment}</p>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold flex-shrink-0">Trocar</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* GAVETA: ADICIONAR EXERCÍCIO AVULSO COMPLETA (+) */}
        {isAddExerciseOpen && (
          <div className="fixed inset-0 bg-black/85 z-50 flex flex-col justify-end">
            <div className="flex-1" onClick={() => setIsAddExerciseOpen(false)}></div>
            <div className="w-full max-w-md bg-[#0A0A0C] border-t border-[#1A1A1E] rounded-t-3xl p-5 flex flex-col max-h-[75vh] shadow-2xl">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-900 mb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wide">Adicionar Exercício Avulso</h3>
                <button onClick={() => setIsAddExerciseOpen(false)} className="bg-zinc-900 p-2 rounded-full text-zinc-400 border border-zinc-800"><X size={14} /></button>
              </div>
              <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-2 scrollbar-hide">
                {exercises.map((option) => (
                  <button key={option.id} onClick={() => handleSelectReplacement(option.id)} className="w-full text-left bg-[#121215] border border-[#1F1F24] p-3 rounded-xl flex justify-between items-center gap-3">
                    <div className="w-10 h-10 min-w-[40px] min-h-[40px] bg-white rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center p-0.5 flex-shrink-0">
                      <img src={option.gifUrl || fallbackImg} alt="" className="w-full h-full object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-zinc-200">{option.name}</p>
                      <p className="text-[9px] text-zinc-500 uppercase font-semibold mt-0.5">{option.muscleId}</p>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold flex-shrink-0">Adicionar</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODAL DO NOME DO TREINO CUSTOMIZADO */}
        {showNameModal && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#0A0A0C] border border-[#1A1A1E] rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wide">Nome do seu Treino</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Defina um título para a sua lista customizada</p>
              </div>
              <input type="text" placeholder="Ex: Meu Bloco de Hipertrofia" value={customWorkoutName} onChange={(e) => setCustomWorkoutName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-zinc-200 focus:outline-none focus:border-emerald-500" />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={() => setShowNameModal(false)} className="bg-zinc-900 border border-zinc-800 text-zinc-400 py-2.5 rounded-xl text-xs font-bold">Cancelar</button>
                <button onClick={handleConfirmSaveWorkoutName} className="bg-emerald-500 text-black py-2.5 rounded-xl text-xs font-black uppercase tracking-wider">Confirmar</button>
              </div>
            </div>
          </div>
        )}

        {/* OUTROS MODAIS TRANSVERSAIS DE INFRAESTRUTURA */}
        <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
        {isDetailsOpen && selectedExerciseDetails && (
          <ExerciseDetailsModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} exerciseName={selectedExerciseDetails.name} equipment={selectedExerciseDetails.equipment} muscleId={selectedExerciseDetails.muscleId} />
        )}
        {showTimer && <RestTimer initialSeconds={timerDuration} onClose={() => setShowTimer(false)} />}
        <MyPlanDrawer isOpen={isPlanOpen} onClose={() => setIsPlanOpen(false)} />

        {/* BOTÃO PLAY/FINISH NO RODAPÉ DO COCKPIT */}
        {activeTab === 'workout' && currentWorkout.length > 0 && (
          <div className="fixed bottom-16 left-0 right-0 z-40 flex justify-center px-4 pb-3 pt-2 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
            <div className="w-full max-w-md pointer-events-auto">
              {!isWorkoutStarted ? (
                <button 
                  onClick={() => setIsWorkoutStarted(true)}
                  className="w-full bg-emerald-500 text-black font-black text-xs tracking-wider uppercase py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.3)] active:scale-[0.99]"
                >
                  <Play size={14} fill="currentColor" /> Iniciar Treino do Dia
                </button>
              ) : (
                <button 
                  onClick={() => {
                    finishWorkout();
                    setIsWorkoutStarted(false);
                  }} 
                  className="w-full bg-rose-600 text-white font-black text-xs tracking-wider uppercase py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(225,29,72,0.25)] active:scale-[0.99]"
                >
                  <CheckSquare size={16} strokeWidth={2.5} /> Finalizar Treino e Registrar Fadiga
                </button>
              )}
            </div>
          </div>
        )}

        {/* BOTTOM NAV DE 4 ABAS COESAS */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#070709] border-t border-[#16161A] z-40 flex justify-center px-4">
          <div className="w-full max-w-md h-full grid grid-cols-4">
            <button onClick={() => setActiveTab('workout')} className={`flex flex-col items-center justify-center gap-1 ${activeTab === 'workout' ? 'text-emerald-400' : 'text-zinc-600'}`}>
              <Dumbbell size={18} />
              <span className="text-[9px] font-black uppercase tracking-wider">Workout</span>
            </button>
            <button onClick={() => setActiveTab('recovery')} className={`flex flex-col items-center justify-center gap-1 ${activeTab === 'recovery' ? 'text-emerald-400' : 'text-zinc-600'}`}>
              <Activity size={18} />
              <span className="text-[9px] font-black uppercase tracking-wider">Recovery</span>
            </button>
            <button onClick={() => setActiveTab('log')} className={`flex flex-col items-center justify-center gap-1 ${activeTab === 'log' ? 'text-emerald-400' : 'text-zinc-600'}`}>
              <CalendarDays size={18} />
              <span className="text-[9px] font-black uppercase tracking-wider">Log</span>
            </button>
            <button onClick={() => setActiveTab('body')} className={`flex flex-col items-center justify-center gap-1 ${activeTab === 'body' ? 'text-emerald-400' : 'text-zinc-600'}`}>
              <Trophy size={18} />
              <span className="text-[9px] font-black uppercase tracking-wider">Body</span>
            </button>
          </div>
        </nav>

      </div>
    </div>
  );
}