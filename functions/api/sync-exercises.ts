interface Env {
  DB: D1Database;
  RAPIDAPI_KEY: string; // Chave segura que configuraremos no painel da Cloudflare
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { DB, RAPIDAPI_KEY } = context.env;

    // Se a chave não estiver configurada no painel, avisa o desenvolvedor
    if (!RAPIDAPI_KEY) {
      return new Response(JSON.stringify({ error: "Chave RAPIDAPI_KEY não configurada no ambiente." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Busca os dados diretamente do servidor oficial do ExerciseDB
    const response = await fetch("https://exercisedb.p.rapidapi.com/exercises?limit=1500", {
      method: "GET",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "exercisedb.p.rapidapi.com"
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na API externa: ${response.statusText}`);
    }

    const externalExercises: any = await response.json();

    // Dicionário de conversão: Traduz os músculos do ExerciseDB para os IDs que seu app já usa
    const muscleMap: { [key: string]: string } = {
      "chest": "chest",
      "lats": "back",
      "upper back": "back",
      "spine": "back",
      "shoulders": "shoulders",
      "biceps": "biceps",
      "triceps": "biceps", // agrupado em braços no seu app
      "forearms": "biceps",
      "abs": "abs",
      "quads": "quads",
      "hamstrings": "hams",
      "glutes": "glutes",
      "calves": "calves"
    };

    // Prepara as inserções em lote (Batch Upsert)
    const statements = externalExercises.map((ex: any) => {
      // Mapeia o músculo ou usa 'core_1' como fallback genérico se não encontrar
      const targetMuscle = muscleMap[ex.target] || "abs";
      
      // Limpa e padroniza o ID do equipamento
      let equipment = "machine";
      if (ex.equipment.includes("barbell")) equipment = "barbell";
      else if (ex.equipment.includes("dumbbell")) equipment = "dumbbell";
      else if (ex.equipment.includes("cable")) equipment = "cable";
      else if (ex.equipment.includes("body weight") || ex.equipment.includes("leverage")) equipment = "bodyweight";

      return DB.prepare(`
        INSERT INTO exercises (id, name, muscleId, equipment, gifUrl, instructions)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          gifUrl = excluded.gifUrl,
          instructions = excluded.instructions
      `).bind(
        ex.id,
        ex.name,
        targetMuscle,
        equipment,
        ex.gifUrl,
        JSON.stringify(ex.instructions) // Transforma o array de passos em String SQL válida
      );
    });

    // Divide em blocos menores de 100 queries para o D1 processar sem estourar limites de memória
    const chunkSize = 100;
    for (let i = 0; i < statements.length; i += chunkSize) {
      const chunk = statements.slice(i, i + chunkSize);
      await DB.batch(chunk);
    }

    return new Response(JSON.stringify({ success: true, totalSynced: externalExercises.length }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
