-- Бейби Ленд · 21.10 · достъп · дневникът на админа (като AERO клиент 003_create-admin-log)
-- Прилага се автоматично от Netlify преди публикуване.
-- Всяко действие на администратор (създай, удължи, дата, заключи/отключи, нова парола, изтрий, CSV файл)
-- е нов ред: кога, кой, какво, над кого, какво беше → какво стана. Никога парола, хеш или токен.
-- Чете го само администратор (GET /api/admin/log · последните 200).
-- ПЪТ НАЗАД: DROP TABLE admin_log;

CREATE TABLE IF NOT EXISTS admin_log (
  id          BIGSERIAL   PRIMARY KEY,
  at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  admin_email TEXT        NOT NULL,
  action      TEXT        NOT NULL,
  target      TEXT,
  before      JSONB,
  after       JSONB
);
