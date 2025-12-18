
import express from 'express';
import pool from './db.js';
import { v4 as uuidv4 } from 'uuid';
import admin from './firebase.js';
import { gerarLinkAfiliado } from './utils.js';

const router = express.Router();

// Cadastro de cliente vindo do site surecapta.com
router.post('/clientes', async (req, res) => {
  const { nome, email, aff_id } = req.body;
  if (!nome || !email || !aff_id) return res.status(400).json({ error: 'Dados obrigatórios não enviados' });
  // Busca afiliado
  const [[afiliado]] = await pool.query('SELECT id FROM afiliados WHERE link_unico = ?', [aff_id]);
  if (!afiliado) return res.status(404).json({ error: 'Afiliado não encontrado' });
  // Verifica se já existe cliente com esse email para esse afiliado
  const [[existe]] = await pool.query('SELECT id FROM clientes WHERE email = ? AND afiliado_id = ?', [email, afiliado.id]);
  if (existe) return res.status(409).json({ error: 'Cliente já cadastrado para este afiliado' });
  await pool.query('INSERT INTO clientes (nome, email, afiliado_id, pago) VALUES (?, ?, ?, 0)', [nome, email, afiliado.id]);
  res.json({ ok: true });
});

// Listar clientes por afiliado (admin)
router.get('/clientes/:afiliado_id', autenticarFirebase, async (req, res) => {
  const { afiliado_id } = req.params;
  const [clientes] = await pool.query('SELECT * FROM clientes WHERE afiliado_id = ?', [afiliado_id]);
  res.json(clientes);
});

// Marcar cliente como pago (admin)
router.post('/clientes/:cliente_id/pagar', autenticarFirebase, async (req, res) => {
  const { cliente_id } = req.params;
  await pool.query('UPDATE clientes SET pago = 1 WHERE id = ?', [cliente_id]);
  res.json({ ok: true });
});

// Redirecionamento de link exclusivo do afiliado
router.get('/r/:link_unico', async (req, res) => {
  const { link_unico } = req.params;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  // Registra clique
  const [[afiliado]] = await pool.query('SELECT id FROM afiliados WHERE link_unico = ?', [link_unico]);
  if (afiliado) {
    await pool.query(
      'INSERT INTO cliques (afiliado_id, utm_source, utm_medium, utm_campaign, ip) VALUES (?, ?, ?, ?, ?)',
      [afiliado.id, req.query.utm_source || null, req.query.utm_medium || null, req.query.utm_campaign || null, ip]
    );
  }
    // Redireciona SEMPRE para /register, mesmo se o domínio mudar
  const url = `https://surecapta.com/register?aff_id=${link_unico}`;
    return res.redirect(302, url);
});

// Middleware de autenticação Firebase
async function autenticarFirebase(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.usuario = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
}

// Cadastro de afiliado (público)
router.post('/afiliados', async (req, res) => {
  const { nome, email } = req.body;
  const link_unico = uuidv4();
  try {
    const [result] = await pool.query(
      'INSERT INTO afiliados (nome, email, link_unico) VALUES (?, ?, ?)',
      [nome, email, link_unico]
    );
    res.json({ id: result.insertId, nome, email, link_unico });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listar afiliados (público para login de afiliado)
router.get('/afiliados', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM afiliados');
  res.json(rows);
});

// Registrar clique com rastreamento UTM e IP
router.post('/cliques/:link_unico', async (req, res) => {
  const { link_unico } = req.params;
  const utm_source = req.body.utm_source || null;
  const utm_medium = req.body.utm_medium || null;
  const utm_campaign = req.body.utm_campaign || null;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const [[afiliado]] = await pool.query('SELECT id FROM afiliados WHERE link_unico = ?', [link_unico]);
  if (!afiliado) return res.status(404).json({ error: 'Afiliado não encontrado' });
  await pool.query(
    'INSERT INTO cliques (afiliado_id, utm_source, utm_medium, utm_campaign, ip) VALUES (?, ?, ?, ?, ?)',
    [afiliado.id, utm_source, utm_medium, utm_campaign, ip]
  );
  res.json({ ok: true });
});

// Registrar venda manual (admin)
router.post('/vendas', autenticarFirebase, async (req, res) => {
  const { afiliado_id, valor } = req.body;
  await pool.query('INSERT INTO vendas (afiliado_id, valor) VALUES (?, ?)', [afiliado_id, valor]);
  res.json({ ok: true });
});

// Relatório de vendas/comissões por afiliado (admin)
router.get('/relatorio/:afiliado_id', autenticarFirebase, async (req, res) => {
  const { afiliado_id } = req.params;
  const [[afiliado]] = await pool.query('SELECT * FROM afiliados WHERE id = ?', [afiliado_id]);
  if (!afiliado) return res.status(404).json({ error: 'Afiliado não encontrado' });
  const [vendas] = await pool.query('SELECT * FROM vendas WHERE afiliado_id = ?', [afiliado_id]);
  const [cliques] = await pool.query('SELECT * FROM cliques WHERE afiliado_id = ?', [afiliado_id]);
  const comissao = vendas.reduce((acc, v) => acc + Number(v.valor) * 0.1, 0); // 10% comissão
  res.json({ afiliado, vendas, cliques: cliques.length, comissao });
});

// Dashboard do afiliado (cliques, vendas, comissões)
router.get('/dashboard/:link_unico', async (req, res) => {
  const { link_unico } = req.params;
  const [[afiliado]] = await pool.query('SELECT id, nome, email, link_unico FROM afiliados WHERE link_unico = ?', [link_unico]);
  if (!afiliado) return res.status(404).json({ error: 'Afiliado não encontrado' });
  const [clientes] = await pool.query('SELECT * FROM clientes WHERE afiliado_id = ?', [afiliado.id]);
  const [cliques] = await pool.query('SELECT * FROM cliques WHERE afiliado_id = ?', [afiliado.id]);
  // Comissão: R$30 por cliente pago, apenas uma vez por cliente
  const comissao = clientes.filter(c => c.pago).length * 30;
  res.json({ afiliado, clientes, cliques: cliques.length, comissao });
});

export default router;
