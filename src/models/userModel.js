import pool from "../config/db.js";

// Cari user berdasarkan email
export async function findUserByEmail(email) {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1 LIMIT 1",
    [email]
  );
  return result.rows[0];
}

// Buat user baru
export async function createUser({ username, phone_number, email, password}) {
  const result = await pool.query(
    `INSERT INTO users (username, phone_number, email, password)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [username, phone_number, email, password]
  );
  return result.rows[0];
}

// Ambil semua user
export async function getAllUsers() {
  const result = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
  return result.rows;
}

// Cari user berdasarkan id
export async function findUserById(id) {
  const result = await pool.query(
    "SELECT * FROM users WHERE id = $1 LIMIT 1",
    [id]
  );
  return result.rows[0];
}

// Update user berdasarkan id
export async function updateUserById(id, fields) {
  const cols = [];
  const values = [];
  let i = 1;

  for (const key in fields) {
    cols.push(`${key} = $${i}`);
    values.push(fields[key]);
    i++;
  }

  // Tambahkan updated_at
  cols.push(`updated_at = NOW()`);

  const query = `
    UPDATE users
    SET ${cols.join(", ")}
    WHERE id = $${i}
    RETURNING *;
  `;

  values.push(id);

  const result = await pool.query(query, values);
  return result.rows[0];
}

// Update password user berdasarkan id
export async function updatePasswordById(id, hashedPassword) {
  await pool.query(
    `UPDATE users
     SET password = $1,
         updated_at = NOW()
     WHERE id = $2`,
    [hashedPassword, id]
  );

  return true;
}

// Update Foto Profil User
export async function updateProfilePictureById(id, imageUrl) {
  const result = await pool.query(
    `UPDATE users SET image = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [imageUrl, id]   // <-- BENAR, sesuai param
  );
  return result.rows[0];
}

// Delete user berdasarkan id
export async function deleteUserById(id) {
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
}
