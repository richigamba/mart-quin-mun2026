export default async function handler(req, res) {
  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'FOOTBALL_API_KEY not configured in Vercel environment' });
  }

  // Strip /api/football prefix to get the upstream path
  const upstreamPath = req.url.replace(/^\/api\/football/, '') || '/';

  try {
    const upstream = await fetch(`https://api.football-data.org${upstreamPath}`, {
      headers: { 'X-Auth-Token': apiKey },
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Upstream API error', detail: err.message });
  }
}
