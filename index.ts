import express from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.sendFile('public/index.html', { root: __dirname });
});
app.get('/c', (req, res) => {
  res.sendFile('public/chess.js', { root: __dirname });
});
app.get('/s', (req, res) => {
  res.sendFile('public/script.js', { root: __dirname });
});
app.get('/p', (req, res) => {
  res.sendFile('public/p5.min.js', { root: __dirname });
});

app.get('/img/:color/:piece.png', (req, res) => {
  const { color, piece } = req.params;
  if ((color === 'b' || color === 'w') && ['p', 'n', 'b', 'r', 'q', 'k'].includes(piece)) {
    res.sendFile(`img/${color}${piece}.png`, { root: __dirname });
  } else {
    res.status(404).send('Not Found');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});