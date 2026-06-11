/**
 * api.js — v18  (worldcup26.ir como fuente principal — GRATIS, sin key)
 *
 * ESTRATEGIA v18:
 *   1. getLiveMatches()      → worldcup26.ir /get/games?status=live
 *   2. getUpcomingMatches()  → worldcup26.ir /get/games (todos los partidos)
 *   3. getFinishedMatches()  → worldcup26.ir /get/games?status=finished
 *   4. getStandings()        → worldcup26.ir /get/groups
 *   5. getTeams()            → worldcup26.ir /get/teams
 *   6. Fotos                 → TheSportsDB (sin cambios)
 *   7. MOCK                  → fallback si worldcup26.ir falla
 *
 * worldcup26.ir: API gratuita, sin key, sin límite de requests,
 * datos en tiempo real del Mundial 2026 (48 equipos, 104 partidos).
 * Documentación: https://worldcup26.ir/api-docs
 */

/* ── URL base de worldcup26.ir ── */
const WC26_BASE = 'https://winter-thunder-a7a0.cq22003.workers.dev';

/* Estado global de la API */
const API_STATUS = {
  usingMock:   false,
  lastError:   null,
  lastSuccess: null,
};

const API_CONFIG = {
  sportsDB: {
    base:    'https://www.thesportsdb.com/api/v1/json/3',
    enabled: true
  }
};

/* ── Banderas por país ── */
const TEAM_FLAGS = {
  'México':'🇲🇽','Mexico':'🇲🇽','Brasil':'🇧🇷','Brazil':'🇧🇷',
  'Argentina':'🇦🇷','Francia':'🇫🇷','France':'🇫🇷','España':'🇪🇸','Spain':'🇪🇸',
  'Alemania':'🇩🇪','Germany':'🇩🇪','Portugal':'🇵🇹','Marruecos':'🇲🇦','Morocco':'🇲🇦',
  'Japón':'🇯🇵','Japan':'🇯🇵','Canadá':'🇨🇦','Canada':'🇨🇦','Inglaterra':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Países Bajos':'🇳🇱','Netherlands':'🇳🇱','Holanda':'🇳🇱','Uruguay':'🇺🇾',
  'Ecuador':'🇪🇨','Senegal':'🇸🇳','Bélgica':'🇧🇪','Belgium':'🇧🇪',
  'Noruega':'🇳🇴','Norway':'🇳🇴','Colombia':'🇨🇴','Chile':'🇨🇱','Perú':'🇵🇪','Peru':'🇵🇪',
  'Croacia':'🇭🇷','Croatia':'🇭🇷','Dinamarca':'🇩🇰','Denmark':'🇩🇰','Suiza':'🇨🇭','Switzerland':'🇨🇭',
  'Nigeria':'🇳🇬','Ghana':'🇬🇭','Egipto':'🇪🇬','Egypt':'🇪🇬',
  'Arabia Saudí':'🇸🇦','Saudi Arabia':'🇸🇦','Irán':'🇮🇷','Iran':'🇮🇷','Qatar':'🇶🇦',
  'Corea del Sur':'🇰🇷','South Korea':'🇰🇷','Australia':'🇦🇺','Irak':'🇮🇶','Iraq':'🇮🇶',
  'Estados Unidos':'🇺🇸','EEUU':'🇺🇸','USA':'🇺🇸','United States':'🇺🇸','Costa Rica':'🇨🇷',
  'Honduras':'🇭🇳','Panamá':'🇵🇦','Panama':'🇵🇦','Jamaica':'🇯🇲','Haití':'🇭🇹','Haiti':'🇭🇹',
  'Paraguay':'🇵🇾','Venezuela':'🇻🇪','Bolivia':'🇧🇴','Sudáfrica':'🇿🇦','South Africa':'🇿🇦',
  'Argelia':'🇩🇿','Algeria':'🇩🇿','Camerún':'🇨🇲','Cameroon':'🇨🇲','Mali':'🇲🇱',
  'Chequia':'🇨🇿','Czechia':'🇨🇿','Czech Republic':'🇨🇿','Rep. Checa':'🇨🇿',
  'Escocia':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','Austria':'🇦🇹',
  'Bosnia-Herzegovina':'🇧🇦','Bosnia & Herzegovina':'🇧🇦','Bosnia y Herz.':'🇧🇦',
  'Ucrania':'🇺🇦','Ukraine':'🇺🇦','Uzbekistán':'🇺🇿','Uzbekistan':'🇺🇿',
  'Islandia':'🇮🇸','Iceland':'🇮🇸','Nueva Zelanda':'🇳🇿','New Zealand':'🇳🇿',
  'Curazao':'🇨🇼','Curacao':'🇨🇼','Cabo Verde':'🇨🇻','Cape Verde':'🇨🇻',
  'Jordania':'🇯🇴','Jordan':'🇯🇴','Túnez':'🇹🇳','Tunisia':'🇹🇳',
  'Suecia':'🇸🇪','Sweden':'🇸🇪','Turquía':'🇹🇷','Turkey':'🇹🇷',
  'Costa de Marfil':'🇨🇮','Ivory Coast':'🇨🇮',"Côte d'Ivoire":'🇨🇮',
  'RD Congo':'🇨🇩','DR Congo':'🇨🇩','Congo DR':'🇨🇩',
};

