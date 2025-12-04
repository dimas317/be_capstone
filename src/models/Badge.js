import pool from "../config/db.js";

export async function getBadgesByUser(user_id) {
  const result = await pool.query(
    "SELECT * FROM badges WHERE user_id = $1 ORDER BY awarded_at DESC",
    [user_id]
  );
  return result.rows;
}

export async function createBadge({ user_id, name, description }) {
  const result = await pool.query(
    `INSERT INTO badges (user_id, name, description)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [user_id, name, description]
  );
  return result.rows[0];
}
