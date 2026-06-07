// src/context/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { calculateRecovery } from '../utils/workoutHelpers';

export interface WorkoutLog {
  muscleId: string;
  date: string; 
  intensity: 'heavy' | 'medium' | 'light';
}

export interface WorkoutExercise {
  id: string;
  baseExerciseId: string;
  name: string;
  muscleId: string;
  sets: { id: string; reps: number; weight: number; completed: boolean }[];
}

export interface BaseExercise {
  id: string;
  name: string;
  muscleId: string;
  equipment: string;
  gifUrl?: string;       
  instructions?: string; 
}

export interface UserPlan {
  goal: string;
  workoutDaysText: string;
  duration: number;
  experience: string;
  splitPreference: string;
  variability: string;
  warmupSets: number; 
  supersetsActive: number; 
  timedIntervals: number; 
  intervalPlacement: string;
  weightUnit: 'kg' | 'lb';
  cardioActive: number; 
  cardioPlacement: string;
  cardioExercises: string[];
}

export type LocationType = 'Academia Completa' | 'Apenas Halteres' | 'Peso Corporal';

interface AppContextType {
  exercises: BaseExercise[];
  workoutHistory: WorkoutLog[];
  currentWorkout: WorkoutExercise[];
  userPreferences: { location: LocationType };
  userPlan: UserPlan;
  loading: boolean;
  generateWorkout: () => void;
  updateSetProgress: (exerciseId: string, setId: string, completed: boolean, reps?: number, weight?: number) => void;
  finishWorkout: () => void;
  replaceExercise: (currentExerciseId: string, newExerciseBaseId: string) => void;
  changeLocationSetting: (newLocation: LocationType) => void;
  updateUserPlan: (newPlan: Partial<UserPlan>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [exercises, setExercises] = useState<BaseExercise[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutExercise[]>([]);
  const [rawDbWorkouts, setRawDbWorkouts] = useState<any[]>([]); // Cache local para histórico detalhado de cargas

  const [userPreferences, setUserPreferences] = useState<{ location: LocationType }>(() => {
    const saved = localStorage.getItem('fitgym_preferences');
    return saved ? JSON.parse(saved) : { location: 'Academia Completa' };
  });

  const [userPlan, setUserPlan] = useState<UserPlan>({
    goal: 'Ganhar Massa Muscular',
    workoutDaysText: '3 dias por semana',
    duration: 45,
    experience: 'Intermediário',
    splitPreference: 'Treino Recomendado',
    variability: 'Equilibrado',
    warmupSets: 0,
    supersetsActive: 0,
    timedIntervals: 1,
    intervalPlacement: 'Treino inteiro',
    weightUnit: 'kg',
    cardioActive: 0,
    cardioPlacement: 'Fim do treino',
    cardioExercises: []
  });

  // Função centralizada para carregar dados do D1
  const loadD1Data = async () => {
    try {
      const resExercises = await fetch('/api/exercises');
      if (resExercises.ok) setExercises(await resExercises.json());

      const resPlan = await fetch('/api/plan');
      if (resPlan.ok) {
        const planData = await resPlan.json();
        if (planData) {
          setUserPlan({
            ...planData,
            cardioExercises: planData.cardioExercises ? JSON.parse(planData.cardioExercises) : []
          });
        }
      }

      const resWorkouts = await fetch('/api/workouts');
      if (resWorkouts.ok) {
        const data = await resWorkouts.json();
        setRawDbWorkouts(data);
        
        // Reconstrói os logs simplificados de fadiga
        const recoveredLogs: WorkoutLog[] = [];
        data.forEach((w: any) => {
          if (w.sets) {
            const musclesInWorkout = new Set<string>(w.sets.map((s: any) => s.muscleId).filter(Boolean));
            musclesInWorkout.forEach(m => {
              recoveredLogs.push({ muscleId: m, date: w.date, intensity: 'heavy' });
            });
          }
        });
        setWorkoutHistory(recoveredLogs);
      }
    } catch (err) {
      console.error("Erro no bootstrap do D1:", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadD1Data().finally(() => setLoading(false));

    const savedCurrent = localStorage.getItem('fitgym_current');
    if (savedCurrent) setCurrentWorkout(JSON.parse(savedCurrent));
  }, []);

  useEffect(() => {
    localStorage.setItem('fitgym_current', JSON.stringify(currentWorkout));
  }, [currentWorkout]);

  useEffect(() => {
    localStorage.setItem('fitgym_preferences', JSON.stringify(userPreferences));
  }, [userPreferences]);

  const changeLocationSetting = (newLocation: LocationType) => {
    setUserPreferences({ location: newLocation });
  };

  const updateUserPlan = async (newPlanFields: Partial<UserPlan>) => {
    const updated = { ...userPlan, ...newPlanFields };
    setUserPlan(updated);

    try {
      await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) {
      console.error("Falha ao sincronizar plano no D1:", e);
    }
  };

  const generateWorkout = () => {
    if (exercises.length === 0) return;

    let targetMuscles: string[] = [];

    if (userPlan.splitPreference === 'Push/Pull/Legs') {
      const dayHash = Date.now() % 3;
      if (dayHash === 0) targetMuscles = ['chest', 'shoulders'];
      else if (dayHash === 1) targetMuscles = ['back', 'biceps'];
      else targetMuscles = ['quads', 'hams', 'glutes', 'calves'];
    } else if (userPlan.splitPreference === 'Corpo inteiro') {
      targetMuscles = ['chest', 'back', 'quads', 'abs'];
    } else {
      const muscleIds = ['chest', 'back', 'shoulders', 'biceps', 'abs', 'quads', 'hams', 'glutes', 'calves'];
      const sortedMuscles = muscleIds
        .map(id => ({ id, score: calculateRecovery(id, workoutHistory) }))
        .sort((a, b) => b.score - a.score);
      targetMuscles = sortedMuscles.slice(0, 3).map(m => m.id);
    }

    let filteredExercises = exercises.filter(ex => targetMuscles.includes(ex.muscleId));

    if (userPreferences.location === 'Apenas Halteres') {
      filteredExercises = filteredExercises.filter(ex => ex.equipment === 'dumbbell' || ex.equipment === 'bodyweight');
    } else if (userPreferences.location === 'Peso Corporal') {
      filteredExercises = filteredExercises.filter(ex => ex.equipment === 'bodyweight');
    }

    const seed = userPlan.variability === 'Mais variado' ? 0.85 : (userPlan.variability === 'Mais consistente' ? 0.25 : 0.5);
    const shuffled = [...filteredExercises].sort(() => seed - Math.random());
    
    let numExercises = 4;
    if (userPlan.duration >= 60) numExercises = 6;
    if (userPlan.duration >= 90) numExercises = 8;
    if (userPlan.duration <= 30) numExercises = 3;

    const selectedExercises = shuffled.slice(0, numExercises);

    const builtWorkout: WorkoutExercise[] = selectedExercises.map(ex => {
      let targetReps = 10;
      if (userPlan.experience === 'Iniciante') targetReps = 12;
      if (userPlan.experience === 'Avançado') targetReps = 8;
      if (userPlan.goal === 'Ficar mais forte') targetReps = 5;

      // 🧠 ALGORITMO DE PROGRESSÃO DE CARGA AUTOMÁTICA
      let baseWeight = 10; // Carga inicial padrão de segurança
      if (userPlan.experience === 'Intermediário') baseWeight = 20;
      if (userPlan.experience === 'Avançado') baseWeight = 30;
      if (ex.equipment === 'bodyweight') baseWeight = 0;

      // Procura no histórico detalhado pelo último registro deste exercício específico
      let lastExerciseSets: any[] = [];
      const sortedWorkouts = [...rawDbWorkouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      for (const workout of sortedWorkouts) {
        if (workout.sets) {
          const matchSets = workout.sets.filter((s: any) => s.exerciseId === ex.id && s.completed);
          if (matchSets.length > 0) {
            lastExerciseSets = matchSets;
            break; 
          }
        }
      }

      // Se encontrou o exercício no passado, calcula a progressão adaptativa
      if (lastExerciseSets.length > 0) {
        const lastMaxWeight = Math.max(...lastExerciseSets.map((s: any) => s.weight || 0));
        
        if (lastMaxWeight > 0) {
          // Incrementa baseado no objetivo do plano de treino
          let increment = 2; // Padrão: +2kg (halteres/máquinas comuns)
          if (userPlan.goal === 'Ficar mais forte') increment = 4; // Mais foco em sobrecarga de peso
          
          baseWeight = lastMaxWeight + increment;
        }
      }

      return {
        id: ex.id + '_' + Date.now(),
        baseExerciseId: ex.id,
        name: ex.name,
        muscleId: ex.muscleId,
        sets: [
          { id: 's1', reps: targetReps, weight: baseWeight, completed: false },
          { id: 's2', reps: targetReps, weight: baseWeight, completed: false },
          { id: 's3', reps: targetReps, weight: baseWeight, completed: false },
        ]
      };
    });

    // Inserção de Cardio Dinâmico
    if (userPlan.cardioActive && userPlan.cardioPlacement === 'Inicio do treino' && userPlan.cardioExercises.length > 0) {
      const selectedId = userPlan.cardioExercises[0];
      const matchCardio = exercises.find(e => e.id === selectedId) || { name: 'Corrida na Esteira', muscleId: 'cardio' };
      builtWorkout.unshift({
        id: 'cardio_start_' + Date.now(),
        baseExerciseId: selectedId,
        name: matchCardio.name,
        muscleId: 'cardio',
        sets: [{ id: 'cs1', reps: 1, weight: 0, completed: false }]
      });
    }

    if (userPlan.cardioActive && userPlan.cardioPlacement === 'Fim do treino' && userPlan.cardioExercises.length > 0) {
      const selectedId = userPlan.cardioExercises[0];
      const matchCardio = exercises.find(e => e.id === selectedId) || { name: 'Corrida na Esteira', muscleId: 'cardio' };
      builtWorkout.push({
        id: 'cardio_end_' + Date.now(),
        baseExerciseId: selectedId,
        name: matchCardio.name,
        muscleId: 'cardio',
        sets: [{ id: 'cs1', reps: 1, weight: 0, completed: false }]
      });
    }

    setCurrentWorkout(builtWorkout);
  };

  const updateSetProgress = (exerciseId: string, setId: string, completed: boolean, reps?: number, weight?: number) => {
    setCurrentWorkout(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => {
          if (s.id !== setId) return s;
          return {
            ...s,
            completed,
            reps: reps !== undefined ? reps : s.reps,
            weight: weight !== undefined ? weight : s.weight
          };
        })
      };
    }));
  };

