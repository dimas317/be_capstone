import { getTransactionsByUser } from '../models/Transaction.js';

export async function dashboard(req, res, next) {
  try {
    const tx = await getTransactionsByUser(req.user.id);
    const income = tx.filter(t => t.type === 'income').reduce((s, r) => s + Number(r.amount), 0);
    const expense = tx.filter(t => t.type === 'expense').reduce((s, r) => s + Number(r.amount), 0);
    res.json({ income, expense, balance: income - expense, latest: tx.slice(0, 5) });
  } catch (err) { next(err); }
}
