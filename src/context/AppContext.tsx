// src/context/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { calculateRecovery } from '../utils/workoutHelpers';

// Movemos a declaração para cá para evitar conflito de cache no import de tipos do Vite!
export interface WorkoutLog {
  muscleId: string;
  date: string;
  intensity: 'heavy' | 'medium' | 'light';
}

// Definição da estrutura de um exercício gerado
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
  addWorkoutLog: (log: WorkoutLog) => void;
  generateWorkout: () => void;
  updateSetProgress: (exerciseId: string, setId: string, completed: boolean, reps?: number, weight?: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Banco de dados de exercícios baseado nas suas principais buscas e treinos focados
const EXERCISE_DATABASE = [
  { id: 'ex1', name: 'Supino Reto com Barra', muscleId: 'chest' },
  { id: 'ex2', name: 'Crucifixo Inclinado Halteres', muscleId: 'chest' },
  { id: 'ex3', name: 'Puxada Alta Neutra', muscleId: 'back' },
  { id: 'ex4', name: 'Remada Baixa Máquina', muscleId: 'back' },
  { id: 'ex5', name: 'Desenvolvimento Máquina', muscleId: 'shoulders' },
  { id: 'ex6', name: 'Rosca Inclinada Halteres', muscleId: 'biceps' },
  { id: 'ex7', name: 'Tríceps Corda Pulley', muscleId: 'biceps' },
  { id: 'ex8', name: 'Abdominal Infra Solo', muscleId: 'abs' },
  { id: 'ex9', name: 'Agachamento Livre', muscleId: 'quads' },
  { id: 'ex10', name: 'Leg Press 45°', muscleId: 'quads' },
  { id: 'ex11', name: 'Mesa Flexora', muscleId: 'hams' },
  { id: 'ex12', name: 'Elevação de Gêmeos Sentado', muscleId: 'calves' },
];

export function AppProvider({ children }: { children: ReactNode }) {
  // Inicializa o histórico buscando o que estiver salvo no navegador
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

  // Salva no LocalStorage automaticamente a cada alteração
  useEffect(() => {
    localStorage.setItem('fitgym_history', JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  useEffect(() => {
    localStorage.setItem('fitgym_current', JSON.stringify(currentWorkout));
  }, [currentWorkout]);

  const addWorkoutLog = (log: WorkoutLog) => {
    setWorkoutHistory(prev => [log, ...prev]);
  };

  /**
   * ALGORITMO ESTILO FITBOD:
   * Varre todos os grupos musculares, calcula o descanso de cada um, ordena
   * os mais recuperados para o topo e seleciona os 3 melhores para criar o treino.
   */
  const generateWorkout = () => {
    const muscleIds = ['chest', 'back', 'shoulders', 'biceps', 'abs', 'quads', 'hams', 'glutes', 'calves'];
    
    const sortedMuscles = muscleIds
      .map(id => ({ id, score: calculateRecovery(id, workoutHistory) }))
      .sort((a, b) => b.score - a.score);

    // Pega os 3 grupos musculares com maior score de recuperação
    const targetMuscles = sortedMuscles.slice(0, 3).map(m => m.id);
    const selectedExercises = EXERCISE_DATABASE.filter(ex => targetMuscles.includes(ex.muscleId));

    // Monta o treino injetando 3 séries padrão de trabalho para cada movimento
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

  // Gerencia o preenchimento de checkbox, peso e repetições de cada série individualmente
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

  return (
    <AppContext.Provider value={{
      workoutHistory,
      currentWorkout,
      userPreferences,
      addWorkoutLog,
      generateWorkout,
      updateSetProgress
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