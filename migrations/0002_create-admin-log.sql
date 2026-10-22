-- Бейби Ленд · 22.10 · Cloudflare D1 (SQLite) · дневникът на админа
-- Пренесено от netlify/database/migrations/002_create-admin-log (Postgres).
-- Всяко действие на администратор е нов ред: кога, кой, какво, над кого, какво беше → какво стана.
-- before/after са JSON текст. Никога парола, хеш или токен. Чете го само администратор (GET /api/admin/log).
-- ПЪТ НАЗАД: DROP TABLE admin_log;

CREATE TABLE IF NOT EXISTS admin_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  at          TEXT    NOT NULL,
  admin_email TEXT    NOT NULL,
  action      TEXT    NOT NULL,
  target      TEXT,
  before      TEXT,
  after       TEXT
);
