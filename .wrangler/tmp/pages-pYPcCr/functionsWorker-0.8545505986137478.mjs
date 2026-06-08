var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/auth/[[path]].ts
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256, "sha256");
var onRequestPost = /* @__PURE__ */ __name(async (context) => {
  try {
    const { DB } = context.env;
    const url = new URL(context.request.url);
    const body = await context.request.json();
    if (url.pathname.endsWith("/register")) {
      const { name, email, password } = body;
      if (!name || !email || !password) {
        return new Response(JSON.stringify({ error: "Campos obrigat\xF3rios ausentes" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const existing = await DB.prepare("SELECT id FROM users WHERE email = ?").bind(email.toLowerCase()).first();
      if (existing) {
        return new Response(JSON.stringify({ error: "E-mail j\xE1 cadastrado" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const userId = "u_" + Math.random().toString(36).substring(2, 15);
      const passwordHash = await sha256(password);
      const createdAt = (/* @__PURE__ */ new Date()).toISOString();
      await DB.prepare(`
        INSERT INTO users (id, name, email, passwordHash, createdAt) 
        VALUES (?, ?, ?, ?, ?)
      `).bind(userId, name, email.toLowerCase(), passwordHash, createdAt).run();
      await DB.prepare(`
        INSERT OR IGNORE INTO user_plans (
          userId, goal, workoutDaysText, duration, experience, splitPreference, 
          variability, warmupSets, supersetsActive, timedIntervals, intervalPlacement, 
          weightUnit, cardioActive, cardioPlacement, cardioExercises
        ) VALUES (
          ?, 'Ganhar Massa Muscular', '3 dias por semana', 45, 'Intermedi\xE1rio', 
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
    if (url.pathname.endsWith("/login")) {
      const { email, password } = body;
      if (!email || !password) {
        return new Response(JSON.stringify({ error: "Campos obrigat\xF3rios ausentes" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const user = await DB.prepare("SELECT * FROM users WHERE email = ?").bind(email.toLowerCase()).first();
      if (!user) {
        return new Response(JSON.stringify({ error: "Usu\xE1rio n\xE3o encontrado" }), {
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
    if (url.pathname.endsWith("/google")) {
      const { googleId, email, name, picture } = body;
      if (!googleId || !email || !name) {
        return new Response(JSON.stringify({ error: "Dados do Google incompletos" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      let user = await DB.prepare("SELECT * FROM users WHERE googleId = ? OR email = ?").bind(googleId, email.toLowerCase()).first();
      if (user) {
        if (!user.googleId) {
          await DB.prepare("UPDATE users SET googleId = ?, picture = ? WHERE id = ?").bind(googleId, picture || null, user.id).run();
          user.googleId = googleId;
          user.picture = picture || null;
        } else if (picture && user.picture !== picture) {
          await DB.prepare("UPDATE users SET picture = ? WHERE id = ?").bind(picture, user.id).run();
          user.picture = picture;
        }
      } else {
        const userId = "u_g_" + Math.random().toString(36).substring(2, 15);
        const createdAt = (/* @__PURE__ */ new Date()).toISOString();
        await DB.prepare(`
          INSERT INTO users (id, name, email, googleId, picture, createdAt) 
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(userId, name, email.toLowerCase(), googleId, picture || null, createdAt).run();
        await DB.prepare(`
          INSERT OR IGNORE INTO user_plans (
            userId, goal, workoutDaysText, duration, experience, splitPreference, 
            variability, warmupSets, supersetsActive, timedIntervals, intervalPlacement, 
            weightUnit, cardioActive, cardioPlacement, cardioExercises
          ) VALUES (
            ?, 'Ganhar Massa Muscular', '3 dias por semana', 45, 'Intermedi\xE1rio', 
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
    return new Response(JSON.stringify({ error: "Rota n\xE3o encontrada" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}, "onRequestPost");

// api/exercises.ts
var onRequestGet = /* @__PURE__ */ __name(async (context) => {
  try {
    const { DB } = context.env;
    const { results } = await DB.prepare(
      "SELECT id, name, muscleId, equipment, gifUrl, instructions FROM exercises"
    ).all();
    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
        // Evita que o navegador guarde o JSON antigo em cache
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}, "onRequestGet");

// api/muscles-recovery.ts
var onRequestGet2 = /* @__PURE__ */ __name(async (context) => {
  try {
    const { DB } = context.env;
    const authHeader = context.request.headers.get("Authorization");
    const userId = authHeader ? authHeader.replace("Bearer ", "") : "default_user";
    const { results } = await DB.prepare(`
      SELECT 
        e.muscleId,
        w.date as workoutDate
      FROM workout_sets ws
      JOIN exercises e ON ws.exerciseId = e.id
      JOIN workouts w ON ws.workoutId = w.id
      WHERE ws.completed = 1 AND w.userId = ?
      ORDER BY w.date DESC
    `).bind(userId).all();
    const muscles = ["chest", "back", "shoulders", "biceps", "abs", "quads", "hams", "glutes", "calves"];
    const recoveryMap = {};
    muscles.forEach((m) => {
      recoveryMap[m] = 100;
    });
    const now = Date.now();
    const dequarentaEOitoHoras = 48 * 60 * 60 * 1e3;
    muscles.forEach((muscle) => {
      const lastTrain = results.find((r) => r.muscleId === muscle);
      if (lastTrain) {
        const lastTrainTime = new Date(lastTrain.workoutDate).getTime();
        const timeElapsed = now - lastTrainTime;
        if (timeElapsed < dequarentaEOitoHoras) {
          const percent = Math.floor(timeElapsed / dequarentaEOitoHoras * 100);
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
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}, "onRequestGet");

// api/plan.ts
var onRequestGet3 = /* @__PURE__ */ __name(async (context) => {
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
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}, "onRequestGet");
var onRequestPost2 = /* @__PURE__ */ __name(async (context) => {
  try {
    const { DB } = context.env;
    const authHeader = context.request.headers.get("Authorization");
    const userId = authHeader ? authHeader.replace("Bearer ", "") : "default_user";
    const body = await context.request.json();
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
      userId,
      body.goal,
      body.workoutDaysText,
      body.duration,
      body.experience,
      body.splitPreference,
      body.variability,
      body.warmupSets,
      body.supersetsActive,
      body.timedIntervals,
      body.intervalPlacement,
      body.weightUnit,
      body.cardioActive,
      body.cardioPlacement,
      JSON.stringify(body.cardioExercises)
    ).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}, "onRequestPost");

// api/records.ts
var onRequestGet4 = /* @__PURE__ */ __name(async (context) => {
  try {
    const { DB } = context.env;
    const authHeader = context.request.headers.get("Authorization");
    const userId = authHeader ? authHeader.replace("Bearer ", "") : "default_user";
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
      JOIN workouts w ON s.workoutId = w.id
      WHERE s.completed = 1 AND w.userId = ?
      GROUP BY e.id
      ORDER BY estimated1RM DESC
    `;
    const { results } = await DB.prepare(query).bind(userId).all();
    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}, "onRequestGet");

// api/sync-exercises.ts
var onRequestGet5 = /* @__PURE__ */ __name(async (context) => {
  try {
    const { DB, RAPIDAPI_KEY } = context.env;
    if (!RAPIDAPI_KEY) {
      return new Response(JSON.stringify({ error: "Chave RAPIDAPI_KEY n\xE3o configurada no ambiente." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
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
    const externalExercises = await response.json();
    const muscleMap = {
      "chest": "chest",
      "lats": "back",
      "upper back": "back",
      "spine": "back",
      "shoulders": "shoulders",
      "biceps": "biceps",
      "triceps": "biceps",
      // agrupado em braços no seu app
      "forearms": "biceps",
      "abs": "abs",
      "quads": "quads",
      "hamstrings": "hams",
      "glutes": "glutes",
      "calves": "calves"
    };
    const statements = externalExercises.map((ex) => {
      const targetMuscle = muscleMap[ex.target] || "abs";
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
        JSON.stringify(ex.instructions)
        // Transforma o array de passos em String SQL válida
      );
    });
    const chunkSize = 100;
    for (let i = 0; i < statements.length; i += chunkSize) {
      const chunk = statements.slice(i, i + chunkSize);
      await DB.batch(chunk);
    }
    return new Response(JSON.stringify({ success: true, totalSynced: externalExercises.length }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}, "onRequestGet");

// api/workouts.ts
var onRequestGet6 = /* @__PURE__ */ __name(async (context) => {
  try {
    const { DB } = context.env;
    const url = new URL(context.request.url);
    const authHeader = context.request.headers.get("Authorization");
    const userId = authHeader ? authHeader.replace("Bearer ", "") : "default_user";
    const workoutsQuery = await DB.prepare(`
      SELECT * FROM workouts 
      WHERE userId = ? 
      ORDER BY date DESC
    `).bind(userId).all();
    const workouts = workoutsQuery.results || [];
    const workoutIds = workouts.map((w) => w.id);
    let allSets = [];
    if (workoutIds.length > 0) {
      const placeholders = workoutIds.map(() => "?").join(",");
      const setsQuery = await DB.prepare(`
        SELECT * FROM workout_sets 
        WHERE workoutId IN (${placeholders})
      `).bind(...workoutIds).all();
      allSets = setsQuery.results || [];
    }
    const result = workouts.map((w) => {
      const sets = allSets.filter((s) => s.workoutId === w.id);
      return {
        ...w,
        sets: sets.map((s) => ({
          id: s.id,
          exerciseId: s.exerciseId,
          muscleId: s.muscleId,
          // se existir
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
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}, "onRequestGet");
var onRequestPost3 = /* @__PURE__ */ __name(async (context) => {
  try {
    const { DB } = context.env;
    const body = await context.request.json();
    const authHeader = context.request.headers.get("Authorization");
    const userId = authHeader ? authHeader.replace("Bearer ", "") : "default_user";
    const { id, date, location, sets } = body;
    if (!id || !date || !location || !sets || !Array.isArray(sets)) {
      return new Response(JSON.stringify({ error: "Campos obrigat\xF3rios ausentes" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    await DB.prepare(`
      INSERT INTO workouts (id, date, location, userId) 
      VALUES (?, ?, ?, ?)
    `).bind(id, date, location, userId).run();
    for (const set of sets) {
      await DB.prepare(`
        INSERT INTO workout_sets (id, workoutId, exerciseId, weight, reps, completed) 
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        set.id || "set_" + Math.random().toString(36).substring(2, 11),
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
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}, "onRequestPost");

// ../.wrangler/tmp/pages-pYPcCr/functionsRoutes-0.47140975137644947.mjs
var routes = [
  {
    routePath: "/api/auth/:path*",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/exercises",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/muscles-recovery",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/plan",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/plan",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/records",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/sync-exercises",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/api/workouts",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet6]
  },
  {
    routePath: "/api/workouts",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  }
];

// ../node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-LwP47R/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-LwP47R/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.8545505986137478.mjs.map
