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

export function getExercisePromptAndInstructions(name: string, muscleId: string, equipment: string) {
  let instructions = "";
  let prompt = "";

  const nameLower = name.toLowerCase();

  if (nameLower.includes("supino") || nameLower.includes("bench press")) {
    instructions = "Deite-se no banco, alinhe a barra com o peito, segure firmemente com pegada pronada e empurre para cima mantendo os ombros encaixados.";
    prompt = `Detailed 3D fitness guide illustration of an athlete performing ${name} for chest development. Highlight active pectorals in light green color. Clean studio background, highly educational, realistic gym lighting.`;
  } else if (nameLower.includes("rosca") || nameLower.includes("curl")) {
    instructions = "Fique em pé, mantenha os cotovelos fixos ao lado do corpo, contraia o bíceps para erguer o peso e desça de forma lenta e controlada.";
    prompt = `Detailed 3D fitness guide illustration of an athlete performing ${name} for biceps development. Highlight active biceps in light green color. Clean studio background, highly educational, realistic gym lighting.`;
  } else if (nameLower.includes("puxada") || nameLower.includes("pulldown") || nameLower.includes("barra fixa") || nameLower.includes("pullup")) {
    instructions = "Segure a barra com pegada aberta, puxe em direção ao peito inclinando levemente o tronco para trás e contraia as escápulas.";
    prompt = `Detailed 3D fitness guide illustration of an athlete performing ${name} for back development. Highlight active latissimus dorsi in light green color. Clean studio background, highly educational, realistic gym lighting.`;
  } else if (nameLower.includes("elevação") || nameLower.includes("lateral") || nameLower.includes("frontal") || nameLower.includes("desenvolvimento")) {
    instructions = "Mantenha a coluna ereta, eleve os braços de forma controlada até a linha dos ombros e retorne resistindo à gravidade.";
    prompt = `Detailed 3D fitness guide illustration of an athlete performing ${name} for shoulder development. Highlight active deltoids in light green color. Clean studio background, highly educational, realistic gym lighting.`;
  } else if (nameLower.includes("agachamento") || nameLower.includes("squat") || nameLower.includes("leg press")) {
    instructions = "Afaste os pés na largura dos ombros, agache empurrando o quadril para trás e descendo até as coxas ficarem paralelas ao chão, mantendo os joelhos alinhados.";
    prompt = `Detailed 3D fitness guide illustration of an athlete performing ${name} for legs development. Highlight active quadriceps and glutes in light green color. Clean studio background, highly educational, realistic gym lighting.`;
  } else if (nameLower.includes("stiff") || nameLower.includes("flexora") || nameLower.includes("terra")) {
    instructions = "Mantenha as pernas levemente flexionadas, desça o tronco mantendo as costas retas até sentir alongar a parte posterior da coxa, e retorne contraindo os glúteos.";
    prompt = `Detailed 3D fitness guide illustration of an athlete performing ${name} for hamstrings development. Highlight active hamstrings in light green color. Clean studio background, highly educational, realistic gym lighting.`;
  } else {
    instructions = "Mantenha a postura alinhada, execute o movimento concentrando-se na contração do músculo alvo e retorne de forma lenta e controlada.";
    prompt = `Detailed 3D fitness guide illustration of an athlete performing ${name} targeting ${muscleId} using ${equipment}. Highlight active muscle group in light green color. Clean studio background, highly educational, realistic gym lighting.`;
  }

  return { instructions, prompt };
}

export function getMuscleFallbackImage(muscleId: string): string {
  const muscleLower = (muscleId || '').toLowerCase();
  
  if (muscleLower.includes('chest') || muscleLower.includes('peito')) {
    return 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80';
  }
  if (muscleLower.includes('back') || muscleLower.includes('costas') || muscleLower.includes('lats')) {
    return 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&q=80';
  }
  if (muscleLower.includes('legs') || muscleLower.includes('pernas') || muscleLower.includes('quads') || muscleLower.includes('hams') || muscleLower.includes('glutes') || muscleLower.includes('calves')) {
    return 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80';
  }
  if (muscleLower.includes('shoulder') || muscleLower.includes('ombros') || muscleLower.includes('delts')) {
    return 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&q=80';
  }
  if (muscleLower.includes('biceps') || muscleLower.includes('triceps') || muscleLower.includes('arms') || muscleLower.includes('braços')) {
    return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80';
  }
  if (muscleLower.includes('cardio') || muscleLower.includes('aerobico') || muscleLower.includes('abs') || muscleLower.includes('abdomen')) {
    return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80';
  }
  
  return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80'; // default gym rack
}