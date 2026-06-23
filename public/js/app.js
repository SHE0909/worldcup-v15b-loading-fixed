function parsearEmojis(node) {
  if (window.twemoji) {
    try { twemoji.parse(node || document.body, { folder: 'svg', ext: '.svg' }); } catch(_) {}
  }
}
if (typeof window !== 'undefined') {
  window.parsearEmojis = parsearEmojis;
  document.addEventListener('DOMContentLoaded', () => {
    parsearEmojis(document.body);
    const observador = new MutationObserver(() => parsearEmojis(document.body));
    observador.observe(document.body, { childList: true, subtree: true });
  });
}

const App = {
  _currentTab: 'dashboard',

  async init() {
    const pantallaCarga = document.getElementById('loading-splash');

    try {
      const now = new Date();
      const hoyLocal = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      const ultimoDia = localStorage.getItem('wcc_upcoming_day');
      if (ultimoDia !== hoyLocal) {
        localStorage.removeItem('wcc_cache_upcoming');
        localStorage.setItem('wcc_upcoming_day', hoyLocal);
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
      if (pantallaCarga) pantallaCarga.innerHTML = '<p style="color:#f87171;text-align:center;padding:2rem">Error de base de datos.<br>Recargando…</p>';
      setTimeout(() => window.location.reload(), 2000);
      return;
    }

    let usuarioActual = null;
    try {
      usuarioActual = await Auth.recoverSession();
    } catch(e) {
      console.error('recoverSession falló:', e);
    }

    if (pantallaCarga) {
      pantallaCarga.style.opacity = '0';
      pantallaCarga.style.transition = 'opacity 0.3s';
      setTimeout(() => { if (pantallaCarga.parentNode) pantallaCarga.parentNode.removeChild(pantallaCarga); }, 350);
    }

    if (!usuarioActual) {
      window.location.replace('/worldcup-v15b-loading-fixed/login');
      return;
    }

    await this.loadUserData(usuarioActual);
    this.navigateTo('dashboard');

    try {
      const finalizados = await API.getFinishedMatches();
      if (finalizados && finalizados.length) {
        await Predictions.evaluatePredictions(finalizados);
      }
    } catch(e) { console.error('Eval predicciones al iniciar falló:', e); }

    const diario = await Gacha.claimDaily();
    if (diario.ok) Toast.success('🎁 ¡Tirada diaria reclamada! +1 tirada');

    this._bindNavEvents();
    this._bindGlobalEvents();
    this._showInitialApiKeyInfo();
  },

  _showInitialApiKeyInfo() {
    const tieneKeyPersonal = !!localStorage.getItem('wcc_af_api_key');
    if (!tieneKeyPersonal) {
      const maxPorHora = typeof _AF_DEFAULT_MAX_PER_HOUR !== 'undefined' ? _AF_DEFAULT_MAX_PER_HOUR : 10;
      const bar = document.getElementById('api-status-bar');
      if (bar) {
        bar.style.display = 'flex';
        bar.className = 'api-status-bar api-status-mock';
        bar.innerHTML = `<span>🔒 Usando key compartida · Límite: ${maxPorHora} consultas/hora · <strong style="cursor:pointer;text-decoration:underline" onclick="App.navigateTo('perfil')">Añade tu key gratis</strong> para actualizaciones ilimitadas</span>`;
        setTimeout(() => { bar.style.display = 'none'; }, 8000);
      }
    }
  },

  async loadUserData(usuarioActual = null) {
    const u = usuarioActual || await Auth.currentUser();
    if (!u) return;
    this.refreshHeader(u);
  },

  async refreshHeader(u = null) {
    const usuarioActual = u || await Auth.currentUser();
    if (!usuarioActual) return;
    document.getElementById('header-greeting').textContent = `Hola, ${usuarioActual.name.split(' ')[0]}`;
    document.getElementById('hdr-tiradas').innerHTML = `🎴 <strong>${usuarioActual.tiradas ?? 0}</strong>`;
    const gc = document.getElementById('gacha-count');
    if (gc) gc.textContent = usuarioActual.tiradas ?? 0;
    const hdrMonedas = document.getElementById('hdr-monedas');
    if (hdrMonedas) hdrMonedas.innerHTML = `🪙 <strong>${usuarioActual.monedas ?? 0}</strong>`;
  },

  navigateTo(tab) {
    const tabAnterior = this._currentTab;
    this._currentTab = tab;
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.drawer-nav-btn').forEach(b => b.classList.remove('active'));

    const section    = document.getElementById(`tab-${tab}`);
    const btnNav     = document.querySelector(`.nav-btn[data-tab="${tab}"]`);
    const btnDrawer  = document.querySelector(`.drawer-nav-btn[data-tab="${tab}"]`);
    if (section)   section.classList.add('active');
    if (btnNav)    btnNav.classList.add('active');
    if (btnDrawer) btnDrawer.classList.add('active');

    if (tabAnterior === 'enVivo' && tab !== 'enVivo') {
      const iframeDirecto = document.getElementById('enVivo-iframe');
      if (iframeDirecto) {
        iframeDirecto.removeAttribute('src');
      }
    }

    return this._renderTab(tab);
  },

  async _renderTab(tab) {
    switch (tab) {
      case 'dashboard':   await Dashboard.renderizar(); break;
      case 'estadisticasJug':       await Stats.renderizar(Stats._currentTab || 'listaEquipos'); break;
      case 'gacha': {
        
        const resultadoPrevio = document.getElementById('gacha-result');
        if (resultadoPrevio) { resultadoPrevio.innerHTML = ''; resultadoPrevio.style.display = 'none'; }
        const u = await Auth.currentUser();
        if (u) {
          const gc = document.getElementById('gacha-count');
          if (gc) gc.textContent = u.tiradas ?? 0;
          const pc = u.contadorPity || 0;
          const pd = document.getElementById('pity-display');
          const pb = document.getElementById('pity-bar');
          if (pd) pd.textContent = `${pc}/50`;
          if (pb) pb.style.width = `${Math.min(100, (pc/50)*100)}%`;
          if (u.tiradas > 0) document.getElementById('gacha-sphere')?.classList.add('has-tiradas');
        }
        break;
      }
      case 'album':
        await Album.renderizar();
        await Album.renderIdealTeam();
        break;
      case 'predicciones': await Predictions.renderizar(); break;
      case 'battle':      await Battle.renderizar(); break;
      case 'exchange':    await Exchange.renderizar(); break;
      case 'perfil':     await Profile.renderizar(); break;
      case 'enVivo': {
        const iframeDirecto = document.getElementById('enVivo-iframe');
        if (iframeDirecto && !iframeDirecto.getAttribute('src')) {
          const btnCanalActivo = document.querySelector('.enVivo-channel-btn.active') || document.querySelector('.enVivo-channel-btn');
          const src = btnCanalActivo?.dataset.src || iframeDirecto.dataset.src;
          if (src) iframeDirecto.setAttribute('src', src);
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
        const entradaForm = document.getElementById('search-entradaForm');
        if (entradaForm) entradaForm.valorCampo = '';
        Stats._lastQuery = '';
        Stats.renderizar(btn.dataset.stab);
      });
    });

    document.getElementById('btn-search')?.addEventListener('click', () => {
      Stats.search(document.getElementById('search-entradaForm').valorCampo.trim());
    });
    document.getElementById('search-entradaForm')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('btn-search').click();
    });
    
    document.getElementById('search-entradaForm')?.addEventListener('entradaForm', (e) => {
      clearTimeout(this._searchDebounce);
      const valorCampo = e.target.valorCampo.trim();
      this._searchDebounce = setTimeout(() => Stats.search(valorCampo), 180);
    });

    document.querySelectorAll('.filt').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Album.renderizar(btn.dataset.filt);
      });
    });

    document.getElementById('btn-save-equipo')?.addEventListener('click', () => Album.saveTeam());

    document.querySelectorAll('.enVivo-channel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) return;
        document.querySelectorAll('.enVivo-channel-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const iframeDirecto = document.getElementById('enVivo-iframe');
        if (iframeDirecto && btn.dataset.src) {
          iframeDirecto.setAttribute('src', btn.dataset.src);
        }
      });
    });
  },

  _bindGlobalEvents() {
    document.getElementById('btn-logout')?.addEventListener('click', async () => {
      const confirmado = await this._confirmLogout();
      if (!confirmado) return;
      await Auth.logout();
      API.clearPhotoCache();            
      await DB.clear('stats_cache');   
      window.location.replace('/worldcup-v15b-loading-fixed/login');
    });

    document.getElementById('btn-gacha-1')?.addEventListener('click',  () => this.doPull(1));
    document.getElementById('btn-gacha-10')?.addEventListener('click', () => this.doPull(10));

    document.getElementById('btn-update-estadisticasJug')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-update-estadisticasJug');
      const iconoSvg = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>`;
      btn.disabled = true;
      btn.innerHTML = '⏳ Actualizando...';

      try {
        Toast.show('🔄 Consultando APIs...');
        const resultadoActualizacion = await API.forceRefresh();
        this._showApiStatus(resultadoActualizacion.fuenteDatos);

        const finalizados = resultadoActualizacion.finalizados?.length
          ? resultadoActualizacion.finalizados
          : await API.getFinishedMatches();

        const todosParaEvaluar = [
          ...(finalizados || []),
          ...(resultadoActualizacion.proximos || []).filter(m => m.status === 'finalizados' && m.golesLocal !== null)
        ];

        if (todosParaEvaluar.length > 0) await Predictions.evaluatePredictions(todosParaEvaluar);

        await Dashboard.renderizar();
        await this.loadUserData();

        Toast.success('Estadísticas actualizadas ✅');
      } catch(err) {
        this._showApiStatus('network_error');
        Toast.error('Error al actualizar: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = `${iconoSvg} Actualizar`;
      }
    });

    document.getElementById('btn-export')?.addEventListener('click', () => Profile.exportData());
    document.getElementById('btn-import')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) Profile.importData(file);
      e.target.valorCampo = '';
    });
  },

  _confirmLogout() {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'logout-overlay';
      overlay.innerHTML = `
        <div class="logout-modal2">
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

  _showApiStatus(fuenteDatos) {
    const bar = document.getElementById('api-status-bar');
    if (!bar) return;

    bar.style.display = 'flex';

    if (fuenteDatos === 'mock') {
      bar.className = 'api-status-bar api-status-mock';
      bar.innerHTML = `<span>⚠️ Datos de muestra (Mock) — El Mundial 2026 aún no ha comenzado</span>`;
    } else if (fuenteDatos === 'hourly_limit') {
      bar.className = 'api-status-bar api-status-mock';
      const maxPorHora = typeof _AF_DEFAULT_MAX_PER_HOUR !== 'undefined' ? _AF_DEFAULT_MAX_PER_HOUR : 10;
      bar.innerHTML = `<span>🕐 Límite horario (${maxPorHora} solicitud/hora con key por defecto). Añade tu propia key en <strong>Perfil → API Key</strong> para sin límite.</span>`;
    } else if (fuenteDatos === 'rate_limit') {
      bar.className = 'api-status-bar api-status-mock';
      bar.innerHTML = `<span>⚠️ Límite diario de la API alcanzado. Se resetea a medianoche. Añade tu propia key en <strong>Perfil → API Key</strong>.</span>`;
    } else if (fuenteDatos === 'auth_error') {
      bar.className = 'api-status-bar api-status-mock';
      bar.innerHTML = `<span>❌ Key de API inválida — Verifica en <strong>Perfil → API Key → Verificar</strong>.</span>`;
    } else if (fuenteDatos === 'network_error') {
      bar.className = 'api-status-bar api-status-mock';
      bar.innerHTML = `<span>❌ No se pudo conectar con la API. Comprueba tu conexión o vuelve a intentar.</span>`;
    } else if (fuenteDatos && fuenteDatos !== 'undefined') {
      bar.className = 'api-status-bar api-status-enVivo';
      bar.innerHTML = `<span>✅ Datos en vivo desde <strong>${fuenteDatos}</strong></span>`;
      setTimeout(() => { bar.style.display = 'none'; }, 5000);
    } else {
      bar.style.display = 'none';
    }
  },

  
  async doPull(n) {
    const envolturaSobre = document.getElementById('sobre-wrapper');
    const sobreCerrado  = document.getElementById('sobre-closed');
    const result       = document.getElementById('gacha-result');
    const btnX1        = document.getElementById('btn-gacha-1');
    const btnX10       = document.getElementById('btn-gacha-10');

    if (btnX1)  btnX1.disabled  = true;
    if (btnX10) btnX10.disabled = true;

    result.style.display = 'none';
    if (sobreCerrado) {
      sobreCerrado.classList.add('sobre-opening');
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

    const tirada = await Gacha.tirada(n);

    if (sobreCerrado) sobreCerrado.classList.remove('sobre-opening');
    if (btnX1)  btnX1.disabled  = false;
    if (btnX10) btnX10.disabled = false;

    if (tirada.error) {
      result.innerHTML = '';
      result.style.display = 'none';
      Toast.error(tirada.error);
      return;
    }

    await App.refreshHeader(tirada.usuarioActual);

    await Promise.all(tirada.resultados.map(f => Gacha.getPlayerPhoto(f)));

    result.innerHTML = `
      <div class="gacha-cards-grid ${tirada.resultados.length === 1 ? 'single-card' : ''}" id="gacha-grid">
        ${tirada.resultados.map((f, idx) => this._renderFiguritaCard(f, null, idx)).join('')}
      </div>`;

    document.querySelectorAll('#gacha-grid .figurita-card').forEach((card, i) => {
      setTimeout(() => card.classList.add('card-flip-in'), i * 100);
    });

    
    
    
    const fotosVistas = new Set();
    tirada.resultados.forEach(f => {
      if (fotosVistas.has(f.id)) return; 
      fotosVistas.add(f.id);
      Gacha.getPlayerPhoto(f).then(url => {
        if (!url) return;
        
        const envoltorios = document.querySelectorAll(`#gacha-grid .fig-fotoJug-envoltorio[data-id="${f.id}"]`);
        envoltorios.forEach(envoltorio => {
          
          const imgExistente = envoltorio.querySelector('img.fig-fotoJug');
          if (imgExistente) imgExistente.remove();
          const esRecorte = url.includes('cutout') || url.includes('Cutout');
          const img = document.createElement('img');
          img.className = "fig-fotoJug";
          img.referrerPolicy = "no-referrer";
          img.alt = f.name;
          img.style.cssText = `object-fit:${esRecorte?'contain':'cover'};object-position:${esRecorte?'center':'top center'};opacity:0;transition:opacity .3s;position:relative;z-index:1;`;
          img.onload = () => {
            img.style.opacity = '1';
            const em = envoltorio.querySelector('.fig-emoji-fallback');
            if (em) em.style.display = 'none';
          };
          img.onerror = () => { img.remove(); };
          img.src = url;
          envoltorio.insertBefore(img, envoltorio.firstChild);
          if (!envoltorio.querySelector('.fig-fotoJug-gradient')) {
            const g = document.createElement('div');
            g.className = 'fig-fotoJug-gradient';
            envoltorio.appendChild(g);
          }
        });
      }).catch(()=>{});
    });

    const pc = tirada.usuarioActual.contadorPity || 0;
    const pd = document.getElementById('pity-display');
    const pb = document.getElementById('pity-bar');
    if (pd) pd.textContent = `${pc}/50`;
    if (pb) pb.style.width = `${Math.min(100, (pc / 50) * 100)}%`;

    const figGoat = tirada.resultados.find(f => f.rareza === 'figGoat');
    const figLegendaria  = tirada.resultados.find(f => f.rareza === 'legendary');
    const figEpica = tirada.resultados.find(f => f.rareza === 'figEpica');

    
    if (figGoat || figLegendaria) {
      const claseRareza = figGoat ? 'reveal-figGoat' : 'reveal-legendary';
      const etiquetaRareza = figGoat ? '🐐 ¡¡G.O.A.T!!' : '✨ ¡LEGENDARIA!';
      const colorRareza = figGoat ? '#ff2244' : '#ffd700';
      const nombreRareza  = figGoat ? figGoat.name : figLegendaria.name;

      
      const overlay = document.createElement('div');
      overlay.id = 'rarity-reveal-overlay';
      overlay.innerHTML = `
        <div class="rarity-reveal-bg ${claseRareza}">
          <div class="rarity-rays"></div>
          <div class="rarity-particles" id="rarity-particles"></div>
          <div class="rarity-etiqueta-envoltorio">
            <div class="rarity-etiqueta-text" style="color:${colorRareza}">${etiquetaRareza}</div>
            <div class="rarity-etiqueta-name">${nombreRareza}</div>
          </div>
        </div>`;
      document.body.appendChild(overlay);

      
      const elemParticulas = overlay.querySelector('#rarity-particles');
      const colores = figGoat ? ['#ff2244','#ff6622','#ffcc00','#ffffff'] : ['#ffd700','#fff4a0','#fffbe6','#ffffff'];
      for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'rarity-particle';
        p.style.cssText = `
          left:${Math.random()*100}%;
          animation-delay:${Math.random()*0.8}s;
          animation-duration:${0.8 + Math.random()*0.8}s;
          background:${colores[Math.floor(Math.random()*colores.length)]};
          width:${4 + Math.random()*8}px;
          height:${4 + Math.random()*8}px;
        `;
        elemParticulas.appendChild(p);
      }

      
      setTimeout(() => {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.4s ease';
        setTimeout(() => overlay.remove(), 500);
      }, 2200);
    }

    if (figGoat)      Toast.success(`🐐 ¡¡GOAT!! ¡¡Obtuviste a ${figGoat.name}!! 🔴`, 7000);
    else if (figLegendaria)  Toast.success(`✨ ¡LEGENDARIA! ¡Obtuviste a ${figLegendaria.name}!`, 5000);
    else if (figEpica) Toast.success(`⚡ ¡Épica! ${figEpica.name}`, 3000);
    else           Toast.show(`+${tirada.resultados.length} figurita${tirada.resultados.length > 1 ? 's' : ''}`);
  },

  _renderFiguritaCard(f, urlFoto, idx) {
    const retardo = idx * 0.08;
    const estadisticasJug = Album.getPlayerStats ? (Album.getPlayerStats(f.id) || {}) : {};
    const esPortero = f.pos === 'POR';

    const urlCacheada = API.getPhotoSync(f) || urlFoto || null;
    const esRecorte  = urlCacheada && (urlCacheada.includes('cutout') || urlCacheada.includes('Cutout'));

    const seccionFoto = `<div class="fig-fotoJug-envoltorio" data-id="${f.id}" style="position:relative">
      <span class="fig-emoji-fallback" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:0">${f.emoji}</span>
      ${urlCacheada
        ? `<img class="fig-fotoJug" src="${urlCacheada}" alt="${f.name}"
                style="object-fit:${esRecorte?'contain':'cover'};object-position:${esRecorte?'center':'top center'};opacity:0;transition:opacity .3s;position:relative;z-index:1;"
                referrerpolicy="no-referrer"
                onload="this.style.opacity='1';var em=this.parentNode.querySelector('.fig-emoji-fallback');if(em)em.style.display='none';"
                onerror="this.remove();">`
        : ''}
    </div>`;

    const htmlEstadisticas = esPortero
      ? `<div class="fig-estadisticasJug-row">
           <span class="fig-stat"><span class="fig-stat-val">${estadisticasJug.saves ?? '—'}</span><span class="fig-stat-lbl">Par.</span></span>
           <span class="fig-stat"><span class="fig-stat-val">${estadisticasJug.apps ?? '—'}</span><span class="fig-stat-lbl">PJ</span></span>
           <span class="fig-stat"><span class="fig-stat-val">${f.rating}</span><span class="fig-stat-lbl">OVR</span></span>
         </div>`
      : `<div class="fig-estadisticasJug-row">
           <span class="fig-stat"><span class="fig-stat-val">${estadisticasJug.goals ?? '—'}</span><span class="fig-stat-lbl">Gls</span></span>
           <span class="fig-stat"><span class="fig-stat-val">${estadisticasJug.assists ?? '—'}</span><span class="fig-stat-lbl">Ast</span></span>
           <span class="fig-stat"><span class="fig-stat-val">${f.rating}</span><span class="fig-stat-lbl">OVR</span></span>
         </div>`;

    return `
      <div class="figurita-card ${f.rareza}" style="animation-delay:${retardo}s">
        <div class="fig-rarity-glow"></div>
        <span class="rarity-insignia insignia-${f.rareza}">${Gacha.getRarityLabel(f.rareza)}</span>
        ${seccionFoto}
        <div class="fig-info">
          <div class="figurita-name">${f.name}</div>
          <div class="figurita-equipo">${f.flag || ''} ${f.equipo}</div>
          <div class="fig-footer">
            <span class="figurita-pos">${f.pos}</span>
          </div>
          ${htmlEstadisticas}
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