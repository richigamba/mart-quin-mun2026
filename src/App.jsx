import { useState, useEffect, useCallback } from "react";

// ── CONFIGURACIÓN ─────────────────────────────────────────────────────────────
const API_BASE = "https://worldcup26.ir/get";

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

const TEAM_DISPLAY = {
  "Germany": "Alemania", "Norway": "Noruega", "South Korea": "Corea del Sur",
  "Argentina": "Argentina", "France": "Francia", "Belgium": "Bélgica",
  "Netherlands": "Países Bajos", "Turkey": "Turquía", "England": "Inglaterra",
  "Sweden": "Suecia", "Portugal": "Portugal", "Uruguay": "Uruguay",
  "Mexico": "México", "Brazil": "Brasil", "Canada": "Canadá", "Japan": "Japón",
  "Spain": "España", "Morocco": "Marruecos", "Australia": "Australia",
  "Colombia": "Colombia", "United States": "Estados Unidos",
  "South Africa": "Sudáfrica", "Ivory Coast": "Costa de Marfil",
  "Democratic Republic of the Congo": "R.D. Congo", "Czech Republic": "República Checa",
  "Bosnia and Herzegovina": "Bosnia", "Cape Verde": "Cabo Verde",
  "Saudi Arabia": "Arabia Saudita", "New Zealand": "Nueva Zelanda",
};

const FLAGS = {
  "Germany":"🇩🇪","Norway":"🇳🇴","South Korea":"🇰🇷",
  "Argentina":"🇦🇷","France":"🇫🇷","Belgium":"🇧🇪","Netherlands":"🇳🇱",
  "Turkey":"🇹🇷","England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Sweden":"🇸🇪","Portugal":"🇵🇹",
  "Uruguay":"🇺🇾","Mexico":"🇲🇽","Brazil":"🇧🇷","Canada":"🇨🇦","Japan":"🇯🇵",
  "Spain":"🇪🇸","Morocco":"🇲🇦","Australia":"🇦🇺","Colombia":"🇨🇴",
  "United States":"🇺🇸","Senegal":"🇸🇳","Austria":"🇦🇹",
  "Egypt":"🇪🇬","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","Switzerland":"🇨🇭","Ghana":"🇬🇭",
  "Croatia":"🇭🇷","Panama":"🇵🇦","Democratic Republic of the Congo":"🇨🇩",
  "Uzbekistan":"🇺🇿","South Africa":"🇿🇦","Czech Republic":"🇨🇿",
  "Paraguay":"🇵🇾","Ivory Coast":"🇨🇮","Curaçao":"🏳️","Tunisia":"🇹🇳",
  "Iran":"🇮🇷","New Zealand":"🇳🇿","Saudi Arabia":"🇸🇦","Cape Verde":"🇨🇻",
  "Iraq":"🇮🇶","Jordan":"🇯🇴","Haiti":"🇭🇹","Ecuador":"🇪🇨",
  "Bosnia and Herzegovina":"🇧🇦","Qatar":"🇶🇦","Algeria":"🇩🇿","Senegal":"🇸🇳",
};

// Orden y etiquetas de rondas eliminatorias
const ROUND_ORDER = ["r32", "r16", "qf", "sf", "final"];
const ROUND_LABELS = {
  r32: "16avos de final", r16: "Octavos", qf: "Cuartos", sf: "Semifinal", final: "Final",
};

