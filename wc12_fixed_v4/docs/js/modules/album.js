/**
 * album.js — Álbum Virtual y Equipo Ideal  v8-final
 * FIXES: slot picker funcional, equipo_ideal guardado en IndexedDB,
 *        Battle lo lee, fotos async no bloquean UI
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

const PLAYER_STATS = {
  'fig_l001':{goals:18,assists:12,apps:26,saves:null},
  'fig_l002':{goals:24,assists:8, apps:28,saves:null},
  'fig_l003':{goals:16,assists:14,apps:30,saves:null},
  'fig_l004':{goals:28,assists:6, apps:25,saves:null},
  'fig_e001':{goals:8, assists:11,apps:24,saves:null},
  'fig_e002':{goals:14,assists:9, apps:27,saves:null},
  'fig_e003':{goals:4, assists:6, apps:26,saves:null},
  'fig_e004':{goals:7, assists:10,apps:29,saves:null},
  'fig_e005':{goals:12,assists:8, apps:28,saves:null},
  'fig_e006':{goals:15,assists:10,apps:22,saves:null},
  'fig_e007':{goals:10,assists:12,apps:25,saves:null},
  'fig_e008':{goals:5, assists:9, apps:20,saves:null},
  'fig_e009':{goals:11,assists:13,apps:30,saves:null},
  'fig_e010':{goals:9, assists:7, apps:27,saves:null},
  'fig_r001':{goals:2, assists:1, apps:24,saves:null},
  'fig_r002':{goals:3, assists:1, apps:28,saves:null},
  'fig_r003':{goals:2, assists:0, apps:26,saves:null},
  'fig_r004':{goals:0, assists:0, apps:30,saves:78},
  'fig_r005':{goals:0, assists:0, apps:27,saves:82},
  'fig_r006':{goals:9, assists:11,apps:29,saves:null},
  'fig_r007':{goals:10,assists:5, apps:26,saves:null},
  'fig_r008':{goals:8, assists:6, apps:23,saves:null},
  'fig_r009':{goals:11,assists:4, apps:22,saves:null},
  'fig_r010':{goals:7, assists:8, apps:20,saves:null},
  'fig_r011':{goals:6, assists:7, apps:24,saves:null},
  'fig_r012':{goals:5, assists:9, apps:22,saves:null},
  'fig_c001':{goals:4, assists:5, apps:20,saves:null},
  'fig_c002':{goals:8, assists:4, apps:22,saves:null},
  'fig_c003':{goals:13,assists:3, apps:24,saves:null},
  'fig_c004':{goals:9, assists:2, apps:18,saves:null},
  'fig_c005':{goals:1, assists:2, apps:25,saves:null},
  'fig_c006':{goals:5, assists:7, apps:21,saves:null},
  'fig_c007':{goals:2, assists:3, apps:23,saves:null},
  'fig_c008':{goals:2, assists:1, apps:22,saves:null},
  'fig_c009':{goals:0, assists:0, apps:19,saves:54},
  'fig_c010':{goals:7, assists:5, apps:24,saves:null},
  'fig_c011':{goals:3, assists:6, apps:19,saves:null},
  'fig_c012':{goals:14,assists:2, apps:21,saves:null},
  'fig_c013':{goals:9, assists:3, apps:24,saves:null},
  'fig_c014':{goals:3, assists:4, apps:20,saves:null},
};

/* Fotos: usar API.getPhotoById(fig.id, fig.sdbName||fig.name) — localStorage */

const Album = {
  _currentFilter: 'all',

  /* ── Foto: usa localStorage via API.getPhotoById ── */
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
    const owned    = user?.figuritas || [];
    const pool     = Gacha.getPool();
    const filtered = filter === 'all' ? pool : pool.filter(f => f.rareza === filter);
    const ownedSet = new Set(owned.map(f => f.id));
    const pct      = pool.length > 0 ? Math.round((ownedSet.size / pool.length) * 100) : 0;

    document.getElementById('album-pct').textContent =
      `${pct}% completado (${ownedSet.size}/${pool.length})`;
    document.getElementById('album-bar').style.width = `${pct}%`;

    const grid = document.getElementById('album-grid');
    if (!grid) return;

    // Migrar caché legacy wcc_photos_v1 → wcc_photos_v2
    try {
      const oldRaw = localStorage.getItem('wcc_photos_v1');
      if (oldRaw) {
        const oldStore = JSON.parse(oldRaw);
        const newStore = API._photoStore();
        let changed = false;
        Object.entries(oldStore).forEach(([k, v]) => {
          if (v && !newStore[k]) { newStore[k] = v; changed = true; }
        });
        if (changed) API._photoSave(newStore);
        localStorage.removeItem('wcc_photos_v1');
      }
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
                    onerror="this.style.display='none';this.parentNode.querySelector('.album-slot-emoji-fb').style.display='inline'"><span class="album-slot-emoji album-slot-emoji-fb" style="display:none">${fig.emoji}</span>`
            : `<span class="album-slot-emoji">${fig.emoji}</span>`)
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
                    onerror="this.parentNode.innerHTML='<span style=font-size:4rem>${fig.emoji}</span>'"/>
             </div>`
          : `<div style="font-size:4rem;margin-bottom:0.75rem">${fig.emoji}</div>`}
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
    const owned     = user?.figuritas || [];
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
                : `<span style="font-size:1.3rem">${fig.emoji}</span>`
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
                      onerror="this.parentNode.innerHTML='<span style=font-size:1.5rem>${f.emoji}</span>'">`
              : `<span style="font-size:1.5rem">${f.emoji}</span>`}
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
    const handler = async (e) => {
      const card = e.target.closest('[data-pick]');
      if (!card) return;
      if (e.target.closest('#modal-close')) return;
      box.removeEventListener('click', handler);
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
    box.addEventListener('click', handler);

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
  buildIdealTeamPlayers(owned, saved, formation = '4-3-3') {
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
