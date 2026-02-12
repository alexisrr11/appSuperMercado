import dotenv from 'dotenv';
import express from 'express';
import authRouter from './routes/auth.routes';
import productsRouter from './routes/products.routes';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/products', productsRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