// Puntos por acción (se acumulan)
const ROUND_POINTS = {
  qualify: 1,  // clasificar al R32
  r32: 2,      // ganar partido de R32
  r16: 4,      // ganar partido de R16
  qf: 8,       // ganar partido de QF
  sf: 16,      // ganar partido de SF
  final: 32,   // campeón (adicionales al ganar la Final)
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function display(name) { return TEAM_DISPLAY[name] || name; }
function flag(name) { return FLAGS[name] || "🏳️"; }
function getParticipant(teamName) {
  if (!teamName) return null;
  return PARTICIPANTS.find(p => p.teams.includes(teamName)) || null;
}

function parseLocalDate(str) {
  if (!str) return null;
  // Format: "06/13/2026 21:00"
  const [datePart, timePart] = str.split(" ");
  if (!datePart) return null;
  const [mm, dd, yyyy] = datePart.split("/");
  return new Date(`${yyyy}-${mm}-${dd}T${timePart || "00:00"}:00`);
}

function getStatus(game) {
  if (game.finished === "TRUE") return "FT";
  const t = (game.time_elapsed || "").toLowerCase();
  if (t && t !== "notstarted") return "LIVE";
  return "NS";
}

function getWinner(game) {
  if (game.finished !== "TRUE") return null;
  const hs = parseInt(game.home_score, 10);
  const as = parseInt(game.away_score, 10);
  if (hs > as) return game.home_team_name_en || null;
  if (as > hs) return game.away_team_name_en || null;
  return null;
}

function transformGame(game) {
  const status = getStatus(game);
  const active = status !== "NS";
  return {
    id: game.id,
    date: parseLocalDate(game.local_date),
    type: game.type,
    group: game.group,
    status,
    home: game.home_team_name_en || game.home_team_label || "?",
    away: game.away_team_name_en || game.away_team_label || "?",
    homeScore: active ? parseInt(game.home_score, 10) : null,
    awayScore: active ? parseInt(game.away_score, 10) : null,
    winner: getWinner(game),
  };
}

function computeScores(knockoutMatches, qualifiedTeams) {
  const scores = {};
  PARTICIPANTS.forEach(p => { scores[p.name] = 0; });

  // 1pt por clasificar al R32
  qualifiedTeams.forEach(team => {
    const p = getParticipant(team);
    if (p) scores[p.name] += ROUND_POINTS.qualify;
  });

  // Puntos por ganar cada ronda
  knockoutMatches.forEach(m => {
    if (!m.winner) return;
    const pts = ROUND_POINTS[m.type];
    if (!pts) return;
    const p = getParticipant(m.winner);
    if (p) scores[p.name] += pts;
  });

  return scores;
}

// ── COMPONENTES ───────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  if (status === "FT")
    return <span style={{ fontSize:10, background:"#dcfce7", color:"#16a34a", borderRadius:8, padding:"1px 6px", fontWeight:600 }}>FIN</span>;
  if (status === "LIVE")
    return <span style={{ fontSize:10, background:"#fef9c3", color:"#ca8a04", borderRadius:8, padding:"1px 6px", fontWeight:600 }}>EN VIVO</span>;
  return <span style={{ fontSize:10, background:"#f3f4f6", color:"#9ca3af", borderRadius:8, padding:"1px 6px" }}>PRÓXIMO</span>;
}

