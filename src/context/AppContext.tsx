// src/context/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { calculateRecovery, calculate1RM, suggestWeightForReps } from '../utils/workoutHelpers';
import exerciseData from '../assets/data/exercises.json';

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

interface ExerciseRecords {
  [exerciseId: string]: number;
}

// Tipos de perfil de academia idênticos ao Fitbod
export type LocationType = 'Academia Completa' | 'Apenas Halteres' | 'Peso Corporal';

interface AppContextType {
  workoutHistory: WorkoutLog[];
  currentWorkout: WorkoutExercise[];
  userPreferences: { location: LocationType; duration: number; goal: string; };
  generateWorkout: () => void;
  updateSetProgress: (exerciseId: string, setId: string, completed: boolean, reps?: number, weight?: number) => void;
  finishWorkout: () => void;
  replaceExercise: (currentExerciseId: string, newExerciseBaseId: string) => void;
  changeLocationSetting: (newLocation: LocationType) => void; // Nova função de controle
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
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

  // Estado dinâmico de preferências salvo no navegador
  const [userPreferences, setUserPreferences] = useState<{ location: LocationType; duration: number; goal: string }> Warmup(() => {
    const saved = localStorage.getItem('fitgym_preferences');
    return saved ? JSON.parse(saved) : {
      location: 'Academia Completa',
      duration: 45,
      goal: 'Hipertrofia',
    };
  });

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

  /**
   * ALGORITMO FITBOD AVANÇADO: FILTRO DE EQUIVALÊNCIA DE EQUIPAMENTOS
   */
  const generateWorkout = () => {
    const muscleIds = ['chest', 'back', 'shoulders', 'biceps', 'abs', 'quads', 'hams', 'glutes', 'calves'];
    
    const sortedMuscles = muscleIds
      .map(id => ({ id, score: calculateRecovery(id, workoutHistory) }))
      .sort((a, b) => b.score - a.score);

    const targetMuscles = sortedMuscles.slice(0, 3).map(m => m.id);
    
    // Regra de filtragem estrita baseada na infraestrutura selecionada
    let filteredExercises = exerciseData.filter(ex => targetMuscles.includes(ex.muscleId));

    if (userPreferences.location === 'Apenas Halteres') {
      // Exclui máquinas, cabos e barras pesadas
      filteredExercises = filteredExercises.filter(ex => ex.equipment === 'dumbbell' || ex.equipment === 'bodyweight');
    } else if (userPreferences.location === 'Peso Corporal') {
      // Filtra apenas calistenia pura
      filteredExercises = filteredExercises.filter(ex => ex.equipment === 'bodyweight');
    }

    const shuffled = [...filteredExercises].sort(() => 0.5 - Math.random());
    const selectedExercises = shuffled.slice(0, 5);

    const builtWorkout: WorkoutExercise[] = selectedExercises.map(ex => {
      const current1RM = exerciseRecords[ex.id] || 0;
      const targetReps = userPreferences.location === 'Peso Corporal' ? 15 : 10; // Mais reps se for calistenia
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
    const findBaseExercise = exerciseData.find(ex => ex.id === newExerciseBaseId);
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

  const finishWorkout = () => {
    const musclesTrained = new Set<string>();
    const updatedRecords = { ...exerciseRecords };
    let totalCompletedSets = 0;

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
        }
      });
    });

    if (totalCompletedSets === 0) {
      alert("Marque pelo menos uma série como concluída antes de finalizar!");
      return;
    }

    setExerciseRecords(updatedRecords);

    const newLogs: WorkoutLog[] = Array.from(musclesTrained).map(muscleId => ({
      muscleId,
      date: new Date().toISOString(),
      intensity: 'heavy'
    }));

    setWorkoutHistory(prev => [...newLogs, ...prev]);
    setCurrentWorkout([]);
    alert("Treino concluído! Suas cargas máximas foram recomputadas para a próxima progressão.");
  };

  return (
    <AppContext.Provider value={{
      workoutHistory,
      currentWorkout,
      userPreferences,
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