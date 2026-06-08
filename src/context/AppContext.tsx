// src/context/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { calculateRecovery } from '../utils/workoutHelpers';
import { MASTER_EXERCISES_DATABASE } from '../data/exercisesDatabase';
import { useAuth } from './AuthContext';

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
  gifUrl?: string; 
  sets: { id: string; reps: number; weight: number; completed: boolean }[];
}

export interface BaseExercise {
  id: string;
  name: string;
  muscleId: string;
  equipment: string;
  gifUrl?: string;       
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
  startCustomWorkout: (exerciseIds: string[]) => void;
  completedWorkouts: any[];
  records: any[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<BaseExercise[]>(MASTER_EXERCISES_DATABASE);
  const [loading, setLoading] = useState<boolean>(true);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutExercise[]>([]);
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

  const [completedWorkouts, setCompletedWorkouts] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);

  const loadCompletedWorkoutsFromLocalStorage = () => {
    const localData = localStorage.getItem('fitgym_completed_workouts');
    if (localData) {
      try {
        const data = JSON.parse(localData);
        setCompletedWorkouts(data);
        const recoveredLogs: WorkoutLog[] = [];
        data.forEach((w: any) => {
          if (w.sets) {
            w.sets.forEach((s: any) => {
              if (s.muscleId) recoveredLogs.push({ muscleId: s.muscleId, date: w.date, intensity: 'heavy' });
            });
          }
        });
        setWorkoutHistory(recoveredLogs);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const loadD1Data = async () => {
    try {
      const headers: any = {};
      if (user?.id) {
        headers['Authorization'] = `Bearer ${user.id}`;
      }

      const resPlan = await fetch('/api/plan', { headers });
      if (resPlan.ok) {
        const planData = await resPlan.json();
        if (planData) {
          setUserPlan({
            ...planData,
            cardioExercises: planData.cardioExercises ? JSON.parse(planData.cardioExercises) : []
          });
        }
      }

      const resWorkouts = await fetch('/api/workouts', { headers });
      if (resWorkouts.ok) {
        const data = await resWorkouts.json();
        setCompletedWorkouts(data);
        const recoveredLogs: WorkoutLog[] = [];
        data.forEach((w: any) => {
          if (w.sets) {
            w.sets.forEach((s: any) => {
              if (s.muscleId) recoveredLogs.push({ muscleId: s.muscleId, date: w.date, intensity: 'heavy' });
            });
          }
        });
        setWorkoutHistory(recoveredLogs);
      } else {
        loadCompletedWorkoutsFromLocalStorage();
      }
    } catch (err) {
      console.log("Modo de contingência ativo.");
      loadCompletedWorkoutsFromLocalStorage();
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
  }, [user]);

  useEffect(() => {
    localStorage.setItem('fitgym_current', JSON.stringify(currentWorkout));
  }, [currentWorkout]);

  useEffect(() => {
    const recordsMap: { [key: string]: { exerciseId: string; exerciseName: string; muscleId: string; estimated1RM: number; maxWeight: number; maxReps: number } } = {};

    completedWorkouts.forEach(w => {
      if (w.sets) {
        w.sets.forEach((s: any) => {
          const exercise = MASTER_EXERCISES_DATABASE.find(ex => ex.id === s.exerciseId);
          if (!exercise) return;
          
          const repsVal = Number(s.reps);
          const weightVal = Number(s.weight);
          const estimated1RM = weightVal * (1 + repsVal / 30.0);
          
          const existing = recordsMap[s.exerciseId];
          if (!existing || estimated1RM > existing.estimated1RM) {
            recordsMap[s.exerciseId] = {
              exerciseId: s.exerciseId,
              exerciseName: exercise.name,
              muscleId: exercise.muscleId,
              estimated1RM: estimated1RM,
              maxWeight: Math.max(weightVal, existing ? existing.maxWeight : 0),
              maxReps: Math.max(repsVal, existing ? existing.maxReps : 0)
            };
          } else {
            existing.maxWeight = Math.max(existing.maxWeight, weightVal);
            existing.maxReps = Math.max(existing.maxReps, repsVal);
          }
        });
      }
    });

    const calculatedRecords = Object.values(recordsMap).sort((a, b) => b.estimated1RM - a.estimated1RM);
    setRecords(calculatedRecords);
  }, [completedWorkouts]);

  const changeLocationSetting = (newLocation: LocationType) => {
    setUserPreferences({ location: newLocation });
  };

  const updateUserPlan = async (newPlanFields: Partial<UserPlan>) => {
    setUserPlan(prev => {
      const updated = { ...prev, ...newPlanFields };
      const headers: any = { 'Content-Type': 'application/json' };
      if (user?.id) {
        headers['Authorization'] = `Bearer ${user.id}`;
      }
      fetch('/api/plan', {
        method: 'POST',
        headers,
        body: JSON.stringify(updated)
      }).catch(e => console.error(e));
      return updated;
    });
  };

  const generateWorkout = () => {
    let targetMuscles: string[] = [];
    const splitLower = userPlan.splitPreference.toLowerCase();

    if (splitLower.includes('push')) {
      targetMuscles = ['chest', 'shoulders']; 
    } else if (splitLower.includes('pull')) {
      targetMuscles = ['back', 'biceps']; 
    } else if (splitLower.includes('legs') || splitLower.includes('pernas')) {
      targetMuscles = ['quads', 'hams', 'glutes', 'calves']; 
    } else if (splitLower.includes('corpo inteiro')) {
      targetMuscles = ['chest', 'back', 'quads', 'abs'];
    } else {
      const muscleIds = ['chest', 'back', 'shoulders', 'biceps', 'abs', 'quads', 'hams', 'glutes', 'calves'];
      const sortedMuscles = muscleIds
        .map(id => ({ id, score: calculateRecovery(id, workoutHistory) }))
        .sort((a, b) => b.score - a.score);
      targetMuscles = sortedMuscles.slice(0, 3).map(m => m.id);
    }

    let filteredExercises = MASTER_EXERCISES_DATABASE.filter(ex => targetMuscles.includes(ex.muscleId.toLowerCase()));

    if (userPreferences.location === 'Apenas Halteres') {
      filteredExercises = filteredExercises.filter(ex => ex.equipment === 'dumbbell' || ex.equipment === 'bodyweight');
    } else if (userPreferences.location === 'Peso Corporal') {
      filteredExercises = filteredExercises.filter(ex => ex.equipment === 'bodyweight');
    }

    if (filteredExercises.length === 0) {
      filteredExercises = MASTER_EXERCISES_DATABASE.slice(0, 10);
    }

    const shuffled = [...filteredExercises].sort(() => 0.5 - Math.random());
    
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

      return {
        id: ex.id + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        baseExerciseId: ex.id,
        name: ex.name,
        muscleId: ex.muscleId,
        gifUrl: ex.gifUrl,
        sets: [
          { id: 's1', reps: targetReps, weight: 20, completed: false },
          { id: 's2', reps: targetReps, weight: 20, completed: false },
          { id: 's3', reps: targetReps, weight: 20, completed: false },
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
    const findBaseExercise = MASTER_EXERCISES_DATABASE.find(ex => ex.id === newExerciseBaseId);
    if (!findBaseExercise) return;

    setCurrentWorkout(prev => {
      const exists = prev.some(e => e.id === currentExerciseId);
      if (exists) {
        return prev.map(ex => {
          if (ex.id !== currentExerciseId) return ex;
          return {
            id: findBaseExercise.id + '_' + Date.now(),
            baseExerciseId: findBaseExercise.id,
            name: findBaseExercise.name,
            muscleId: findBaseExercise.muscleId,
            gifUrl: findBaseExercise.gifUrl,
            sets: [
              { id: 's1', reps: 10, weight: 20, completed: false },
              { id: 's2', reps: 10, weight: 20, completed: false },
              { id: 's3', reps: 10, weight: 20, completed: false },
            ]
          };
        });
      } else {
        return [...prev, {
          id: findBaseExercise.id + '_' + Date.now(),
          baseExerciseId: findBaseExercise.id,
          name: findBaseExercise.name,
          muscleId: findBaseExercise.muscleId,
          gifUrl: findBaseExercise.gifUrl,
          sets: [
            { id: 's1', reps: 10, weight: 20, completed: false },
            { id: 's2', reps: 10, weight: 20, completed: false },
            { id: 's3', reps: 10, weight: 20, completed: false },
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

    const newWorkout = {
      id: workoutId,
      date: workoutDate,
      location: userPreferences.location,
      sets: setsToSave
    };

    // Salva localmente
    try {
      const existingLocal = localStorage.getItem('fitgym_completed_workouts');
      const list = existingLocal ? JSON.parse(existingLocal) : [];
      list.push(newWorkout);
      localStorage.setItem('fitgym_completed_workouts', JSON.stringify(list));
    } catch (e) {
      console.error("Erro ao salvar localmente:", e);
    }

    // Tenta enviar para a API/D1
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (user?.id) {
        headers['Authorization'] = `Bearer ${user.id}`;
      }
      await fetch('/api/workouts', {
        method: 'POST',
        headers,
        body: JSON.stringify(newWorkout)
      });
    } catch (err) {
      console.log("Falha ao salvar no banco, persistido localmente.");
    }

    // Atualiza estados reativos locais
    setCompletedWorkouts(prev => [newWorkout, ...prev]);

    const newLogs: WorkoutLog[] = [];
    setsToSave.forEach(s => {
      if (s.muscleId) {
        newLogs.push({
          muscleId: s.muscleId,
          date: workoutDate,
          intensity: 'heavy'
        });
      }
    });
    setWorkoutHistory(prev => [...newLogs, ...prev]);

    setCurrentWorkout([]);
    alert("Treino finalizado com sucesso!");
  };

  const startCustomWorkout = (exerciseIds: string[]) => {
    const selectedExercises = exerciseIds
      .map(id => MASTER_EXERCISES_DATABASE.find(ex => ex.id === id))
      .filter((ex): ex is BaseExercise => !!ex);

    const builtWorkout: WorkoutExercise[] = selectedExercises.map(ex => {
      let targetReps = 10; 
      if (userPlan.goal.includes('forte') || userPlan.goal.includes('Powerlifting')) targetReps = 5; 
      else if (userPlan.goal.includes('Definir') || userPlan.goal.includes('condicionamento')) targetReps = 15; 

      return {
        id: ex.id + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        baseExerciseId: ex.id,
        name: ex.name,
        muscleId: ex.muscleId,
        gifUrl: ex.gifUrl,
        sets: [
          { id: 's1', reps: targetReps, weight: 20, completed: false },
          { id: 's2', reps: targetReps, weight: 20, completed: false },
          { id: 's3', reps: targetReps, weight: 20, completed: false },
        ]
      };
    });

    setCurrentWorkout(builtWorkout);
  };

  return (
    <AppContext.Provider value={{
      exercises: MASTER_EXERCISES_DATABASE, 
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
      updateUserPlan,
      startCustomWorkout,
      completedWorkouts,
      records
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