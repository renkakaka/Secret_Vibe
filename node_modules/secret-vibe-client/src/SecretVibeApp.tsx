import React, { useEffect, useState } from 'react';
import { MainMenu } from './components/MainMenu';
import { ProfileScreen } from './components/ProfileScreen';
import { FeedScreen } from './components/FeedScreen';
import { SwipeScreen } from './components/SwipeScreen';
import { ChatScreen } from './components/ChatScreen';
import { ChallengesScreen } from './components/ChallengesScreen';
import { CodesScreen } from './components/CodesScreen';
import { TelegramUser, ViewId } from './types';

// Базовый URL API — при необходимости замените на прод/тестовый
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export const SecretVibeApp: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewId>('feed');
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  // Инициализация пользователя.
  // В Telegram WebApp используем только его numeric id, НЕ показываем имя/username — полная анонимность.
  useEffect(() => {
    // 1) Попытка взять сохранённую сессию
    const saved = window.localStorage.getItem('secret-vibe-user');
    if (saved) {
      setTelegramUser(JSON.parse(saved));
      return;
    }

    // 2) Если приложение открыто ВНУТРИ Telegram WebApp — берём только user.id
    const anyWindow = window as any;
    const tg = anyWindow.Telegram?.WebApp;
    const tgUser = tg?.initDataUnsafe?.user;
    if (tgUser && tgUser.id) {
      const anonFromTelegram: TelegramUser = {
        id: String(tgUser.id),
        // Имя и username Telegram намеренно НЕ используем, чтобы сохранить анонимность
        first_name: 'Гость',
        username: undefined,
      };
      setTelegramUser(anonFromTelegram);
      window.localStorage.setItem('secret-vibe-user', JSON.stringify(anonFromTelegram));
      return;
    }

    // 3) Фолбэк: полностью анонимный гость вне Telegram
    const guestUser: TelegramUser = {
      id: 'guest-' + Math.random().toString(36).slice(2),
      first_name: 'Гость',
      username: 'anonymous',
    };
    setTelegramUser(guestUser);
    window.localStorage.setItem('secret-vibe-user', JSON.stringify(guestUser));
  }, []);

  const handleOpenChat = (matchId: string) => {
    setActiveMatchId(matchId);
    setActiveView('chat');
  };

  if (!telegramUser) {
    return (
      <div className="app-root app-root--loading">
        <div className="loader-ring" />
        <p className="loader-text">Secret Vibe загружается...</p>
      </div>
    );
  }

  return (
    <div className="app-root">
      <div className="app-shell">
        <header className="app-header">
          <h1 className="logo">
            Secret <span>Vibe</span>
          </h1>
        </header>

        <main className="app-main">
          {activeView === 'profile' && (
            <ProfileScreen apiBase={API_BASE} telegramUser={telegramUser} />
          )}
          {activeView === 'feed' && (
            <FeedScreen apiBase={API_BASE} telegramUser={telegramUser} />
          )}
          {activeView === 'swipe' && (
            <SwipeScreen apiBase={API_BASE} telegramUser={telegramUser} onOpenChat={handleOpenChat} />
          )}
          {activeView === 'chat' && activeMatchId && (
            <ChatScreen apiBase={API_BASE} telegramUser={telegramUser} matchId={activeMatchId} />
          )}
          {activeView === 'challenges' && (
            <ChallengesScreen apiBase={API_BASE} telegramUser={telegramUser} />
          )}
          {activeView === 'codes' && (
            <CodesScreen apiBase={API_BASE} telegramUser={telegramUser} />
          )}
        </main>

        <MainMenu activeView={activeView} onChangeView={setActiveView} />
      </div>
    </div>
  );
};




