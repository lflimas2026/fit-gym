// src/context/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { calculateRecovery, calculate1RM, suggestWeightForReps } from '../utils/workoutHelpers';

export interface WorkoutLog {
  muscleId: string;
  date: string; 
  intensity: 'heavy' | 'medium' | 'light';
}

export interface BaseExercise {
  id: string;
  name: string;
  muscleId: string;
  equipment: string;
  gifUrl?: string;       // Nova propriedade vinda do ExerciseDB
  instructions?: string; // Nova propriedade vinda do ExerciseDB (Stringificada)
}

export interface BaseExercise {
  id: string;
  name: string;
  muscleId: string;
  equipment: string;
}

interface ExerciseRecords {
  [exerciseId: string]: number;
}

export type LocationType = 'Academia Completa' | 'Apenas Halteres' | 'Peso Corporal';

interface AppContextType {
  exercises: BaseExercise[];
  workoutHistory: WorkoutLog[];
  currentWorkout: WorkoutExercise[];
  userPreferences: { location: LocationType; duration: number; goal: string; };
  loading: boolean;
  generateWorkout: () => void;
  updateSetProgress: (exerciseId: string, setId: string, completed: boolean, reps?: number, weight?: number) => void;
  finishWorkout: () => void;
  replaceExercise: (currentExerciseId: string, newExerciseBaseId: string) => void;
  changeLocationSetting: (newLocation: LocationType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [exercises, setExercises] = useState<BaseExercise[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>(() => {
    const saved = localStorage.getItem('fitgym_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentWorkout, setCurrentWorkout] = useState<WorkoutExercise[]>(() => {
    const saved = localStorage.getItem('fitgym_current');
    return saved ? JSON.parse(saved) : [];
  });

  const [exerciseRecords, setExerciseRecords] = useState<ExerciseRecords>(() => {
    const saved = localStorage.getItem('fitgym_records');
    return saved ? JSON.parse(saved) : {};
  });

  const [userPreferences, setUserPreferences] = useState<{ location: LocationType; duration: number; goal: string }>(() => {
    const saved = localStorage.getItem('fitgym_preferences');
    return saved ? JSON.parse(saved) : {
      location: 'Academia Completa',
      duration: 45,
      goal: 'Hipertrofia',
    };
  });

  // Consome a rota nativa de API D1 da Cloudflare
  useEffect(() => {
    async function loadExercises() {
      try {
        setLoading(true);
        const response = await fetch('/api/exercises');
        if (!response.ok) throw new Error('Erro ao buscar dados do banco D1');
        const data = await response.json();
        setExercises(data);
      } catch (err) {
        console.error("Falha na requisição D1:", err);
      } finally {
        setLoading(false);
      }
    }
    loadExercises();
  }, []);

  useEffect(() => {
    localStorage.setItem('fitgym_history', JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  useEffect(() => {
    localStorage.setItem('fitgym_current', JSON.stringify(currentWorkout));
  }, [currentWorkout]);

  useEffect(() => {
    localStorage.setItem('fitgym_records', JSON.stringify(exerciseRecords));
  }, [exerciseRecords]);

  useEffect(() => {
    localStorage.setItem('fitgym_preferences', JSON.stringify(userPreferences));
  }, [userPreferences]);

  const changeLocationSetting = (newLocation: LocationType) => {
    setUserPreferences(prev => ({ ...prev, location: newLocation }));
  };

  const generateWorkout = () => {
    if (exercises.length === 0) return;

    const muscleIds = ['chest', 'back', 'shoulders', 'biceps', 'abs', 'quads', 'hams', 'glutes', 'calves'];
    
    const sortedMuscles = muscleIds
      .map(id => ({ id, score: calculateRecovery(id, workoutHistory) }))
      .sort((a, b) => b.score - a.score);

    const targetMuscles = sortedMuscles.slice(0, 3).map(m => m.id);
    
    let filteredExercises = exercises.filter(ex => targetMuscles.includes(ex.muscleId));

    if (userPreferences.location === 'Apenas Halteres') {
      filteredExercises = filteredExercises.filter(ex => ex.equipment === 'dumbbell' || ex.equipment === 'bodyweight');
    } else if (userPreferences.location === 'Peso Corporal') {
      filteredExercises = filteredExercises.filter(ex => ex.equipment === 'bodyweight');
    }

    const shuffled = [...filteredExercises].sort(() => 0.5 - Math.random());
    const selectedExercises = shuffled.slice(0, 5);

    const builtWorkout: WorkoutExercise[] = selectedExercises.map(ex => {
      const current1RM = exerciseRecords[ex.id] || 0;
      const targetReps = userPreferences.location === 'Peso Corporal' ? 15 : 10;
      const recommendedWeight = userPreferences.location === 'Peso Corporal' ? 0 : suggestWeightForReps(targetReps, current1RM);

      return {
        id: ex.id + '_' + Date.now(),
        baseExerciseId: ex.id,
        name: ex.name,
        muscleId: ex.muscleId,
        sets: [
          { id: 's1', reps: targetReps, weight: recommendedWeight, completed: false },
          { id: 's2', reps: targetReps, weight: recommendedWeight, completed: false },
          { id: 's3', reps: targetReps, weight: recommendedWeight, completed: false },
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

    const current1RM = exerciseRecords[findBaseExercise.id] || 0;
    const targetReps = 10;
    const recommendedWeight = suggestWeightForReps(targetReps, current1RM);

    setCurrentWorkout(prev => prev.map(ex => {
      if (ex.id !== currentExerciseId) return ex;
      return {
        id: findBaseExercise.id + '_' + Date.now(),
        baseExerciseId: findBaseExercise.id,
        name: findBaseExercise.name,
        muscleId: findBaseExercise.muscleId,
        sets: [
          { id: 's1', reps: targetReps, weight: recommendedWeight, completed: false },
          { id: 's2', reps: targetReps, weight: recommendedWeight, completed: false },
          { id: 's3', reps: targetReps, weight: recommendedWeight, completed: false },
        ]
      };
    }));
  };

  const finishWorkout = async () => {
    const musclesTrained = new Set<string>();
    const updatedRecords = { ...exerciseRecords };
    let totalCompletedSets = 0;
    const setsToSave: any[] = [];

    const workoutId = 'w_' + Date.now();
    const workoutDate = new Date().toISOString();

    currentWorkout.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed) {
          totalCompletedSets++;
          musclesTrained.add(ex.muscleId);

          const calculated1RM = calculate1RM(set.weight, set.reps);
          const previous1RM = updatedRecords[ex.baseExerciseId] || 0;

          if (calculated1RM > previous1RM) {
            updatedRecords[ex.baseExerciseId] = calculated1RM;
          }

          setsToSave.push({
            id: 'set_' + Math.random().toString(36).substring(2, 11),
            exerciseId: ex.baseExerciseId,
            weight: set.weight,
            reps: set.reps,
            completed: true
          });
        }
      });
    });

    if (totalCompletedSets === 0) {
      alert("Marque pelo menos uma série como concluída antes de finalizar!");
      return;
    }

    try {
      // Envia os logs transacionais em lote para persistência relacional estável no D1
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: workoutId,
          date: workoutDate,
          location: userPreferences.location,
          sets: setsToSave
        })
      });

      if (!response.ok) throw new Error('Falha ao registrar treino na nuvem D1');

      setExerciseRecords(updatedRecords);

      const newLogs: WorkoutLog[] = Array.from(musclesTrained).map(muscleId => ({
        muscleId,
        date: workoutDate,
        intensity: 'heavy'
      }));

      setWorkoutHistory(prev => [...newLogs, ...prev]);
      setCurrentWorkout([]);
      alert("Treino salvo com sucesso no Cloudflare D1! Suas cargas foram sincronizadas.");
    } catch (err: any) {
      console.error(err);
      alert("Erro ao salvar o treino online. Verifique sua conexão.");
    }
  };

  return (
    <AppContext.Provider value={{
      exercises,
      workoutHistory,
      currentWorkout,
      userPreferences,
      loading,
      generateWorkout,
      updateSetProgress,
      finishWorkout,
      replaceExercise,
      changeLocationSetting
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