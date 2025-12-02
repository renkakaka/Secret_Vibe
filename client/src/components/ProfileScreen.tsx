import React, { useEffect, useState } from 'react';
import { Tag, TelegramUser, UserProfile } from '../types';

const ALL_TAGS: Tag[] = ['Флирт', 'Романтика', 'Страсть', 'Юмор', 'Тайные желания'];

const generateAnonNickname = () => {
  const code = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `Тайный гость #${code}`;
};

interface Props {
  apiBase: string;
  telegramUser: TelegramUser;
}

// Экран анонимного профиля
export const ProfileScreen: React.FC<Props> = ({ apiBase, telegramUser }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/profile/${telegramUser.id}`);
        if (res.ok) {
          const data = (await res.json()) as UserProfile;
          setProfile(data);
        } else {
          // Создаём дефолтный профиль
          const createdRes = await fetch(`${apiBase}/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: telegramUser.id,
              // Ник генерируем сами, Telegram‑данные не используем
              nickname: generateAnonNickname(),
              tags: ['Флирт', 'Юмор'],
            }),
          });
          const created = (await createdRes.json()) as UserProfile;
          setProfile(created);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiBase, telegramUser.id]);

  const toggleTag = (tag: Tag) => {
    if (!profile) return;
    const has = profile.tags.includes(tag);
    const next = {
      ...profile,
      tags: has ? profile.tags.filter((t) => t !== tag) : [...profile.tags, tag],
    };
    setProfile(next);
  };

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await fetch(`${apiBase}/profile/${telegramUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: profile.nickname,
          avatarUrl: profile.avatarUrl,
          tags: profile.tags,
        }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="screen screen--center">
        <div className="loader-ring" />
        <p className="loader-text">Загружаем твой тайный образ...</p>
      </div>
    );
  }

  return (
    <div className="screen profile-screen">
      <section className="card profile-card">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="avatar" />
            ) : (
              <span>{profile.nickname[0]?.toUpperCase()}</span>
            )}
          </div>
          <button
            className="btn btn-ghost btn-ghost--small"
            onClick={() => alert('В демо аватар вводится как URL в коде профиля.')}
          >
            Изменить аватар
          </button>
        </div>

        <div className="profile-main">
          <label className="field-label">Никнейм</label>
          <input
            className="field-input"
            value={profile.nickname}
            onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
          />

          <label className="field-label">Твои вайбы</label>
          <div className="tags-row">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                className={
                  profile.tags.includes(tag) ? 'tag tag--active tag--big' : 'tag tag--big'
                }
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <button className="btn btn-primary btn-full" disabled={loading} onClick={handleSave}>
            {loading ? 'Сохраняем...' : 'Сохранить образ'}
          </button>
        </div>
      </section>

      <section className="card hint-card">
        <p>
          В Secret Vibe ты полностью анонимен. Ник, аватар и теги видны только как образ — без
          привязки к твоему Telegram.
        </p>
      </section>
    </div>
  );
};




