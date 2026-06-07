// src/components/MyPlanDrawer.tsx
import React from 'react';
import { X, Target, Calendar, Clock, Award, Layers, Sparkles, Sliders, ToggleLeft, ToggleRight, Scale, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MyPlanDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MyPlanDrawer({ isOpen, onClose }: MyPlanDrawerProps) {
  const { userPlan, updateUserPlan, exercises } = useApp();

  if (!isOpen) return null;

  const goals = [
    'Ganhar Massa Muscular', 'Definir', 'Ficar mais forte', 
    'Reduzir peso corporal', 'Melhorar condicionamento fisico', 
    'Praticar Powerlifting', 'Praticar levantamento de peso olímpico'
  ];

  const durations = [15, 30, 45, 60, 90];
  const experiences = ['Iniciante', 'Intermediário', 'Avançado'];
  const splits = ['Treino Recomendado', 'Push/Pull/Legs', 'Corpo inteiro', 'Grupos musculares descansados'];
  const variabilities = ['Mais consistente', 'Equilibrado', 'Mais variado'];
  const placements = ['Inicio do treino', 'Fim do treino', 'Treino inteiro'];

  // Filtra exercícios de cardio da base do D1
  const cardioOptions = exercises.filter(ex => 
    ex.muscleId === 'cardio' || 
    ex.name.toLowerCase().includes('esteira') || 
    ex.name.toLowerCase().includes('corrida') || 
    ex.name.toLowerCase().includes('bicicleta')
  );

  // Fallbacks estáticos caso a base principal ainda não tenha carregado
  const finalCardioOptions = cardioOptions.length > 0 ? cardioOptions : [
    { id: 'cardio_1', name: 'Corrida na Esteira' },
    { id: 'cardio_2', name: 'Bicicleta Ergométrica' },
    { id: 'cardio_3', name: 'Pular Corda' },
    { id: 'cardio_4', name: 'Simulador de Escada' }
  ];

  const handleToggleCardioExercise = (id: string) => {
    const active = [...userPlan.cardioExercises];
    if (active.includes(id)) {
      updateUserPlan({ cardioExercises: active.filter(item => item !== id) });
    } else {
      updateUserPlan({ cardioExercises: [...active, id] });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Área externa transparente para fechar ao clicar fora */}
      <div className="flex-1" onClick={onClose} />
      
      {/* Corpo Lateral Estilo Drawer iOS/Android */}
      <div className="w-full max-w-sm bg-[#0A0A0C] border-l border-[#1A1A1E] h-full flex flex-col shadow-2xl overflow-y-auto p-5 scrollbar-hide">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center pb-4 border-b border-zinc-900 mb-5">
          <div>
            <h2 className="text-base font-black text-white tracking-tight">Meu Plano</h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Ajustes da IA Adaptativa</p>
          </div>
          <button onClick={onClose} className="bg-zinc-900 p-2 rounded-full text-zinc-400 border border-zinc-800 active:scale-95">
            <X size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-6 pb-12">
          
          {/* META DO USUÁRIO */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
              <Target size={12} className="text-emerald-500" /> Objetivo Principal
            </label>
            <div className="flex flex-col gap-1.5">
              {goals.map(g => (
                <button
                  key={g} onClick={() => updateUserPlan({ goal: g })}
                  className={`w-full text-left p-3 rounded-xl text-xs font-bold border transition-all ${
                    userPlan.goal === g ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400' : 'bg-[#121215] border-[#1F1F24] text-zinc-400'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* FREQUÊNCIA SEMANAS */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
              <Calendar size={12} className="text-emerald-500" /> Treinos por Semana
            </label>
            <select
              value={userPlan.workoutDaysText}
              onChange={(e) => updateUserPlan({ workoutDaysText: e.target.value })}
              className="w-full bg-[#121215] border border-[#1F1F24] p-3 rounded-xl text-xs font-bold text-zinc-300 outline-none focus:border-emerald-500"
            >
              <option value="2 dias por semana">2 dias por semana</option>
              <option value="3 dias por semana">3 dias por semana</option>
              <option value="4 dias por semana">4 dias por semana</option>
              <option value="5 dias por semana">5 dias por semana</option>
              <option value="Dias específicos (Seg/Qua/Sex)">Segunda, Quarta e Sexta</option>
            </select>
          </div>

          {/* DURAÇÃO DOS TREINOS */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
              <Clock size={12} className="text-emerald-500" /> Duração Alvo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {durations.map(d => (
                <button
                  key={d} onClick={() => updateUserPlan({ duration: d })}
                  className={`py-2 px-1 rounded-xl text-center text-xs font-bold border transition-all ${
                    userPlan.duration === d ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400' : 'bg-[#121215] border-[#1F1F24] text-zinc-500'
                  }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {/* NÍVEL DE EXPERIÊNCIA */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
              <Award size={12} className="text-emerald-500" /> Nível de Experiência
            </label>
            <div className="flex bg-[#121215] border border-[#1F1F24] p-1 rounded-xl justify-between">
              {experiences.map(e => (
                <button
                  key={e} onClick={() => updateUserPlan({ experience: e })}
                  className={`flex-1 py-2 text-center rounded-lg text-[11px] font-bold transition-all ${
                    userPlan.experience === e ? 'bg-[#1D1D22] text-white shadow-sm' : 'text-zinc-500'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* DIVISÃO DE TREINO */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
              <Layers size={12} className="text-emerald-500" /> Divisão de Treino (Split)
            </label>
            <div className="flex flex-col gap-1.5">
              {splits.map(s => (
                <button
                  key={s} onClick={() => updateUserPlan({ splitPreference: s })}
                  className={`w-full text-left p-3 rounded-xl text-xs font-bold border transition-all ${
                    userPlan.splitPreference === s ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400' : 'bg-[#121215] border-[#1F1F24] text-zinc-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* VARIABILIDADE DO EXERCÍCIO */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
              <Sparkles size={12} className="text-emerald-500" /> Variabilidade do Exercício
            </label>
            <div className="flex bg-[#121215] border border-[#1F1F24] p-1 rounded-xl">
              {variabilities.map(v => (
                <button
                  key={v} onClick={() => updateUserPlan({ variability: v })}
                  className={`flex-1 py-2 text-center rounded-lg text-[10px] font-bold transition-all ${
                    userPlan.variability === v ? 'bg-[#1D1D22] text-white shadow-sm' : 'text-zinc-500'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* SÉRIES, CIRCUITOS E INTERVALOS */}
          <div className="flex flex-col gap-3 border-t border-zinc-900 pt-4">
            
            <div className="flex justify-between items-center bg-[#121215] p-3 rounded-xl border border-[#1F1F24]">
              <span className="text-xs font-bold text-zinc-300">Séries de Aquecimento</span>
              <button onClick={() => updateUserPlan({ warmupSets: userPlan.warmupSets ? 0 : 1 })}>
                {userPlan.warmupSets ? <ToggleRight size={28} className="text-emerald-400" /> : <ToggleLeft size={28} className="text-zinc-600" />}
              </button>
            </div>

            <div className="flex justify-between items-center bg-[#121215] p-3 rounded-xl border border-[#1F1F24]">
              <span className="text-xs font-bold text-zinc-300">Circuitos e Supersets</span>
              <button onClick={() => updateUserPlan({ supersetsActive: userPlan.supersetsActive ? 0 : 1 })}>
                {userPlan.supersetsActive ? <ToggleRight size={28} className="text-emerald-400" /> : <ToggleLeft size={28} className="text-zinc-600" />}
              </button>
            </div>

            <div className="flex justify-between items-center bg-[#121215] p-3 rounded-xl border border-[#1F1F24]">
              <span className="text-xs font-bold text-zinc-300">Intervalos Cronometrados</span>
              <button onClick={() => updateUserPlan({ timedIntervals: userPlan.timedIntervals ? 0 : 1 })}>
                {userPlan.timedIntervals ? <ToggleRight size={28} className="text-emerald-400" /> : <ToggleLeft size={28} className="text-zinc-600" />}
              </button>
            </div>

          </div>

          {/* ONDE APLICAR INTERVALOS */}
          {userPlan.timedIntervals === 1 && (
            <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 duration-150">
              <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
                <Sliders size={12} className="text-emerald-500" /> Aplicar Intervalos ao:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {placements.map(p => (
                  <button
                    key={p} onClick={() => updateUserPlan({ intervalPlacement: p })}
                    className={`py-2 text-[10px] font-black rounded-lg text-center border transition-all uppercase tracking-wider ${
                      userPlan.intervalPlacement === p ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400' : 'bg-[#121215] border-[#1F1F24] text-zinc-500'
                    }`}
                  >
                    {p.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PREFERÊNCIAS UNIDADE */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
              <Scale size={12} className="text-emerald-500" /> Unidades de Medida
            </label>
            <div className="grid grid-cols-2 bg-[#121215] p-1 rounded-xl border border-[#1F1F24]">
              {(['kg', 'lb'] as const).map(u => (
                <button
                  key={u} onClick={() => updateUserPlan({ weightUnit: u })}
                  className={`py-1.5 text-center font-black uppercase text-xs rounded-lg transition-all ${
                    userPlan.weightUnit === u ? 'bg-emerald-500 text-black' : 'text-zinc-500'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* CONGELAMENTO CARDIO */}
          <div className="flex flex-col gap-3 border-t border-zinc-900 pt-4">
            <div className="flex justify-between items-center bg-[#121215] p-3 rounded-xl border border-[#1F1F24]">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Heart size={14} className="text-rose-500 animate-pulse" /> Cardio
              </span>
              <button onClick={() => updateUserPlan({ cardioActive: userPlan.cardioActive ? 0 : 1 })}>
                {userPlan.cardioActive ? <ToggleRight size={28} className="text-emerald-400" /> : <ToggleLeft size={28} className="text-zinc-600" />}
              </button>
            </div>

            {userPlan.cardioActive === 1 && (
              <div className="flex flex-col gap-4 animate-in slide-in-from-top-3 duration-200">
                
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Opção de Momento</span>
                  <div className="grid grid-cols-2 gap-2">
                    {['Inicio do treino', 'Fim do treino'].map(p => (
                      <button
                        key={p} onClick={() => updateUserPlan({ cardioPlacement: p })}
                        className={`py-2 text-xs font-bold rounded-xl text-center border transition-all ${
                          userPlan.cardioPlacement === p ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400' : 'bg-[#121215] border-[#1F1F24] text-zinc-500'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Selecionar Exercícios</span>
                  <div className="flex flex-col gap-1.5 bg-[#121215] border border-[#1F1F24] rounded-xl p-2 max-h-40 overflow-y-auto scrollbar-hide">
                    {finalCardioOptions.map(option => {
                      const isChecked = userPlan.cardioExercises.includes(option.id);
                      return (
                        <div 
                          key={option.id}
                          onClick={() => handleToggleCardioExercise(option.id)}
                          className="flex items-center justify-between p-2.5 rounded-lg cursor-pointer hover:bg-zinc-900 transition-colors"
                        >
                          <span className="text-xs text-zinc-300 font-medium">{option.name}</span>
                          <div className={`w-4 h-4 border rounded flex items-center justify-center transition-all ${
                            isChecked ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-700'
                          }`}>
                            {isChecked && <span className="text-[9px] font-black">✓</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}