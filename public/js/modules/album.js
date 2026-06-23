const FORMACIONES = {
  '4-3-3': [
    { slots: ['POR'] },
    { slots: ['DEF','DEF','DEF','DEF'] },
    { slots: ['MED','MED','MED'] },
    { slots: ['DEL','DEL','DEL'] }
  ],
  '4-4-2': [
    { slots: ['POR'] },
    { slots: ['DEF','DEF','DEF','DEF'] },
    { slots: ['MED','MED','MED','MED'] },
    { slots: ['DEL','DEL'] }
  ],
  '3-5-2': [
    { slots: ['POR'] },
    { slots: ['DEF','DEF','DEF'] },
    { slots: ['MED','MED','MED','MED','MED'] },
    { slots: ['DEL','DEL'] }
  ],
  '4-2-3-1': [
    { slots: ['POR'] },
    { slots: ['DEF','DEF','DEF','DEF'] },
    { slots: ['MED','MED'] },
    { slots: ['DEL','DEL','DEL'] },
    { slots: ['DEL'] }
  ],
  '5-3-2': [
    { slots: ['POR'] },
    { slots: ['DEF','DEF','DEF','DEF','DEF'] },
    { slots: ['MED','MED','MED'] },
    { slots: ['DEL','DEL'] }
  ],
  '3-4-3': [
    { slots: ['POR'] },
    { slots: ['DEF','DEF','DEF'] },
    { slots: ['MED','MED','MED','MED'] },
    { slots: ['DEL','DEL','DEL'] }
  ],
};

function obtenerFilasFormacion(name) {
  return FORMACIONES[name] || FORMACIONES['4-3-3'];
}

function construirStatsJugadores() {
  const map = {};
  const pool = (typeof POZO_FIGURITAS !== 'undefined') ? POZO_FIGURITAS : [];
  for (const f of pool) {
    map[f.id] = {
      goals:   f.goals   ?? 0,
      assists: f.assists ?? 0,
      apps:    f.apps    ?? 0,
      saves:   f.saves   ?? null,
      rating:  f.rating  ?? null,
    };
  }
  return map;
}
const STATS_JUGADORES = construirStatsJugadores();

