import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// GET entries for a goal, optional date range
router.get('/', async (req, res) => {
  try {
    const { goalId, from, to } = req.query;
    if (!goalId) return res.status(400).json({ error: 'goalId is required' });
    const params = [goalId];
    let query = 'SELECT * FROM entries WHERE goal_id = $1';
    if (from) {
      params.push(from);
      query += ` AND entry_date >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      query += ` AND entry_date <= $${params.length}`;
    }
    query += ' ORDER BY entry_date ASC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// POST create or update an entry for a goal+date (upsert)
router.post('/', async (req, res) => {
  try {
    const { goalId, date, value, note } = req.body;
    if (!goalId || !date || value === undefined) {
      return res.status(400).json({ error: 'goalId, date, and value are required' });
    }
    const { rows } = await pool.query(
      `INSERT INTO entries (goal_id, entry_date, value, note)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (goal_id, entry_date)
       DO UPDATE SET value = $3, note = $4, updated_at = now()
       RETURNING *`,
      [goalId, date, value, note || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save entry' });
  }
});

// DELETE entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM entries WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

export default router;
