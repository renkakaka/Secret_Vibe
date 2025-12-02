import React, { useEffect, useState } from 'react';
import { Match, Tag, TelegramUser, UserProfile } from '../types';

interface Props {
  apiBase: string;
  telegramUser: TelegramUser;
  onOpenChat: (matchId: string) => void;
}

interface SwipeProfile extends UserProfile {
  distance?: number;
}

// Свайпы/совпадения (Tinder‑стиль)
export const SwipeScreen: React.FC<Props> = ({ apiBase, telegramUser, onOpenChat }) => {
  const [queue, setQueue] = useState<SwipeProfile[]>([]);
  const [anim, setAnim] = useState<'left' | 'right' | null>(null);
  const [current, setCurrent] = useState<SwipeProfile | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/swipe/candidates?userId=${telegramUser.id}`);
        const data = (await res.json()) as SwipeProfile[];
        setQueue(data);
        setCurrent(data[0] ?? null);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [apiBase, telegramUser.id]);

  const shiftQueue = () => {
    setQueue((prev) => {
      const [, ...rest] = prev;
      setCurrent(rest[0] ?? null);
      return rest;
    });
  };

  const swipe = async (direction: 'left' | 'right') => {
    if (!current) return;
    setAnim(direction);
    setTimeout(() => {
      setAnim(null);
      shiftQueue();
    }, 240);

    // Отправляем решение на сервер
    if (direction === 'right') {
      try {
        const res = await fetch(`${apiBase}/swipe/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromUserId: telegramUser.id,
            toUserId: current.id,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { match?: Match };
          if (data.match) {
            onOpenChat(data.match.id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (!current) {
    return (
      <div className="screen screen--center">
        <p className="empty-text">
          На сегодня всё. Приходи позже — новые тайные профили уже в пути 🔥
        </p>
      </div>
    );
  }

  const renderTags = (tags: Tag[]) => (
    <div className="tags-row">
      {tags.map((t) => (
        <span key={t} className="tag tag--pill">
          {t}
        </span>
      ))}
    </div>
  );

  return (
    <div className="screen swipe-screen">
      <div
        className={
          anim === 'left'
            ? 'swipe-card card swipe-card--left'
            : anim === 'right'
            ? 'swipe-card card swipe-card--right'
            : 'swipe-card card'
        }
      >
        <div className="swipe-avatar">
          <div className="avatar-circle avatar-circle--xl">
            <span>{current.nickname[0]?.toUpperCase()}</span>
          </div>
        </div>
        <h2 className="swipe-nickname">{current.nickname}</h2>
        {renderTags(current.tags)}
        <p className="swipe-subtitle">Анонимный вайб рядом с тобой</p>
      </div>

      <div className="swipe-actions">
        <button className="swipe-btn swipe-btn--no" onClick={() => swipe('left')}>
          👎
        </button>
        <button className="swipe-btn swipe-btn--yes" onClick={() => swipe('right')}>
          👍
        </button>
      </div>
    </div>
  );
};