function MatchRow({ match, compact = false }) {
  const hp = getParticipant(match.home);
  const ap = getParticipant(match.away);
  const hasScore = match.homeScore !== null;
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
        <span style={{ fontSize:16 }}>{flag(match.home)}</span>
      </div>
      {/* Score */}
      <div style={{ minWidth:60, textAlign:"center" }}>
        {hasScore ? (
          <span style={{ fontWeight:700, fontSize:15 }}>
            {match.homeScore} - {match.awayScore}
          </span>
        ) : (
          <span style={{ fontSize:11, color:"#9ca3af" }}>
            {match.date ? match.date.toLocaleDateString("es-MX", { month:"short", day:"numeric" }) : "vs"}
          </span>
        )}
        <div style={{ marginTop:2 }}><StatusBadge status={match.status}/></div>
      </div>
      {/* Away */}
      <div style={{ flex:1, display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ fontSize:16 }}>{flag(match.away)}</span>
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

  const [groupMatches, setGroupMatches] = useState([]);
  const [knockoutMatches, setKnockoutMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [qualifiedTeams, setQualifiedTeams] = useState([]);

  const [selectedTeam, setSelectedTeam] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);

      const [gamesRes, groupsRes] = await Promise.all([
        fetch(`${API_BASE}/games`),
        fetch(`${API_BASE}/groups`),
      ]);
      if (!gamesRes.ok) throw new Error(`Games API: HTTP ${gamesRes.status}`);
      if (!groupsRes.ok) throw new Error(`Groups API: HTTP ${groupsRes.status}`);

      const gamesData = await gamesRes.json();
      const groupsData = await groupsRes.json();
      const games = gamesData.games || [];

      // Mapa team_id → nombre inglés (para tabla de grupos)
      const idToName = {};
      games.forEach(g => {
        if (g.home_team_name_en && g.home_team_id !== "0") idToName[g.home_team_id] = g.home_team_name_en;
        if (g.away_team_name_en && g.away_team_id !== "0") idToName[g.away_team_id] = g.away_team_name_en;
      });

      const group = [];
      const knockout = [];
      const qualified = new Set();

      games.forEach(g => {
        const m = transformGame(g);
        if (g.type === "group") {
          group.push(m);
        } else if (ROUND_ORDER.includes(g.type)) {
          knockout.push(m);
          // Todos los equipos en R32 = clasificados de grupos
          if (g.type === "r32") {
            if (g.home_team_name_en) qualified.add(g.home_team_name_en);
            if (g.away_team_name_en) qualified.add(g.away_team_name_en);
          }
        }
      });

      setGroupMatches(group);
      setKnockoutMatches(knockout);
      setQualifiedTeams([...qualified]);

      // Procesar tabla de grupos
      const rawGroups = groupsData.groups || [];
      const processed = rawGroups.map(grp => ({
        name: grp.name,
        teams: [...grp.teams]
          .sort((a, b) =>
            parseInt(b.pts) - parseInt(a.pts) ||
            parseInt(b.gd)  - parseInt(a.gd)  ||
            parseInt(b.gf)  - parseInt(a.gf)
          )
          .map((t, idx) => ({
            ...t,
            rank: idx + 1,
            teamName: idToName[t.team_id] || `Equipo ${t.team_id}`,
          })),
      }));
      setStandings(processed);

      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  const scores = computeScores(knockoutMatches, qualifiedTeams);
  const ranking = [...PARTICIPANTS]
    .map(p => ({ ...p, score: scores[p.name] }))
    .sort((a, b) => b.score - a.score);

  // Partidos de grupos por letra de grupo
  const groupedMatches = {};
  groupMatches.forEach(m => {
    if (!groupedMatches[m.group]) groupedMatches[m.group] = [];
    groupedMatches[m.group].push(m);
  });

  // Eliminatorios por tipo de ronda
  const knockoutByType = {};
  knockoutMatches.forEach(m => {
    if (!knockoutByType[m.type]) knockoutByType[m.type] = [];
    knockoutByType[m.type].push(m);
  });

  const allOurTeams = PARTICIPANTS.flatMap(p => p.teams);

  const tabs = [
    { id:"ranking", label:"🏆 Ranking" },
    { id:"bracket", label:"🗓️ Bracket" },
    { id:"grupos",  label:"⚽ Grupos" },
    { id:"equipos", label:"🔍 Equipos" },
  ];

  const SCORING_DISPLAY = [
    { label:"Clasificar al R32", pts: ROUND_POINTS.qualify },
    { label:"Ganar 16avos",      pts: ROUND_POINTS.r32 },
    { label:"Ganar Octavos",     pts: ROUND_POINTS.r16 },
    { label:"Ganar Cuartos",     pts: ROUND_POINTS.qf },
    { label:"Ganar Semifinal",   pts: ROUND_POINTS.sf },
    { label:"Campeón",           pts: ROUND_POINTS.final },
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
            <div style={{ fontWeight:600, color:"#dc2626", marginBottom:4 }}>Error al cargar datos</div>
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
                    {SCORING_DISPLAY.map(s => (
                      <div key={s.label} style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, padding:"6px 12px", fontSize:12 }}>
                        <span style={{ color:"#374151" }}>{s.label}</span>
                        <span style={{ fontWeight:700, color:"#065f46", marginLeft:6 }}>+{s.pts} pts</span>
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
                <p style={{ fontSize:13, color:"#6b7280", margin:"0 0 20px" }}>Datos en tiempo real desde worldcup26.ir</p>
                {ROUND_ORDER.map(rnd => {
                  const matches = knockoutByType[rnd] || [];
                  if (matches.length === 0) return null;
                  const cols = rnd === "final" ? 1 : rnd === "sf" ? 2 : rnd === "qf" ? 2 : rnd === "r16" ? 2 : 4;
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
                            {[{team:m.home, score:m.homeScore},{team:m.away, score:m.awayScore}].map((side, si) => {
                              const p = getParticipant(side.team);
                              const isW = m.winner === side.team;
                              return (
                                <div key={si} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                                  padding:"4px 6px", borderRadius:6,
                                  background: isW ? (p?.light || "#dcfce7") : "transparent",
                                  marginBottom: si===0 ? 3 : 0 }}>
                                  <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:13 }}>
                                    <span style={{ fontSize:16 }}>{flag(side.team)}</span>
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
                {Object.keys(knockoutByType).length === 0 && (
                  <div style={{ textAlign:"center", padding:40, color:"#9ca3af", background:"#fff", border:"1px dashed #d1d5db", borderRadius:12 }}>
                    Los partidos eliminatorios aún no están disponibles.
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
                        <span style={{ color:"#6b7280" }}>{p.teams.map(t => display(t)).join(", ")}</span>
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

                {/* Tabla de posiciones */}
                {standings.length > 0 && (
                  <div style={{ marginBottom:28 }}>
                    <h3 style={{ fontSize:15, fontWeight:600, color:"#111", margin:"0 0 12px" }}>Tabla de posiciones</h3>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:12 }}>
                      {standings.map(grp => (
                        <div key={grp.name} style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, overflow:"hidden" }}>
                          <div style={{ background:"#065f46", color:"#fff", padding:"6px 12px", fontSize:12, fontWeight:600 }}>
                            Grupo {grp.name}
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
                              {grp.teams.map(row => {
                                const p = getParticipant(row.teamName);
                                return (
                                  <tr key={row.team_id} style={{
                                    borderTop:"1px solid #f3f4f6",
                                    background: row.rank <= 2 ? "#f0fdf4" : "transparent",
                                  }}>
                                    <td style={{ padding:"5px 8px" }}>
                                      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                                        <span>{flag(row.teamName)}</span>
                                        <span style={{ color: p?.color || "#374151", fontWeight: p ? 600 : 400 }}>
                                          {display(row.teamName)}
                                        </span>
                                      </div>
                                    </td>
                                    <td style={{ padding:"5px 4px", textAlign:"center" }}>{row.mp}</td>
                                    <td style={{ padding:"5px 4px", textAlign:"center" }}>{row.w}</td>
                                    <td style={{ padding:"5px 4px", textAlign:"center" }}>{row.d}</td>
                                    <td style={{ padding:"5px 4px", textAlign:"center" }}>{row.l}</td>
                                    <td style={{ padding:"5px 4px", textAlign:"center" }}>{row.gd}</td>
                                    <td style={{ padding:"5px 8px", textAlign:"center", fontWeight:700, color:"#065f46" }}>{row.pts}</td>
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
                    <div style={{ background:"#f3f4f6", padding:"6px 12px", fontSize:12, fontWeight:600, color:"#374151" }}>Grupo {grp}</div>
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
                  let totalPts = isQualified ? ROUND_POINTS.qualify : 0;
                  let eliminated = null;
                  teamKnockout.forEach(m => {
                    if (m.winner === selectedTeam) {
                      totalPts += ROUND_POINTS[m.type] || 0;
                    } else if (m.winner && !eliminated) {
                      eliminated = { round: m.type, against: m.winner };
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
                            ) : (
                              <span style={{ background:"#fee2e2", color:"#dc2626", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600 }}>
                                ❌ Eliminado en grupos
                              </span>
                            )}
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
                        <div style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:10 }}>
                          Fase de grupos ({teamGroupMatches.length} partidos)
                        </div>
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
        FIFA World Cup 2026™ · Datos: worldcup26.ir
        {lastUpdated && ` · Actualizado: ${lastUpdated.toLocaleTimeString("es-MX")}`}
      </div>
    </div>
  );
}
