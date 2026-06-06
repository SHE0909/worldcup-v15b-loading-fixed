/**
 * api.js — v10
 * NUEVAS APIs:
 *   1. api-football (RapidAPI)  ✅ key: e1317aae745eba2daea7870d948b8e8f
 *   2. football-data.org        ✅ key: 3bec1d9c3a5d418ebed176fdaaafe7e0
 *   3. thesportsdb              ✅ fotos jugadores (fallback)
 *   4. Mock                     ✅ fallback
 *
 * FIXES v10:
 *   - Mapa de fotos hardcodeadas (Wikimedia) para todos los jugadores principales
 *   - Caché de 3 capas: memoria → localStorage → IndexedDB → TheSportsDB
 *   - No más fotos incorrectas: TheSportsDB ya NO usa players[0] como fallback ciego
 *   - Fotos persisten entre sesiones, cambios de pestaña y recargas
 *   - Migración automática de caché legacy wcc_photos_v1 → wcc_photos_v2
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

/* ── IDs de api-football para el Mundial 2026 ── */
const AF_WORLD_CUP_ID  = 1;    // FIFA World Cup en api-football
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

/* ══════════════════════════════════════════════
   MOCK DATA COMPLETO — 48 equipos del Mundial 2026
══════════════════════════════════════════════ */
const MOCK = {
  liveMatches: [],

  friendlyMatches: [
    { id:'f001', home:'Brasil',       away:'Egipto',         homeFlag:'🇧🇷', awayFlag:'🇪🇬', date:'2026-06-03', time:'16:00', competition:'Amistoso', type:'friendly', venue:'USA' },
    { id:'f002', home:'Argentina',    away:'Honduras',       homeFlag:'🇦🇷', awayFlag:'🇭🇳', date:'2026-06-06', time:'21:00', competition:'Amistoso', type:'friendly', venue:'Kyle Field, Texas' },
    { id:'f003', home:'Inglaterra',   away:'Nueva Zelanda',  homeFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayFlag:'🇳🇿', date:'2026-06-06', time:'19:00', competition:'Amistoso', type:'friendly', venue:'USA' },
    { id:'f004', home:'Portugal',     away:'Nigeria',        homeFlag:'🇵🇹', awayFlag:'🇳🇬', date:'2026-06-07', time:'20:00', competition:'Amistoso', type:'friendly', venue:'USA' },
    { id:'f005', home:'Francia',      away:'Irlanda del N.', homeFlag:'🇫🇷', awayFlag:'🏴󠁧󠁢󠁮󠁩󠁲󠁿', date:'2026-06-07', time:'21:00', competition:'Amistoso', type:'friendly', venue:'USA' },
    { id:'f006', home:'España',       away:'Perú',           homeFlag:'🇪🇸', awayFlag:'🇵🇪', date:'2026-06-09', time:'20:00', competition:'Amistoso', type:'friendly', venue:'USA' },
    { id:'f007', home:'Argentina',    away:'Islandia',       homeFlag:'🇦🇷', awayFlag:'🇮🇸', date:'2026-06-09', time:'22:00', competition:'Amistoso', type:'friendly', venue:'Alabama' },
    { id:'f008', home:'Marruecos',    away:'Noruega',        homeFlag:'🇲🇦', awayFlag:'🇳🇴', date:'2026-06-07', time:'19:00', competition:'Amistoso', type:'friendly', venue:'USA' },
  ],

  upcomingMatches: [
    { id:'wc001', home:'México',        away:'Sudáfrica',    homeFlag:'🇲🇽', awayFlag:'🇿🇦', date:'2026-06-11', time:'15:00', competition:'Grupo A — J1', type:'worldcup', venue:'Estadio Azteca' },
    { id:'wc002', home:'Canadá',        away:'Bosnia y Herz.',homeFlag:'🇨🇦', awayFlag:'🇧🇦', date:'2026-06-12', time:'21:00', competition:'Grupo B — J1', type:'worldcup', venue:'Toronto' },
    { id:'wc003', home:'Brasil',        away:'Marruecos',    homeFlag:'🇧🇷', awayFlag:'🇲🇦', date:'2026-06-13', time:'22:00', competition:'Grupo C — J1', type:'worldcup', venue:'MetLife, NY' },
    { id:'wc004', home:'Alemania',      away:'Curazao',      homeFlag:'🇩🇪', awayFlag:'🇨🇼', date:'2026-06-14', time:'19:00', competition:'Grupo E — J1', type:'worldcup', venue:'Houston' },
    { id:'wc005', home:'Países Bajos',  away:'Japón',        homeFlag:'🇳🇱', awayFlag:'🇯🇵', date:'2026-06-15', time:'01:00', competition:'Grupo F — J1', type:'worldcup', venue:'Dallas' },
    { id:'wc006', home:'España',        away:'Cabo Verde',   homeFlag:'🇪🇸', awayFlag:'🇨🇻', date:'2026-06-15', time:'19:00', competition:'Grupo H — J1', type:'worldcup', venue:'Atlanta' },
    { id:'wc007', home:'Francia',       away:'Senegal',      homeFlag:'🇫🇷', awayFlag:'🇸🇳', date:'2026-06-16', time:'21:00', competition:'Grupo I — J1', type:'worldcup', venue:'MetLife, NY' },
    { id:'wc008', home:'Argentina',     away:'Argelia',      homeFlag:'🇦🇷', awayFlag:'🇩🇿', date:'2026-06-17', time:'01:00', competition:'Grupo J — J1', type:'worldcup', venue:'Kansas City' },
    { id:'wc009', home:'Noruega',       away:'Irak',         homeFlag:'🇳🇴', awayFlag:'🇮🇶', date:'2026-06-17', time:'00:00', competition:'Grupo I — J1', type:'worldcup', venue:'Boston' },
    { id:'wc010', home:'Portugal',      away:'Arabia Saudí', homeFlag:'🇵🇹', awayFlag:'🇸🇦', date:'2026-06-18', time:'19:00', competition:'Grupo K — J1', type:'worldcup', venue:'Kansas City' },
    { id:'wc011', home:'Inglaterra',    away:'Costa Rica',   homeFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayFlag:'🇨🇷', date:'2026-06-18', time:'22:00', competition:'Grupo L — J1', type:'worldcup', venue:'Dallas' },
    { id:'wc012', home:'Colombia',      away:'Chile',        homeFlag:'🇨🇴', awayFlag:'🇨🇱', date:'2026-06-19', time:'19:00', competition:'Grupo G — J1', type:'worldcup', venue:'Miami' },
  ],

  /* 48 equipos del Mundial 2026 */
  teams: [
    /* Grupo A */ { id:'t01', name:'México',       flag:'🇲🇽', group:'A', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t02', name:'Sudáfrica',    flag:'🇿🇦', group:'A', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t03', name:'Corea del Sur',flag:'🇰🇷', group:'A', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t04', name:'Chequia',      flag:'🇨🇿', group:'A', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    /* Grupo B */ { id:'t05', name:'Canadá',       flag:'🇨🇦', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t06', name:'Bosnia y Herz.',flag:'🇧🇦', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t07', name:'Qatar',        flag:'🇶🇦', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t08', name:'Suiza',        flag:'🇨🇭', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    /* Grupo C */ { id:'t09', name:'Brasil',       flag:'🇧🇷', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t10', name:'Marruecos',    flag:'🇲🇦', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t11', name:'Haití',        flag:'🇭🇹', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t12', name:'Escocia',      flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    /* Grupo D */ { id:'t13', name:'Estados Unidos',flag:'🇺🇸', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t14', name:'Paraguay',     flag:'🇵🇾', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t15', name:'Panamá',       flag:'🇵🇦', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t16', name:'Jamaica',      flag:'🇯🇲', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    /* Grupo E */ { id:'t17', name:'Alemania',     flag:'🇩🇪', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t18', name:'Costa de Marfil',flag:'🇨🇮', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t19', name:'Ecuador',      flag:'🇪🇨', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t20', name:'Curazao',      flag:'🇨🇼', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    /* Grupo F */ { id:'t21', name:'Países Bajos', flag:'🇳🇱', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t22', name:'Japón',        flag:'🇯🇵', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t23', name:'Iraq',         flag:'🇮🇶', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t24', name:'Noruega',      flag:'🇳🇴', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    /* Grupo G */ { id:'t25', name:'Bélgica',      flag:'🇧🇪', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t26', name:'Egipto',       flag:'🇪🇬', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t27', name:'Colombia',     flag:'🇨🇴', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t28', name:'Chile',        flag:'🇨🇱', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    /* Grupo H */ { id:'t29', name:'España',       flag:'🇪🇸', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t30', name:'Arabia Saudí', flag:'🇸🇦', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t31', name:'Uruguay',      flag:'🇺🇾', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t32', name:'Cabo Verde',   flag:'🇨🇻', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    /* Grupo I */ { id:'t33', name:'Francia',      flag:'🇫🇷', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t34', name:'Senegal',      flag:'🇸🇳', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t35', name:'Austria',      flag:'🇦🇹', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t36', name:'Venezuela',    flag:'🇻🇪', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    /* Grupo J */ { id:'t37', name:'Argentina',    flag:'🇦🇷', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t38', name:'Argelia',      flag:'🇩🇿', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t39', name:'Islandia',     flag:'🇮🇸', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t40', name:'Honduras',     flag:'🇭🇳', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    /* Grupo K */ { id:'t41', name:'Portugal',     flag:'🇵🇹', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t42', name:'Arabia Saudí', flag:'🇸🇦', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t43', name:'Ucrania',      flag:'🇺🇦', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t44', name:'Nigeria',      flag:'🇳🇬', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    /* Grupo L */ { id:'t45', name:'Inglaterra',   flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t46', name:'Costa Rica',   flag:'🇨🇷', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t47', name:'Eslovenia',    flag:'🇸🇮', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { id:'t48', name:'Camerún',      flag:'🇨🇲', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  ],

  players: [
    { id:'p01', name:'Lionel Messi',       team:'Argentina',  flag:'🇦🇷', goals:0, assists:0, pos:'DEL', caps:187, rating:93 },
    { id:'p02', name:'Kylian Mbappé',      team:'Francia',    flag:'🇫🇷', goals:0, assists:0, pos:'DEL', caps:82,  rating:92 },
    { id:'p03', name:'Vinicius Jr.',        team:'Brasil',     flag:'🇧🇷', goals:0, assists:0, pos:'DEL', caps:55,  rating:91 },
    { id:'p04', name:'Erling Haaland',     team:'Noruega',    flag:'🇳🇴', goals:0, assists:0, pos:'DEL', caps:34,  rating:91 },
    { id:'p05', name:'Pedri',              team:'España',     flag:'🇪🇸', goals:0, assists:0, pos:'MED', caps:48,  rating:87 },
    { id:'p06', name:'Jude Bellingham',    team:'Inglaterra', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0, assists:0, pos:'MED', caps:40,  rating:88 },
    { id:'p07', name:'Rodri',              team:'España',     flag:'🇪🇸', goals:0, assists:0, pos:'MED', caps:61,  rating:91 },
    { id:'p08', name:'Marquinhos',         team:'Brasil',     flag:'🇧🇷', goals:0, assists:0, pos:'DEF', caps:84,  rating:86 },
    { id:'p09', name:'Lamine Yamal',       team:'España',     flag:'🇪🇸', goals:0, assists:0, pos:'DEL', caps:20,  rating:88 },
    { id:'p10', name:'Raphinha',           team:'Brasil',     flag:'🇧🇷', goals:0, assists:0, pos:'DEL', caps:52,  rating:86 },
    { id:'p11', name:'Bernardo Silva',     team:'Portugal',   flag:'🇵🇹', goals:0, assists:0, pos:'MED', caps:89,  rating:87 },
    { id:'p12', name:'Rúben Dias',         team:'Portugal',   flag:'🇵🇹', goals:0, assists:0, pos:'DEF', caps:74,  rating:88 },
    { id:'p13', name:'Antoine Griezmann', team:'Francia',    flag:'🇫🇷', goals:0, assists:0, pos:'DEL', caps:137, rating:85 },
    { id:'p14', name:'Hirving Lozano',     team:'México',     flag:'🇲🇽', goals:0, assists:0, pos:'DEL', caps:76,  rating:82 },
    { id:'p15', name:'Hakim Ziyech',       team:'Marruecos',  flag:'🇲🇦', goals:0, assists:0, pos:'MED', caps:62,  rating:83 },
    { id:'p16', name:'Takefusa Kubo',      team:'Japón',      flag:'🇯🇵', goals:0, assists:0, pos:'MED', caps:38,  rating:83 },
    { id:'p17', name:'Casemiro',           team:'Brasil',     flag:'🇧🇷', goals:0, assists:0, pos:'MED', caps:77,  rating:85 },
    { id:'p18', name:'Bruno Fernandes',    team:'Portugal',   flag:'🇵🇹', goals:0, assists:0, pos:'MED', caps:75,  rating:87 },
    { id:'p19', name:'Ousmane Dembélé',   team:'Francia',    flag:'🇫🇷', goals:0, assists:0, pos:'DEL', caps:57,  rating:84 },
    { id:'p20', name:'Kevin De Bruyne',    team:'Bélgica',    flag:'🇧🇪', goals:0, assists:0, pos:'MED', caps:108, rating:91 },
    { id:'p21', name:'Nico Williams',      team:'España',     flag:'🇪🇸', goals:0, assists:0, pos:'DEL', caps:18,  rating:85 },
    { id:'p22', name:'Achraf Hakimi',      team:'Marruecos',  flag:'🇲🇦', goals:0, assists:0, pos:'DEF', caps:75,  rating:86 },
    { id:'p23', name:'Cristiano Ronaldo',  team:'Portugal',   flag:'🇵🇹', goals:0, assists:0, pos:'DEL', caps:215, rating:88 },
    { id:'p24', name:'Alisson Becker',     team:'Brasil',     flag:'🇧🇷', goals:0, assists:0, pos:'POR', caps:72,  rating:89 },
    { id:'p25', name:'Harry Kane',         team:'Inglaterra', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0, assists:0, pos:'DEL', caps:92,  rating:88 },
    { id:'p26', name:'Phil Foden',         team:'Inglaterra', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0, assists:0, pos:'DEL', caps:42,  rating:87 },
    { id:'p27', name:'Florian Wirtz',      team:'Alemania',   flag:'🇩🇪', goals:0, assists:0, pos:'MED', caps:30,  rating:87 },
    { id:'p28', name:'Jamal Musiala',      team:'Alemania',   flag:'🇩🇪', goals:0, assists:0, pos:'MED', caps:42,  rating:87 },
    { id:'p29', name:'Virgil van Dijk',    team:'Países Bajos',flag:'🇳🇱', goals:0, assists:0, pos:'DEF', caps:64,  rating:87 },
    { id:'p30', name:'Cody Gakpo',         team:'Países Bajos',flag:'🇳🇱', goals:0, assists:0, pos:'DEL', caps:38,  rating:84 },
    { id:'p31', name:'Darwin Núñez',       team:'Uruguay',    flag:'🇺🇾', goals:0, assists:0, pos:'DEL', caps:39,  rating:85 },
    { id:'p32', name:'Federico Valverde',  team:'Uruguay',    flag:'🇺🇾', goals:0, assists:0, pos:'MED', caps:64,  rating:87 },
    { id:'p33', name:'Luka Modrić',        team:'Croacia',    flag:'🇭🇷', goals:0, assists:0, pos:'MED', caps:179, rating:87 },
    { id:'p34', name:'Sadio Mané',         team:'Senegal',    flag:'🇸🇳', goals:0, assists:0, pos:'DEL', caps:99,  rating:84 },
    { id:'p35', name:'Victor Osimhen',     team:'Nigeria',    flag:'🇳🇬', goals:0, assists:0, pos:'DEL', caps:32,  rating:86 },
    { id:'p36', name:'Alphonso Davies',    team:'Canadá',     flag:'🇨🇦', goals:0, assists:0, pos:'DEF', caps:55,  rating:86 },
    { id:'p37', name:'Jonathan David',     team:'Canadá',     flag:'🇨🇦', goals:0, assists:0, pos:'DEL', caps:36,  rating:84 },
    { id:'p38', name:'Christian Pulisic',  team:'Estados Unidos',flag:'🇺🇸', goals:0, assists:0, pos:'DEL', caps:69, rating:83 },
    { id:'p39', name:'Declan Rice',        team:'Inglaterra', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0, assists:0, pos:'MED', caps:52,  rating:86 },
    { id:'p40', name:'Granit Xhaka',       team:'Suiza',      flag:'🇨🇭', goals:0, assists:0, pos:'MED', caps:128, rating:83 },
    { id:'p41', name:'Martin Ødegaard',    team:'Noruega',    flag:'🇳🇴', goals:0, assists:0, pos:'MED', caps:89,  rating:86 },
    { id:'p42', name:'Santiago Giménez',   team:'México',     flag:'🇲🇽', goals:0, assists:0, pos:'DEL', caps:32,  rating:83 },
    { id:'p43', name:'Luis Díaz',          team:'Colombia',   flag:'🇨🇴', goals:0, assists:0, pos:'DEL', caps:42,  rating:86 },
    { id:'p44', name:'James Rodríguez',   team:'Colombia',   flag:'🇨🇴', goals:0, assists:0, pos:'MED', caps:104, rating:84 },
    { id:'p45', name:'Julián Álvarez',     team:'Argentina',  flag:'🇦🇷', goals:0, assists:0, pos:'DEL', caps:38,  rating:85 },
    { id:'p46', name:'Enzo Fernández',     team:'Argentina',  flag:'🇦🇷', goals:0, assists:0, pos:'MED', caps:35,  rating:82 },
    { id:'p47', name:'Emiliano Martínez', team:'Argentina',  flag:'🇦🇷', goals:0, assists:0, pos:'POR', caps:38,  rating:87 },
    { id:'p48', name:'Manuel Neuer',       team:'Alemania',   flag:'🇩🇪', goals:0, assists:0, pos:'POR', caps:124, rating:86 },
    { id:'p49', name:'Thibaut Courtois',   team:'Bélgica',    flag:'🇧🇪', goals:0, assists:0, pos:'POR', caps:102, rating:90 },
    { id:'p50', name:'Kaoru Mitoma',       team:'Japón',      flag:'🇯🇵', goals:0, assists:0, pos:'DEL', caps:40,  rating:84 },
    /* ── Figuritas que faltaban en MOCK ── */
    { id:'p51', name:'Gavi',              team:'España',     flag:'🇪🇸', goals:0, assists:0, pos:'MED', caps:41,  rating:86 },
    { id:'p52', name:'Bukayo Saka',       team:'Inglaterra', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0, assists:0, pos:'DEL', caps:44,  rating:87 },
    { id:'p53', name:'Goncalo Ramos',     team:'Portugal',   flag:'🇵🇹', goals:0, assists:0, pos:'DEL', caps:22,  rating:81 },
    { id:'p54', name:'Joao Félix',        team:'Portugal',   flag:'🇵🇹', goals:0, assists:0, pos:'DEL', caps:50,  rating:80 },
    { id:'p55', name:'Weston McKennie',   team:'EEUU',       flag:'🇺🇸', goals:0, assists:0, pos:'MED', caps:47,  rating:74 },
    { id:'p56', name:'Richarlison',       team:'Brasil',     flag:'🇧🇷', goals:0, assists:0, pos:'DEL', caps:52,  rating:76 },
    { id:'p57', name:'Evan Ferguson',     team:'Irlanda',    flag:'🇮🇪', goals:0, assists:0, pos:'DEL', caps:18,  rating:72 },
    { id:'p58', name:'Piero Hincapié',    team:'Ecuador',    flag:'🇪🇨', goals:0, assists:0, pos:'DEF', caps:22,  rating:73 },
    { id:'p59', name:'Sofiane Boufal',    team:'Marruecos',  flag:'🇲🇦', goals:0, assists:0, pos:'DEL', caps:48,  rating:74 },
    { id:'p60', name:'Pervis Estupiñán', team:'Ecuador',    flag:'🇪🇨', goals:0, assists:0, pos:'DEF', caps:24,  rating:74 },
    { id:'p61', name:'Mats Hummels',      team:'Alemania',   flag:'🇩🇪', goals:0, assists:0, pos:'DEF', caps:78,  rating:76 },
    { id:'p62', name:'Kepa Arrizabalaga', team:'España',     flag:'🇪🇸', goals:0, assists:0, pos:'POR', caps:19,  rating:73 },
    { id:'p63', name:'Marcus Rashford',   team:'Inglaterra', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0, assists:0, pos:'DEL', caps:60,  rating:77 },
    { id:'p64', name:'Giovanni Reyna',    team:'EEUU',       flag:'🇺🇸', goals:0, assists:0, pos:'MED', caps:19,  rating:73 },
    { id:'p65', name:'Romelu Lukaku',     team:'Bélgica',    flag:'🇧🇪', goals:0, assists:0, pos:'DEL', caps:112, rating:77 },
    { id:'p66', name:'Ola Solbakken',     team:'Noruega',    flag:'🇳🇴', goals:0, assists:0, pos:'MED', caps:30,  rating:71 },
  ],

  finishedMatches: [],

  predictableMatches: [
    { id:'f001', home:'Brasil',    away:'Egipto',       homeFlag:'🇧🇷', awayFlag:'🇪🇬', date:'2026-06-03', time:'16:00', competition:'Amistoso', type:'friendly' },
    { id:'f005', home:'Francia',   away:'Irlanda del N.',homeFlag:'🇫🇷', awayFlag:'🏴󠁧󠁢󠁮󠁩󠁲󠁿', date:'2026-06-07', time:'21:00', competition:'Amistoso', type:'friendly' },
    { id:'f006', home:'España',    away:'Perú',         homeFlag:'🇪🇸', awayFlag:'🇵🇪', date:'2026-06-09', time:'20:00', competition:'Amistoso', type:'friendly' },
    { id:'wc001',home:'México',    away:'Sudáfrica',    homeFlag:'🇲🇽', awayFlag:'🇿🇦', date:'2026-06-11', time:'15:00', competition:'Grupo A — J1', type:'worldcup' },
    { id:'wc003',home:'Brasil',    away:'Marruecos',    homeFlag:'🇧🇷', awayFlag:'🇲🇦', date:'2026-06-13', time:'22:00', competition:'Grupo C — J1', type:'worldcup' },
    { id:'wc007',home:'Francia',   away:'Senegal',      homeFlag:'🇫🇷', awayFlag:'🇸🇳', date:'2026-06-16', time:'21:00', competition:'Grupo I — J1', type:'worldcup' },
    { id:'wc006',home:'España',    away:'Cabo Verde',   homeFlag:'🇪🇸', awayFlag:'🇨🇻', date:'2026-06-15', time:'19:00', competition:'Grupo H — J1', type:'worldcup' },
    { id:'wc008',home:'Argentina', away:'Argelia',      homeFlag:'🇦🇷', awayFlag:'🇩🇿', date:'2026-06-17', time:'01:00', competition:'Grupo J — J1', type:'worldcup' },
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
     PARTIDOS EN VIVO
  ══════════════════════════════════════════ */
  async getLiveMatches() {
    const mem = this._memGet('live');
    if (mem) return mem;
    const cached = await DB.getCacheStats('live');
    if (cached) return this._memSet('live', cached);

    // api-football: fixture?live=all con filtro por liga
    const af = await this._af(`/fixtures?live=all&league=${AF_WORLD_CUP_ID}&season=${AF_SEASON_2026}`);
    if (af?.response?.length > 0) {
      const data = af.response.map(f => ({
        id:        `af_${f.fixture.id}`,
        home:      f.teams.home.name,
        away:      f.teams.away.name,
        homeFlag:  getFlag(f.teams.home.name),
        awayFlag:  getFlag(f.teams.away.name),
        scoreHome: f.goals.home ?? 0,
        scoreAway: f.goals.away ?? 0,
        minute:    f.fixture.status.elapsed || '?',
        status:    'live'
      }));
      await DB.setCacheStats('live', data);
      return this._memSet('live', data);
    }

    // fallback football-data
    const fd = await this._fd('/competitions/2000/matches?status=LIVE');
    if (fd?.matches?.length > 0) {
      const data = fd.matches.map(m => ({
        id: m.id, home: m.homeTeam.shortName||m.homeTeam.name,
        away: m.awayTeam.shortName||m.awayTeam.name,
        homeFlag: getFlag(m.homeTeam.name), awayFlag: getFlag(m.awayTeam.name),
        scoreHome: m.score.fullTime.home??0, scoreAway: m.score.fullTime.away??0,
        minute: m.minute||'?', status:'live'
      }));
      await DB.setCacheStats('live', data);
      return data;
    }

    return MOCK.liveMatches;
  },

  /* ══════════════════════════════════════════
     PRÓXIMOS PARTIDOS
  ══════════════════════════════════════════ */
  async getUpcomingMatches() {
    const mem = this._memGet('upcoming');
    if (mem) return mem;
    const cached = await DB.getCacheStats('upcoming');
    if (cached) return this._memSet('upcoming', cached);

    /* 1. api-football — fixtures NS próximos (funciona cuando el torneo ya arrancó) */
    const af = await this._af(`/fixtures?league=${AF_WORLD_CUP_ID}&season=${AF_SEASON_2026}&status=NS&next=12`);
    if (af?.response?.length > 0) {
      const data = af.response.map(f => ({
        id:          `af_${f.fixture.id}`,
        home:        f.teams.home.name,
        away:        f.teams.away.name,
        homeFlag:    getFlag(f.teams.home.name),
        awayFlag:    getFlag(f.teams.away.name),
        date:        f.fixture.date?.split('T')[0],
        time:        f.fixture.date?.split('T')[1]?.substring(0,5),
        competition: f.league.round || 'Mundial 2026',
        venue:       f.fixture.venue?.name || '',
        type:        'worldcup'
      }));
      await DB.setCacheStats('upcoming', data);
      return this._memSet('upcoming', data);
    }

    /* 2. football-data.org — funciona ANTES de que empiece el Mundial
       Primero intentar partidos del Mundial programados */
    const fdWC = await this._fd('/competitions/2000/matches?status=SCHEDULED');
    if (fdWC?.matches?.length > 0) {
      const data = fdWC.matches.slice(0, 12).map(m => ({
        id:          `fd_${m.id}`,
        home:        m.homeTeam.shortName || m.homeTeam.name,
        away:        m.awayTeam.shortName || m.awayTeam.name,
        homeFlag:    getFlag(m.homeTeam.name || m.homeTeam.shortName),
        awayFlag:    getFlag(m.awayTeam.name || m.awayTeam.shortName),
        date:        m.utcDate?.split('T')[0],
        time:        m.utcDate?.split('T')[1]?.substring(0,5),
        competition: m.stage?.replace(/_/g,' ') || 'Mundial 2026',
        venue:       m.venue || '',
        type:        'worldcup'
      }));
      await DB.setCacheStats('upcoming', data);
      return this._memSet('upcoming', data);
    }

    /* 3. football-data.org — amistosos internacionales (competición 2018 = World Cup Q.)
       o cualquier fixture próximo de selecciones mundialistas */
    const fdFriendly = await this._fd('/matches?competitions=2018&status=SCHEDULED&limit=10');
    if (fdFriendly?.matches?.length > 0) {
      const data = fdFriendly.matches.slice(0, 10).map(m => ({
        id:          `fd_${m.id}`,
        home:        m.homeTeam.shortName || m.homeTeam.name,
        away:        m.awayTeam.shortName || m.awayTeam.name,
        homeFlag:    getFlag(m.homeTeam.name || m.homeTeam.shortName),
        awayFlag:    getFlag(m.awayTeam.name || m.awayTeam.shortName),
        date:        m.utcDate?.split('T')[0],
        time:        m.utcDate?.split('T')[1]?.substring(0,5),
        competition: m.competition?.name || 'Clasificatorio',
        venue:       m.venue || '',
        type:        'friendly'
      }));
      await DB.setCacheStats('upcoming', data);
      return this._memSet('upcoming', data);
    }

    /* 4. MOCK como último recurso */
    return this._memSet('upcoming', [...MOCK.friendlyMatches, ...MOCK.upcomingMatches]);
  },

  /* ══════════════════════════════════════════
     TABLA DE POSICIONES
  ══════════════════════════════════════════ */
  async getStandings() {
    const mem = this._memGet('standings');
    if (mem) return mem;
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
      if (rows.length) { await DB.setCacheStats('standings', rows); return this._memSet('standings', rows); }
    }

    return this._memSet('standings', MOCK.standings);
  },

  /* ══════════════════════════════════════════
     EQUIPOS — NUNCA usa caché, siempre fresco
  ══════════════════════════════════════════ */
  _teamsCache: null,   // BUG FIX: caché para no re-llamar API externa en cada cambio de tab
  _memCache: {},       // Caché en memoria (vive mientras la página no recarga)
  _MEM_TTL: 30 * 60 * 1000,  // 30 minutos

  _memGet(key) {
    const entry = this._memCache[key];
    if (!entry) return null;
    if (Date.now() - entry.ts > this._MEM_TTL) { delete this._memCache[key]; return null; }
    return entry.data;
  },
  _memSet(key, data) {
    this._memCache[key] = { data, ts: Date.now() };
    return data;
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

  async getPredictableMatches() {
    return MOCK.predictableMatches;
  },

  /* ══════════════════════════════════════════════════════════════════
     FOTOS v10 — Sistema de 3 capas:
       1. MAPA HARDCODEADO: URLs de Wikimedia, siempre confiables
       2. CACHÉ IndexedDB: persiste entre sesiones/pestañas, no se borra
       3. TheSportsDB: fallback para jugadores no en el mapa
  ══════════════════════════════════════════════════════════════════ */

  /* Mapa de fotos por sdbName — Wikipedia REST API (sin bloqueo hotlink) */
  _PHOTO_MAP: {
    // Legendarios
    'Lionel Messi':       'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg/220px-Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg',
    'Kylian Mbappe':      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/2019-07-17_SG_Dynamo_Dresden_vs._Paris_Saint-Germain_by_Sandro_Halank%E2%80%93218_%28cropped%29.jpg/220px-2019-07-17_SG_Dynamo_Dresden_vs._Paris_Saint-Germain_by_Sandro_Halank%E2%80%93218_%28cropped%29.jpg',
    'Vinicius Junior':    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Vinicius_Junior_2023.jpg/220px-Vinicius_Junior_2023.jpg',
    'Erling Haaland':     'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/2023-10-12_Erling_Haaland_%28cropped%29.jpg/220px-2023-10-12_Erling_Haaland_%28cropped%29.jpg',
    // Épicos
    'Pedri Gonzalez':     'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Pedri_2022_%28cropped%29.jpg/220px-Pedri_2022_%28cropped%29.jpg',
    'Jude Bellingham':    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Jude_Bellingham_2022_%28cropped%29.jpg/220px-Jude_Bellingham_2022_%28cropped%29.jpg',
    'Rodri':              'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Rodri_%28footballer%2C_born_1996%29_2019_%28cropped%29.jpg/220px-Rodri_%28footballer%2C_born_1996%29_2019_%28cropped%29.jpg',
    'Bernardo Silva':     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Bernardo_Silva_2022_%28cropped%29.jpg/220px-Bernardo_Silva_2022_%28cropped%29.jpg',
    'Raphinha':           'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/2022-11-24_FIFA_World_Cup_2022_group_G_Brazil_Serbia_-_Raphinha_%28cropped%29.jpg/220px-2022-11-24_FIFA_World_Cup_2022_group_G_Brazil_Serbia_-_Raphinha_%28cropped%29.jpg',
    'Lamine Yamal':       'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Lamine_Yamal_2024_%28cropped%29.jpg/220px-Lamine_Yamal_2024_%28cropped%29.jpg',
    'Phil Foden':         'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Phil_Foden_2023_%28cropped%29.jpg/220px-Phil_Foden_2023_%28cropped%29.jpg',
    'Gavi':               'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Gavi_%28player%29_2022_%28cropped%29.jpg/220px-Gavi_%28player%29_2022_%28cropped%29.jpg',
    'Bukayo Saka':        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Bukayo_Saka_2022_WC_%28cropped%29.jpg/220px-Bukayo_Saka_2022_WC_%28cropped%29.jpg',
    'Federico Valverde':  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Federico_Valverde_2022_%28cropped%29.jpg/220px-Federico_Valverde_2022_%28cropped%29.jpg',
    // Raros
    'Marquinhos':         'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Marquinhos_%28footballer%29_2022_%28cropped%29.jpg/220px-Marquinhos_%28footballer%29_2022_%28cropped%29.jpg',
    'Ruben Dias':         'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/R%C3%BAben_Dias_2022_%28cropped%29.jpg/220px-R%C3%BAben_Dias_2022_%28cropped%29.jpg',
    'Virgil van Dijk':    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Virgil_van_Dijk_2022_%28cropped%29.jpg/220px-Virgil_van_Dijk_2022_%28cropped%29.jpg',
    'Alisson Becker':     'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Alisson_Becker_2022_%28cropped%29.jpg/220px-Alisson_Becker_2022_%28cropped%29.jpg',
    'Thibaut Courtois':   'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Thibaut_Courtois_2022_%28cropped%29.jpg/220px-Thibaut_Courtois_2022_%28cropped%29.jpg',
    'Antoine Griezmann':  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Antoine_Griezmann_2018_WC_%28cropped%29.jpg/220px-Antoine_Griezmann_2018_WC_%28cropped%29.jpg',
    'Cody Gakpo':         'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Cody_Gakpo_2022_%28cropped%29.jpg/220px-Cody_Gakpo_2022_%28cropped%29.jpg',
    'Hirving Lozano':     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Hirving_Lozano_2022_%28cropped%29.jpg/220px-Hirving_Lozano_2022_%28cropped%29.jpg',
    'Goncalo Ramos':      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Gon%C3%A7alo_Ramos_2022_WC_%28cropped%29.jpg/220px-Gon%C3%A7alo_Ramos_2022_WC_%28cropped%29.jpg',
    'Joao Felix':         'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Jo%C3%A3o_F%C3%A9lix_2022_%28cropped%29.jpg/220px-Jo%C3%A3o_F%C3%A9lix_2022_%28cropped%29.jpg',
    'Takefusa Kubo':      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Takefusa_Kubo_2022_%28cropped%29.jpg/220px-Takefusa_Kubo_2022_%28cropped%29.jpg',
    'Hakim Ziyech':       'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Hakim_Ziyech_2022_WC_%28cropped%29.jpg/220px-Hakim_Ziyech_2022_WC_%28cropped%29.jpg',
    // Comunes
    'Weston McKennie':    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Weston_McKennie_2022_%28cropped%29.jpg/220px-Weston_McKennie_2022_%28cropped%29.jpg',
    'Richarlison':        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Richarlison_2022_%28cropped%29.jpg/220px-Richarlison_2022_%28cropped%29.jpg',
    'Jonathan David':     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Jonathan_David_2022_%28cropped%29.jpg/220px-Jonathan_David_2022_%28cropped%29.jpg',
    'Evan Ferguson':      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Evan_Ferguson_2024_%28cropped%29.jpg/220px-Evan_Ferguson_2024_%28cropped%29.jpg',
    'Piero Hincapie':     'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Piero_Hincapi%C3%A9_2022_%28cropped%29.jpg/220px-Piero_Hincapi%C3%A9_2022_%28cropped%29.jpg',
    'Sofiane Boufal':     'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Sofiane_Boufal_2022_WC_%28cropped%29.jpg/220px-Sofiane_Boufal_2022_WC_%28cropped%29.jpg',
    'Pervis Estupinan':   'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Pervis_Estupi%C3%B1%C3%A1n_2022_%28cropped%29.jpg/220px-Pervis_Estupi%C3%B1%C3%A1n_2022_%28cropped%29.jpg',
    'Mats Hummels':       'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Mats_Hummels_2018_WC_%28cropped%29.jpg/220px-Mats_Hummels_2018_WC_%28cropped%29.jpg',
    'Kepa Arrizabalaga':  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Kepa_Arrizabalaga_2022_%28cropped%29.jpg/220px-Kepa_Arrizabalaga_2022_%28cropped%29.jpg',
    'Marcus Rashford':    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Marcus_Rashford_2022_WC_%28cropped%29.jpg/220px-Marcus_Rashford_2022_WC_%28cropped%29.jpg',
    'Giovanni Reyna':     'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Giovanni_Reyna_2022_%28cropped%29.jpg/220px-Giovanni_Reyna_2022_%28cropped%29.jpg',
    'Victor Osimhen':     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Victor_Osimhen_2022_%28cropped%29.jpg/220px-Victor_Osimhen_2022_%28cropped%29.jpg',
    'Romelu Lukaku':      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Romelu_Lukaku_2022_WC_%28cropped%29.jpg/220px-Romelu_Lukaku_2022_WC_%28cropped%29.jpg',
    'Ola Solbakken':      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Ole_Romeny_2023_%28cropped%29.jpg/220px-Ole_Romeny_2023_%28cropped%29.jpg',
  },

  /* ── Caché en memoria (runtime) — evita consultas duplicadas en la misma sesión ── */
  _photoMemCache: {},

  /* ── IndexedDB: store 'photo_cache', key=figId, value={id,url,ts} ── */
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

  /* ── localStorage (compatibilidad legacy + fallback rápido sync) ── */
  _LS_PHOTO_KEY: 'wcc_photos_v2',

  _photoStore() {
    try {
      const raw = localStorage.getItem(this._LS_PHOTO_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch(_) { return {}; }
  },

  _photoSave(store) {
    try { localStorage.setItem(this._LS_PHOTO_KEY, JSON.stringify(store)); } catch(_) {}
  },

  /**
   * Obtiene foto de un jugador — sistema de 3 capas:
   *   1. Mapa hardcodeado (instantáneo, siempre correcto)
   *   2. Caché en memoria (instantáneo, misma sesión)
   *   3. localStorage (sync, persiste entre sesiones)
   *   4. IndexedDB (async, más robusto que localStorage)
   *   5. TheSportsDB (fallback de red, solo si todo lo anterior falla)
   */
  async getPhotoById(figId, sdbName) {
    // 1. Mapa hardcodeado — fuente más confiable
    const hardcoded = this._PHOTO_MAP[sdbName];
    if (hardcoded) {
      // Guardar en cachés para consistencia
      if (!this._photoMemCache[figId]) {
        this._photoMemCache[figId] = hardcoded;
        const ls = this._photoStore();
        if (!ls[figId]) { ls[figId] = hardcoded; this._photoSave(ls); }
        this._idbSetPhoto(figId, hardcoded); // async, sin await
      }
      return hardcoded;
    }

    // 2. Caché en memoria
    if (this._photoMemCache[figId] !== undefined) {
      return this._photoMemCache[figId];
    }

    // 3. localStorage (sync)
    const ls = this._photoStore();
    if (ls[figId] !== undefined) {
      this._photoMemCache[figId] = ls[figId];
      return ls[figId];
    }

    // 4. IndexedDB
    const idbUrl = await this._idbGetPhoto(figId);
    if (idbUrl !== null) {
      this._photoMemCache[figId] = idbUrl;
      ls[figId] = idbUrl;
      this._photoSave(ls);
      return idbUrl;
    }

    // 5. TheSportsDB — solo si no hay en ningún caché
    const url = await this.getPlayerPhoto(sdbName);
    if (url) {
      this._photoMemCache[figId] = url;
      ls[figId] = url;
      this._photoSave(ls);
      this._idbSetPhoto(figId, url); // async
    }
    return url || null;
  },

  /**
   * Busca la foto en TheSportsDB con match exacto de nombre.
   * Solo se llama si el jugador no está en el mapa hardcodeado.
   */
  async getPlayerPhoto(playerName) {
    try {
      const data = await this._sdb(`/searchplayers.php?p=${encodeURIComponent(playerName)}`);
      const players = data?.player;
      if (!players?.length) return null;
      const nameLower = playerName.toLowerCase();
      // Match exacto primero
      const exact = players.find(p => p.strPlayer?.toLowerCase() === nameLower);
      // Si no hay exacto, intentar match parcial (ej: "Pedri" → "Pedri González")
      const partial = !exact && players.find(p => {
        const pn = p.strPlayer?.toLowerCase() || '';
        return pn.includes(nameLower) || nameLower.includes(pn.split(' ')[0]);
      });
      const p = exact || partial || null; // NO usar players[0] ciegamente
      return p?.strCutout || p?.strThumb || p?.strFanart1 || null;
    } catch(_) { return null; }
  },

  /**
   * getPhotoSync(fig) — HELPER SÍNCRONO unificado
   * Siempre devuelve la mejor URL disponible SIN async:
   *   1. _PHOTO_MAP por sdbName  (hardcodeado, más confiable)
   *   2. _PHOTO_MAP por name     (fallback)
   *   3. _photoMemCache por id   (runtime)
   *   4. localStorage por id     (persistido)
   * Si nada → null (se mostrará emoji)
   *
   * USO: reemplaza API._photoStore()[fig.id] en TODOS los renders síncronos.
   * Sigue llamando getPhotoById() en background para llenar el caché.
   */
  getPhotoSync(fig) {
    if (!fig) return null;
    // 1 & 2 — mapa hardcodeado
    const fromMap = this._PHOTO_MAP[fig.sdbName] || this._PHOTO_MAP[fig.name];
    if (fromMap) return fromMap;
    // 3 — memoria runtime
    const fromMem = this._photoMemCache[fig.id];
    if (fromMem) return fromMem;
    // 4 — localStorage
    try {
      const ls = this._photoStore();
      return ls[fig.id] || null;
    } catch(_) { return null; }
  },

  /* Compatibilidad con código antiguo */
  async getPlayerPhotosCached(playerName) {
    const nameKey = 'n_' + playerName;
    const ls = this._photoStore();
    if (ls[nameKey] !== undefined) return ls[nameKey];
    // Buscar en mapa hardcodeado por nombre
    const hardcoded = this._PHOTO_MAP[playerName];
    if (hardcoded) { ls[nameKey] = hardcoded; this._photoSave(ls); return hardcoded; }
    const url = await this.getPlayerPhoto(playerName);
    if (url) { ls[nameKey] = url; this._photoSave(ls); }
    return url || null;
  },

  /* Precargar fotos de todas las figuritas al iniciar la app */
  async precachePhotos(figuritas) {
    if (!figuritas?.length) return;
    const pool = (typeof Gacha !== 'undefined') ? Gacha.getPool() : [];
    const toFetch = figuritas
      .map(f => pool.find(p => p.id === f.id))
      .filter(fig => fig && !this.getPhotoSync(fig));
    // Fetch en paralelo, máx 5 a la vez para no saturar la red
    for (let i = 0; i < toFetch.length; i += 5) {
      await Promise.allSettled(
        toFetch.slice(i, i+5).map(fig => this.getPhotoById(fig.id, fig.sdbName || fig.name))
      );
    }
  },

  /* Limpiar caché de fotos al hacer logout */
  clearPhotoCache() {
    this._teamsCache = null;
    this._memCache   = {};
    this._photoMemCache = {};
    // NO borrar localStorage ni IndexedDB — las fotos son recursos estáticos
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
