import { getTransactionsByUser } from '../models/Transaction.js';

export async function stats(req, res, next) {
  try {
    const tx = await getTransactionsByUser(req.user.id);
    const byCategory = {};
    tx.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount);
    });
    res.json({ byCategory });
  } catch (err) { next(err); }
}
