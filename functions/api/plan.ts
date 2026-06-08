// functions/api/plan.ts
interface Env {
  DB: D1Database;
}

// Retorna as preferências do plano salvas no D1
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { DB } = context.env;
    const authHeader = context.request.headers.get("Authorization");
    const userId = authHeader ? authHeader.replace("Bearer ", "") : "default_user";

    const plan = await DB.prepare("SELECT * FROM user_plans WHERE userId = ?").bind(userId).first();
    return new Response(JSON.stringify(plan), {
      headers: { 
        "Content-Type": "application/json;charset=UTF-8",
        "Cache-Control": "no-store"
      }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

// Salva e atualiza as preferências do plano no D1 (Sintaxe UPSERT do SQLite)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { DB } = context.env;
    const authHeader = context.request.headers.get("Authorization");
    const userId = authHeader ? authHeader.replace("Bearer ", "") : "default_user";

    const body: any = await context.request.json();

    await DB.prepare(`
      INSERT INTO user_plans (
        userId, goal, workoutDaysText, duration, experience, splitPreference,
        variability, warmupSets, supersetsActive, timedIntervals, intervalPlacement,
        weightUnit, cardioActive, cardioPlacement, cardioExercises
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(userId) DO UPDATE SET
        goal = excluded.goal,
        workoutDaysText = excluded.workoutDaysText,
        duration = excluded.duration,
        experience = excluded.experience,
        splitPreference = excluded.splitPreference,
        variability = excluded.variability,
        warmupSets = excluded.warmupSets,
        supersetsActive = excluded.supersetsActive,
        timedIntervals = excluded.timedIntervals,
        intervalPlacement = excluded.intervalPlacement,
        weightUnit = excluded.weightUnit,
        cardioActive = excluded.cardioActive,
        cardioPlacement = excluded.cardioPlacement,
        cardioExercises = excluded.cardioExercises
    `).bind(
      userId, body.goal, body.workoutDaysText, body.duration, body.experience, body.splitPreference,
      body.variability, body.warmupSets, body.supersetsActive, body.timedIntervals, body.intervalPlacement,
      body.weightUnit, body.cardioActive, body.cardioPlacement, JSON.stringify(body.cardioExercises)
    ).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};