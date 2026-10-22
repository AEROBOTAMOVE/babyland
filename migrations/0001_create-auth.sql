-- Бейби Ленд · 22.10 · Cloudflare D1 (SQLite) · профили, сесии, опити за вход
-- Пренесено от netlify/database/migrations/001_create-auth (Postgres): същите таблици и колони.
-- Прилага се с:  npx wrangler d1 migrations apply babyland --remote
-- ДАТИТЕ са ISO текст в UTC ("2026-10-22T08:00:00.000Z"), пише ги кодът (worker/lib/repo.mjs) — без DEFAULT от базата.
-- locked е 0/1. ПОВЕРИТЕЛНОСТ: тук стоят само имейл, хеш на паролата, датите и сесиите.
-- Записките на мама остават САМО на телефона ѝ — за тях няма таблица.
-- ПЪТ НАЗАД: DROP TABLE login_attempts; DROP TABLE sessions; DROP TABLE users;

CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT    NOT NULL UNIQUE,
  pass_hash    TEXT    NOT NULL,
  created_at   TEXT    NOT NULL,
  access_until TEXT    NOT NULL,
  locked       INTEGER NOT NULL DEFAULT 0 CHECK (locked IN (0, 1)),
  last_login   TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT    PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT    NOT NULL,
  expires_at TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires_at);

-- kind = 'login' (subject = имейл) или 'register' (subject = IP адрес)
CREATE TABLE IF NOT EXISTS login_attempts (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT    NOT NULL,
  kind    TEXT    NOT NULL DEFAULT 'login',
  at      TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS login_attempts_lookup_idx ON login_attempts (subject, kind, at);
