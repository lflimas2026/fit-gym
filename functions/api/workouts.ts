// functions/api/workouts.ts
interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { DB } = context.env;
    const url = new URL(context.request.url);
    
    // Recupera userId do header Authorization (Bearer <userId>)
    const authHeader = context.request.headers.get("Authorization");
    const userId = authHeader ? authHeader.replace("Bearer ", "") : "default_user";

    // Busca todos os treinos do usuário
    const workoutsQuery = await DB.prepare(`
      SELECT * FROM workouts 
      WHERE userId = ? 
      ORDER BY date DESC
    `).bind(userId).all();

    const workouts = workoutsQuery.results || [];

    // Busca todas as séries dos treinos desse usuário
    const workoutIds = workouts.map((w: any) => w.id);
    let allSets: any[] = [];
    
    if (workoutIds.length > 0) {
      // Como SQLite não aceita arrays diretamente em binds sem extensões, fazemos uma lista de placeholders
      const placeholders = workoutIds.map(() => "?").join(",");
      const setsQuery = await DB.prepare(`
        SELECT * FROM workout_sets 
        WHERE workoutId IN (${placeholders})
      `).bind(...workoutIds).all();
      allSets = setsQuery.results || [];
    }

    // Combina os treinos com suas respectivas séries
    const result = workouts.map((w: any) => {
      const sets = allSets.filter((s: any) => s.workoutId === w.id);
      return {
        ...w,
        sets: sets.map((s: any) => ({
          id: s.id,
          exerciseId: s.exerciseId,
          muscleId: s.muscleId, // se existir
          weight: s.weight,
          reps: s.reps,
          completed: s.completed === 1
        }))
      };
    });

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { DB } = context.env;
    const body: any = await context.request.json();
    
    const authHeader = context.request.headers.get("Authorization");
    const userId = authHeader ? authHeader.replace("Bearer ", "") : "default_user";

    const { id, date, location, sets } = body;
    if (!id || !date || !location || !sets || !Array.isArray(sets)) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios ausentes" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Salva o cabeçalho do treino
    await DB.prepare(`
      INSERT INTO workouts (id, date, location, userId) 
      VALUES (?, ?, ?, ?)
    `).bind(id, date, location, userId).run();

    // Salva as séries
    for (const set of sets) {
      await DB.prepare(`
        INSERT INTO workout_sets (id, workoutId, exerciseId, weight, reps, completed) 
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        set.id || 'set_' + Math.random().toString(36).substring(2, 11),
        id,
        set.exerciseId,
        set.weight,
        set.reps,
        set.completed ? 1 : 0
      ).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
