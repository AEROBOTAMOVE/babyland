/* ─────────────────────────────────────────────────────────────
   Бейби Ленд · Cloudflare Worker (ES модул) · 22.10
   Един Worker за целия сайт:
     /api/*        → makeApi (worker/lib/api.mjs — същата логика като на Netlify, байт в байт)
                     с база D1 (env.DB, worker/lib/repo.mjs)
     всичко друго  → env.ASSETS.fetch(request) — статичните файлове от dist/ (node build.js)
   wrangler.toml пуска Worker-а ПЪРВИ само за "/api/*" (run_worker_first) — така /api/* никога не
   стига до index.html. Останалите адреси Cloudflare сервира сам; тук идват само тези, за които
   няма файл и заявката НЕ е навигация (виж нищоНеКриеИндекса долу).

   Махнатото Netlify-специфично: getDatabase → env.DB · Netlify.env → env · context.ip → CF-Connecting-IP.
   Администраторите: ADMINS (worker/lib/admins.mjs) + env.ADMIN_EMAILS (Variables в Cloudflare), чете се
   при всяка заявка — смяна на променливата важи веднага след деплоя.

   ПЪТ НАЗАД: файлът е нов — махни папката worker/, wrangler.toml и migrations/; Netlify версията е
   в dev/_netlify_staro/ (netlify/, netlify.toml, package.json).
   ───────────────────────────────────────────────────────────── */
import { makeApi } from "./lib/api.mjs";
import { makeRepo } from "./lib/repo.mjs";
import { parseAdminEmails, MSG } from "./lib/core.mjs";
import { ADMINS } from "./lib/admins.mjs";
import { json } from "./lib/http.mjs";

/** makeWorker({ now }) — за пробите (подменен часовник); Cloudflare ползва default (истинското време) */
export function makeWorker({ now } = {}) {
  /* един makeApi на env (в един изолат env е един и същ обект) — мързеливо, нищо при зареждане */
  const поEnv = new WeakMap();
  function apiЗа(env) {
    let api = поEnv.get(env);
    if (!api) {
      if (!env || !env.DB) throw new Error("няма D1 връзка env.DB — виж [[d1_databases]] в wrangler.toml");
      api = makeApi({
        repo: makeRepo(env.DB),
        adminEmails: () => parseAdminEmails(ADMINS.join(",") + "," + String(env.ADMIN_EMAILS || "")),
        ...(now ? { now } : {}),
      });
      поEnv.set(env, api);
    }
    return api;
  }

  /* 🪤 SPA режимът на Cloudflare дава index.html (200) за всеки липсващ адрес. За страница (навигация)
     това е искано. Но липсващ .js/.css/.png, дошъл като HTML 200, service worker-ът го запомня като
     скрипт (виж «отровен» в sw.js) — затова файл с разширение, за който се връща HTML, става 404. */
  function нищоНеКриеИндекса(url, res) {
    const последен = url.pathname.split("/").pop() || "";
    const сРазширение = /\.[A-Za-z0-9]{1,12}$/.test(последен) && !/\.html?$/i.test(последен);
    const тип = res.headers.get("content-type") || "";
    if (сРазширение && res.status === 200 && /text\/html/i.test(тип)) {
      return new Response("404 " + url.pathname, { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
    }
    return res;
  }

  return {
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
        try {
          const api = apiЗа(env);
          const fn = api.PATISHTA[url.pathname];
          if (!fn) return api.nyama();
          const ip = request.headers.get("CF-Connecting-IP") || "";
          return await fn(request, { ip });
        } catch (e) {
          console.error("[babyland-worker]", (e && e.stack) || e);
          return json(500, { error: MSG.internal });
        }
      }
      if (!env || !env.ASSETS) return new Response("няма ASSETS", { status: 500 });
      return нищоНеКриеИндекса(url, await env.ASSETS.fetch(request));
    },
  };
}

export default makeWorker();
