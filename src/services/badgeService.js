import { getPool } from '../config/db.js';

export async function countBadgesForUser(userId) {
  const pool = getPool();
  const res = await pool.query('SELECT count(*) FROM badges WHERE user_id = $1', [userId]);
  return Number(res.rows[0].count);
}
