import React, { useEffect, useRef, useState } from 'react';
import { Message, TelegramUser } from '../types';

interface Props {
  apiBase: string;
  telegramUser: TelegramUser;
  matchId: string;
}

// Анонимный чат с таймером самоуничтожения
export const ChatScreen: React.FC<Props> = ({ apiBase, telegramUser, matchId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const loadMessages = async () => {
    try {
      const res = await fetch(`${apiBase}/matches/${matchId}/messages`);
      const data = (await res.json()) as Message[];
      setMessages(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadMessages();
    const id = window.setInterval(loadMessages, 5000);
    return () => window.clearInterval(id);
  }, [apiBase, matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!content.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${apiBase}/matches/${matchId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: telegramUser.id,
          content,
          selfDestructInSeconds: 3600,
        }),
      });
      const msg = (await res.json()) as Message;
      setMessages((prev) => [...prev, msg]);
      setContent('');
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const formatTimer = (selfDestructAt: string) => {
    const msLeft = new Date(selfDestructAt).getTime() - Date.now();
    if (msLeft <= 0) return '00:00';
    const totalSec = Math.floor(msLeft / 1000);
    const min = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const sec = String(totalSec % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  const handleSelfDestructNow = async (messageId: string) => {
    try {
      await fetch(`${apiBase}/messages/${messageId}/self-destruct`, {
        method: 'POST',
      });
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="screen chat-screen">
      <div className="chat-messages">
        {messages.map((msg) => {
          const isMine = msg.senderId === telegramUser.id;
          return (
            <div
              key={msg.id}
              className={isMine ? 'chat-bubble chat-bubble--mine' : 'chat-bubble'}
            >
              <p className="chat-bubble-text">{msg.content}</p>
              <div className="chat-bubble-meta">
                <span className="chat-bubble-time">
                  {new Date(msg.timestamp).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="chat-bubble-timer">⏱ {formatTimer(msg.selfDestructAt)}</span>
                {isMine && (
                  <button
                    className="chat-bubble-destroy"
                    onClick={() => handleSelfDestructNow(msg.id)}
                  >
                    Самоуничтожить
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <button
          className="icon-btn icon-btn--ghost"
          onClick={() => alert('Эмодзи/реакции можно интегрировать позже.')}
        >
          😊
        </button>
        <input
          className="field-input chat-input"
          placeholder="Шепни свой секрет..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button className="btn btn-primary chat-send-btn" disabled={sending} onClick={handleSend}>
          ➤
        </button>
      </div>
    </div>
  );
};




