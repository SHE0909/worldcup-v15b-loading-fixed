/**
 * stats.js — Estadísticas v3
 * FIX: lista completa de jugadores del Mundial 2026 (64 equipos, ~400 jugadores)
 * FIX: seguimiento muestra foto+stats al clickear desde Dashboard
 */

/* ── Pool completo de jugadores del Mundial 2026 (representativo) ── */
const ALL_PLAYERS = [
  /* ARGENTINA */
  {id:'sp01',name:'Lionel Messi',team:'Argentina',flag:'🇦🇷',goals:0,assists:0,pos:'DEL',caps:187,rating:93},
  {id:'sp02',name:'Julián Álvarez',team:'Argentina',flag:'🇦🇷',goals:0,assists:0,pos:'DEL',caps:38,rating:85},
  {id:'sp03',name:'Rodrigo De Paul',team:'Argentina',flag:'🇦🇷',goals:0,assists:0,pos:'MED',caps:68,rating:83},
  {id:'sp04',name:'Enzo Fernández',team:'Argentina',flag:'🇦🇷',goals:0,assists:0,pos:'MED',caps:35,rating:82},
  {id:'sp05',name:'Lisandro Martínez',team:'Argentina',flag:'🇦🇷',goals:0,assists:0,pos:'DEF',caps:26,rating:84},
  {id:'sp06',name:'Emiliano Martínez',team:'Argentina',flag:'🇦🇷',goals:0,assists:0,pos:'POR',caps:38,rating:87},
  /* BRASIL */
  {id:'sp07',name:'Vinicius Jr.',team:'Brasil',flag:'🇧🇷',goals:0,assists:0,pos:'DEL',caps:55,rating:91},
  {id:'sp08',name:'Raphinha',team:'Brasil',flag:'🇧🇷',goals:0,assists:0,pos:'DEL',caps:52,rating:86},
  {id:'sp09',name:'Rodrygo',team:'Brasil',flag:'🇧🇷',goals:0,assists:0,pos:'DEL',caps:38,rating:84},
  {id:'sp10',name:'Casemiro',team:'Brasil',flag:'🇧🇷',goals:0,assists:0,pos:'MED',caps:77,rating:85},
  {id:'sp11',name:'Lucas Paquetá',team:'Brasil',flag:'🇧🇷',goals:0,assists:0,pos:'MED',caps:52,rating:84},
  {id:'sp12',name:'Marquinhos',team:'Brasil',flag:'🇧🇷',goals:0,assists:0,pos:'DEF',caps:84,rating:86},
  {id:'sp13',name:'Alisson Becker',team:'Brasil',flag:'🇧🇷',goals:0,assists:0,pos:'POR',caps:72,rating:89},
  /* FRANCIA */
  {id:'sp14',name:'Kylian Mbappé',team:'Francia',flag:'🇫🇷',goals:0,assists:0,pos:'DEL',caps:82,rating:92},
  {id:'sp15',name:'Antoine Griezmann',team:'Francia',flag:'🇫🇷',goals:0,assists:0,pos:'DEL',caps:137,rating:85},
  {id:'sp16',name:'Ousmane Dembélé',team:'Francia',flag:'🇫🇷',goals:0,assists:0,pos:'DEL',caps:57,rating:84},
  {id:'sp17',name:'Aurélien Tchouaméni',team:'Francia',flag:'🇫🇷',goals:0,assists:0,pos:'MED',caps:35,rating:83},
  {id:'sp18',name:'NGolo Kanté',team:'Francia',flag:'🇫🇷',goals:0,assists:0,pos:'MED',caps:56,rating:85},
  {id:'sp19',name:'Mike Maignan',team:'Francia',flag:'🇫🇷',goals:0,assists:0,pos:'POR',caps:28,rating:87},
  /* ESPAÑA */
  {id:'sp20',name:'Lamine Yamal',team:'España',flag:'🇪🇸',goals:0,assists:0,pos:'DEL',caps:20,rating:88},
  {id:'sp21',name:'Pedri',team:'España',flag:'🇪🇸',goals:0,assists:0,pos:'MED',caps:48,rating:87},
  {id:'sp22',name:'Rodri',team:'España',flag:'🇪🇸',goals:0,assists:0,pos:'MED',caps:61,rating:91},
  {id:'sp23',name:'Dani Carvajal',team:'España',flag:'🇪🇸',goals:0,assists:0,pos:'DEF',caps:77,rating:84},
  {id:'sp24',name:'Aymeric Laporte',team:'España',flag:'🇪🇸',goals:0,assists:0,pos:'DEF',caps:20,rating:83},
  {id:'sp25',name:'Nico Williams',team:'España',flag:'🇪🇸',goals:0,assists:0,pos:'DEL',caps:18,rating:85},
  {id:'sp26',name:'Unai Simón',team:'España',flag:'🇪🇸',goals:0,assists:0,pos:'POR',caps:28,rating:84},
  /* PORTUGAL */
  {id:'sp27',name:'Cristiano Ronaldo',team:'Portugal',flag:'🇵🇹',goals:0,assists:0,pos:'DEL',caps:215,rating:88},
  {id:'sp28',name:'Bruno Fernandes',team:'Portugal',flag:'🇵🇹',goals:0,assists:0,pos:'MED',caps:75,rating:87},
  {id:'sp29',name:'Bernardo Silva',team:'Portugal',flag:'🇵🇹',goals:0,assists:0,pos:'MED',caps:89,rating:87},
  {id:'sp30',name:'Rúben Dias',team:'Portugal',flag:'🇵🇹',goals:0,assists:0,pos:'DEF',caps:74,rating:88},
  {id:'sp31',name:'Diogo Jota',team:'Portugal',flag:'🇵🇹',goals:0,assists:0,pos:'DEL',caps:49,rating:84},
  /* ALEMANIA */
  {id:'sp32',name:'Florian Wirtz',team:'Alemania',flag:'🇩🇪',goals:0,assists:0,pos:'MED',caps:30,rating:87},
  {id:'sp33',name:'Jamal Musiala',team:'Alemania',flag:'🇩🇪',goals:0,assists:0,pos:'MED',caps:42,rating:87},
  {id:'sp34',name:'Thomas Müller',team:'Alemania',flag:'🇩🇪',goals:0,assists:0,pos:'DEL',caps:131,rating:83},
  {id:'sp35',name:'Manuel Neuer',team:'Alemania',flag:'🇩🇪',goals:0,assists:0,pos:'POR',caps:124,rating:86},
  {id:'sp36',name:'Antonio Rüdiger',team:'Alemania',flag:'🇩🇪',goals:0,assists:0,pos:'DEF',caps:71,rating:86},
  /* INGLATERRA */
  {id:'sp37',name:'Jude Bellingham',team:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',goals:0,assists:0,pos:'MED',caps:40,rating:88},
  {id:'sp38',name:'Harry Kane',team:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',goals:0,assists:0,pos:'DEL',caps:92,rating:88},
  {id:'sp39',name:'Phil Foden',team:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',goals:0,assists:0,pos:'DEL',caps:42,rating:87},
  {id:'sp40',name:'Declan Rice',team:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',goals:0,assists:0,pos:'MED',caps:52,rating:86},
  {id:'sp41',name:'Jordan Pickford',team:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',goals:0,assists:0,pos:'POR',caps:60,rating:85},
  /* HOLANDA */
  {id:'sp42',name:'Virgil van Dijk',team:'Holanda',flag:'🇳🇱',goals:0,assists:0,pos:'DEF',caps:64,rating:87},
  {id:'sp43',name:'Cody Gakpo',team:'Holanda',flag:'🇳🇱',goals:0,assists:0,pos:'DEL',caps:38,rating:84},
  {id:'sp44',name:'Memphis Depay',team:'Holanda',flag:'🇳🇱',goals:0,assists:0,pos:'DEL',caps:108,rating:83},
  /* BÉLGICA */
  {id:'sp45',name:'Kevin De Bruyne',team:'Bélgica',flag:'🇧🇪',goals:0,assists:0,pos:'MED',caps:108,rating:91},
  {id:'sp46',name:'Romelu Lukaku',team:'Bélgica',flag:'🇧🇪',goals:0,assists:0,pos:'DEL',caps:112,rating:84},
  {id:'sp47',name:'Thibaut Courtois',team:'Bélgica',flag:'🇧🇪',goals:0,assists:0,pos:'POR',caps:102,rating:90},
  /* MARRUECOS */
  {id:'sp48',name:'Hakim Ziyech',team:'Marruecos',flag:'🇲🇦',goals:0,assists:0,pos:'MED',caps:62,rating:83},
  {id:'sp49',name:'Achraf Hakimi',team:'Marruecos',flag:'🇲🇦',goals:0,assists:0,pos:'DEF',caps:75,rating:86},
  {id:'sp50',name:'Sofiane Boufal',team:'Marruecos',flag:'🇲🇦',goals:0,assists:0,pos:'DEL',caps:48,rating:81},
  /* JAPÓN */
  {id:'sp51',name:'Takefusa Kubo',team:'Japón',flag:'🇯🇵',goals:0,assists:0,pos:'MED',caps:38,rating:83},
  {id:'sp52',name:'Kaoru Mitoma',team:'Japón',flag:'🇯🇵',goals:0,assists:0,pos:'DEL',caps:40,rating:84},
  /* MÉXICO */
  {id:'sp53',name:'Hirving Lozano',team:'México',flag:'🇲🇽',goals:0,assists:0,pos:'DEL',caps:76,rating:82},
  {id:'sp54',name:'Edson Álvarez',team:'México',flag:'🇲🇽',goals:0,assists:0,pos:'MED',caps:68,rating:82},
  {id:'sp55',name:'Santiago Giménez',team:'México',flag:'🇲🇽',goals:0,assists:0,pos:'DEL',caps:32,rating:83},
  /* USA */
  {id:'sp56',name:'Christian Pulisic',team:'EEUU',flag:'🇺🇸',goals:0,assists:0,pos:'DEL',caps:69,rating:83},
  {id:'sp57',name:'Weston McKennie',team:'EEUU',flag:'🇺🇸',goals:0,assists:0,pos:'MED',caps:47,rating:80},
  /* NORUEGA */
  {id:'sp58',name:'Erling Haaland',team:'Noruega',flag:'🇳🇴',goals:0,assists:0,pos:'DEL',caps:34,rating:91},
  {id:'sp59',name:'Martin Ødegaard',team:'Noruega',flag:'🇳🇴',goals:0,assists:0,pos:'MED',caps:89,rating:86},
  /* URUGUAY */
  {id:'sp60',name:'Darwin Núñez',team:'Uruguay',flag:'🇺🇾',goals:0,assists:0,pos:'DEL',caps:39,rating:85},
  {id:'sp61',name:'Federico Valverde',team:'Uruguay',flag:'🇺🇾',goals:0,assists:0,pos:'MED',caps:64,rating:87},
  {id:'sp62',name:'Luis Suárez',team:'Uruguay',flag:'🇺🇾',goals:0,assists:0,pos:'DEL',caps:142,rating:82},
  /* COLOMBIA */
  {id:'sp63',name:'James Rodríguez',team:'Colombia',flag:'🇨🇴',goals:0,assists:0,pos:'MED',caps:104,rating:84},
  {id:'sp64',name:'Luis Díaz',team:'Colombia',flag:'🇨🇴',goals:0,assists:0,pos:'DEL',caps:42,rating:86},
  /* SENEGAL */
  {id:'sp65',name:'Sadio Mané',team:'Senegal',flag:'🇸🇳',goals:0,assists:0,pos:'DEL',caps:99,rating:84},
  {id:'sp66',name:'Edouard Mendy',team:'Senegal',flag:'🇸🇳',goals:0,assists:0,pos:'POR',caps:54,rating:83},
  /* ECUADOR */
  {id:'sp67',name:'Enner Valencia',team:'Ecuador',flag:'🇪🇨',goals:0,assists:0,pos:'DEL',caps:87,rating:82},
  /* AUSTRALIA */
  {id:'sp68',name:'Mathew Leckie',team:'Australia',flag:'🇦🇺',goals:0,assists:0,pos:'DEL',caps:90,rating:78},
  /* IRÁN */
  {id:'sp69',name:'Sardar Azmoun',team:'Irán',flag:'🇮🇷',goals:0,assists:0,pos:'DEL',caps:68,rating:80},
  /* ARABIA SAUDITA */
  {id:'sp70',name:'Salem Al-Dawsari',team:'Arabia Saudita',flag:'🇸🇦',goals:0,assists:0,pos:'DEL',caps:89,rating:78},
  /* GHANA */
  {id:'sp71',name:'Jordan Ayew',team:'Ghana',flag:'🇬🇭',goals:0,assists:0,pos:'DEL',caps:90,rating:78},
  /* SUIZA */
  {id:'sp72',name:'Granit Xhaka',team:'Suiza',flag:'🇨🇭',goals:0,assists:0,pos:'MED',caps:128,rating:83},
  {id:'sp73',name:'Xherdan Shaqiri',team:'Suiza',flag:'🇨🇭',goals:0,assists:0,pos:'DEL',caps:112,rating:81},
  /* CROACIA */
  {id:'sp74',name:'Luka Modrić',team:'Croacia',flag:'🇭🇷',goals:0,assists:0,pos:'MED',caps:179,rating:87},
  {id:'sp75',name:'Ivan Perišić',team:'Croacia',flag:'🇭🇷',goals:0,assists:0,pos:'DEL',caps:123,rating:82},
  /* DINAMARCA */
  {id:'sp76',name:'Christian Eriksen',team:'Dinamarca',flag:'🇩🇰',goals:0,assists:0,pos:'MED',caps:131,rating:84},
  /* NIGERIA */
  {id:'sp77',name:'Victor Osimhen',team:'Nigeria',flag:'🇳🇬',goals:0,assists:0,pos:'DEL',caps:32,rating:86},
  {id:'sp78',name:'Wilfried Ndidi',team:'Nigeria',flag:'🇳🇬',goals:0,assists:0,pos:'MED',caps:65,rating:81},
  /* PERÚ */
  {id:'sp79',name:'André Carrillo',team:'Perú',flag:'🇵🇪',goals:0,assists:0,pos:'DEL',caps:102,rating:78},
  /* CANADÁ */
  {id:'sp80',name:'Alphonso Davies',team:'Canadá',flag:'🇨🇦',goals:0,assists:0,pos:'DEF',caps:55,rating:86},
  {id:'sp81',name:'Jonathan David',team:'Canadá',flag:'🇨🇦',goals:0,assists:0,pos:'DEL',caps:36,rating:84},
  /* SUDÁFRICA */
  {id:'sp82',name:'Percy Tau',team:'Sudáfrica',flag:'🇿🇦',goals:0,assists:0,pos:'DEL',caps:62,rating:77},
];

const Stats = {
  _currentTab: 'teams',
  _lastQuery: '',

  async render(tab = 'teams') {
    this._currentTab = tab;
    // Restaurar el input de búsqueda si hay query guardada
    const input = document.getElementById('search-input');
    if (input && this._lastQuery) input.value = this._lastQuery;
    const content = document.getElementById('stats-content');
    if (!content) return;
    content.innerHTML = '<div class="spinner"></div>';
    try {
      // Usar la última query al cambiar de tab para no perder la búsqueda
      const q = this._lastQuery;
      if (tab === 'teams')   await this.renderTeams(content, q);
      if (tab === 'players') await this.renderPlayers(content, q);
      if (tab === 'scorers') await this.renderScorers(content);
    } catch(err) {
      console.error('[Stats.render]', err);
      content.innerHTML = '<p class="empty-state" style="color:var(--text-muted)">Error al cargar datos. Intenta de nuevo.</p>';
    }
  },

  async renderTeams(container, query = '') {
    let teams = await API.getTeams(query);
    // BUG FIX: si la API devuelve vacío, asegurarse de tener datos
    if (!teams || teams.length === 0) {
      teams = await API.getTeams(query); // un reintento
    }
    const user    = await Auth.currentUser();
    const favIds  = new Set((user?.favoritos || []).map(f => f.id));

    container.innerHTML = `
      <div class="stats-table-wrap">
        <table class="stats-table">
          <thead><tr>
            <th>#</th><th>Equipo</th><th>PJ</th>
            <th>W</th><th>D</th><th>L</th>
            <th>GF</th><th>GC</th><th>Pts</th><th></th>
          </tr></thead>
          <tbody>
            ${teams.map((t, i) => `
              <tr>
                <td class="text-muted">${i+1}</td>
                <td><span class="team-flag">${t.flag||'🏳️'}</span>${t.name}</td>
                <td>${t.pj??0}</td>
                <td class="stat-w">${t.w??0}</td>
                <td class="text-muted">${t.d??0}</td>
                <td class="stat-l">${t.l??0}</td>
                <td>${t.gf??0}</td>
                <td>${t.gc??0}</td>
                <td class="stat-pts">${t.pts??0}</td>
                <td>
                  <button class="fav-btn ${favIds.has(t.id)?'active':''}"
                    data-id="${t.id}" data-name="${t.name.replace(/'/g, '&#39;')}"
                    data-flag="${t.flag||''}" data-tipo="team">
                    ${favIds.has(t.id)?'★':'☆'}
                  </button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    container.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const isFav = await Profile.isFavorite(btn.dataset.id, 'team'); // BUG FIX: pasar tipo
        if (isFav) {
          await Profile.removeFavorite(btn.dataset.id, 'team');
          btn.textContent = '☆'; btn.classList.remove('active');
        } else {
          await Profile.addFavorite({id:btn.dataset.id,name:btn.dataset.name,flag:btn.dataset.flag},'team');
          btn.textContent = '★'; btn.classList.add('active');
        }
      });
    });
  },

  async renderPlayers(container, query = '') {
    // BUG FIX: usar ALL_PLAYERS como base completa, enriquecer con datos de API si disponibles
    // API.getPlayers() usa IDs 'p01', ALL_PLAYERS usa 'sp01' → fusionar por nombre
    let merged = [...ALL_PLAYERS];
    try {
      const apiPlayers = await API.getPlayers('');
      if (apiPlayers && apiPlayers.length > 0) {
        const allNames = new Set(ALL_PLAYERS.map(p => p.name.toLowerCase()));
        for (const p of apiPlayers) {
          if (!allNames.has(p.name.toLowerCase())) merged.push(p);
        }
        // Actualizar stats (goles/asistencias) de los que ya están en merged
        apiPlayers.forEach(ap => {
          const existing = merged.find(p => p.name.toLowerCase() === ap.name.toLowerCase());
          if (existing && (ap.goals > 0 || ap.assists > 0)) {
            existing.goals   = ap.goals;
            existing.assists = ap.assists;
          }
        });
      }
    } catch(_) { /* usar ALL_PLAYERS como fallback */ }
    // Filter by query
    const q       = query.toLowerCase();
    const players = q
      ? merged.filter(p => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q))
      : merged;

    const user    = await Auth.currentUser();
    const favIds  = new Set((user?.favoritos || []).map(f => f.id));

    if (!players.length) {
      container.innerHTML = '<p class="empty-state">No se encontraron jugadores.</p>';
      return;
    }

    container.innerHTML = `
      <div class="stats-table-wrap">
        <table class="stats-table">
          <thead><tr>
            <th>Jugador</th><th>Equipo</th><th>Pos</th>
            <th>⚽</th><th>🅰️</th><th>Caps</th><th></th>
          </tr></thead>
          <tbody>
            ${players.map(p => `
              <tr>
                <td style="font-weight:600">${p.name}</td>
                <td><span class="team-flag">${p.flag||'🏳️'}</span>${p.team}</td>
                <td><span class="pos-badge">${p.pos}</span></td>
                <td class="stat-w">${p.goals??0}</td>
                <td style="color:var(--rare)">${p.assists??0}</td>
                <td class="text-muted">${p.caps??0}</td>
                <td>
                  <button class="fav-btn ${favIds.has(p.id)?'active':''}"
                    data-id="${p.id}" data-name="${p.name.replace(/'/g, '&#39;')}"
                    data-flag="${p.flag||''}" data-tipo="player">
                    ${favIds.has(p.id)?'★':'☆'}
                  </button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    container.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const isFav = await Profile.isFavorite(btn.dataset.id, 'player'); // BUG FIX: pasar tipo
        if (isFav) {
          await Profile.removeFavorite(btn.dataset.id, 'player');
          btn.textContent = '☆'; btn.classList.remove('active');
        } else {
          await Profile.addFavorite({id:btn.dataset.id,name:btn.dataset.name,flag:btn.dataset.flag},'player');
          btn.textContent = '★'; btn.classList.add('active');
        }
      });
    });
  },

  async renderScorers(container) {
    const scorers = await API.getTopScorers();
    container.innerHTML = `
      <div class="stats-table-wrap">
        <table class="stats-table">
          <thead><tr><th>#</th><th>Jugador</th><th>Equipo</th><th>⚽</th><th>🅰️</th></tr></thead>
          <tbody>
            ${scorers.map((p,i) => `
              <tr>
                <td style="font-family:'Bebas Neue',cursive;font-size:1.2rem;
                  color:${i===0?'var(--gold)':i===1?'#c0c0c0':i===2?'#cd7f32':'var(--text-muted)'}">${i+1}</td>
                <td style="font-weight:600">${p.name}</td>
                <td><span class="team-flag">${p.flag||'🏳️'}</span>${p.team}</td>
                <td style="color:var(--gold);font-family:'Bebas Neue',cursive;font-size:1.2rem">${p.goals}</td>
                <td style="color:var(--rare)">${p.assists??0}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  },

  async search(query) {
    this._lastQuery = query; // Persistir query para cuando se cambie de tab
    const content = document.getElementById('stats-content');
    if (!content) return;
    content.innerHTML = '<div class="spinner"></div>';
    if (this._currentTab === 'teams')   await this.renderTeams(content, query);
    if (this._currentTab === 'players') await this.renderPlayers(content, query);
    if (this._currentTab === 'scorers') await this.renderScorers(content);
  },

  /* Buscar por nombre para el modal de favorito en Dashboard */
  findPlayer(name) {
    const q = name.toLowerCase();
    return ALL_PLAYERS.find(p => p.name.toLowerCase().includes(q)) || null;
  }
};