function getFlag(name) { return TEAM_FLAGS[name] || '🏳️'; }

function localDateStr(d) {
  const dt = d || new Date();
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
}

function yesterdayStr() {
  const d = new Date(); d.setDate(d.getDate()-1); return localDateStr(d);
}

/* ══════════════════════════════════════════════
   MOCK DATA — fallback de emergencia
══════════════════════════════════════════════ */
const MOCK = {
  standings: [
    { pos:1, team:'Brasil',     flag:'🇧🇷', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, team:'Argentina',  flag:'🇦🇷', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, team:'Francia',    flag:'🇫🇷', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, team:'España',     flag:'🇪🇸', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:5, team:'Alemania',   flag:'🇩🇪', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:6, team:'Portugal',   flag:'🇵🇹', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  ],
  teams: [
    { id:'t01', name:'México',     flag:'🇲🇽', group:'A', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t09', name:'Brasil',     flag:'🇧🇷', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t37', name:'Argentina',  flag:'🇦🇷', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t33', name:'Francia',    flag:'🇫🇷', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t29', name:'España',     flag:'🇪🇸', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t41', name:'Portugal',   flag:'🇵🇹', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  ],
  upcomingMatches: [
    { id:'wc001', home:'México', away:'Sudáfrica', homeFlag:'🇲🇽', awayFlag:'🇿🇦', date:'2026-06-11', time:'14:00', competition:'Grupo A — J1', type:'worldcup', venue:'Estadio Azteca, CDMX', status:'finished', scoreHome:2, scoreAway:0 },
    { id:'wc002', home:'Canadá',    away:'Bosnia y Herz.', homeFlag:'🇨🇦', awayFlag:'🇧🇦', date:'2026-06-12', time:'21:00', competition:'Grupo B — J1', type:'worldcup', venue:'Toronto', status:'scheduled' },
    { id:'wc003', home:'Brasil',    away:'Marruecos',  homeFlag:'🇧🇷', awayFlag:'🇲🇦', date:'2026-06-13', time:'22:00', competition:'Grupo C — J1', type:'worldcup', venue:'MetLife Stadium', status:'scheduled' },
  ],
  finishedMatches: [],
  liveMatches: [],
  predictableMatches: [],
};

/* ══════════════════════════════════════════════
   HELPERS — mapear respuesta de worldcup26.ir
══════════════════════════════════════════════ */

/**
 * Mapea un partido de worldcup26.ir al formato interno de la app.
 * Estructura de worldcup26.ir:
 * {
 *   id, match_number, round, group_name,
 *   home_team, away_team, home_score, away_score,
 *   stadium, kickoff_utc, status,
 *   home_team_id, away_team_id
 * }
 */
function _mapWC26Match(m) {
  const kickoff   = m.kickoff_utc ? new Date(m.kickoff_utc) : null;
  const localDate = kickoff ? localDateStr(kickoff) : '';

  // Hora local El Salvador (UTC-6)
  let localTime = '';
  if (kickoff) {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/El_Salvador',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
    localTime = fmt.format(kickoff);
  }

  const statusRaw = (m.status || '').toLowerCase();
  let status = 'scheduled';
  if (statusRaw === 'live' || statusRaw === 'in_progress' || statusRaw === 'inprogress') status = 'live';
  else if (statusRaw === 'finished' || statusRaw === 'ft' || statusRaw === 'completed') status = 'finished';

  const isLive     = status === 'live';
  const isFinished = status === 'finished';

  // Determinar competition desde round/group
  let competition = 'Mundial 2026';
  if (m.group_name) competition = `Grupo ${m.group_name}`;
  else if (m.round) competition = m.round;

  return {
    id:          `wc26_${m.id || m.match_number}`,
    home:        m.home_team || '',
    away:        m.away_team || '',
    homeFlag:    getFlag(m.home_team || ''),
    awayFlag:    getFlag(m.away_team || ''),
    date:        localDate,
    time:        localTime,
    competition,
    venue:       m.stadium || '',
    type:        'worldcup',
    status,
    scoreHome:   (isLive || isFinished) ? (m.home_score ?? null) : null,
    scoreAway:   (isLive || isFinished) ? (m.away_score ?? null) : null,
    minute:      isLive ? (m.minute || null) : null,
  };
}

function _mapWC26Standing(t) {
  return {
    pos:   t.position || 0,
    team:  t.team || t.team_name || '',
    flag:  getFlag(t.team || t.team_name || ''),
    group: t.group || t.group_name || '',
    pj:    t.played || t.mp || 0,
    w:     t.won    || t.w  || 0,
    d:     t.drawn  || t.d  || 0,
    l:     t.lost   || t.l  || 0,
    gf:    t.goals_for     || t.gf || 0,
    gc:    t.goals_against || t.gc || 0,
    pts:   t.points || t.pts || 0,
  };
}

function _mapWC26Team(t) {
  return {
    id:    `wc26_${t.id || t.team_id || t.name}`,
    name:  t.name || t.name_en || '',
    flag:  getFlag(t.name || t.name_en || ''),
    group: t.groups || t.group || '',
    pj:0, w:0, d:0, l:0, gf:0, gc:0, pts:0,
  };
}

/* ══════════════════════════════════════════════
   API MODULE
══════════════════════════════════════════════ */
const API = {

  _memCache: {},
  _teamsCache: null,
  _photoMemCache: {},
  _LS_PHOTO_KEY: 'wcc_photos_v3',
  _PHOTO_MAP: {},

  _TTL: {
    live:      2  * 60 * 1000,
    upcoming:  5  * 60 * 1000,   // 5 min — datos del Mundial cambian frecuente
    standings: 5  * 60 * 1000,
    finished:  10 * 60 * 1000,
    default:   5  * 60 * 1000,
  },

  _ttlFor(key) {
    if (key.startsWith('live'))      return this._TTL.live;
    if (key.startsWith('upcoming'))  return this._TTL.upcoming;
    if (key.startsWith('standings')) return this._TTL.standings;
    if (key.startsWith('finished'))  return this._TTL.finished;
    return this._TTL.default;
  },

  _memGet(key) {
    const e = this._memCache[key];
    if (!e) return null;
    if (Date.now() - e.ts > this._ttlFor(key)) { delete this._memCache[key]; return null; }
    return e.data;
  },
  _memSet(key, data) { this._memCache[key] = { data, ts: Date.now() }; return data; },

  _lsGet(key) {
    try {
      const raw = localStorage.getItem(`wcc_cache_${key}`);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts > this._ttlFor(key)) { localStorage.removeItem(`wcc_cache_${key}`); return null; }
      return data;
    } catch(_) { return null; }
  },
  _lsSet(key, data) {
    try { localStorage.setItem(`wcc_cache_${key}`, JSON.stringify({ data, ts: Date.now() })); } catch(_) {}
    return data;
  },

  /* ── fetch genérico con timeout ── */
  async _fetch(url, headers = {}) {
    try {
      const ctrl  = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res   = await fetch(url, { headers, signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      API_STATUS.lastError   = null;
      API_STATUS.lastSuccess = Date.now();
      return data;
    } catch(err) {
      if (!API_STATUS.lastError) API_STATUS.lastError = 'network';
      console.warn('[API]', url.split('?')[0], '-', err.message);
      return null;
    }
  },

  /* ── worldcup26.ir fetch ── */
  async _wc26(endpoint) {
    return await this._fetch(`${WC26_BASE}${endpoint}`);
  },

  /* ── TheSportsDB fetch ── */
  async _sdb(endpoint) {
    if (!API_CONFIG.sportsDB.enabled) return null;
    return await this._fetch(`${API_CONFIG.sportsDB.base}${endpoint}`);
  },

  /* ══════════════════════════════════════════
     PARTIDOS EN VIVO
  ══════════════════════════════════════════ */
  async getLiveMatches() {
    const mem = this._memGet('live');
    if (mem) return mem;

    const data = await this._wc26('/get/games');
    if (data) {
      const games = Array.isArray(data) ? data : (data.games || data.matches || data.data || []);
      const live  = games
        .filter(m => {
          const s = (m.status || '').toLowerCase();
          return s === 'live' || s === 'in_progress' || s === 'inprogress';
        })
        .map(_mapWC26Match);
      API_STATUS.usingMock = false;
      return this._memSet('live', live);
    }

    API_STATUS.usingMock = true;
    return this._memSet('live', MOCK.liveMatches);
  },

  /* ══════════════════════════════════════════
     PRÓXIMOS Y HOY
  ══════════════════════════════════════════ */
  async getUpcomingMatches() {
    const mem = this._memGet('upcoming');
    if (mem) return mem;
    const ls = this._lsGet('upcoming');
    if (ls) return this._memSet('upcoming', ls);

    const todayStr = localDateStr();
    const yestStr  = yesterdayStr();

    const data = await this._wc26('/get/games');
    if (data) {
      const games = Array.isArray(data) ? data : (data.games || data.matches || data.data || []);
      const mapped = games
        .map(_mapWC26Match)
        .filter(m => m.date >= yestStr)
        .sort((a, b) => {
          if (a.status === 'live' && b.status !== 'live') return -1;
          if (b.status === 'live' && a.status !== 'live') return  1;
          return ((a.date||'')+(a.time||'')) < ((b.date||'')+(b.time||'')) ? -1 : 1;
        });

      if (mapped.length > 0) {
        API_STATUS.usingMock = false;
        this._lsSet('upcoming', mapped);
        return this._memSet('upcoming', mapped);
      }
    }

    API_STATUS.usingMock = true;
    return this._memSet('upcoming', MOCK.upcomingMatches);
  },

  /* ══════════════════════════════════════════
     PARTIDOS TERMINADOS
  ══════════════════════════════════════════ */
  async getFinishedMatches() {
    const mem = this._memGet('finished');
    if (mem) return mem;

    const data = await this._wc26('/get/games');
    if (data) {
      const games = Array.isArray(data) ? data : (data.games || data.matches || data.data || []);
      const finished = games
        .filter(m => {
          const s = (m.status || '').toLowerCase();
          return s === 'finished' || s === 'ft' || s === 'completed';
        })
        .map(m => {
          const base = _mapWC26Match(m);
          const h = m.home_score ?? 0, a = m.away_score ?? 0;
          return {
            ...base,
            scoreHome:   h,
            scoreAway:   a,
            exactScore:  `${h}-${a}`,
            finalResult: h > a ? 'home' : a > h ? 'away' : 'draw',
          };
        })
        .sort((a, b) => (b.date||'') > (a.date||'') ? 1 : -1);

      if (finished.length > 0) {
        API_STATUS.usingMock = false;
        return this._memSet('finished', finished);
      }
    }

    API_STATUS.usingMock = true;
    return this._memSet('finished', MOCK.finishedMatches);
  },

  /* ══════════════════════════════════════════
     CLASIFICACIÓN / GRUPOS
  ══════════════════════════════════════════ */
  async getStandings() {
    const mem = this._memGet('standings');
    if (mem) return mem;
    const ls = this._lsGet('standings');
    if (ls) return this._memSet('standings', ls);

    const data = await this._wc26('/get/groups');
    if (data) {
      const groups = Array.isArray(data) ? data : (data.groups || data.data || []);
      const rows = [];
      for (const g of groups) {
        const groupName = g.group || g.group_name || g.name || '';
        const teams     = g.teams || g.standings || [];
        teams.forEach((t, i) => {
          rows.push({
            ..._mapWC26Standing(t),
            pos:   t.position || (i + 1),
            group: groupName,
          });
        });
      }
      if (rows.length > 0) {
        API_STATUS.usingMock = false;
        this._lsSet('standings', rows);
        return this._memSet('standings', rows);
      }
    }

    API_STATUS.usingMock = true;
    return this._memSet('standings', MOCK.standings);
  },

  /* ══════════════════════════════════════════
     EQUIPOS
  ══════════════════════════════════════════ */
  async getTeams(query = '') {
    if (!this._teamsCache) {
      const ls = this._lsGet('teams');
      if (ls) {
        this._teamsCache = ls;
      } else {
        const data = await this._wc26('/get/teams');
        if (data) {
          const teams = Array.isArray(data) ? data : (data.teams || data.data || []);
          if (teams.length > 0) {
            this._teamsCache = teams.map(_mapWC26Team);
            this._lsSet('teams', this._teamsCache);
          }
        }
        if (!this._teamsCache) this._teamsCache = MOCK.teams;
      }
    }
    if (!query) return this._teamsCache;
    const q = query.toLowerCase();
    return this._teamsCache.filter(t => t.name.toLowerCase().includes(q));
  },

  /* ══════════════════════════════════════════
     PARTIDOS DE UN EQUIPO
  ══════════════════════════════════════════ */
  async getTeamMatches(teamName) {
    const cacheKey = `team_matches_${teamName}`;
    const mem = this._memGet(cacheKey);
    if (mem) return mem;

    const norm = s => (s||'').toLowerCase()
      .replace(/[áàä]/g,'a').replace(/[éèë]/g,'e').replace(/[íìï]/g,'i')
      .replace(/[óòö]/g,'o').replace(/[úùü]/g,'u').replace(/ñ/g,'n').trim();

    const tn = norm(teamName);

    const data = await this._wc26('/get/games');
    if (data) {
      const games  = Array.isArray(data) ? data : (data.games || data.matches || data.data || []);
      const mapped = games.map(_mapWC26Match);
      const played   = mapped.filter(m => m.status === 'finished' && (norm(m.home).includes(tn) || norm(m.away).includes(tn)));
      const upcoming = mapped.filter(m => m.status !== 'finished' && (norm(m.home).includes(tn) || norm(m.away).includes(tn)));
      const result = { played, upcoming };
      return this._memSet(cacheKey, result);
    }

    return this._memSet(cacheKey, { played: [], upcoming: [] });
  },

  /* ══════════════════════════════════════════
     JUGADORES (sin cambios — TheSportsDB)
  ══════════════════════════════════════════ */
  async getPlayers(query = '') {
    const data = MOCK.players || [];
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter(p =>
      (p.name||'').toLowerCase().includes(q) ||
      (p.team||'').toLowerCase().includes(q)
    );
  },

  async getTopScorers() {
    const players = await this.getPlayers('');
    return players.slice().sort((a,b) => (b.goals||0)-(a.goals||0));
  },

  /* ══════════════════════════════════════════
     ESTADO DEL PARTIDO
  ══════════════════════════════════════════ */
  getMatchState(m) {
    if (m.status === 'live')     return 'live';
    if (m.status === 'finished') return 'finished';
    if (!m.date || !m.time)      return 'upcoming';
    const matchTs = new Date(`${m.date}T${m.time}:00`).getTime();
    const diffMin = (Date.now() - matchTs) / 60000;
    if (diffMin > 115) return 'finished';
    if (diffMin > 0)   return 'live';
    if (diffMin > -60) return 'starting_soon';
    if (diffMin > -180) return 'closed';
    return 'upcoming';
  },

  getTimeUntilMatch(m) {
    if (!m.date || !m.time) return '';
    const diffMs = new Date(`${m.date}T${m.time}:00`).getTime() - Date.now();
    if (diffMs <= 0) return '';
    const h   = Math.floor(diffMs / 3600000);
    const min = Math.floor((diffMs % 3600000) / 60000);
    if (h >= 24) { const d = Math.floor(h/24); return `En ${d}d ${h%24}h`; }
    if (h > 0)   return `En ${h}h ${min}m`;
    return `En ${min}m`;
  },

  /* ══════════════════════════════════════════
     PARTIDOS PARA PREDICCIONES
  ══════════════════════════════════════════ */
  async getPredictableMatches() {
    const todayStr = localDateStr();
    const yestStr  = yesterdayStr();
    try {
      const all = await this.getUpcomingMatches();
      if (all?.length > 0) {
        return all
          .filter(m => (m.date||'') >= yestStr)
          .sort((a,b) => ((a.date||'')+(a.time||'')) < ((b.date||'')+(b.time||'')) ? -1 : 1);
      }
    } catch(_) {}
    return MOCK.predictableMatches;
  },

  /* ══════════════════════════════════════════
     FORCE REFRESH
  ══════════════════════════════════════════ */
  async forceRefresh() {
    this._memCache  = {};
    this._teamsCache = null;
    localStorage.removeItem('wcc_cache_upcoming');
    localStorage.removeItem('wcc_cache_standings');
    localStorage.removeItem('wcc_cache_teams');
    localStorage.removeItem('wcc_cache_finished');

    try {
      const [live, upcoming, standings, finished] = await Promise.all([
        this.getLiveMatches(),
        this.getUpcomingMatches(),
        this.getStandings(),
        this.getFinishedMatches(),
      ]);
      const apiConnected = (upcoming?.some?.(m => m.id?.startsWith?.('wc26_')));
      API_STATUS.usingMock = !apiConnected;
      return {
        live, upcoming, standings, finished,
        source: apiConnected ? 'worldcup26.ir' : 'mock'
      };
    } catch(err) {
      API_STATUS.lastError = 'network';
      API_STATUS.usingMock = true;
      return { live:[], upcoming:[], standings:[], finished:[], source:'network_error' };
    }
  },

  /* ══════════════════════════════════════════
     PAGE VISIBILITY (pausa timers ocultos)
  ══════════════════════════════════════════ */
  _pausedTimers: [],
  pauseWhenHidden() {
    if (this._visibilityBound) return;
    this._visibilityBound = true;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this._pausedTimers.forEach(t => { if (t.id) { clearInterval(t.id); t.id=null; } });
      } else {
        this._pausedTimers.forEach(t => { if (!t.id) { t.fn(); t.id=setInterval(t.fn,t.ms); } });
      }
    });
  },
  registerTimer(fn, ms) {
    const entry = { fn, ms, id: setInterval(fn, ms) };
    this._pausedTimers.push(entry);
    this.pauseWhenHidden();
    return entry;
  },

  /* ══════════════════════════════════════════
     FOTOS — TheSportsDB (sin cambios)
  ══════════════════════════════════════════ */
  _migrateLegacyPhotoCache() {
    try {
      if (localStorage.getItem('wcc_photos_v1')) localStorage.removeItem('wcc_photos_v1');
      if (localStorage.getItem('wcc_photos_v2')) localStorage.removeItem('wcc_photos_v2');
    } catch(_) {}
  },
  _photoStore() {
    try { const r=localStorage.getItem(this._LS_PHOTO_KEY); return r?JSON.parse(r):{}; } catch(_){return{};}
  },
  _photoSave(store) {
    try { localStorage.setItem(this._LS_PHOTO_KEY, JSON.stringify(store)); } catch(_) {}
  },
  async _idbGetPhoto(figId) {
    try { const r=await DB.get('photo_cache',figId); return r?.url??null; } catch(_){return null;}
  },
  async _idbSetPhoto(figId, url) {
    try { await DB.put('photo_cache',{id:figId,url,ts:Date.now()}); } catch(_){}
  },
  async getPhotoById(figId, sdbName) {
    if (this._photoMemCache[figId]!==undefined) return this._photoMemCache[figId];
    const ls=this._photoStore();
    if (ls[figId]!==undefined) { this._photoMemCache[figId]=ls[figId]; return ls[figId]; }
    const idbUrl=await this._idbGetPhoto(figId);
    if (idbUrl!==null) { this._photoMemCache[figId]=idbUrl; ls[figId]=idbUrl; this._photoSave(ls); return idbUrl; }
    const url=await this.getPlayerPhoto(sdbName);
    if (url) { this._photoMemCache[figId]=url; ls[figId]=url; this._photoSave(ls); this._idbSetPhoto(figId,url); }
    return url||null;
  },
  async getPlayerPhoto(playerName) {
    try {
      const data=await this._sdb(`/searchplayers.php?p=${encodeURIComponent(playerName)}`);
      const players=data?.player;
      if (players?.length) {
        const nl=playerName.toLowerCase();
        const exact=players.find(p=>p.strPlayer?.toLowerCase()===nl);
        const partial=!exact&&players.find(p=>{ const pn=p.strPlayer?.toLowerCase()||''; return pn.includes(nl)||nl.includes(pn.split(' ')[0]); });
        const p=exact||partial||null;
        const url=p?.strCutout||p?.strThumb||p?.strFanart1||null;
        if (url) return url;
      }
    } catch(_){}
    try {
      const res=await this._fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(playerName.replace(/ /g,'_'))}`);
      const thumb=res?.thumbnail?.source||res?.originalimage?.source||null;
      if (thumb) return thumb;
    } catch(_){}
    return null;
  },
  getPhotoSync(fig) {
    if (!fig) return null;
    const m=this._photoMemCache[fig.id];
    if (m) return m;
    try { const ls=this._photoStore(); return ls[fig.id]||null; } catch(_){return null;}
  },
  async getPlayerPhotosCached(playerName) {
    const k='n_'+playerName;
    if (this._photoMemCache[k]!==undefined) return this._photoMemCache[k];
    const ls=this._photoStore();
    if (ls[k]!==undefined) { this._photoMemCache[k]=ls[k]; return ls[k]; }
    const url=await this.getPlayerPhoto(playerName);
    if (url) { this._photoMemCache[k]=url; ls[k]=url; this._photoSave(ls); }
    return url||null;
  },
  async precachePhotos(figuritas) {
    if (!figuritas?.length) return;
    this._migrateLegacyPhotoCache();
    const pool=(typeof Gacha!=='undefined')?Gacha.getPool():[];
    const toFetch=figuritas.map(f=>pool.find(p=>p.id===f.id)).filter(fig=>fig&&!this.getPhotoSync(fig));
    for (let i=0;i<toFetch.length;i+=5) {
      await Promise.allSettled(toFetch.slice(i,i+5).map(fig=>this.getPhotoById(fig.id,fig.sdbName||fig.name)));
    }
  },
  clearPhotoCache() {
    this._teamsCache=null; this._memCache={}; this._photoMemCache={};
  },

  /* ══════════════════════════════════════════
     HELPERS LEGACY (compatibilidad)
  ══════════════════════════════════════════ */
  getCrest(name) { return `https://flagcdn.com/w80/${TEAM_FLAGS[name]?'':'xx'}.png`; },
  getFlag(name)  { return getFlag(name); },
  getApiStatus() {
    return {
      apiFootball:  { enabled: false, hasKey: false },
      footballData: { enabled: false, hasKey: false },
      sportsDB:     { enabled: true,  hasKey: true  }
    };
  }
};
