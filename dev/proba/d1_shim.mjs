// 🧪 22.10 · Cloudflare · D1-ШИМ върху node:sqlite (in-memory) — само за пробите, без мрежа.
// Подражава на частта от D1 API, която ползва worker/lib/repo.mjs:
//   db.prepare(sql).bind(...).run() / .all() / .first(колона?) · db.exec(sql) · db.batch([...])
// Строг като D1: undefined като параметър → грешка (D1_TYPE_ERROR); boolean → 1/0; чуждите ключове ВКЛЮЧЕНИ.
// makeD1(): нова празна база · prilozhiMigracii(db): пуска migrations/*.sql по ред (като wrangler d1 migrations apply).
// ПЪТ НАЗАД: махни файла.
import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const КОРЕН = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function стойност(x) {
  if (x === undefined) throw new Error("D1_TYPE_ERROR: Type 'undefined' not supported for value 'undefined'");
  if (typeof x === "boolean") return x ? 1 : 0;
  if (x === null || typeof x === "number" || typeof x === "string" || typeof x === "bigint") return x;
  throw new Error("D1_TYPE_ERROR: Type '" + typeof x + "' not supported");
}
const чист = (r) => (r ? { ...r } : r);

class Заявка {
  constructor(db, sql, параметри = []) { this.db = db; this.sql = sql; this.п = параметри; this.db._заявки.push({ sql, п: параметри }); }
  bind(...п) { return new Заявка(this.db, this.sql, п.map(стойност)); }
  _st() { return this.db._s.prepare(this.sql); }
  async run() {
    const r = this._st().run(...this.п);
    return { success: true, results: [], meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
  }
  async all() { return { success: true, results: this._st().all(...this.п).map(чист), meta: {} }; }
  async first(колона) {
    const r = this._st().get(...this.п);
    if (r === undefined) return null;
    return колона ? r[колона] : чист(r);
  }
  async raw() { const s = this._st(); s.setReturnArrays(true); return s.all(...this.п); }
}

export function makeD1() {
  const s = new DatabaseSync(":memory:", { enableForeignKeyConstraints: true });
  const db = {
    _s: s,
    _заявки: [],
    prepare(sql) { return new Заявка(db, sql); },
    async exec(sql) { s.exec(sql); return { count: 1, duration: 0 }; },
    async batch(списък) {
      s.exec("BEGIN");
      try { const р = []; for (const з of списък) р.push(await з.all()); s.exec("COMMIT"); return р; }
      catch (e) { s.exec("ROLLBACK"); throw e; }
    },
  };
  return db;
}

export function migracii() {
  const папка = join(КОРЕН, "migrations");
  return readdirSync(папка).filter((f) => /^\d{4}_.+\.sql$/.test(f)).sort().map((f) => ({ име: f, sql: readFileSync(join(папка, f), "utf8") }));
}
export async function prilozhiMigracii(db) {
  const м = migracii();
  for (const x of м) await db.exec(x.sql);
  return м.map((x) => x.име);
}
