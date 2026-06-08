-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT,
    googleId TEXT,
    picture TEXT,
    createdAt TEXT NOT NULL
);

-- Adicionar coluna userId à tabela de workouts para isolamento de dados
ALTER TABLE workouts ADD COLUMN userId TEXT DEFAULT 'default_user';

-- Índice para acelerar a busca de treinos por usuário
CREATE INDEX IF NOT EXISTS idx_workouts_user ON workouts(userId);
