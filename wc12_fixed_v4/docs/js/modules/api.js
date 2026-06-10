/**
 * api.js — v16  (Opción A — Live scores inteligentes)
 * ESTRATEGIA:
 *   1. getLiveMatches():
 *      - Si NO hay partido activo por hora → devuelve [] (0 requests a api-football)
 *      - Si HAY partido activo → llama api-football en vivo cada 2 minutos
 *      - Máximo consumo: 90 min partido ÷ 2 min = ~45 req. Con 1-2 partidos/día ≤ 90 req.
 *      - TheSportsDB livescores son Premium → no se usa para live
 *   2. getUpcomingMatches():
 *      - TheSportsDB /eventsday.php para partidos de hoy
 *      - api-football como fallback con cooldown 6h
 *      - MOCK como fallback final
 *   3. Fotos: TheSportsDB /searchplayers.php (sin cambios, funciona bien)
 *   4. Standings/Finished: api-football con cooldown 12h
 *
 * Consumo estimado sin Mundial activo: ≤ 10 req/día
 * Consumo estimado con partido en curso: ≤ 55 req/día (seguro)
 *
 * CAMBIOS v13:
 *   - MOCK actualizado: Portugal vs Chile (06-jun), más amistosos correctos
 *   - getLiveMatches(): ya NO muestra "scheduled_today" en el panel en vivo
 *     (ese estado sólo existe para que el dashboard lo ignore en esa sección)
 *   - getUpcomingMatches(): filtra partidos pasados para no mostrar fechas ya jugadas
 *   - Mejor detección de API errors (rate limit, 403, plan limitado)
 *
 * CAMBIOS v12:
 *   - getLiveMatches(): busca EN VIVO en Mundial + Amistosos internacionales (league=10)
 *   - getUpcomingMatches(): incluye amistosos (league=10) antes del Mundial
 *   - getTeamMatches(teamName): nuevo método — partidos jugados y futuros de un equipo
 *
 * FIXES v11 — Sistema de fotos:
 *   - _PHOTO_MAP (URLs de Wikipedia) eliminado del flujo activo: estaba
 *     causando que se mostraran emojis porque las URLs están rotas.
 *   - TheSportsDB es ahora la fuente principal de fotos reales.
 *   - getPhotoById(): flujo corregido: memCache → localStorage(v3) → IDB → TheSportsDB
 *   - getPhotoSync(): ya NO consulta _PHOTO_MAP (URLs rotas); solo memCache y localStorage v3
 *   - getPlayerPhotosCached(): ya NO pasa por _PHOTO_MAP; usa TheSportsDB directamente
 *   - Clave localStorage cambiada a wcc_photos_v3 para forzar migración limpia
 *   - wcc_photos_v1 y wcc_photos_v2 se invalidan automáticamente (URLs Wikipedia obsoletas)
 *   - precachePhotos() llama _migrateLegacyPhotoCache() en primer uso
 */

/* ── Clave de API-Football ──────────────────────────────────────────────────
   Prioridad: key del usuario (localStorage) → key por defecto (compartida)
   • Key por defecto: máx 10 requests/hora para no agotarla
   • Key del usuario: sin límite impuesto por la app
────────────────────────────────────────────────────────────────────────── */
const _AF_KEY_LS      = 'wcc_af_api_key';
const _AF_KEY_DEFAULT = 'ff2d4db4c0d672f86666229955b22197';  // key compartida — api-sports.io

/* Límite horario cuando se usa la key por defecto */
const _AF_DEFAULT_MAX_PER_HOUR = 10;

function getAfKey() {
  try { return localStorage.getItem(_AF_KEY_LS) || _AF_KEY_DEFAULT; } catch(_) { return _AF_KEY_DEFAULT; }
}
function isUsingDefaultKey() {
  try { const k = localStorage.getItem(_AF_KEY_LS); return !k || k === _AF_KEY_DEFAULT; } catch(_) { return true; }
}

/* Estado global de la API — permite mostrar banner en el perfil */
const API_STATUS = {
  usingMock:        false,
  lastError:        null,       // 'rate_limit' | 'auth' | 'network' | 'hourly_limit' | null
  lastSuccess:      null,       // timestamp
  usingDefaultKey:  true,       // se actualiza en cada request
  requestsThisHour: 0,
  _hourSlot:        '',         // formato 'YYYY-MM-DDTHH'

  /* Contador diario (para mostrar en perfil) */
  requestsToday: parseInt(localStorage.getItem('wcc_af_req_count') || '0'),
  _resetDay: localStorage.getItem('wcc_af_req_day') || '',

  _bumpCount() {
    const now    = new Date();
    const today  = now.toISOString().slice(0,10);
    const hour   = now.toISOString().slice(0,13); // 'YYYY-MM-DDTHH'

    /* Reset horario */
    if (this._hourSlot !== hour) {
      this._hourSlot        = hour;
      this.requestsThisHour = 0;
      try { localStorage.setItem('wcc_af_hour_slot', hour); localStorage.setItem('wcc_af_hour_count','0'); } catch(_){}
    }
    this.requestsThisHour++;
    try {
      localStorage.setItem('wcc_af_hour_slot',  hour);
      localStorage.setItem('wcc_af_hour_count', String(this.requestsThisHour));
    } catch(_){}

    /* Reset diario */
    if (this._resetDay !== today) { this.requestsToday = 0; this._resetDay = today; }
    this.requestsToday++;
    try {
      localStorage.setItem('wcc_af_req_count', String(this.requestsToday));
      localStorage.setItem('wcc_af_req_day',   today);
    } catch(_) {}
  },

  /* ¿Se puede hacer otra request ahora? */
  canRequest() {
    if (!isUsingDefaultKey()) return true;    // key propia → sin límite app
    /* Restaurar contador horario desde localStorage al recargar */
    if (!this._hourSlot) {
      try {
        const savedSlot  = localStorage.getItem('wcc_af_hour_slot')  || '';
        const savedCount = parseInt(localStorage.getItem('wcc_af_hour_count') || '0');
        const curSlot    = new Date().toISOString().slice(0,13);
        if (savedSlot === curSlot) { this._hourSlot = savedSlot; this.requestsThisHour = savedCount; }
        else { this._hourSlot = curSlot; this.requestsThisHour = 0; }
      } catch(_){}
    }
    return this.requestsThisHour < _AF_DEFAULT_MAX_PER_HOUR;
  }
};

const API_CONFIG = {
  apiFootball: {
    base:    'https://v3.football.api-sports.io',
    get key() { return getAfKey(); },
    enabled: true
  },
  footballData: {
    base:    'https://api.football-data.org/v4',
    key:     '3bec1d9c3a5d418ebed176fdaaafe7e0',
    enabled: false  // deshabilitado — CORS bloqueado fuera de localhost
  },
  sportsDB: {
    /* Clave pública gratuita "3" — suficiente para buscar jugadores */
    base:    'https://www.thesportsdb.com/api/v1/json/3',
    enabled: true
  }
};

/* ── IDs de api-football ── */
const AF_WORLD_CUP_ID  = 1;    // FIFA World Cup
const AF_FRIENDLIES_ID = 10;   // International Friendlies (Amistosos internacionales)
const AF_SEASON_2026   = 2026;

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
  'Nigeria':'🇳🇬','Ghana':'🇬🇭','Senegal':'🇸🇳','Egipto':'🇪🇬','Egypt':'🇪🇬',
  'Marruecos':'🇲🇦','Túnez':'🇹🇳','Tunisia':'🇹🇳','Costa de Marfil':'🇨🇮',
  'Arabia Saudí':'🇸🇦','Irán':'🇮🇷','Iran':'🇮🇷','Qatar':'🇶🇦','Japón':'🇯🇵',
  'Corea del Sur':'🇰🇷','Australia':'🇦🇺','Irak':'🇮🇶',
  'Estados Unidos':'🇺🇸','EEUU':'🇺🇸','USA':'🇺🇸','Costa Rica':'🇨🇷',
  'Honduras':'🇭🇳','Panamá':'🇵🇦','Jamaica':'🇯🇲','Haití':'🇭🇹',
  'Paraguay':'🇵🇾','Venezuela':'🇻🇪','Bolivia':'🇧🇴','Sudáfrica':'🇿🇦','South Africa':'🇿🇦',
  'Argelia':'🇩🇿','Camerún':'🇨🇲','Mali':'🇲🇱','Chequia':'🇨🇿','Czechia':'🇨🇿',
  'Escocia':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','Austria':'🇦🇹','Bosnia y Herz.':'🇧🇦',
  'Ucrania':'🇺🇦','Ukraine':'🇺🇦','Eslovenia':'🇸🇮','Uzbekistán':'🇺🇿',
  'Islandia':'🇮🇸','Iceland':'🇮🇸','Nueva Zelanda':'🇳🇿','New Zealand':'🇳🇿',
  'Curazao':'🇨🇼','Cabo Verde':'🇨🇻','Jordania':'🇯🇴','Guatemala':'🇬🇹',
  'Irlanda del N.':'🏴󠁧󠁢󠁮󠁩󠁲󠁿','Irak':'🇮🇶',
};

function getFlag(name) { return TEAM_FLAGS[name] || '🏳️'; }

/* ── Fecha LOCAL del usuario (no UTC) ────────────────────────────────
   new Date().toISOString() devuelve fecha UTC, que en El Salvador (UTC-6)
   puede ser UN DÍA ADELANTE respecto a la hora local.
   Siempre usar localDateStr() para comparar fechas de partidos.
──────────────────────────────────────────────────────────────────── */
function localDateStr(d) {
  const dt = d || new Date();
  const y  = dt.getFullYear();
  const m  = String(dt.getMonth() + 1).padStart(2, '0');
  const day= String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/* ── yesterdayStr ── */
function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDateStr(d);
}

/* ══════════════════════════════════════════════
   MOCK DATA COMPLETO — 48 equipos del Mundial 2026
══════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════════
   _mockStatus(date, time) — calcula estado dinámicamente a partir
   de la fecha/hora del partido (en UTC) vs. hora actual.
   IMPORTANTE: los horarios del MOCK están en UTC para evitar bugs
   de zona horaria en usuarios de El Salvador (UTC-6) u otras zonas.
   Duración estimada de un partido: 105 min (90 + 15 extra).
══════════════════════════════════════════════════════════════════ */
function _mockStatus(date, time, scoreHome, scoreAway) {
  if (!date || !time) return 'scheduled';
  // Si ya tiene marcador fijo → siempre finished
  if (scoreHome !== null && scoreHome !== undefined &&
      scoreAway !== null && scoreAway !== undefined) return 'finished';
  // IMPORTANTE: los tiempos del mock están almacenados en UTC directamente.
  // Parsear sin 'Z' y sin sufijo de zona usa la hora LOCAL del navegador → incorrecto.
  // Parsear con 'Z' asume UTC → correcto si los datos están en UTC.
  const start = new Date(`${date}T${time}:00Z`);
  const now   = Date.now();
  const diffMin = (now - start.getTime()) / 60000;
  if (diffMin < 0)    return 'scheduled';
  if (diffMin < 115)  return 'live';   // 90 min partido + ~25 min margen extra tiempo/descanso
  return 'finished';
}

