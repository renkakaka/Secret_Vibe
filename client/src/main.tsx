import React from 'react';
import ReactDOM from 'react-dom/client';
import { SecretVibeApp } from './SecretVibeApp';
import './styles.css';

// Точка входа Telegram WebApp / мобильного SPA
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SecretVibeApp />
  </React.StrictMode>,
);




