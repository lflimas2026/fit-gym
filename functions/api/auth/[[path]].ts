// functions/api/auth/[[path]].ts
interface Env {
  DB: D1Database;
}

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { DB } = context.env;
    const url = new URL(context.request.url);
    const body: any = await context.request.json();

    // 1. REGISTRO DE USUÁRIO (E-mail/Senha)
    if (url.pathname.endsWith('/register')) {
      const { name, email, password } = body;
      if (!name || !email || !password) {
        return new Response(JSON.stringify({ error: "Campos obrigatórios ausentes" }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Verifica se o usuário já existe
      const existing = await DB.prepare("SELECT id FROM users WHERE email = ?").bind(email.toLowerCase()).first();
      if (existing) {
        return new Response(JSON.stringify({ error: "E-mail já cadastrado" }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const userId = 'u_' + Math.random().toString(36).substring(2, 15);
      const passwordHash = await sha256(password);
      const createdAt = new Date().toISOString();

      await DB.prepare(`
        INSERT INTO users (id, name, email, passwordHash, createdAt) 
        VALUES (?, ?, ?, ?, ?)
      `).bind(userId, name, email.toLowerCase(), passwordHash, createdAt).run();

      // Inicializa preferências padrão para este novo usuário
      await DB.prepare(`
        INSERT OR IGNORE INTO user_plans (
          userId, goal, workoutDaysText, duration, experience, splitPreference, 
          variability, warmupSets, supersetsActive, timedIntervals, intervalPlacement, 
          weightUnit, cardioActive, cardioPlacement, cardioExercises
        ) VALUES (
          ?, 'Ganhar Massa Muscular', '3 dias por semana', 45, 'Intermediário', 
          'Treino Recomendado', 'Equilibrado', 0, 0, 1, 'Treino inteiro', 'kg', 0, 'Fim do treino', '[]'
        )
      `).bind(userId).run();

      return new Response(JSON.stringify({ 
        success: true, 
        user: { id: userId, name, email: email.toLowerCase(), picture: null } 
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. LOGIN DE USUÁRIO (E-mail/Senha)
    if (url.pathname.endsWith('/login')) {
      const { email, password } = body;
      if (!email || !password) {
        return new Response(JSON.stringify({ error: "Campos obrigatórios ausentes" }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const user: any = await DB.prepare("SELECT * FROM users WHERE email = ?").bind(email.toLowerCase()).first();
      if (!user) {
        return new Response(JSON.stringify({ error: "Usuário não encontrado" }), { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }

      const incomingHash = await sha256(password);
      if (user.passwordHash !== incomingHash) {
        return new Response(JSON.stringify({ error: "Senha incorreta" }), { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        user: { id: user.id, name: user.name, email: user.email, picture: user.picture } 
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // 3. CONEXÃO COM O GOOGLE
    if (url.pathname.endsWith('/google')) {
      const { googleId, email, name, picture } = body;
      if (!googleId || !email || !name) {
        return new Response(JSON.stringify({ error: "Dados do Google incompletos" }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Verifica se já existe por googleId ou email
      let user: any = await DB.prepare("SELECT * FROM users WHERE googleId = ? OR email = ?").bind(googleId, email.toLowerCase()).first();

      if (user) {
        // Se existia por e-mail mas não tinha googleId associado, atualiza
        if (!user.googleId) {
          await DB.prepare("UPDATE users SET googleId = ?, picture = ? WHERE id = ?")
            .bind(googleId, picture || null, user.id).run();
          user.googleId = googleId;
          user.picture = picture || null;
        } else if (picture && user.picture !== picture) {
          // Mantém foto de perfil sincronizada
          await DB.prepare("UPDATE users SET picture = ? WHERE id = ?")
            .bind(picture, user.id).run();
          user.picture = picture;
        }
      } else {
        // Cria novo usuário
        const userId = 'u_g_' + Math.random().toString(36).substring(2, 15);
        const createdAt = new Date().toISOString();

        await DB.prepare(`
          INSERT INTO users (id, name, email, googleId, picture, createdAt) 
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(userId, name, email.toLowerCase(), googleId, picture || null, createdAt).run();

        // Inicializa preferências padrão para este novo usuário
        await DB.prepare(`
          INSERT OR IGNORE INTO user_plans (
            userId, goal, workoutDaysText, duration, experience, splitPreference, 
            variability, warmupSets, supersetsActive, timedIntervals, intervalPlacement, 
            weightUnit, cardioActive, cardioPlacement, cardioExercises
          ) VALUES (
            ?, 'Ganhar Massa Muscular', '3 dias por semana', 45, 'Intermediário', 
            'Treino Recomendado', 'Equilibrado', 0, 0, 1, 'Treino inteiro', 'kg', 0, 'Fim do treino', '[]'
          )
        `).bind(userId).run();

        user = { id: userId, name, email: email.toLowerCase(), picture: picture || null };
      }

      return new Response(JSON.stringify({ 
        success: true, 
        user: { id: user.id, name: user.name, email: user.email, picture: user.picture } 
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Rota não encontrada" }), { 
      status: 404,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
