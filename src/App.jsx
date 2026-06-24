import { useState, useRef, useEffect } from "react";

// ── DATA ──────────────────────────────────────────────────────────────────────

const PARTICIPANTS = [
  { name: "Susy",  teams: ["Alemania", "Noruega"],        color: "#7C3AED", light: "#EDE9FE" },
  { name: "Toka",  teams: ["Corea del Sur", "Argentina"], color: "#0891B2", light: "#CFFAFE" },
  { name: "Kore",  teams: ["Francia", "Bélgica"],         color: "#2563EB", light: "#DBEAFE" },
  { name: "Patty", teams: ["Países Bajos", "Turquía"],    color: "#EA580C", light: "#FFEDD5" },
  { name: "Pauz",  teams: ["Inglaterra", "Suecia"],       color: "#DC2626", light: "#FEE2E2" },
  { name: "Edgar", teams: ["Portugal", "Uruguay"],        color: "#16A34A", light: "#DCFCE7" },
  { name: "Clio",  teams: ["México", "Brasil"],           color: "#CA8A04", light: "#FEF9C3" },
  { name: "Angie", teams: ["Canadá", "Japón"],            color: "#DB2777", light: "#FCE7F3" },
  { name: "Richi", teams: ["España", "Marruecos"],        color: "#9333EA", light: "#F3E8FF" },
  { name: "Tyler", teams: ["Australia", "Colombia"],      color: "#0D9488", light: "#CCFBF1" },
];

const FLAGS = {
  "Alemania":"🇩🇪","Noruega":"🇳🇴","Corea del Sur":"🇰🇷","Argentina":"🇦🇷",
  "Francia":"🇫🇷","Bélgica":"🇧🇪","Países Bajos":"🇳🇱","Turquía":"🇹🇷",
  "Inglaterra":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Suecia":"🇸🇪","Portugal":"🇵🇹","Uruguay":"🇺🇾",
  "México":"🇲🇽","Brasil":"🇧🇷","Canadá":"🇨🇦","Japón":"🇯🇵",
  "España":"🇪🇸","Marruecos":"🇲🇦","Australia":"🇦🇺","Colombia":"🇨🇴",
  "USA":"🇺🇸","Senegal":"🇸🇳","Austria":"🇦🇹","Egipto":"🇪🇬",
};

// Map common API team names (English) to local Spanish names used in the app
const TEAM_NAME_MAP = {
  // Americas
  "United States":"USA", "USA":"USA",
  "Mexico":"México",
  "Canada":"Canadá",
  "Brazil":"Brasil",
  "Argentina":"Argentina",
  "Colombia":"Colombia",
  "Uruguay":"Uruguay",
  "Haiti":"Haití",
  "Curaçao":"Curazao", "Curacao":"Curazao",
  // Europe
  "Germany":"Alemania",
  "France":"Francia",
  "Spain":"España",
  "Portugal":"Portugal",
  "England":"Inglaterra",
  "Netherlands":"Países Bajos",
  "Belgium":"Bélgica",
  "Norway":"Noruega",
  "Sweden":"Suecia",
  "Turkey":"Turquía",
  "Austria":"Austria",
  // Africa / Asia / Oceania
  "Morocco":"Marruecos",
  "Senegal":"Senegal",
  "Egypt":"Egipto",
  "DR Congo":"RD Congo",
  "Ivory Coast":"Costa de Marfil", "Côte d'Ivoire":"Costa de Marfil",
  "Cape Verde":"Cabo Verde", "Cabo Verde":"Cabo Verde",
  "South Korea":"Corea del Sur", "Korea Republic":"Corea del Sur",
  "Japan":"Japón",
  "Saudi Arabia":"Arabia Saudí",
  "Australia":"Australia",
  "Czech Republic":"Chequia",
  "Republic of Ireland":"Ireland",
};

// Return a flag element for a team object (from API) or a name string
function TeamFlag({ team }) {
  // team can be string name or object { name, crest, crestUrl, tla }
  if (!team) return <span>🏳️</span>;
  const name = typeof team === 'string' ? team : (team.name || '');
  const crest = typeof team === 'object' ? (team.crest || team.crestUrl || team.crestUrl2) : null;
  if (crest) {
    return <img src={crest} alt={name} style={{ width:20, height:14, objectFit:'contain' }} />;
  }
  if (FLAGS[name]) return <span>{FLAGS[name]}</span>;
  return <span>🏳️</span>;
}


const ROUND_POINTS = { R32:1, R16:2, QF:4, SF:8, F:16, Champion:32 };
const ROUND_LABELS = { R32:"16avos de final", R16:"Octavos", QF:"Cuartos", SF:"Semifinal", F:"Final", Champion:"Campeón" };

// No fallback hardcoded results — wrong data is worse than no data.
// Results come exclusively from the API.
const FALLBACK_GROUP_RESULTS = [];

