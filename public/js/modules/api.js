const BASE_API_WC26 = 'https://winter-thunder-a7a0.cq22003.workers.dev';

const SOLO_DATOS_MOCK = false;

const ESTADO_API = {
  usingMock:   false,
  lastError:   null,
  lastSuccess: null,
};

const BANDERAS_EQUIPOS = {
  'México':'🇲🇽','Mexico':'🇲🇽','Brasil':'🇧🇷','Brazil':'🇧🇷',
  'Argentina':'🇦🇷','Francia':'🇫🇷','France':'🇫🇷','España':'🇪🇸','Spain':'🇪🇸',
  'Alemania':'🇩🇪','Germany':'🇩🇪','Portugal':'🇵🇹','Marruecos':'🇲🇦','Morocco':'🇲🇦',
  'Japón':'🇯🇵','Japan':'🇯🇵','Canadá':'🇨🇦','Canada':'🇨🇦','Inglaterra':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Países Bajos':'🇳🇱','Netherlands':'🇳🇱','Holanda':'🇳🇱','Uruguay':'🇺🇾',
  'Ecuador':'🇪🇨','Senegal':'🇸🇳','Bélgica':'🇧🇪','Belgium':'🇧🇪',
  'Noruega':'🇳🇴','Norway':'🇳🇴','Colombia':'🇨🇴','Chile':'🇨🇱','Perú':'🇵🇪','Peru':'🇵🇪',
  'Croacia':'🇭🇷','Croatia':'🇭🇷','Dinamarca':'🇩🇰','Denmark':'🇩🇰','Suiza':'🇨🇭','Switzerland':'🇨🇭',
  'Nigeria':'🇳🇬','Ghana':'🇬🇭','Egipto':'🇪🇬','Egypt':'🇪🇬',
  'Arabia Saudí':'🇸🇦','Arabia Saudita':'🇸🇦','Saudi Arabia':'🇸🇦','Irán':'🇮🇷','Iran':'🇮🇷','Qatar':'🇶🇦',
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

function obtenerBandera(name) { return BANDERAS_EQUIPOS[name] || '🏳️'; }

function fechaLocalStr(d) {
  const dt = d || new Date();
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
}

function ayerStr() {
  const d = new Date(); d.setDate(d.getDate()-1); return fechaLocalStr(d);
}

const _TODOS_PARTIDOS = [
  
  
  { id:'wc26_1',  local:'México',           visitante:'Sudáfrica',       banderaLocal:'🇲🇽', banderaVisitante:'🇿🇦', date:'2026-06-11', time:'14:00', competencia:'Grupo A — J1', type:'worldcup', venue:'Estadio Azteca, CDMX',        status:'finalizados', golesLocal:2, golesVisitante:0, marcadorExacto:'2-0', resultadoFinal:'local' },
  { id:'wc26_2',  local:'Corea del Sur',    visitante:'Rep. Checa',      banderaLocal:'🇰🇷', banderaVisitante:'🇨🇿', date:'2026-06-11', time:'19:00', competencia:'Grupo A — J1', type:'worldcup', venue:'Estadio Akron, Guadalajara',   status:'finalizados', golesLocal:2, golesVisitante:1, marcadorExacto:'2-1', resultadoFinal:'local' },
  
  { id:'wc26_3',  local:'Canadá',           visitante:'Bosnia y Herz.',  banderaLocal:'🇨🇦', banderaVisitante:'🇧🇦', date:'2026-06-12', time:'12:00', competencia:'Grupo B — J1', type:'worldcup', venue:'BMO Field, Toronto',            status:'finalizados', golesLocal:1, golesVisitante:1, marcadorExacto:'1-1', resultadoFinal:'draw' },
  { id:'wc26_4',  local:'Estados Unidos',   visitante:'Paraguay',        banderaLocal:'🇺🇸', banderaVisitante:'🇵🇾', date:'2026-06-12', time:'16:00', competencia:'Grupo D — J1', type:'worldcup', venue:'SoFi Stadium, Los Ángeles',    status:'finalizados', golesLocal:4, golesVisitante:1, marcadorExacto:'4-1', resultadoFinal:'local' },
  
  { id:'wc26_5',  local:'Qatar',            visitante:'Suiza',           banderaLocal:'🇶🇦', banderaVisitante:'🇨🇭', date:'2026-06-13', time:'10:00', competencia:'Grupo B — J1', type:'worldcup', venue:'Levi\'s Stadium, San Francisco',status:'finalizados', golesLocal:1, golesVisitante:1, marcadorExacto:'1-1', resultadoFinal:'draw' },
  { id:'wc26_6',  local:'Brasil',           visitante:'Marruecos',       banderaLocal:'🇧🇷', banderaVisitante:'🇲🇦', date:'2026-06-13', time:'18:00', competencia:'Grupo C — J1', type:'worldcup', venue:'MetLife Stadium, Nueva York',   status:'finalizados', golesLocal:1, golesVisitante:1, marcadorExacto:'1-1', resultadoFinal:'draw' },
  { id:'wc26_7',  local:'Haití',            visitante:'Escocia',         banderaLocal:'🇭🇹', banderaVisitante:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', date:'2026-06-13', time:'21:00', competencia:'Grupo C — J1', type:'worldcup', venue:'Gillette Stadium, Boston',      status:'finalizados', golesLocal:0, golesVisitante:1, marcadorExacto:'0-1', resultadoFinal:'visitante' },
  
  { id:'wc26_8',  local:'Australia',        visitante:'Turquía',         banderaLocal:'🇦🇺', banderaVisitante:'🇹🇷', date:'2026-06-13', time:'19:00', competencia:'Grupo D — J1', type:'worldcup', venue:'BC Place, Vancouver',            status:'finalizados', golesLocal:2, golesVisitante:0, marcadorExacto:'2-0', resultadoFinal:'local' },
  
  { id:'wc26_9',  local:'Alemania',         visitante:'Curazao',         banderaLocal:'🇩🇪', banderaVisitante:'🇨🇼', date:'2026-06-14', time:'12:00', competencia:'Grupo E — J1', type:'worldcup', venue:'NRG Stadium, Houston',           status:'finalizados', golesLocal:7, golesVisitante:1, marcadorExacto:'7-1', resultadoFinal:'local' },
  { id:'wc26_10', local:'Países Bajos',     visitante:'Japón',           banderaLocal:'🇳🇱', banderaVisitante:'🇯🇵', date:'2026-06-14', time:'15:00', competencia:'Grupo F — J1', type:'worldcup', venue:'AT&T Stadium, Dallas',           status:'finalizados', golesLocal:2, golesVisitante:2, marcadorExacto:'2-2', resultadoFinal:'draw' },
  { id:'wc26_11', local:'Costa de Marfil',  visitante:'Ecuador',         banderaLocal:'🇨🇮', banderaVisitante:'🇪🇨', date:'2026-06-14', time:'18:00', competencia:'Grupo E — J1', type:'worldcup', venue:'Lincoln Financial, Filadelfia', status:'finalizados', golesLocal:1, golesVisitante:0, marcadorExacto:'1-0', resultadoFinal:'local' },
  { id:'wc26_12', local:'Suecia',           visitante:'Túnez',           banderaLocal:'🇸🇪', banderaVisitante:'🇹🇳', date:'2026-06-14', time:'21:00', competencia:'Grupo F — J1', type:'worldcup', venue:'Estadio BBVA, Monterrey',        status:'finalizados', golesLocal:5, golesVisitante:1, marcadorExacto:'5-1', resultadoFinal:'local' },
  
  { id:'wc26_13', local:'España',           visitante:'Cabo Verde',      banderaLocal:'🇪🇸', banderaVisitante:'🇨🇻', date:'2026-06-15', time:'12:00', competencia:'Grupo H — J1', type:'worldcup', venue:'Mercedes-Benz Stadium, Atlanta', status:'finalizados', golesLocal:0, golesVisitante:0, marcadorExacto:'0-0', resultadoFinal:'draw' },
  { id:'wc26_14', local:'Arabia Saudita',   visitante:'Uruguay',         banderaLocal:'🇸🇦', banderaVisitante:'🇺🇾', date:'2026-06-15', time:'18:00', competencia:'Grupo H — J1', type:'worldcup', venue:'Hard Rock Stadium, Miami',       status:'finalizados', golesLocal:1, golesVisitante:1, marcadorExacto:'1-1', resultadoFinal:'draw' },
  { id:'wc26_15', local:'Irán',             visitante:'Nueva Zelanda',   banderaLocal:'🇮🇷', banderaVisitante:'🇳🇿', date:'2026-06-15', time:'18:00', competencia:'Grupo G — J1', type:'worldcup', venue:'SoFi Stadium, Los Ángeles',    status:'scheduled' },
  { id:'wc26_16', local:'Bélgica',          visitante:'Egipto',          banderaLocal:'🇧🇪', banderaVisitante:'🇪🇬', date:'2026-06-15', time:'12:00', competencia:'Grupo G — J1', type:'worldcup', venue:'Lumen Field, Seattle',           status:'finalizados', golesLocal:1, golesVisitante:1, marcadorExacto:'1-1', resultadoFinal:'draw' },
  
  { id:'wc26_17', local:'Francia',          visitante:'Senegal',         banderaLocal:'🇫🇷', banderaVisitante:'🇸🇳', date:'2026-06-16', time:'13:00', competencia:'Grupo I — J1', type:'worldcup', venue:'MetLife Stadium, Nueva York',   status:'scheduled' },
  { id:'wc26_18', local:'Irak',             visitante:'Noruega',         banderaLocal:'🇮🇶', banderaVisitante:'🇳🇴', date:'2026-06-16', time:'16:00', competencia:'Grupo I — J1', type:'worldcup', venue:'Gillette Stadium, Boston',      status:'scheduled' },
  { id:'wc26_19', local:'Argentina',        visitante:'Argelia',         banderaLocal:'🇦🇷', banderaVisitante:'🇩🇿', date:'2026-06-16', time:'19:00', competencia:'Grupo J — J1', type:'worldcup', venue:'Arrowhead Stadium, Kansas City', status:'scheduled' },
  { id:'wc26_20', local:'Austria',          visitante:'Jordania',        banderaLocal:'🇦🇹', banderaVisitante:'🇯🇴', date:'2026-06-16', time:'22:00', competencia:'Grupo J — J1', type:'worldcup', venue:'Levi\'s Stadium, San Francisco',status:'scheduled' },
  
  { id:'wc26_21', local:'Portugal',         visitante:'RD Congo',        banderaLocal:'🇵🇹', banderaVisitante:'🇨🇩', date:'2026-06-17', time:'11:00', competencia:'Grupo K — J1', type:'worldcup', venue:'NRG Stadium, Houston',           status:'scheduled' },
  { id:'wc26_22', local:'Inglaterra',       visitante:'Croacia',         banderaLocal:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', banderaVisitante:'🇭🇷', date:'2026-06-17', time:'14:00', competencia:'Grupo L — J1', type:'worldcup', venue:'AT&T Stadium, Dallas',           status:'scheduled' },
  { id:'wc26_23', local:'Ghana',            visitante:'Panamá',          banderaLocal:'🇬🇭', banderaVisitante:'🇵🇦', date:'2026-06-17', time:'17:00', competencia:'Grupo L — J1', type:'worldcup', venue:'BMO Field, Toronto',            status:'scheduled' },
  { id:'wc26_24', local:'Uzbekistán',       visitante:'Colombia',        banderaLocal:'🇺🇿', banderaVisitante:'🇨🇴', date:'2026-06-17', time:'20:00', competencia:'Grupo K — J1', type:'worldcup', venue:'Estadio Azteca, CDMX',          status:'scheduled' },

  
  
  { id:'wc26_25', local:'Rep. Checa',       visitante:'Sudáfrica',       banderaLocal:'🇨🇿', banderaVisitante:'🇿🇦', date:'2026-06-18', time:'10:00', competencia:'Grupo A — J2', type:'worldcup', venue:'Mercedes-Benz Stadium, Atlanta', status:'scheduled' },
  { id:'wc26_26', local:'Suiza',            visitante:'Bosnia y Herz.',  banderaLocal:'🇨🇭', banderaVisitante:'🇧🇦', date:'2026-06-18', time:'13:00', competencia:'Grupo B — J2', type:'worldcup', venue:'SoFi Stadium, Los Ángeles',    status:'scheduled' },
  { id:'wc26_27', local:'Escocia',          visitante:'Marruecos',       banderaLocal:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', banderaVisitante:'🇲🇦', date:'2026-06-19', time:'16:00', competencia:'Grupo C — J2', type:'worldcup', venue:'Gillette Stadium, Boston',      status:'scheduled' },
  { id:'wc26_28', local:'México',           visitante:'Corea del Sur',   banderaLocal:'🇲🇽', banderaVisitante:'🇰🇷', date:'2026-06-18', time:'19:00', competencia:'Grupo A — J2', type:'worldcup', venue:'Estadio Akron, Guadalajara',    status:'scheduled' },
  
  { id:'wc26_29', local:'Estados Unidos',   visitante:'Australia',       banderaLocal:'🇺🇸', banderaVisitante:'🇦🇺', date:'2026-06-19', time:'13:00', competencia:'Grupo D — J2', type:'worldcup', venue:'Lumen Field, Seattle',           status:'scheduled' },
  { id:'wc26_30', local:'Brasil',           visitante:'Haití',           banderaLocal:'🇧🇷', banderaVisitante:'🇭🇹', date:'2026-06-19', time:'19:00', competencia:'Grupo C — J2', type:'worldcup', venue:'Lincoln Financial, Filadelfia', status:'scheduled' },
  { id:'wc26_31', local:'Turquía',          visitante:'Paraguay',        banderaLocal:'🇹🇷', banderaVisitante:'🇵🇾', date:'2026-06-19', time:'22:00', competencia:'Grupo D — J2', type:'worldcup', venue:'Levi\'s Stadium, San Francisco',status:'scheduled' },
  
  { id:'wc26_32', local:'Ecuador',          visitante:'Curazao',         banderaLocal:'🇪🇨', banderaVisitante:'🇨🇼', date:'2026-06-20', time:'18:00', competencia:'Grupo E — J2', type:'worldcup', venue:'Arrowhead Stadium, Kansas City',  status:'scheduled' },
  { id:'wc26_33', local:'Túnez',            visitante:'Japón',           banderaLocal:'🇹🇳', banderaVisitante:'🇯🇵', date:'2026-06-20', time:'22:00', competencia:'Grupo F — J2', type:'worldcup', venue:'Estadio Akron, Guadalajara',     status:'scheduled' },
  { id:'wc26_34', local:'Alemania',         visitante:'Costa de Marfil', banderaLocal:'🇩🇪', banderaVisitante:'🇨🇮', date:'2026-06-20', time:'14:00', competencia:'Grupo E — J2', type:'worldcup', venue:'BMO Field, Toronto',             status:'scheduled' },
  { id:'wc26_35', local:'Países Bajos',     visitante:'Suecia',          banderaLocal:'🇳🇱', banderaVisitante:'🇸🇪', date:'2026-06-20', time:'11:00', competencia:'Grupo F — J2', type:'worldcup', venue:'NRG Stadium, Houston',           status:'scheduled' },
  
  { id:'wc26_36', local:'España',           visitante:'Arabia Saudita',     banderaLocal:'🇪🇸', banderaVisitante:'🇸🇦', date:'2026-06-21', time:'10:00', competencia:'Grupo H — J2', type:'worldcup', venue:'Mercedes-Benz Stadium, Atlanta', status:'scheduled' },
  { id:'wc26_37', local:'Nueva Zelanda',    visitante:'Egipto',          banderaLocal:'🇳🇿', banderaVisitante:'🇪🇬', date:'2026-06-21', time:'19:00', competencia:'Grupo G — J2', type:'worldcup', venue:'BC Place, Vancouver',            status:'scheduled' },
  { id:'wc26_38', local:'Uruguay',          visitante:'Cabo Verde',      banderaLocal:'🇺🇾', banderaVisitante:'🇨🇻', date:'2026-06-21', time:'16:00', competencia:'Grupo H — J2', type:'worldcup', venue:'Hard Rock Stadium, Miami',       status:'scheduled' },
  { id:'wc26_39', local:'Irán',             visitante:'Bélgica',         banderaLocal:'🇮🇷', banderaVisitante:'🇧🇪', date:'2026-06-21', time:'13:00', competencia:'Grupo G — J2', type:'worldcup', venue:'Lumen Field, Seattle',           status:'scheduled' },
  
  { id:'wc26_40', local:'Argentina',        visitante:'Austria',         banderaLocal:'🇦🇷', banderaVisitante:'🇦🇹', date:'2026-06-22', time:'11:00', competencia:'Grupo J — J2', type:'worldcup', venue:'AT&T Stadium, Dallas',           status:'scheduled' },
  { id:'wc26_41', local:'Francia',          visitante:'Irak',            banderaLocal:'🇫🇷', banderaVisitante:'🇮🇶', date:'2026-06-22', time:'15:00', competencia:'Grupo I — J2', type:'worldcup', venue:'Lincoln Financial, Filadelfia', status:'scheduled' },
  { id:'wc26_42', local:'Noruega',          visitante:'Senegal',         banderaLocal:'🇳🇴', banderaVisitante:'🇸🇳', date:'2026-06-22', time:'18:00', competencia:'Grupo I — J2', type:'worldcup', venue:'MetLife Stadium, Nueva York',   status:'scheduled' },
  { id:'wc26_43', local:'Jordania',         visitante:'Argelia',         banderaLocal:'🇯🇴', banderaVisitante:'🇩🇿', date:'2026-06-22', time:'21:00', competencia:'Grupo J — J2', type:'worldcup', venue:'Levi\'s Stadium, San Francisco',status:'scheduled' },
  
  { id:'wc26_44', local:'Portugal',         visitante:'Uzbekistán',      banderaLocal:'🇵🇹', banderaVisitante:'🇺🇿', date:'2026-06-23', time:'11:00', competencia:'Grupo K — J2', type:'worldcup', venue:'NRG Stadium, Houston',           status:'scheduled' },
  { id:'wc26_45', local:'Inglaterra',       visitante:'Ghana',           banderaLocal:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', banderaVisitante:'🇬🇭', date:'2026-06-23', time:'14:00', competencia:'Grupo L — J2', type:'worldcup', venue:'Gillette Stadium, Boston',      status:'scheduled' },
  { id:'wc26_46', local:'Panamá',           visitante:'Croacia',         banderaLocal:'🇵🇦', banderaVisitante:'🇭🇷', date:'2026-06-23', time:'17:00', competencia:'Grupo L — J2', type:'worldcup', venue:'BMO Field, Toronto',            status:'scheduled' },
  { id:'wc26_47', local:'Colombia',         visitante:'RD Congo',        banderaLocal:'🇨🇴', banderaVisitante:'🇨🇩', date:'2026-06-23', time:'20:00', competencia:'Grupo K — J2', type:'worldcup', venue:'Estadio Akron, Guadalajara',    status:'scheduled' },

  
  
  { id:'wc26_48', local:'Suiza',            visitante:'Canadá',          banderaLocal:'🇨🇭', banderaVisitante:'🇨🇦', date:'2026-06-24', time:'13:00', competencia:'Grupo B — J3', type:'worldcup', venue:'BC Place, Vancouver',            status:'scheduled' },
  { id:'wc26_49', local:'Bosnia y Herz.',   visitante:'Qatar',           banderaLocal:'🇧🇦', banderaVisitante:'🇶🇦', date:'2026-06-24', time:'13:00', competencia:'Grupo B — J3', type:'worldcup', venue:'Lumen Field, Seattle',           status:'scheduled' },
  { id:'wc26_50', local:'Marruecos',        visitante:'Haití',           banderaLocal:'🇲🇦', banderaVisitante:'🇭🇹', date:'2026-06-24', time:'16:00', competencia:'Grupo C — J3', type:'worldcup', venue:'Mercedes-Benz Stadium, Atlanta', status:'scheduled' },
  { id:'wc26_51', local:'Escocia',          visitante:'Brasil',          banderaLocal:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', banderaVisitante:'🇧🇷', date:'2026-06-24', time:'16:00', competencia:'Grupo C — J3', type:'worldcup', venue:'Hard Rock Stadium, Miami',       status:'scheduled' },
  { id:'wc26_52', local:'Rep. Checa',       visitante:'México',          banderaLocal:'🇨🇿', banderaVisitante:'🇲🇽', date:'2026-06-24', time:'19:00', competencia:'Grupo A — J3', type:'worldcup', venue:'Estadio Azteca, CDMX',          status:'scheduled' },
  { id:'wc26_53', local:'Sudáfrica',        visitante:'Corea del Sur',   banderaLocal:'🇿🇦', banderaVisitante:'🇰🇷', date:'2026-06-24', time:'19:00', competencia:'Grupo A — J3', type:'worldcup', venue:'Estadio Banorte, Monterrey',    status:'scheduled' },
  
  { id:'wc26_54', local:'Turquía',          visitante:'Estados Unidos',  banderaLocal:'🇹🇷', banderaVisitante:'🇺🇸', date:'2026-06-25', time:'20:00', competencia:'Grupo D — J3', type:'worldcup', venue:'SoFi Stadium, Los Ángeles',    status:'scheduled' },
  { id:'wc26_55', local:'Paraguay',         visitante:'Australia',       banderaLocal:'🇵🇾', banderaVisitante:'🇦🇺', date:'2026-06-25', time:'20:00', competencia:'Grupo D — J3', type:'worldcup', venue:'Levi\'s Stadium, San Francisco',status:'scheduled' },
  
  { id:'wc26_56', local:'Ecuador',          visitante:'Alemania',        banderaLocal:'🇪🇨', banderaVisitante:'🇩🇪', date:'2026-06-25', time:'14:00', competencia:'Grupo E — J3', type:'worldcup', venue:'AT&T Stadium, Dallas',           status:'scheduled' },
  { id:'wc26_57', local:'Costa de Marfil',  visitante:'Curazao',         banderaLocal:'🇨🇮', banderaVisitante:'🇨🇼', date:'2026-06-25', time:'14:00', competencia:'Grupo E — J3', type:'worldcup', venue:'Lincoln Financial, Filadelfia', status:'scheduled' },
  { id:'wc26_58', local:'Países Bajos',     visitante:'Suecia',          banderaLocal:'🇳🇱', banderaVisitante:'🇸🇪', date:'2026-06-25', time:'17:00', competencia:'Grupo F — J3', type:'worldcup', venue:'Estadio BBVA, Monterrey',        status:'scheduled' },
  { id:'wc26_59', local:'Túnez',            visitante:'Japón',           banderaLocal:'🇹🇳', banderaVisitante:'🇯🇵', date:'2026-06-25', time:'17:00', competencia:'Grupo F — J3', type:'worldcup', venue:'NRG Stadium, Houston',           status:'scheduled' },
  { id:'wc26_60', local:'Bélgica',          visitante:'Nueva Zelanda',   banderaLocal:'🇧🇪', banderaVisitante:'🇳🇿', date:'2026-06-26', time:'21:00', competencia:'Grupo G — J3', type:'worldcup', venue:'BC Place, Vancouver',            status:'scheduled' },
  { id:'wc26_61', local:'Egipto',           visitante:'Irán',            banderaLocal:'🇪🇬', banderaVisitante:'🇮🇷', date:'2026-06-26', time:'21:00', competencia:'Grupo G — J3', type:'worldcup', venue:'Lumen Field, Seattle',           status:'scheduled' },
  { id:'wc26_62', local:'Cabo Verde',       visitante:'Arabia Saudita',     banderaLocal:'🇨🇻', banderaVisitante:'🇸🇦', date:'2026-06-26', time:'18:00', competencia:'Grupo H — J3', type:'worldcup', venue:'NRG Stadium, Houston',           status:'scheduled' },
  { id:'wc26_63', local:'Uruguay',          visitante:'España',          banderaLocal:'🇺🇾', banderaVisitante:'🇪🇸', date:'2026-06-26', time:'18:00', competencia:'Grupo H — J3', type:'worldcup', venue:'Estadio Akron, Guadalajara',    status:'scheduled' },
  
  { id:'wc26_64', local:'Noruega',          visitante:'Francia',         banderaLocal:'🇳🇴', banderaVisitante:'🇫🇷', date:'2026-06-26', time:'13:00', competencia:'Grupo I — J3', type:'worldcup', venue:'Gillette Stadium, Boston',      status:'scheduled' },
  { id:'wc26_65', local:'Senegal',          visitante:'Irak',            banderaLocal:'🇸🇳', banderaVisitante:'🇮🇶', date:'2026-06-26', time:'13:00', competencia:'Grupo I — J3', type:'worldcup', venue:'BMO Field, Toronto',            status:'scheduled' },
  { id:'wc26_66', local:'Argelia',          visitante:'Austria',         banderaLocal:'🇩🇿', banderaVisitante:'🇦🇹', date:'2026-06-27', time:'20:00', competencia:'Grupo J — J3', type:'worldcup', venue:'Hard Rock Stadium, Miami',       status:'scheduled' },
  { id:'wc26_67', local:'Jordania',         visitante:'Argentina',       banderaLocal:'🇯🇴', banderaVisitante:'🇦🇷', date:'2026-06-27', time:'20:00', competencia:'Grupo J — J3', type:'worldcup', venue:'Levi\'s Stadium, San Francisco',status:'scheduled' },
  { id:'wc26_68', local:'Portugal',         visitante:'Colombia',        banderaLocal:'🇵🇹', banderaVisitante:'🇨🇴', date:'2026-06-27', time:'17:30', competencia:'Grupo K — J3', type:'worldcup', venue:'Hard Rock Stadium, Miami',       status:'scheduled' },
  { id:'wc26_69', local:'RD Congo',         visitante:'Uzbekistán',      banderaLocal:'🇨🇩', banderaVisitante:'🇺🇿', date:'2026-06-27', time:'17:30', competencia:'Grupo K — J3', type:'worldcup', venue:'Mercedes-Benz Stadium, Atlanta', status:'scheduled' },
  { id:'wc26_70', local:'Panamá',           visitante:'Inglaterra',      banderaLocal:'🇵🇦', banderaVisitante:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', date:'2026-06-27', time:'15:00', competencia:'Grupo L — J3', type:'worldcup', venue:'MetLife Stadium, Nueva York',   status:'scheduled' },
  { id:'wc26_71', local:'Croacia',          visitante:'Ghana',           banderaLocal:'🇭🇷', banderaVisitante:'🇬🇭', date:'2026-06-27', time:'15:00', competencia:'Grupo L — J3', type:'worldcup', venue:'Lincoln Financial, Filadelfia', status:'scheduled' },
];

const MOCK = {
  clasificacion: [
    
    { pos:1, equipo:'México',        flag:'🇲🇽', group:'A', pj:1,w:1,d:0,l:0,gf:2,gc:0,pts:3 },
    { pos:2, equipo:'Corea del Sur', flag:'🇰🇷', group:'A', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, equipo:'Rep. Checa',    flag:'🇨🇿', group:'A', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, equipo:'Sudáfrica',     flag:'🇿🇦', group:'A', pj:1,w:0,d:0,l:1,gf:0,gc:2,pts:0 },
    
    { pos:1, equipo:'Canadá',        flag:'🇨🇦', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, equipo:'Bosnia y Herz.',flag:'🇧🇦', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, equipo:'Qatar',         flag:'🇶🇦', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, equipo:'Suiza',         flag:'🇨🇭', group:'B', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    
    { pos:1, equipo:'Brasil',        flag:'🇧🇷', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, equipo:'Marruecos',     flag:'🇲🇦', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, equipo:'Haití',         flag:'🇭🇹', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, equipo:'Escocia',       flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', group:'C', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    
    { pos:1, equipo:'Estados Unidos',flag:'🇺🇸', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, equipo:'Paraguay',      flag:'🇵🇾', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, equipo:'Australia',     flag:'🇦🇺', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, equipo:'Turquía',       flag:'🇹🇷', group:'D', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    
    { pos:1, equipo:'Alemania',      flag:'🇩🇪', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, equipo:'Ecuador',       flag:'🇪🇨', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, equipo:'Costa de Marfil',flag:'🇨🇮',group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, equipo:'Curazao',       flag:'🇨🇼', group:'E', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    
    { pos:1, equipo:'Países Bajos',  flag:'🇳🇱', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, equipo:'Japón',         flag:'🇯🇵', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, equipo:'Suecia',        flag:'🇸🇪', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, equipo:'Túnez',         flag:'🇹🇳', group:'F', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    
    { pos:1, equipo:'Bélgica',       flag:'🇧🇪', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, equipo:'Egipto',        flag:'🇪🇬', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, equipo:'Irán',          flag:'🇮🇷', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, equipo:'Nueva Zelanda', flag:'🇳🇿', group:'G', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    
    { pos:1, equipo:'España',        flag:'🇪🇸', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, equipo:'Uruguay',       flag:'🇺🇾', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, equipo:'Arabia Saudita',flag:'🇸🇦', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, equipo:'Cabo Verde',    flag:'🇨🇻', group:'H', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    
    { pos:1, equipo:'Francia',       flag:'🇫🇷', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, equipo:'Noruega',       flag:'🇳🇴', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, equipo:'Senegal',       flag:'🇸🇳', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, equipo:'Irak',          flag:'🇮🇶', group:'I', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    
    { pos:1, equipo:'Argentina',     flag:'🇦🇷', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, equipo:'Austria',       flag:'🇦🇹', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, equipo:'Argelia',       flag:'🇩🇿', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, equipo:'Jordania',      flag:'🇯🇴', group:'J', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    
    { pos:1, equipo:'Portugal',      flag:'🇵🇹', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, equipo:'Colombia',      flag:'🇨🇴', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, equipo:'Uzbekistán',    flag:'🇺🇿', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, equipo:'RD Congo',      flag:'🇨🇩', group:'K', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    
    { pos:1, equipo:'Inglaterra',    flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:2, equipo:'Croacia',       flag:'🇭🇷', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:3, equipo:'Panamá',        flag:'🇵🇦', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
    { pos:4, equipo:'Ghana',         flag:'🇬🇭', group:'L', pj:0,w:0,d:0,l:0,gf:0,gc:0,pts:0 },
  ],
  equipos: [
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
    const today = fechaLocalStr();
    const yest  = ayerStr();
    return _TODOS_PARTIDOS
      .filter(m => m.date >= yest)
      .sort((a,b)=>{
        if(a.status==='enVivo'&&b.status!=='enVivo')return -1;
        if(b.status==='enVivo'&&a.status!=='enVivo')return 1;
        return((a.date||'')+(a.time||''))<((b.date||'')+(b.time||''))?-1:1;
      });
  },
  get partidosTerminados() {
    return _TODOS_PARTIDOS
      .filter(m => m.status==='finalizados')
      .map(m => ({
        ...m,
        marcadorExacto:  m.golesLocal!=null ? `${m.golesLocal}-${m.golesVisitante}` : undefined,
        resultadoFinal: m.golesLocal!=null ? (m.golesLocal>m.golesVisitante?'local':m.golesVisitante>m.golesLocal?'visitante':'draw') : undefined,
      }))
      .sort((a,b)=>b.date>a.date?1:-1);
  },
  liveMatches: [],
  predictableMatches: [],
};

const NOMBRES_ES = {
  'Mexico':'México', 'South Africa':'Sudáfrica', 'South Korea':'Corea del Sur',
  'Czech Republic':'Rep. Checa', 'Canada':'Canadá', 'Bosnia and Herzegovina':'Bosnia y Herz.',
  'United States':'Estados Unidos', 'Paraguay':'Paraguay', 'Haiti':'Haití',
  'Scotland':'Escocia', 'Australia':'Australia', 'Turkey':'Turquía',
  'Brazil':'Brasil', 'Morocco':'Marruecos', 'Qatar':'Qatar', 'Switzerland':'Suiza',
  'Ivory Coast':'Costa de Marfil', 'Ecuador':'Ecuador', 'Germany':'Alemania',
  'Curaçao':'Curazao', 'Netherlands':'Países Bajos', 'Japan':'Japón',
  'Sweden':'Suecia', 'Tunisia':'Túnez', 'Iran':'Irán', 'New Zealand':'Nueva Zelanda',
  'Spain':'España', 'Cape Verde':'Cabo Verde', 'Belgium':'Bélgica', 'Egypt':'Egipto',
  'Saudi Arabia':'Arabia Saudita', 'Uruguay':'Uruguay', 'France':'Francia',
  'Senegal':'Senegal', 'Iraq':'Irak', 'Norway':'Noruega', 'Argentina':'Argentina',
  'Algeria':'Argelia', 'Austria':'Austria', 'Jordan':'Jordania', 'Portugal':'Portugal',
  'Democratic Republic of the Congo':'RD Congo', 'England':'Inglaterra',
  'Croatia':'Croacia', 'Uzbekistan':'Uzbekistán', 'Colombia':'Colombia',
  'Ghana':'Ghana', 'Panama':'Panamá',
};
function traducirEquipo(name) { return NOMBRES_ES[name] || name || ''; }

const NOMBRES_EN = {};
Object.entries(NOMBRES_ES).forEach(([en, es]) => { NOMBRES_EN[es] = en; });

function _normalizarBusqueda(str) {
  return (str || '')
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function coincideBusqueda(text, q) {
  if (!q) return true;
  const nq = _normalizarBusqueda(q);
  if (_normalizarBusqueda(text).includes(nq)) return true;
  const en = NOMBRES_EN[text];
  if (en && _normalizarBusqueda(en).includes(nq)) return true;
  return false;
}

function traducirEtiquetaRonda(etiqueta) {
  if (!etiqueta) return '';
  return etiqueta
    .replace(/^Winner Group ([A-L])$/, 'Ganador Grupo $1')
    .replace(/^Runner-up Group ([A-L])$/, 'Subcampeón Grupo $1')
    .replace(/^Winner Match (\d+)$/, 'Ganador Partido $1')
    .replace(/^Loser Match (\d+)$/, 'Perdedor Partido $1')
    .replace(/^3rd Group (.+)$/, '3° Grupo $1');
}

const NOMBRES_ELIMINATORIAS = {
  R32:'Dieciseisavos de Final', R16:'Octavos de Final', QF:'Cuartos de Final',
  SF:'Semifinal', '3RD':'Tercer Lugar', FINAL:'Final',
};

function _parsearFechaLocalWC26(str) {
  if (!str) return { date: '', time: '' };
  const [datePart, timePart] = str.split(' ');
  const [mo, da, yr] = (datePart || '').split('/');
  if (!mo || !da || !yr) return { date: '', time: timePart || '' };
  const [hh, mm] = (timePart || '0:0').split(':').map(Number);

  
  
  const dt = new Date(Number(yr), Number(mo) - 1, Number(da), hh, mm);
  dt.setHours(dt.getHours() + 1);

  const date = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
  const time = `${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
  return { date, time };
}

function _utcASV(utcStr) {
  if (!utcStr) return { date: '', time: '' };
  
  const iso = utcStr.includes('T') ? utcStr : utcStr.replace(' ', 'T') + 'Z';
  const d = new Date(iso);
  if (isNaN(d)) return { date: '', time: '' };
  
  const sv = new Date(d.getTime() - 6 * 3600000);
  const yr  = sv.getUTCFullYear();
  const mo  = String(sv.getUTCMonth() + 1).padStart(2, '0');
  const da  = String(sv.getUTCDate()).padStart(2, '0');
  const hh  = String(sv.getUTCHours()).padStart(2, '0');
  const mm  = String(sv.getUTCMinutes()).padStart(2, '0');
  return { date: `${yr}-${mo}-${da}`, time: `${hh}:${mm}` };
}

function _mapearPartidoWC26(m) {
  
  
  
  
  const { date, time } = m.local_date ? _parsearFechaLocalWC26(m.local_date) : _utcASV(m.kickoff_utc);

  const estaFinalizado = String(m.finalizados).toUpperCase() === 'TRUE';
  const te = (m.time_elapsed || '').toLowerCase();
  const estaEnVivo = !estaFinalizado && te !== '' && te !== 'notstarted';

  let status = 'scheduled';
  if (estaFinalizado) status = 'finalizados';
  else if (estaEnVivo) status = 'enVivo';

  
  const nombreLocal = m.home_team_name_en
    ? traducirEquipo(m.home_team_name_en)
    : traducirEtiquetaRonda(m.home_team_label);
  const nombreVisitante = m.away_team_name_en
    ? traducirEquipo(m.away_team_name_en)
    : traducirEtiquetaRonda(m.away_team_label);

  
  let competencia = 'Mundial 2026';
  if (m.group) {
    if (/^[A-L]$/.test(m.group)) competencia = `Grupo ${m.group} — J${m.matchday || ''}`;
    else competencia = NOMBRES_ELIMINATORIAS[m.group] || m.group;
  }

  const golesLocal = (m.home_score !== undefined && m.home_score !== null) ? Number(m.home_score) : null;
  const golesVisitante = (m.away_score !== undefined && m.away_score !== null) ? Number(m.away_score) : null;

  return {
    id:          `wc26_${m.id}`,
    local:        nombreLocal,
    visitante:        nombreVisitante,
    banderaLocal:    obtenerBandera(nombreLocal),
    banderaVisitante:    obtenerBandera(nombreVisitante),
    date,
    time,
    competencia,
    venue:       m.stadium_name ? `${m.stadium_name}${m.city ? ', '+m.city : ''}` : (m.venue || ''),
    type:        'worldcup',
    status,
    golesLocal:   (estaEnVivo || estaFinalizado) ? golesLocal : null,
    golesVisitante:   (estaEnVivo || estaFinalizado) ? golesVisitante : null,
    minute:      estaEnVivo ? (m.time_elapsed || null) : null,
  };
}

function _buscarCalendarioConocido(local, visitante) {
  const nh = _normalizarBusqueda(local), na = _normalizarBusqueda(visitante);
  return _TODOS_PARTIDOS.find(m => {
    const mh = _normalizarBusqueda(m.local), ma = _normalizarBusqueda(m.visitante);
    return (mh === nh && ma === na) || (mh === na && ma === nh);
  }) || null;
}

function _aplicarCalendarioConocido(match) {
  const conocido = _buscarCalendarioConocido(match.local, match.visitante);
  if (conocido && conocido.date && conocido.time) {
    match.date = conocido.date;
    match.time = conocido.time;
  }
  return match;
}

function _mapearClasificacionWC26(t) {
  return {
    pos:   t.position || 0,
    equipo:  t.equipo || t.team_name || '',
    flag:  obtenerBandera(t.equipo || t.team_name || ''),
    group: t.group || t.group_name || '',
    pj:    t.played || t.mp || 0,
    w:     t.won    || t.w  || 0,
    d:     t.sorteado  || t.d  || 0,
    l:     t.lost   || t.l  || 0,
    gf:    t.goals_for     || t.gf || 0,
    gc:    t.goals_against || t.gc || 0,
    pts:   t.points || t.pts || 0,
  };
}

function _mapearEquipoWC26(t) {
  return {
    id:    `wc26_${t.id || t.team_id || t.name}`,
    name:  t.name || t.name_en || '',
    flag:  obtenerBandera(t.name || t.name_en || ''),
    group: t.grupos || t.group || '',
    pj:0, w:0, d:0, l:0, gf:0, gc:0, pts:0,
  };
}

const API = {

  _memCache: {},
  _init() { this._invalidateOldCache(); },
  _teamsCache: null,
  _PHOTO_BASE_URL: 'https://cdn.jsdelivr.net/gh/josuehdz420/wcc-assets@main/figuritas/',

  _TTL: {
    enVivo:      2  * 60 * 1000,
    proximos:  5  * 60 * 1000,   
    clasificacion: 5  * 60 * 1000,
    finalizados:  10 * 60 * 1000,
    default:   5  * 60 * 1000,
  },

  _ttlFor(key) {
    if (key.startsWith('enVivo'))      return this._TTL.enVivo;
    if (key.startsWith('proximos'))  return this._TTL.proximos;
    if (key.startsWith('clasificacion')) return this._TTL.clasificacion;
    if (key.startsWith('finalizados'))  return this._TTL.finalizados;
    return this._TTL.default;
  },

  _memGet(key) {
    const e = this._memCache[key];
    if (!e) return null;
    if (Date.now() - e.ts > this._ttlFor(key)) { delete this._memCache[key]; return null; }
    return e.data;
  },
  _memSet(key, data) { this._memCache[key] = { data, ts: Date.now() }; return data; },

  
  _CACHE_VERSION: 'v25',

  _lsCacheKey(key) { return `wcc_cache_${this._CACHE_VERSION}_${key}`; },

  _invalidateOldCache() {
    try {
      const prefijo = 'wcc_cache_';
      Object.keys(localStorage)
        .filter(k => k.startsWith(prefijo) && !k.startsWith(`${prefijo}${this._CACHE_VERSION}_`))
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

  
  async _fetch(url, headers = {}) {
    try {
      const ctrl  = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res   = await fetch(url, { headers, signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      ESTADO_API.lastError   = null;
      ESTADO_API.lastSuccess = Date.now();
      return data;
    } catch(err) {
      if (!ESTADO_API.lastError) ESTADO_API.lastError = 'network';
      console.warn('[API]', url.split('?')[0], '-', err.message);
      return null;
    }
  },

  
  async _wc26(endpoint) {
    if (SOLO_DATOS_MOCK) return null; 
    return await this._fetch(`${BASE_API_WC26}${endpoint}`);
  },

  
  async getLiveMatches() {
    const mem = this._memGet('enVivo');
    if (mem) return mem;

    const data = await this._wc26('/get/juegos');
    if (data) {
      const juegos = Array.isArray(data) ? data : (data.juegos || data.partidos || data.data || []);
      const enVivo  = juegos
        .filter(m => {
          const te = (m.time_elapsed || '').toLowerCase();
          return String(m.finalizados).toUpperCase() !== 'TRUE' && te !== '' && te !== 'notstarted';
        })
        .map(m => _aplicarCalendarioConocido(_mapearPartidoWC26(m)));
      ESTADO_API.usingMock = false;
      return this._memSet('enVivo', enVivo);
    }

    ESTADO_API.usingMock = true;
    return this._memSet('enVivo', MOCK.liveMatches);
  },

  
  async getUpcomingMatches() {
    const mem = this._memGet('proximos');
    if (mem) return mem;
    const ls = this._lsGet('proximos');
    if (ls) return this._memSet('proximos', ls);

    const strHoy = fechaLocalStr();
    const strAyer  = ayerStr();

    const data = await this._wc26('/get/juegos');
    if (data) {
      const juegos = Array.isArray(data) ? data : (data.juegos || data.partidos || data.data || []);
      const mapeados = juegos
        .map(m => _aplicarCalendarioConocido(_mapearPartidoWC26(m)))
        .filter(m => m.date >= strAyer)
        .sort((a, b) => {
          if (a.status === 'enVivo' && b.status !== 'enVivo') return -1;
          if (b.status === 'enVivo' && a.status !== 'enVivo') return  1;
          return ((a.date||'')+(a.time||'')) < ((b.date||'')+(b.time||'')) ? -1 : 1;
        });

      if (mapeados.length > 0) {
        ESTADO_API.usingMock = false;
        this._lsSet('proximos', mapeados);
        return this._memSet('proximos', mapeados);
      }
    }

    ESTADO_API.usingMock = true;
    return this._memSet('proximos', MOCK.upcomingMatches);
  },

  
  async getFinishedMatches() {
    const mem = this._memGet('finalizados');
    if (mem) return mem;

    const data = await this._wc26('/get/juegos');
    if (data) {
      const juegos = Array.isArray(data) ? data : (data.juegos || data.partidos || data.data || []);
      const finalizados = juegos
        .filter(m => String(m.finalizados).toUpperCase() === 'TRUE')
        .map(m => {
          const base = _aplicarCalendarioConocido(_mapearPartidoWC26(m));
          const h = Number(m.home_score ?? 0), a = Number(m.away_score ?? 0);
          return {
            ...base,
            golesLocal:   h,
            golesVisitante:   a,
            marcadorExacto:  `${h}-${a}`,
            resultadoFinal: h > a ? 'local' : a > h ? 'visitante' : 'draw',
          };
        })
        .sort((a, b) => (b.date||'') > (a.date||'') ? 1 : -1);

      if (finalizados.length > 0) {
        ESTADO_API.usingMock = false;
        return this._memSet('finalizados', finalizados);
      }
    }

    ESTADO_API.usingMock = true;
    return this._memSet('finalizados', MOCK.partidosTerminados);
  },

  
  async getStandings() {
    const mem = this._memGet('clasificacion');
    if (mem) return mem;

    
    
    let finalizados = [];
    try { finalizados = await this.getFinishedMatches(); } catch(_) {}

    
    if (!finalizados || finalizados.length === 0) {
      const filasMock = MOCK.clasificacion.slice();
      const grupos = {};
      filasMock.forEach(s => (grupos[s.group] = grupos[s.group] || []).push(s));
      const ordenados = [];
      Object.values(grupos).forEach(arr => {
        arr.sort((x,y) => y.pts - x.pts || (y.gf-y.gc)-(x.gf-x.gc) || y.gf-x.gf);
        arr.forEach((s,i) => { s.pos = i+1; ordenados.push(s); });
      });
      ESTADO_API.usingMock = true;
      return this._memSet('clasificacion', ordenados);
    }

    
    const base = MOCK.clasificacion.map(s => ({ ...s, pj:0, w:0, d:0, l:0, gf:0, gc:0, pts:0 }));
    const porEquipo = {};
    base.forEach(s => { porEquipo[s.equipo] = s; });

    try {
      finalizados.forEach(m => {
        const h = porEquipo[m.local], a = porEquipo[m.visitante];
        if (!h || !a) return; 
        const hs = m.golesLocal ?? 0, as = m.golesVisitante ?? 0;
        h.pj++; a.pj++;
        h.gf += hs; h.gc += as;
        a.gf += as; a.gc += hs;
        if (hs > as)      { h.w++; h.pts += 3; a.l++; }
        else if (hs < as) { a.w++; a.pts += 3; h.l++; }
        else              { h.d++; a.d++; h.pts++; a.pts++; }
      });
    } catch(_) {  }

    
    const grupos = {};
    base.forEach(s => (grupos[s.group] = grupos[s.group] || []).push(s));
    const rows = [];
    Object.values(grupos).forEach(arr => {
      arr.sort((x, y) => y.pts - x.pts || (y.gf - y.gc) - (x.gf - x.gc) || y.gf - x.gf);
      arr.forEach((s, i) => { s.pos = i + 1; rows.push(s); });
    });

    ESTADO_API.usingMock = rows.every(r => r.pj === 0);
    return this._memSet('clasificacion', rows);
  },

  
  async getTeams(query = '') {
    
    
    const clasificacion = await this.getStandings().catch(() => MOCK.clasificacion);
    const mapaClasificacion  = {};
    (clasificacion || MOCK.clasificacion).forEach(s => {
      mapaClasificacion[_normalizarBusqueda(s.equipo)] = s;
    });

    this._teamsCache = MOCK.clasificacion.map(s => {
      const enVivo = mapaClasificacion[_normalizarBusqueda(s.equipo)] || s;
      return {
        id:    'mock_' + _normalizarBusqueda(s.equipo).replace(/\s+/g, '_'),
        name:  s.equipo,
        flag:  s.flag,
        group: s.group,
        pj:  enVivo.pj  != null ? enVivo.pj  : (s.pj  || 0),
        w:   enVivo.w   != null ? enVivo.w   : (s.w   || 0),
        d:   enVivo.d   != null ? enVivo.d   : (s.d   || 0),
        l:   enVivo.l   != null ? enVivo.l   : (s.l   || 0),
        gf:  enVivo.gf  != null ? enVivo.gf  : (s.gf  || 0),
        gc:  enVivo.gc  != null ? enVivo.gc  : (s.gc  || 0),
        pts: enVivo.pts != null ? enVivo.pts : (s.pts || 0),
      };
    });

    if (!query) return this._teamsCache;
    return this._teamsCache.filter(t => coincideBusqueda(t.name||'', query));
  },

  
  async getTeamMatches(teamName) {
    const claveCache = `team_matches_${teamName}`;
    const mem = this._memGet(claveCache);
    if (mem) return mem;

    const normalizado = s => (s||'').toLowerCase()
      .replace(/[áàä]/g,'a').replace(/[éèë]/g,'e').replace(/[íìï]/g,'i')
      .replace(/[óòö]/g,'o').replace(/[úùü]/g,'u').replace(/ñ/g,'n').trim();

    const tn = normalizado(teamName);

    const filtrarDeMapeados = (mapeados) => ({
      played:   mapeados.filter(m => m.status === 'finalizados' && (normalizado(m.local||'').includes(tn) || normalizado(m.visitante||'').includes(tn))),
      proximos: mapeados.filter(m => m.status !== 'finalizados'  && (normalizado(m.local||'').includes(tn) || normalizado(m.visitante||'').includes(tn))),
    });

    
    const data = await this._wc26('/get/juegos');
    if (data) {
      const juegos  = Array.isArray(data) ? data : (data.juegos || data.partidos || data.data || []);
      if (juegos.length > 0) {
        const mapeados = juegos.map(m => _aplicarCalendarioConocido(_mapearPartidoWC26(m)));
        return this._memSet(claveCache, filtrarDeMapeados(mapeados));
      }
    }

    
    const todosMock = [
      ...(MOCK.partidosTerminados || []),
      ...(MOCK.upcomingMatches || []),
    ];
    if (todosMock.length > 0) {
      return this._memSet(claveCache, filtrarDeMapeados(todosMock));
    }

    
    try {
      const todosPartidos = (typeof _TODOS_PARTIDOS !== 'undefined') ? _TODOS_PARTIDOS : [];
      if (todosPartidos.length > 0) {
        const mapeados = todosPartidos.map(m => _aplicarCalendarioConocido(m));
        return this._memSet(claveCache, filtrarDeMapeados(mapeados));
      }
    } catch(_) {}

    return this._memSet(claveCache, { played: [], proximos: [] });
  },

  
  async getPlayers(query = '') {
    const data = MOCK.jugadores || [];
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter(p =>
      (p.name||'').toLowerCase().includes(q) ||
      (p.equipo||'').toLowerCase().includes(q)
    );
  },

  async getTopScorers() {
    const jugadores = await this.getPlayers('');
    return jugadores.slice().sort((a,b) => (b.goals||0)-(a.goals||0));
  },

  
  _venueOffset(venue) {
    // All times in _TODOS_PARTIDOS are stored as El Salvador local time (UTC-6).
    // Return '-06:00' for mock/fallback data so match state calculations are correcto.
    return '-06:00';
  },

  
  getMatchState(m) {
    if (m.status === 'enVivo')     return 'enVivo';
    if (m.status === 'finalizados') return 'finalizados';
    if (!m.date || !m.time)      return 'proximos';
    const desplazamiento  = this._venueOffset(m.venue);
    const tsPartido = new Date(`${m.date}T${m.time}:00${desplazamiento}`).getTime();
    const difMinutos = (Date.now() - tsPartido) / 60000;
    if (difMinutos > 115) return 'finalizados';
    if (difMinutos > 0)   return 'enVivo';
    if (difMinutos > -60) return 'closed';        
    if (difMinutos > -180) return 'starting_soon'; 
    return 'proximos';
  },

  getTimeUntilMatch(m) {
    if (!m.date || !m.time) return '';
    const desplazamiento  = this._venueOffset(m.venue);
    const difMs = new Date(`${m.date}T${m.time}:00${desplazamiento}`).getTime() - Date.now();
    if (difMs <= 0) return '';
    const h   = Math.floor(difMs / 3600000);
    const min = Math.floor((difMs % 3600000) / 60000);
    if (h >= 24) { const d = Math.floor(h/24); return `En ${d}d ${h%24}h`; }
    if (h > 0)   return `En ${h}h ${min}m`;
    return `En ${min}m`;
  },

  
  async getPredictableMatches() {
    const strHoy = fechaLocalStr();
    const strAyer  = ayerStr();
    try {
      const all = await this.getUpcomingMatches();
      if (all?.length > 0) {
        return all
          .filter(m => (m.date||'') >= strAyer)
          .sort((a,b) => ((a.date||'')+(a.time||'')) < ((b.date||'')+(b.time||'')) ? -1 : 1);
      }
    } catch(_) {}
    return MOCK.predictableMatches;
  },

  
  async getStadiums() {
    const mem = this._memGet('stadiums');
    if (mem) return mem;
    try {
      const data = await this._wc26('/get/stadiums');
      if (data) {
        const list = Array.isArray(data) ? data : (data.stadiums || data.data || []);
        const mapeados = list.map(s => ({
          id:       s.id || s.stadium_id,
          name:     s.name || s.stadium_name || '',
          city:     s.city || '',
          country:  s.country || '',
          capacity: s.capacity || 0,
          surface:  s.surface || 'Grass',
        }));
        if (mapeados.length > 0) return this._memSet('stadiums', mapeados);
      }
    } catch(_) {}
    
    return this._memSet('stadiums', [
      { id:1,  name:'MetLife Stadium',       city:'Nueva York/NJ',  country:'USA', capacity:82500 },
      { id:2,  name:'SoFi Stadium',          city:'Los Ángeles',    country:'USA', capacity:70240 },
      { id:3,  name:'AT&T Stadium',          city:'Dallas',         country:'USA', capacity:80000 },
      { id:4,  name:'Hard Rock Stadium',     city:'Miami',          country:'USA', capacity:65326 },
      { id:5,  name:"Levi's Stadium",       city:'San Francisco',  country:'USA', capacity:68500 },
      { id:6,  name:'Arrowhead Stadium',     city:'Kansas City',    country:'USA', capacity:76416 },
      { id:7,  name:'Lumen Field',           city:'Seattle',        country:'USA', capacity:68740 },
      { id:8,  name:'Lincoln Financial',     city:'Filadelfia',     country:'USA', capacity:69176 },
      { id:9,  name:'NRG Stadium',           city:'Houston',        country:'USA', capacity:72220 },
      { id:10, name:'Gillette Stadium',      city:'Boston',         country:'USA', capacity:65878 },
      { id:11, name:'BC Place',              city:'Vancouver',      country:'CAN', capacity:54500 },
      { id:12, name:'BMO Field',             city:'Toronto',        country:'CAN', capacity:30000 },
      { id:13, name:'Estadio Azteca',        city:'Ciudad de México',country:'MEX',capacity:87523 },
      { id:14, name:'Estadio BBVA',          city:'Monterrey',      country:'MEX', capacity:51000 },
      { id:15, name:'Estadio Akron',         city:'Guadalajara',    country:'MEX', capacity:49850 },
      { id:16, name:'Mercedes-Benz Stadium', city:'Atlanta',        country:'USA', capacity:71000 },
    ]);
  },

  
  async getMatchDetail(idPartido) {
    const claveCache = `match_${idPartido}`;
    const mem = this._memGet(claveCache);
    if (mem) return mem;
    try {
      
      const idNumerico = String(idPartido).replace('wc26_', '');
      const data = await this._wc26(`/get/juegos/${idNumerico}`);
      if (data) {
        const m = Array.isArray(data) ? data[0] : (data.game || data.match || data);
        if (m && m.id) {
          const mapeados = _aplicarCalendarioConocido(_mapearPartidoWC26(m));
          return this._memSet(claveCache, mapeados, 60); 
        }
      }
    } catch(_) {}
    
    const all = await this.getUpcomingMatches();
    return all.find(m => m.id === idPartido) || null;
  },

  
  async getAllGroups() {
    const mem = this._memGet('allGroups');
    if (mem) return mem;
    const clasificacion = await this.getStandings();
    
    const grupos = {};
    clasificacion.forEach(t => {
      const g = t.group || 'Desconocido';
      if (!grupos[g]) grupos[g] = [];
      grupos[g].push(t);
    });
    
    Object.values(grupos).forEach(arr => arr.sort((a,b) =>
      (b.pts - a.pts) || ((b.gf-b.gc) - (a.gf-a.gc)) || (b.gf - a.gf)
    ));
    return this._memSet('allGroups', grupos, 120);
  },

  
  async forceRefresh() {
    this._memCache  = {};
    this._teamsCache = null;
    this._invalidateOldCache();
    localStorage.removeItem(this._lsCacheKey('proximos'));
    localStorage.removeItem(this._lsCacheKey('clasificacion'));
    localStorage.removeItem(this._lsCacheKey('equipos'));
    localStorage.removeItem(this._lsCacheKey('finalizados'));

    try {
      const [enVivo, proximos, clasificacion, finalizados] = await Promise.all([
        this.getLiveMatches(),
        this.getUpcomingMatches(),
        this.getStandings(),
        this.getFinishedMatches(),
      ]);
      
      await this.getTeams('').catch(() => {});
      const apiConectada = (proximos?.some?.(m => m.id?.startsWith?.('wc26_')));
      ESTADO_API.usingMock = !apiConectada;
      return {
        enVivo, proximos, clasificacion, finalizados,
        fuenteDatos: apiConectada ? 'worldcup26.ir' : 'mock'
      };
    } catch(err) {
      ESTADO_API.lastError = 'network';
      ESTADO_API.usingMock = true;
      return { enVivo:[], proximos:[], clasificacion:[], finalizados:[], fuenteDatos:'network_error' };
    }
  },

  
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

  
  getPhotoSync(fig) {
    if (!fig?.id) return null;
    return `${this._PHOTO_BASE_URL}${fig.id}.png`;
  },
  async getPhotoById(idFigura) {
    if (!idFigura) return null;
    return `${this._PHOTO_BASE_URL}${idFigura}.png`;
  },
  async getPlayerPhoto() {
    return null;
  },
  async getPlayerPhotosCached() {
    return null;
  },
  async precachePhotos() {
    return;
  },
  clearPhotoCache() {
    this._teamsCache = null; this._memCache = {};
  },

  
  getCrest(name) { return `https://flagcdn.com/w80/${BANDERAS_EQUIPOS[name]?'':'xx'}.png`; },
  obtenerBandera(name)  { return obtenerBandera(name); },
  getApiStatus() {
    return {
      apiFootball:  { enabled: false, hasKey: false },
      footballData: { enabled: false, hasKey: false },
      sportsDB:     { enabled: false, hasKey: false }
    };
  }
};

API._init();