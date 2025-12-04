import { getPool } from '../config/db.js';

export async function getBalanceForUser(userId) {
  const pool = getPool();
  const res = await pool.query('SELECT type, amount FROM transactions WHERE user_id = $1', [userId]);
  const rows = res.rows;
  const income = rows.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount), 0);
  const expense = rows.filter(r => r.type === 'expense').reduce((s, r) => s + Number(r.amount), 0);
  return { income, expense, balance: income - expense };
}
