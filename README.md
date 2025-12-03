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

### Деплой на Netlify

1. Подключите репозиторий к Netlify.
2. В настройках сборки укажите:
   - **Base directory**: `client`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `client/dist`
3. Добавьте переменную окружения:
   - `VITE_API_BASE` = URL вашего API сервера (например, `https://your-api.railway.app/api`)
4. После деплоя скопируйте URL и используйте его в `@BotFather` как WebApp URL.

### Telegram WebApp / OAuth

В этом шаблоне есть заготовка middleware под Telegram initData. Для боевого режима:

- Получите `TELEGRAM_WEBAPP_SECRET` у `@BotFather`.
- В `server/src/index.ts` внутри middleware реализуйте валидацию initData согласно официальной документации Telegram.




