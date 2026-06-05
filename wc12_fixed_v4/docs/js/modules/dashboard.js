/**
 * dashboard.js — Panel principal  v2
 * Mejoras: venue en upcoming, evaluación predicciones al actualizar,
 *          partidos terminados visibles, mejor formato de fechas
 */

const Dashboard = {

  async render() {
    await Promise.all([
      this.renderLive(),
      this.renderUpcoming(),
      this.renderStandings(),
      this.renderFavorites()
    ]);
  },

  /* ── En Vivo ── */
  async renderLive() {
    const el = document.getElementById('live-matches');
    if (!el) return;
    const matches = await API.getLiveMatches();

    if (!matches || matches.length === 0) {
      el.innerHTML = '<p class="empty-state">No hay partidos en vivo ahora mismo</p>';
      return;
    }

    el.innerHTML = matches.map(m => `
      <div class="match-item match-live-item">
        <div class="match-teams-row">
          <span>${m.homeFlag || ''} ${m.home}</span>
          <span class="match-score">${m.scoreHome ?? 0} — ${m.scoreAway ?? 0}</span>
          <span>${m.away} ${m.awayFlag || ''}</span>
        </div>
        <div class="match-meta">
          <span class="match-live-badge">🔴 EN VIVO ${m.minute ? m.minute + "'" : ''}</span>
          <span style="font-size:0.65rem;color:var(--text-muted)">${m.competition || ''}</span>
        </div>
      </div>
    `).join('');
  },

  /* ── Próximos ── */
  async renderUpcoming() {
    const el = document.getElementById('upcoming-matches');
    if (!el) return;
    const matches = await API.getUpcomingMatches();

    if (!matches || matches.length === 0) {
      el.innerHTML = '<p class="empty-state">Sin próximos partidos</p>';
      return;
    }

    el.innerHTML = matches.slice(0, 6).map(m => {
      const isFriendly = m.type === 'friendly';
      const homeCrest = API.getCrest(m.home);
      const awayCrest = API.getCrest(m.away);
      const homeImg = homeCrest
        ? `<img src="${homeCrest}" style="width:18px;height:18px;object-fit:contain;vertical-align:middle" onerror="this.style.display='none'">`
        : (m.homeFlag || '');
      const awayImg = awayCrest
        ? `<img src="${awayCrest}" style="width:18px;height:18px;object-fit:contain;vertical-align:middle" onerror="this.style.display='none'">`
        : (m.awayFlag || '');
      return `
      <div class="match-item">
        <div style="flex:1;min-width:0">
          <div style="display:flex;gap:4px;margin-bottom:3px">
            <span style="font-size:0.55rem;padding:1px 5px;border-radius:10px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:1px;
              ${isFriendly
                ? 'background:rgba(74,168,255,0.15);color:var(--rare);border:1px solid rgba(74,168,255,0.3)'
                : 'background:rgba(255,215,0,0.12);color:var(--gold);border:1px solid rgba(255,215,0,0.3)'}">
              ${isFriendly ? 'AMISTOSO' : '🏆 MUNDIAL'}
            </span>
          </div>
          <div class="match-teams-row" style="font-size:0.82rem;font-weight:600">
            <span style="display:flex;align-items:center;gap:4px">${homeImg} ${m.home}</span>
            <span style="color:var(--text-muted);font-size:0.75rem;font-weight:400">vs</span>
            <span style="display:flex;align-items:center;gap:4px">${m.away} ${awayImg}</span>
          </div>
          <div style="font-size:0.68rem;color:var(--text-muted);margin-top:2px">
            ${this._formatDate(m.date)} ${m.time ? '· ' + m.time : ''}
            ${m.venue ? `<br>📍 ${m.venue}` : ''}
          </div>
        </div>
      </div>
    `}).join('');
  },

  /* ── Tabla de posiciones ── */
  async renderStandings() {
    const el = document.getElementById('standings-preview');
    if (!el) return;
    const table = await API.getStandings();

    el.innerHTML = `
      <table class="stats-table standings-mini">
        <thead>
          <tr>
            <th>#</th>
            <th>Equipo</th>
            <th>PJ</th>
            <th>DG</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          ${table.slice(0, 8).map((r, i) => {
            const dg = (r.gf || 0) - (r.gc || 0);
            const dgStr = dg > 0 ? `+${dg}` : `${dg}`;
            return `
              <tr class="${i < 2 ? 'tr-qualify' : i < 4 ? 'tr-maybe' : ''}">
                <td class="pos">${r.pos}</td>
                <td>${r.flag || ''} ${r.team}</td>
                <td style="color:var(--text-secondary)">${r.pj}</td>
                <td style="color:${dg >= 0 ? '#44ff88' : '#ff4466'}">${dgStr}</td>
                <td class="pts">${r.pts}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      <p style="font-size:0.6rem;color:var(--text-muted);margin-top:4px;text-align:right">
        🟢 Clasifican | 🟡 Posible clasificación
      </p>
    `;
  },

  /* ── Favoritos con foto y click para stats ── */
  async renderFavorites() {
    const el   = document.getElementById('favorites-preview');
    if (!el) return;
    const user = await Auth.currentUser();
    const favs = user?.favoritos || [];

    if (!favs.length) {
      el.innerHTML = '<p class="empty-state">Agrega favoritos en Estadísticas ⭐</p>';
      return;
    }

    // Render inicial con emojis
    el.innerHTML = `<div class="favs-grid">${favs.slice(0, 8).map(f => `
      <div class="fav-card" data-id="${f.id}" data-tipo="${f.tipo}" data-name="${f.name}" title="${f.name}">
        <div class="fav-card-photo" id="fav-photo-${f.id}">
          <span class="fav-card-emoji">${f.flag || (f.tipo==='team'?'🏳️':'👤')}</span>
        </div>
        <span class="fav-card-name">${f.name.split(' ')[0]}</span>
        <span class="fav-card-type">${f.tipo==='team'?'Equipo':'Jugador'}</span>
      </div>`).join('')}
    </div>`;

    // Click → mostrar modal de stats
    el.querySelectorAll('.fav-card').forEach(card => {
      card.addEventListener('click', () => this._showFavStats(
        card.dataset.id, card.dataset.tipo, card.dataset.name
      ));
    });

    // Cargar fotos async (solo jugadores por ahora)
    favs.slice(0, 8).forEach(async f => {
      if (f.tipo !== 'player') return;
      try {
        const url = await API.getPlayerPhotosCached(f.name);
        if (!url) return;
        const wrap = document.getElementById(`fav-photo-${f.id}`);
        if (!wrap) return;
        wrap.innerHTML = `<img src="${url}" alt="${f.name}"
          style="width:100%;height:100%;object-fit:cover;object-position:top center;border-radius:8px;"
          onerror="this.style.display='none'">`;
      } catch(_) {}
    });
  },

  async _showFavStats(id, tipo, name) {
    if (tipo === 'player') {
      const player = Stats.findPlayer ? Stats.findPlayer(name) : null;
      const photo  = await API.getPlayerPhotosCached(name).catch(()=>null);
      const photoHtml = photo
        ? `<div style="width:110px;height:130px;margin:0 auto 0.75rem;border-radius:8px;overflow:hidden;border:2px solid var(--border-bright)">
             <img src="${photo}" style="width:100%;height:100%;object-fit:cover;object-position:top center;" onerror="this.style.display='none'">
           </div>`
        : `<div style="font-size:3rem;margin-bottom:0.5rem">${'👤'}</div>`;
      const p = player || { name, pos:'—', team:'—', caps:0, goals:0, assists:0, rating:'—' };
      Modal.open(`
        <div class="modal-player-detail">
          ${photoHtml}
          <h2 class="modal-player-name">${p.name}</h2>
          <p class="modal-player-team">${p.flag||''} ${p.team}</p>
          <div style="display:flex;gap:0.5rem;justify-content:center;margin-bottom:1rem;flex-wrap:wrap">
            <span class="pos-badge">${p.pos}</span>
            ${p.rating ? `<span class="figurita-rating">⭐ ${p.rating}</span>` : ''}
          </div>
          <div class="modal-stats-row">
            <div class="modal-stat"><span>${p.goals}</span><label>Goles</label></div>
            <div class="modal-stat"><span>${p.assists}</span><label>Asist.</label></div>
            <div class="modal-stat"><span>${p.caps}</span><label>Partidos</label></div>
          </div>
        </div>`);
    } else {
      const teams = await API.getTeams('');
      const team  = teams.find(t => t.id === id || t.name === name);
      const t = team || { name, flag:'🏳️', pj:0, w:0, d:0, l:0, gf:0, gc:0, pts:0 };
      Modal.open(`
        <div class="modal-player-detail">
          <div style="font-size:3rem;margin-bottom:0.5rem">${t.flag||'🏳️'}</div>
          <h2 class="modal-player-name">${t.name}</h2>
          <div class="modal-stats-row" style="flex-wrap:wrap;gap:0.75rem">
            <div class="modal-stat"><span>${t.pj||0}</span><label>PJ</label></div>
            <div class="modal-stat"><span style="color:#44ff88">${t.w||0}</span><label>W</label></div>
            <div class="modal-stat"><span>${t.d||0}</span><label>D</label></div>
            <div class="modal-stat"><span style="color:#ff4466">${t.l||0}</span><label>L</label></div>
            <div class="modal-stat"><span>${t.gf||0}</span><label>GF</label></div>
            <div class="modal-stat"><span>${t.pts||0}</span><label>Pts</label></div>
          </div>
        </div>`);
    }
  },

  _formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const [, m, d] = dateStr.split('-');
      const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      return `${parseInt(d)} ${months[parseInt(m)-1]}`;
    } catch(_) { return dateStr; }
  }
};
