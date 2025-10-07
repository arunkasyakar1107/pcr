const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/google-sheet-csv', async (req, res) => {
  // You can change this to accept a URL as a query param if needed
  const sheetUrl = 'https://docs.google.com/spreadsheets/d/1tOakXg31gqP05xD9k4ePaIMdUhWN74KhnwxqvdzfLr8/export?format=csv';
  try {
    const response = await fetch(sheetUrl);
    if (!response.ok) throw new Error('Network error');
    const csvText = await response.text();
    res.type('text/csv').send(csvText);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Google Sheet CSV.' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Google Sheet proxy server running on port ${PORT}`);
});
