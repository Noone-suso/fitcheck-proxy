const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const HEADERS = {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

async function tryFetch(url) {
    try {
        const r = await axios.get(url, { headers: HEADERS, timeout: 8000 });
        const raw = r.data.data || r.data.items || [];
        return { items: raw, cursor: r.data.nextPageCursor || null };
    } catch (e) {
        return null;
    }
}

app.get('/heads', async (req, res) => {
    const keyword   = req.query.keyword || '';
    const cursor    = req.query.cursor  || '';
    const robloxOnly = req.query.robloxOnly === 'true';
    const extra = (keyword  ? `&keyword=${encodeURIComponent(keyword)}`  : '')
                + (cursor   ? `&cursor=${encodeURIComponent(cursor)}`    : '')
                + (robloxOnly ? `&creatorName=Roblox` : '');

    // Try different API approaches in order until one returns results
    const attempts = [
        `https://catalog.roblox.com/v2/search/items?assetTypes=61&limit=30&salesTypeFilter=1${extra}`,
        `https://catalog.roblox.com/v1/search/items?assetTypeId=61&limit=30&salesTypeFilter=1${extra}`,
        `https://catalog.roblox.com/v1/search/items?assetTypeId=17&limit=30&salesTypeFilter=1${extra}`,
        `https://catalog.roblox.com/v1/search/items?category=11&limit=30&salesTypeFilter=1${extra}`,
    ];

    for (const url of attempts) {
        const result = await tryFetch(url);
        if (result && result.items.length > 0) {
            const items = result.items.map(item => ({
                id:   item.id   || item.Id,
                name: item.name || item.Name || 'Unknown'
            })).filter(i => i.id);

            return res.json({ items, nextPageCursor: result.cursor });
        }
    }

    res.json({ items: [], nextPageCursor: null });
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
