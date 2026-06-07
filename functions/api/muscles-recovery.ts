// functions/api/muscles-recovery.ts
interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { DB } = context.env;

    // 1. Busca todos os sets concluídos cruzando com a data do treino
    const { results } = await DB.prepare(`
      SELECT 
        e.muscleId,
        w.date as workoutDate
      FROM workout_sets ws
      JOIN exercises e ON ws.exerciseId = e.id
      JOIN workouts w ON ws.workoutId = w.id
      WHERE ws.completed = 1
      ORDER BY w.date DESC
    `).all();

    // Lista de músculos padrão do app
    const muscles = ['chest', 'back', 'shoulders', 'biceps', 'abs', 'quads', 'hams', 'glutes', 'calves'];
    
    // Inicializa todos com 100% de recuperação
    const recoveryMap: { [key: string]: number } = {};
    muscles.forEach(m => { recoveryMap[m] = 100; });

    const now = Date.now();
    const dequarentaEOitoHoras = 48 * 60 * 60 * 1000; // Tempo padrão total para recuperação total (48h)

    // 2. Calcula a fadiga baseado no último treino encontrado para cada músculo
    muscles.forEach(muscle => {
      const lastTrain = results.find((r: any) => r.muscleId === muscle);
      
      if (lastTrain) {
        const lastTrainTime = new Date((lastTrain as any).workoutDate).getTime();
        const timeElapsed = now - lastTrainTime;

        if (timeElapsed < dequarentaEOitoHoras) {
          // Regressão linear: quanto mais tempo passou, maior a recuperação
          const percent = Math.floor((timeElapsed / dequarentaEOitoHoras) * 100);
          recoveryMap[muscle] = Math.max(0, Math.min(100, percent));
        } else {
          recoveryMap[muscle] = 100;
        }
      }
    });

    return new Response(JSON.stringify(recoveryMap), {
      headers: { 
        "Content-Type": "application/json;charset=UTF-8",
        "Cache-Control": "no-store"
      }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};