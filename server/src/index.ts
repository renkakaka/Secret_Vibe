import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: '*', // в проде замените на домен Telegram WebApp
  }),
);
app.use(express.json());

// Простая middleware для Telegram WebApp / OAuth
// В реальном приложении здесь нужно проверять подпись initData от Telegram.
app.use((req, _res, next) => {
  // Пока что просто пропускаем запрос и считаем userId как присланный в теле/квери.
  // TODO: добавить проверку подписи Telegram initData.
  next();
});

// --- Профиль пользователя ---
app.get('/api/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ message: 'Not found' });
  }
  return res.json({
    id: user.id,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl || undefined,
    tags: JSON.parse(user.tags),
  });
});

app.post('/api/profile', async (req, res) => {
  const { userId, nickname, avatarUrl, tags } = req.body as {
    userId: string;
    nickname: string;
    avatarUrl?: string;
    tags: string[];
  };
  const created = await prisma.user.upsert({
    where: { id: userId },
    update: {
      nickname,
      avatarUrl,
      tags: JSON.stringify(tags ?? []),
    },
    create: {
      id: userId,
      nickname,
      avatarUrl,
      tags: JSON.stringify(tags ?? []),
    },
  });
  res.json({
    id: created.id,
    nickname: created.nickname,
    avatarUrl: created.avatarUrl || undefined,
    tags: JSON.parse(created.tags),
  });
});

app.put('/api/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const { nickname, avatarUrl, tags } = req.body as {
    nickname: string;
    avatarUrl?: string;
    tags: string[];
  };
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      nickname,
      avatarUrl,
      tags: JSON.stringify(tags ?? []),
    },
  });
  res.json({
    id: updated.id,
    nickname: updated.nickname,
    avatarUrl: updated.avatarUrl || undefined,
    tags: JSON.parse(updated.tags),
  });
});

// --- Посты ---
app.get('/api/posts', async (_req, res) => {
  const posts = await prisma.post.findMany({
    orderBy: { timestamp: 'desc' },
    take: 50,
  });
  res.json(
    posts.map((p) => ({
      id: p.id,
      userId: p.userId,
      content: p.content,
      mediaUrl: p.mediaUrl || undefined,
      tags: JSON.parse(p.tags),
      timestamp: p.timestamp,
    })),
  );
});

app.post('/api/posts', async (req, res) => {
  const { userId, content, mediaUrl, tags } = req.body as {
    userId: string;
    content: string;
    mediaUrl?: string;
    tags: string[];
  };
  const post = await prisma.post.create({
    data: {
      userId,
      content,
      mediaUrl,
      tags: JSON.stringify(tags ?? []),
    },
  });
  res.json({
    id: post.id,
    userId: post.userId,
    content: post.content,
    mediaUrl: post.mediaUrl || undefined,
    tags: JSON.parse(post.tags),
    timestamp: post.timestamp,
  });
});

app.post('/api/posts/:postId/like', async (_req, res) => {
  // Лайки можно хранить в отдельной таблице; для демо просто шлём ok
  res.json({ ok: true });
});

// --- Свайпы и совпадения ---
app.get('/api/swipe/candidates', async (req, res) => {
  const userId = req.query.userId as string;
  const users = await prisma.user.findMany({
    where: { id: { not: userId } },
    take: 30,
  });
  res.json(
    users.map((u) => ({
      id: u.id,
      nickname: u.nickname,
      avatarUrl: u.avatarUrl || undefined,
      tags: JSON.parse(u.tags),
    })),
  );
});

app.post('/api/swipe/like', async (req, res) => {
  const { fromUserId, toUserId } = req.body as { fromUserId: string; toUserId: string };
  // В демо считаем, что всегда есть взаимный лайк и сразу создаём match.
  const existing = await prisma.match.findFirst({
    where: {
      OR: [
        { user1Id: fromUserId, user2Id: toUserId },
        { user1Id: toUserId, user2Id: fromUserId },
      ],
    },
  });
  if (existing) {
    return res.json({ match: existing });
  }
  const match = await prisma.match.create({
    data: {
      user1Id: fromUserId,
      user2Id: toUserId,
    },
  });
  res.json({ match });
});

