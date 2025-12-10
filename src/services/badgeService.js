import { getPool } from '../config/db.js';

export async function getBadgeForUser(userId) {
  const pool = getPool();
  const res = await pool.query(
    'SELECT name, description, awarded_at FROM badges WHERE user_id = $1',
    [userId]
  );
  return res.rows[0];
}

