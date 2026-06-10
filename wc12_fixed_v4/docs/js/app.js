/**
 * app.js — Controlador principal  v5
 * Mejoras: logout con diseño, gacha con fotos, status de API real
 */

const App = {
  _currentTab: 'dashboard',

  async init() {
    // Mostrar loading splash si existe
    const splash = document.getElementById('loading-splash');

    // Limpiar caché de upcoming si el día cambió (fix timezone UTC vs local)
    try {
      const now = new Date();
      const todayLocal = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      const lastDay = localStorage.getItem('wcc_upcoming_day');
      if (lastDay !== todayLocal) {
        localStorage.removeItem('wcc_cache_upcoming');
        localStorage.setItem('wcc_upcoming_day', todayLocal);
      }
    } catch(_) {}

    try {
      await DB.open();
    } catch(dbErr) {
      console.error('DB.open() falló:', dbErr);
      // Intentar borrar la BD corrupta y recargar
      try {
        indexedDB.deleteDatabase('WCCollectorUES');
        console.warn('BD eliminada, recargando...');
      } catch(_) {}
      if (splash) splash.innerHTML = '<p style="color:#f87171;text-align:center;padding:2rem">Error de base de datos.<br>Recargando…</p>';
      setTimeout(() => window.location.reload(), 2000);
      return;
    }

    let user = null;
    try {
      user = await Auth.recoverSession();
    } catch(e) {
      console.error('recoverSession falló:', e);
    }

    if (splash) {
      splash.style.opacity = '0';
      splash.style.transition = 'opacity 0.3s';
      setTimeout(() => { if (splash.parentNode) splash.parentNode.removeChild(splash); }, 350);
    }

    if (!user) {
      window.location.replace('login.html');
      return;
    }

    await this.loadUserData(user);
    await this.navigateTo('dashboard');

    const daily = await Gacha.claimDaily();
    if (daily.ok) Toast.success('🎁 ¡Tirada diaria reclamada! +1 tirada');

    this._bindNavEvents();
    this._bindGlobalEvents();
  },

  async loadUserData(user = null) {
    const u = user || await Auth.currentUser();
    if (!u) return;
    this.refreshHeader(u);
  },

  /* ── Actualizar header sin recargar la página ── */
  async refreshHeader(u = null) {
    const user = u || await Auth.currentUser();
    if (!user) return;
    document.getElementById('header-greeting').textContent = `Hola, ${user.name.split(' ')[0]}`;
    document.getElementById('hdr-tiradas').innerHTML = `🎴 <strong>${user.tiradas ?? 0}</strong>`;
    const gc = document.getElementById('gacha-count');
    if (gc) gc.textContent = user.tiradas ?? 0;
    const hdrMonedas = document.getElementById('hdr-monedas');
    if (hdrMonedas) hdrMonedas.innerHTML = `💰 <strong>${user.monedas ?? 0}</strong>`;
  },

  navigateTo(tab) {
    this._currentTab = tab;
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.drawer-nav-btn').forEach(b => b.classList.remove('active'));

    const section    = document.getElementById(`tab-${tab}`);
    const navBtn     = document.querySelector(`.nav-btn[data-tab="${tab}"]`);
    const drawerBtn  = document.querySelector(`.drawer-nav-btn[data-tab="${tab}"]`);
    if (section)   section.classList.add('active');
    if (navBtn)    navBtn.classList.add('active');
    if (drawerBtn) drawerBtn.classList.add('active');

    return this._renderTab(tab);
  },

  async _renderTab(tab) {
    switch (tab) {
      case 'dashboard':   await Dashboard.render(); break;
      case 'stats':       await Stats.render(Stats._currentTab || 'teams'); break;
      case 'gacha': {
        const u = await Auth.currentUser();
        if (u) {
          const gc = document.getElementById('gacha-count');
          if (gc) gc.textContent = u.tiradas ?? 0;
          const pc = u.pityCount || 0;
          const pd = document.getElementById('pity-display');
          const pb = document.getElementById('pity-bar');
          if (pd) pd.textContent = `${pc}/50`;
          if (pb) pb.style.width = `${Math.min(100, (pc/50)*100)}%`;
          if (u.tiradas > 0) document.getElementById('gacha-sphere')?.classList.add('has-tiradas');
        }
        break;
      }
      case 'album':
        await Album.render();
        await Album.renderIdealTeam();
        break;
      case 'predictions': await Predictions.render(); break;
      case 'battle':      await Battle.render(); break;
      case 'exchange':    await Exchange.render(); break;
      case 'profile':     await Profile.render(); ApiConfig.init(); break;
    }
  },

  _bindNavEvents() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.navigateTo(btn.dataset.tab));
    });

    document.querySelectorAll('.stab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.stab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Limpiar búsqueda al cambiar de tab
        const input = document.getElementById('search-input');
        if (input) input.value = '';
        Stats._lastQuery = '';
        Stats.render(btn.dataset.stab);
      });
    });

    document.getElementById('btn-search')?.addEventListener('click', () => {
      Stats.search(document.getElementById('search-input').value.trim());
    });
    document.getElementById('search-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('btn-search').click();
    });

    document.querySelectorAll('.filt').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Album.render(btn.dataset.filt);
      });
    });

    document.getElementById('btn-save-team')?.addEventListener('click', () => Album.saveTeam());
  },

  _bindGlobalEvents() {
    /* ── LOGOUT con modal de confirmación ── */
    document.getElementById('btn-logout')?.addEventListener('click', async () => {
      const confirmed = await this._confirmLogout();
      if (!confirmed) return;
      await Auth.logout();
      API.clearPhotoCache();            // BUG FIX: limpiar caché de fotos y equipos
      await DB.clear('stats_cache');    // BUG FIX: limpiar caché de stats al cerrar sesión
      window.location.replace('login.html');
    });

    /* ── Gacha ── */
    document.getElementById('btn-gacha-1')?.addEventListener('click',  () => this.doPull(1));
    document.getElementById('btn-gacha-10')?.addEventListener('click', () => this.doPull(10));

    /* ── Actualizar stats ── */
    document.getElementById('btn-update-stats')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-update-stats');
      btn.disabled = true;
      btn.textContent = '⏳ Actualizando...';

      try {
        Toast.show('🔄 Consultando APIs...');
        const refreshResult = await API.forceRefresh();
        this._showApiStatus(refreshResult.source);

        const finished = await API.getFinishedMatches();
        if (finished?.length > 0) await Predictions.evaluatePredictions(finished);

        await Dashboard.render();
        await this.loadUserData();
        Toast.success('Estadísticas actualizadas ✅');
      } catch(err) {
        Toast.error('Error al actualizar: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = '🔄 Actualizar stats';
      }
    });

    /* ── Exportar / Importar ── */
    document.getElementById('btn-export')?.addEventListener('click', () => Profile.exportData());
    document.getElementById('btn-import')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) Profile.importData(file);
      e.target.value = '';
    });
  },

  /* Modal de confirmación para logout */
  _confirmLogout() {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'logout-overlay';
      overlay.innerHTML = `
        <div class="logout-modal">
          <div class="logout-icon">⏏️</div>
          <h3>¿Cerrar sesión?</h3>
          <p>Tu progreso está guardado localmente.</p>
          <div class="logout-btns">
            <button class="btn btn-secondary" id="lm-cancel">Cancelar</button>
            <button class="btn btn-logout-confirm" id="lm-confirm">Sí, salir</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add('visible'));

      const close = (val) => {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 250);
        resolve(val);
      };

      document.getElementById('lm-cancel').addEventListener('click',  () => close(false));
      document.getElementById('lm-confirm').addEventListener('click', () => close(true));
      overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
    });
  },

  _showApiStatus(source) {
    const bar = document.getElementById('api-status-bar');
    if (!bar) return;
    if (source === 'mock') {
      bar.style.display = 'flex';
      bar.className = 'api-status-bar api-status-mock';
      bar.innerHTML = `
        <span>⚠️ Datos de muestra (Mock) — El Mundial 2026 aún no ha comenzado</span>
      `;
    } else {
      bar.style.display = 'flex';
      bar.className = 'api-status-bar api-status-live';
      bar.innerHTML = `<span>✅ Datos en vivo desde <strong>${source}</strong></span>`;
      setTimeout(() => { bar.style.display = 'none'; }, 4000);
    }
  },

  /* ══════════════════════════════════════════
     GACHA PULL — Animación sobre Panini
  ══════════════════════════════════════════ */
  async doPull(n) {
    const sobreWrapper = document.getElementById('sobre-wrapper');
    const sobreClosed  = document.getElementById('sobre-closed');
    const result       = document.getElementById('gacha-result');
    const btnX1        = document.getElementById('btn-gacha-1');
    const btnX10       = document.getElementById('btn-gacha-10');

    if (btnX1)  btnX1.disabled  = true;
    if (btnX10) btnX10.disabled = true;

    /* 1. Animación de abrir sobre */
    result.style.display = 'none';
    if (sobreClosed) {
      sobreClosed.classList.add('sobre-opening');
      await new Promise(r => setTimeout(r, 900));
    }

    /* 2. Mostrar loading */
    result.style.display = 'block';
    result.innerHTML = `
      <div class="sobre-loading">
        <div class="sobre-loading-cards">
          ${Array(n > 3 ? 5 : n).fill(0).map((_, i) => `
            <div class="sobre-loading-card" style="animation-delay:${i*0.12}s">
              <div class="sobre-loading-card-inner"></div>
            </div>`).join('')}
        </div>
        <p class="sobre-loading-text">Revelando figuritas…</p>
      </div>`;

    /* 3. Tirada real */
    const pull = await Gacha.pull(n);

    if (sobreClosed) sobreClosed.classList.remove('sobre-opening');
    if (btnX1)  btnX1.disabled  = false;
    if (btnX10) btnX10.disabled = false;

    if (pull.error) {
      result.innerHTML = '';
      result.style.display = 'none';
      Toast.error(pull.error);
      return;
    }

    /* 4. Actualizar contadores del header */
    await App.refreshHeader(pull.user);

    /* 5. Pre-poblar cache de fotos (async) y luego renderizar cartas */
    await Promise.all(pull.results.map(f => Gacha.getPlayerPhoto(f)));

    /* 5b. Renderizar cartas (ya con fotos en cache) */
    result.innerHTML = `
      <div class="gacha-cards-grid ${pull.results.length === 1 ? 'single-card' : ''}" id="gacha-grid">
        ${pull.results.map((f, idx) => this._renderFiguritaCard(f, null, idx)).join('')}
      </div>`;

    /* 6. Flip animation stagger */
    document.querySelectorAll('#gacha-grid .figurita-card').forEach((card, i) => {
      setTimeout(() => card.classList.add('card-flip-in'), i * 100);
    });

    /* 7. Inyectar fotos en TODAS las cartas (incluidas duplicadas) después del render */
    pull.results.forEach(f => {
      Gacha.getPlayerPhoto(f).then(url => {
        if (!url) return;
        const wrap = document.querySelector(`#gacha-grid .fig-photo-wrap[data-id="${f.id}"]`);
        if (!wrap) return;
        if (wrap.querySelector('img.fig-photo')) return; // ya cargada
        const isCutout = url.includes('cutout') || url.includes('Cutout');
        const img = document.createElement('img');
        img.className = "fig-photo"; img.referrerPolicy = "no-referrer";
        img.alt = f.name;
        img.src = url;
        img.style.cssText = `object-fit:${isCutout?'contain':'cover'};object-position:${isCutout?'center':'top center'};`;
        img.onerror = () => { img.remove(); const em = wrap.querySelector('.fig-emoji-fallback'); if(em) em.style.display=''; };
        const em = wrap.querySelector('.fig-emoji-fallback');
        if (em) em.style.display = 'none';
        wrap.insertBefore(img, wrap.firstChild);
        if (!wrap.querySelector('.fig-photo-gradient')) {
          const g = document.createElement('div');
          g.className = 'fig-photo-gradient';
          wrap.appendChild(g);
        }
      }).catch(()=>{});
    });

    /* 8. Pity bar */
    const pc = pull.user.pityCount || 0;
    const pd = document.getElementById('pity-display');
    const pb = document.getElementById('pity-bar');
    if (pd) pd.textContent = `${pc}/50`;
    if (pb) pb.style.width = `${Math.min(100, (pc / 50) * 100)}%`;

    /* 9. Notificación */
    const goat = pull.results.find(f => f.rareza === 'goat');
    const leg  = pull.results.find(f => f.rareza === 'legendary');
    const epic = pull.results.find(f => f.rareza === 'epic');
    if (goat)      Toast.success(`🐐 ¡¡GOAT!! ¡¡Obtuviste a ${goat.name}!! 🔴`, 7000);
    else if (leg)  Toast.success(`✨ ¡LEGENDARIA! ¡Obtuviste a ${leg.name}!`, 5000);
    else if (epic) Toast.success(`⚡ ¡Épica! ${epic.name}`, 3000);
    else           Toast.show(`+${pull.results.length} figurita${pull.results.length > 1 ? 's' : ''}`);
  },

  _renderFiguritaCard(f, photoUrl, idx) {
    const delay = idx * 0.08;
    const stats = Album.getPlayerStats ? (Album.getPlayerStats(f.id) || {}) : {};
    const isPOR = f.pos === 'POR';

    /* Usar foto disponible de forma síncrona (mapa hardcodeado → memoria → localStorage) */
    const cachedUrl = API.getPhotoSync(f) || photoUrl || null;
    const isCutout  = cachedUrl && (cachedUrl.includes('cutout') || cachedUrl.includes('Cutout'));
    const photoSection = `<div class="fig-photo-wrap" data-id="${f.id}">
      <span class="fig-emoji-fallback"${cachedUrl ? ' style="display:none"' : ''}>${f.emoji}</span>
      ${cachedUrl
        ? `<img class="fig-photo" src="${cachedUrl}" alt="${f.name}"
                style="object-fit:${isCutout?'contain':'cover'};object-position:${isCutout?'center':'top center'};"
                referrerpolicy="no-referrer"
                onerror="this.remove();this.parentNode.querySelector('.fig-emoji-fallback').style.display=''">`
        : ''}
    </div>`;

    const statsHtml = isPOR
      ? `<div class="fig-stats-row">
           <span class="fig-stat"><span class="fig-stat-val">${stats.saves ?? '—'}</span><span class="fig-stat-lbl">Par.</span></span>
           <span class="fig-stat"><span class="fig-stat-val">${stats.apps ?? '—'}</span><span class="fig-stat-lbl">PJ</span></span>
           <span class="fig-stat"><span class="fig-stat-val">${f.rating}</span><span class="fig-stat-lbl">OVR</span></span>
         </div>`
      : `<div class="fig-stats-row">
           <span class="fig-stat"><span class="fig-stat-val">${stats.goals ?? '—'}</span><span class="fig-stat-lbl">Gls</span></span>
           <span class="fig-stat"><span class="fig-stat-val">${stats.assists ?? '—'}</span><span class="fig-stat-lbl">Ast</span></span>
           <span class="fig-stat"><span class="fig-stat-val">${f.rating}</span><span class="fig-stat-lbl">OVR</span></span>
         </div>`;

    return `
      <div class="figurita-card ${f.rareza}" style="animation-delay:${delay}s">
        <div class="fig-rarity-glow"></div>
        <span class="rarity-badge badge-${f.rareza}">${Gacha.getRarityLabel(f.rareza)}</span>
        ${photoSection}
        <div class="fig-info">
          <div class="figurita-name">${f.name}</div>
          <div class="figurita-team">${f.flag || ''} ${f.team}</div>
          <div class="fig-footer">
            <span class="figurita-pos">${f.pos}</span>
          </div>
          ${statsHtml}
        </div>
        ${f.isDuplicate
          ? `<div class="figurita-dupe">DUPLICADO ×${f.duplicados + 1}</div>`
          : '<div class="figurita-new">¡NUEVA!</div>'
        }
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
