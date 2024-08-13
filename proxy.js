const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Proxy endpoint for FRED API
app.use('/api/fred', async (req, res) => {
    const baseUrl = 'https://api.stlouisfed.org';
    const url = `${baseUrl}${req.url}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`FRED API request failed with status ${response.status}`);
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Proxy server running on port 3000');
});


