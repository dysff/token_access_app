import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const VALID_TOKEN = "W6gsPaZ4mo1XrLXUAxS9k96R7aVgKfk0EQkJy06xZY3lEjaMd6x1aSgb8jYQIYxe";

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});

app.post('/check-token', (req, res) => {
  const { token } = req.body;

  if (token === VALID_TOKEN) {
    res.json({ valid: true });
  
  } else {
    res.status(401).json({ valid: false, message: "Invalid token" });
  }
});

app.post('/make-calculations', (req, res) => {
  const rawA = req.body.a
  const rawB = req.body.b
  const numericRegex = /^-?\d+(\.\d+)?$/;

  if (!numericRegex.test(rawA) || !numericRegex.test(rawB)) {
    return res.status(400).json({ success: false, error: 'Only numbers allowed' });
  }

  try {
    const a = parseFloat(rawA);
    const b = parseFloat(rawB);

    if (isNaN(a) || isNaN(b)) {

      return res.status(400).json({ success: false, error: 'Input is not a valid number'})
    };
    
    const result = a + b;
    res.json({ success: true, result: result});
    console.log('Server calculation success result: ', result);
  
  } catch (err) {
    console.error('Error occured during server calculation process: ', err);
    
    return;
  };
});

app.post('/check-database-match', async (req, res) => {
  const email = req.body.email;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email required' })
  };

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rowCount == 1) {
      return res.json({ success: true, match: true });
    } else if (result.rowCount == 0) {
      return res.json({ success: true, match: false });
    };

  } catch (err) {
    console.error('Database match error: ', err);

    return;
  };
});

app.post('/make-registration', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ success: false, error: 'Name and password are required' });
  };

  try {
    const client = await pool.connect();
    const hash = await bcrypt.hash(password, 13);
    await client.query('INSERT INTO users(user_name, email, password_hash) VALUES($1, $2, $3)', [name, email, hash]);
    console.log(`User with data: ${name}, ${email}, ${password} successfully registered!`)
    return res.json({ success: true })

  } catch (err) {
    console.error('Server registration process error: ', err);

    return;
  };
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});