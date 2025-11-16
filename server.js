require('dotenv').config(); // Load .env variables

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path'); // Make sure this is present

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.WORLDCOININDEX_KEY;

if (!API_KEY) {
    console.error('CRITICAL: WORLDCOININDEX_KEY not found in .env');
    process.exit(1);
}

app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // Corrected line from previous steps

// Proxy endpoint to fetch coins
app.get('/api/proxy/coins', async (req, res) => {
    const fiat = req.query.currency || 'usd';
    const fullExternalApiUrl = `https://www.worldcoinindex.com/apiservice/v2getmarkets?key=${API_KEY}&fiat=${fiat}`;

    console.log('Fetching from WorldCoinIndex:', fullExternalApiUrl);

    try {
        const response = await fetch(fullExternalApiUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('External API Error:', response.status, errorText);
            return res.status(response.status).json({
                error: 'Failed to fetch cryptocurrency data via proxy',
                details: errorText
            });
        }

        const data = await response.json();

        // --- IMPORTANT DEBUGGING STEP & CORRECTION ---
        console.log("--- RAW DATA FROM WORLDCOININDEX API ---");
        //console.log(JSON.stringify(data, null, 2)); // Log the entire data object
        console.log("------------------------------------------");

        const globalData = data.GlobalData || {};

        const coins = (data.Markets || []).map(coin => ({
            ...coin,
            image: coin.ImageUrl,
            Change24h: parseFloat(coin.Change24h),
            MarketCap: parseFloat(coin.MarketCap),
            Volume_24h: parseFloat(coin.Volume_24h)
        }));

        res.json({ coins, global: globalData, raw_api_response: data }); // Add raw response for debugging

    }     catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({
            error: 'Failed to fetch cryptocurrency data via proxy',
            details: error.message
        });

    }
});

app.listen(PORT, () => {
    console.log(`Backend proxy running on http://localhost:${PORT}`);
    console.log(`Frontend should be accessible at http://localhost:${PORT}`); // More accurate message
});