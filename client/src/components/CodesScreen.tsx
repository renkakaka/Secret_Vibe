import React, { useEffect, useState } from 'react';
import { TelegramUser } from '../types';

interface Props {
  apiBase: string;
  telegramUser: TelegramUser;
}

// Приглашения и секретные коды
export const CodesScreen: React.FC<Props> = ({ apiBase, telegramUser }) => {
  const [code, setCode] = useState<string>('');
  const [inputCode, setInputCode] = useState('');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/codes/${telegramUser.id}`);
        const data = (await res.json()) as { code: string };
        setCode(data.code);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [apiBase, telegramUser.id]);

  const handleShare = () => {
    const text = `Мой секретный код в Secret Vibe: ${code}`;
    if (navigator.share) {
      navigator
        .share({
          title: 'Secret Vibe',
          text,
        })
        .catch(() => {
          // ignore
        });
    } else {
      navigator.clipboard
        .writeText(text)
        .then(() => setStatus('Код скопирован в буфер обмена'))
        .catch(() => setStatus('Не удалось скопировать код'));
    }
  };

  const handleApply = async () => {
    setStatus('');
    try {
      const res = await fetch(`${apiBase}/codes/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: telegramUser.id, code: inputCode }),
      });
      if (!res.ok) {
        const err = await res.json();
        setStatus(err.message || 'Код не сработал');
      } else {
        const data = await res.json();
        setStatus(data.message || 'Тайник открыт! 🗝');
      }
    } catch (e) {
      console.error(e);
      setStatus('Ошибка при проверке кода');
    }
  };

  return (
    <div className="screen codes-screen">
      <section className="card code-card">
        <h2 className="code-title">Твой секретный код</h2>
        <div className="code-display">{code || '••••••'}</div>
        <button className="btn btn-primary btn-full" onClick={handleShare}>
          Поделиться кодом
        </button>
      </section>

      <section className="card code-card">
        <h2 className="code-title">Код друга</h2>
        <input
          className="field-input"
          placeholder="Введи секретный код"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.toUpperCase())}
        />
        <button className="btn btn-ghost btn-full" onClick={handleApply}>
          Открыть тайник
        </button>
        {status && <p className="status-text">{status}</p>}
      </section>
    </div>
  );
};