const Album = {
  _currentFilter: 'all',

  
  _enrichOwned(rawFigs) {
    const pool = Gacha.getPool();
    return (rawFigs || [])
      .map(uf => {
        const p = pool.find(x => x.id === uf.id);
        if (!p) return null;
        return { ...p, duplicados: uf.duplicados || 0, obtenida: uf.obtenida };
      })
      .filter(Boolean);
  },

  
  _emojiStr(val) {
    if (!val) return '⚽';
    return Array.isArray(val) ? val.join('') : val;
  },

  
  async _getPhoto(fig) {
    try {
      const timeout = new Promise(r => setTimeout(() => r(null), 8000));
      return await Promise.race([
        API.getPhotoById(fig.id, fig.sdbName || fig.name),
        timeout
      ]);
    } catch(_) { return null; }
  },

  
  async renderizar(filter = 'all') {
    this._currentFilter = filter;
    const usuario     = await Auth.currentUser();
    const coleccion    = this._enrichOwned(usuario?.figuritas);
    const pool     = Gacha.getPool();
    const filtradas = filter === 'all' ? pool : pool.filter(f => f.rareza === filter);
    const setColeccion = new Set(coleccion.map(f => f.id));
    const porcentaje      = pool.length > 0 ? Math.vuelta((setColeccion.size / pool.length) * 100) : 0;

    document.getElementById('album-porcentaje').textContent =
      `${porcentaje}% completado (${setColeccion.size}/${pool.length})`;
    document.getElementById('album-bar').style.width = `${porcentaje}%`;

    const grid = document.getElementById('album-grid');
    if (!grid) return;

    
    
    
    try {
      if (localStorage.getItem('wcc_photos_v1')) localStorage.removeItem('wcc_photos_v1');
      if (localStorage.getItem('wcc_photos_v2')) localStorage.removeItem('wcc_photos_v2');
    } catch(_) {}

    grid.innerHTML = filtradas.map(fig => {
      const figUsuario  = coleccion.find(f => f.id === fig.id);
      const has   = !!figUsuario;
      const duplicados = figUsuario?.duplicados || 0;
      
      const cached    = has ? API.getPhotoSync(fig) : null;
      const htmlFoto = has
        ? (cached
            ? `<img src="${cached}" class="album-slot-img" alt="${fig.name}" referrerpolicy="no-referrer" loading="lazy"
                    onerror="this.style.display='none';this.parentNode.querySelector('.album-slot-emoji-fb').style.display='inline'"><span class="album-slot-emoji album-slot-emoji-fb" style="display:none">${this._emojiStr(fig.emoji)}</span>`
            : `<span class="album-slot-emoji">${this._emojiStr(fig.emoji)}</span>`)
        : `<span class="album-slot-unknown">❓</span>`;
      return `
        <div class="album-slot ${has?'coleccion':'empty'} ${fig.rareza}" data-id="${fig.id}">
          <div class="album-slot-photo" id="aphoto-${fig.id}">${htmlFoto}</div>
          ${has ? `<span class="album-slot-name">${fig.name.split(' ')[0]}</span>` : ''}
          ${duplicados > 0 ? `<span class="album-slot-dupe">×${duplicados+1}</span>` : ''}
          <span class="rarity-insignia insignia-${fig.rareza}">${Gacha.getRarityLabel(fig.rareza)[0]}</span>
        </div>`;
    }).join('');

    grid.querySelectorAll('.album-slot.coleccion').forEach(el =>
      el.addEventListener('click', () => this.showCardDetail(el.dataset.id, coleccion))
    );

    
    filtradas.filter(f => setColeccion.has(f.id)).forEach(fig => {
      if (API.getPhotoSync(fig)) return; 
      this._getPhoto(fig).then(url => {
        if (!url) return;
        const wrap = document.getElementById(`aphoto-${fig.id}`);
        if (wrap) {
          wrap.innerHTML = `<img src="${url}" class="album-slot-img" alt="${fig.name}" referrerpolicy="no-referrer" loading="lazy"
                                 onerror="this.style.display='none'">`;
        }
      });
    });
  },
  
  async showCardDetail(id, coleccion) {
    const fig   = Gacha.getPool().find(f => f.id === id);
    const figUsuario  = coleccion.find(f => f.id === id);
    if (!fig) return;
    const stats = STATS_JUGADORES[fig.id] || {};
    const photo = await this._getPhoto(fig);  
    const esPortero = fig.pos === 'POR';
    const s1v   = esPortero ? (stats.saves??0) : (stats.goals??0);
    const s1l   = esPortero ? 'Paradas' : 'Goles';
    const s2v   = esPortero ? (stats.apps??0)  : (stats.assists??0);
    const s2l   = esPortero ? 'PJ' : 'Asist.';
    Modal.open(`
      <div class="modal2-player-detail">
        ${photo
          ? `<div class="modal2-player-photo">
               <img referrerpolicy="no-referrer" src="${photo}" alt="${fig.name}"
                    style="width:100%;height:100%;object-fit:cover;object-position:top center;border-radius:8px;"
                    onerror="this.parentNode.innerHTML='<span style=font-size:2rem>${this._emojiStr(fig.emoji)}</span>'"/>
             </div>`
          : `<div style="font-size:2.5rem;margin-bottom:0.75rem">${this._emojiStr(fig.emoji)}</div>`}
        <h2 class="modal2-player-name">${fig.name}</h2>
        <p class="modal2-player-equipo">${fig.flag||''} ${fig.equipo}</p>
        <div style="display:flex;gap:0.5rem;justify-content:center;margin-bottom:1rem;flex-wrap:wrap">
          <span class="rarity ${fig.rareza}">${Gacha.getRarityLabel(fig.rareza)}</span>
          <span class="pos-insignia">${fig.pos}</span>
          <span class="figurita-rating">⭐${fig.rating}</span>
        </div>
        <div class="modal2-stats-row">
          <div class="modal2-stat"><span>${s1v}</span><etiqueta>${s1l}</etiqueta></div>
          <div class="modal2-stat"><span>${s2v}</span><etiqueta>${s2l}</etiqueta></div>
          <div class="modal2-stat"><span>${stats.apps??0}</span><etiqueta>Partidos</etiqueta></div>
        </div>
        ${(figUsuario?.duplicados||0)>0
          ? `<p style="font-size:0.75rem;color:var(--gold);margin-top:0.75rem">🔁 ${figUsuario.duplicados} dupl.</p>`:''}
        <p style="font-size:0.7rem;color:var(--text-muted);margin-top:0.5rem">
          Obtenida: ${figUsuario?.obtenida?new Date(figUsuario.obtenida).toLocaleDateString('es'):'-'}
        </p>
      </div>`);
  },

  
  async renderIdealTeam() {
    const usuario      = await Auth.currentUser();
    const coleccion     = this._enrichOwned(usuario?.figuritas);
    const guardado     = usuario?.equipo_ideal || {};
    const formation = usuario?.formacion || '4-3-3';
    const rows      = obtenerFilasFormacion(formation);

    
    const selectFormacion = document.getElementById('formation-selector');
    if (selectFormacion) {
      selectFormacion.innerHTML = Object.keys(FORMACIONES).map(f =>
        `<button class="formation-btn ${f===formation?'active':''}" data-f="${f}">${f}</button>`
      ).join('');
      selectFormacion.querySelectorAll('.formation-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const u = await Auth.currentUser();
          u.formacion = btn.dataset.f;
          
          u.equipo_ideal = {};
          await Auth.updateUser(u);
          this.renderIdealTeam();
          Toast.show(`Formación ${btn.dataset.f} seleccionada`);
        });
      });
    }

    const field = document.getElementById('formation-field');
    if (!field) return;

    
    const idsUsados = new Set(Object.values(guardado).filter(Boolean));

    field.innerHTML = '';
    rows.forEach((row, ri) => {
      const divFila = document.createElement('div');
      divFila.className = 'formation-row';
      row.slots.forEach((pos, si) => {
        const key    = `${ri}_${si}`;
        const idFigura  = guardado[key];
        const fig    = idFigura ? coleccion.find(f => f.id === idFigura) : null;
        const photo  = fig ? API.getPhotoSync(fig) : null;
        const slot   = document.createElement('div');
        slot.className = `formation-slot${fig?' filled':''}`;
        slot.dataset.key = key;
        slot.dataset.pos = pos;
        slot.innerHTML = fig
          ? `<div class="slot-photo-wrap">${
              photo
                ? `<img referrerpolicy="no-referrer" src="${photo}" class="slot-photo-img" alt="${fig.name}"
                        onerror="this.style.display='none'">`
                : `<span style="font-size:1.3rem">${this._emojiStr(fig.emoji)}</span>`
            }</div>
             <span class="slot-player-name">${fig.name.split(' ')[0]}</span>
             <span class="formation-pos">${pos}</span>`
          : `<span style="font-size:1rem;opacity:0.3">+</span>
             <span class="formation-pos">${pos}</span>`;
        slot.addEventListener('click', () => this.openPicker(key, pos, coleccion, guardado, usuario));
        divFila.appendChild(slot);
      });
      field.appendChild(divFila);
    });

    
    Object.values(guardado).filter(Boolean).forEach(id => {
      const fig = coleccion.find(f => f.id === id);
      if (fig && !API.getPhotoSync(fig)) {
        this._getPhoto(fig).then(() => this.renderIdealTeam());
      }
    });
  },

  
  openPicker(key, pos, coleccion, guardado, usuario) {
    
    const usadoEnOtrasRanuras = new Set(
      Object.entries(guardado)
        .filter(([k, v]) => k !== key && v)
        .map(([, v]) => v)
    );

    
    const disponibles = coleccion.filter(f =>
      f.pos === pos && !usadoEnOtrasRanuras.has(f.id)
    );
    if (!disponibles.length) {
      
      const cualquierPosicion = coleccion.filter(f => f.pos === pos);
      if (cualquierPosicion.length > 0) {
        Toast.warn(`Tus figuritas de ${pos} ya están todas asignadas`);
      } else {
        Toast.warn(`No tienes figuritas de ${pos} aún 🎴`);
      }
      return;
    }
    const idActual = guardado[key];
    const htmlCartas = disponibles.map(f => {
      const photo = API.getPhotoSync(f);
      return `
        <div class="slot-pick-card${f.id===idActual?' slot-pick-active':''}" data-pick="${f.id}">
          <div class="slot-pick-photo">
            ${photo
              ? `<img referrerpolicy="no-referrer" src="${photo}" alt="${f.name}"
                      style="width:100%;height:100%;object-fit:cover;object-position:top center;"
                      onerror="this.parentNode.innerHTML='<span style=font-size:1rem>${this._emojiStr(f.emoji)}</span>'">`
              : `<span style="font-size:1.5rem">${this._emojiStr(f.emoji)}</span>`}
          </div>
          <span class="slot-pick-name">${f.name.split(' ')[0]}</span>
          <span class="rarity-insignia insignia-${f.rareza}" style="position:static;font-size:0.48rem">⭐${f.rating}</span>
          ${f.id===idActual?'<span class="slot-pick-current">✓</span>':''}
        </div>`;
    }).join('');

    Modal.open(`
      <div class="slot-picker-header">
        <h3>Elegir <span class="text-accent">${pos}</span></h3>
        <p style="font-size:0.75rem;color:var(--text-muted)">${disponibles.length} disponible(s)</p>
      </div>
      <div class="slot-picker-grid">
        <div class="slot-pick-card slot-pick-clear" data-pick="__clear__">
          <span style="font-size:1.4rem">✕</span>
          <span style="font-size:0.62rem;color:var(--text-muted)">Vaciar</span>
        </div>
        ${htmlCartas}
      </div>`);

    
    const box = document.getElementById('modal2-box');
    const overlay = document.getElementById('modal2-overlay');

    const limpiarListeners = () => {
      box.removeEventListener('click', handler);
      if (overlay) overlay.removeEventListener('click', alCerrarCapa);
    };

    const handler = async (e) => {
      const card = e.target.closest('[data-pick]');
      if (!card) return;
      if (e.target.closest('#modal2-close')) {
        
        limpiarListeners();
        return;
      }
      limpiarListeners();
      const pick = card.dataset.pick;
      if (pick === '__clear__') delete guardado[key];
      else {
        guardado[key] = pick;
        
        const f = coleccion.find(x => x.id === pick);
        if (f && !API.getPhotoSync(f)) await this._getPhoto(f);
      }
      usuario.equipo_ideal = guardado;
      await Auth.updateUser(usuario);
      Modal.close();
      await this.renderIdealTeam();
      Toast.success('Alineación actualizada ✅');
    };

    
    const alCerrarCapa = () => {
      limpiarListeners();
    };

    box.addEventListener('click', handler);
    if (overlay) overlay.addEventListener('click', alCerrarCapa);

    
    disponibles.forEach(f => {
      if (!API.getPhotoSync(f)) this._getPhoto(f);
    });
  },

  async saveTeam() {
    const usuario = await Auth.currentUser();
    if (!usuario) return;
    await Auth.updateUser(usuario);
    Toast.success('Alineación guardada ✅');
  },

  
buildIdealTeamPlayers(rawOwned, guardado, formation = '4-3-3') {
    const coleccion   = this._enrichOwned(rawOwned);
    const jugadores = [];
    const rows    = obtenerFilasFormacion(formation);
    rows.forEach((row, ri) => {
      row.slots.forEach((pos, si) => {
        const id  = guardado[`${ri}_${si}`];
        const fig = id ? coleccion.find(f => f.id === id) : null;
        if (fig) jugadores.push({ ...fig });
      });
    });
    return jugadores;
  },

  getPlayerStats(id) { return STATS_JUGADORES[id] || null; }
};
