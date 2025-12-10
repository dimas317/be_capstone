import { getAllTransactions, getTransactionsByUser, createTransaction, updateTransactionById, deleteTransactionById } from '../models/Transaction.js';

export async function listAllTransactions(req, res, next) {
  try {
    const rows = await getAllTransactions();
    res.json({ transactions: rows });
  } catch (err) {
    next(err);
  }
}

export async function listTransactions(req, res, next) {
  try {
    const rows = await getTransactionsByUser(req.user.id);
    res.json({ transactions: rows });
  } catch (err) {
    next(err);
  }
}

export async function addTransaction(req, res, next) {
  try {
    const payload = { user_id: req.user.id, ...req.body };

    // === VALIDASI ===
    if (payload.type === "income" && payload.category_id) {
      return res.status(400).json({ message: "Income must NOT have category_id" });
    }

    if (payload.type === "expense" && !payload.category_id) {
      return res.status(400).json({ message: "Expense MUST have category_id" });
    }

    const tx = await createTransaction(payload);
    res.status(201).json({
      message: "Add transaction successfully",
      transaction: tx
    });

  } catch (err) {
    next(err);
  }
}


export async function updateTransaction(req, res, next) {
  try {
    const { id } = req.params;
    const payload = req.body;

    // === VALIDASI ===
    if (payload.type === "income" && payload.category_id) {
      return res.status(400).json({ message: "Income must NOT have category_id" });
    }

    if (payload.type === "expense" && !payload.category_id) {
      return res.status(400).json({ message: "Expense MUST have category_id" });
    }

    const updated = await updateTransactionById(id, req.user.id, payload);

    if (!updated) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({
      message: "Update transaction successfully",
      transaction: updated
    });

  } catch (err) {
    next(err);
  }
}


export async function deleteTransaction(req, res, next) {
  try {
    const { id } = req.params;

    const deleted = await deleteTransactionById(id, req.user.id);

    if (!deleted) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({
      message: "Delete transaction successfully",
      transaction: deleted
    });
  } catch (err) {
    next(err);
  }
}
