import { createBadge, getBadgesByUser } from '../models/Badge.js';

export async function listBadges(req, res, next) {
  try {
    const rows = await getBadgesByUser(req.user.id);
    res.json({ badges: rows });
  } catch (err) { next(err); }
}

export async function awardBadge(req, res, next) {
  try {
    const { name, description } = req.body;
    const b = await createBadge({ user_id: req.user.id, name, description });
    res.status(201).json({ badge: b });
  } catch (err) { next(err); }
}
