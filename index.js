const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/heads', async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const cursor = req.query.cursor || '';
        const robloxOnly = req.query.robloxOnly === 'true';

        let url = `https://catalog.roblox.com/v2/search/items?assetTypes=61&limit=30&salesTypeFilter=1`;
        if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
        if (cursor)  url += `&cursor=${encodeURIComponent(cursor)}`;
        if (robloxOnly) url += `&creatorName=Roblox`;

        const response = await axios.get(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            timeout: 10000
        });

        const data = response.data;
        const items = [];

        if (data.data && Array.isArray(data.data)) {
            for (const item of data.data) {
                items.push({
                    id:   item.id,
                    name: item.name || 'Unknown'
                });
            }
        }

        res.json({
            items:          items,
            nextPageCursor: data.nextPageCursor || null
        });

    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).json({ items: [], nextPageCursor: null });
    }
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
