// src/utils/workoutHelpers.ts

export interface WorkoutLog {
  muscleId: string;
  date: string;
  intensity: 'heavy' | 'medium' | 'light';
}

export function calculateRecovery(muscleId: string, history: WorkoutLog[]): number {
  const muscleHistory = history
    .filter(log => log.muscleId === muscleId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const lastWorkout = muscleHistory[0];

  if (!lastWorkout) return 100;

  const now = new Date().getTime();
  const workoutTime = new Date(lastWorkout.date).getTime();
  const hoursSinceWorkout = (now - workoutTime) / (1000 * 60 * 60);

  let hoursRequired = 48;
  if (lastWorkout.intensity === 'heavy') hoursRequired = 72;
  if (lastWorkout.intensity === 'light') hoursRequired = 24;

  const percentage = Math.floor((hoursSinceWorkout / hoursRequired) * 100);
  return Math.min(100, Math.max(0, percentage));
}

export function getFitbodColor(percentage: number): string {
  if (percentage <= 40) return '#EF4444'; 
  if (percentage <= 75) return '#F59E0B'; 
  return '#10B981';                        
}

/**
 * ALGORITMO FITBOD DE CARGA (Fórmula de Brzycki)
 * Calcula a estimativa de 1 Repetição Máxima (1RM) baseado na carga e reps executadas
 */
export function calculate1RM(weight: number, reps: number): number {
  if (reps === 0) return 0;
  if (reps === 1) return weight;
  return weight / (1.0278 - (0.0278 * reps));
}

/**
 * PROGRESSÃO DE SOBRECARGA:
 * Calcula o peso ideal para uma nova meta de repetições baseado no 1RM atual do usuário.
 * Aplica um fator de segurança para arredondar o peso para números inteiros pares (fácil de montar os halteres/anilhas).
 */
export function suggestWeightForReps(targetReps: number, current1RM: number): number {
  if (current1RM === 0) return 10; // Carga padrão inicial de segurança se for a primeira vez
  
  // Inverte a fórmula de Brzycki para descobrir o peso correspondente às reps alvo
  const rawWeight = current1RM * (1.0278 - (0.0278 * targetReps));
  
  // Arredonda para o múltiplo de 2kg mais próximo para facilitar na prática da academia
  return Math.max(2, Math.round(rawWeight / 2) * 2);
}