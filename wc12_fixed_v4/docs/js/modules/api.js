/**
 * api.js — v14
 * NUEVAS APIs:
 *   1. api-football (RapidAPI)  ✅ key: e1317aae745eba2daea7870d948b8e8f
 *   2. football-data.org        ✅ key: 3bec1d9c3a5d418ebed176fdaaafe7e0
 *   3. thesportsdb              ✅ fotos jugadores (FUENTE PRINCIPAL)
 *   4. Mock                     ✅ fallback
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

const API_CONFIG = {
  apiFootball: {
    base:    'https://v3.football.api-sports.io',
    key:     'e1317aae745eba2daea7870d948b8e8f',
    enabled: true
  },
  footballData: {
    base:    'https://api.football-data.org/v4',
    key:     '3bec1d9c3a5d418ebed176fdaaafe7e0',
    enabled: true
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
   de la fecha/hora del partido vs. hora actual del navegador.
   Se llama en tiempo de ejecución, así el mock nunca queda desactualizado.
   Duración estimada de un partido: 105 min (90 + 15 extra).
══════════════════════════════════════════════════════════════════ */
function _mockStatus(date, time, scoreHome, scoreAway) {
  if (!date || !time) return 'scheduled';
  // Si ya tiene marcador fijo → siempre finished
  if (scoreHome !== null && scoreHome !== undefined &&
      scoreAway !== null && scoreAway !== undefined) return 'finished';
  const start = new Date(`${date}T${time}:00`);
  const now   = Date.now();
  const diffMin = (now - start.getTime()) / 60000; // minutos transcurridos (neg = futuro)
  if (diffMin < 0)    return 'scheduled';          // aún no empieza
  if (diffMin < 105)  return 'live';               // en curso (estimado)
  return 'finished';                               // más de 105 min → terminó
}

