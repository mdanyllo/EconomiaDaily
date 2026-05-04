import express from 'express';
import { prisma } from './services/db';

const app = express();

app.use(express.json());

app.get('/pending', async (_, res) => {
  const offers = await prisma.promotion.findMany({
    where: { posted: false },
    orderBy: { createdAt: 'desc' }
  });

  res.json(offers);
});

app.listen(4000, () => {
  console.log('API ON 4000');
});
