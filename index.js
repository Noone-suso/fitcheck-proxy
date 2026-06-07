const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const HEADERS = {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
};

async function getItemDetails(ids) {
    try {
        const body = { items: ids.map(id => ({ itemType: 'Asset', id })) };
        const r = await axios.post(
            'https://catalog.roblox.com/v1/catalog/items/details',
            body,
            { headers: { ...HEADERS, 'Content-Type': 'application/json' }, timeout: 8000 }
        );
        return r.data.data || [];
    } catch (e) {
        return [];
    }
}

app.get('/heads', async (req, res) => {
    const keyword    = req.query.keyword    || '';
    const cursor     = req.query.cursor     || '';
    const robloxOnly = req.query.robloxOnly === 'true';

    const params = new URLSearchParams({
        assetTypeId:     '61',
        limit:           '30',
        salesTypeFilter: '1',
    });
    if (keyword)    params.set('keyword',     keyword);
    if (cursor)     params.set('cursor',      cursor);
    if (robloxOnly) params.set('creatorName', 'Roblox');

    try {
        const searchUrl = `https://catalog.roblox.com/v1/search/items?${params}`;
        const searchRes = await axios.get(searchUrl, { headers: HEADERS, timeout: 8000 });
        const rawItems  = searchRes.data.data || [];
        const nextCursor = searchRes.data.nextPageCursor || null;

        if (rawItems.length === 0) {
            return res.json({ items: [], nextPageCursor: null });
        }

        // Batch fetch names for the returned IDs
        const ids     = rawItems.map(i => i.id).filter(Boolean);
        const details = await getItemDetails(ids);

        // Build name lookup
        const nameMap = {};
        for (const d of details) {
            if (d.id && d.name) nameMap[d.id] = d.name;
        }

        const items = ids.map(id => ({
            id,
            name: nameMap[id] || 'Unknown'
        }));

        res.json({ items, nextPageCursor });

    } catch (error) {
        console.error('Error:', error.message);
        res.json({ items: [], nextPageCursor: null });
    }
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
