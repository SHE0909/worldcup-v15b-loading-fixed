/**
 * album.js — Álbum Virtual y Equipo Ideal  v9
 * FIXES: _enrichOwned() sincroniza figuritas guardadas con el pool actual,
 *        _emojiStr() soporta emoji como string o array (gacha v7+),
 *        slot picker y equipo ideal siempre muestran jugadores actualizados.
 */

/* Formaciones disponibles */
const FORMATIONS = {
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

function getFormationRows(name) {
  return FORMATIONS[name] || FORMATIONS['4-3-3'];
}

/**
 * PLAYER_STATS — generado dinámicamente desde FIGURITAS_POOL (gacha.js)
 * Garantiza que album y dashboard siempre muestren los mismos datos.
 * Se construye una sola vez al cargar la página.
 */
function buildPlayerStats() {
  const map = {};
  const pool = (typeof FIGURITAS_POOL !== 'undefined') ? FIGURITAS_POOL : [];
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
const PLAYER_STATS = buildPlayerStats();



const Album = {
  _currentFilter: 'all',

  /**
   * Sincroniza los IDs guardados en user.figuritas con el pool ACTUAL.
   * Preserva duplicados y fecha de obtención, pero nombre/pos/rating/emoji
   * siempre vienen del pool vigente. IDs que ya no existen en el pool se descartan.
   */
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

  /** Normaliza emoji: soporta string ('⚽') y array (['🇵🇹','🐐','⚽']) */
  _emojiStr(val) {
    if (!val) return '⚽';
    return Array.isArray(val) ? val.join('') : val;
  },

  /* ── Foto: CDN jsDelivr via API.getPhotoById ── */
  async _getPhoto(fig) {
    try {
      const timeout = new Promise(r => setTimeout(() => r(null), 8000));
      return await Promise.race([
        API.getPhotoById(fig.id, fig.sdbName || fig.name),
        timeout
      ]);
    } catch(_) { return null; }
  },

  /* ── Render álbum ── */
  async render(filter = 'all') {
    this._currentFilter = filter;
    const user     = await Auth.currentUser();
    const owned    = this._enrichOwned(user?.figuritas);
    const pool     = Gacha.getPool();
    const filtered = filter === 'all' ? pool : pool.filter(f => f.rareza === filter);
    const ownedSet = new Set(owned.map(f => f.id));
    const pct      = pool.length > 0 ? Math.round((ownedSet.size / pool.length) * 100) : 0;

    document.getElementById('album-pct').textContent =
      `${pct}% completado (${ownedSet.size}/${pool.length})`;
    document.getElementById('album-bar').style.width = `${pct}%`;

    const grid = document.getElementById('album-grid');
    if (!grid) return;

    // Migrar/invalidar cachés legacy de fotos (v1, v2 con URLs de Wikipedia rotas)
    // La migración real la hace API._migrateLegacyPhotoCache() en precachePhotos.
    // Aquí solo nos aseguramos de que no queden claves v1/v2 en localStorage.
    try {
      if (localStorage.getItem('wcc_photos_v1')) localStorage.removeItem('wcc_photos_v1');
      if (localStorage.getItem('wcc_photos_v2')) localStorage.removeItem('wcc_photos_v2');
    } catch(_) {}

    grid.innerHTML = filtered.map(fig => {
      const uFig  = owned.find(f => f.id === fig.id);
      const has   = !!uFig;
      const dupes = uFig?.duplicados || 0;
      // getPhotoSync: mapa hardcodeado → memoria → localStorage (sin async, sin race conditions)
      const cached    = has ? API.getPhotoSync(fig) : null;
      const photoHtml = has
        ? (cached
            ? `<img src="${cached}" class="album-slot-img" alt="${fig.name}" referrerpolicy="no-referrer" loading="lazy"
                    onerror="this.style.display='none';this.parentNode.querySelector('.album-slot-emoji-fb').style.display='inline'"><span class="album-slot-emoji album-slot-emoji-fb" style="display:none">${this._emojiStr(fig.emoji)}</span>`
            : `<span class="album-slot-emoji">${this._emojiStr(fig.emoji)}</span>`)
        : `<span class="album-slot-unknown">❓</span>`;
      return `
        <div class="album-slot ${has?'owned':'empty'} ${fig.rareza}" data-id="${fig.id}">
          <div class="album-slot-photo" id="aphoto-${fig.id}">${photoHtml}</div>
          ${has ? `<span class="album-slot-name">${fig.name.split(' ')[0]}</span>` : ''}
          ${dupes > 0 ? `<span class="album-slot-dupe">×${dupes+1}</span>` : ''}
          <span class="rarity-badge badge-${fig.rareza}">${Gacha.getRarityLabel(fig.rareza)[0]}</span>
        </div>`;
    }).join('');

    grid.querySelectorAll('.album-slot.owned').forEach(el =>
      el.addEventListener('click', () => this.showCardDetail(el.dataset.id, owned))
    );

    // Solo buscar en red para figuras sin foto accesible de forma síncrona
    filtered.filter(f => ownedSet.has(f.id)).forEach(fig => {
      if (API.getPhotoSync(fig)) return; // ya está disponible, no ir a la red
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
  /* ── Modal carta ── */
  async showCardDetail(id, owned) {
    const fig   = Gacha.getPool().find(f => f.id === id);
    const uFig  = owned.find(f => f.id === id);
    if (!fig) return;
    const stats = PLAYER_STATS[fig.id] || {};
    const photo = await this._getPhoto(fig);  // localStorage via API.getPhotoById
    const isPOR = fig.pos === 'POR';
    const s1v   = isPOR ? (stats.saves??0) : (stats.goals??0);
    const s1l   = isPOR ? 'Paradas' : 'Goles';
    const s2v   = isPOR ? (stats.apps??0)  : (stats.assists??0);
    const s2l   = isPOR ? 'PJ' : 'Asist.';
    Modal.open(`
      <div class="modal-player-detail">
        ${photo
          ? `<div class="modal-player-photo">
               <img referrerpolicy="no-referrer" src="${photo}" alt="${fig.name}"
                    style="width:100%;height:100%;object-fit:cover;object-position:top center;border-radius:8px;"
                    onerror="this.parentNode.innerHTML='<span style=font-size:2rem>${this._emojiStr(fig.emoji)}</span>'"/>
             </div>`
          : `<div style="font-size:2.5rem;margin-bottom:0.75rem">${this._emojiStr(fig.emoji)}</div>`}
        <h2 class="modal-player-name">${fig.name}</h2>
        <p class="modal-player-team">${fig.flag||''} ${fig.team}</p>
        <div style="display:flex;gap:0.5rem;justify-content:center;margin-bottom:1rem;flex-wrap:wrap">
          <span class="rarity ${fig.rareza}">${Gacha.getRarityLabel(fig.rareza)}</span>
          <span class="pos-badge">${fig.pos}</span>
          <span class="figurita-rating">⭐${fig.rating}</span>
        </div>
        <div class="modal-stats-row">
          <div class="modal-stat"><span>${s1v}</span><label>${s1l}</label></div>
          <div class="modal-stat"><span>${s2v}</span><label>${s2l}</label></div>
          <div class="modal-stat"><span>${stats.apps??0}</span><label>Partidos</label></div>
        </div>
        ${(uFig?.duplicados||0)>0
          ? `<p style="font-size:0.75rem;color:var(--gold);margin-top:0.75rem">🔁 ${uFig.duplicados} dupl.</p>`:''}
        <p style="font-size:0.7rem;color:var(--text-muted);margin-top:0.5rem">
          Obtenida: ${uFig?.obtenida?new Date(uFig.obtenida).toLocaleDateString('es'):'-'}
        </p>
      </div>`);
  },

  /* ══════════════════════════════════════════
     EQUIPO IDEAL
  ══════════════════════════════════════════ */
  async renderIdealTeam() {
    const user      = await Auth.currentUser();
    const owned     = this._enrichOwned(user?.figuritas);
    const saved     = user?.equipo_ideal || {};
    const formation = user?.formacion || '4-3-3';
    const rows      = getFormationRows(formation);

    // Renderizar selector de formación
    const selWrap = document.getElementById('formation-selector');
    if (selWrap) {
      selWrap.innerHTML = Object.keys(FORMATIONS).map(f =>
        `<button class="formation-btn ${f===formation?'active':''}" data-f="${f}">${f}</button>`
      ).join('');
      selWrap.querySelectorAll('.formation-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const u = await Auth.currentUser();
          u.formacion = btn.dataset.f;
          // Limpiar alineación al cambiar formación
          u.equipo_ideal = {};
          await Auth.updateUser(u);
          this.renderIdealTeam();
          Toast.show(`Formación ${btn.dataset.f} seleccionada`);
        });
      });
    }

    const field = document.getElementById('formation-field');
    if (!field) return;

    // Calcular qué IDs ya están asignados (para evitar repetidos)
    const usedIds = new Set(Object.values(saved).filter(Boolean));

    field.innerHTML = '';
    rows.forEach((row, ri) => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'formation-row';
      row.slots.forEach((pos, si) => {
        const key    = `${ri}_${si}`;
        const figId  = saved[key];
        const fig    = figId ? owned.find(f => f.id === figId) : null;
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
        slot.addEventListener('click', () => this.openPicker(key, pos, owned, saved, user));
        rowDiv.appendChild(slot);
      });
      field.appendChild(rowDiv);
    });

    // Precargar fotos de slots asignados sin bloquear
    Object.values(saved).filter(Boolean).forEach(id => {
      const fig = owned.find(f => f.id === id);
      if (fig && !API.getPhotoSync(fig)) {
        this._getPhoto(fig).then(() => this.renderIdealTeam());
      }
    });
  },

  /* ── Picker de jugador por posición ── */
  openPicker(key, pos, owned, saved, user) {
    // IDs ya usados en OTROS slots (el slot actual puede reusarse/quitarse)
    const usedInOtherSlots = new Set(
      Object.entries(saved)
        .filter(([k, v]) => k !== key && v)
        .map(([, v]) => v)
    );

    // Disponibles: correcta posición Y no usados en otro slot
    const available = owned.filter(f =>
      f.pos === pos && !usedInOtherSlots.has(f.id)
    );
    if (!available.length) {
      // Si no hay porque todos están usados, mostrar aviso específico
      const posAny = owned.filter(f => f.pos === pos);
      if (posAny.length > 0) {
        Toast.warn(`Tus figuritas de ${pos} ya están todas asignadas`);
      } else {
        Toast.warn(`No tienes figuritas de ${pos} aún 🎴`);
      }
      return;
    }
    const currentId = saved[key];
    const cardsHtml = available.map(f => {
      const photo = API.getPhotoSync(f);
      return `
        <div class="slot-pick-card${f.id===currentId?' slot-pick-active':''}" data-pick="${f.id}">
          <div class="slot-pick-photo">
            ${photo
              ? `<img referrerpolicy="no-referrer" src="${photo}" alt="${f.name}"
                      style="width:100%;height:100%;object-fit:cover;object-position:top center;"
                      onerror="this.parentNode.innerHTML='<span style=font-size:1rem>${this._emojiStr(f.emoji)}</span>'">`
              : `<span style="font-size:1.5rem">${this._emojiStr(f.emoji)}</span>`}
          </div>
          <span class="slot-pick-name">${f.name.split(' ')[0]}</span>
          <span class="rarity-badge badge-${f.rareza}" style="position:static;font-size:0.48rem">⭐${f.rating}</span>
          ${f.id===currentId?'<span class="slot-pick-current">✓</span>':''}
        </div>`;
    }).join('');

    Modal.open(`
      <div class="slot-picker-header">
        <h3>Elegir <span class="text-accent">${pos}</span></h3>
        <p style="font-size:0.75rem;color:var(--text-muted)">${available.length} disponible(s)</p>
      </div>
      <div class="slot-picker-grid">
        <div class="slot-pick-card slot-pick-clear" data-pick="__clear__">
          <span style="font-size:1.4rem">✕</span>
          <span style="font-size:0.62rem;color:var(--text-muted)">Vaciar</span>
        </div>
        ${cardsHtml}
      </div>`);

    /* ── Evento delegado en el modal-box (no en overlay para no interferir con cerrar) ── */
    const box = document.getElementById('modal-box');
    const overlay = document.getElementById('modal-overlay');

    const cleanupListeners = () => {
      box.removeEventListener('click', handler);
      if (overlay) overlay.removeEventListener('click', onOverlayClose);
    };

    const handler = async (e) => {
      const card = e.target.closest('[data-pick]');
      if (!card) return;
      if (e.target.closest('#modal-close')) {
        // X button: no changes, just close
        cleanupListeners();
        return;
      }
      cleanupListeners();
      const pick = card.dataset.pick;
      if (pick === '__clear__') delete saved[key];
      else {
        saved[key] = pick;
        // precargar foto del nuevo asignado
        const f = owned.find(x => x.id === pick);
        if (f && !API.getPhotoSync(f)) await this._getPhoto(f);
      }
      user.equipo_ideal = saved;
      await Auth.updateUser(user);
      Modal.close();
      await this.renderIdealTeam();
      Toast.success('Alineación actualizada ✅');
    };

    // Si el usuario cierra el modal sin elegir (overlay o botón X), no cambiar nada
    const onOverlayClose = () => {
      cleanupListeners();
    };

    box.addEventListener('click', handler);
    if (overlay) overlay.addEventListener('click', onOverlayClose);

    // Precargar fotos disponibles en bg
    available.forEach(f => {
      if (!API.getPhotoSync(f)) this._getPhoto(f);
    });
  },

  async saveTeam() {
    const user = await Auth.currentUser();
    if (!user) return;
    await Auth.updateUser(user);
    Toast.success('Alineación guardada ✅');
  },

  /* Construir array de jugadores del equipo ideal para Battle */
buildIdealTeamPlayers(rawOwned, saved, formation = '4-3-3') {
    const owned   = this._enrichOwned(rawOwned);
    const players = [];
    const rows    = getFormationRows(formation);
    rows.forEach((row, ri) => {
      row.slots.forEach((pos, si) => {
        const id  = saved[`${ri}_${si}`];
        const fig = id ? owned.find(f => f.id === id) : null;
        if (fig) players.push({ ...fig });
      });
    });
    return players;
  },

  getPlayerStats(id) { return PLAYER_STATS[id] || null; }
};