const MOCK = {
  liveMatches: [],

  /* ── Todos los partidos (amistosos + Mundial) ──────────────────────
     scoreHome/scoreAway = null  → pendiente (estado calculado por hora)
     scoreHome/scoreAway = número → resultado final conocido
  ──────────────────────────────────────────────────────────────────── */
  /* ── Todos los partidos (amistosos + Mundial) ──────────────────────
     NOTA: todos los horarios están en UTC para cálculo correcto de estado
     en cualquier zona horaria (El Salvador UTC-6, México UTC-5, etc.)
     scoreHome/scoreAway = null  → pendiente (estado calculado por hora)
     scoreHome/scoreAway = número → resultado final conocido
  ──────────────────────────────────────────────────────────────────── */
  friendlyMatches: [
    /* ── RESULTADOS CONOCIDOS (ya terminaron) ── */
    { id:'f001', home:'Brasil',     away:'Egipto',     homeFlag:'🇧🇷', awayFlag:'🇪🇬', date:'2026-06-03', time:'21:00', competition:'Amistoso', type:'friendly', venue:'Orlando, FL',        scoreHome:4, scoreAway:0 },
    { id:'f009', home:'México',     away:'Ecuador',    homeFlag:'🇲🇽', awayFlag:'🇪🇨', date:'2026-06-05', time:'03:00', competition:'Amistoso', type:'friendly', venue:'Phoenix, AZ',        scoreHome:1, scoreAway:1 },
    { id:'f010', home:'Uruguay',    away:'Austria',    homeFlag:'🇺🇾', awayFlag:'🇦🇹', date:'2026-06-06', time:'01:00', competition:'Amistoso', type:'friendly', venue:'Los Ángeles, CA',     scoreHome:2, scoreAway:1 },
    { id:'f011', home:'Colombia',   away:'Costa Rica', homeFlag:'🇨🇴', awayFlag:'🇨🇷', date:'2026-06-05', time:'23:00', competition:'Amistoso', type:'friendly', venue:'Miami, FL',           scoreHome:3, scoreAway:0 },
    /* ── 6 JUN — resultados conocidos (UTC) ── */
    { id:'f012', home:'Portugal',   away:'Chile',      homeFlag:'🇵🇹', awayFlag:'🇨🇱', date:'2026-06-06', time:'21:45', competition:'Amistoso', type:'friendly', venue:'Newark, NJ',          scoreHome:2, scoreAway:1 },
    { id:'f002', home:'Argentina',  away:'Honduras',   homeFlag:'🇦🇷', awayFlag:'🇭🇳', date:'2026-06-07', time:'01:00', competition:'Amistoso', type:'friendly', venue:'Kyle Field, TX',      scoreHome:2, scoreAway:0 },
    { id:'f003', home:'Inglaterra', away:'Nueva Zelanda',homeFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',awayFlag:'🇳🇿',date:'2026-06-06',time:'23:00',competition:'Amistoso',type:'friendly',venue:'Chicago, IL',       scoreHome:2, scoreAway:1 },
    { id:'f013', home:'Alemania',   away:'EE.UU.',     homeFlag:'🇩🇪', awayFlag:'🇺🇸', date:'2026-06-07', time:'01:00', competition:'Amistoso', type:'friendly', venue:'Denver, CO',          scoreHome:2, scoreAway:1 },
    { id:'f016', home:'Brasil',     away:'México',     homeFlag:'🇧🇷', awayFlag:'🇲🇽', date:'2026-06-07', time:'02:00', competition:'Amistoso', type:'friendly', venue:'Dallas, TX',          scoreHome:2, scoreAway:1 },
    /* ── 7 JUN — HOY (horarios UTC) ── */
    { id:'f008', home:'Marruecos',  away:'Noruega',    homeFlag:'🇲🇦', awayFlag:'🇳🇴', date:'2026-06-07', time:'19:00', competition:'Amistoso', type:'friendly', venue:'Red Bull Arena, NJ',  scoreHome:1, scoreAway:1 },
    { id:'f004', home:'Colombia',   away:'Jordania',   homeFlag:'🇨🇴', awayFlag:'🇯🇴', date:'2026-06-07', time:'23:00', competition:'Amistoso', type:'friendly', venue:'San Diego, CA',       scoreHome:2, scoreAway:0 },
    { id:'f017', home:'Japón',      away:'Islandia',   homeFlag:'🇯🇵', awayFlag:'🇮🇸', date:'2026-05-31', time:'10:25', competition:'Amistoso', type:'friendly', venue:'Tokio, Japón',        scoreHome:1, scoreAway:0 },
    { id:'f018', home:'Corea del Sur',away:'El Salvador',homeFlag:'🇰🇷', awayFlag:'🇸🇻', date:'2026-06-04', time:'02:00', competition:'Amistoso', type:'friendly', venue:'Salt Lake City, UT',  scoreHome:1, scoreAway:0 },
    { id:'f019', home:'Ecuador',    away:'Guatemala',  homeFlag:'🇪🇨', awayFlag:'🇬🇹', date:'2026-06-08', time:'01:00', competition:'Amistoso', type:'friendly', venue:'EE.UU.',              scoreHome:3, scoreAway:0 },
    /* ── 8 JUN (UTC) ── */
    { id:'f005', home:'Francia',    away:'Irlanda del N.',homeFlag:'🇫🇷',awayFlag:'🏴󠁧󠁢󠁮󠁩󠁲󠁿',date:'2026-06-08',time:'23:00',competition:'Amistoso',type:'friendly',venue:'East Rutherford, NJ', scoreHome:null, scoreAway:null },
    { id:'f014', home:'Bélgica',    away:'Escocia',    homeFlag:'🇧🇪', awayFlag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', date:'2026-06-09', time:'00:00', competition:'Amistoso', type:'friendly', venue:'Atlanta, GA',       scoreHome:null, scoreAway:null },
    /* ── 9 JUN (UTC) — España vs Perú 02:00 UTC = 21:00 hora Puebla ── */
    { id:'f006', home:'España',     away:'Perú',       homeFlag:'🇪🇸', awayFlag:'🇵🇪', date:'2026-06-09', time:'02:00', competition:'Amistoso', type:'friendly', venue:'Puebla, México',      scoreHome:null, scoreAway:null },
    /* ── 10 JUN (UTC) ── */
    { id:'f007', home:'Argentina',  away:'Islandia',   homeFlag:'🇦🇷', awayFlag:'🇮🇸', date:'2026-06-10', time:'01:30', competition:'Amistoso', type:'friendly', venue:'Tuscaloosa, AL',      scoreHome:3, scoreAway:0 },
    { id:'f015', home:'Brasil',     away:'Paraguay',   homeFlag:'🇧🇷', awayFlag:'🇵🇾', date:'2026-06-10', time:'02:00', competition:'Amistoso', type:'friendly', venue:'Fort Worth, TX',      scoreHome:null, scoreAway:null },
    { id:'f020', home:'Portugal',   away:'Nigeria',    homeFlag:'🇵🇹', awayFlag:'🇳🇬', date:'2026-06-10', time:'19:45', competition:'Amistoso', type:'friendly', venue:'Leiria, Portugal',    scoreHome:null, scoreAway:null },
  ],

  /* ── Partidos del Mundial 2026 (inicio: 11 Jun) ── */
  upcomingMatches: [
    { id:'wc001', home:'México',        away:'Sudáfrica',     homeFlag:'🇲🇽', awayFlag:'🇿🇦', date:'2026-06-11', time:'20:00', competition:'Grupo A — J1', type:'worldcup', venue:'Estadio Azteca, CDMX' },
    { id:'wc002', home:'Canadá',        away:'Bosnia y Herz.',homeFlag:'🇨🇦', awayFlag:'🇧🇦', date:'2026-06-12', time:'21:00', competition:'Grupo B — J1', type:'worldcup', venue:'Toronto (BMO Field)' },
    { id:'wc003', home:'Brasil',        away:'Marruecos',     homeFlag:'🇧🇷', awayFlag:'🇲🇦', date:'2026-06-13', time:'22:00', competition:'Grupo C — J1', type:'worldcup', venue:'MetLife Stadium, NY' },
    { id:'wc004', home:'Alemania',      away:'Curazao',       homeFlag:'🇩🇪', awayFlag:'🇨🇼', date:'2026-06-14', time:'19:00', competition:'Grupo E — J1', type:'worldcup', venue:'NRG Stadium, Houston' },
    { id:'wc005', home:'Países Bajos',  away:'Japón',         homeFlag:'🇳🇱', awayFlag:'🇯🇵', date:'2026-06-15', time:'19:00', competition:'Grupo F — J1', type:'worldcup', venue:'AT&T Stadium, Dallas' },
    { id:'wc006', home:'España',        away:'Cabo Verde',    homeFlag:'🇪🇸', awayFlag:'🇨🇻', date:'2026-06-15', time:'22:00', competition:'Grupo H — J1', type:'worldcup', venue:'Mercedes-Benz Stadium, Atlanta' },
    { id:'wc007', home:'Francia',       away:'Senegal',       homeFlag:'🇫🇷', awayFlag:'🇸🇳', date:'2026-06-16', time:'21:00', competition:'Grupo I — J1', type:'worldcup', venue:'MetLife Stadium, NY' },
    { id:'wc008', home:'Argentina',     away:'Argelia',       homeFlag:'🇦🇷', awayFlag:'🇩🇿', date:'2026-06-17', time:'21:00', competition:'Grupo J — J1', type:'worldcup', venue:'Arrowhead Stadium, Kansas City' },
    { id:'wc009', home:'Noruega',       away:'Irak',          homeFlag:'🇳🇴', awayFlag:'🇮🇶', date:'2026-06-17', time:'19:00', competition:'Grupo F — J1', type:'worldcup', venue:'Gillette Stadium, Boston' },
    { id:'wc010', home:'Portugal',      away:'Arabia Saudí',  homeFlag:'🇵🇹', awayFlag:'🇸🇦', date:'2026-06-18', time:'22:00', competition:'Grupo K — J1', type:'worldcup', venue:'Arrowhead Stadium, Kansas City' },
    { id:'wc011', home:'Inglaterra',    away:'Costa Rica',    homeFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayFlag:'🇨🇷', date:'2026-06-18', time:'19:00', competition:'Grupo L — J1', type:'worldcup', venue:'AT&T Stadium, Dallas' },
    { id:'wc012', home:'Colombia',      away:'Chile',         homeFlag:'🇨🇴', awayFlag:'🇨🇱', date:'2026-06-19', time:'22:00', competition:'Grupo G — J1', type:'worldcup', venue:'Hard Rock Stadium, Miami' },
  ],

  finishedMatches: [],

  predictableMatches: [
    /* 7 Jun — hoy (horarios UTC) */
    { id:'f008', home:'Marruecos',   away:'Noruega',        homeFlag:'🇲🇦', awayFlag:'🇳🇴', date:'2026-06-07', time:'19:00', competition:'Amistoso', type:'friendly' },
    { id:'f004', home:'Colombia',    away:'Jordania',       homeFlag:'🇨🇴', awayFlag:'🇯🇴', date:'2026-06-07', time:'23:00', competition:'Amistoso', type:'friendly' },
    { id:'f017', home:'Japón',       away:'Islandia',       homeFlag:'🇯🇵', awayFlag:'🇮🇸', date:'2026-06-08', time:'00:00', competition:'Amistoso', type:'friendly' },
    { id:'f018', home:'Corea del Sur',away:'Australia',     homeFlag:'🇰🇷', awayFlag:'🇦🇺', date:'2026-06-08', time:'00:30', competition:'Amistoso', type:'friendly' },
    { id:'f019', home:'Ecuador',     away:'Guatemala',      homeFlag:'🇪🇨', awayFlag:'🇬🇹', date:'2026-06-08', time:'01:00', competition:'Amistoso', type:'friendly' },
    /* 8-9 Jun (UTC) */
    { id:'f005', home:'Francia',     away:'Irlanda del N.', homeFlag:'🇫🇷', awayFlag:'🏴󠁧󠁢󠁮󠁩󠁲󠁿', date:'2026-06-08', time:'23:00', competition:'Amistoso', type:'friendly' },
    { id:'f014', home:'Bélgica',     away:'Escocia',        homeFlag:'🇧🇪', awayFlag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', date:'2026-06-09', time:'00:00', competition:'Amistoso', type:'friendly' },
    { id:'f006', home:'España',      away:'Perú',           homeFlag:'🇪🇸', awayFlag:'🇵🇪', date:'2026-06-09', time:'02:00', competition:'Amistoso', type:'friendly' },
    { id:'f007', home:'Argentina',   away:'Islandia',       homeFlag:'🇦🇷', awayFlag:'🇮🇸', date:'2026-06-10', time:'01:30', competition:'Amistoso', type:'friendly' },
    { id:'f015', home:'Brasil',      away:'Paraguay',       homeFlag:'🇧🇷', awayFlag:'🇵🇾', date:'2026-06-10', time:'02:00', competition:'Amistoso', type:'friendly' },
    { id:'f020', home:'Portugal',    away:'Nigeria',        homeFlag:'🇵🇹', awayFlag:'🇳🇬', date:'2026-06-10', time:'19:45', competition:'Amistoso', type:'friendly' },
    /* Mundial */
    { id:'wc001', home:'México',     away:'Sudáfrica',      homeFlag:'🇲🇽', awayFlag:'🇿🇦', date:'2026-06-11', time:'20:00', competition:'Grupo A — J1', type:'worldcup' },
    { id:'wc002', home:'Canadá',     away:'Bosnia y Herz.', homeFlag:'🇨🇦', awayFlag:'🇧🇦', date:'2026-06-12', time:'21:00', competition:'Grupo B — J1', type:'worldcup' },
    { id:'wc003', home:'Brasil',     away:'Marruecos',      homeFlag:'🇧🇷', awayFlag:'🇲🇦', date:'2026-06-13', time:'22:00', competition:'Grupo C — J1', type:'worldcup' },
    { id:'wc007', home:'Francia',    away:'Senegal',        homeFlag:'🇫🇷', awayFlag:'🇸🇳', date:'2026-06-16', time:'21:00', competition:'Grupo I — J1', type:'worldcup' },
    { id:'wc006', home:'España',     away:'Cabo Verde',     homeFlag:'🇪🇸', awayFlag:'🇨🇻', date:'2026-06-15', time:'22:00', competition:'Grupo H — J1', type:'worldcup' },
    { id:'wc008', home:'Argentina',  away:'Argelia',        homeFlag:'🇦🇷', awayFlag:'🇩🇿', date:'2026-06-17', time:'21:00', competition:'Grupo J — J1', type:'worldcup' },
    { id:'wc010', home:'Portugal',   away:'Arabia Saudí',   homeFlag:'🇵🇹', awayFlag:'🇸🇦', date:'2026-06-18', time:'22:00', competition:'Grupo K — J1', type:'worldcup' },
  ],

  standings: [
    { pos:1,  team:'Brasil',       flag:'🇧🇷', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2,  team:'Argentina',    flag:'🇦🇷', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3,  team:'Francia',      flag:'🇫🇷', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4,  team:'España',       flag:'🇪🇸', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:5,  team:'Alemania',     flag:'🇩🇪', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:6,  team:'Portugal',     flag:'🇵🇹', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:7,  team:'Países Bajos', flag:'🇳🇱', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:8,  team:'Inglaterra',   flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:9,  team:'Bélgica',      flag:'🇧🇪', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:10, team:'Noruega',      flag:'🇳🇴', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:11, team:'Colombia',     flag:'🇨🇴', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:12, team:'Uruguay',      flag:'🇺🇾', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:13, team:'México',       flag:'🇲🇽', group:'A', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:14, team:'EE.UU.',       flag:'🇺🇸', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:15, team:'Canadá',       flag:'🇨🇦', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:16, team:'Japón',        flag:'🇯🇵', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:17, team:'Marruecos',    flag:'🇲🇦', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:18, team:'Senegal',      flag:'🇸🇳', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:19, team:'Croacia',      flag:'🇭🇷', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:20, team:'Ecuador',      flag:'🇪🇨', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  ]
};

// MOCK.teams: lista completa de selecciones del Mundial 2026 (48 equipos)
// Grupos según sorteo oficial del 5 de diciembre de 2025, Washington D.C.
MOCK.teams = [
  // GRUPO A: México, Sudáfrica, Corea del Sur, Rep. UEFA D*
  { id:'t01', name:'México',            flag:'🇲🇽', group:'A', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t02', name:'Sudáfrica',         flag:'🇿🇦', group:'A', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t03', name:'Corea del Sur',     flag:'🇰🇷', group:'A', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t04', name:'Rep. Checa',         flag:'🇨🇿', group:'A', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  // GRUPO B: Canadá, Rep. UEFA 1*, Qatar, Suiza
  { id:'t05', name:'Canadá',            flag:'🇨🇦', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t06', name:'Bosnia-Herzegovina', flag:'🇧🇦', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t07', name:'Qatar',             flag:'🇶🇦', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t08', name:'Suiza',             flag:'🇨🇭', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  // GRUPO C: Brasil, Marruecos, Haití, Escocia
  { id:'t09', name:'Brasil',            flag:'🇧🇷', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t10', name:'Marruecos',         flag:'🇲🇦', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t11', name:'Haití',             flag:'🇭🇹', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t12', name:'Escocia',           flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  // GRUPO D: EE.UU., Paraguay, Australia, Rep. UEFA 3*
  { id:'t13', name:'EE.UU.',            flag:'🇺🇸', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t14', name:'Paraguay',          flag:'🇵🇾', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t15', name:'Australia',         flag:'🇦🇺', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t16', name:'Turquía',            flag:'🇹🇷', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  // GRUPO E: Alemania, Curazao, Costa de Marfil, Ecuador
  { id:'t17', name:'Alemania',          flag:'🇩🇪', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t18', name:'Curazao',           flag:'🇨🇼', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t19', name:'Costa de Marfil',   flag:'🇨🇮', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t20', name:'Ecuador',           flag:'🇪🇨', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  // GRUPO F: Países Bajos, Japón, Rep. UEFA 2*, Túnez
  { id:'t21', name:'Países Bajos',      flag:'🇳🇱', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t22', name:'Japón',             flag:'🇯🇵', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t23', name:'Suecia',             flag:'🇸🇪', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t24', name:'Túnez',             flag:'🇹🇳', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  // GRUPO G: Bélgica, Egipto, Irán, Nueva Zelanda
  { id:'t25', name:'Bélgica',           flag:'🇧🇪', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t26', name:'Egipto',            flag:'🇪🇬', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t27', name:'Irán',              flag:'🇮🇷', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t28', name:'Nueva Zelanda',     flag:'🇳🇿', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  // GRUPO H: España, Cabo Verde, Arabia Saudita, Uruguay
  { id:'t29', name:'España',            flag:'🇪🇸', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t30', name:'Cabo Verde',        flag:'🇨🇻', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t31', name:'Arabia Saudita',    flag:'🇸🇦', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t32', name:'Uruguay',           flag:'🇺🇾', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  // GRUPO I: Francia, Senegal, Rep. Intercont. 2*, Noruega
  { id:'t33', name:'Francia',           flag:'🇫🇷', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t34', name:'Senegal',           flag:'🇸🇳', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t35', name:'Irak',               flag:'🇮🇶', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t36', name:'Noruega',           flag:'🇳🇴', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  // GRUPO J: Argentina, Argelia, Austria, Jordania
  { id:'t37', name:'Argentina',         flag:'🇦🇷', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t38', name:'Argelia',           flag:'🇩🇿', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t39', name:'Austria',           flag:'🇦🇹', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t40', name:'Jordania',          flag:'🇯🇴', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  // GRUPO K: Portugal, Uzbekistán, Colombia, Rep. Intercont. 1*
  { id:'t41', name:'Portugal',          flag:'🇵🇹', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t42', name:'Uzbekistán',        flag:'🇺🇿', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t43', name:'Colombia',          flag:'🇨🇴', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t44', name:'RD Congo',           flag:'🇨🇩', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  // GRUPO L: Inglaterra, Croacia, Ghana, Panamá
  { id:'t45', name:'Inglaterra',        flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t46', name:'Croacia',           flag:'🇭🇷', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t47', name:'Ghana',             flag:'🇬🇭', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t48', name:'Panamá',            flag:'🇵🇦', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
]

/* ══════════════════════════════════════════════════════════════════════
   SHARED LIVE CACHE — v17
   Propósito: con múltiples usuarios/pestañas abiertos, evitar que cada
   instancia haga su propio request a api-football (límite 1000/día).
   Estrategia: BroadcastChannel para compartir respuestas entre pestañas
   + localStorage como caché compartido de 2 minutos con lock optimista.
   • Solo UNA pestaña hace el fetch real (la que obtiene el "lock").
   • El resto espera hasta 3 s y lee del localStorage compartido.
   • Si localStorage no tiene dato fresco → hace su propio fetch como fallback.
══════════════════════════════════════════════════════════════════════ */
const SharedLiveCache = {
  CHANNEL:     'wcc_live_sync',
  LS_KEY:      'wcc_shared_live',
  LOCK_KEY:    'wcc_live_lock',
  TTL:         2 * 60 * 1000,   // 2 minutos
  LOCK_TTL:    15 * 1000,       // 15 s — tiempo máximo que puede durar un fetch

  _channel: null,

  _getChannel() {
    if (!this._channel && typeof BroadcastChannel !== 'undefined') {
      this._channel = new BroadcastChannel(this.CHANNEL);
    }
    return this._channel;
  },

  /** Lee la caché compartida del localStorage. */
  read() {
    try {
      const raw = localStorage.getItem(this.LS_KEY);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts > this.TTL) { localStorage.removeItem(this.LS_KEY); return null; }
      return data;
    } catch(_) { return null; }
  },

  /** Escribe en la caché compartida y notifica a otras pestañas. */
  write(data) {
    try {
      localStorage.setItem(this.LS_KEY, JSON.stringify({ data, ts: Date.now() }));
      this._getChannel()?.postMessage({ type: 'live_update', data });
    } catch(_) {}
  },

  /**
   * acquireLock — intenta obtener el "derecho de hacer el fetch".
   * Usa un timestamp en localStorage como lock optimista.
   * Devuelve true si adquirió el lock, false si otro lo tiene.
   */
  acquireLock() {
    try {
      const existing = localStorage.getItem(this.LOCK_KEY);
      if (existing) {
        const lockTs = parseInt(existing, 10);
        if (Date.now() - lockTs < this.LOCK_TTL) return false; // otro lo tiene
      }
      localStorage.setItem(this.LOCK_KEY, String(Date.now()));
      return true;
    } catch(_) { return true; } // si falla, intentar el fetch igualmente
  },

  releaseLock() {
    try { localStorage.removeItem(this.LOCK_KEY); } catch(_) {}
  },

  /**
   * waitForData — espera hasta 3s a que otra pestaña publique datos.
   * Escucha el BroadcastChannel o lee el localStorage periódicamente.
   */
  waitForData(timeoutMs = 3000) {
    return new Promise(resolve => {
      const start = Date.now();
      const ch = this._getChannel();
      let resolved = false;
      const done = (data) => {
        if (resolved) return;
        resolved = true;
        if (ch) ch.onmessage = null;
        resolve(data);
      };
      // Escuchar broadcast inmediato
      if (ch) {
        ch.onmessage = (e) => {
          if (e.data?.type === 'live_update') done(e.data.data);
        };
      }
      // Polling del localStorage como fallback
      const interval = setInterval(() => {
        const cached = SharedLiveCache.read();
        if (cached !== null) { clearInterval(interval); done(cached); return; }
        if (Date.now() - start > timeoutMs) { clearInterval(interval); done(null); }
      }, 300);
    });
  }
};

/* ══════════════════════════════════════════════
   API MODULE
══════════════════════════════════════════════ */
const API = {

  async _fetch(url, headers = {}) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(url, { headers, signal: ctrl.signal });
      clearTimeout(timer);
      if (res.status === 429) {
        API_STATUS.lastError = 'rate_limit';
        throw new Error(`HTTP 429 Rate limit`);
      }
      if (res.status === 403 || res.status === 401) {
        API_STATUS.lastError = 'auth';
        throw new Error(`HTTP ${res.status} Auth error`);
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // api-football devuelve errors:{} cuando la key no tiene acceso
      if (data?.errors && Object.keys(data.errors).length > 0) {
        const errMsg = JSON.stringify(data.errors);
        if (errMsg.includes('token') || errMsg.includes('Subscription') || errMsg.includes('Access')) {
          API_STATUS.lastError = 'auth';
          throw new Error(`API error: ${errMsg}`);
        }
        if (errMsg.includes('rate') || errMsg.includes('requests')) {
          API_STATUS.lastError = 'rate_limit';
          throw new Error(`Rate limit: ${errMsg}`);
        }
      }
      // Éxito
      API_STATUS.lastError  = null;
      API_STATUS.lastSuccess = Date.now();
      if (url.includes('v3.football.api-sports.io')) API_STATUS._bumpCount();
      return data;
    } catch (err) {
      if (!API_STATUS.lastError) API_STATUS.lastError = 'network';
      console.warn('[API]', url.split('?')[0], '-', err.message);
      return null;
    }
  },

  /* ── api-football ── */
  async _af(endpoint) {
    if (!API_CONFIG.apiFootball.enabled) return null;
    API_STATUS.usingDefaultKey = isUsingDefaultKey();
    /* Límite horario: solo aplica con key por defecto */
    if (!API_STATUS.canRequest()) {
      console.warn('[API] Límite horario alcanzado (key por defecto). Usa tu propia API key para sin límite.');
      API_STATUS.lastError = 'hourly_limit';
      return null;
    }
    return await this._fetch(
      `${API_CONFIG.apiFootball.base}${endpoint}`,
      {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key':  API_CONFIG.apiFootball.key
      }
    );
  },

  /* ── football-data.org ── */
  async _fd(endpoint) {
    if (!API_CONFIG.footballData.enabled || !API_CONFIG.footballData.key) return null;
    return await this._fetch(
      `${API_CONFIG.footballData.base}${endpoint}`,
      { 'X-Auth-Token': API_CONFIG.footballData.key }
    );
  },

  /* ── TheSportsDB ── */
  async _sdb(endpoint) {
    if (!API_CONFIG.sportsDB.enabled) return null;
    return await this._fetch(`${API_CONFIG.sportsDB.base}${endpoint}`);
  },

  /* ══════════════════════════════════════════
     PARTIDOS EN VIVO — v12
     Busca Mundial 2026 + Amistosos internacionales simultáneamente
  ══════════════════════════════════════════ */
  async getLiveMatches() {
    // 1 — Caché en memoria (instancia actual, más rápido)
    const mem = this._memGet('live');
    if (mem) return mem;

    // 2 — Caché compartida entre pestañas/usuarios (SharedLiveCache)
    //     Evita que múltiples usuarios simultáneos agoten la cuota de 1000 req/día.
    //     Si el localStorage tiene dato fresco (< 2 min) lo usa directamente.
    const shared = SharedLiveCache.read();
    if (shared !== null) return this._memSet('live', shared);

    /* ════════════════════════════════════════════════════════════════
       ESTRATEGIA OPCIÓN A — api-football como fuente de live scores
       ────────────────────────────────────────────────────────────────
       • Solo se llama a api-football si hay un partido en curso según
         el calendario (getUpcomingMatches detecta status=live por hora).
       • Si no hay partido activo → devuelve [] sin gastar requests.
       • Si hay partido activo → llama api-football cada 2 minutos
         (controlado por el timer en renderLive del dashboard).
       • Amistosos internacionales: league=10 (International Friendlies)
       • Mundial 2026: league=1
       • Máximo consumo estimado: partido de 90 min = ~45 requests.
         Con 1-2 partidos/día: ≤90 requests, dentro del límite de 100.
       • Cuando no hay partido activo = 0 requests de api-football.
    ════════════════════════════════════════════════════════════════ */

    /* ── Paso 1: ¿Hay algún partido en curso ahora mismo? ────────────
       Revisamos el MOCK/upcoming en memoria (ya cargado, sin coste).
       Si ningún partido está en status=live por hora, no llamamos a la API.
    ──────────────────────────────────────────────────────────────── */
    const upcomingMem = this._memGet('upcoming');
    const hasLiveByTime = (upcomingMem || []).some(m => m.status === 'live');

    if (!hasLiveByTime) {
      // No hay partido activo → devolver vacío sin gastar requests
      const empty = [];
      SharedLiveCache.write(empty);
      return this._memSet('live', empty);
    }

    /* ── Paso 2: Hay partido en curso → intentar ser la pestaña que hace el fetch
       Sistema de lock optimista: solo UNA pestaña llama a api-football;
       las demás esperan el resultado publicado en localStorage/BroadcastChannel.
       Esto reduce el consumo de la cuota de 1000 req/día cuando varios usuarios
       tienen la app abierta simultáneamente durante un partido.
    ──────────────────────────────────────────────────────────────── */
    const gotLock = SharedLiveCache.acquireLock();
    if (!gotLock) {
      // Otra pestaña/usuario está haciendo el fetch ahora mismo → esperar su resultado
      const waited = await SharedLiveCache.waitForData(3500);
      if (waited !== null) return this._memSet('live', waited);
      // Si expiró el timeout, hacer el propio fetch como fallback
    }

    /* ── Paso 3: Llamar api-football (esta instancia tiene el lock) ──────────
       Buscamos en TODAS las ligas internacionales disponibles.
       Usamos Promise.allSettled para que si una falla no rompa todo.
    ──────────────────────────────────────────────────────────────── */
    let result = [];
    try {
      const [resWC, resFr] = await Promise.allSettled([
        this._af(`/fixtures?live=all&league=${AF_WORLD_CUP_ID}&season=${AF_SEASON_2026}`),
        this._af(`/fixtures?live=all&league=${AF_FRIENDLIES_ID}`)
      ]);

      const _afMap = f => ({
        id:          `af_${f.fixture.id}`,
        home:        f.teams.home.name,
        away:        f.teams.away.name,
        homeFlag:    getFlag(f.teams.home.name),
        awayFlag:    getFlag(f.teams.away.name),
        scoreHome:   f.goals.home ?? 0,
        scoreAway:   f.goals.away ?? 0,
        minute:      f.fixture.status.elapsed || f.fixture.status.short || '?',
        status:      'live',
        competition: f.league?.name || '',
        type:        f.league?.id === AF_WORLD_CUP_ID ? 'worldcup' : 'friendly'
      });

      const wcFixtures = resWC.status === 'fulfilled' ? (resWC.value?.response || []) : [];
      const frFixtures = resFr.status === 'fulfilled' ? (resFr.value?.response || []) : [];

      // Deduplicar por fixture id
      const seen = new Set();
      const combined = [...wcFixtures, ...frFixtures].filter(f => {
        if (seen.has(f.fixture.id)) return false;
        seen.add(f.fixture.id);
        return true;
      });

      if (combined.length > 0) result = combined.map(_afMap);
    } finally {
      SharedLiveCache.releaseLock();
    }

    // Publicar en caché compartida para otras pestañas/usuarios
    SharedLiveCache.write(result);
    return this._memSet('live', result);
  },


  /* ══════════════════════════════════════════
     PRÓXIMOS PARTIDOS — v12
     Mundial 2026 + Amistosos internacionales pre-mundial
  ══════════════════════════════════════════ */
  async getUpcomingMatches() {
    /* ══════════════════════════════════════════════════════════════════
       getUpcomingMatches — v17 DINÁMICA
       ESTRATEGIA:
         • Fuente principal: api-football (amistosos league=10 + Mundial league=1)
         • Busca: partidos de HOY (con scores) + próximos 14 días
         • Cache por capas:
             - Partidos de HOY: caché 30 min (se actualizan scores durante el día)
             - Próximos días:   caché 6h (raramente cambian)
             - Al cambiar de día: caché de "hoy" se invalida automáticamente
         • MOCK: solo fallback de emergencia si api-football falla
         • Partidos de AYER: NO se muestran (ya pasó el día)
    ════════════════════════════════════════════════════════════════════ */
    const todayStr = localDateStr();

    // ── Invalidar caché del día anterior ──────────────────────────────
    const lastDay = localStorage.getItem('wcc_upcoming_day');
    if (lastDay !== todayStr) {
      this._memCache = Object.fromEntries(
        Object.entries(this._memCache).filter(([k]) => !k.startsWith('upcoming'))
      );
      localStorage.removeItem('wcc_cache_upcoming');
      localStorage.removeItem('wcc_cache_upcoming_today');
      localStorage.setItem('wcc_upcoming_day', todayStr);
    }

    // ── Caché en memoria (más rápido, vive 30 min) ────────────────────
    const mem = this._memGet('upcoming');
    if (mem) return mem;

    // ── Helper: mapear fixture de api-football al formato interno ─────
    const _afMap = (f) => {
      const sc         = f.fixture?.status?.short || '';
      const isLive     = ['1H','2H','HT','ET','P','BT','INT'].includes(sc);
      const isFinished = ['FT','AET','PEN'].includes(sc);
      const isWC       = f.league?.id === AF_WORLD_CUP_ID;
      // Convertir fecha UTC a fecha local del usuario para mostrar correctamente
      const fixtureUTC = new Date(f.fixture.date);
      const localDate  = localDateStr(fixtureUTC);
      // Hora local en formato HH:MM
      const localHH    = String(fixtureUTC.getHours()).padStart(2,'0');
      const localMM    = String(fixtureUTC.getMinutes()).padStart(2,'0');
      return {
        id:          `af_${f.fixture.id}`,
        home:        f.teams.home.name,
        away:        f.teams.away.name,
        homeFlag:    getFlag(f.teams.home.name),
        awayFlag:    getFlag(f.teams.away.name),
        date:        localDate,
        time:        `${localHH}:${localMM}`,
        competition: f.league?.round || f.league?.name || (isWC ? 'Mundial 2026' : 'Amistoso Internacional'),
        venue:       f.fixture.venue?.city ? `${f.fixture.venue.name}, ${f.fixture.venue.city}` : (f.fixture.venue?.name || ''),
        type:        isWC ? 'worldcup' : 'friendly',
        status:      isLive ? 'live' : isFinished ? 'finished' : 'scheduled',
        scoreHome:   (isLive || isFinished) ? (f.goals?.home ?? null) : null,
        scoreAway:   (isLive || isFinished) ? (f.goals?.away ?? null) : null,
        minute:      isLive ? (f.fixture.status?.elapsed || null) : null,
      };
    };

    // ── Calcular fecha límite (hoy + 14 días) ─────────────────────────
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + 14);
    const limitStr = localDateStr(limitDate);

    /* ── CAPA 1: api-football — fuente principal dinámica ────────────
       Lanzamos en paralelo:
         a) Partidos de HOY en amistosos y Mundial (con scores actualizados)
         b) Próximos partidos del Mundial (status=NS, siguiente 20)
         c) Próximos amistosos (status=NS, siguiente 20)
       Cache para HOY: 30 minutos (se re-consulta durante el día)
       Cache para próximos: 6 horas
    ──────────────────────────────────────────────────────────────── */
    const AF_TODAY_KEY  = 'wcc_af_today_ts';
    const AF_NEXT_KEY   = 'wcc_af_next_ts';
    const AF_YEST_KEY   = 'wcc_af_yest_ts';
    const AF_TODAY_COOL = 30 * 60 * 1000;        // 30 minutos
    const AF_NEXT_COOL  = 6  * 60 * 60 * 1000;   // 6 horas
    const AF_YEST_COOL  = 12 * 60 * 60 * 1000;   // 12 horas (resultados de ayer no cambian)

    const yestStr = yesterdayStr();

    const lastAfToday = parseInt(localStorage.getItem(AF_TODAY_KEY) || '0');
    const lastAfNext  = parseInt(localStorage.getItem(AF_NEXT_KEY)  || '0');
    const lastAfYest  = parseInt(localStorage.getItem(AF_YEST_KEY)  || '0');

    const needsToday = Date.now() - lastAfToday > AF_TODAY_COOL;
    const needsNext  = Date.now() - lastAfNext  > AF_NEXT_COOL;
    const needsYest  = Date.now() - lastAfYest  > AF_YEST_COOL;

    // Leer caché de próximos (puede estar vigente aunque hoy ya no lo esté)
    let cachedNext = null;
    try {
      const raw = localStorage.getItem('wcc_cache_upcoming_next');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.ts < AF_NEXT_COOL) cachedNext = parsed.data;
      }
    } catch(_) {}

    // Leer caché de ayer
    let cachedYest = null;
    try {
      const raw = localStorage.getItem('wcc_cache_upcoming_yest');
      if (raw) {
        const parsed = JSON.parse(raw);
        // Invalidar si cambió el día (ayer de hoy ≠ ayer cacheado)
        if (Date.now() - parsed.ts < AF_YEST_COOL && parsed.yestStr === yestStr) cachedYest = parsed.data;
      }
    } catch(_) {}

    let todayFixtures  = [];
    let nextFixtures   = cachedNext || [];
    let yestFixtures   = cachedYest || [];

    // Consultar api-football solo lo que necesita refresh
    const requests = [];
    if (needsToday) {
      requests.push(
        this._af(`/fixtures?league=${AF_FRIENDLIES_ID}&date=${todayStr}`),
        this._af(`/fixtures?league=${AF_WORLD_CUP_ID}&season=${AF_SEASON_2026}&date=${todayStr}`)
      );
    }
    if (needsNext && !cachedNext) {
      requests.push(
        this._af(`/fixtures?league=${AF_WORLD_CUP_ID}&season=${AF_SEASON_2026}&status=NS&next=20`),
        this._af(`/fixtures?league=${AF_FRIENDLIES_ID}&status=NS&next=20`)
      );
    }
    if (needsYest && !cachedYest) {
      requests.push(
        this._af(`/fixtures?league=${AF_FRIENDLIES_ID}&date=${yestStr}`),
        this._af(`/fixtures?league=${AF_WORLD_CUP_ID}&season=${AF_SEASON_2026}&date=${yestStr}`)
      );
    }

    const results = requests.length > 0
      ? await Promise.allSettled(requests)
      : [];

    let rIdx = 0;
    if (needsToday) {
      const rFriendlyToday = results[rIdx++];
      const rWCtoday       = results[rIdx++];
      const ftd = rFriendlyToday.status === 'fulfilled' ? (rFriendlyToday.value?.response || []) : [];
      const wtd = rWCtoday.status       === 'fulfilled' ? (rWCtoday.value?.response       || []) : [];
      todayFixtures = [...ftd, ...wtd];
      if (todayFixtures.length > 0) {
        localStorage.setItem(AF_TODAY_KEY, String(Date.now()));
        try {
          localStorage.setItem('wcc_cache_upcoming_today', JSON.stringify({ data: todayFixtures, ts: Date.now() }));
        } catch(_) {}
      } else {
        // Si la API no devolvió nada hoy, intentar leer caché corta anterior
        try {
          const raw = localStorage.getItem('wcc_cache_upcoming_today');
          if (raw) {
            const parsed = JSON.parse(raw);
            todayFixtures = parsed.data || [];
          }
        } catch(_) {}
      }
    } else {
      // Leer caché corta de "hoy"
      try {
        const raw = localStorage.getItem('wcc_cache_upcoming_today');
        if (raw) {
          const parsed = JSON.parse(raw);
          todayFixtures = parsed.data || [];
        }
      } catch(_) {}
    }

    if (needsNext && !cachedNext) {
      const rWCnext       = results[rIdx++];
      const rFriendlyNext = results[rIdx++];
      const wn = rWCnext.status       === 'fulfilled' ? (rWCnext.value?.response       || []) : [];
      const fn = rFriendlyNext.status === 'fulfilled' ? (rFriendlyNext.value?.response || []) : [];
      nextFixtures = [...wn, ...fn];
      if (nextFixtures.length > 0) {
        localStorage.setItem(AF_NEXT_KEY, String(Date.now()));
        try {
          localStorage.setItem('wcc_cache_upcoming_next', JSON.stringify({ data: nextFixtures, ts: Date.now() }));
        } catch(_) {}
      }
    }

    if (needsYest && !cachedYest) {
      const rFriendlyYest = results[rIdx++];
      const rWCyest       = results[rIdx++];
      const fy = rFriendlyYest?.status === 'fulfilled' ? (rFriendlyYest.value?.response || []) : [];
      const wy = rWCyest?.status       === 'fulfilled' ? (rWCyest.value?.response       || []) : [];
      yestFixtures = [...fy, ...wy];
      if (yestFixtures.length > 0) {
        localStorage.setItem(AF_YEST_KEY, String(Date.now()));
        try {
          localStorage.setItem('wcc_cache_upcoming_yest', JSON.stringify({ data: yestFixtures, ts: Date.now(), yestStr }));
        } catch(_) {}
      }
    }

    // Combinar y deduplicar por fixture id
    const seen = new Set();
    const allFixtures = [...yestFixtures, ...todayFixtures, ...nextFixtures].filter(f => {
      if (!f?.fixture?.id) return false;
      if (seen.has(f.fixture.id)) return false;
      seen.add(f.fixture.id);
      return true;
    });

    if (allFixtures.length > 0) {
      const data = allFixtures
        .map(_afMap)
        .filter(m => {
          // Mostrar: partidos de AYER finalizados (con marcador) + HOY (cualquier status) + próximos (no finished)
          if (m.date === yestStr  && m.status === 'finished') return true;
          if (m.date === todayStr) return true;
          if (m.date > todayStr && m.status !== 'finished') return true;
          return false;
        })
        .filter(m => m.date <= limitStr) // no más de 14 días adelante
        .sort((a, b) => {
          // En vivo primero, luego por fecha+hora
          if (a.status === 'live' && b.status !== 'live') return -1;
          if (b.status === 'live' && a.status !== 'live') return  1;
          return ((a.date||'')+(a.time||'')) < ((b.date||'')+(b.time||'')) ? -1 : 1;
        });

      if (data.length > 0) {
        this._lsSet('upcoming', data);
        return this._memSet('upcoming', data);
      }
    }

    /* ── CAPA 2: MOCK fallback — solo si api-football falla totalmente ──
       Estado calculado dinámicamente por hora (no hardcodeado).
       Nunca muestra partidos de días anteriores.
    ──────────────────────────────────────────────────────────────────── */
    console.warn('[API] Usando MOCK como fallback para upcoming');
    API_STATUS.usingMock = true;
    const yesterdayLocal = yesterdayStr();
    const allMock = [...MOCK.friendlyMatches, ...MOCK.upcomingMatches]
      .filter(m => {
        const d = m.date || '';
        // Incluir ayer (si está finished con marcador) + hoy + futuro
        if (d === yesterdayLocal && m.scoreHome !== null && m.scoreAway !== null) return true;
        return d === todayStr || d > todayStr;
      })
      .map(m => {
        const dynStatus = _mockStatus(m.date, m.time, m.scoreHome, m.scoreAway);
        return {
          ...m,
          status:    dynStatus,
          scoreHome: dynStatus !== 'scheduled' ? (m.scoreHome ?? null) : null,
          scoreAway: dynStatus !== 'scheduled' ? (m.scoreAway ?? null) : null,
        };
      })
      .sort((a, b) => {
        if (a.status === 'live' && b.status !== 'live') return -1;
        if (b.status === 'live' && a.status !== 'live') return  1;
        return ((a.date||'')+(a.time||'')) < ((b.date||'')+(b.time||'')) ? -1 : 1;
      });
    return this._memSet('upcoming', allMock);
  },


  async getStandings() {
    const mem = this._memGet('standings');
    if (mem) return mem;
    const lsCached = this._lsGet('standings');
    if (lsCached) return this._memSet('standings', lsCached);
    const cached = await DB.getCacheStats('standings');
    if (cached) return this._memSet('standings', cached);

    // api-football standings — con cooldown de 12h para ahorrar cuota
    const AF_ST_LS_KEY = 'wcc_af_standings_ts';
    const AF_ST_COOL   = 12 * 60 * 60 * 1000;
    const lastAfSt     = parseInt(localStorage.getItem(AF_ST_LS_KEY) || '0');
    const af = (Date.now() - lastAfSt > AF_ST_COOL)
      ? await this._af(`/standings?league=${AF_WORLD_CUP_ID}&season=${AF_SEASON_2026}`)
      : null;
    if (af) localStorage.setItem(AF_ST_LS_KEY, String(Date.now()));
    if (af?.response?.[0]?.league?.standings?.length > 0) {
      const rows = [];
      af.response[0].league.standings.forEach(group => {
        group.forEach(t => {
          rows.push({
            pos:   t.rank,
            team:  t.team.name,
            flag:  getFlag(t.team.name),
            group: t.group || '',
            pj:    t.all.played,
            w:     t.all.win, d:t.all.draw, l:t.all.lose,
            gf:    t.all.goals.for, gc:t.all.goals.against,
            pts:   t.points
          });
        });
      });
      if (rows.length > 0) {
        await DB.setCacheStats('standings', rows);
        this._lsSet('standings', rows);
        return this._memSet('standings', rows);
      }
    }

    // fallback football-data
    const fd = await this._fd('/competitions/2000/standings');
    if (fd?.standings?.length > 0) {
      const rows = [];
      fd.standings.forEach(g => {
        (g.table||[]).forEach((r,i) => rows.push({
          pos:r.position||(i+1), team:r.team.shortName||r.team.name,
          flag:getFlag(r.team.name), group:g.group||'',
          pj:r.playedGames, w:r.won, d:r.draw, l:r.lost,
          gf:r.goalsFor, gc:r.goalsAgainst, pts:r.points
        }));
      });
      if (rows.length) {
        await DB.setCacheStats('standings', rows);
        this._lsSet('standings', rows);
        return this._memSet('standings', rows);
      }
    }

    return this._memSet('standings', MOCK.standings);
  },

  /* ══════════════════════════════════════════
     EQUIPOS — NUNCA usa caché, siempre fresco
  ══════════════════════════════════════════ */
  _teamsCache: null,   // BUG FIX: caché para no re-llamar API externa en cada cambio de tab
  _memCache: {},       // Caché en memoria (vive mientras la página no recarga)

  /* TTLs diferenciados por tipo de dato */
  _TTL: {
    live:      2   * 60 * 1000,      // 2 minutos
    upcoming:  30  * 60 * 1000,      // 30 minutos (se re-consulta scores del día)
    standings: 12  * 60 * 60 * 1000, // 12 horas
    scorers:   12  * 60 * 60 * 1000, // 12 horas
    finished:  12  * 60 * 60 * 1000, // 12 horas
    default:   15  * 60 * 1000       // 15 minutos
  },

  _ttlFor(key) {
    if (key.startsWith('live'))      return this._TTL.live;
    if (key.startsWith('upcoming'))  return this._TTL.upcoming;
    if (key.startsWith('standings')) return this._TTL.standings;
    if (key.startsWith('scorers'))   return this._TTL.scorers;
    if (key.startsWith('finished'))  return this._TTL.finished;
    return this._TTL.default;
  },

  _memGet(key) {
    const entry = this._memCache[key];
    if (!entry) return null;
    if (Date.now() - entry.ts > this._ttlFor(key)) { delete this._memCache[key]; return null; }
    return entry.data;
  },
  _memSet(key, data) {
    this._memCache[key] = { data, ts: Date.now() };
    return data;
  },

  /* ── LocalStorage cache helpers (persiste entre recargas) ── */
  _lsGet(key) {
    try {
      const raw = localStorage.getItem(`wcc_cache_${key}`);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts > this._ttlFor(key)) {
        localStorage.removeItem(`wcc_cache_${key}`);
        return null;
      }
      return data;
    } catch(_) { return null; }
  },
  _lsSet(key, data) {
    try {
      localStorage.setItem(`wcc_cache_${key}`, JSON.stringify({ data, ts: Date.now() }));
    } catch(_) {}
    return data;
  },

  /* ── Page Visibility API — pausa timers cuando la pestaña está oculta ── */
  _pausedTimers: [],
  pauseWhenHidden() {
    if (this._visibilityBound) return;
    this._visibilityBound = true;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pausar todos los timers registrados
        this._pausedTimers.forEach(t => { if (t.id) { clearInterval(t.id); t.id = null; } });
      } else {
        // Reanudar timers — dispara inmediatamente y luego en intervalo
        this._pausedTimers.forEach(t => {
          if (!t.id) {
            t.fn();  // actualizar al volver
            t.id = setInterval(t.fn, t.ms);
          }
        });
      }
    });
  },
  registerTimer(fn, ms) {
    const entry = { fn, ms, id: setInterval(fn, ms) };
    this._pausedTimers.push(entry);
    this.pauseWhenHidden();
    return entry;
  },

  async getTeams(query = '') {
    // BUG FIX: cachear en memoria para evitar que IDs cambien entre renders
    if (!this._teamsCache) {
      const af = await this._af(`/teams?league=${AF_WORLD_CUP_ID}&season=${AF_SEASON_2026}`);
      let data = MOCK.teams;
      if (af?.response?.length > 0) {
        const apiTeams = af.response.map((t) => ({
          id:    `af_${t.team.id}`,
          name:  t.team.name,
          flag:  getFlag(t.team.name),
          group: '',
          pj:0, w:0, d:0, l:0, gf:0, gc:0, pts:0
        }));
        const apiNames = new Set(apiTeams.map(t => t.name.toLowerCase()));
        const extra    = MOCK.teams.filter(t => !apiNames.has(t.name.toLowerCase()));
        data = [...apiTeams, ...extra];
      }
      this._teamsCache = data;
    }
    const data = this._teamsCache;
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter(t => t.name.toLowerCase().includes(q));
  },

  /* ══════════════════════════════════════════
     JUGADORES — api-football + mock
  ══════════════════════════════════════════ */
  async getPlayers(query = '') {
    // No cachear: combinar mock siempre disponible
    const data = MOCK.players;

    // Intentar obtener datos reales de goles desde api-football (top scorers)
    try {
      const af = await this._af(`/players/topscorers?league=${AF_WORLD_CUP_ID}&season=${AF_SEASON_2026}`);
      if (af?.response?.length > 0) {
        af.response.forEach(p => {
          const existing = data.find(x =>
            x.name.toLowerCase().includes(p.player.name.toLowerCase().split(' ')[0].toLowerCase())
          );
          if (existing) {
            existing.goals   = p.statistics[0]?.goals?.total || existing.goals;
            existing.assists = p.statistics[0]?.goals?.assists || existing.assists;
          }
        });
      }
    } catch(_) {}

    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.team.toLowerCase().includes(q) ||
      p.pos.toLowerCase().includes(q)
    );
  },

  async getTopScorers() {
    const players = await this.getPlayers('');
    return players.slice().sort((a,b) => b.goals - a.goals || b.assists - a.assists);
  },

  async getFinishedMatches() {
    const mem = this._memGet('finished');
    if (mem) return mem;

    const AF_FIN_LS_KEY = 'wcc_af_finished_ts';
    const AF_FIN_COOL   = 30 * 60 * 1000;  // 30 min (antes era 12h — muy lento para ver resultados)
    const lastAfFin     = parseInt(localStorage.getItem(AF_FIN_LS_KEY) || '0');
    const todayStr      = localDateStr();
    const yestStr       = yesterdayStr();

    if (Date.now() - lastAfFin > AF_FIN_COOL) {
      // Buscar partidos finalizados: Mundial FT + amistosos de hoy + ayer
      const [afWC, afFriendlyToday, afFriendlyYest] = await Promise.allSettled([
        this._af(`/fixtures?league=${AF_WORLD_CUP_ID}&season=${AF_SEASON_2026}&status=FT`),
        this._af(`/fixtures?league=${AF_FRIENDLIES_ID}&date=${todayStr}&status=FT`),
        this._af(`/fixtures?league=${AF_FRIENDLIES_ID}&date=${yestStr}&status=FT`)
      ]);
      const wcFix   = afWC.status === 'fulfilled'            ? (afWC.value?.response || []) : [];
      const friTod  = afFriendlyToday.status === 'fulfilled' ? (afFriendlyToday.value?.response || []) : [];
      const friYest = afFriendlyYest.status === 'fulfilled'  ? (afFriendlyYest.value?.response || []) : [];
      const combined = [...wcFix, ...friTod, ...friYest];
      if (combined.length > 0) {
        localStorage.setItem(AF_FIN_LS_KEY, String(Date.now()));
        const seen = new Set();
        const allFinished = combined
          .filter(f => { if (seen.has(f.fixture.id)) return false; seen.add(f.fixture.id); return true; })
          .map(f => {
            const h = f.goals.home ?? 0, a = f.goals.away ?? 0;
            return {
              id:          `af_${f.fixture.id}`,
              home:        f.teams.home.name,
              away:        f.teams.away.name,
              homeFlag:    getFlag(f.teams.home.name),
              awayFlag:    getFlag(f.teams.away.name),
              scoreHome:   h,
              scoreAway:   a,
              exactScore:  `${h}-${a}`,
              finalResult: h > a ? 'home' : a > h ? 'away' : 'draw',
              date:        f.fixture.date?.split('T')[0],
              status:      'finished',
              competition: f.league?.name || '',
              type:        f.league?.id === AF_WORLD_CUP_ID ? 'worldcup' : 'friendly'
            };
          });
        try { localStorage.setItem('wcc_cache_finished', JSON.stringify({ data: allFinished, ts: Date.now() })); } catch(_) {}
        await DB.setCacheStats('finished', allFinished);
        return this._memSet('finished', allFinished);
      }
    }

    // Leer caché de localStorage si existe
    try {
      const raw = localStorage.getItem('wcc_cache_finished');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.ts < 60 * 60 * 1000) return this._memSet('finished', parsed.data);
      }
    } catch(_) {}

    // Fallback: IndexedDB
    const cached = await DB.getCacheStats('finished');
    if (cached?.length) return this._memSet('finished', cached);

    // Último recurso: MOCK con resultados conocidos del MOCK.friendlyMatches
    const mockFinished = MOCK.friendlyMatches
      .filter(m => m.scoreHome !== null && m.scoreAway !== null)
      .map(m => ({
        ...m,
        exactScore:  `${m.scoreHome}-${m.scoreAway}`,
        finalResult: m.scoreHome > m.scoreAway ? 'home' : m.scoreAway > m.scoreHome ? 'away' : 'draw',
        status:      'finished'
      }));
    return this._memSet('finished', mockFinished.length ? mockFinished : MOCK.finishedMatches);
  },

  /**
   * getMatchState(match) — estado dinámico según hora actual
   * Returns: 'upcoming' | 'starting_soon' | 'live' | 'finished' | 'closed'
   */
  getMatchState(m) {
    // Estado explícito tiene prioridad
    if (m.status === 'live')     return 'live';
    if (m.status === 'finished') return 'finished';

    if (!m.date || !m.time) return 'upcoming';

    // Los horarios del MOCK están en UTC → parsear con 'Z' para evitar bugs de zona horaria
    // (sin Z, Date lo interpreta como hora local, dando +6h de error en UTC-6)
    const matchTs = new Date(`${m.date}T${m.time}:00Z`).getTime();
    const diffMs  = matchTs - Date.now();
    const diffMin = -diffMs / 60000; // minutos transcurridos desde el inicio (positivo = ya empezó)

    if (diffMin > 115) return 'finished';      // pasaron más de 115 min (~90+25) → terminó
    if (diffMin > 0)   return 'live';           // empezó hace menos de 115 min → en curso estimado
    if (diffMin > -60) return 'starting_soon';  // por comenzar (≤1h)
    if (diffMin > -180) return 'closed';        // predicciones cerradas (≤3h antes)
    return 'upcoming';
  },

  /**
   * getTimeUntilMatch(match) — tiempo legible hasta el inicio
   */
  getTimeUntilMatch(m) {
    if (!m.date || !m.time) return '';
    const diffMs = new Date(`${m.date}T${m.time}:00`).getTime() - Date.now();
    if (diffMs <= 0) return '';
    const h = Math.floor(diffMs / 3600000);
    const min = Math.floor((diffMs % 3600000) / 60000);
    if (h >= 24) {
      const d = Math.floor(h / 24);
      return `En ${d}d ${h % 24}h`;
    }
    if (h > 0) return `En ${h}h ${min}m`;
    return `En ${min}m`;
  },

  async getPredictableMatches() {
    const todayStr = localDateStr();
    const yestStr  = yesterdayStr();

    /* Obtener partidos reales de la API (ya incluye ayer, hoy y próximos) */
    let realMatches = [];
    try {
      const all = await this.getUpcomingMatches();
      if (all && all.length > 0) realMatches = all;
    } catch(_) {}

    /* Obtener partidos terminados (con scores reales) para enriquecer los datos */
    let finishedData = [];
    try {
      const fin = await this.getFinishedMatches();
      if (fin?.length) finishedData = fin;
    } catch(_) {}

    /* Si tenemos datos reales, usarlos — si no, MOCK fallback */
    let source = realMatches.length > 0 ? realMatches : MOCK.predictableMatches;

    // Enriquecer con scores de finishedData cuando el partido esté como 'finished'
    // pero sin score (porque venía del MOCK o de una petición anterior sin FT)
    if (finishedData.length > 0) {
      source = source.map(m => {
        if (m.status === 'finished' && m.scoreHome === null) {
          // Buscar por id exacto o por nombre de equipos
          const fin = finishedData.find(f =>
            f.id === m.id ||
            (f.home === m.home && f.away === m.away)
          );
          if (fin) return { ...m, scoreHome: fin.scoreHome, scoreAway: fin.scoreAway };
        }
        return m;
      });
    }

    return source
      .filter(m => {
        const d = m.date || '';
        // Incluir: partidos de ayer (con resultado para mostrar score) + hoy + futuros
        if (d === yestStr) return true;          // ayer: visible con resultado final
        if (d < yestStr)   return false;         // antes de ayer: fuera
        return true;
      })
      .sort((a, b) => {
        // Primero los de hoy/ayer (con resultados), luego los futuros
        const ta = new Date(`${a.date}T${a.time||'23:59'}:00`).getTime();
        const tb = new Date(`${b.date}T${b.time||'23:59'}:00`).getTime();
        return ta - tb;
      });
  },

  /* ══════════════════════════════════════════════════════════════════
     FOTOS v11 — TheSportsDB como fuente principal
       FLUJO: memCache → localStorage(v3) → IndexedDB → TheSportsDB
       _PHOTO_MAP eliminado del flujo principal: se mantiene solo como
       último fallback para evitar romper código que lo referencie.
       MIGRACIÓN: wcc_photos_v1 y wcc_photos_v2 se invalidan porque
       pueden contener URLs de Wikipedia rotas.
  ══════════════════════════════════════════════════════════════════ */

  /* _PHOTO_MAP conservado solo como referencia/fallback de emergencia.
     NO se usa como fuente prioritaria — las URLs de Wikipedia están rotas. */
  _PHOTO_MAP: {},

  /* Caché en memoria (runtime) — evita consultas duplicadas en la misma sesión */
  _photoMemCache: {},

  /* Clave de localStorage v3 — intencionalmente diferente de v1/v2 para
     forzar migración limpia y descartar URLs de Wikipedia obsoletas */
  _LS_PHOTO_KEY: 'wcc_photos_v3',

  /* Ejecutar una sola vez al iniciar: limpiar cachés legacy con URLs rotas */
  _migrateLegacyPhotoCache() {
    try {
      // v1 y v2 pueden tener URLs de Wikipedia obsoletas → eliminar
      if (localStorage.getItem('wcc_photos_v1')) localStorage.removeItem('wcc_photos_v1');
      if (localStorage.getItem('wcc_photos_v2')) localStorage.removeItem('wcc_photos_v2');
    } catch(_) {}
  },

  /* ── localStorage helpers ── */
  _photoStore() {
    try {
      const raw = localStorage.getItem(this._LS_PHOTO_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch(_) { return {}; }
  },

  _photoSave(store) {
    try { localStorage.setItem(this._LS_PHOTO_KEY, JSON.stringify(store)); } catch(_) {}
  },

  /* ── IndexedDB helpers ── */
  async _idbGetPhoto(figId) {
    try {
      const row = await DB.get('photo_cache', figId);
      return row?.url ?? null;
    } catch(_) { return null; }
  },

  async _idbSetPhoto(figId, url) {
    try {
      await DB.put('photo_cache', { id: figId, url, ts: Date.now() });
    } catch(_) {}
  },

  /**
   * getPhotoById — fuente de verdad asíncrona.
   * FLUJO CORREGIDO (v11):
   *   1. memCache       → instantáneo, misma sesión
   *   2. localStorage   → sync, persiste entre sesiones (solo v3, sin Wikipedia)
   *   3. IndexedDB      → async, más robusto
   *   4. TheSportsDB    → red, fuente principal de imágenes reales
   * _PHOTO_MAP ya NO es fuente prioritaria.
   */
  async getPhotoById(figId, sdbName) {
    // 1. Caché en memoria (más rápido)
    if (this._photoMemCache[figId] !== undefined) {
      return this._photoMemCache[figId];
    }

    // 2. localStorage v3 (solo contiene URLs de TheSportsDB, no de Wikipedia)
    const ls = this._photoStore();
    if (ls[figId] !== undefined) {
      this._photoMemCache[figId] = ls[figId];
      return ls[figId];
    }

    // 3. IndexedDB
    const idbUrl = await this._idbGetPhoto(figId);
    if (idbUrl !== null) {
      this._photoMemCache[figId] = idbUrl;
      ls[figId] = idbUrl;
      this._photoSave(ls);
      return idbUrl;
    }

    // 4. TheSportsDB — fuente principal de fotos reales
    const url = await this.getPlayerPhoto(sdbName);
    if (url) {
      this._photoMemCache[figId] = url;
      ls[figId] = url;
      this._photoSave(ls);
      this._idbSetPhoto(figId, url); // async, sin bloquear
    }
    return url || null;
  },

  /**
   * getPlayerPhoto — consulta TheSportsDB por nombre.
   * Prioriza strCutout (recorte sin fondo) sobre strThumb.
   * Match exacto primero; match parcial como fallback seguro.
   * NO usa players[0] a ciegas para evitar fotos incorrectas.
   * Fallback: Wikimedia Commons / Wikipedia si TheSportsDB no tiene foto.
   */
  async getPlayerPhoto(playerName) {
    try {
      // Fuente 1: TheSportsDB
      const data = await this._sdb(`/searchplayers.php?p=${encodeURIComponent(playerName)}`);
      const players = data?.player;
      if (players?.length) {
        const nameLower = playerName.toLowerCase();
        const exact = players.find(p => p.strPlayer?.toLowerCase() === nameLower);
        const partial = !exact && players.find(p => {
          const pn = p.strPlayer?.toLowerCase() || '';
          return pn.includes(nameLower) || nameLower.includes(pn.split(' ')[0]);
        });
        const p = exact || partial || null;
        const url = p?.strCutout || p?.strThumb || p?.strFanart1 || null;
        if (url) return url;
      }
    } catch(_) {}

    // Fuente 2: Wikipedia REST API (sin CORS issues, imagen principal del artículo)
    try {
      const wikiName = playerName.replace(/ /g, '_');
      const res = await this._fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiName)}`
      );
      const thumb = res?.thumbnail?.source || res?.originalimage?.source || null;
      if (thumb) return thumb;
    } catch(_) {}

    return null;
  },

  /**
   * getPhotoSync — helper síncrono para renders inmediatos.
   * FLUJO CORREGIDO (v11): NO consulta _PHOTO_MAP (URLs rotas).
   *   1. memCache   → runtime de la sesión actual
   *   2. localStorage v3 → URLs de TheSportsDB persistidas
   * Si nada → null (el render mostrará emoji; getPhotoById se llama en bg).
   */
  getPhotoSync(fig) {
    if (!fig) return null;
    // 1 — memoria runtime (URLs de TheSportsDB, cargadas esta sesión)
    const fromMem = this._photoMemCache[fig.id];
    if (fromMem) return fromMem;
    // 2 — localStorage v3 (solo URLs de TheSportsDB, no Wikipedia)
    try {
      const ls = this._photoStore();
      return ls[fig.id] || null;
    } catch(_) { return null; }
  },

  /**
   * getPlayerPhotosCached — compatibilidad con código antiguo.
   * Ahora consulta TheSportsDB directamente sin pasar por _PHOTO_MAP.
   */
  async getPlayerPhotosCached(playerName) {
    const nameKey = 'n_' + playerName;
    // Buscar en memoria
    if (this._photoMemCache[nameKey] !== undefined) return this._photoMemCache[nameKey];
    // Buscar en localStorage v3
    const ls = this._photoStore();
    if (ls[nameKey] !== undefined) {
      this._photoMemCache[nameKey] = ls[nameKey];
      return ls[nameKey];
    }
    // Consultar TheSportsDB
    const url = await this.getPlayerPhoto(playerName);
    if (url) {
      this._photoMemCache[nameKey] = url;
      ls[nameKey] = url;
      this._photoSave(ls);
    }
    return url || null;
  },

  /**
   * precachePhotos — precarga inteligente al iniciar la app.
   * Solo consulta la red para figuras sin foto en ningún caché.
   * Máx 5 solicitudes paralelas para no saturar TheSportsDB.
   */
  async precachePhotos(figuritas) {
    if (!figuritas?.length) return;
    // Migrar cachés legacy en el primer uso
    this._migrateLegacyPhotoCache();
    const pool = (typeof Gacha !== 'undefined') ? Gacha.getPool() : [];
    const toFetch = figuritas
      .map(f => pool.find(p => p.id === f.id))
      .filter(fig => fig && !this.getPhotoSync(fig));
    // Fetch en paralelo, máx 5 a la vez
    for (let i = 0; i < toFetch.length; i += 5) {
      await Promise.allSettled(
        toFetch.slice(i, i+5).map(fig => this.getPhotoById(fig.id, fig.sdbName || fig.name))
      );
    }
  },

  /* Limpiar caché de fotos al hacer logout */
  clearPhotoCache() {
    this._teamsCache    = null;
    this._memCache      = {};
    this._photoMemCache = {};
    // NO borrar localStorage v3 ni IndexedDB — las fotos son recursos estáticos
  },

  /* ══════════════════════════════════════════
     PARTIDOS DE UN EQUIPO — v12
     Busca partidos jugados, en vivo y futuros de un equipo específico
     Se usa en el modal de favorito "equipo"
  ══════════════════════════════════════════ */
  async getTeamMatches(teamName) {
    const cacheKey = `team_matches_${teamName}`;
    const mem = this._memGet(cacheKey);
    if (mem) return mem;

    const normalize = s => s?.toLowerCase().replace(/[áàä]/g,'a').replace(/[éèë]/g,'e')
      .replace(/[íìï]/g,'i').replace(/[óòö]/g,'o').replace(/[úùü]/g,'u')
      .replace(/ñ/g,'n').trim() || '';

    const teamNorm = normalize(teamName);

    /* ── Buscar team ID en api-football ── */
    let afTeamId = null;
    try {
      const search = await this._af(`/teams?league=${AF_WORLD_CUP_ID}&season=${AF_SEASON_2026}`);
      if (search?.response?.length) {
        const match = search.response.find(t =>
          normalize(t.team.name) === teamNorm ||
          normalize(t.team.name).includes(teamNorm) ||
          teamNorm.includes(normalize(t.team.name))
        );
        if (match) afTeamId = match.team.id;
      }
    } catch(_) {}

    const played = [];
    const upcoming = [];

    /* ── api-football: si encontramos el equipo ── */
    if (afTeamId) {
      const [afFT, afNS, afLive] = await Promise.all([
        this._af(`/fixtures?team=${afTeamId}&season=${AF_SEASON_2026}&status=FT&last=10`),
        this._af(`/fixtures?team=${afTeamId}&season=${AF_SEASON_2026}&status=NS&next=5`),
        this._af(`/fixtures?team=${afTeamId}&season=${AF_SEASON_2026}&live=all`)
      ]);

      const mapFix = (f, status) => ({
        id:          `af_${f.fixture.id}`,
        home:        f.teams.home.name,
        away:        f.teams.away.name,
        homeFlag:    getFlag(f.teams.home.name),
        awayFlag:    getFlag(f.teams.away.name),
        scoreHome:   f.goals.home ?? null,
        scoreAway:   f.goals.away ?? null,
        date:        f.fixture.date?.split('T')[0],
        time:        f.fixture.date?.split('T')[1]?.substring(0,5),
        competition: f.league?.round || f.league?.name || 'Internacional',
        venue:       f.fixture.venue?.name || '',
        minute:      f.fixture.status?.elapsed || null,
        status,
        type:        f.league?.id === AF_WORLD_CUP_ID ? 'worldcup' : 'friendly'
      });

      (afFT?.response  || []).forEach(f => played.push(mapFix(f, 'finished')));
      (afLive?.response|| []).forEach(f => played.unshift(mapFix(f, 'live')));
      (afNS?.response  || []).forEach(f => upcoming.push(mapFix(f, 'upcoming')));

      if (played.length > 0 || upcoming.length > 0) {
        const result = { played, upcoming };
        this._memSet(cacheKey, result);
        return result;
      }
    }

    /* ── Fallback: filtrar MOCK por nombre de equipo ── */
    const todayStr2 = localDateStr();
    const allMock = [
      // Partidos terminados reales con scores
      ...(MOCK.finishedFriendlies||[]).map(m=>({...m,status:'finished'})),
      // Amistosos de mock: los pasados como finished, los de hoy/futuro como upcoming
      ...MOCK.friendlyMatches.map(m=>({
        ...m,
        status: (m.date < todayStr2) ? 'finished' : (m.date === todayStr2 ? 'live_today' : 'upcoming')
      })),
      ...MOCK.upcomingMatches.map(m=>({...m,status:'upcoming'}))
    ];

    const filterTeam = m =>
      normalize(m.home).includes(teamNorm) || teamNorm.includes(normalize(m.home)) ||
      normalize(m.away).includes(teamNorm) || teamNorm.includes(normalize(m.away));

    const mockPlayed   = allMock.filter(m => m.status==='finished' && filterTeam(m));
    const mockUpcoming = allMock.filter(m => m.status==='upcoming'  && filterTeam(m));

    const result = { played: mockPlayed, upcoming: mockUpcoming };
    this._memSet(cacheKey, result);
    return result;
  },

  /* ══════════════════════════════════════════
     FORCE REFRESH
  ══════════════════════════════════════════ */
  async forceRefresh() {
    await DB.clear('stats_cache');
    this._memCache = {};
    // Limpiar todas las cachés para forzar re-consulta a api-football
    localStorage.removeItem('wcc_af_today_ts');
    localStorage.removeItem('wcc_af_next_ts');
    localStorage.removeItem('wcc_af_yest_ts');
    localStorage.removeItem('wcc_af_finished_ts');
    localStorage.removeItem('wcc_cache_upcoming_today');
    localStorage.removeItem('wcc_cache_upcoming_next');
    localStorage.removeItem('wcc_cache_upcoming_yest');
    localStorage.removeItem('wcc_cache_upcoming');
    localStorage.removeItem('wcc_cache_finished');

    // Intentar hacer las requests; detectar si hubo conexión real
    let apiConnected = false;
    let apiError = null;

    try {
      const [live, upcoming, standings, finished] = await Promise.all([
        this.getLiveMatches(),
        this.getUpcomingMatches(),
        this.getStandings(),
        this.getFinishedMatches()
      ]);

      apiConnected = live?.some?.(m => m.id?.startsWith?.('af_'))
                  || upcoming?.some?.(m => m.id?.startsWith?.('af_'))
                  || finished?.some?.(m => m.id?.startsWith?.('af_'))
                  || standings?.some?.(t => t._fromApi);

      // Si no hay error registrado y la API devolvió algo → conectado
      if (!API_STATUS.lastError && (
        live?.some?.(m => m.id?.startsWith?.('af_')) ||
        upcoming?.some?.(m => m.id?.startsWith?.('af_')) ||
        finished?.some?.(m => m.id?.startsWith?.('af_'))
      )) {
        apiConnected = true;
        API_STATUS.lastSuccess = Date.now();
      }

      const usingMock = !apiConnected;
      API_STATUS.usingMock = usingMock;

      let source;
      if (API_STATUS.lastError === 'hourly_limit') {
        source = 'hourly_limit';
      } else if (API_STATUS.lastError === 'rate_limit') {
        source = 'rate_limit';
      } else if (API_STATUS.lastError === 'auth') {
        source = 'auth_error';
      } else if (API_STATUS.lastError === 'network') {
        source = 'network_error';
      } else if (apiConnected) {
        source = 'API Football';
      } else {
        source = 'mock';
      }

      return { live, upcoming, standings, finished, source };
    } catch(err) {
      API_STATUS.lastError = 'network';
      API_STATUS.usingMock = true;
      return { live: [], upcoming: [], standings: [], finished: [], source: 'network_error' };
    }
  },

  getCrest(name) { return `https://flagcdn.com/w80/${TEAM_FLAGS[name]?'':'xx'}.png`; },
  getFlag(name)  { return getFlag(name); },
  getApiStatus() {
    return {
      apiFootball:  { enabled: API_CONFIG.apiFootball.enabled,  hasKey: !!API_CONFIG.apiFootball.key },
      footballData: { enabled: API_CONFIG.footballData.enabled, hasKey: !!API_CONFIG.footballData.key },
      sportsDB:     { enabled: API_CONFIG.sportsDB.enabled,     hasKey: true }
    };
  }
};