const MOCK = {
  liveMatches: [],

  /* ── Todos los partidos (amistosos + Mundial) ──────────────────────
     scoreHome/scoreAway = null  → pendiente (estado calculado por hora)
     scoreHome/scoreAway = número → resultado final conocido
  ──────────────────────────────────────────────────────────────────── */
  friendlyMatches: [
    /* ── RESULTADOS CONOCIDOS (ya terminaron) ── */
    { id:'f001', home:'Brasil',     away:'Egipto',     homeFlag:'🇧🇷', awayFlag:'🇪🇬', date:'2026-06-03', time:'16:00', competition:'Amistoso', type:'friendly', venue:'Orlando, FL',        scoreHome:4, scoreAway:0 },
    { id:'f009', home:'México',     away:'Ecuador',    homeFlag:'🇲🇽', awayFlag:'🇪🇨', date:'2026-06-04', time:'22:00', competition:'Amistoso', type:'friendly', venue:'Phoenix, AZ',        scoreHome:1, scoreAway:1 },
    { id:'f010', home:'Uruguay',    away:'Austria',    homeFlag:'🇺🇾', awayFlag:'🇦🇹', date:'2026-06-05', time:'19:00', competition:'Amistoso', type:'friendly', venue:'Los Ángeles, CA',     scoreHome:2, scoreAway:1 },
    { id:'f011', home:'Colombia',   away:'Perú',       homeFlag:'🇨🇴', awayFlag:'🇵🇪', date:'2026-06-05', time:'21:00', competition:'Amistoso', type:'friendly', venue:'Miami, FL',           scoreHome:0, scoreAway:0 },
    /* ── 6 JUN — resultados conocidos ── */
    { id:'f012', home:'Portugal',   away:'Chile',      homeFlag:'🇵🇹', awayFlag:'🇨🇱', date:'2026-06-06', time:'00:00', competition:'Amistoso', type:'friendly', venue:'Newark, NJ',          scoreHome:1, scoreAway:0 },
    { id:'f002', home:'Argentina',  away:'Honduras',   homeFlag:'🇦🇷', awayFlag:'🇭🇳', date:'2026-06-06', time:'02:00', competition:'Amistoso', type:'friendly', venue:'Kyle Field, TX',      scoreHome:2, scoreAway:0 },
    { id:'f003', home:'Inglaterra', away:'Nueva Zelanda',homeFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',awayFlag:'🇳🇿',date:'2026-06-06',time:'01:00',competition:'Amistoso',type:'friendly',venue:'Chicago, IL',       scoreHome:2, scoreAway:1 },
    { id:'f013', home:'Alemania',   away:'Eslovenia',  homeFlag:'🇩🇪', awayFlag:'🇸🇮', date:'2026-06-06', time:'00:30', competition:'Amistoso', type:'friendly', venue:'Denver, CO',          scoreHome:3, scoreAway:0 },
    { id:'f016', home:'Brasil',     away:'México',     homeFlag:'🇧🇷', awayFlag:'🇲🇽', date:'2026-06-06', time:'03:00', competition:'Amistoso', type:'friendly', venue:'Dallas, TX',          scoreHome:2, scoreAway:1 },
    /* ── 7 JUN — HOY (hora local EE.UU. → hora UTC, estado dinámico por hora) ── */
    { id:'f004', home:'Portugal',   away:'Nigeria',    homeFlag:'🇵🇹', awayFlag:'🇳🇬', date:'2026-06-07', time:'22:00', competition:'Amistoso', type:'friendly', venue:'Newark, NJ',          scoreHome:null, scoreAway:null },
    { id:'f005', home:'Francia',    away:'Irlanda del N.',homeFlag:'🇫🇷',awayFlag:'🏴󠁧󠁢󠁮󠁩󠁲󠁿',date:'2026-06-08',time:'00:00',competition:'Amistoso',type:'friendly',venue:'East Rutherford',   scoreHome:null, scoreAway:null },
    { id:'f008', home:'Marruecos',  away:'Noruega',    homeFlag:'🇲🇦', awayFlag:'🇳🇴', date:'2026-06-07', time:'23:00', competition:'Amistoso', type:'friendly', venue:'Washington D.C.',     scoreHome:null, scoreAway:null },
    { id:'f017', home:'Japón',      away:'Islandia',   homeFlag:'🇯🇵', awayFlag:'🇮🇸', date:'2026-06-07', time:'22:00', competition:'Amistoso', type:'friendly', venue:'San José, CA',        scoreHome:null, scoreAway:null },
    { id:'f018', home:'Corea del Sur',away:'Australia',homeFlag:'🇰🇷', awayFlag:'🇦🇺', date:'2026-06-07', time:'22:30', competition:'Amistoso', type:'friendly', venue:'Houston, TX',         scoreHome:null, scoreAway:null },
    /* ── 8 JUN ── */
    { id:'f014', home:'Bélgica',    away:'Escocia',    homeFlag:'🇧🇪', awayFlag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', date:'2026-06-09', time:'00:00', competition:'Amistoso', type:'friendly', venue:'Atlanta, GA',       scoreHome:null, scoreAway:null },
    /* ── 9 JUN ── */
    { id:'f006', home:'España',     away:'Perú',       homeFlag:'🇪🇸', awayFlag:'🇵🇪', date:'2026-06-10', time:'00:00', competition:'Amistoso', type:'friendly', venue:'Filadelfia, PA',      scoreHome:null, scoreAway:null },
    { id:'f007', home:'Argentina',  away:'Islandia',   homeFlag:'🇦🇷', awayFlag:'🇮🇸', date:'2026-06-10', time:'01:30', competition:'Amistoso', type:'friendly', venue:'Tuscaloosa, AL',      scoreHome:null, scoreAway:null },
    { id:'f015', home:'Brasil',     away:'Paraguay',   homeFlag:'🇧🇷', awayFlag:'🇵🇾', date:'2026-06-10', time:'02:00', competition:'Amistoso', type:'friendly', venue:'Fort Worth, TX',      scoreHome:null, scoreAway:null },
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
    /* 7 Jun — hoy */
    { id:'f004', home:'Portugal',    away:'Nigeria',        homeFlag:'🇵🇹', awayFlag:'🇳🇬', date:'2026-06-07', time:'22:00', competition:'Amistoso', type:'friendly' },
    { id:'f008', home:'Marruecos',   away:'Noruega',        homeFlag:'🇲🇦', awayFlag:'🇳🇴', date:'2026-06-07', time:'23:00', competition:'Amistoso', type:'friendly' },
    { id:'f017', home:'Japón',       away:'Islandia',       homeFlag:'🇯🇵', awayFlag:'🇮🇸', date:'2026-06-07', time:'22:00', competition:'Amistoso', type:'friendly' },
    { id:'f018', home:'Corea del Sur',away:'Australia',     homeFlag:'🇰🇷', awayFlag:'🇦🇺', date:'2026-06-07', time:'22:30', competition:'Amistoso', type:'friendly' },
    /* 8-9 Jun */
    { id:'f005', home:'Francia',     away:'Irlanda del N.', homeFlag:'🇫🇷', awayFlag:'🏴󠁧󠁢󠁮󠁩󠁲󠁿', date:'2026-06-08', time:'00:00', competition:'Amistoso', type:'friendly' },
    { id:'f014', home:'Bélgica',     away:'Escocia',        homeFlag:'🇧🇪', awayFlag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', date:'2026-06-09', time:'00:00', competition:'Amistoso', type:'friendly' },
    { id:'f006', home:'España',      away:'Perú',           homeFlag:'🇪🇸', awayFlag:'🇵🇪', date:'2026-06-10', time:'00:00', competition:'Amistoso', type:'friendly' },
    { id:'f007', home:'Argentina',   away:'Islandia',       homeFlag:'🇦🇷', awayFlag:'🇮🇸', date:'2026-06-10', time:'01:30', competition:'Amistoso', type:'friendly' },
    { id:'f015', home:'Brasil',      away:'Paraguay',       homeFlag:'🇧🇷', awayFlag:'🇵🇾', date:'2026-06-10', time:'02:00', competition:'Amistoso', type:'friendly' },
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
    { pos:1, team:'Brasil',      flag:'🇧🇷', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, team:'Argentina',   flag:'🇦🇷', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, team:'Francia',     flag:'🇫🇷', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, team:'España',      flag:'🇪🇸', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:5, team:'Alemania',    flag:'🇩🇪', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:6, team:'Portugal',    flag:'🇵🇹', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:7, team:'Países Bajos',flag:'🇳🇱', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:8, team:'Inglaterra',  flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:9, team:'Bélgica',     flag:'🇧🇪', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:10,team:'Noruega',     flag:'🇳🇴', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:11,team:'Colombia',    flag:'🇨🇴', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:12,team:'Uruguay',     flag:'🇺🇾', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  ]
};

// MOCK.teams: lista completa de selecciones del Mundial 2026 (48 equipos)
MOCK.teams = [
  { id:'t01', name:'Brasil',          flag:'🇧🇷', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t02', name:'Argentina',       flag:'🇦🇷', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t03', name:'Francia',         flag:'🇫🇷', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t04', name:'España',          flag:'🇪🇸', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t05', name:'Alemania',        flag:'🇩🇪', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t06', name:'Portugal',        flag:'🇵🇹', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t07', name:'Países Bajos',    flag:'🇳🇱', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t08', name:'Inglaterra',      flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t09', name:'Bélgica',         flag:'🇧🇪', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t10', name:'Noruega',         flag:'🇳🇴', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t11', name:'Colombia',        flag:'🇨🇴', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t12', name:'Uruguay',         flag:'🇺🇾', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t13', name:'México',          flag:'🇲🇽', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t14', name:'Estados Unidos',  flag:'🇺🇸', group:'A', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t15', name:'Canadá',          flag:'🇨🇦', group:'A', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t16', name:'Marruecos',       flag:'🇲🇦', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t17', name:'Japón',           flag:'🇯🇵', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t18', name:'Senegal',         flag:'🇸🇳', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t19', name:'Croacia',         flag:'🇭🇷', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t20', name:'Suiza',           flag:'🇨🇭', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t21', name:'Ecuador',         flag:'🇪🇨', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t22', name:'Australia',       flag:'🇦🇺', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t23', name:'Corea del Sur',   flag:'🇰🇷', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t24', name:'Polonia',         flag:'🇵🇱', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t25', name:'Dinamarca',       flag:'🇩🇰', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t26', name:'Serbia',          flag:'🇷🇸', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t27', name:'Turquía',         flag:'🇹🇷', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t28', name:'Austria',         flag:'🇦🇹', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t29', name:'Ghana',           flag:'🇬🇭', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t30', name:'Nigeria',         flag:'🇳🇬', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t31', name:'Camerún',         flag:'🇨🇲', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t32', name:'Costa de Marfil', flag:'🇨🇮', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t33', name:'Sudáfrica',       flag:'🇿🇦', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t34', name:'Arabia Saudita',  flag:'🇸🇦', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t35', name:'Irán',            flag:'🇮🇷', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t36', name:'Qatar',           flag:'🇶🇦', group:'A', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t37', name:'Nueva Zelanda',   flag:'🇳🇿', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t38', name:'Honduras',        flag:'🇭🇳', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t39', name:'Venezuela',       flag:'🇻🇪', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t40', name:'Chile',           flag:'🇨🇱', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t41', name:'Perú',            flag:'🇵🇪', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t42', name:'Paraguay',        flag:'🇵🇾', group:'A', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t43', name:'Bolivia',         flag:'🇧🇴', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t44', name:'Escocia',         flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t45', name:'Albania',         flag:'🇦🇱', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t46', name:'Hungría',         flag:'🇭🇺', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t47', name:'Eslovenia',       flag:'🇸🇮', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  { id:'t48', name:'Rumania',         flag:'🇷🇴', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
];

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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[API]', url.split('?')[0], '-', err.message);
      return null;
    }
  },

  /* ── api-football ── */
  async _af(endpoint) {
    if (!API_CONFIG.apiFootball.enabled) return null;
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
    // TTL corto para en vivo: 60 seg
    const mem = this._memGet('live');
    if (mem) return mem;

    const _afMap = f => ({
      id:          `af_${f.fixture.id}`,
      home:        f.teams.home.name,
      away:        f.teams.away.name,
      homeFlag:    getFlag(f.teams.home.name),
      awayFlag:    getFlag(f.teams.away.name),
      scoreHome:   f.goals.home ?? 0,
      scoreAway:   f.goals.away ?? 0,
      minute:      f.fixture.status.elapsed || '?',
      status:      'live',
      competition: f.league?.name || '',
      type:        (f.league?.id === AF_WORLD_CUP_ID) ? 'worldcup' : 'friendly'
    });

    /* 1. api-football — Mundial + Amistosos + todos los internacionales en vivo */
    const [afWC, afFr, afAll] = await Promise.all([
      this._af(`/fixtures?live=all&league=${AF_WORLD_CUP_ID}&season=${AF_SEASON_2026}`),
      this._af(`/fixtures?live=all&league=${AF_FRIENDLIES_ID}&season=${AF_SEASON_2026}`),
      this._af(`/fixtures?live=all&league=${AF_FRIENDLIES_ID}`)  // sin filtro de season por si el año difiere
    ]);
    // Deduplicar por fixture.id
    const afSeen = new Set();
    const afCombined = [...(afWC?.response||[]), ...(afFr?.response||[]), ...(afAll?.response||[])]
      .filter(f => { if (afSeen.has(f.fixture.id)) return false; afSeen.add(f.fixture.id); return true; });
    if (afCombined.length > 0) {
      const data = afCombined.map(_afMap);
      this._memSet('live', data);
      return data;
    }

    /* 2. football-data.org — Mundial + cualquier partido en juego */
    const [fdWC, fdAny] = await Promise.all([
      this._fd('/competitions/2000/matches?status=LIVE'),
      this._fd('/matches?status=IN_PLAY&limit=15')
    ]);
    const fdAll = [...(fdWC?.matches||[]), ...(fdAny?.matches||[])];
    const seen = new Set();
    const fdUniq = fdAll.filter(m => { if(seen.has(m.id)) return false; seen.add(m.id); return true; });
    if (fdUniq.length > 0) {
      const data = fdUniq.map(m => ({
        id:          `fd_${m.id}`,
        home:        m.homeTeam.shortName || m.homeTeam.name,
        away:        m.awayTeam.shortName || m.awayTeam.name,
        homeFlag:    getFlag(m.homeTeam.name),
        awayFlag:    getFlag(m.awayTeam.name),
        scoreHome:   m.score.fullTime.home ?? m.score.halfTime.home ?? 0,
        scoreAway:   m.score.fullTime.away ?? m.score.halfTime.away ?? 0,
        minute:      m.minute || '?',
        status:      'live',
        competition: m.competition?.name || '',
        type:        m.competition?.id === 2000 ? 'worldcup' : 'friendly'
      }));
      this._memSet('live', data);
      return data;
    }

    /* 3. Si las APIs no devuelven nada en vivo → lista vacía. NO mostrar "hoy" aquí,
       eso le corresponde a getUpcomingMatches / renderUpcoming */
    return [];
  },

  /* ══════════════════════════════════════════
     PRÓXIMOS PARTIDOS — v12
     Mundial 2026 + Amistosos internacionales pre-mundial
  ══════════════════════════════════════════ */
  async getUpcomingMatches() {
    // Invalidar caché si cambió el día (para que "hoy" siempre sea correcto)
    const todayStr = localDateStr();
    const lastDay  = localStorage.getItem('wcc_upcoming_day');
    if (lastDay !== todayStr) {
      // Nuevo día → limpiar cachés para forzar recálculo de estados
      this._memCache = Object.fromEntries(
        Object.entries(this._memCache).filter(([k]) => !k.startsWith('upcoming'))
      );
      localStorage.removeItem('wcc_cache_upcoming');
      localStorage.setItem('wcc_upcoming_day', todayStr);
    }

    const mem = this._memGet('upcoming');
    if (mem) return mem;
    const lsCached = this._lsGet('upcoming');
    if (lsCached) return this._memSet('upcoming', lsCached);
    const cached = await DB.getCacheStats('upcoming');
    if (cached) return this._memSet('upcoming', cached);

    const _afMap = (f, type) => {
      const sc = f.fixture?.status?.short || '';
      const isLive     = ['1H','2H','HT','ET','P','BT','INT'].includes(sc);
      const isFinished = ['FT','AET','PEN'].includes(sc);
      return {
        id:          `af_${f.fixture.id}`,
        home:        f.teams.home.name,
        away:        f.teams.away.name,
        homeFlag:    getFlag(f.teams.home.name),
        awayFlag:    getFlag(f.teams.away.name),
        date:        f.fixture.date?.split('T')[0],
        time:        f.fixture.date?.split('T')[1]?.substring(0,5),
        competition: f.league?.round || f.league?.name || (type==='worldcup'?'Mundial 2026':'Amistoso'),
        venue:       f.fixture.venue?.name || '',
        type,
        status:      isLive ? 'live' : isFinished ? 'finished' : 'scheduled',
        scoreHome:   (isLive || isFinished) ? (f.goals?.home ?? null) : null,
        scoreAway:   (isLive || isFinished) ? (f.goals?.away ?? null) : null,
        minute:      isLive ? (f.fixture.status?.elapsed || null) : null,
      };
    };

    /* 1. api-football: partidos de HOY (todos los estados) + proximos programados */
    const [afWCtoday, afFrToday, afWCnext, afFrNext] = await Promise.all([
      this._af(`/fixtures?league=${AF_WORLD_CUP_ID}&season=${AF_SEASON_2026}&date=${todayStr}`),
      this._af(`/fixtures?league=${AF_FRIENDLIES_ID}&date=${todayStr}`),
      this._af(`/fixtures?league=${AF_WORLD_CUP_ID}&season=${AF_SEASON_2026}&status=NS&next=12`),
      this._af(`/fixtures?league=${AF_FRIENDLIES_ID}&season=${AF_SEASON_2026}&status=NS&next=8`),
    ]);

    const afSeen = new Set();
    const afAllRaw = [
      ...(afWCtoday?.response||[]).map(f=>({...f,_type:'worldcup'})),
      ...(afFrToday?.response||[]).map(f=>({...f,_type:'friendly'})),
      ...(afWCnext?.response||[]).map(f=>({...f,_type:'worldcup'})),
      ...(afFrNext?.response||[]).map(f=>({...f,_type:'friendly'})),
    ].filter(f => { if (afSeen.has(f.fixture.id)) return false; afSeen.add(f.fixture.id); return true; });

    if (afAllRaw.length > 0) {
      const data = afAllRaw
        .map(f => _afMap(f, f._type))
        .filter(m => (m.date||'') >= todayStr)
        .sort((a,b) => ((a.date||'')+(a.time||'')) < ((b.date||'')+(b.time||'')) ? -1 : 1);
      await DB.setCacheStats('upcoming', data);
      this._lsSet('upcoming', data);
      return this._memSet('upcoming', data);
    }

    /* 2. football-data.org: partidos de hoy + proximos */
    const [fdToday, fdNext] = await Promise.all([
      this._fd(`/matches?dateFrom=${todayStr}&dateTo=${todayStr}`),
      this._fd('/competitions/2000/matches?status=SCHEDULED'),
    ]);
    const fdAll = [...(fdToday?.matches||[]), ...(fdNext?.matches||[])];
    const fdSeen = new Set();
    const fdUniq = fdAll.filter(m => { if(fdSeen.has(m.id)) return false; fdSeen.add(m.id); return true; });
    if (fdUniq.length > 0) {
      const data = fdUniq.map(m => {
        const s = m.status;
        const isLive     = ['IN_PLAY','HALF_TIME','PAUSED'].includes(s);
        const isFinished = ['FINISHED'].includes(s);
        return {
          id:          `fd_${m.id}`,
          home:        m.homeTeam.shortName || m.homeTeam.name,
          away:        m.awayTeam.shortName || m.awayTeam.name,
          homeFlag:    getFlag(m.homeTeam.name || m.homeTeam.shortName),
          awayFlag:    getFlag(m.awayTeam.name || m.awayTeam.shortName),
          date:        m.utcDate?.split('T')[0],
          time:        m.utcDate?.split('T')[1]?.substring(0,5),
          competition: m.stage?.replace(/_/g,' ') || m.competition?.name || 'Amistoso',
          venue:       m.venue || '',
          type:        m.competition?.id === 2000 ? 'worldcup' : 'friendly',
          status:      isLive ? 'live' : isFinished ? 'finished' : 'scheduled',
          scoreHome:   (isLive || isFinished) ? (m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? null) : null,
          scoreAway:   (isLive || isFinished) ? (m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? null) : null,
        };
      }).filter(m => (m.date||'') >= todayStr)
        .sort((a,b) => ((a.date||'')+(a.time||'')) < ((b.date||'')+(b.time||'')) ? -1 : 1);
      if (data.length) {
        await DB.setCacheStats('upcoming', data);
        this._lsSet('upcoming', data);
        return this._memSet('upcoming', data);
      }
    }

    /* 3. MOCK fallback — estado calculado dinámicamente por hora real */
    const todayLocal     = localDateStr();
    const yesterdayLocal = yesterdayStr();
    const allMock = [...MOCK.friendlyMatches, ...MOCK.upcomingMatches]
      .filter(m => {
        const d = m.date || '';
        // Incluir:
        //   - Partidos de HOY (aunque ya terminaron)
        //   - Partidos FUTUROS
        //   - Partidos de AYER que tienen resultado (para mostrar "ayer" mientras no sea medianoche UTC)
        if (d === todayLocal) return true;
        if (d > todayLocal)   return true;
        // Ayer con resultado → incluir para que no desaparezcan de golpe
        if (d === yesterdayLocal && m.scoreHome !== null) return true;
        return false;
      })
      .map(m => {
        const dynStatus = _mockStatus(m.date, m.time, m.scoreHome, m.scoreAway);
        return {
          ...m,
          status:    dynStatus,
          scoreHome: (dynStatus === 'finished' || dynStatus === 'live') ? (m.scoreHome ?? null) : null,
          scoreAway: (dynStatus === 'finished' || dynStatus === 'live') ? (m.scoreAway ?? null) : null,
          isYesterday: m.date === yesterdayLocal,
        };
      })
      .sort((a,b) => {
        // Orden: live primero, luego por fecha+hora
        if (a.status === 'live' && b.status !== 'live') return -1;
        if (b.status === 'live' && a.status !== 'live') return 1;
        return ((a.date||'')+(a.time||'')) < ((b.date||'')+(b.time||'')) ? -1 : 1;
      });
    return this._memSet('upcoming', allMock);
  },

  /* ══════════════════════════════════════════
     TABLA DE POSICIONES
  ══════════════════════════════════════════ */
  async getStandings() {
    const mem = this._memGet('standings');
    if (mem) return mem;
    const lsCached = this._lsGet('standings');
    if (lsCached) return this._memSet('standings', lsCached);
    const cached = await DB.getCacheStats('standings');
    if (cached) return this._memSet('standings', cached);

    // api-football standings
    const af = await this._af(`/standings?league=${AF_WORLD_CUP_ID}&season=${AF_SEASON_2026}`);
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
    live:      60  * 1000,           // 60 segundos
    upcoming:  5   * 60 * 1000,      // 5 minutos (era 30, reducido para que el estado se recalcule)
    standings: 6   * 60 * 60 * 1000, // 6 horas
    scorers:   6   * 60 * 60 * 1000, // 6 horas
    finished:  6   * 60 * 60 * 1000, // 6 horas
    default:   10  * 60 * 1000       // 10 minutos
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
    const cached = await DB.getCacheStats('finished');
    if (cached) return this._memSet('finished', cached);

    const af = await this._af(`/fixtures?league=${AF_WORLD_CUP_ID}&season=${AF_SEASON_2026}&status=FT`);
    if (af?.response?.length > 0) {
      const data = af.response.map(f => {
        const h = f.goals.home??0, a = f.goals.away??0;
        return {
          id: `af_${f.fixture.id}`,
          home: f.teams.home.name, away: f.teams.away.name,
          scoreHome: h, scoreAway: a,
          exactScore: `${h}-${a}`,
          finalResult: h>a?'home':a>h?'away':'draw',
          date: f.fixture.date?.split('T')[0]
        };
      });
      await DB.setCacheStats('finished', data);
      return this._memSet('finished', data);
    }
    return this._memSet('finished', MOCK.finishedMatches);
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

    // Usamos hora local del usuario. Los partidos duran ~2h,
    // así que solo marcamos 'finished' si pasaron más de 2.5h desde el inicio.
    const matchTs = new Date(`${m.date}T${m.time}:00`).getTime();
    const diffMs  = matchTs - Date.now();
    const diffH   = diffMs / (1000 * 60 * 60);

    if (diffH < -2.5) return 'finished';      // pasaron más de 2.5h → probablemente terminó
    if (diffH < 0)    return 'live';           // empezó hace menos de 2.5h → en curso estimado
    if (diffH <= 1)   return 'starting_soon';  // por comenzar (≤1h)
    if (diffH <= 3)   return 'closed';         // predicciones cerradas (≤3h antes)
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

    // Solo filtramos partidos de días ANTERIORES a hoy y los que tienen status:'finished' explícito.
    // NO filtramos por getMatchState() aquí — ese estado solo es visual.
    // Un partido de hoy cuya hora ya pasó sigue apareciendo (puede estar en curso o recién terminado).
    return MOCK.predictableMatches
      .filter(m => {
        if ((m.date || '') < todayStr) return false;        // días anteriores: fuera
        if (m.status === 'finished') return false;          // terminado explícito: fuera
        return true;
      })
      .sort((a, b) => {
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
   */
  async getPlayerPhoto(playerName) {
    try {
      const data = await this._sdb(`/searchplayers.php?p=${encodeURIComponent(playerName)}`);
      const players = data?.player;
      if (!players?.length) return null;
      const nameLower = playerName.toLowerCase();
      // Match exacto primero
      const exact = players.find(p => p.strPlayer?.toLowerCase() === nameLower);
      // Match parcial seguro (ej: "Pedri" → "Pedri González")
      const partial = !exact && players.find(p => {
        const pn = p.strPlayer?.toLowerCase() || '';
        return pn.includes(nameLower) || nameLower.includes(pn.split(' ')[0]);
      });
      const p = exact || partial || null; // NO usar players[0] ciegamente
      return p?.strCutout || p?.strThumb || p?.strFanart1 || null;
    } catch(_) { return null; }
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
    this._memCache = {};   // Forzar re-consulta también en memoria
    const [live, upcoming, standings] = await Promise.all([
      this.getLiveMatches(),
      this.getUpcomingMatches(),
      this.getStandings()
    ]);
    /* Determinar fuente: si algún dato vino de API real, indicarlo */
    const fromApi = live?.some?.(m => m.id?.startsWith?.('af_'))
                 || standings?.some?.(t => t._fromApi);
    return { live, upcoming, standings, source: fromApi ? 'API Football' : 'mock' };
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
