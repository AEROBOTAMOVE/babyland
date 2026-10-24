# Бейби Ленд в Cloudflare — стъпка по стъпка

*22.10.2026 · Сайтът и профилите (регистрация, вход, админ) вече вървят на Cloudflare вместо на Netlify.
Приложението и думите са същите: 14 дни безплатно, после 15 € на месец, контактите, SOS 112.*

Какво има в хранилището:

| Файл / папка | Какво е |
|---|---|
| `wrangler.toml` | настройките на Cloudflare (името `babyland`, базата, сайтът от `dist/`) |
| `worker/` | сървърът: `/api/register`, `/api/login`, `/api/logout`, `/api/me`, `/api/admin/…` |
| `migrations/` | таблиците на базата (D1): профили, вписвания, дневникът на админа |
| `build.js` | сглобява сайта в `dist/` (`node build.js`) |

---

## 1. Акаунт и план

1. Влез в **dash.cloudflare.com** (или си направи акаунт).
2. **Workers & Pages → Plans** → избери **Workers Paid ($5 на месец)**.
   Защо платеният: паролите се пазят като scrypt хеш — това е нарочно бавна сметка (десетки милисекунди).
   Безплатният план дава 10 ms процесорно време на заявка и регистрацията/входът щяха да падат.

## 2. Качването — двоен клик на `КАЧИ.cmd` и толкова

След т. 1 (платен план): **двоен клик на `КАЧИ.cmd`** в папката `babyland`. Той прави сам, поред: вход в Cloudflare
(одобряваш в браузъра) → базата D1 „babyland“ (създава я, ако я няма, и слага id-то в `wrangler.toml`) → проверка на
достъпа без мрежа (125/125) → сглобяване → таблиците → качване → по желание още администратори → проверка на живия
сайт. Накрая един ред: **„ГОТОВО · адрес … · проверка 6/6“** или **„СПРЯНО · <стъпка> · <защо>“**.
Повторното пускане е безопасно. Път назад: `wrangler.toml.predi` и `npx wrangler rollback`.
Трябва ти Node.js с `npx` — ако `КАЧИ.cmd` каже „няма npx“, инсталирай **Node.js LTS** от https://nodejs.org и пусни пак.
След „ГОТОВО“ — веднага т. 4 (регистрирай `aaeromove@gmail.com`). Т. 3 (GitHub) е по желание: за автоматично качване при всеки комит.

*Мерено на този компютър (24.10):* `wrangler deploy --dry-run` с wrangler 4.152.0 пакетира worker-а (38 КБ, 322 файла,
DB + ASSETS); пътят на майката срещу този пакет — 20/20. Локалният двигател `wrangler dev` **не тръгва** тук: Windows
(Smart App Control) блокира неподписания `workerd.exe`. На качването това НЕ пречи — там workerd не се пуска локално.
С wrangler 3 конфигурацията се отказва (`run_worker_first` като масив е от wrangler 4) — затова КАЧИ ползва точно `wrangler@4.152.0` (пробваната).

### Ръчно (резерва) — базата (D1)

На компютъра, в папката `babyland` (трябва ти Node — `npx` идва с него):

```
npx wrangler login
npx wrangler d1 create babyland
```

Командата отпечатва `database_id = "…"`. Копирай това число и го сложи в `wrangler.toml` на мястото на
`ЗАМЕНИ_С_ID`. После направи таблиците:

```
npx wrangler d1 migrations apply babyland --remote
```

Трябва да види и приложи `0001_create-auth.sql` и `0002_create-admin-log.sql`.
(Без интернет конзола: Cloudflare → **Storage & Databases → D1 → babyland → Console** — постави съдържанието
на двата файла от `migrations/` един след друг и натисни **Execute**. Таблиците са с `IF NOT EXISTS` —
повторното пускане не чупи нищо.)

Качи промяната на `wrangler.toml` (с истинското id) в GitHub.

## 3. Свързване с GitHub (Workers Builds) — препоръчано

1. **Workers & Pages → Create → Import a repository** → GitHub → **AEROBOTAMOVE/babyland**, клон `main`.
2. Име на проекта: **babyland** (трябва да съвпада с `name` в `wrangler.toml`).
3. **Build command:** `node build.js`
4. **Deploy command:** `npx wrangler deploy` (така е по подразбиране)
5. Root directory: празно (коренът на хранилището). Нищо не се инсталира — `build.js` е чист node.
6. **Save and Deploy.** Оттук нататък всяко качване в `main` се публикува само.

*Друг път (без GitHub):* `node build.js` и после `npx wrangler deploy` от папката `babyland`.

## 4. Администратор — ВЕДНАГА след първия деплой

**Отвори сайта и се регистрирай с `aaeromove@gmail.com` и своя парола — веднага.**
Този имейл е записан в сървъра (`worker/lib/admins.mjs`) и е администратор от първия ден.
Имейлът не се потвърждава с писмо: **който пръв го регистрира, държи профила** — не чакай.

Още администратори (по желание): Worker **babyland → Settings → Variables and Secrets → Add** →
име `ADMIN_EMAILS`, стойност `drug@abv.bg` (няколко — със запетая) → **Deploy**.
Първо човекът се регистрира, после имейлът влиза в `ADMIN_EMAILS`.
(`keep_vars = true` в `wrangler.toml` пази тази стойност при следващите деплои.)

## 5. Домейн

Worker **babyland → Settings → Domains & Routes → Add → Custom domain** → напр. `app.babylandeu.com`.
Домейнът трябва да е в Cloudflare (DNS при Cloudflare). Докато го няма, сайтът е на `babyland.<твоят-акаунт>.workers.dev`.

## 6. Проверка (2 минути)

1. Отвори `https://<сайтът>/api/me` **без да си влязъл** → трябва да излезе кратък текст:
   `{"error":"Първо влез в профила си.","logged_in":false, …}` — **не** страницата на приложението.
   Ако излезе страницата — Worker-ът не е качен (виж т. 3).
2. Влез като `aaeromove@gmail.com` и отвори пак `/api/me` → `"status":"admin"`.
3. В приложението: **Достъп → Администрация** → вижда се списъкът с профилите.

## Ако нещо се обърка

- **„Вътрешна грешка. Опитай пак след малко.“ при регистрация** → базата няма таблици (т. 2, `migrations apply`)
  или `database_id` в `wrangler.toml` е още `ЗАМЕНИ_С_ID`.
- Логовете: Worker **babyland → Observability / Logs**.
- **Път назад към Netlify:** всичко отпреди 22.10 е в `dev/_netlify_staro/` (`netlify/`, `netlify.toml`, `package.json`).
  Профилите в Netlify и в Cloudflare са **отделни бази** — който се е регистрирал в едната, го няма в другата.
