import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { calculateRecovery } from '../utils/workoutHelpers';
import exerciseData from '../assets/data/exercises.json';

export interface WorkoutLog {
  muscleId: string;
  date: string; 
  intensity: 'heavy' | 'medium' | 'light';
}

export interface WorkoutExercise {
  id: string;
  name: string;
  muscleId: string;
  sets: { id: string; reps: number; weight: number; completed: boolean }[];
}

interface AppContextType {
  workoutHistory: WorkoutLog[];
  currentWorkout: WorkoutExercise[];
  userPreferences: { location: string; duration: number; goal: string; };
  generateWorkout: () => void;
  updateSetProgress: (exerciseId: string, setId: string, completed: boolean, reps?: number, weight?: number) => void;
  finishWorkout: () => void; // Garante a assinatura exata exigida pelo App.tsx
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

  const [userPreferences] = useState({
    location: 'Academia Completa',
    duration: 45,
    goal: 'Hipertrofia',
  });

  useEffect(() => {
    localStorage.setItem('fitgym_history', JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  useEffect(() => {
    localStorage.setItem('fitgym_current', JSON.stringify(currentWorkout));
  }, [currentWorkout]);

  const generateWorkout = () => {
    const muscleIds = ['chest', 'back', 'shoulders', 'biceps', 'abs', 'quads', 'hams', 'glutes', 'calves'];
    
    const sortedMuscles = muscleIds
      .map(id => ({ id, score: calculateRecovery(id, workoutHistory) }))
      .sort((a, b) => b.score - a.score);

    const targetMuscles = sortedMuscles.slice(0, 3).map(m => m.id);
    const filteredExercises = exerciseData.filter(ex => targetMuscles.includes(ex.muscleId));
    const selectedExercises = filteredExercises.slice(0, 5);

    const builtWorkout: WorkoutExercise[] = selectedExercises.map(ex => ({
      id: ex.id + '_' + Date.now(),
      name: ex.name,
      muscleId: ex.muscleId,
      sets: [
        { id: 's1', reps: 10, weight: 20, completed: false },
        { id: 's2', reps: 10, weight: 20, completed: false },
        { id: 's3', reps: 10, weight: 20, completed: false },
      ]
    }));

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

  const finishWorkout = () => {
    const musclesTrained = new Set<string>();

    currentWorkout.forEach(ex => {
      const hasCompletedSet = ex.sets.some(s => s.completed);
      if (hasCompletedSet) {
        musclesTrained.add(ex.muscleId);
      }
    });

    if (musclesTrained.size === 0) {
      alert("Marque pelo menos uma série como concluída antes de finalizar!");
      return;
    }

    const newLogs: WorkoutLog[] = Array.from(musclesTrained).map(muscleId => ({
      muscleId,
      date: new Date().toISOString(),
      intensity: 'heavy'
    }));

    setWorkoutHistory(prev => [...newLogs, ...prev]);
    setCurrentWorkout([]);
    alert("Treino concluído com sucesso! Histórico de fadiga atualizado.");
  };

  return (
    <AppContext.Provider value={{
      workoutHistory,
      currentWorkout,
      userPreferences,
      generateWorkout,
      updateSetProgress,
      finishWorkout
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
