import { getAllBadges, createOrUpdateBadge, getBadgesByUser } from '../models/Badge.js';

export async function listAllBadges(req, res, next) {
  try {
    const rows = await getAllBadges();
    res.json({ badges: rows });
  } catch (err) { 
    next(err); 
  }
}

export async function listBadges(req, res, next) {
  try {
    const rows = await getBadgesByUser(req.user.id);
    const badge = rows[0] || null;
    res.json({ badge });
  } catch (err) { next(err); }
}

export async function awardBadge(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ 
        message: "Name and description are required." 
      });
    }
    const badge = await createOrUpdateBadge({
      user_id: req.user.id,
      name, 
      description
    });

    res.status(200).json({ badge });
  } catch (err) { next(err); }
}

