
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './initDb.js';
import router from './routes.js';
import './firebase.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API do Sistema de Afiliados rodando!');
});

app.use('/api', router);

const PORT = process.env.PORT || 4000;
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
  });
});
