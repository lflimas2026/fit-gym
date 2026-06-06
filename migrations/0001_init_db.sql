-- Tabela de Exercícios (Substituta definitiva do exercises.json)
CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    muscleId TEXT NOT NULL,
    equipment TEXT NOT NULL
);

-- Tabela de Sessões de Treino
CREATE TABLE IF NOT EXISTS workouts (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL, -- Guardado em formato ISO string
    location TEXT NOT NULL
);

-- Tabela de Séries Executadas (Rastreamento estrito de carga/reps para calcular 1RM)
CREATE TABLE IF NOT EXISTS workout_sets (
    id TEXT PRIMARY KEY,
    workoutId TEXT NOT NULL,
    exerciseId TEXT NOT NULL,
    weight REAL NOT NULL,
    reps INTEGER NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0, -- 0 para falso, 1 para verdadeiro (SQLite não tem boolean nativo)
    FOREIGN KEY (workoutId) REFERENCES workouts(id) ON DELETE CASCADE
);

-- Índices de Performance para buscas rápidas no histórico de 1RM
CREATE INDEX IF NOT EXISTS idx_sets_exercise ON workout_sets(exerciseId);
CREATE INDEX IF NOT EXISTS idx_sets_workout ON workout_sets(workoutId);