// --- Сообщения / чат ---
app.get('/api/matches/:matchId/messages', async (req, res) => {
  const { matchId } = req.params;
  const now = new Date();
  // Удаляем сообщения, срок которых истёк
  await prisma.message.deleteMany({
    where: {
      matchId,
      selfDestructAt: { lt: now },
    },
  });
  const messages = await prisma.message.findMany({
    where: { matchId },
    orderBy: { timestamp: 'asc' },
  });
  res.json(
    messages.map((m) => ({
      id: m.id,
      matchId: m.matchId,
      senderId: m.senderId,
      content: m.content,
      timestamp: m.timestamp,
      selfDestructAt: m.selfDestructAt,
    })),
  );
});

app.post('/api/matches/:matchId/messages', async (req, res) => {
  const { matchId } = req.params;
  const { senderId, content, selfDestructInSeconds } = req.body as {
    senderId: string;
    content: string;
    selfDestructInSeconds: number;
  };
  const now = new Date();
  const selfDestructAt = new Date(now.getTime() + (selfDestructInSeconds || 3600) * 1000);
  const msg = await prisma.message.create({
    data: {
      matchId,
      senderId,
      content,
      timestamp: now,
      selfDestructAt,
    },
  });
  res.json({
    id: msg.id,
    matchId: msg.matchId,
    senderId: msg.senderId,
    content: msg.content,
    timestamp: msg.timestamp,
    selfDestructAt: msg.selfDestructAt,
  });
});

app.post('/api/messages/:messageId/self-destruct', async (req, res) => {
  const { messageId } = req.params;
  await prisma.message.delete({ where: { id: messageId } }).catch(() => undefined);
  res.json({ ok: true });
});

// --- Челленджи / тайники ---
app.get('/api/challenges', async (req, res) => {
  const userId = req.query.userId as string;
  let challenges = await prisma.challenge.findMany({ where: { userId } });
  if (challenges.length === 0) {
    challenges = await prisma.$transaction([
      prisma.challenge.create({
        data: {
          userId,
          type: 'Отправь комплимент анонимно 3 пользователям',
          status: 'pending',
          reward: 'Открытие первого тайника 💖',
          progress: 0,
        },
      }),
      prisma.challenge.create({
        data: {
          userId,
          type: 'Разгадай загадку от случайного пользователя',
          status: 'pending',
          reward: 'Доступ к особому чату 🗝',
        },
      }),
    ]);
  }
  res.json(challenges);
});

app.put('/api/challenges/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status: string };
  const ch = await prisma.challenge.update({
    where: { id },
    data: { status },
  });
  res.json(ch);
});

// --- Пригласительные коды ---
function generateCode() {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return s;
}

app.get('/api/codes/:userId', async (req, res) => {
  const { userId } = req.params;
  let invite = await prisma.inviteCode.findUnique({ where: { userId } });
  if (!invite) {
    invite = await prisma.inviteCode.create({
      data: {
        userId,
        code: generateCode(),
      },
    });
  }
  res.json({ code: invite.code });
});

app.post('/api/codes/use', async (req, res) => {
  const { userId, code } = req.body as { userId: string; code: string };
  const inv = await prisma.inviteCode.findUnique({ where: { code } });
  if (!inv) {
    return res.status(400).json({ message: 'Код не найден' });
  }
  if (inv.usedBy && inv.usedBy !== userId) {
    return res.status(400).json({ message: 'Код уже был использован' });
  }
  await prisma.inviteCode.update({
    where: { id: inv.id },
    data: { usedBy: userId },
  });
  res.json({ message: 'Тайник открыт! 🗝' });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Secret Vibe API listening on http://localhost:${PORT}`);
});




