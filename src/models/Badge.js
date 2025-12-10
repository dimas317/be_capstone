import pool from "../config/db.js";

// Ambil semua badge
export async function getAllBadges() {
  const result = await pool.query("SELECT * FROM badges ORDER BY awarded_at DESC");
  return result.rows;
}

// Ambil badge user (1 user = 1 badge)
export async function getBadgesByUser(user_id) {
  const result = await pool.query(
    "SELECT * FROM badges WHERE user_id = $1",
    [user_id]
  );
  return result.rows;
}

export async function createOrUpdateBadge({ user_id, name, description }) {
  const result = await pool.query(
    `INSERT INTO badges (user_id, name, description)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id)
     DO UPDATE SET 
       name = EXCLUDED.name,
       description = EXCLUDED.description,
       awarded_at = NOW()
     RETURNING *`,
    [user_id, name, description]
  );

  return result.rows[0];
}


// Update badge ketika level user berubah
export async function assignBadgeForLevel(userId, level) {
  let name = "";
  let description = "";

  if (level === 1) {
    name = "Beginner";
    description = "Badge untuk level 1";
  } else if (level === 2) {
    name = "Bronze";
    description = "Badge untuk level 2";
  } else if (level === 3) {
    name = "Silver";
    description = "Badge untuk level 3";
  } else if (level === 4) {
    name = "Gold";
    description = "Badge untuk level 4";
  }

  const badge = badges[level] || badges[1];

  const result = await pool.query(
    `INSERT INTO badges (user_id, name, description)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id)
     DO UPDATE SET
       name = EXCLUDED.name,
       description = EXCLUDED.description,
       awarded_at = NOW()
     RETURNING *`,
    [userId, badge.name, badge.description]
  );


  return result.rows[0];
}
