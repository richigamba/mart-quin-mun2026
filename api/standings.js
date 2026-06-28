export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const apiRes = await fetch(
    "https://v3.football.api-sports.io/standings?league=1&season=2026",
    { headers: { "x-apisports-key": process.env.FOOTBALL_API_KEY } }
  );
  const data = await apiRes.json();
  res.status(apiRes.status).json(data);
}