// Bracket: each match has feedA/feedB describing where teams come from (for hover tooltip)
// home/away are known teams; pendingA/pendingB are possible candidates when TBD
const INITIAL_BRACKET = {
  R32: [
    { id:"r32-0",  home:"México",       away:"?",          homeScore:null, awayScore:null, winner:null, pendingA:null, pendingB:["3ro Gpo A/B/C/D"] },
    { id:"r32-1",  home:"Canadá",       away:"?",          homeScore:null, awayScore:null, winner:null, pendingA:null, pendingB:["3ro Gpo B/C/D/E"] },
    { id:"r32-2",  home:"Brasil",       away:"Marruecos",  homeScore:null, awayScore:null, winner:null, pendingA:null, pendingB:null },
    { id:"r32-3",  home:"USA",          away:"?",          homeScore:null, awayScore:null, winner:null, pendingA:null, pendingB:["2do Gpo D"] },
    { id:"r32-4",  home:"Alemania",     away:"?",          homeScore:null, awayScore:null, winner:null, pendingA:null, pendingB:["3ro Gpo E/F/G"] },
    { id:"r32-5",  home:"Países Bajos", away:"?",          homeScore:null, awayScore:null, winner:null, pendingA:null, pendingB:["3ro Gpo F/G/H"] },
    { id:"r32-6",  home:"Japón",        away:"Bélgica",    homeScore:null, awayScore:null, winner:null, pendingA:null, pendingB:null },
    { id:"r32-7",  home:"Turquía",      away:"Egipto",     homeScore:null, awayScore:null, winner:null, pendingA:null, pendingB:null },
    { id:"r32-8",  home:"España",       away:"Austria",    homeScore:null, awayScore:null, winner:null, pendingA:null, pendingB:null },
    { id:"r32-9",  home:"Argentina",    away:"Uruguay",    homeScore:null, awayScore:null, winner:null, pendingA:null, pendingB:null },
    { id:"r32-10", home:"Francia",      away:"Noruega",    homeScore:null, awayScore:null, winner:null, pendingA:null, pendingB:null },
    { id:"r32-11", home:"Suecia",       away:"Corea del Sur", homeScore:null, awayScore:null, winner:null, pendingA:null, pendingB:null },
    { id:"r32-12", home:"Colombia",     away:"?",          homeScore:null, awayScore:null, winner:null, pendingA:null, pendingB:["3ro Gpo K/L"] },
    { id:"r32-13", home:"Portugal",     away:"Inglaterra", homeScore:null, awayScore:null, winner:null, pendingA:null, pendingB:null },
    { id:"r32-14", home:"Senegal",      away:"?",          homeScore:null, awayScore:null, winner:null, pendingA:null, pendingB:["3ro Gpo I/J"] },
    { id:"r32-15", home:"?",            away:"?",          homeScore:null, awayScore:null, winner:null, pendingA:["2do Gpo B"], pendingB:["2do Gpo L"] },
  ],
  // R16: winners of R32 pairs (0+1, 2+3, 4+5, 6+7, 8+9, 10+11, 12+13, 14+15)
  R16: [
    { id:"r16-0", home:"?", away:"?", homeScore:null, awayScore:null, winner:null, feedA:"r32-0", feedB:"r32-1" },
    { id:"r16-1", home:"?", away:"?", homeScore:null, awayScore:null, winner:null, feedA:"r32-2", feedB:"r32-3" },
    { id:"r16-2", home:"?", away:"?", homeScore:null, awayScore:null, winner:null, feedA:"r32-4", feedB:"r32-5" },
    { id:"r16-3", home:"?", away:"?", homeScore:null, awayScore:null, winner:null, feedA:"r32-6", feedB:"r32-7" },
    { id:"r16-4", home:"?", away:"?", homeScore:null, awayScore:null, winner:null, feedA:"r32-8", feedB:"r32-9" },
    { id:"r16-5", home:"?", away:"?", homeScore:null, awayScore:null, winner:null, feedA:"r32-10", feedB:"r32-11" },
    { id:"r16-6", home:"?", away:"?", homeScore:null, awayScore:null, winner:null, feedA:"r32-12", feedB:"r32-13" },
    { id:"r16-7", home:"?", away:"?", homeScore:null, awayScore:null, winner:null, feedA:"r32-14", feedB:"r32-15" },
  ],
  QF: [
    { id:"qf-0", home:"?", away:"?", homeScore:null, awayScore:null, winner:null, feedA:"r16-0", feedB:"r16-1" },
    { id:"qf-1", home:"?", away:"?", homeScore:null, awayScore:null, winner:null, feedA:"r16-2", feedB:"r16-3" },
    { id:"qf-2", home:"?", away:"?", homeScore:null, awayScore:null, winner:null, feedA:"r16-4", feedB:"r16-5" },
    { id:"qf-3", home:"?", away:"?", homeScore:null, awayScore:null, winner:null, feedA:"r16-6", feedB:"r16-7" },
  ],
  SF: [
    { id:"sf-0", home:"?", away:"?", homeScore:null, awayScore:null, winner:null, feedA:"qf-0", feedB:"qf-1" },
    { id:"sf-1", home:"?", away:"?", homeScore:null, awayScore:null, winner:null, feedA:"qf-2", feedB:"qf-3" },
  ],
  F: [
    { id:"f-0", home:"?", away:"?", homeScore:null, awayScore:null, winner:null, feedA:"sf-0", feedB:"sf-1" },
  ],
};

// ── HELPERS ───────────────────────────────────────────────────────────────────

function getParticipant(team) {
  return PARTICIPANTS.find(p => p.teams.includes(team));
}

// Build a flat lookup of all matches by id
function buildMatchMap(bracket) {
  const map = {};
  Object.values(bracket).flat().forEach(m => { map[m.id] = m; });
  return map;
}

// Get the "likely candidates" for a slot based on feed chain
function getCandidates(matchId, matchMap) {
  const m = matchMap[matchId];
  if (!m) return [];
  if (m.winner) return [m.winner];

  const sideA = m.home !== "?" ? [m.home]
    : m.feedA ? getCandidates(m.feedA, matchMap)
    : m.pendingA || [];
  const sideB = m.away !== "?" ? [m.away]
    : m.feedB ? getCandidates(m.feedB, matchMap)
    : m.pendingB || [];
  return [...sideA, ...sideB];
}

// Auto-propagate winners into child matches
function propagate(bracket) {
  const b = JSON.parse(JSON.stringify(bracket));
  const map = buildMatchMap(b);
  const rounds = ["R16","QF","SF","F"];
  rounds.forEach(rnd => {
    b[rnd].forEach(m => {
      if (m.feedA) {
        const src = map[m.feedA];
        if (src && src.winner) m.home = src.winner;
      }
      if (m.feedB) {
        const src = map[m.feedB];
        if (src && src.winner) m.away = src.winner;
      }
    });
  });
  return b;
}

function computeScores(bracket) {
  const scores = {};
  PARTICIPANTS.forEach(p => { scores[p.name] = 0; });

  // R32 qualification: 1 pt per team that appears in the R32 bracket (confirmed slot)
  const r32Teams = new Set();
  (bracket.R32||[]).forEach(m => {
    if (m.home !== "?") r32Teams.add(m.home);
    if (m.away !== "?") r32Teams.add(m.away);
  });
  r32Teams.forEach(team => {
    const p = getParticipant(team);
    if (p) scores[p.name] += ROUND_POINTS.R32;
  });

  // R16 onwards: points for winning each match
  ["R16","QF","SF","F"].forEach(rnd => {
    (bracket[rnd]||[]).forEach(m => {
      if (m.winner) {
        const p = getParticipant(m.winner);
        if (p) {
          scores[p.name] += ROUND_POINTS[rnd];
          if (rnd === "F") scores[p.name] += ROUND_POINTS.Champion;
        }
      }
    });
  });

  // Also award R32 win points (advancing from R32 = already counted above as R16 entry,
  // but R32 match winner gets the R16 points when that match is played — nothing extra needed)
  return scores;
}

