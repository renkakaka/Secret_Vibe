import React, { useEffect, useState } from 'react';
import { Post, Tag, TelegramUser } from '../types';

interface Props {
  apiBase: string;
  telegramUser: TelegramUser;
}

// Лента анонимных постов (Instagram‑стиль)
export const FeedScreen: React.FC<Props> = ({ apiBase, telegramUser }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [creating, setCreating] = useState(false);
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/posts`);
        const data = (await res.json()) as Post[];
        setPosts(data);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [apiBase]);

  const toggleLike = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, liked: !p.liked } : p)),
    );
    // На сервере можно хранить лайки по userId
    try {
      await fetch(`${apiBase}/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: telegramUser.id }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async () => {
    if (!content.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${apiBase}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: telegramUser.id,
          content,
          mediaUrl: mediaUrl || undefined,
          tags,
        }),
      });
      const created = (await res.json()) as Post;
      setPosts((prev) => [created, ...prev]);
      setContent('');
      setMediaUrl('');
      setTags([]);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="screen feed-screen">
      <section className="card create-post-card">
        <textarea
          className="field-input field-input--textarea"
          placeholder="Поделись тайным вайбом... 💭"
          maxLength={280}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          className="field-input"
          placeholder="Ссылка на фото/видео (опционально)"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
        />
        <div className="tags-row tags-row--compact">
          {(['Флирт', 'Романтика', 'Страсть', 'Юмор', 'Тайные желания'] as Tag[]).map((t) => (
            <button
              key={t}
              className={tags.includes(t) ? 'tag tag--active' : 'tag'}
              onClick={() =>
                setTags((prev) =>
                  prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
                )
              }
            >
              {t}
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-full" disabled={creating} onClick={handleCreate}>
          {creating ? 'Отправляем...' : 'Запустить вайб'}
        </button>
      </section>

      <section className="feed-list">
        {posts.map((post) => (
          <article key={post.id} className="card post-card post-card--enter">
            <div className="post-header">
              <div className="avatar-circle avatar-circle--small">
                <span>🕶</span>
              </div>
              <div className="post-header-meta">
                <span className="post-nickname">Аноним</span>
                <span className="post-time">
                  {new Date(post.timestamp).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <p className="post-content">{post.content}</p>

            {post.mediaUrl && (
              <div className="post-media">
                <img src={post.mediaUrl} alt="media" />
              </div>
            )}

            {post.tags.length > 0 && (
              <div className="tags-row tags-row--compact">
                {post.tags.map((t) => (
                  <span key={t} className="tag tag--pill">
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="post-actions">
              <button
                className={post.liked ? 'icon-btn icon-btn--accent' : 'icon-btn'}
                onClick={() => toggleLike(post.id)}
              >
                ❤️
              </button>
              <button
                className="icon-btn"
                onClick={() => alert('Анонимные ответы/комменты можно расширить позже.')}
              >
                💬
              </button>
              <button
                className="icon-btn"
                onClick={() => alert('Тайник откроется после мини‑челленджа.')}
              >
                🔒
              </button>
            </div>
          </article>
        ))}

        {posts.length === 0 && (
          <p className="empty-text">Пока тихо... Запусти первый тайный вайб ✨</p>
        )}
      </section>
    </div>
  );
};




