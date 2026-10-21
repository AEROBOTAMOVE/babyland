/* Бейби Ленд · свързването с Netlify (база + променливи на средата)
   21.10 · достъп · пренесено от AERO клиент (_lib/runtime.mjs) и ОРЯЗАНО: само базата и админите.
   Единственият модул, който внася @netlify/database. Всичко се създава
   мързеливо при първата заявка — нищо не се изпълнява при зареждане.
   ПЪТ НАЗАД: файлът е нов — махни папката netlify/. */
import { getDatabase } from "@netlify/database";
import { makeRepo } from "./repo.mjs";
import { makeApi } from "./api.mjs";
import { parseAdminEmails } from "./core.mjs";
import { ADMINS } from "./admins.mjs";

let api = null;

function readEnv(name) {
  try {
    return (globalThis.Netlify && globalThis.Netlify.env && globalThis.Netlify.env.get(name)) || "";
  } catch (e) {
    return "";
  }
}

export function getApi() {
  if (!api) {
    const db = getDatabase();
    const sql = (strings, ...values) => db.sql(strings, ...values);
    api = makeApi({
      repo: makeRepo(sql),
      // като AERO (15.09): списъкът в admins.mjs е основният, ADMIN_EMAILS от Netlify се добавя към него
      adminEmails: () => parseAdminEmails(ADMINS.join(",") + "," + readEnv("ADMIN_EMAILS")),
    });
  }
  return api;
}