function getTeamMatches(team, bracket) {
  const result = [];
  ["R32","R16","QF","SF","F"].forEach(rnd => {
    (bracket[rnd]||[]).forEach(m => {
      if (m.home === team || m.away === team) result.push({ round:rnd, ...m });
    });
  });
  return result;
}

// ── TOOLTIP COMPONENT ─────────────────────────────────────────────────────────

function Tooltip({ children, content, disabled }) {
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  if (disabled || !content) return children;
  return (
    <div ref={ref} style={{ position:"relative", display:"inline-block", width:"100%" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
      onTouchStart={() => setShow(v => !v)}>
      {children}
      {show && (
        <div style={{
          position:"absolute", bottom:"calc(100% + 8px)", left:"50%",
          transform:"translateX(-50%)", zIndex:100,
          background:"#1f2937", color:"#f9fafb", borderRadius:10,
          padding:"10px 14px", fontSize:12, whiteSpace:"nowrap",
          boxShadow:"0 4px 20px rgba(0,0,0,0.25)", minWidth:160,
          pointerEvents:"none",
        }}>
          {content}
          <div style={{
            position:"absolute", top:"100%", left:"50%", transform:"translateX(-50%)",
            width:0, height:0, borderLeft:"6px solid transparent",
            borderRight:"6px solid transparent", borderTop:"6px solid #1f2937",
          }}/>
        </div>
      )}
    </div>
  );
}

// ── MATCH CARD ────────────────────────────────────────────────────────────────

function MatchCard({ match, matchMap, onSetWinner }) {
  const isPending = match.home === "?" || match.away === "?";
  const hp = getParticipant(match.home);
  const ap = getParticipant(match.away);

  // Build tooltip content for pending slots
  function slotTooltip(side) {
    const team = side === "home" ? match.home : match.away;
    if (team !== "?") return null;
    const feedKey = side === "home" ? match.feedA : match.feedB;
    const pending = side === "home" ? match.pendingA : match.pendingB;
    let candidates = [];
    if (feedKey && matchMap) {
      candidates = getCandidates(feedKey, matchMap);
    } else if (pending) {
      candidates = pending;
    }
    if (!candidates.length) return "Por definirse";
    return (
      <div>
        <div style={{ fontSize:10, color:"#9ca3af", marginBottom:4 }}>Posibles rivales:</div>
        {candidates.map((c,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
            <span>{FLAGS[c] || "🏳️"}</span>
            <span style={{ fontWeight: getParticipant(c) ? 600 : 400 }}>{c}</span>
            {getParticipant(c) && (
              <span style={{
                fontSize:10, background:getParticipant(c).light,
                color:getParticipant(c).color, padding:"0 5px", borderRadius:8,
              }}>({getParticipant(c).name})</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  function TeamRow({ team, score, isWinner, side }) {
    const p = getParticipant(team);
    const tip = team === "?" ? slotTooltip(side) : null;
    const row = (
      <div onClick={() => team !== "?" && onSetWinner && onSetWinner(team)}
        style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"5px 8px", borderRadius:7, cursor: team !== "?" && onSetWinner ? "pointer" : "default",
          background: isWinner ? (p ? p.light : "#dcfce7") : "transparent",
          border: isWinner ? `1.5px solid ${p ? p.color+"66" : "#86efac"}` : "1.5px solid transparent",
          transition:"all 0.12s",
        }}>
        <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:13 }}>
          <span style={{ fontSize:team==="?"?14:18, opacity:team==="?"?0.3:1 }}>
            {team==="?" ? "❓" : (FLAGS[team]||"🏳️")}
          </span>
          <span style={{ fontWeight: isWinner ? 700 : 500, color: team==="?"?"#9ca3af": isWinner?"#111":"#374151" }}>
            {team==="?" ? "Por definirse" : team}
          </span>
          {p && <span style={{ width:7,height:7,borderRadius:"50%",background:p.color,display:"inline-block",flexShrink:0 }}/>}
        </span>
        <span style={{ fontWeight:700, fontSize:15, minWidth:20, textAlign:"right",
          color: isWinner ? "#111" : "#9ca3af" }}>
          {score ?? ""}
        </span>
      </div>
    );
    if (tip) return <Tooltip content={tip}>{row}</Tooltip>;
    return row;
  }

  return (
    <div style={{
      background:"#fff", border:`1px solid ${match.winner?"#d1d5db":"#e5e7eb"}`,
      borderRadius:10, padding:"6px 6px", minWidth:0,
      boxShadow: match.winner ? "0 1px 6px rgba(0,0,0,0.07)" : "none",
      opacity: isPending && !match.winner ? 0.85 : 1,
    }}>
      <TeamRow team={match.home} score={match.homeScore} isWinner={match.winner===match.home} side="home"/>
      <div style={{ height:2, background:"#f3f4f6", margin:"3px 0" }}/>
      <TeamRow team={match.away} score={match.awayScore} isWinner={match.winner===match.away} side="away"/>
      {match.winner && (
        <div style={{ textAlign:"center", fontSize:10, color:"#16a34a", marginTop:4, fontWeight:600 }}>
          ✓ {match.winner} avanza
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("ranking");
  const [rawBracket, setRawBracket] = useState(INITIAL_BRACKET);
  const [selectedTeam, setSelectedTeam] = useState(null);
  // Group results state (uses API when available, fallback otherwise)
  const [groupResults, setGroupResults] = useState(FALLBACK_GROUP_RESULTS);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [apiError, setApiError] = useState(false);
  const [apiErrorMsg, setApiErrorMsg] = useState(null);
  const [teamsFromApi, setTeamsFromApi] = useState([]);
  const [standings, setStandings] = useState([]);


  // Always propagate winners before rendering
  const bracket = propagate(rawBracket);
  const matchMap = buildMatchMap(bracket);
  const scores = computeScores(bracket);
  const ranking = [...PARTICIPANTS]
    .map(p => ({ ...p, score: scores[p.name] }))
    .sort((a, b) => b.score - a.score);

  function setWinner(round, idx, team) {
    setRawBracket(prev => {
      const b = JSON.parse(JSON.stringify(prev));
      const m = b[round][idx];
      m.winner = m.winner === team ? null : team;
      return b;
    });
  }

  function setScore(round, idx, side, val) {
    setRawBracket(prev => {
      const b = JSON.parse(JSON.stringify(prev));
      b[round][idx][side] = val === "" ? null : Number(val);
      return b;
    });
  }

  // Fetch live matches from football-data.org and update group results
  useEffect(() => {
    let mounted = true;
    async function fetchMatches() {
      try {
        const res = await fetch('/api/football/v4/competitions/WC/matches');
        if (!res.ok) {
          let body = '';
          try { body = await res.text(); } catch(_) {}
          throw new Error(`HTTP ${res.status} ${res.statusText}${body ? ': ' + body.slice(0, 200) : ''}`);
        }
        const data = await res.json();
        const matches = data.matches || [];

        function normalizeName(name) {
          return TEAM_NAME_MAP[name] || name;
        }

        // Group stage → flat list for groupResults
        const mapped = matches
          .filter(m => (m.stage === 'GROUP_STAGE') || (m.group))
          .map(m => {
            const home = normalizeName(m.homeTeam?.name || '');
            const away = normalizeName(m.awayTeam?.name || '');
            const homeScore = m.score?.fullTime?.home ?? null;
            const awayScore = m.score?.fullTime?.away ?? null;
            const matchday = m.matchday ?? 0;
            return [home, homeScore, awayScore, away, matchday];
          });

        // Knockout stage → map to our round keys
        const STAGE_TO_ROUND = {
          'LAST_32': 'R32', 'LAST_16': 'R16',
          'QUARTER_FINALS': 'QF', 'SEMI_FINALS': 'SF', 'FINAL': 'F',
        };
        const knockoutMatches = matches
          .filter(m => STAGE_TO_ROUND[m.stage])
          .map(m => ({
            round: STAGE_TO_ROUND[m.stage],
            home: normalizeName(m.homeTeam?.name || ''),
            away: normalizeName(m.awayTeam?.name || ''),
            homeScore: m.score?.fullTime?.home ?? null,
            awayScore: m.score?.fullTime?.away ?? null,
          }))
          .filter(m => m.home && m.away);

        if (mounted && (mapped.length > 0 || knockoutMatches.length > 0)) {
          if (mapped.length > 0) setGroupResults(mapped);
          setLastUpdated(new Date().toISOString());
          setApiError(false);
          setApiErrorMsg(null);

          setRawBracket(prev => {
            const b = JSON.parse(JSON.stringify(prev));

            // Helper: apply scores and winner to a slot
            function applyScores(slot, home, away, homeScore, awayScore) {
              if (slot.home === home) {
                slot.homeScore = homeScore;
                slot.awayScore = awayScore;
              } else {
                slot.homeScore = awayScore;
                slot.awayScore = homeScore;
              }
              if (slot.homeScore != null && slot.awayScore != null) {
                if (slot.homeScore > slot.awayScore) slot.winner = slot.home;
                else if (slot.awayScore > slot.homeScore) slot.winner = slot.away;
                else slot.winner = null;
              }
            }

            // 1. Update bracket from knockout API matches
            knockoutMatches.forEach(({ round, home, away, homeScore, awayScore }) => {
              const slots = b[round] || [];

              // a) Exact match — both teams already correct
              let slot = slots.find(s =>
                (s.home === home && s.away === away) ||
                (s.home === away && s.away === home)
              );

              // b) One team is "?" — fill it in
              if (!slot) {
                slot = slots.find(s =>
                  (s.home === home && s.away === '?') || (s.home === '?' && s.away === home) ||
                  (s.home === away && s.away === '?') || (s.home === '?' && s.away === away)
                );
                if (slot) {
                  if (slot.home === '?') slot.home = slot.away === home ? away : home;
                  else if (slot.away === '?') slot.away = slot.home === home ? away : home;
                }
              }

              // c) One team matches but the other was wrong (e.g. Australia replaced by real qualifier)
              if (!slot) {
                slot = slots.find(s => s.home === home || s.away === home || s.home === away || s.away === away);
                if (slot) {
                  // Rewrite the slot with real API teams, preserving home/away order
                  if (slot.home === home || slot.home === away) {
                    slot.home = (slot.home === home) ? home : away;
                    slot.away = (slot.home === home) ? away : home;
                  } else {
                    slot.away = (slot.away === home) ? home : away;
                    slot.home = (slot.away === home) ? away : home;
                  }
                }
              }

              if (slot) applyScores(slot, home, away, homeScore, awayScore);
            });

            // Group stage results never update the knockout bracket —
            // the same two teams can meet in both phases (e.g. same group) and
            // applying a group result to a bracket slot causes false eliminations.

            return b;
          });
        }
      } catch (err) {
        console.warn('Football API error', err);
        if (mounted) {
          setApiError(true);
          setApiErrorMsg(err.message);
        }
      }
    }

    // Initial fetch
    fetchMatches();
    // Refresh every 5 minutes
    const id = setInterval(fetchMatches, 5 * 60 * 1000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  // Fetch teams list from API to populate `allTeams` and ensure flags exist
  useEffect(() => {
    let mounted = true;
    async function fetchTeams() {
      try {
        const res = await fetch('/api/football/v4/competitions/WC/teams');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const teams = data.teams || [];
        const mapped = teams.map(t => TEAM_NAME_MAP[t.name] || t.name);
        // mutate FLAGS for missing teams to a neutral flag so UI shows something
        teams.forEach((t, i) => {
          const localName = TEAM_NAME_MAP[t.name] || t.name;
          if (!FLAGS[localName]) {
            // fallback to white flag; later we could map from country codes
            FLAGS[localName] = '🏳️';
          }
        });
        if (mounted) setTeamsFromApi([...new Set(mapped)]);
      } catch (err) {
        console.warn('Football teams API error', err);
      }
    }
    fetchTeams();
  }, []);

  // Fetch standings (group tables) from API
  useEffect(() => {
    let mounted = true;
    async function fetchStandings() {
      try {
        const res = await fetch('/api/football/v4/competitions/WC/standings');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const table = data.standings || [];
        // Normalize team names in table
        const normalized = table.map(group => ({
          ...group,
          table: group.table.map(row => ({
            ...row,
            team: { ...row.team, name: TEAM_NAME_MAP[row.team.name] || row.team.name }
          }))
        }));
        if (mounted) setStandings(normalized);
      } catch (err) {
        console.warn('Football standings API error', err);
      }
    }
    fetchStandings();
  }, []);

  const allTeams = teamsFromApi.length ? teamsFromApi : PARTICIPANTS.flatMap(p => p.teams);
  const tabs = [
    { id:"ranking",       label:"🏆 Ranking" },
    { id:"bracket",       label:"🗓️ Bracket" },
    { id:"grupos",        label:"🌍 Grupos" },
    { id:"equipos",       label:"🔍 Equipos" },
    { id:"predicciones",  label:"✏️ Predicciones" },
  ];

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',sans-serif", background:"#f8fafc", minHeight:"100vh" }}>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#064e3b 0%,#065f46 50%,#047857 100%)", padding:"20px 20px 0", textAlign:"center" }}>
        <div style={{ fontSize:10, letterSpacing:3, color:"#6ee7b7", textTransform:"uppercase", marginBottom:4 }}>
          FIFA World Cup 2026™
        </div>
        <h1 style={{ margin:"0 0 4px", fontSize:24, fontWeight:700, color:"#fff" }}>⚽ Quiniela del Mundial</h1>
        <p style={{ margin:"0 0 16px", color:"#a7f3d0", fontSize:13 }}>
          10 participantes · hover en ❓ para ver posibles rivales
          {lastUpdated && (
            <span style={{ marginLeft:10, fontSize:12, color:"#bbf7d0" }}>
              Última actualización: {new Date(lastUpdated).toLocaleString()}
            </span>
          )}
          {apiError && (
            <span style={{ marginLeft:8, fontSize:12, color:"#fca5a5" }}>
              ⚠️ Error API: {apiErrorMsg || "error desconocido"}
            </span>
          )}
        </p>
        <div style={{ display:"flex", gap:4, justifyContent:"center", overflowX:"auto" }}>
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

        {/* ── RANKING ── */}
        {tab === "ranking" && (
          <div>
            <h2 style={{ fontSize:17, fontWeight:600, color:"#111", margin:"0 0 16px" }}>Tabla de posiciones</h2>
            {ranking.map((p, i) => (
              <div key={p.name} style={{
                background:"#fff", border:"1px solid #e5e7eb", borderRadius:12,
                padding:"12px 16px", marginBottom:10, display:"flex", alignItems:"center", gap:12,
                borderLeft:`4px solid ${p.color}`,
                boxShadow: i===0 ? "0 2px 12px rgba(0,0,0,0.07)" : "none",
              }}>
                <span style={{ fontWeight:700, fontSize: i<3?20:16, minWidth:28, textAlign:"center",
                  color: i===0?"#d97706": i===1?"#9ca3af": i===2?"#b45309":"#d1d5db" }}>
                  {i===0?"🥇": i===1?"🥈": i===2?"🥉": `${i+1}`}
                </span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:15, color:"#111" }}>{p.name}</div>
                  <div style={{ display:"flex", gap:6, marginTop:4, flexWrap:"wrap" }}>
                    {p.teams.map(t => {
                      const flag = FLAGS[t]||"🏳️";
                      return (
                        <span key={t} style={{
                          display:"inline-flex", alignItems:"center", gap:4,
                          background:p.light, color:p.color,
                          border:`1px solid ${p.color}44`, borderRadius:12,
                          padding:"2px 8px", fontSize:12, fontWeight:500,
                        }}><span>{flag}</span>{t}</span>
                      );
                    })}
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
                    <span style={{ fontWeight:700, color:"#065f46", marginLeft:6 }}>+{ROUND_POINTS[k]} pts{k==="R32" ? " (clasificar)" : k==="F" ? " + 32 (campeón)" : ""}</span>
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
            <p style={{ fontSize:13, color:"#6b7280", margin:"0 0 20px" }}>
              Pasa el cursor sobre ❓ para ver los posibles rivales. Ve a <strong>Predicciones</strong> para ingresar resultados.
            </p>
            {[
              { key:"R32", label:"16avos de final", cols:4 },
              { key:"R16", label:"Octavos de final", cols:4 },
              { key:"QF",  label:"Cuartos de final", cols:4 },
              { key:"SF",  label:"Semifinal",         cols:2 },
              { key:"F",   label:"⚽ Final",           cols:1 },
            ].map(({ key, label, cols }) => (
              <div key={key} style={{ marginBottom:28 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <span style={{ background:"#065f46", color:"#fff", fontSize:11, fontWeight:600, padding:"3px 12px", borderRadius:20 }}>{label}</span>
                  <div style={{ flex:1, height:1, background:"#e5e7eb" }}/>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:`repeat(${Math.min(cols, bracket[key].length)}, minmax(0,1fr))`, gap:10 }}>
                  {bracket[key].map((match, idx) => (
                    <MatchCard key={match.id} match={match} matchMap={matchMap} onSetWinner={null} />
                  ))}
                </div>
              </div>
            ))}
            {/* Legend */}
            <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:10 }}>Leyenda</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {PARTICIPANTS.map(p => (
                  <div key={p.name} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
                    <span style={{ width:9, height:9, borderRadius:"50%", background:p.color, display:"inline-block" }}/>
                    <span style={{ fontWeight:500 }}>{p.name}:</span>
                    <span style={{ color:"#6b7280" }}>{p.teams.join(", ")}</span>
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
            <p style={{ fontSize:13, color:"#6b7280", margin:"0 0 20px" }}>
              Resultados y tablas de todos los grupos del Mundial 2026.
            </p>

            {standings.length === 0 ? (
              <div style={{ textAlign:"center", padding:40, color:"#9ca3af", fontSize:14,
                background:"#fff", border:"1px dashed #d1d5db", borderRadius:12 }}>
                {apiError ? "⚠️ No se pudo cargar la información de grupos." : "Cargando grupos..."}
              </div>
            ) : standings.map(grp => {
              const groupLabel = grp.group || grp.stage || "Grupo";
              // Get all matches for this group (teams in the table)
              const groupTeamNames = grp.table.map(row => row.team.name);
              const grpMatches = groupResults.filter(r =>
                groupTeamNames.includes(r[0]) && groupTeamNames.includes(r[3])
              );

              return (
                <div key={groupLabel} style={{ marginBottom:28 }}>
                  {/* Group header */}
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <span style={{ background:"#065f46", color:"#fff", fontSize:11, fontWeight:600, padding:"3px 14px", borderRadius:20 }}>
                      {groupLabel}
                    </span>
                    <div style={{ flex:1, height:1, background:"#e5e7eb" }}/>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    {/* Standings table */}
                    <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, overflow:"hidden" }}>
                      <div style={{ display:"grid", gridTemplateColumns:"28px 1fr 32px 80px 32px", alignItems:"center",
                        padding:"7px 12px", background:"#f9fafb", fontSize:11, color:"#6b7280", fontWeight:700 }}>
                        <div style={{ textAlign:"center" }}>#</div>
                        <div>Equipo</div>
                        <div style={{ textAlign:"center" }}>PJ</div>
                        <div style={{ textAlign:"center" }}>G / E / P</div>
                        <div style={{ textAlign:"center" }}>Pts</div>
                      </div>
                      {grp.table.map((row, idx) => {
                        const teamName = row.team.name;
                        const participant = getParticipant(teamName);
                        const isTop2 = row.position <= 2;
                        return (
                          <div key={row.team.id} style={{
                            display:"grid", gridTemplateColumns:"28px 1fr 32px 80px 32px",
                            alignItems:"center", padding:"8px 12px",
                            borderBottom: idx < grp.table.length - 1 ? "1px solid #f3f4f6" : "none",
                            background: isTop2 ? "#f0fdf4" : "#fff",
                          }}>
                            <div style={{ textAlign:"center", fontWeight:700, fontSize:12,
                              color: isTop2 ? "#16a34a" : "#9ca3af" }}>{row.position}</div>
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                              <TeamFlag team={row.team} />
                              <span style={{ fontSize:12, fontWeight: participant ? 600 : 400 }}>{teamName}</span>
                              {participant && (
                                <span style={{ fontSize:10, background:participant.light, color:participant.color,
                                  padding:"1px 6px", borderRadius:8, fontWeight:600 }}>
                                  {participant.name}
                                </span>
                              )}
                            </div>
                            <div style={{ textAlign:"center", fontSize:12, color:"#6b7280" }}>{row.playedGames}</div>
                            <div style={{ textAlign:"center", fontSize:12, fontWeight:600 }}>
                              {row.won} / {row.draw} / {row.lost}
                            </div>
                            <div style={{ textAlign:"center", fontSize:13, fontWeight:700,
                              color: isTop2 ? "#065f46" : "#374151" }}>{row.points}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Match results */}
                    <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, overflow:"hidden" }}>
                      {grpMatches.length === 0 ? (
                        <div style={{ padding:16, fontSize:12, color:"#9ca3af", textAlign:"center" }}>
                          Sin partidos disponibles
                        </div>
                      ) : grpMatches.map((r, i) => {
                        const played = r[1] !== null && r[2] !== null;
                        const homeWin = played && r[1] > r[2];
                        const awayWin = played && r[2] > r[1];
                        return (
                          <div key={i} style={{
                            display:"grid", gridTemplateColumns:"1fr auto 1fr",
                            alignItems:"center", padding:"8px 12px", gap:8,
                            borderBottom: i < grpMatches.length - 1 ? "1px solid #f3f4f6" : "none",
                          }}>
                            <div style={{ display:"flex", alignItems:"center", gap:5, justifyContent:"flex-end" }}>
                              <span style={{ fontSize:12, fontWeight: homeWin ? 700 : 400, color: homeWin?"#111":"#6b7280" }}>
                                {r[0]}
                              </span>
                              <TeamFlag team={{ name: r[0] }} />
                            </div>
                            <div style={{ textAlign:"center", fontSize:13, fontWeight:700,
                              color:"#374151", minWidth:40 }}>
                              {played ? `${r[1]} - ${r[2]}` : <span style={{ color:"#d1d5db" }}>vs</span>}
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                              <TeamFlag team={{ name: r[3] }} />
                              <span style={{ fontSize:12, fontWeight: awayWin ? 700 : 400, color: awayWin?"#111":"#6b7280" }}>
                                {r[3]}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── EQUIPOS ── */}
        {tab === "equipos" && (
          <div>
            <h2 style={{ fontSize:17, fontWeight:600, color:"#111", margin:"0 0 16px" }}>Seguimiento por equipo</h2>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:20 }}>
              {PARTICIPANTS.flatMap(p => p.teams).map(team => {
                const p = getParticipant(team);
                return (
                  <button key={team} onClick={() => setSelectedTeam(selectedTeam===team?null:team)} style={{
                    display:"flex", alignItems:"center", gap:6, padding:"7px 13px",
                    border:`2px solid ${selectedTeam===team ? p.color : p.color+"44"}`,
                    borderRadius:20, cursor:"pointer", fontSize:13, fontWeight:500,
                    background: selectedTeam===team ? p.light : "#fff",
                    color: p.color,
                  }}>
                    <span style={{ fontSize:18 }}>{FLAGS[team]||"🏳️"}</span>{team}
                  </button>
                );
              })}
            </div>

            {selectedTeam ? (() => {
              const p = getParticipant(selectedTeam);
              const teamMatches = getTeamMatches(selectedTeam, bracket);
              const inR32 = (bracket.R32||[]).some(m => m.home===selectedTeam || m.away===selectedTeam);
              let totalPts = inR32 ? ROUND_POINTS.R32 : 0;
              let eliminated = null;
              for (const m of teamMatches) {
                if (m.round === "R32") {
                  if (m.winner && m.winner !== selectedTeam) {
                    eliminated = { round:m.round, against:m.winner };
                    break;
                  }
                } else {
                  if (m.winner === selectedTeam) {
                    totalPts += ROUND_POINTS[m.round];
                    if (m.round==="F") totalPts += ROUND_POINTS.Champion;
                  } else if (m.winner && m.winner !== selectedTeam) {
                    eliminated = { round:m.round, against:m.winner };
                    break;
                  }
                }
              }
              const groupGames = groupResults.filter(r => r[0]===selectedTeam || r[3]===selectedTeam);

              return (
                <div style={{ background:"#fff", border:`2px solid ${p.color}`, borderRadius:14, padding:20 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16, flexWrap:"wrap" }}>
                    <span style={{ fontSize:48 }}>{FLAGS[selectedTeam]}</span>
                    <div style={{ flex:1 }}>
                      <h3 style={{ margin:0, fontSize:20, fontWeight:700, color:"#111" }}>{selectedTeam}</h3>
                      <div style={{ display:"flex", gap:8, marginTop:6, flexWrap:"wrap" }}>
                        <span style={{ background:p.light, color:p.color, padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600 }}>
                          Equipo de {p.name}
                        </span>
                        {eliminated ? (
                          <span style={{ background:"#fee2e2", color:"#dc2626", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600 }}>
                            ❌ Eliminado en {ROUND_LABELS[eliminated.round]} vs {eliminated.against}
                          </span>
                        ) : (
                          <span style={{ background:"#dcfce7", color:"#16a34a", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600 }}>
                            ✅ En competencia
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:30, fontWeight:700, color:p.color }}>{totalPts}</div>
                      <div style={{ fontSize:11, color:"#9ca3af" }}>puntos aportados</div>
                    </div>
                  </div>

                  <div style={{ borderTop:"1px solid #f3f4f6", paddingTop:14 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:10 }}>Fase eliminatoria</div>
                    {teamMatches.length === 0 ? (
                      <p style={{ fontSize:13, color:"#9ca3af" }}>Aún no hay partidos eliminatorios registrados.</p>
                    ) : teamMatches.map((m, i) => {
                      const won = m.winner === selectedTeam;
                      const lost = m.winner && !won;
                      return (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0",
                          borderBottom: i<teamMatches.length-1 ? "1px solid #f3f4f6":"none" }}>
                          <span style={{
                            background: lost?"#fee2e2": won?"#dcfce7":"#f3f4f6",
                            color: lost?"#dc2626": won?"#16a34a":"#9ca3af",
                            fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:12, minWidth:80, textAlign:"center",
                          }}>{ROUND_LABELS[m.round]}</span>
                          <span style={{ fontSize:13, flex:1 }}>
                            <span style={{ fontWeight: m.home===selectedTeam?700:400 }}>{FLAGS[m.home]||"🏳️"} {m.home}</span>
                            {" "}<span style={{ fontWeight:700, color:"#374151" }}>{m.homeScore??"-"} : {m.awayScore??"-"}</span>{" "}
                            <span style={{ fontWeight: m.away===selectedTeam?700:400 }}>{m.away} {FLAGS[m.away]||"🏳️"}</span>
                          </span>
                          {won && <span style={{ fontSize:12, color:"#16a34a", fontWeight:600 }}>+{ROUND_POINTS[m.round]} pts</span>}
                          {lost && <span style={{ fontSize:12, color:"#dc2626", fontWeight:600 }}>❌ Eliminado</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ borderTop:"1px solid #f3f4f6", paddingTop:14, marginTop:4 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:10 }}>Fase de grupos</div>
                    {groupGames.length === 0 ? (
                      <p style={{ fontSize:13, color:"#9ca3af" }}>
                        {apiError
                          ? "⚠️ No se pudo cargar los partidos de grupos."
                          : "Sin partidos de grupos disponibles."}
                      </p>
                    ) : groupGames.map((r, i) => {
                      const isHome = r[0] === selectedTeam;
                      // r format: [team1, score1, score2, team2, matchday]
                      const myScore = isHome ? r[1] : r[2];
                      const oppScore = isHome ? r[2] : r[1];
                      const opp = isHome ? r[3] : r[0];
                      const played = myScore !== null && oppScore !== null;
                      const res = !played ? null : myScore > oppScore ? "V" : myScore < oppScore ? "D" : "E";
                      const resLabel = res === "V" ? "Victoria" : res === "D" ? "Derrota" : res === "E" ? "Empate" : "Pendiente";
                      return (
                        <div key={i} style={{
                          display:"grid", gridTemplateColumns:"auto 1fr auto",
                          alignItems:"center", gap:10, padding:"10px 0",
                          borderBottom: i < groupGames.length - 1 ? "1px solid #f3f4f6" : "none",
                        }}>
                          <span style={{
                            background: res === "V" ? "#dcfce7" : res === "D" ? "#fee2e2" : res === "E" ? "#fef9c3" : "#f3f4f6",
                            color: res === "V" ? "#16a34a" : res === "D" ? "#dc2626" : res === "E" ? "#ca8a04" : "#9ca3af",
                            fontWeight:700, fontSize:11, padding:"4px 8px", borderRadius:999,
                            textAlign:"center", minWidth:32,
                          }}>{res ?? "–"}</span>
                          <div style={{ minWidth:0 }}>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center", fontSize:13, color:"#111" }}>
                              <span style={{ fontWeight:700 }}>{FLAGS[selectedTeam]||"🏳️"} {selectedTeam}</span>
                              <span style={{ fontSize:12, color:"#6b7280" }}>{resLabel}</span>
                            </div>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:4, color:"#374151", fontSize:13 }}>
                              {played
                                ? <span style={{ fontWeight:700 }}>{myScore} - {oppScore}</span>
                                : <span style={{ color:"#9ca3af" }}>Por jugarse</span>}
                              <span>vs {FLAGS[opp]||"🏳️"} {opp}</span>
                            </div>
                          </div>
                          <span style={{ fontSize:11, color:"#9ca3af", whiteSpace:"nowrap" }}>J{r[4]}</span>
                        </div>
                      );
                    })}
                    {/* Standings for the selected team's group */}
                    {standings.length > 0 && (() => {
                      // find the group that contains the selectedTeam
                      const grp = standings.find(g => g.table.some(row => (TEAM_NAME_MAP[row.team.name] || row.team.name) === selectedTeam));
                      if (!grp) return null;
                      return (
                        <div style={{ marginTop:12, borderTop:"1px solid #f3f4f6", paddingTop:12 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:8 }}>Tabla - {grp.group || grp.stage}</div>
                            <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, overflow:"hidden" }}>
                            <div style={{ display:"grid", gridTemplateColumns:"36px 1fr 60px 80px 60px", gap:0, alignItems:"center", padding:"8px 12px", background:"#f9fafb", fontSize:12, color:"#6b7280", fontWeight:700 }}>
                              <div style={{ textAlign:"center" }}>Pos</div>
                              <div>Equipo</div>
                              <div style={{ textAlign:"right" }}>PJ</div>
                              <div style={{ textAlign:"right" }}>W / D / L</div>
                              <div style={{ textAlign:"right" }}>Pts</div>
                            </div>
                            {grp.table.map((row, idx) => (
                              <div key={row.team.id} style={{ display:"grid", gridTemplateColumns:"36px 1fr 60px 80px 60px", gap:0, alignItems:"center", padding:"8px 12px", borderBottom: idx<grp.table.length-1?"1px solid #f3f4f6":"none" }}>
                                <div style={{ textAlign:"center", fontWeight:700 }}>{row.position}</div>
                                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                  <div style={{ width:22, height:16 }}>{/* flag */}<TeamFlag team={row.team} /></div>
                                  <div style={{ fontWeight: row.team.name===selectedTeam?700:500 }}>{row.team.name}</div>
                                </div>
                                <div style={{ textAlign:"right", color:"#6b7280" }}>{row.playedGames}</div>
                                <div style={{ textAlign:"right", fontWeight:700 }}>{row.won} / {row.draw} / {row.lost} <span style={{ marginLeft:8, color:"#6b7280" }}>({row.goalsFor}-{row.goalsAgainst} GD:{row.goalDifference})</span></div>
                                <div style={{ textAlign:"right", fontWeight:700 }}>{row.points}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })() : (
              <div style={{ textAlign:"center", padding:40, color:"#9ca3af", fontSize:14,
                background:"#fff", border:"1px dashed #d1d5db", borderRadius:12 }}>
                👆 Selecciona un equipo para ver su seguimiento
              </div>
            )}
          </div>
        )}

        {/* ── PREDICCIONES ── */}
        {tab === "predicciones" && (
          <div>
            <h2 style={{ fontSize:17, fontWeight:600, color:"#111", margin:"0 0 4px" }}>Actualizar resultados</h2>
            <p style={{ fontSize:13, color:"#6b7280", margin:"0 0 20px" }}>
              Ingresa marcadores y haz clic en el ganador. El bracket se propaga automáticamente y los puntos se recalculan en tiempo real.
            </p>

            {[
              { key:"R32", label:"16avos de final" },
              { key:"R16", label:"Octavos de final" },
              { key:"QF",  label:"Cuartos de final" },
              { key:"SF",  label:"Semifinal" },
              { key:"F",   label:"⚽ Final" },
            ].map(({ key, label }) => {
              const matches = bracket[key].filter(m => m.home!=="?" || m.away!=="?");
              if (matches.length === 0) return null;
              return (
                <div key={key} style={{ marginBottom:28 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <span style={{ background:"#064e3b", color:"#fff", fontSize:11, fontWeight:600, padding:"3px 12px", borderRadius:20 }}>{label}</span>
                    <div style={{ flex:1, height:1, background:"#e5e7eb" }}/>
                  </div>
                  {bracket[key].map((match, idx) => {
                    if (match.home==="?" && match.away==="?") return null;
                    const hp = getParticipant(match.home);
                    const ap = getParticipant(match.away);
                    return (
                      <div key={match.id} style={{
                        background:"#fff", border:`1px solid ${match.winner?"#d1fae5":"#e5e7eb"}`,
                        borderRadius:12, padding:"14px 16px", marginBottom:10,
                      }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                          {/* Home team */}
                          <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:130 }}>
                            <span style={{ fontSize:22 }}>{FLAGS[match.home]||"❓"}</span>
                            <div>
                              <div style={{ fontWeight:600, fontSize:14, color: match.home==="?"?"#9ca3af":"#111" }}>
                                {match.home==="?" ? "Por definirse" : match.home}
                              </div>
                            </div>
                          </div>
                          {/* Scores */}
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <input type="number" min="0" max="20"
                              value={rawBracket[key][idx].homeScore ?? ""}
                              disabled={match.home==="?"}
                              onChange={e => setScore(key, idx, "homeScore", e.target.value)}
                              style={{ width:48, textAlign:"center", padding:"6px", fontSize:16, fontWeight:700,
                                borderRadius:8, border:"1.5px solid #d1d5db", background: match.home==="?"?"#f9fafb":"#fff" }}
                            />
                            <span style={{ fontWeight:700, color:"#9ca3af", fontSize:16 }}>:</span>
                            <input type="number" min="0" max="20"
                              value={rawBracket[key][idx].awayScore ?? ""}
                              disabled={match.away==="?"}
                              onChange={e => setScore(key, idx, "awayScore", e.target.value)}
                              style={{ width:48, textAlign:"center", padding:"6px", fontSize:16, fontWeight:700,
                                borderRadius:8, border:"1.5px solid #d1d5db", background: match.away==="?"?"#f9fafb":"#fff" }}
                            />
                          </div>
                          {/* Away team */}
                          <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:130, justifyContent:"flex-end" }}>
                            <div style={{ textAlign:"right" }}>
                              <div style={{ fontWeight:600, fontSize:14, color: match.away==="?"?"#9ca3af":"#111" }}>
                                {match.away==="?" ? "Por definirse" : match.away}
                              </div>
                            </div>
                            <span style={{ fontSize:22 }}>{FLAGS[match.away]||"❓"}</span>
                          </div>
                        </div>
                        {/* Winner buttons */}
                        <div style={{ display:"flex", gap:8, alignItems:"center", marginTop:12, flexWrap:"wrap" }}>
                          <span style={{ fontSize:12, color:"#6b7280" }}>Ganador:</span>
                          {[{ team:match.home, p:hp }, { team:match.away, p:ap }]
                            .filter(x => x.team !== "?")
                            .map(({ team, p:tp }) => (
                            <button key={team} onClick={() => setWinner(key, idx, team)} style={{
                              display:"flex", alignItems:"center", gap:5,
                              padding:"5px 14px", borderRadius:20, cursor:"pointer", fontSize:13, fontWeight:500,
                              border:`1.5px solid ${rawBracket[key][idx].winner===team ? (tp?.color||"#065f46") : "#d1d5db"}`,
                              background: rawBracket[key][idx].winner===team ? (tp?.light||"#dcfce7") : "#fff",
                              color: rawBracket[key][idx].winner===team ? (tp?.color||"#065f46") : "#374151",
                            }}>
                              <span>{FLAGS[team]||"🏳️"}</span> {team}
                            </button>
                          ))}
                          {match.winner && (
                            <span style={{ fontSize:12, color:"#16a34a", fontWeight:600, marginLeft:4 }}>
                              ✅ +{ROUND_POINTS[key]} pts{key==="F"?` + ${ROUND_POINTS.Champion} (campeón)`:""} para {getParticipant(match.winner)?.name||"—"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Live ranking */}
            <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:12, padding:16 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#065f46", marginBottom:12 }}>📊 Ranking en vivo</div>
              {ranking.map((p, i) => (
                <div key={p.name} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:13, color:"#9ca3af", minWidth:20 }}>{i+1}.</span>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:p.color }}/>
                  <span style={{ fontWeight:600, fontSize:13, flex:1 }}>{p.name}</span>
                  <div style={{ display:"flex", gap:4 }}>
                    {p.teams.map(t => (
                      <span key={t} style={{
                        fontSize:11, background:p.light, color:p.color,
                        border:`1px solid ${p.color}33`, borderRadius:10, padding:"1px 7px",
                      }}>{FLAGS[t]} {t}</span>
                    ))}
                  </div>
                  <span style={{ fontWeight:700, fontSize:16, color:p.color, minWidth:30, textAlign:"right" }}>{p.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <div style={{ textAlign:"center", padding:"20px 16px 32px", color:"#9ca3af", fontSize:12 }}>
        FIFA World Cup 2026™ · México, USA, Canadá · Datos al 23 jun 2026
      </div>
    </div>
  );
}
