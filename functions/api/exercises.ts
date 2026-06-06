interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { DB } = context.env;

    // Busca explícita trazendo os novos campos ricos estruturados
    const { results } = await DB.prepare(
      "SELECT id, name, muscleId, equipment, gifUrl, instructions FROM exercises"
    ).all();

    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store" // Evita que o navegador guarde o JSON antigo em cache
      }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
