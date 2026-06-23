function parseEmojis(node) {
  if (window.twemoji) {
    try { twemoji.parse(node || document.body, { folder: 'svg', ext: '.svg' }); } catch(_) {}
  }
}
if (typeof window !== 'undefined') {
  window.parseEmojis = parseEmojis;
  document.addEventListener('DOMContentLoaded', () => {
    parseEmojis(document.body);
    const observer = new MutationObserver(() => parseEmojis(document.body));
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

const App = {
  _currentTab: 'dashboard',

  async init() {
    const splash = document.getElementById('loading-splash');

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
      window.location.replace('/worldcup-v15b-loading-fixed/login');
      return;
    }

    await this.loadUserData(user);
    this.navigateTo('dashboard');

    try {
      const finished = await API.getFinishedMatches();
      if (finished && finished.length) {
        await Predictions.evaluatePredictions(finished);
      }
    } catch(e) { console.error('Eval predicciones al iniciar falló:', e); }

    const daily = await Gacha.claimDaily();
    if (daily.ok) Toast.success('🎁 ¡Tirada diaria reclamada! +1 tirada');

    this._bindNavEvents();
    this._bindGlobalEvents();
    this._showInitialApiKeyInfo();
  },

  _showInitialApiKeyInfo() {
    const hasCustomKey = !!localStorage.getItem('wcc_af_api_key');
    if (!hasCustomKey) {
      const maxPerHour = typeof _AF_DEFAULT_MAX_PER_HOUR !== 'undefined' ? _AF_DEFAULT_MAX_PER_HOUR : 10;
      const bar = document.getElementById('api-status-bar');
      if (bar) {
        bar.style.display = 'flex';
        bar.className = 'api-status-bar api-status-mock';
        bar.innerHTML = `<span>🔒 Usando key compartida · Límite: ${maxPerHour} consultas/hora · <strong style="cursor:pointer;text-decoration:underline" onclick="App.navigateTo('profile')">Añade tu key gratis</strong> para actualizaciones ilimitadas</span>`;
        setTimeout(() => { bar.style.display = 'none'; }, 8000);
      }
    }
  },

  async loadUserData(user = null) {
    const u = user || await Auth.currentUser();
    if (!u) return;
    this.refreshHeader(u);
  },

  async refreshHeader(u = null) {
    const user = u || await Auth.currentUser();
    if (!user) return;
    document.getElementById('header-greeting').textContent = `Hola, ${user.name.split(' ')[0]}`;
    document.getElementById('hdr-tiradas').innerHTML = `🎴 <strong>${user.tiradas ?? 0}</strong>`;
    const gc = document.getElementById('gacha-count');
    if (gc) gc.textContent = user.tiradas ?? 0;
    const hdrMonedas = document.getElementById('hdr-monedas');
    if (hdrMonedas) hdrMonedas.innerHTML = `🪙 <strong>${user.monedas ?? 0}</strong>`;
  },

  navigateTo(tab) {
    const prevTab = this._currentTab;
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

    if (prevTab === 'live' && tab !== 'live') {
      const liveIframe = document.getElementById('live-iframe');
      if (liveIframe) {
        liveIframe.removeAttribute('src');
      }
    }

    return this._renderTab(tab);
  },

  async _renderTab(tab) {
    switch (tab) {
      case 'dashboard':   await Dashboard.render(); break;
      case 'stats':       await Stats.render(Stats._currentTab || 'teams'); break;
      case 'gacha': {
        
        const prevResult = document.getElementById('gacha-result');
        if (prevResult) { prevResult.innerHTML = ''; prevResult.style.display = 'none'; }
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
      case 'profile':     await Profile.render(); break;
      case 'live': {
        const liveIframe = document.getElementById('live-iframe');
        if (liveIframe && !liveIframe.getAttribute('src')) {
          const activeChannelBtn = document.querySelector('.live-channel-btn.active') || document.querySelector('.live-channel-btn');
          const src = activeChannelBtn?.dataset.src || liveIframe.dataset.src;
          if (src) liveIframe.setAttribute('src', src);
        }
        break;
      }
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
    
    document.getElementById('search-input')?.addEventListener('input', (e) => {
      clearTimeout(this._searchDebounce);
      const value = e.target.value.trim();
      this._searchDebounce = setTimeout(() => Stats.search(value), 180);
    });

    document.querySelectorAll('.filt').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Album.render(btn.dataset.filt);
      });
    });

    document.getElementById('btn-save-team')?.addEventListener('click', () => Album.saveTeam());

    document.querySelectorAll('.live-channel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) return;
        document.querySelectorAll('.live-channel-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const liveIframe = document.getElementById('live-iframe');
        if (liveIframe && btn.dataset.src) {
          liveIframe.setAttribute('src', btn.dataset.src);
        }
      });
    });
  },

  _bindGlobalEvents() {
    document.getElementById('btn-logout')?.addEventListener('click', async () => {
      const confirmed = await this._confirmLogout();
      if (!confirmed) return;
      await Auth.logout();
      API.clearPhotoCache();            
      await DB.clear('stats_cache');   
      window.location.replace('/worldcup-v15b-loading-fixed/login');
    });

    document.getElementById('btn-gacha-1')?.addEventListener('click',  () => this.doPull(1));
    document.getElementById('btn-gacha-10')?.addEventListener('click', () => this.doPull(10));

    document.getElementById('btn-update-stats')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-update-stats');
      const svgIcon = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>`;
      btn.disabled = true;
      btn.innerHTML = '⏳ Actualizando...';

      try {
        Toast.show('🔄 Consultando APIs...');
        const refreshResult = await API.forceRefresh();
        this._showApiStatus(refreshResult.source);

        const finished = refreshResult.finished?.length
          ? refreshResult.finished
          : await API.getFinishedMatches();

        const allForEval = [
          ...(finished || []),
          ...(refreshResult.upcoming || []).filter(m => m.status === 'finished' && m.scoreHome !== null)
        ];

        if (allForEval.length > 0) await Predictions.evaluatePredictions(allForEval);

        await Dashboard.render();
        await this.loadUserData();

        Toast.success('Estadísticas actualizadas ✅');
      } catch(err) {
        this._showApiStatus('network_error');
        Toast.error('Error al actualizar: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = `${svgIcon} Actualizar`;
      }
    });

    document.getElementById('btn-export')?.addEventListener('click', () => Profile.exportData());
    document.getElementById('btn-import')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) Profile.importData(file);
      e.target.value = '';
    });
  },

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

    bar.style.display = 'flex';

    if (source === 'mock') {
      bar.className = 'api-status-bar api-status-mock';
      bar.innerHTML = `<span>⚠️ Datos de muestra (Mock) — El Mundial 2026 aún no ha comenzado</span>`;
    } else if (source === 'hourly_limit') {
      bar.className = 'api-status-bar api-status-mock';
      const maxPerHour = typeof _AF_DEFAULT_MAX_PER_HOUR !== 'undefined' ? _AF_DEFAULT_MAX_PER_HOUR : 10;
      bar.innerHTML = `<span>🕐 Límite horario (${maxPerHour} req/hora con key por defecto). Añade tu propia key en <strong>Perfil → API Key</strong> para sin límite.</span>`;
    } else if (source === 'rate_limit') {
      bar.className = 'api-status-bar api-status-mock';
      bar.innerHTML = `<span>⚠️ Límite diario de la API alcanzado. Se resetea a medianoche. Añade tu propia key en <strong>Perfil → API Key</strong>.</span>`;
    } else if (source === 'auth_error') {
      bar.className = 'api-status-bar api-status-mock';
      bar.innerHTML = `<span>❌ Key de API inválida — Verifica en <strong>Perfil → API Key → Verificar</strong>.</span>`;
    } else if (source === 'network_error') {
      bar.className = 'api-status-bar api-status-mock';
      bar.innerHTML = `<span>❌ No se pudo conectar con la API. Comprueba tu conexión o vuelve a intentar.</span>`;
    } else if (source && source !== 'undefined') {
      bar.className = 'api-status-bar api-status-live';
      bar.innerHTML = `<span>✅ Datos en vivo desde <strong>${source}</strong></span>`;
      setTimeout(() => { bar.style.display = 'none'; }, 5000);
    } else {
      bar.style.display = 'none';
    }
  },

  
  async doPull(n) {
    const sobreWrapper = document.getElementById('sobre-wrapper');
    const sobreClosed  = document.getElementById('sobre-closed');
    const result       = document.getElementById('gacha-result');
    const btnX1        = document.getElementById('btn-gacha-1');
    const btnX10       = document.getElementById('btn-gacha-10');

    if (btnX1)  btnX1.disabled  = true;
    if (btnX10) btnX10.disabled = true;

    result.style.display = 'none';
    if (sobreClosed) {
      sobreClosed.classList.add('sobre-opening');
      await new Promise(r => setTimeout(r, 900));
    }

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

    await App.refreshHeader(pull.user);

    await Promise.all(pull.results.map(f => Gacha.getPlayerPhoto(f)));

    result.innerHTML = `
      <div class="gacha-cards-grid ${pull.results.length === 1 ? 'single-card' : ''}" id="gacha-grid">
        ${pull.results.map((f, idx) => this._renderFiguritaCard(f, null, idx)).join('')}
      </div>`;

    document.querySelectorAll('#gacha-grid .figurita-card').forEach((card, i) => {
      setTimeout(() => card.classList.add('card-flip-in'), i * 100);
    });

    
    
    
    const seenPhotoIds = new Set();
    pull.results.forEach(f => {
      if (seenPhotoIds.has(f.id)) return; 
      seenPhotoIds.add(f.id);
      Gacha.getPlayerPhoto(f).then(url => {
        if (!url) return;
        
        const wraps = document.querySelectorAll(`#gacha-grid .fig-photo-wrap[data-id="${f.id}"]`);
        wraps.forEach(wrap => {
          
          const existingImg = wrap.querySelector('img.fig-photo');
          if (existingImg) existingImg.remove();
          const isCutout = url.includes('cutout') || url.includes('Cutout');
          const img = document.createElement('img');
          img.className = "fig-photo";
          img.referrerPolicy = "no-referrer";
          img.alt = f.name;
          img.style.cssText = `object-fit:${isCutout?'contain':'cover'};object-position:${isCutout?'center':'top center'};opacity:0;transition:opacity .3s;position:relative;z-index:1;`;
          img.onload = () => {
            img.style.opacity = '1';
            const em = wrap.querySelector('.fig-emoji-fallback');
            if (em) em.style.display = 'none';
          };
          img.onerror = () => { img.remove(); };
          img.src = url;
          wrap.insertBefore(img, wrap.firstChild);
          if (!wrap.querySelector('.fig-photo-gradient')) {
            const g = document.createElement('div');
            g.className = 'fig-photo-gradient';
            wrap.appendChild(g);
          }
        });
      }).catch(()=>{});
    });

    const pc = pull.user.pityCount || 0;
    const pd = document.getElementById('pity-display');
    const pb = document.getElementById('pity-bar');
    if (pd) pd.textContent = `${pc}/50`;
    if (pb) pb.style.width = `${Math.min(100, (pc / 50) * 100)}%`;

    const goat = pull.results.find(f => f.rareza === 'goat');
    const leg  = pull.results.find(f => f.rareza === 'legendary');
    const epic = pull.results.find(f => f.rareza === 'epic');

    
    if (goat || leg) {
      const rarityClass = goat ? 'reveal-goat' : 'reveal-legendary';
      const rarityLabel = goat ? '🐐 ¡¡G.O.A.T!!' : '✨ ¡LEGENDARIA!';
      const rarityColor = goat ? '#ff2244' : '#ffd700';
      const rarityName  = goat ? goat.name : leg.name;

      
      const overlay = document.createElement('div');
      overlay.id = 'rarity-reveal-overlay';
      overlay.innerHTML = `
        <div class="rarity-reveal-bg ${rarityClass}">
          <div class="rarity-rays"></div>
          <div class="rarity-particles" id="rarity-particles"></div>
          <div class="rarity-label-wrap">
            <div class="rarity-label-text" style="color:${rarityColor}">${rarityLabel}</div>
            <div class="rarity-label-name">${rarityName}</div>
          </div>
        </div>`;
      document.body.appendChild(overlay);

      
      const particlesEl = overlay.querySelector('#rarity-particles');
      const colors = goat ? ['#ff2244','#ff6622','#ffcc00','#ffffff'] : ['#ffd700','#fff4a0','#fffbe6','#ffffff'];
      for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'rarity-particle';
        p.style.cssText = `
          left:${Math.random()*100}%;
          animation-delay:${Math.random()*0.8}s;
          animation-duration:${0.8 + Math.random()*0.8}s;
          background:${colors[Math.floor(Math.random()*colors.length)]};
          width:${4 + Math.random()*8}px;
          height:${4 + Math.random()*8}px;
        `;
        particlesEl.appendChild(p);
      }

      
      setTimeout(() => {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.4s ease';
        setTimeout(() => overlay.remove(), 500);
      }, 2200);
    }

    if (goat)      Toast.success(`🐐 ¡¡GOAT!! ¡¡Obtuviste a ${goat.name}!! 🔴`, 7000);
    else if (leg)  Toast.success(`✨ ¡LEGENDARIA! ¡Obtuviste a ${leg.name}!`, 5000);
    else if (epic) Toast.success(`⚡ ¡Épica! ${epic.name}`, 3000);
    else           Toast.show(`+${pull.results.length} figurita${pull.results.length > 1 ? 's' : ''}`);
  },

  _renderFiguritaCard(f, photoUrl, idx) {
    const delay = idx * 0.08;
    const stats = Album.getPlayerStats ? (Album.getPlayerStats(f.id) || {}) : {};
    const isPOR = f.pos === 'POR';

    const cachedUrl = API.getPhotoSync(f) || photoUrl || null;
    const isCutout  = cachedUrl && (cachedUrl.includes('cutout') || cachedUrl.includes('Cutout'));

    const photoSection = `<div class="fig-photo-wrap" data-id="${f.id}" style="position:relative">
      <span class="fig-emoji-fallback" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:0">${f.emoji}</span>
      ${cachedUrl
        ? `<img class="fig-photo" src="${cachedUrl}" alt="${f.name}"
                style="object-fit:${isCutout?'contain':'cover'};object-position:${isCutout?'center':'top center'};opacity:0;transition:opacity .3s;position:relative;z-index:1;"
                referrerpolicy="no-referrer"
                onload="this.style.opacity='1';var em=this.parentNode.querySelector('.fig-emoji-fallback');if(em)em.style.display='none';"
                onerror="this.remove();">`
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