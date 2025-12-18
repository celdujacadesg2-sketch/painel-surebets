import pool from './db.js';
import { createTablesSQL } from './models.js';

export async function initDb() {
  const conn = await pool.getConnection();
  try {
    for (const sql of createTablesSQL.split(';')) {
      if (sql.trim()) await conn.query(sql);
    }
    console.log('Tabelas criadas/verificadas com sucesso!');
  } finally {
    conn.release();
  }
}
