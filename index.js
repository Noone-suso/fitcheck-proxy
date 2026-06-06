const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/heads', async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const cursor = req.query.cursor || '';
        const robloxOnly = req.query.robloxOnly === 'true';

        let url = `https://catalog.roblox.com/v1/search/items?assetTypeId=61&salesTypeFilter=1&limit=30`;
        if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
        if (cursor) url += `&cursor=${cursor}`;
        if (robloxOnly) url += `&creatorName=Roblox`;

        const response = await axios.get(url, {
            headers: { 'Accept': 'application/json' }
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
