import pool from "../config/db.js";

export async function getAllTransactions() {
  const result = await pool.query(
    "SELECT * FROM transactions ORDER BY created_at DESC"
  );
  return result.rows;
}

export async function getTransactionsByUser(user_id) {
  const result = await pool.query(
    "SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC",
    [user_id]
  );
  return result.rows;
}

export async function createTransaction({
  user_id,
  name,
  type,
  category_id,
  amount,
  payment_method,
  transaction_date,
}) {
  const today =
    transaction_date && transaction_date.trim() !== ""
      ? transaction_date
      : new Date();

  const result = await pool.query(
    `INSERT INTO transactions (
        user_id,
        name,
        type,
        category_id,
        amount,
        payment_method,
        transaction_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
    [
      user_id,
      name,
      type,
      category_id,
      amount,
      payment_method,
      today,
    ]
  );

  return result.rows[0];
}

export async function updateTransactionById(id, user_id, payload) {
  const today =
    payload.transaction_date && payload.transaction_date.trim() !== ""
      ? payload.transaction_date
      : new Date();

  const result = await pool.query(
    `UPDATE transactions
     SET
        name = $1, 
        type = $2,
        category_id = $3,
        amount = $4,
        payment_method = $5,
        transaction_date = $6,
        updated_at = NOW()
     WHERE id = $7 AND user_id = $8
     RETURNING *`,
    [
      payload.name,
      payload.type,
      payload.category_id,
      payload.amount,
      payload.payment_method,
      today,
      id,
      user_id,
    ]
  );
  return result.rows[0];
}

export async function deleteTransactionById(id, user_id) {
  const result = await pool.query(
    `DELETE FROM transactions
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, user_id]
  );
  return result.rows[0];
}