  const replaceExercise = (currentExerciseId: string, newExerciseBaseId: string) => {
    const findBaseExercise = exercises.find(ex => ex.id === newExerciseBaseId);
    if (!findBaseExercise) return;

    setCurrentWorkout(prev => prev.map(ex => {
      if (ex.id !== currentExerciseId) return ex;
      return {
        id: findBaseExercise.id + '_' + Date.now(),
        baseExerciseId: findBaseExercise.id,
        name: findBaseExercise.name,
        muscleId: findBaseExercise.muscleId,
        sets: [
          { id: 's1', reps: 10, weight: 20, completed: false },
          { id: 's2', reps: 10, weight: 20, completed: false },
          { id: 's3', reps: 10, weight: 20, completed: false },
        ]
      };
    }));
  };

  const finishWorkout = async () => {
    let totalCompletedSets = 0;
    const setsToSave: any[] = [];

    const workoutId = 'w_' + Date.now();
    const workoutDate = new Date().toISOString();

    currentWorkout.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed) {
          totalCompletedSets++;
          setsToSave.push({
            id: 'set_' + Math.random().toString(36).substring(2, 11),
            exerciseId: ex.baseExerciseId,
            muscleId: ex.muscleId, // Injeta o grupo para facilitar o motor de fadiga
            weight: set.weight,
            reps: set.reps,
            completed: true
          });
        }
      });
    });

    if (totalCompletedSets === 0) {
      alert("Marque pelo menos uma série como concluída!");
      return;
    }

    try {
      await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: workoutId,
          date: workoutDate,
          location: userPreferences.location,
          sets: setsToSave
        })
      });

      // Recarrega o cache local unificado do D1 para recalcular a fadiga e as próximas cargas instantaneamente
      await loadD1Data();
      setCurrentWorkout([]);
      alert("Treino finalizado com sucesso! Cargas e fadiga computadas pela IA.");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppContext.Provider value={{
      exercises,
      workoutHistory,
      currentWorkout,
      userPreferences,
      userPlan,
      loading,
      generateWorkout,
      updateSetProgress,
      finishWorkout,
      replaceExercise,
      changeLocationSetting,
      updateUserPlan
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser utilizado dentro de um AppProvider');
  return context;
}