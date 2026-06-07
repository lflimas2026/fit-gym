-- Cria uma tabela sólida para persistir o plano customizável do usuário
CREATE TABLE IF NOT EXISTS user_plans (
  userId TEXT PRIMARY KEY,
  goal TEXT,
  workoutDaysText TEXT,
  duration INT,
  experience TEXT,
  splitPreference TEXT,
  variability TEXT,
  warmupSets INT,
  supersetsActive INT,
  timedIntervals INT,
  intervalPlacement TEXT,
  weightUnit TEXT,
  cardioActive INT,
  cardioPlacement TEXT,
  cardioExercises TEXT
);

-- Insere um registro padrão inicial para o usuário mestre se não existir
INSERT OR IGNORE INTO user_plans (
  userId, goal, workoutDaysText, duration, experience, splitPreference, 
  variability, warmupSets, supersetsActive, timedIntervals, intervalPlacement, 
  weightUnit, cardioActive, cardioPlacement, cardioExercises
) VALUES (
  'default_user', 'Ganhar Massa Muscular', '3 dias por semana', 45, 'Intermediário', 
  'Treino Recomendado', 'Equilibrado', 0, 0, 1, 'Treino inteiro', 'kg', 0, 'Fim do treino', '[]'
);