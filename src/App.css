import { useState, useEffect, useCallback } from "react";

// ── CONFIGURACIÓN ─────────────────────────────────────────────────────────────
const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY || "";
const API_HOST = "api-football-v1.p.rapidapi.com";
const LEAGUE = 1;
const SEASON = 2026;

// ── PARTICIPANTES ─────────────────────────────────────────────────────────────
const PARTICIPANTS = [
  { name: "Susy",  teams: ["Germany", "Norway"],        color: "#7C3AED", light: "#EDE9FE" },
  { name: "Toka",  teams: ["South Korea", "Argentina"], color: "#0891B2", light: "#CFFAFE" },
  { name: "Kore",  teams: ["France", "Belgium"],        color: "#2563EB", light: "#DBEAFE" },
  { name: "Patty", teams: ["Netherlands", "Turkey"],    color: "#EA580C", light: "#FFEDD5" },
  { name: "Pauz",  teams: ["England", "Sweden"],        color: "#DC2626", light: "#FEE2E2" },
  { name: "Edgar", teams: ["Portugal", "Uruguay"],      color: "#16A34A", light: "#DCFCE7" },
  { name: "Clio",  teams: ["Mexico", "Brazil"],         color: "#CA8A04", light: "#FEF9C3" },
  { name: "Angie", teams: ["Canada", "Japan"],          color: "#DB2777", light: "#FCE7F3" },
  { name: "Richi", teams: ["Spain", "Morocco"],         color: "#9333EA", light: "#F3E8FF" },
  { name: "Tyler", teams: ["Australia", "Colombia"],    color: "#0D9488", light: "#CCFBF1" },
];

// Nombres de equipo como los devuelve API-Football → nombre para mostrar
const TEAM_DISPLAY = {
  "Germany": "Alemania", "Norway": "Noruega", "South Korea": "Corea del Sur",
  "Argentina": "Argentina", "France": "Francia", "Belgium": "Bélgica",
  "Netherlands": "Países Bajos", "Turkey": "Turquía", "England": "Inglaterra",
  "Sweden": "Suecia", "Portugal": "Portugal", "Uruguay": "Uruguay",
  "Mexico": "México", "Brazil": "Brasil", "Canada": "Canadá", "Japan": "Japón",
  "Spain": "España", "Morocco": "Marruecos", "Australia": "Australia",
  "Colombia": "Colombia", "Korea Republic": "Corea del Sur",
};

const FLAGS = {
  "Germany":"🇩🇪","Norway":"🇳🇴","South Korea":"🇰🇷","Korea Republic":"🇰🇷",
  "Argentina":"🇦🇷","France":"🇫🇷","Belgium":"🇧🇪","Netherlands":"🇳🇱",
  "Turkey":"🇹🇷","England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Sweden":"🇸🇪","Portugal":"🇵🇹",
  "Uruguay":"🇺🇾","Mexico":"🇲🇽","Brazil":"🇧🇷","Canada":"🇨🇦","Japan":"🇯🇵",
  "Spain":"🇪🇸","Morocco":"🇲🇦","Australia":"🇦🇺","Colombia":"🇨🇴",
  "USA":"🇺🇸","United States":"🇺🇸","Senegal":"🇸🇳","Austria":"🇦🇹",
  "Egypt":"🇪🇬","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","Switzerland":"🇨🇭","Ghana":"🇬🇭",
  "Croatia":"🇭🇷","Panama":"🇵🇦","DR Congo":"🇨🇩","Uzbekistan":"🇺🇿",
  "South Africa":"🇿🇦","Czechia":"🇨🇿","Paraguay":"🇵🇾","Ivory Coast":"🇨🇮",
  "Curaçao":"🏳️","Tunisia":"🇹🇳","Iran":"🇮🇷","New Zealand":"🇳🇿",
  "Saudi Arabia":"🇸🇦","Cape Verde":"🇨🇻","Iraq":"🇮🇶","Jordan":"🇯🇴",
  "Haiti":"🇭🇹","Ecuador":"🇪🇨","Bosnia":"🇧🇦","Qatar":"🇶🇦",
};

const ROUND_POINTS = { R32:1, R16:2, QF:4, SF:8, F:16, Champion:32 };
const ROUND_LABELS = { R32:"16avos de final", R16:"Octavos", QF:"Cuartos", SF:"Semifinal", F:"Final", Champion:"Campeón" };

