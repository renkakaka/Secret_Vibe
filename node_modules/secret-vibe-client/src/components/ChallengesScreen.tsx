import React, { useEffect, useState } from 'react';
import { Challenge, TelegramUser } from '../types';

interface Props {
  apiBase: string;
  telegramUser: TelegramUser;
}

// Тайники и мини‑челленджи
export const ChallengesScreen: React.FC<Props> = ({ apiBase, telegramUser }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  const load = async () => {
    try {
      const res = await fetch(`${apiBase}/challenges?userId=${telegramUser.id}`);
      const data = (await res.json()) as Challenge[];
      setChallenges(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: Challenge['status']) => {
    try {
      await fetch(`${apiBase}/challenges/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="screen challenges-screen">
      <section className="card hint-card">
        <p>
          Выполняй мини‑челленджи, чтобы открывать тайники с особыми вайбами и возможностями в
          Secret Vibe.
        </p>
      </section>

      <section className="challenge-list">
        {challenges.map((ch) => (
          <article key={ch.id} className="card challenge-card challenge-card--enter">
            <h2 className="challenge-title">{ch.type}</h2>
            <p className="challenge-reward">Награда: {ch.reward}</p>
            {typeof ch.progress === 'number' && (
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${ch.progress}%` }} />
              </div>
            )}
            <div className="challenge-actions">
              {ch.status !== 'done' && (
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => updateStatus(ch.id, 'in_progress')}
                >
                  Выполнить
                </button>
              )}
              {ch.status === 'in_progress' && (
                <button
                  className="btn btn-ghost btn-small"
                  onClick={() => updateStatus(ch.id, 'done')}
                >
                  Я справился
                </button>
              )}
              {ch.status !== 'done' && (
                <button
                  className="btn btn-ghost btn-small"
                  onClick={() => updateStatus(ch.id, 'pending')}
                >
                  Пропустить
                </button>
              )}
            </div>
          </article>
        ))}

        {challenges.length === 0 && (
          <p className="empty-text">
            Тайники пока спрятаны. Зайди позже — игра только начинается 🗝
          </p>
        )}
      </section>
    </div>
  );
};




