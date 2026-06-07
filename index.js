const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const HEADERS = {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
};

const HEADS_TAXONOMY = 's5NLP7BS9PRLKvUVca4XKg';

app.get('/heads', async (req, res) => {
    const keyword    = req.query.keyword    || '';
    const cursor     = req.query.cursor     || '';
    const robloxOnly = req.query.robloxOnly === 'true';

    const params = new URLSearchParams({
        taxonomy:        HEADS_TAXONOMY,
        salesTypeFilter: '1',
        limit:           '30',
    });
    if (keyword)    params.set('keyword', keyword);
    if (cursor)     params.set('cursor',  cursor);
    if (robloxOnly) params.set('creatorName', 'Roblox');

    try {
        const url = `https://catalog.roblox.com/v2/search/items/details?${params}`;
        console.log('Fetching:', url);
        const r = await axios.get(url, { headers: HEADERS, timeout: 10000 });

        const raw        = r.data.data || [];
        const nextCursor = r.data.nextPageCursor || null;

        const items = raw.map(item => ({
            id:   item.id,
            name: item.name || 'Unknown'
        })).filter(i => i.id);

        console.log(`Returning ${items.length} items`);
        res.json({ items, nextPageCursor });

    } catch (error) {
        console.error('Error:', error.message);
        res.json({ items: [], nextPageCursor: null });
    }
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
