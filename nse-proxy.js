const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/nse-option-chain', async (req, res) => {
  const url = 'https://www.nseindia.com/api/option-chain-v3?type=Indices&symbol=NIFTY&expiry=07-Oct-2025';
  try {
    const response = await fetch(url, {
      headers: {
        'accept': '*/*',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'referer': 'https://www.nseindia.com/option-chain?symbolCode=-10006&symbol=NIFTY&symbol=NIFTY&instrument=-&date=-&segmentLink=17&symbolCount=2&segmentLink=17',
      },
    });
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch NSE option chain data.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`NSE proxy server running on port ${PORT}`);
});
