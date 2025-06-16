import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const VALID_TOKEN = "W6gsPaZ4mo1XrLXUAxS9k96R7aVgKfk0EQkJy06xZY3lEjaMd6x1aSgb8jYQIYxe";

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

  const a = parseFloat(rawA);
  const b = parseFloat(rawB);

  if (isNaN(a) || isNaN(b)) {

    return res.status(400).json({ success: false, error: 'Input is not a valid number'})
  }
  
  const result = a + b;
  res.json({ success: true, result: result});
  console.log('Server calculation success result: ', result)
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});