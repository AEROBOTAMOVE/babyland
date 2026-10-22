/* Бейби Ленд · HTTP помощници (JSON отговори, бисквитката, CSRF пазачът)
   21.10 · достъп · пренесено от AERO клиент (_lib/http.mjs); бисквитката е «bl_s».
   22.10 · Cloudflare · преместено от netlify/functions/_lib/ без промяна.
   ПЪТ НАЗАД: копието отпреди 22.10 е в dev/_netlify_staro/netlify/functions/_lib/. */
import { COOKIE_NAME, SESSION_DAYS, MSG } from "./core.mjs";

/* Vary: * — Cache API (caches.put) отказва такъв отговор по спецификацията. sw.js на приложението е «кеш-първо»
   за всеки GET, който не е страница; без това /api/me щеше да остане запазен завинаги (вписан след изход,
   «активен» след края на срока). Отделно sw.js трябва изобщо да не пипа /api/* — това е само втори колан. */
export const API_HEADERS = Object.freeze({ "Cache-Control": "no-store", "Vary": "*", "X-Content-Type-Options": "nosniff" });

export function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...API_HEADERS,
      ...headers,
    },
  });
}

/** HttpOnly (скриптът на страницата не я вижда) · Secure · SameSite=Lax (чужд сайт не я праща с POST) */
export function sessionCookie(token, maxAgeSec = SESSION_DAYS * 86400) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSec}`;
}
export function clearCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
export function readCookie(header, name = COOKIE_NAME) {
  if (!header) return null;
  for (const part of String(header).split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

/** CSRF пазач: промяна само със Content-Type: application/json
    (чужд сайт не може да прати такава заявка без CORS разрешение, а такова няма) */
export function isJsonRequest(req) {
  const ct = (req.headers.get("content-type") || "").toLowerCase();
  return ct.split(";")[0].trim() === "application/json";
}

/** { value } или { error: Response } · празно тяло = {} */
export async function readJsonBody(req, maxChars = 10000) {
  let text;
  try {
    text = await req.text();
  } catch (e) {
    return { error: json(400, { error: MSG.badJson }) };
  }
  if (text.length > maxChars) return { error: json(413, { error: MSG.tooBig }) };
  if (!text.trim()) return { value: {} };
  try {
    const v = JSON.parse(text);
    if (!v || typeof v !== "object" || Array.isArray(v)) return { error: json(400, { error: MSG.badJson }) };
    return { value: v };
  } catch (e) {
    return { error: json(400, { error: MSG.badJson }) };
  }
}
