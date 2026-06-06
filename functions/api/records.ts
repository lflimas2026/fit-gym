interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { DB } = context.env;

    // Query relacional que cruza as séries concluídas com o nome dos exercícios
    // e calcula o maior valor estimado de 1RM por fórmula matemática
    const query = `
      SELECT 
        e.id as exerciseId,
        e.name as exerciseName,
        e.muscleId,
        MAX(s.weight * (1 + CAST(s.reps AS REAL) / 30.0)) as estimated1RM,
        MAX(s.weight) as maxWeight,
        MAX(s.reps) as maxReps
      FROM workout_sets s
      JOIN exercises e ON s.exerciseId = e.id
      WHERE s.completed = 1
      GROUP BY e.id
      ORDER BY estimated1RM DESC
    `;

    const { results } = await DB.prepare(query).all();

    return new Response(JSON.stringify(results), {
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
