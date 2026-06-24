import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// GET all goals (optionally include archived)
router.get('/', async (req, res) => {
  try {
    const includeArchived = req.query.includeArchived === 'true';
    const query = includeArchived
      ? 'SELECT * FROM goals ORDER BY created_at ASC'
      : 'SELECT * FROM goals WHERE archived = FALSE ORDER BY created_at ASC';
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// POST create goal
router.post('/', async (req, res) => {
  try {
    const { name, type, unit, target } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'name and type are required' });
    if (!['checkbox', 'number', 'rating'].includes(type)) {
      return res.status(400).json({ error: 'invalid type' });
    }
    const { rows } = await pool.query(
      'INSERT INTO goals (name, type, unit, target) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, type, unit || null, target || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// PUT update goal (edit fields, or archive/unarchive)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, target, unit, archived } = req.body;
    const { rows } = await pool.query(
      `UPDATE goals SET
        name = COALESCE($1, name),
        target = COALESCE($2, target),
        unit = COALESCE($3, unit),
        archived = COALESCE($4, archived)
       WHERE id = $5 RETURNING *`,
      [name ?? null, target ?? null, unit ?? null, archived ?? null, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Goal not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// DELETE goal (cascades to its entries)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM goals WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

export default router;
