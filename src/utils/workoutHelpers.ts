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
