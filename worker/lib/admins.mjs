/* Бейби Ленд · администраторите
   21.10 · достъп · като AERO: списъкът стои в сървъра (папката worker/ не се публикува —
   в сайта отива само dist/). Към него се добавя и ADMIN_EMAILS от Cloudflare (Variables), ако е зададена.
   ВНИМАНИЕ: имейлът не се потвърждава с писмо — който ПРЪВ регистрира този имейл, държи профила.
   Затова собственикът се регистрира веднага след първия деплой (CLOUDFLARE_README_BG.md).
   22.10 · Cloudflare · преместено от netlify/functions/_lib/ без промяна на списъка.
   ПЪТ НАЗАД: копието отпреди 22.10 е в dev/_netlify_staro/netlify/functions/_lib/. */
export const ADMINS = [
  "aaeromove@gmail.com",
];