// Mapeo de rondas API → claves internas
const ROUND_MAP = {
  "Round of 32": "R32", "Round of 16": "R16",
  "Quarter-finals": "QF", "Semi-finals": "SF", "Final": "F",
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function display(name) { return TEAM_DISPLAY[name] || name; }
function flag(name) { return FLAGS[name] || FLAGS[TEAM_DISPLAY[name]] || "🏳️"; }
function getParticipant(apiName) {
  return PARTICIPANTS.find(p =>
    p.teams.includes(apiName) ||
    p.teams.includes(TEAM_DISPLAY[apiName]) ||
    p.teams.some(t => TEAM_DISPLAY[t] === apiName)
  );
}

async function apiFetch(endpoint) {
  const url = `https://${API_HOST}/v3/${endpoint}`;
  const res = await fetch(url, {
    headers: { "x-rapidapi-key": API_KEY, "x-rapidapi-host": API_HOST },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(JSON.stringify(data.errors));
  }
  return data.response;
}

function computeScores(knockoutMatches, qualifiedTeams) {
  const scores = {};
  PARTICIPANTS.forEach(p => { scores[p.name] = 0; });

  // 1 pt por clasificar al R32
  qualifiedTeams.forEach(team => {
    const p = getParticipant(team);
    if (p) scores[p.name] += ROUND_POINTS.R32;
  });

  // Puntos por ganar rondas eliminatorias
  knockoutMatches.forEach(m => {
    if (!m.winner) return;
    const round = ROUND_MAP[m.round];
    if (!round || round === "R32") return; // R32 win = automático cuando avanza a R16
    const pts = ROUND_POINTS[round];
    const p = getParticipant(m.winner);
    if (p) {
      scores[p.name] += pts;
      if (round === "F") scores[p.name] += ROUND_POINTS.Champion;
    }
  });

  // Puntos por ganar partido de R32 (avanzar = ganar R32, los pts son al avanzar a R16)
  // Ya cubierto arriba con R16+
  return scores;
}

// ── COMPONENTES ───────────────────────────────────────────────────────────────

function TeamBadge({ apiName, showOwner = false }) {
  const p = getParticipant(apiName);
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      background: p ? p.light : "#f3f4f6",
      color: p ? p.color : "#374151",
      border: `1px solid ${p ? p.color+"44" : "#e5e7eb"}`,
      borderRadius:12, padding:"2px 8px", fontSize:12, fontWeight:500,
    }}>
      <span>{flag(apiName)}</span>
      {display(apiName)}
      {showOwner && p && <span style={{ opacity:0.7 }}>({p.name})</span>}
    </span>
  );
}

function StatusBadge({ status }) {
  if (status === "FT" || status === "AET" || status === "PEN")
    return <span style={{ fontSize:10, background:"#dcfce7", color:"#16a34a", borderRadius:8, padding:"1px 6px", fontWeight:600 }}>FIN</span>;
  if (status === "1H" || status === "2H" || status === "ET" || status === "BT" || status === "P" || status === "LIVE")
    return <span style={{ fontSize:10, background:"#fef9c3", color:"#ca8a04", borderRadius:8, padding:"1px 6px", fontWeight:600 }}>EN VIVO</span>;
  return <span style={{ fontSize:10, background:"#f3f4f6", color:"#9ca3af", borderRadius:8, padding:"1px 6px" }}>PRÓXIMO</span>;
}

