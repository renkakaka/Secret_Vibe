## Secret Vibe — Telegram Web App (React + Node + Prisma)

Анонимная мини‑соцсеть с флиртом, тайниками и интригой. Клиент: React/Vite, сервер: Node/Express + Prisma/SQLite.

### Структура

- `client` — мобильный Telegram WebApp‑интерфейс (React, Vite).
- `server` — REST API (Express, Prisma).
- `prisma/schema.prisma` — описание БД.

### Установка

1. Установите Node.js ≥ 18 и npm.
2. В корне:
   - `cd client`
   - `npm install`
   - `cd ../server`
   - `npm install`
   - `npx prisma generate`
   - `npx prisma db push` (создаст `dev.db` в папке `prisma`).

### Запуск

В отдельном терминале для API:

```bash
cd server
npm run dev
```

В отдельном терминале для клиента:

```bash
cd client
npm run dev
```

По умолчанию:

- API — `http://localhost:4000/api`
- Клиент — `http://localhost:5173`

### Работа через браузер (локально)

Для работы через браузер запустите оба сервера локально:

1. **Запусти API сервер** (в одном терминале):
   ```bash
   cd server
   npm run dev
   ```

2. **Запусти клиент** (в другом терминале):
   ```bash
   cd client
   npm run dev
   ```

3. Откройте в браузере: `http://localhost:5173`

Приложение будет работать полностью — лента, профиль, свайпы, чат, челленджи и коды. API будет доступен на `http://localhost:4000/api`.

### Деплой на Netlify

1. Подключите репозиторий к Netlify.
2. В настройках сборки укажите:
   - **Base directory**: `client` (или оставьте пустым, если используете `netlify.toml`)
   - **Build command**: оставьте пустым (используется из `netlify.toml`)
   - **Publish directory**: `dist` (или оставьте пустым)
3. После деплоя скопируйте URL и используйте его в `@BotFather` как WebApp URL.

**Примечание**: После деплоя на Netlify нужно будет также задеплоить API сервер (например, на Railway, Render или VPS) и добавить переменную окружения `VITE_API_BASE` в Netlify с URL вашего API.

### Telegram WebApp / OAuth

В этом шаблоне есть заготовка middleware под Telegram initData. Для боевого режима:

- Получите `TELEGRAM_WEBAPP_SECRET` у `@BotFather`.
- В `server/src/index.ts` внутри middleware реализуйте валидацию initData согласно официальной документации Telegram.




