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
  const [rawDbWorkouts, setRawDbWorkouts] = useState<any[]>([]);

  const [userPreferences, setUserPreferences] = useState<{ location: LocationType }>({ location: 'Academia Completa' });

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

  const loadD1Data = async () => {
    try {
      const resExercises = await fetch('/api/exercises');
      if (resExercises.ok) {
        const data = await resExercises.json();
        setExercises(data);
      }

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
        
        const recoveredLogs: WorkoutLog[] = [];
        data.forEach((w: any) => {
          if (w.sets) {
            w.sets.forEach((s: any) => {
              if (s.muscleId) recoveredLogs.push({ muscleId: s.muscleId, date: w.date, intensity: 'heavy' });
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
    if (savedCurrent) {
      try {
        setCurrentWorkout(JSON.parse(savedCurrent));
      } catch (e) {
        setCurrentWorkout([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fitgym_current', JSON.stringify(currentWorkout));
  }, [currentWorkout]);

  const changeLocationSetting = (newLocation: LocationType) => {
    setUserPreferences({ location: newLocation });
  };

  const updateUserPlan = async (newPlanFields: Partial<UserPlan>) => {
    setUserPlan(prev => {
      const updated = { ...prev, ...newPlanFields };
      fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(e => console.error("Erro no D1:", e));
      return updated;
    });
  };

  const generateWorkout = () => {
    if (exercises.length === 0) return;

    let targetMuscles: string[] = [];
    const splitLower = userPlan.splitPreference.toLowerCase();

    // Filtros de Músculos Corrigidos e Resilientes
    if (splitLower.includes('push')) {
      targetMuscles = ['chest', 'shoulders']; 
    } else if (splitLower.includes('pull')) {
      targetMuscles = ['back', 'biceps']; 
    } else if (splitLower.includes('legs')) {
      targetMuscles = ['quads', 'hams', 'glutes', 'calves']; 
    } else if (splitLower.includes('corpo inteiro')) {
      targetMuscles = ['chest', 'back', 'quads', 'abs'];
    } else {
      // Fallback Inteligente baseada em Fadiga
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

    // Fallback absoluto caso o filtro esvazie a lista
    if (filteredExercises.length === 0) {
      filteredExercises = exercises.slice(0, 10);
    }

    const seed = userPlan.variability === 'Mais variado' ? 0.85 : (userPlan.variability === 'Mais consistente' ? 0.25 : 0.5);
    const shuffled = [...filteredExercises].sort(() => seed - Math.random());
    
    let numExercises = 4;
    if (userPlan.duration === 15) numExercises = 2;
    else if (userPlan.duration === 30) numExercises = 3;
    else if (userPlan.duration === 45) numExercises = 4;
    else if (userPlan.duration === 60) numExercises = 6;
    else if (userPlan.duration === 90) numExercises = 8;

    const selectedExercises = shuffled.slice(0, numExercises);

    const builtWorkout: WorkoutExercise[] = selectedExercises.map(ex => {
      let targetReps = 10; 
      if (userPlan.goal.includes('forte') || userPlan.goal.includes('Powerlifting')) targetReps = 5; 
      else if (userPlan.goal.includes('Definir') || userPlan.goal.includes('condicionamento')) targetReps = 15; 

      let baseWeight = 20;
      if (ex.equipment === 'bodyweight') baseWeight = 0;

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

    setCurrentWorkout(prev => {
      const match = prev.find(e => e.id === currentExerciseId);
      if (match) {
        // Modo Adição ou Substituição
        return prev.map(ex => {
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
        });
      } else {
        // Se for avulso, adiciona ao fim
        const targetReps = 10;
        return [...prev, {
          id: findBaseExercise.id + '_' + Date.now(),
          baseExerciseId: findBaseExercise.id,
          name: findBaseExercise.name,
          muscleId: findBaseExercise.muscleId,
          sets: [
            { id: 's1', reps: targetReps, weight: 20, completed: false },
            { id: 's2', reps: targetReps, weight: 20, completed: false },
            { id: 's3', reps: targetReps, weight: 20, completed: false },
          ]
        }];
      }
    });
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
            muscleId: ex.muscleId,
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

      await loadD1Data();
      setCurrentWorkout([]);
      alert("Treino finalizado com sucesso!");
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