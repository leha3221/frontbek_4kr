const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const SERVER_ID = process.env.SERVER_ID || 'unknown';

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    server: `backend-${SERVER_ID}`,
    message: 'Hello from backend!',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: `backend-${SERVER_ID}` });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend-${SERVER_ID} running on port ${PORT}`);
});
