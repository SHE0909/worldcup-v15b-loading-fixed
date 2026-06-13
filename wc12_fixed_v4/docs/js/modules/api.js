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

/* ── URL base del worker (proxy a worldcup26.ir) ── */
const WC26_BASE = 'https://winter-thunder-a7a0.cq22003.workers.dev';

/**
 * USE_MOCK_ONLY = true → nunca llama al worker, siempre usa MOCK
 * Cambiar a false cuando el worker esté actualizado con worldcup26.ir
 */
const USE_MOCK_ONLY = true; // worker aún no actualizado — usar MOCK con datos reales

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

/* ── Normalización de nombres (ignora acentos, mayúsculas, espacios) ── */
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

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
/* ─────────────────────────────────────────────────────────────
   MOCK — Fixture completo Fase de Grupos Mundial 2026
   IDs = wc26_<match_number> para coincidir con worldcup26.ir
   Horarios en hora El Salvador (CST = UTC-6 = igual que México CDT)
   Actualizado: 11 jun 2026
───────────────────────────────────────────────────────────── */
const _ALL_MATCHES = [
  /* ── JORNADA 1 ─────────────────────────────────────────── */
  // 11 junio
  { id:'wc26_1',  home:'México',           away:'Sudáfrica',       homeFlag:'🇲🇽', awayFlag:'🇿🇦', date:'2026-06-11', time:'13:00', competition:'Grupo A — J1', type:'worldcup', venue:'Estadio Azteca, CDMX',        status:'finished', scoreHome:2, scoreAway:0, exactScore:'2-0', finalResult:'home' },
  { id:'wc26_2',  home:'Corea del Sur',    away:'Rep. Checa',      homeFlag:'🇰🇷', awayFlag:'🇨🇿', date:'2026-06-11', time:'20:00', competition:'Grupo A — J1', type:'worldcup', venue:'Estadio Akron, Guadalajara',   status:'scheduled' },
  // 12 junio
  { id:'wc26_3',  home:'Canadá',           away:'Bosnia y Herz.',  homeFlag:'🇨🇦', awayFlag:'🇧🇦', date:'2026-06-12', time:'13:00', competition:'Grupo B — J1', type:'worldcup', venue:'BMO Field, Toronto',            status:'scheduled' },
  { id:'wc26_4',  home:'Estados Unidos',   away:'Paraguay',        homeFlag:'🇺🇸', awayFlag:'🇵🇾', date:'2026-06-12', time:'19:00', competition:'Grupo D — J1', type:'worldcup', venue:'SoFi Stadium, Los Ángeles',    status:'scheduled' },
  // 13 junio
  { id:'wc26_5',  home:'Qatar',            away:'Suiza',           homeFlag:'🇶🇦', awayFlag:'🇨🇭', date:'2026-06-13', time:'13:00', competition:'Grupo B — J1', type:'worldcup', venue:'Levi\'s Stadium, San Francisco',status:'scheduled' },
  { id:'wc26_6',  home:'Brasil',           away:'Marruecos',       homeFlag:'🇧🇷', awayFlag:'🇲🇦', date:'2026-06-13', time:'16:00', competition:'Grupo C — J1', type:'worldcup', venue:'MetLife Stadium, Nueva York',   status:'scheduled' },
  { id:'wc26_7',  home:'Haití',            away:'Escocia',         homeFlag:'🇭🇹', awayFlag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', date:'2026-06-13', time:'19:00', competition:'Grupo C — J1', type:'worldcup', venue:'Gillette Stadium, Boston',      status:'scheduled' },
  // 13 junio noche (madrugada 14)
  { id:'wc26_8',  home:'Australia',        away:'Turquía',         homeFlag:'🇦🇺', awayFlag:'🇹🇷', date:'2026-06-13', time:'22:00', competition:'Grupo D — J1', type:'worldcup', venue:'BC Place, Vancouver',            status:'scheduled' },
  // 14 junio
  { id:'wc26_9',  home:'Alemania',         away:'Curazao',         homeFlag:'🇩🇪', awayFlag:'🇨🇼', date:'2026-06-14', time:'11:00', competition:'Grupo E — J1', type:'worldcup', venue:'NRG Stadium, Houston',           status:'scheduled' },
  { id:'wc26_10', home:'Países Bajos',     away:'Japón',           homeFlag:'🇳🇱', awayFlag:'🇯🇵', date:'2026-06-14', time:'14:00', competition:'Grupo F — J1', type:'worldcup', venue:'AT&T Stadium, Dallas',           status:'scheduled' },
  { id:'wc26_11', home:'Costa de Marfil',  away:'Ecuador',         homeFlag:'🇨🇮', awayFlag:'🇪🇨', date:'2026-06-14', time:'17:00', competition:'Grupo E — J1', type:'worldcup', venue:'Lincoln Financial, Filadelfia', status:'scheduled' },
  { id:'wc26_12', home:'Túnez',            away:'Suecia',          homeFlag:'🇹🇳', awayFlag:'🇸🇪', date:'2026-06-14', time:'20:00', competition:'Grupo F — J1', type:'worldcup', venue:'Estadio BBVA, Monterrey',        status:'scheduled' },
  // 15 junio
  { id:'wc26_13', home:'España',           away:'Cabo Verde',      homeFlag:'🇪🇸', awayFlag:'🇨🇻', date:'2026-06-15', time:'10:00', competition:'Grupo H — J1', type:'worldcup', venue:'Mercedes-Benz Stadium, Atlanta', status:'scheduled' },
  { id:'wc26_14', home:'Arabia Saudita',   away:'Uruguay',         homeFlag:'🇸🇦', awayFlag:'🇺🇾', date:'2026-06-15', time:'16:00', competition:'Grupo H — J1', type:'worldcup', venue:'Hard Rock Stadium, Miami',       status:'scheduled' },
  { id:'wc26_15', home:'Irán',             away:'Nueva Zelanda',   homeFlag:'🇮🇷', awayFlag:'🇳🇿', date:'2026-06-15', time:'13:00', competition:'Grupo G — J1', type:'worldcup', venue:'SoFi Stadium, Los Ángeles',    status:'scheduled' },
  { id:'wc26_16', home:'Bélgica',          away:'Egipto',          homeFlag:'🇧🇪', awayFlag:'🇪🇬', date:'2026-06-15', time:'19:00', competition:'Grupo G — J1', type:'worldcup', venue:'Lumen Field, Seattle',           status:'scheduled' },
  // 16 junio
  { id:'wc26_17', home:'Francia',          away:'Senegal',         homeFlag:'🇫🇷', awayFlag:'🇸🇳', date:'2026-06-16', time:'13:00', competition:'Grupo I — J1', type:'worldcup', venue:'MetLife Stadium, Nueva York',   status:'scheduled' },
  { id:'wc26_18', home:'Irak',             away:'Noruega',         homeFlag:'🇮🇶', awayFlag:'🇳🇴', date:'2026-06-16', time:'16:00', competition:'Grupo I — J1', type:'worldcup', venue:'Gillette Stadium, Boston',      status:'scheduled' },
  { id:'wc26_19', home:'Argentina',        away:'Argelia',         homeFlag:'🇦🇷', awayFlag:'🇩🇿', date:'2026-06-16', time:'19:00', competition:'Grupo J — J1', type:'worldcup', venue:'Arrowhead Stadium, Kansas City', status:'scheduled' },
  { id:'wc26_20', home:'Austria',          away:'Jordania',        homeFlag:'🇦🇹', awayFlag:'🇯🇴', date:'2026-06-16', time:'22:00', competition:'Grupo J — J1', type:'worldcup', venue:'Levi\'s Stadium, San Francisco',status:'scheduled' },
  // 17 junio
  { id:'wc26_21', home:'Portugal',         away:'RD Congo',        homeFlag:'🇵🇹', awayFlag:'🇨🇩', date:'2026-06-17', time:'12:00', competition:'Grupo K — J1', type:'worldcup', venue:'NRG Stadium, Houston',           status:'scheduled' },
  { id:'wc26_22', home:'Inglaterra',       away:'Croacia',         homeFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayFlag:'🇭🇷', date:'2026-06-17', time:'15:00', competition:'Grupo L — J1', type:'worldcup', venue:'AT&T Stadium, Dallas',           status:'scheduled' },
  { id:'wc26_23', home:'Ghana',            away:'Panamá',          homeFlag:'🇬🇭', awayFlag:'🇵🇦', date:'2026-06-17', time:'13:00', competition:'Grupo L — J1', type:'worldcup', venue:'BMO Field, Toronto',            status:'scheduled' },
  { id:'wc26_24', home:'Uzbekistán',       away:'Colombia',        homeFlag:'🇺🇿', awayFlag:'🇨🇴', date:'2026-06-17', time:'20:00', competition:'Grupo K — J1', type:'worldcup', venue:'Estadio Azteca, CDMX',          status:'scheduled' },

  /* ── JORNADA 2 ─────────────────────────────────────────── */
  // 18 junio
  { id:'wc26_25', home:'Rep. Checa',       away:'Sudáfrica',       homeFlag:'🇨🇿', awayFlag:'🇿🇦', date:'2026-06-18', time:'10:00', competition:'Grupo A — J2', type:'worldcup', venue:'Mercedes-Benz Stadium, Atlanta', status:'scheduled' },
  { id:'wc26_26', home:'Suiza',            away:'Bosnia y Herz.',  homeFlag:'🇨🇭', awayFlag:'🇧🇦', date:'2026-06-18', time:'13:00', competition:'Grupo B — J2', type:'worldcup', venue:'SoFi Stadium, Los Ángeles',    status:'scheduled' },
  { id:'wc26_27', home:'Escocia',          away:'Marruecos',       homeFlag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', awayFlag:'🇲🇦', date:'2026-06-18', time:'16:00', competition:'Grupo C — J2', type:'worldcup', venue:'Gillette Stadium, Boston',      status:'scheduled' },
  { id:'wc26_28', home:'México',           away:'Corea del Sur',   homeFlag:'🇲🇽', awayFlag:'🇰🇷', date:'2026-06-18', time:'19:00', competition:'Grupo A — J2', type:'worldcup', venue:'Estadio Akron, Guadalajara',    status:'scheduled' },
  // 19 junio
  { id:'wc26_29', home:'Estados Unidos',   away:'Australia',       homeFlag:'🇺🇸', awayFlag:'🇦🇺', date:'2026-06-19', time:'13:00', competition:'Grupo D — J2', type:'worldcup', venue:'Lumen Field, Seattle',           status:'scheduled' },
  { id:'wc26_30', home:'Brasil',           away:'Haití',           homeFlag:'🇧🇷', awayFlag:'🇭🇹', date:'2026-06-19', time:'19:00', competition:'Grupo C — J2', type:'worldcup', venue:'Lincoln Financial, Filadelfia', status:'scheduled' },
  { id:'wc26_31', home:'Turquía',          away:'Paraguay',        homeFlag:'🇹🇷', awayFlag:'🇵🇾', date:'2026-06-19', time:'22:00', competition:'Grupo D — J2', type:'worldcup', venue:'Levi\'s Stadium, San Francisco',status:'scheduled' },
  // 20 junio
  { id:'wc26_32', home:'Curazao',          away:'Costa de Marfil', homeFlag:'🇨🇼', awayFlag:'🇨🇮', date:'2026-06-20', time:'11:00', competition:'Grupo E — J2', type:'worldcup', venue:'NRG Stadium, Houston',           status:'scheduled' },
  { id:'wc26_33', home:'Japón',            away:'Túnez',           homeFlag:'🇯🇵', awayFlag:'🇹🇳', date:'2026-06-20', time:'14:00', competition:'Grupo F — J2', type:'worldcup', venue:'BC Place, Vancouver',            status:'scheduled' },
  { id:'wc26_34', home:'Alemania',         away:'Ecuador',         homeFlag:'🇩🇪', awayFlag:'🇪🇨', date:'2026-06-20', time:'17:00', competition:'Grupo E — J2', type:'worldcup', venue:'AT&T Stadium, Dallas',           status:'scheduled' },
  { id:'wc26_35', home:'Suecia',           away:'Países Bajos',    homeFlag:'🇸🇪', awayFlag:'🇳🇱', date:'2026-06-20', time:'20:00', competition:'Grupo F — J2', type:'worldcup', venue:'Estadio BBVA, Monterrey',        status:'scheduled' },
  // 21 junio
  { id:'wc26_36', home:'España',           away:'Arabia Saudita',  homeFlag:'🇪🇸', awayFlag:'🇸🇦', date:'2026-06-21', time:'10:00', competition:'Grupo H — J2', type:'worldcup', venue:'Mercedes-Benz Stadium, Atlanta', status:'scheduled' },
  { id:'wc26_37', home:'Nueva Zelanda',    away:'Egipto',          homeFlag:'🇳🇿', awayFlag:'🇪🇬', date:'2026-06-21', time:'13:00', competition:'Grupo G — J2', type:'worldcup', venue:'BC Place, Vancouver',            status:'scheduled' },
  { id:'wc26_38', home:'Uruguay',          away:'Cabo Verde',      homeFlag:'🇺🇾', awayFlag:'🇨🇻', date:'2026-06-21', time:'16:00', competition:'Grupo H — J2', type:'worldcup', venue:'Hard Rock Stadium, Miami',       status:'scheduled' },
  { id:'wc26_39', home:'Irán',             away:'Bélgica',         homeFlag:'🇮🇷', awayFlag:'🇧🇪', date:'2026-06-21', time:'19:00', competition:'Grupo G — J2', type:'worldcup', venue:'Lumen Field, Seattle',           status:'scheduled' },
  // 22 junio
  { id:'wc26_40', home:'Argentina',        away:'Austria',         homeFlag:'🇦🇷', awayFlag:'🇦🇹', date:'2026-06-22', time:'11:00', competition:'Grupo J — J2', type:'worldcup', venue:'AT&T Stadium, Dallas',           status:'scheduled' },
  { id:'wc26_41', home:'Francia',          away:'Irak',            homeFlag:'🇫🇷', awayFlag:'🇮🇶', date:'2026-06-22', time:'15:00', competition:'Grupo I — J2', type:'worldcup', venue:'Lincoln Financial, Filadelfia', status:'scheduled' },
  { id:'wc26_42', home:'Noruega',          away:'Senegal',         homeFlag:'🇳🇴', awayFlag:'🇸🇳', date:'2026-06-22', time:'18:00', competition:'Grupo I — J2', type:'worldcup', venue:'MetLife Stadium, Nueva York',   status:'scheduled' },
  { id:'wc26_43', home:'Jordania',         away:'Argelia',         homeFlag:'🇯🇴', awayFlag:'🇩🇿', date:'2026-06-22', time:'21:00', competition:'Grupo J — J2', type:'worldcup', venue:'Levi\'s Stadium, San Francisco',status:'scheduled' },
  // 23 junio
  { id:'wc26_44', home:'Portugal',         away:'Uzbekistán',      homeFlag:'🇵🇹', awayFlag:'🇺🇿', date:'2026-06-23', time:'11:00', competition:'Grupo K — J2', type:'worldcup', venue:'NRG Stadium, Houston',           status:'scheduled' },
  { id:'wc26_45', home:'Inglaterra',       away:'Ghana',           homeFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayFlag:'🇬🇭', date:'2026-06-23', time:'14:00', competition:'Grupo L — J2', type:'worldcup', venue:'Gillette Stadium, Boston',      status:'scheduled' },
  { id:'wc26_46', home:'Panamá',           away:'Croacia',         homeFlag:'🇵🇦', awayFlag:'🇭🇷', date:'2026-06-23', time:'17:00', competition:'Grupo L — J2', type:'worldcup', venue:'BMO Field, Toronto',            status:'scheduled' },
  { id:'wc26_47', home:'Colombia',         away:'RD Congo',        homeFlag:'🇨🇴', awayFlag:'🇨🇩', date:'2026-06-23', time:'20:00', competition:'Grupo K — J2', type:'worldcup', venue:'Estadio Akron, Guadalajara',    status:'scheduled' },

  /* ── JORNADA 3 ─────────────────────────────────────────── */
  // 24 junio
  { id:'wc26_48', home:'Suiza',            away:'Canadá',          homeFlag:'🇨🇭', awayFlag:'🇨🇦', date:'2026-06-24', time:'13:00', competition:'Grupo B — J3', type:'worldcup', venue:'BC Place, Vancouver',            status:'scheduled' },
  { id:'wc26_49', home:'Bosnia y Herz.',   away:'Qatar',           homeFlag:'🇧🇦', awayFlag:'🇶🇦', date:'2026-06-24', time:'13:00', competition:'Grupo B — J3', type:'worldcup', venue:'Lumen Field, Seattle',           status:'scheduled' },
  { id:'wc26_50', home:'Marruecos',        away:'Haití',           homeFlag:'🇲🇦', awayFlag:'🇭🇹', date:'2026-06-24', time:'16:00', competition:'Grupo C — J3', type:'worldcup', venue:'Mercedes-Benz Stadium, Atlanta', status:'scheduled' },
  { id:'wc26_51', home:'Escocia',          away:'Brasil',          homeFlag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', awayFlag:'🇧🇷', date:'2026-06-24', time:'16:00', competition:'Grupo C — J3', type:'worldcup', venue:'Hard Rock Stadium, Miami',       status:'scheduled' },
  { id:'wc26_52', home:'Rep. Checa',       away:'México',          homeFlag:'🇨🇿', awayFlag:'🇲🇽', date:'2026-06-24', time:'19:00', competition:'Grupo A — J3', type:'worldcup', venue:'Estadio Azteca, CDMX',          status:'scheduled' },
  { id:'wc26_53', home:'Sudáfrica',        away:'Corea del Sur',   homeFlag:'🇿🇦', awayFlag:'🇰🇷', date:'2026-06-24', time:'19:00', competition:'Grupo A — J3', type:'worldcup', venue:'Estadio Banorte, Monterrey',    status:'scheduled' },
  // 25 junio
  { id:'wc26_54', home:'Turquía',          away:'Estados Unidos',  homeFlag:'🇹🇷', awayFlag:'🇺🇸', date:'2026-06-25', time:'20:00', competition:'Grupo D — J3', type:'worldcup', venue:'SoFi Stadium, Los Ángeles',    status:'scheduled' },
  { id:'wc26_55', home:'Paraguay',         away:'Australia',       homeFlag:'🇵🇾', awayFlag:'🇦🇺', date:'2026-06-25', time:'20:00', competition:'Grupo D — J3', type:'worldcup', venue:'Levi\'s Stadium, San Francisco',status:'scheduled' },
  // 26 junio
  { id:'wc26_56', home:'Ecuador',          away:'Alemania',        homeFlag:'🇪🇨', awayFlag:'🇩🇪', date:'2026-06-26', time:'11:00', competition:'Grupo E — J3', type:'worldcup', venue:'AT&T Stadium, Dallas',           status:'scheduled' },
  { id:'wc26_57', home:'Costa de Marfil',  away:'Curazao',         homeFlag:'🇨🇮', awayFlag:'🇨🇼', date:'2026-06-26', time:'11:00', competition:'Grupo E — J3', type:'worldcup', venue:'Lincoln Financial, Filadelfia', status:'scheduled' },
  { id:'wc26_58', home:'Países Bajos',     away:'Suecia',          homeFlag:'🇳🇱', awayFlag:'🇸🇪', date:'2026-06-26', time:'14:00', competition:'Grupo F — J3', type:'worldcup', venue:'Estadio BBVA, Monterrey',        status:'scheduled' },
  { id:'wc26_59', home:'Túnez',            away:'Japón',           homeFlag:'🇹🇳', awayFlag:'🇯🇵', date:'2026-06-26', time:'14:00', competition:'Grupo F — J3', type:'worldcup', venue:'NRG Stadium, Houston',           status:'scheduled' },
  { id:'wc26_60', home:'Bélgica',          away:'Nueva Zelanda',   homeFlag:'🇧🇪', awayFlag:'🇳🇿', date:'2026-06-26', time:'21:00', competition:'Grupo G — J3', type:'worldcup', venue:'BC Place, Vancouver',            status:'scheduled' },
  { id:'wc26_61', home:'Egipto',           away:'Irán',            homeFlag:'🇪🇬', awayFlag:'🇮🇷', date:'2026-06-26', time:'21:00', competition:'Grupo G — J3', type:'worldcup', venue:'Lumen Field, Seattle',           status:'scheduled' },
  { id:'wc26_62', home:'Cabo Verde',       away:'Arabia Saudita',  homeFlag:'🇨🇻', awayFlag:'🇸🇦', date:'2026-06-26', time:'18:00', competition:'Grupo H — J3', type:'worldcup', venue:'NRG Stadium, Houston',           status:'scheduled' },
  { id:'wc26_63', home:'Uruguay',          away:'España',          homeFlag:'🇺🇾', awayFlag:'🇪🇸', date:'2026-06-26', time:'18:00', competition:'Grupo H — J3', type:'worldcup', venue:'Estadio Akron, Guadalajara',    status:'scheduled' },
  // 27 junio
  { id:'wc26_64', home:'Noruega',          away:'Francia',         homeFlag:'🇳🇴', awayFlag:'🇫🇷', date:'2026-06-27', time:'13:00', competition:'Grupo I — J3', type:'worldcup', venue:'Gillette Stadium, Boston',      status:'scheduled' },
  { id:'wc26_65', home:'Senegal',          away:'Irak',            homeFlag:'🇸🇳', awayFlag:'🇮🇶', date:'2026-06-27', time:'13:00', competition:'Grupo I — J3', type:'worldcup', venue:'BMO Field, Toronto',            status:'scheduled' },
  { id:'wc26_66', home:'Argelia',          away:'Austria',         homeFlag:'🇩🇿', awayFlag:'🇦🇹', date:'2026-06-27', time:'21:00', competition:'Grupo J — J3', type:'worldcup', venue:'Hard Rock Stadium, Miami',       status:'scheduled' },
  { id:'wc26_67', home:'Jordania',         away:'Argentina',       homeFlag:'🇯🇴', awayFlag:'🇦🇷', date:'2026-06-27', time:'21:00', competition:'Grupo J — J3', type:'worldcup', venue:'Levi\'s Stadium, San Francisco',status:'scheduled' },
  { id:'wc26_68', home:'Portugal',         away:'Colombia',        homeFlag:'🇵🇹', awayFlag:'🇨🇴', date:'2026-06-27', time:'16:30', competition:'Grupo K — J3', type:'worldcup', venue:'AT&T Stadium, Dallas',           status:'scheduled' },
  { id:'wc26_69', home:'RD Congo',         away:'Uzbekistán',      homeFlag:'🇨🇩', awayFlag:'🇺🇿', date:'2026-06-27', time:'16:30', competition:'Grupo K — J3', type:'worldcup', venue:'Mercedes-Benz Stadium, Atlanta', status:'scheduled' },
  { id:'wc26_70', home:'Panamá',           away:'Inglaterra',      homeFlag:'🇵🇦', awayFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', date:'2026-06-27', time:'16:00', competition:'Grupo L — J3', type:'worldcup', venue:'Arrowhead Stadium, Kansas City', status:'scheduled' },
  { id:'wc26_71', home:'Croacia',          away:'Ghana',           homeFlag:'🇭🇷', awayFlag:'🇬🇭', date:'2026-06-27', time:'16:00', competition:'Grupo L — J3', type:'worldcup', venue:'Estadio BBVA, Monterrey',        status:'scheduled' },
];

const MOCK = {
  standings: [
    // Grupo A
    { pos:1, team:'México',        flag:'🇲🇽', group:'A', pj:1,w:1,d:0,l:0,gf:2,gc:0,pts:3 },
    { pos:2, team:'Corea del Sur', flag:'🇰🇷', group:'A', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, team:'Rep. Checa',    flag:'🇨🇿', group:'A', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, team:'Sudáfrica',     flag:'🇿🇦', group:'A', pj:1,w:0,d:0,l:1,gf:0,gc:2,pts:0 },
    // Grupo B
    { pos:1, team:'Canadá',        flag:'🇨🇦', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, team:'Bosnia y Herz.',flag:'🇧🇦', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, team:'Qatar',         flag:'🇶🇦', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, team:'Suiza',         flag:'🇨🇭', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    // Grupo C
    { pos:1, team:'Brasil',        flag:'🇧🇷', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, team:'Marruecos',     flag:'🇲🇦', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, team:'Haití',         flag:'🇭🇹', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, team:'Escocia',       flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    // Grupo D
    { pos:1, team:'Estados Unidos',flag:'🇺🇸', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, team:'Paraguay',      flag:'🇵🇾', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, team:'Australia',     flag:'🇦🇺', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, team:'Turquía',       flag:'🇹🇷', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    // Grupo E
    { pos:1, team:'Alemania',      flag:'🇩🇪', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, team:'Ecuador',       flag:'🇪🇨', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, team:'Costa de Marfil',flag:'🇨🇮',group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, team:'Curazao',       flag:'🇨🇼', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    // Grupo F
    { pos:1, team:'Países Bajos',  flag:'🇳🇱', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, team:'Japón',         flag:'🇯🇵', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, team:'Suecia',        flag:'🇸🇪', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, team:'Túnez',         flag:'🇹🇳', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    // Grupo G
    { pos:1, team:'Bélgica',       flag:'🇧🇪', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, team:'Egipto',        flag:'🇪🇬', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, team:'Irán',          flag:'🇮🇷', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, team:'Nueva Zelanda', flag:'🇳🇿', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    // Grupo H
    { pos:1, team:'España',        flag:'🇪🇸', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, team:'Uruguay',       flag:'🇺🇾', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, team:'Arabia Saudita',flag:'🇸🇦', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, team:'Cabo Verde',    flag:'🇨🇻', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    // Grupo I
    { pos:1, team:'Francia',       flag:'🇫🇷', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, team:'Noruega',       flag:'🇳🇴', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, team:'Senegal',       flag:'🇸🇳', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, team:'Irak',          flag:'🇮🇶', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    // Grupo J
    { pos:1, team:'Argentina',     flag:'🇦🇷', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, team:'Austria',       flag:'🇦🇹', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, team:'Argelia',       flag:'🇩🇿', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, team:'Jordania',      flag:'🇯🇴', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    // Grupo K
    { pos:1, team:'Portugal',      flag:'🇵🇹', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, team:'Colombia',      flag:'🇨🇴', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, team:'Uzbekistán',    flag:'🇺🇿', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, team:'RD Congo',      flag:'🇨🇩', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    // Grupo L
    { pos:1, team:'Inglaterra',    flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, team:'Croacia',       flag:'🇭🇷', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, team:'Panamá',        flag:'🇵🇦', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, team:'Ghana',         flag:'🇬🇭', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  ],
  teams: [
    { id:'wc26_t_MEX', name:'México',         flag:'🇲🇽', group:'A' },
    { id:'wc26_t_RSA', name:'Sudáfrica',      flag:'🇿🇦', group:'A' },
    { id:'wc26_t_KOR', name:'Corea del Sur',  flag:'🇰🇷', group:'A' },
    { id:'wc26_t_CZE', name:'Rep. Checa',     flag:'🇨🇿', group:'A' },
    { id:'wc26_t_CAN', name:'Canadá',         flag:'🇨🇦', group:'B' },
    { id:'wc26_t_BIH', name:'Bosnia y Herz.', flag:'🇧🇦', group:'B' },
    { id:'wc26_t_QAT', name:'Qatar',          flag:'🇶🇦', group:'B' },
    { id:'wc26_t_SUI', name:'Suiza',          flag:'🇨🇭', group:'B' },
    { id:'wc26_t_BRA', name:'Brasil',         flag:'🇧🇷', group:'C' },
    { id:'wc26_t_MAR', name:'Marruecos',      flag:'🇲🇦', group:'C' },
    { id:'wc26_t_HAI', name:'Haití',          flag:'🇭🇹', group:'C' },
    { id:'wc26_t_SCO', name:'Escocia',        flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', group:'C' },
    { id:'wc26_t_USA', name:'Estados Unidos', flag:'🇺🇸', group:'D' },
    { id:'wc26_t_PAR', name:'Paraguay',       flag:'🇵🇾', group:'D' },
    { id:'wc26_t_AUS', name:'Australia',      flag:'🇦🇺', group:'D' },
    { id:'wc26_t_TUR', name:'Turquía',        flag:'🇹🇷', group:'D' },
    { id:'wc26_t_GER', name:'Alemania',       flag:'🇩🇪', group:'E' },
    { id:'wc26_t_ECU', name:'Ecuador',        flag:'🇪🇨', group:'E' },
    { id:'wc26_t_CIV', name:'Costa de Marfil',flag:'🇨🇮', group:'E' },
    { id:'wc26_t_CUW', name:'Curazao',        flag:'🇨🇼', group:'E' },
    { id:'wc26_t_NED', name:'Países Bajos',   flag:'🇳🇱', group:'F' },
    { id:'wc26_t_JPN', name:'Japón',          flag:'🇯🇵', group:'F' },
    { id:'wc26_t_SWE', name:'Suecia',         flag:'🇸🇪', group:'F' },
    { id:'wc26_t_TUN', name:'Túnez',          flag:'🇹🇳', group:'F' },
    { id:'wc26_t_BEL', name:'Bélgica',        flag:'🇧🇪', group:'G' },
    { id:'wc26_t_EGY', name:'Egipto',         flag:'🇪🇬', group:'G' },
    { id:'wc26_t_IRN', name:'Irán',           flag:'🇮🇷', group:'G' },
    { id:'wc26_t_NZL', name:'Nueva Zelanda',  flag:'🇳🇿', group:'G' },
    { id:'wc26_t_ESP', name:'España',         flag:'🇪🇸', group:'H' },
    { id:'wc26_t_URU', name:'Uruguay',        flag:'🇺🇾', group:'H' },
    { id:'wc26_t_KSA', name:'Arabia Saudita', flag:'🇸🇦', group:'H' },
    { id:'wc26_t_CPV', name:'Cabo Verde',     flag:'🇨🇻', group:'H' },
    { id:'wc26_t_FRA', name:'Francia',        flag:'🇫🇷', group:'I' },
    { id:'wc26_t_NOR', name:'Noruega',        flag:'🇳🇴', group:'I' },
    { id:'wc26_t_SEN', name:'Senegal',        flag:'🇸🇳', group:'I' },
    { id:'wc26_t_IRQ', name:'Irak',           flag:'🇮🇶', group:'I' },
    { id:'wc26_t_ARG', name:'Argentina',      flag:'🇦🇷', group:'J' },
    { id:'wc26_t_AUT', name:'Austria',        flag:'🇦🇹', group:'J' },
    { id:'wc26_t_ALG', name:'Argelia',        flag:'🇩🇿', group:'J' },
    { id:'wc26_t_JOR', name:'Jordania',       flag:'🇯🇴', group:'J' },
    { id:'wc26_t_POR', name:'Portugal',       flag:'🇵🇹', group:'K' },
    { id:'wc26_t_COL', name:'Colombia',       flag:'🇨🇴', group:'K' },
    { id:'wc26_t_UZB', name:'Uzbekistán',     flag:'🇺🇿', group:'K' },
    { id:'wc26_t_COD', name:'RD Congo',       flag:'🇨🇩', group:'K' },
    { id:'wc26_t_ENG', name:'Inglaterra',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', group:'L' },
    { id:'wc26_t_CRO', name:'Croacia',        flag:'🇭🇷', group:'L' },
    { id:'wc26_t_PAN', name:'Panamá',         flag:'🇵🇦', group:'L' },
    { id:'wc26_t_GHA', name:'Ghana',          flag:'🇬🇭', group:'L' },
  ],
  get upcomingMatches() {
    const today = localDateStr();
    const yest  = yesterdayStr();
    return _ALL_MATCHES
      .filter(m => m.date >= yest)
      .sort((a,b)=>{
        if(a.status==='live'&&b.status!=='live')return -1;
        if(b.status==='live'&&a.status!=='live')return 1;
        return((a.date||'')+(a.time||''))<((b.date||'')+(b.time||''))?-1:1;
      });
  },
  get finishedMatches() {
    return _ALL_MATCHES
      .filter(m => m.status==='finished')
      .map(m => ({
        ...m,
        exactScore:  m.scoreHome!=null ? `${m.scoreHome}-${m.scoreAway}` : undefined,
        finalResult: m.scoreHome!=null ? (m.scoreHome>m.scoreAway?'home':m.scoreAway>m.scoreHome?'away':'draw') : undefined,
      }))
      .sort((a,b)=>b.date>a.date?1:-1);
  },
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
/* ── Traducción de nombres de equipo EN → ES (la API devuelve nombres en inglés) ── */
const TEAM_NAME_ES = {
  'Mexico':'México', 'South Africa':'Sudáfrica', 'South Korea':'Corea del Sur',
  'Czech Republic':'Rep. Checa', 'Canada':'Canadá', 'Bosnia and Herzegovina':'Bosnia y Herz.',
  'United States':'Estados Unidos', 'Paraguay':'Paraguay', 'Haiti':'Haití',
  'Scotland':'Escocia', 'Australia':'Australia', 'Turkey':'Turquía',
  'Brazil':'Brasil', 'Morocco':'Marruecos', 'Qatar':'Qatar', 'Switzerland':'Suiza',
  'Ivory Coast':'Costa de Marfil', 'Ecuador':'Ecuador', 'Germany':'Alemania',
  'Curaçao':'Curazao', 'Netherlands':'Países Bajos', 'Japan':'Japón',
  'Sweden':'Suecia', 'Tunisia':'Túnez', 'Iran':'Irán', 'New Zealand':'Nueva Zelanda',
  'Spain':'España', 'Cape Verde':'Cabo Verde', 'Belgium':'Bélgica', 'Egypt':'Egipto',
  'Saudi Arabia':'Arabia Saudí', 'Uruguay':'Uruguay', 'France':'Francia',
  'Senegal':'Senegal', 'Iraq':'Irak', 'Norway':'Noruega', 'Argentina':'Argentina',
  'Algeria':'Argelia', 'Austria':'Austria', 'Jordan':'Jordania', 'Portugal':'Portugal',
  'Democratic Republic of the Congo':'RD Congo', 'England':'Inglaterra',
  'Croatia':'Croacia', 'Uzbekistan':'Uzbekistán', 'Colombia':'Colombia',
  'Ghana':'Ghana', 'Panama':'Panamá',
};
function translateTeamName(name) { return TEAM_NAME_ES[name] || name || ''; }

/* ── Mapa inverso ES → EN, para que la búsqueda reconozca nombres en inglés ── */
const TEAM_NAME_EN = {};
Object.entries(TEAM_NAME_ES).forEach(([en, es]) => { TEAM_NAME_EN[es] = en; });

/* ── Quita acentos/diacríticos para comparaciones de búsqueda ── */
function _normalizeSearch(str) {
  return (str || '')
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/* ── true si `text` (nombre en español, ej. de un equipo/jugador) coincide
   con la búsqueda `q`, comparando también contra su alias en inglés.
   Insensible a mayúsculas y acentos. ── */
function matchesSearch(text, q) {
  if (!q) return true;
  const nq = _normalizeSearch(q);
  if (_normalizeSearch(text).includes(nq)) return true;
  const en = TEAM_NAME_EN[text];
  if (en && _normalizeSearch(en).includes(nq)) return true;
  return false;
}

/* ── Traducción de etiquetas de fases eliminatorias (cuando aún no hay equipo definido) ── */
function translateBracketLabel(label) {
  if (!label) return '';
  return label
    .replace(/^Winner Group ([A-L])$/, 'Ganador Grupo $1')
    .replace(/^Runner-up Group ([A-L])$/, 'Subcampeón Grupo $1')
    .replace(/^Winner Match (\d+)$/, 'Ganador Partido $1')
    .replace(/^Loser Match (\d+)$/, 'Perdedor Partido $1')
    .replace(/^3rd Group (.+)$/, '3° Grupo $1');
}

/* ── Nombres legibles para las fases de eliminación directa ── */
const KNOCKOUT_NAMES = {
  R32:'Dieciseisavos de Final', R16:'Octavos de Final', QF:'Cuartos de Final',
  SF:'Semifinal', '3RD':'Tercer Lugar', FINAL:'Final',
};

/* ── Parsear local_date "MM/DD/YYYY HH:MM" → { date:'YYYY-MM-DD', time:'HH:MM' } ── */
function _parseWC26LocalDate(str) {
  if (!str) return { date: '', time: '' };
  const [datePart, timePart] = str.split(' ');
  const [mo, da, yr] = (datePart || '').split('/');
  if (!mo || !da || !yr) return { date: '', time: timePart || '' };
  const [hh, mm] = (timePart || '0:0').split(':').map(Number);

  // La API entrega local_date 1 hora detrás del horario real de El Salvador.
  // Sumamos 1 hora aquí, manejando el rollover de día/mes/año.
  const dt = new Date(Number(yr), Number(mo) - 1, Number(da), hh, mm);
  dt.setHours(dt.getHours() + 1);

  const date = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
  const time = `${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
  return { date, time };
}

/* ── Convertir kickoff_utc (ISO UTC) a hora El Salvador (UTC-6) ── */
function _utcToSV(utcStr) {
  if (!utcStr) return { date: '', time: '' };
  // kickoff_utc puede ser "2026-06-12T19:00:00Z" o "2026-06-12 19:00:00"
  const iso = utcStr.includes('T') ? utcStr : utcStr.replace(' ', 'T') + 'Z';
  const d = new Date(iso);
  if (isNaN(d)) return { date: '', time: '' };
  // El Salvador = UTC-6
  const sv = new Date(d.getTime() - 6 * 3600000);
  const yr  = sv.getUTCFullYear();
  const mo  = String(sv.getUTCMonth() + 1).padStart(2, '0');
  const da  = String(sv.getUTCDate()).padStart(2, '0');
  const hh  = String(sv.getUTCHours()).padStart(2, '0');
  const mm  = String(sv.getUTCMinutes()).padStart(2, '0');
  return { date: `${yr}-${mo}-${da}`, time: `${hh}:${mm}` };
}

function _mapWC26Match(m) {
  // Preferir kickoff_utc para conversión exacta a hora SV; fallback a local_date
  const { date, time } = m.kickoff_utc ? _utcToSV(m.kickoff_utc) : _parseWC26LocalDate(m.local_date);

  const isFinished = String(m.finished).toUpperCase() === 'TRUE';
  const te = (m.time_elapsed || '').toLowerCase();
  const isLive = !isFinished && te !== '' && te !== 'notstarted';

  let status = 'scheduled';
  if (isFinished) status = 'finished';
  else if (isLive) status = 'live';

  // Nombre de equipos: usar nombre real si existe, o traducir la etiqueta de bracket
  const homeName = m.home_team_name_en
    ? translateTeamName(m.home_team_name_en)
    : translateBracketLabel(m.home_team_label);
  const awayName = m.away_team_name_en
    ? translateTeamName(m.away_team_name_en)
    : translateBracketLabel(m.away_team_label);

  // Competencia: grupo (A-L) o fase eliminatoria (R32, R16, QF, SF, 3RD, FINAL)
  let competition = 'Mundial 2026';
  if (m.group) {
    if (/^[A-L]$/.test(m.group)) competition = `Grupo ${m.group} — J${m.matchday || ''}`;
    else competition = KNOCKOUT_NAMES[m.group] || m.group;
  }

  const scoreHome = (m.home_score !== undefined && m.home_score !== null) ? Number(m.home_score) : null;
  const scoreAway = (m.away_score !== undefined && m.away_score !== null) ? Number(m.away_score) : null;

  return {
    id:          `wc26_${m.id}`,
    home:        homeName,
    away:        awayName,
    homeFlag:    getFlag(homeName),
    awayFlag:    getFlag(awayName),
    date,
    time,
    competition,
    venue:       '',
    type:        'worldcup',
    status,
    scoreHome:   (isLive || isFinished) ? scoreHome : null,
    scoreAway:   (isLive || isFinished) ? scoreAway : null,
    minute:      isLive ? (m.time_elapsed || null) : null,
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
  _init() { this._invalidateOldCache(); },
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

  /* Versión de caché — se incrementa cuando cambia el fixture/MOCK */
  _CACHE_VERSION: 'v22',

  _lsCacheKey(key) { return `wcc_cache_${this._CACHE_VERSION}_${key}`; },

  _invalidateOldCache() {
    try {
      const prefix = 'wcc_cache_';
      Object.keys(localStorage)
        .filter(k => k.startsWith(prefix) && !k.startsWith(`${prefix}${this._CACHE_VERSION}_`))
        .forEach(k => localStorage.removeItem(k));
    } catch(_) {}
  },

  _lsGet(key) {
    try {
      const raw = localStorage.getItem(this._lsCacheKey(key));
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts > this._ttlFor(key)) { localStorage.removeItem(this._lsCacheKey(key)); return null; }
      return data;
    } catch(_) { return null; }
  },
  _lsSet(key, data) {
    try { localStorage.setItem(this._lsCacheKey(key), JSON.stringify({ data, ts: Date.now() })); } catch(_) {}
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

  /* ── worldcup26.ir fetch (via worker proxy) ── */
  async _wc26(endpoint) {
    if (USE_MOCK_ONLY) return null; // usar MOCK directamente
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
          const te = (m.time_elapsed || '').toLowerCase();
          return String(m.finished).toUpperCase() !== 'TRUE' && te !== '' && te !== 'notstarted';
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
        .filter(m => String(m.finished).toUpperCase() === 'TRUE')
        .map(m => {
          const base = _mapWC26Match(m);
          const h = Number(m.home_score ?? 0), a = Number(m.away_score ?? 0);
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

    // Calculamos la tabla a partir de partidos finalizados reales.
    // Si no hay datos reales, usamos el MOCK directamente (con resultados ya cargados).
    let finished = [];
    try { finished = await this.getFinishedMatches(); } catch(_) {}

    // Si no hay partidos reales, devolver MOCK tal cual (ya tiene México 2-0)
    if (!finished || finished.length === 0) {
      const mockRows = MOCK.standings.slice();
      const groups = {};
      mockRows.forEach(s => (groups[s.group] = groups[s.group] || []).push(s));
      const sorted = [];
      Object.values(groups).forEach(arr => {
        arr.sort((x,y) => y.pts - x.pts || (y.gf-y.gc)-(x.gf-x.gc) || y.gf-x.gf);
        arr.forEach((s,i) => { s.pos = i+1; sorted.push(s); });
      });
      API_STATUS.usingMock = true;
      return this._memSet('standings', sorted);
    }

    // Hay datos reales: recalcular desde cero sobre base de equipos del MOCK
    const base = MOCK.standings.map(s => ({ ...s, pj:0, w:0, d:0, l:0, gf:0, gc:0, pts:0 }));
    const byTeam = {};
    base.forEach(s => { byTeam[s.team] = s; });

    try {
      finished.forEach(m => {
        const h = byTeam[m.home], a = byTeam[m.away];
        if (!h || !a) return; // partidos de eliminatoria / equipos sin grupo definido
        const hs = m.scoreHome ?? 0, as = m.scoreAway ?? 0;
        h.pj++; a.pj++;
        h.gf += hs; h.gc += as;
        a.gf += as; a.gc += hs;
        if (hs > as)      { h.w++; h.pts += 3; a.l++; }
        else if (hs < as) { a.w++; a.pts += 3; h.l++; }
        else              { h.d++; a.d++; h.pts++; a.pts++; }
      });
    } catch(_) { /* si falla, queda en 0 */ }

    // Reordenar cada grupo por pts, diferencia de goles y goles a favor
    const groups = {};
    base.forEach(s => (groups[s.group] = groups[s.group] || []).push(s));
    const rows = [];
    Object.values(groups).forEach(arr => {
      arr.sort((x, y) => y.pts - x.pts || (y.gf - y.gc) - (x.gf - x.gc) || y.gf - x.gf);
      arr.forEach((s, i) => { s.pos = i + 1; rows.push(s); });
    });

    API_STATUS.usingMock = rows.every(r => r.pj === 0);
    return this._memSet('standings', rows);
  },

  /* ══════════════════════════════════════════
     EQUIPOS
  ══════════════════════════════════════════ */
  async getTeams(query = '') {
    if (!this._teamsCache) {
      // Siempre construir desde getStandings() — tiene los datos correctos
      // normalize() asegura que "México" == "mexico" == "Mexico"
      const standings = await this.getStandings().catch(() => MOCK.standings);
      const standMap  = {};
      (standings || MOCK.standings).forEach(s => {
        standMap[normalize(s.team)] = s;
      });

      // Construir lista de equipos a partir de MOCK.standings (48 equipos completos)
      // enriquecidos con stats reales de standings
      this._teamsCache = MOCK.standings.map(s => {
        const live = standMap[normalize(s.team)] || s;
        return {
          id:    `mock_${normalize(s.team).replace(/\s+/g,'_')}`,
          name:  s.team,   // nombre en español siempre
          flag:  s.flag,
          group: s.group,
          pj:  live.pj  ?? s.pj  ?? 0,
          w:   live.w   ?? s.w   ?? 0,
          d:   live.d   ?? s.d   ?? 0,
          l:   live.l   ?? s.l   ?? 0,
          gf:  live.gf  ?? s.gf  ?? 0,
          gc:  live.gc  ?? s.gc  ?? 0,
          pts: live.pts ?? s.pts ?? 0,
        };
      });
      }
    }
    if (!query) return this._teamsCache;
    return this._teamsCache.filter(t => matchesSearch(t.name||'', query));
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
    const matchTs = new Date(`${m.date}T${m.time}:00-06:00`).getTime();
    const diffMin = (Date.now() - matchTs) / 60000;
    if (diffMin > 115) return 'finished';
    if (diffMin > 0)   return 'live';
    if (diffMin > -60) return 'starting_soon';
    if (diffMin > -180) return 'closed';
    return 'upcoming';
  },

  getTimeUntilMatch(m) {
    if (!m.date || !m.time) return '';
    const diffMs = new Date(`${m.date}T${m.time}:00-06:00`).getTime() - Date.now();
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
    this._invalidateOldCache();
    localStorage.removeItem(this._lsCacheKey('upcoming'));
    localStorage.removeItem(this._lsCacheKey('standings'));
    localStorage.removeItem(this._lsCacheKey('teams'));
    localStorage.removeItem(this._lsCacheKey('finished'));

    try {
      const [live, upcoming, standings, finished] = await Promise.all([
        this.getLiveMatches(),
        this.getUpcomingMatches(),
        this.getStandings(),
        this.getFinishedMatches(),
      ]);
      // Re-cargar teams enriquecidos con standings actualizados
      await this.getTeams('').catch(() => {});
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

// Limpiar caché viejas al cargar el módulo
API._init();

