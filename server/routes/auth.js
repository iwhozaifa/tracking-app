import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });
    if (!process.env.APP_PASSWORD_HASH || !process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server auth is not configured' });
    }
    const match = await bcrypt.compare(password, process.env.APP_PASSWORD_HASH);
    if (!match) return res.status(401).json({ error: 'Incorrect password' });
    const token = jwt.sign({ auth: true }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
