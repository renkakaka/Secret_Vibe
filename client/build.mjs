import { build } from 'vite';

// Запуск сборки Vite через JS‑API, чтобы Netlify не вызывал бинарник напрямую
build()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Vite build completed');
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });


