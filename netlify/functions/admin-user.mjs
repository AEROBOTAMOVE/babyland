// Бейби Ленд · 21.10 · достъп · тънка обвивка (като AERO) · ПЪТ НАЗАД: файлът е нов — махни папката netlify/.
import { getApi } from "./_lib/runtime.mjs";

export default async (req, context) => getApi().adminUser(req, context);

export const config = { path: "/api/admin/user" };