function MatchRow({ match, compact = false }) {
  const hp = getParticipant(match.home);
  const ap = getParticipant(match.away);
  const finished = ["FT","AET","PEN"].includes(match.status);
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:8, padding: compact ? "6px 0" : "10px 12px",
      background: compact ? "transparent" : "#fff",
      border: compact ? "none" : "1px solid #e5e7eb",
      borderRadius: compact ? 0 : 10,
      borderBottom: compact ? "1px solid #f3f4f6" : undefined,
    }}>
      {/* Home */}
      <div style={{ flex:1, display:"flex", alignItems:"center", gap:6, justifyContent:"flex-end" }}>
        {hp && <span style={{ width:7, height:7, borderRadius:"50%", background:hp.color }}/>}
        <span style={{ fontSize:13, fontWeight: match.winner===match.home ? 700 : 400 }}>
          {display(match.home)}
        </span>
        {match.homeCrest
          ? <img src={match.homeCrest} alt="" style={{ width:20, height:14, objectFit:"contain" }}/>
          : <span style={{ fontSize:16 }}>{flag(match.home)}</span>
        }
      </div>
      {/* Score */}
      <div style={{ minWidth:60, textAlign:"center" }}>
        {finished || match.homeScore !== null ? (
          <span style={{ fontWeight:700, fontSize:15 }}>
            {match.homeScore ?? "?"} - {match.awayScore ?? "?"}
          </span>
        ) : (
          <span style={{ fontSize:11, color:"#9ca3af" }}>
            {match.date ? new Date(match.date).toLocaleDateString("es-MX", { month:"short", day:"numeric" }) : "vs"}
          </span>
        )}
        <div style={{ marginTop:2 }}><StatusBadge status={match.status}/></div>
      </div>
      {/* Away */}
      <div style={{ flex:1, display:"flex", alignItems:"center", gap:6 }}>
        {match.awayCrest
          ? <img src={match.awayCrest} alt="" style={{ width:20, height:14, objectFit:"contain" }}/>
          : <span style={{ fontSize:16 }}>{flag(match.away)}</span>
        }
        <span style={{ fontSize:13, fontWeight: match.winner===match.away ? 700 : 400 }}>
          {display(match.away)}
        </span>
        {ap && <span style={{ width:7, height:7, borderRadius:"50%", background:ap.color }}/>}
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("ranking");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Datos de la API
  const [groupMatches, setGroupMatches] = useState([]);   // partidos de grupos
  const [knockoutMatches, setKnockoutMatches] = useState([]); // partidos eliminatorios
  const [standings, setStandings] = useState([]);          // tabla de grupos
  const [qualifiedTeams, setQualifiedTeams] = useState([]); // equipos en R32

  const [selectedTeam, setSelectedTeam] = useState(null);

  // Cargar datos de la API
  const loadData = useCallback(async () => {
    if (!API_KEY) {
      setError("Falta la API key. Agrega VITE_RAPIDAPI_KEY en tu archivo .env");
      setLoading(false);
      return;
    }
    try {
      setError(null);

      // 1. Todos los partidos del torneo
      const fixtures = await apiFetch(`fixtures?league=${LEAGUE}&season=${SEASON}`);

      const group = [];
      const knockout = [];
      const qualified = new Set();

      fixtures.forEach(f => {
        const roundRaw = f.league.round || "";
        const isKnockout = Object.keys(ROUND_MAP).some(r => roundRaw.includes(r));
        const status = f.fixture.status.short;
        const finished = ["FT","AET","PEN"].includes(status);
        const live = ["1H","2H","ET","BT","P"].includes(status);

        const home = f.teams.home.name;
        const away = f.teams.away.name;
        const homeScore = f.goals.home;
        const awayScore = f.goals.away;
        const winner = finished
          ? (homeScore > awayScore ? home : awayScore > homeScore ? away : null)
          : null;

        const matchObj = {
          id: f.fixture.id,
          date: f.fixture.date,
          round: roundRaw,
          status,
          home, away,
          homeCrest: f.teams.home.logo,
          awayCrest: f.teams.away.logo,
          homeScore: finished || live ? homeScore : null,
          awayScore: finished || live ? awayScore : null,
          winner,
          group: f.league.round,
        };

        if (isKnockout) {
          knockout.push(matchObj);
          if (finished) {
            qualified.add(home);
            qualified.add(away);
          }
        } else {
          group.push(matchObj);
          // Equipos que clasificaron = todos los que aparecen en R32
        }
      });

      // Equipos en partidos de R32 = ya clasificaron
      knockout
        .filter(m => m.round.includes("Round of 32"))
        .forEach(m => { qualified.add(m.home); qualified.add(m.away); });

      setGroupMatches(group);
      setKnockoutMatches(knockout);
      setQualifiedTeams([...qualified]);

      // 2. Standings (tabla de grupos)
      try {
        const st = await apiFetch(`standings?league=${LEAGUE}&season=${SEASON}`);
        if (st && st[0]) {
          setStandings(st[0].league.standings || []);
        }
      } catch(_) { /* standings opcionales */ }

      setLastUpdated(new Date());
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Refrescar cada 5 minutos
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  const scores = computeScores(knockoutMatches, qualifiedTeams);
  const ranking = [...PARTICIPANTS]
    .map(p => ({ ...p, score: scores[p.name] }))
    .sort((a, b) => b.score - a.score);

  // Agrupar partidos de grupos por grupo
  const groupedMatches = {};
  groupMatches.forEach(m => {
    const g = m.group;
    if (!groupedMatches[g]) groupedMatches[g] = [];
    groupedMatches[g].push(m);
  });

  // Agrupar knockout por ronda
  const knockoutByRound = {};
  knockoutMatches.forEach(m => {
    const r = ROUND_MAP[Object.keys(ROUND_MAP).find(k => m.round.includes(k))] || m.round;
    if (!knockoutByRound[r]) knockoutByRound[r] = [];
    knockoutByRound[r].push(m);
  });

  const allOurTeams = PARTICIPANTS.flatMap(p => p.teams);

  const tabs = [
    { id:"ranking",     label:"🏆 Ranking" },
    { id:"bracket",     label:"🗓️ Bracket" },
    { id:"grupos",      label:"⚽ Grupos" },
    { id:"equipos",     label:"🔍 Equipos" },
  ];

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',sans-serif", background:"#f8fafc", minHeight:"100vh" }}>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#064e3b 0%,#065f46 50%,#047857 100%)", padding:"20px 20px 0", textAlign:"center" }}>
        <div style={{ fontSize:10, letterSpacing:3, color:"#6ee7b7", textTransform:"uppercase", marginBottom:4 }}>FIFA World Cup 2026™</div>
        <h1 style={{ margin:"0 0 4px", fontSize:24, fontWeight:700, color:"#fff" }}>⚽ Quiniela del Mundial</h1>
        <div style={{ color:"#a7f3d0", fontSize:12, marginBottom:2 }}>
          {loading ? "Cargando datos..." : error ? `⚠️ ${error}` : `✅ Actualizado ${lastUpdated?.toLocaleTimeString("es-MX")}`}
        </div>
        {!loading && !error && (
          <button onClick={loadData} style={{ background:"transparent", border:"1px solid #6ee7b7", color:"#6ee7b7", borderRadius:20, padding:"3px 12px", fontSize:11, cursor:"pointer", marginBottom:8 }}>
            🔄 Actualizar
          </button>
        )}
        <div style={{ display:"flex", gap:4, justifyContent:"center", overflowX:"auto", paddingBottom:0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:"10px 16px", border:"none", cursor:"pointer", fontSize:13,
              fontWeight: tab===t.id ? 600 : 400, borderRadius:"8px 8px 0 0",
              background: tab===t.id ? "#f8fafc" : "transparent",
              color: tab===t.id ? "#065f46" : "#a7f3d0",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"20px 16px" }}>

        {loading && (
          <div style={{ textAlign:"center", padding:60, color:"#6b7280" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>⚽</div>
            <div style={{ fontSize:15 }}>Cargando datos del Mundial...</div>
          </div>
        )}

        {!loading && error && (
          <div style={{ background:"#fee2e2", border:"1px solid #fca5a5", borderRadius:12, padding:20, textAlign:"center" }}>
            <div style={{ fontSize:20, marginBottom:8 }}>⚠️</div>
            <div style={{ fontWeight:600, color:"#dc2626", marginBottom:4 }}>Error al cargar la API</div>
            <div style={{ color:"#7f1d1d", fontSize:13 }}>{error}</div>
            <button onClick={loadData} style={{ marginTop:12, background:"#dc2626", color:"#fff", border:"none", borderRadius:8, padding:"8px 20px", cursor:"pointer" }}>Reintentar</button>
          </div>
        )}

        {!loading && !error && (
          <>

            {/* ── RANKING ── */}
            {tab === "ranking" && (
              <div>
                <h2 style={{ fontSize:17, fontWeight:600, color:"#111", margin:"0 0 16px" }}>Tabla de posiciones</h2>
                {ranking.map((p, i) => (
                  <div key={p.name} style={{
                    background:"#fff", border:"1px solid #e5e7eb", borderRadius:12,
                    padding:"12px 16px", marginBottom:10, display:"flex", alignItems:"center", gap:12,
                    borderLeft:`4px solid ${p.color}`,
                  }}>
                    <span style={{ fontWeight:700, fontSize: i<3?20:16, minWidth:28, textAlign:"center",
                      color: i===0?"#d97706": i===1?"#9ca3af": i===2?"#b45309":"#d1d5db" }}>
                      {i===0?"🥇": i===1?"🥈": i===2?"🥉":`${i+1}`}
                    </span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:15, color:"#111" }}>{p.name}</div>
                      <div style={{ display:"flex", gap:6, marginTop:4, flexWrap:"wrap" }}>
                        {p.teams.map(t => (
                          <span key={t} style={{
                            display:"inline-flex", alignItems:"center", gap:4,
                            background:p.light, color:p.color, border:`1px solid ${p.color}44`,
                            borderRadius:12, padding:"2px 8px", fontSize:12, fontWeight:500,
                          }}>
                            {flag(t)} {display(t)}
                            {qualifiedTeams.includes(t) && <span style={{ color:"#16a34a", fontSize:10 }}>✓</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontWeight:700, fontSize:26, color:p.color }}>{p.score}</div>
                      <div style={{ fontSize:11, color:"#9ca3af" }}>pts</div>
                    </div>
                  </div>
                ))}
                <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16, marginTop:8 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:10 }}>Sistema de puntuación</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {Object.entries(ROUND_LABELS).map(([k,v]) => (
                      <div key={k} style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, padding:"6px 12px", fontSize:12 }}>
                        <span style={{ color:"#374151" }}>{v}</span>
                        <span style={{ fontWeight:700, color:"#065f46", marginLeft:6 }}>
                          +{ROUND_POINTS[k]} pts{k==="R32"?" (clasificar)":k==="F"?"+32 (campeón)":""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── BRACKET ── */}
            {tab === "bracket" && (
              <div>
                <h2 style={{ fontSize:17, fontWeight:600, color:"#111", margin:"0 0 4px" }}>Cuadro eliminatorio</h2>
                <p style={{ fontSize:13, color:"#6b7280", margin:"0 0 20px" }}>Datos en tiempo real desde API-Football.</p>
                {["R32","R16","QF","SF","F"].map(rnd => {
                  const matches = knockoutByRound[rnd] || [];
                  if (matches.length === 0) return null;
                  const cols = rnd === "F" ? 1 : rnd === "SF" ? 2 : rnd === "QF" ? 2 : rnd === "R16" ? 2 : 4;
                  return (
                    <div key={rnd} style={{ marginBottom:28 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                        <span style={{ background:"#065f46", color:"#fff", fontSize:11, fontWeight:600, padding:"3px 12px", borderRadius:20 }}>
                          {ROUND_LABELS[rnd]}
                        </span>
                        <div style={{ flex:1, height:1, background:"#e5e7eb" }}/>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols}, minmax(0,1fr))`, gap:10 }}>
                        {matches.map(m => (
                          <div key={m.id} style={{
                            background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:"8px 10px",
                            boxShadow: m.winner ? "0 1px 6px rgba(0,0,0,0.06)" : "none",
                          }}>
                            {[{team:m.home, score:m.homeScore, crest:m.homeCrest}, {team:m.away, score:m.awayScore, crest:m.awayCrest}].map((side, si) => {
                              const p = getParticipant(side.team);
                              const isW = m.winner === side.team;
                              return (
                                <div key={si} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                                  padding:"4px 6px", borderRadius:6, background: isW ? (p?.light||"#dcfce7") : "transparent",
                                  marginBottom: si===0 ? 3 : 0 }}>
                                  <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:13 }}>
                                    {side.crest
                                      ? <img src={side.crest} alt="" style={{ width:18, height:13, objectFit:"contain" }}/>
                                      : <span style={{ fontSize:16 }}>{flag(side.team)}</span>}
                                    <span style={{ fontWeight: isW ? 700 : 400, color: isW?"#111":"#374151" }}>
                                      {display(side.team)}
                                    </span>
                                    {p && <span style={{ width:6,height:6,borderRadius:"50%",background:p.color,display:"inline-block" }}/>}
                                  </span>
                                  <span style={{ fontWeight:700, fontSize:15, color: isW?"#111":"#9ca3af" }}>
                                    {side.score ?? ""}
                                  </span>
                                </div>
                              );
                            })}
                            <div style={{ textAlign:"center", marginTop:4 }}><StatusBadge status={m.status}/></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {Object.keys(knockoutByRound).length === 0 && (
                  <div style={{ textAlign:"center", padding:40, color:"#9ca3af", background:"#fff", border:"1px dashed #d1d5db", borderRadius:12 }}>
                    Los partidos eliminatorios aún no están disponibles en la API.
                  </div>
                )}
                {/* Leyenda */}
                <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:10 }}>Leyenda</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {PARTICIPANTS.map(p => (
                      <div key={p.name} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
                        <span style={{ width:8,height:8,borderRadius:"50%",background:p.color,display:"inline-block" }}/>
                        <span style={{ fontWeight:500 }}>{p.name}:</span>
                        <span style={{ color:"#6b7280" }}>{p.teams.map(t=>display(t)).join(", ")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── GRUPOS ── */}
            {tab === "grupos" && (
              <div>
                <h2 style={{ fontSize:17, fontWeight:600, color:"#111", margin:"0 0 4px" }}>Fase de grupos</h2>
                <p style={{ fontSize:13, color:"#6b7280", margin:"0 0 20px" }}>Resultados y tabla de posiciones de todos los grupos.</p>

                {/* Tabla de standings */}
                {standings.length > 0 && (
                  <div style={{ marginBottom:28 }}>
                    <h3 style={{ fontSize:15, fontWeight:600, color:"#111", margin:"0 0 12px" }}>Tabla de posiciones</h3>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:12 }}>
                      {standings.map((group, gi) => (
                        <div key={gi} style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, overflow:"hidden" }}>
                          <div style={{ background:"#065f46", color:"#fff", padding:"6px 12px", fontSize:12, fontWeight:600 }}>
                            {group[0]?.group || `Grupo ${gi+1}`}
                          </div>
                          <table style={{ width:"100%", fontSize:12, borderCollapse:"collapse" }}>
                            <thead>
                              <tr style={{ background:"#f9fafb" }}>
                                <th style={{ padding:"5px 8px", textAlign:"left" }}>Equipo</th>
                                <th style={{ padding:"5px 4px", textAlign:"center" }}>PJ</th>
                                <th style={{ padding:"5px 4px", textAlign:"center" }}>G</th>
                                <th style={{ padding:"5px 4px", textAlign:"center" }}>E</th>
                                <th style={{ padding:"5px 4px", textAlign:"center" }}>P</th>
                                <th style={{ padding:"5px 4px", textAlign:"center" }}>DG</th>
                                <th style={{ padding:"5px 8px", textAlign:"center", fontWeight:700, color:"#065f46" }}>Pts</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.map((row, ri) => {
                                const p = getParticipant(row.team.name);
                                const qualified2 = row.rank <= 2;
                                return (
                                  <tr key={ri} style={{ borderTop:"1px solid #f3f4f6",
                                    background: qualified2 ? "#f0fdf4" : "transparent" }}>
                                    <td style={{ padding:"5px 8px", display:"flex", alignItems:"center", gap:5 }}>
                                      {row.team.logo
                                        ? <img src={row.team.logo} alt="" style={{ width:16, height:12, objectFit:"contain" }}/>
                                        : <span>{flag(row.team.name)}</span>}
                                      <span style={{ color: p?.color || "#374151", fontWeight: p ? 600 : 400 }}>
                                        {display(row.team.name)}
                                      </span>
                                    </td>
                                    <td style={{ padding:"5px 4px", textAlign:"center" }}>{row.all.played}</td>
                                    <td style={{ padding:"5px 4px", textAlign:"center" }}>{row.all.win}</td>
                                    <td style={{ padding:"5px 4px", textAlign:"center" }}>{row.all.draw}</td>
                                    <td style={{ padding:"5px 4px", textAlign:"center" }}>{row.all.lose}</td>
                                    <td style={{ padding:"5px 4px", textAlign:"center" }}>{row.goalsDiff}</td>
                                    <td style={{ padding:"5px 8px", textAlign:"center", fontWeight:700, color:"#065f46" }}>{row.points}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Partidos por grupo */}
                <h3 style={{ fontSize:15, fontWeight:600, color:"#111", margin:"0 0 12px" }}>Resultados por grupo</h3>
                {Object.entries(groupedMatches).sort().map(([grp, matches]) => (
                  <div key={grp} style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, marginBottom:12, overflow:"hidden" }}>
                    <div style={{ background:"#f3f4f6", padding:"6px 12px", fontSize:12, fontWeight:600, color:"#374151" }}>{grp}</div>
                    <div style={{ padding:"0 12px" }}>
                      {matches.map(m => <MatchRow key={m.id} match={m} compact />)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── EQUIPOS ── */}
            {tab === "equipos" && (
              <div>
                <h2 style={{ fontSize:17, fontWeight:600, color:"#111", margin:"0 0 16px" }}>Seguimiento por equipo</h2>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:20 }}>
                  {allOurTeams.map(team => {
                    const p = getParticipant(team);
                    const isQualified = qualifiedTeams.includes(team);
                    return (
                      <button key={team} onClick={() => setSelectedTeam(selectedTeam===team ? null : team)} style={{
                        display:"flex", alignItems:"center", gap:6, padding:"7px 13px",
                        border:`2px solid ${selectedTeam===team ? p.color : p.color+"44"}`,
                        borderRadius:20, cursor:"pointer", fontSize:13, fontWeight:500,
                        background: selectedTeam===team ? p.light : "#fff", color:p.color,
                      }}>
                        {flag(team)} {display(team)}
                        {isQualified && <span style={{ fontSize:10, color:"#16a34a" }}>✓</span>}
                      </button>
                    );
                  })}
                </div>

                {selectedTeam ? (() => {
                  const p = getParticipant(selectedTeam);
                  const teamGroupMatches = groupMatches.filter(m => m.home===selectedTeam || m.away===selectedTeam);
                  const teamKnockout = knockoutMatches.filter(m => m.home===selectedTeam || m.away===selectedTeam);
                  const isQualified = qualifiedTeams.includes(selectedTeam);
                  let totalPts = isQualified ? ROUND_POINTS.R32 : 0;
                  let eliminated = null;
                  teamKnockout.forEach(m => {
                    const rnd = ROUND_MAP[Object.keys(ROUND_MAP).find(k => m.round.includes(k))];
                    if (!rnd || rnd === "R32") return;
                    if (m.winner === selectedTeam) {
                      totalPts += ROUND_POINTS[rnd];
                      if (rnd === "F") totalPts += ROUND_POINTS.Champion;
                    } else if (m.winner && !eliminated) {
                      eliminated = { round: rnd, against: m.winner };
                    }
                  });

                  return (
                    <div style={{ background:"#fff", border:`2px solid ${p.color}`, borderRadius:14, padding:20 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16, flexWrap:"wrap" }}>
                        <span style={{ fontSize:48 }}>{flag(selectedTeam)}</span>
                        <div style={{ flex:1 }}>
                          <h3 style={{ margin:0, fontSize:20, fontWeight:700 }}>{display(selectedTeam)}</h3>
                          <div style={{ display:"flex", gap:8, marginTop:6, flexWrap:"wrap" }}>
                            <span style={{ background:p.light, color:p.color, padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600 }}>
                              Equipo de {p.name}
                            </span>
                            {eliminated ? (
                              <span style={{ background:"#fee2e2", color:"#dc2626", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600 }}>
                                ❌ Eliminado en {ROUND_LABELS[eliminated.round]}
                              </span>
                            ) : isQualified ? (
                              <span style={{ background:"#dcfce7", color:"#16a34a", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600 }}>
                                ✅ Clasificado
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:30, fontWeight:700, color:p.color }}>{totalPts}</div>
                          <div style={{ fontSize:11, color:"#9ca3af" }}>pts aportados</div>
                        </div>
                      </div>

                      {teamKnockout.length > 0 && (
                        <div style={{ borderTop:"1px solid #f3f4f6", paddingTop:14, marginBottom:14 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:10 }}>Fase eliminatoria</div>
                          {teamKnockout.map(m => <MatchRow key={m.id} match={m} compact />)}
                        </div>
                      )}

                      <div style={{ borderTop:"1px solid #f3f4f6", paddingTop:14 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:10 }}>Fase de grupos ({teamGroupMatches.length} partidos)</div>
                        {teamGroupMatches.length === 0
                          ? <p style={{ fontSize:13, color:"#9ca3af" }}>Sin partidos registrados.</p>
                          : teamGroupMatches.map(m => <MatchRow key={m.id} match={m} compact />)
                        }
                      </div>
                    </div>
                  );
                })() : (
                  <div style={{ textAlign:"center", padding:40, color:"#9ca3af", background:"#fff", border:"1px dashed #d1d5db", borderRadius:12 }}>
                    👆 Selecciona un equipo para ver su seguimiento
                  </div>
                )}
              </div>
            )}

          </>
        )}
      </div>

      <div style={{ textAlign:"center", padding:"20px 16px 32px", color:"#9ca3af", fontSize:12 }}>
        FIFA World Cup 2026™ · Datos: API-Football (league=1, season=2026)
        {lastUpdated && ` · Actualizado: ${lastUpdated.toLocaleTimeString("es-MX")}`}
      </div>
    </div>
  );
}