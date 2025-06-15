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
  const { a, b } = req.body;
  res.json(a + b)
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});