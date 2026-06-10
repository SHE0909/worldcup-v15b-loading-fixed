/**
 * profile.js — Perfil de usuario, favoritos, export/import  v3
 * v3: Edición de nombre, correo y foto de perfil
 */

const Profile = {

  async render() {
    const user = await Auth.currentUser();
    if (!user) return;

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('profile-name',  user.name  || 'Jugador');
    setEl('profile-email', user.email || '-');
    const fechaStr = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString('es-SV', { dateStyle: 'long' })
      : '-';
    setEl('profile-date', 'Registrado: ' + fechaStr);

    // Avatar: foto guardada o iniciales
    const avatarEl = document.getElementById('profile-avatar');
    if (avatarEl) {
      if (user.photoURL) {
        avatarEl.innerHTML = `<img src="${user.photoURL}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
      } else {
        const initials = (user.name || 'J').split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase();
        avatarEl.textContent = initials;
      }
    }

    // Stats
    const figuritas   = user.figuritas || [];
    const unicas      = figuritas.length;
    const total       = Gacha.getTotalFiguritas();
    const pct         = total > 0 ? Math.round((unicas / total) * 100) : 0;
    const monedas     = user.monedas || 0;
    const duplicados  = figuritas.reduce((s, f) => s + (f.duplicados||0), 0);

    setEl('ps-figuritas', `${unicas}/${total}`);
    setEl('ps-tiradas',   user.tiradas ?? 0);
    setEl('ps-wins',      user.battleWins || 0);
    setEl('ps-losses',    user.battleLosses || 0);
    setEl('ps-aciertos',  user.aciertos ?? 0);

    const pityEl = document.getElementById('ps-pity');
    if (pityEl) pityEl.textContent = `${user.pityCount || 0}/${50}`;

    const monedasEl = document.getElementById('ps-monedas');
    if (monedasEl) monedasEl.textContent = monedas;

    const pctEl = document.getElementById('ps-album-pct');
    if (pctEl) pctEl.textContent = `${pct}%`;

    this.renderFavorites(user);
    this.renderBetHistory(user);
    this._bindEditEvents();

    const btnConvert = document.getElementById('btn-convert-dupes');
    if (btnConvert) {
      btnConvert.textContent = `Convertir duplicados (${duplicados}) en monedas`;
      btnConvert.disabled = duplicados === 0;
      btnConvert.onclick = async () => {
        const { coins, converted } = await Gacha.convertDuplicates();
        if (coins > 0) {
          Toast.success(`+${coins} monedas obtenidas (${converted} duplicados)`);
          await this.render();
        } else {
          Toast.warn('No tienes duplicados para convertir');
        }
      };
    }
  },

  _bindEditEvents() {
    // Editar nombre
    const btnName = document.getElementById('btn-edit-name');
    if (btnName && !btnName._bound) {
      btnName._bound = true;
      btnName.addEventListener('click', () => this._editField('name', 'Nuevo nombre', 'text'));
    }
    // Editar correo
    const btnEmail = document.getElementById('btn-edit-email');
    if (btnEmail && !btnEmail._bound) {
      btnEmail._bound = true;
      btnEmail.addEventListener('click', () => this._editField('email', 'Nuevo correo', 'email'));
    }
    // Editar avatar (botón sobre la foto)
    const btnAvatar = document.getElementById('btn-edit-avatar');
    const inputFile = document.getElementById('input-avatar-file');
    if (btnAvatar && inputFile && !btnAvatar._bound) {
      btnAvatar._bound = true;
      btnAvatar.addEventListener('click', () => inputFile.click());
      inputFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await this._updateAvatar(file);
        e.target.value = '';
      });
    }
  },

  async _editField(field, placeholder, type = 'text') {
    const user = await Auth.currentUser();
    if (!user) return;

    const currentVal = user[field] || '';
    const newVal = prompt(`${placeholder}:`, currentVal);
    if (newVal === null || newVal.trim() === '') return;

    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newVal.trim())) {
      Toast.error('Correo no válido');
      return;
    }

    user[field] = newVal.trim();
    await Auth.updateUser(user);
    Toast.success(`${field === 'name' ? 'Nombre' : 'Correo'} actualizado`);
    await this.render();
  },

  async _updateAvatar(file) {
    if (!file.type.startsWith('image/')) { Toast.error('El archivo debe ser una imagen'); return; }
    if (file.size > 2 * 1024 * 1024) { Toast.error('La imagen no debe superar 2 MB'); return; }

    // Comprimir/redimensionar a 200×200 antes de guardar en base64
    const dataURL = await new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const SIZE = 200;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        // Crop centrado
        const s = Math.min(img.width, img.height);
        const sx = (img.width  - s) / 2;
        const sy = (img.height - s) / 2;
        ctx.drawImage(img, sx, sy, s, s, 0, 0, SIZE, SIZE);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = url;
    });

    const user = await Auth.currentUser();
    if (!user) return;
    user.photoURL = dataURL;
    await Auth.updateUser(user);
    Toast.success('Foto de perfil actualizada');
    await this.render();
  },

  renderFavorites(user) {
    const favTeams   = document.getElementById('fav-teams-list');
    const favPlayers = document.getElementById('fav-players-list');
    const favs       = user.favoritos || [];

    const teams   = favs.filter(f => f.tipo === 'team');
    const players = favs.filter(f => f.tipo === 'player');

    if (favTeams) {
      favTeams.innerHTML = teams.length
        ? teams.map(f => `
            <span class="fav-tag">
              ${f.flag || ''} ${f.name}
              <button data-id="${f.id}" data-tipo="team" title="Eliminar">✕</button>
            </span>`).join('')
        : '<span class="text-muted" style="font-size:0.8rem">Sin equipos favoritos</span>';
    }

    if (favPlayers) {
      favPlayers.innerHTML = players.length
        ? players.map(f => `
            <span class="fav-tag">
              ${f.flag || ''} ${f.name}
              <button data-id="${f.id}" data-tipo="player" title="Eliminar">✕</button>
            </span>`).join('')
        : '<span class="text-muted" style="font-size:0.8rem">Sin jugadores favoritos</span>';
    }

    // Eventos eliminar
    const allBtns = [
      ...(favTeams?.querySelectorAll('button') || []),
      ...(favPlayers?.querySelectorAll('button') || [])
    ];
    allBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        await this.removeFavorite(btn.dataset.id, btn.dataset.tipo);
      });
    });
  },

  renderBetHistory(user) {
    const history = document.getElementById('bet-history');
    if (!history) return;
    const preds = (user.predicciones || []).slice().reverse();

    if (!preds.length) {
      history.innerHTML = '<p class="empty-state" style="font-size:0.8rem">Sin predicciones aún</p>';
      return;
    }

    history.innerHTML = preds.slice(0, 10).map(p => {
      const icon  = p.result === 'win' ? '✅' : p.result === 'loss' ? '❌' : '⏳';
      const extra = p.exactCorrect ? ' +3 tiradas' : p.result === 'win' ? ' +1 tirada' : '';
      // Mostrar marcador final si está disponible
      const scoreHtml = p.finalScore
        ? `<span class="bet-score">${p.finalHome || ''} ${p.finalScore} ${p.finalAway || ''}</span>`
        : '';
      return `
        <div class="bet-item">
          <div class="bet-left">
            <span class="bet-match">${p.matchId}</span>
            <span class="bet-pick">${this._labelPick(p.pick)}${p.exact ? ' · ' + p.exact : ''}</span>
            ${scoreHtml}
          </div>
          <span class="bet-result ${p.result}">
            ${icon}${extra}
          </span>
        </div>
      `;
    }).join('');
  },

  _labelPick(p) {
    return { home:'Local', away:'Visitante', draw:'Empate' }[p] || p;
  },

  /* ── Favoritos ── */
  async addFavorite(item, tipo) {
    const user = await Auth.currentUser();
    if (!user) return;
    const favs = user.favoritos || [];
    if (favs.find(f => f.id === item.id && f.tipo === tipo)) {
      Toast.warn('Ya está en favoritos');
      return;
    }
    favs.push({ ...item, tipo });
    user.favoritos = favs;
    await Auth.updateUser(user);
    // BUG FIX: logActivity era opcional, no debe bloquear el flujo
    try { await DB.logActivity(user.email, 'add_favorite', `${tipo}: ${item.name}`); } catch(_) {}
    Toast.success(`⭐ ${item.name} agregado a favoritos`);
    // BUG FIX: actualizar lista de favoritos en perfil si está visible
    this.renderFavorites(user);
  },

  async removeFavorite(id, tipo) {
    const user = await Auth.currentUser();
    if (!user) return;
    user.favoritos = (user.favoritos || []).filter(f => !(f.id === id && f.tipo === tipo));
    await Auth.updateUser(user);
    Toast.show('Eliminado de favoritos');
    this.renderFavorites(user);
  },

  // BUG FIX: isFavorite ahora acepta tipo opcional para evitar falsos positivos
  async isFavorite(id, tipo = null) {
    const user = await Auth.currentUser();
    return (user?.favoritos || []).some(f => f.id === id && (tipo === null || f.tipo === tipo));
  },

  /* ── Exportar JSON ── */
  async exportData() {
    const user = await Auth.currentUser();
    if (!user) return;

    const exportObj = {
      version:      '2.1',
      exportedAt:   new Date().toISOString(),
      app:          'World Cup Collector UES',
      usuario:      user.name,
      email:        user.email,
      photoURL:     user.photoURL || null,
      tiradas:      user.tiradas,
      aciertos:     user.aciertos,
      monedas:      user.monedas || 0,
      pityCount:    user.pityCount || 0,
      lastDailyPull: user.lastDailyPull || null,
      lastDailySpin: user.lastDailySpin || null,
      figuritas: (user.figuritas || []).map(f => ({
        id:         f.id,
        nombre:     f.name,
        equipo:     f.team,
        rareza:     f.rareza,
        duplicados: f.duplicados || 0,
        obtenida:   f.obtenida
      })),
      favoritos:    user.favoritos || [],
      predicciones: (user.predicciones || []).map(p => ({
        matchId:      p.matchId,
        pick:         p.pick,
        exact:        p.exact,
        result:       p.result,
        exactCorrect: p.exactCorrect || false
      })),
      equipo_ideal: user.equipo_ideal || {},
      battleAttempts: (() => {
        try { return JSON.parse(localStorage.getItem('wcc_battle_attempts') || 'null'); } catch(_) { return null; }
      })()
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `wcc_${user.name.replace(/\s/g,'_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Toast.success('Datos exportados 📥');
    await DB.logActivity(user.email, 'export', 'JSON export');
  },

  /* ── Importar JSON ── */
  async importData(file) {
    if (!file) return;
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      Toast.error('El archivo debe ser un JSON válido (.json)');
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validación de estructura
      if (!data.usuario || !data.email || !Array.isArray(data.figuritas)) {
        Toast.error('Estructura del archivo inválida');
        return;
      }

      // Verificar versión
      if (data.version && parseFloat(data.version) < 1.0) {
        Toast.error('Versión de archivo no compatible');
        return;
      }

      const user = await Auth.currentUser();
      if (!user)             { Toast.error('Inicia sesión primero'); return; }
      if (user.email !== data.email) {
        Toast.error(`El archivo pertenece a otro usuario (${data.email})`);
        return;
      }

      const confirmed = confirm(
        `¿Importar datos de "${data.usuario}"?\n` +
        `Figuritas: ${data.figuritas.length} | Tiradas: ${data.tiradas} | Monedas: ${data.monedas || 0}\n\n` +
        `⚠️ Esto REEMPLAZARÁ tu progreso actual de figuritas y tiradas.`
      );
      if (!confirmed) return;

      // Reconstruir figuritas con datos del pool
      const pool   = Gacha.getPool();
      const merged = data.figuritas.map(f => {
        const base = pool.find(p => p.id === f.id);
        return base
          ? { ...base, duplicados: f.duplicados || 0, obtenida: f.obtenida || new Date().toISOString() }
          : null;
      }).filter(Boolean);

      user.figuritas        = merged;
      // Restaurar tiradas exactas; freeSpinsClaimed siempre true para no re-entregar las iniciales
      user.tiradas          = typeof data.tiradas === 'number' ? data.tiradas : (user.tiradas ?? 0);
      user.freeSpinsClaimed = true;
      user.aciertos         = Number(data.aciertos)  || user.aciertos;
      user.monedas          = typeof data.monedas === 'number' ? data.monedas : (user.monedas ?? 0);
      user.pityCount        = Number(data.pityCount) || 0;
      user.favoritos        = data.favoritos    || user.favoritos;
      user.predicciones     = data.predicciones || user.predicciones;
      user.equipo_ideal     = data.equipo_ideal || user.equipo_ideal;
      // Restaurar nombre y foto de perfil si están en el export
      if (data.usuario)  user.name     = data.usuario;
      if (data.photoURL) user.photoURL = data.photoURL;
      // Restaurar marcas de tiradas diarias para no resetear el límite al importar en otro navegador
      if (data.lastDailyPull) user.lastDailyPull = data.lastDailyPull;
      if (data.lastDailySpin) user.lastDailySpin = data.lastDailySpin;
      // Restaurar intentos diarios de batalla para preservar el límite entre dispositivos
      if (data.battleAttempts) {
        try { localStorage.setItem('wcc_battle_attempts', JSON.stringify(data.battleAttempts)); } catch(_) {}
      }

      await Auth.updateUser(user);
      await DB.logActivity(user.email, 'import', `JSON import v${data.version || '1.0'}`);
      Toast.success('✅ Datos importados correctamente');
      await App.loadUserData();
    } catch (err) {
      console.error('[Profile.importData]', err);
      Toast.error('Error al leer el archivo: ' + err.message);
    }
  }
};

/* ══════════════════════════════════════════
   API CONFIG — gestión de key y estado
══════════════════════════════════════════ */
const ApiConfig = {
  _LS_KEY: 'wcc_af_api_key',

  init() {
    // Mostrar key guardada (enmascarada)
    const saved = localStorage.getItem(this._LS_KEY);
    const input = document.getElementById('input-af-key');
    if (input && saved) input.placeholder = '••••••••' + saved.slice(-6);

    document.getElementById('btn-save-af-key')?.addEventListener('click', () => this.saveKey());
    document.getElementById('btn-test-af-key')?.addEventListener('click', () => this.testKey());
    document.getElementById('btn-remove-af-key')?.addEventListener('click', () => this.removeKey());
    document.getElementById('btn-clear-api-cache')?.addEventListener('click', () => this.clearCache());

    this.renderStatus();

    // Si hay key propia guardada y no hay estado conocido aún, auto-verificar silenciosamente
    if (saved && !API_STATUS.lastError && !API_STATUS.lastSuccess) {
      setTimeout(() => this.testKey(), 300);
    }
  },

  saveKey() {
    const val = document.getElementById('input-af-key')?.value?.trim();
    if (!val) { Toast.error('Ingresa una key primero'); return; }
    // Validar formato básico: debe ser hexadecimal de 32 chars (api-football.com)
    // Las keys de api-football son hashes hex de 32 caracteres
    if (!/^[a-f0-9]{32}$/i.test(val)) {
      Toast.error('❌ Formato inválido. La key de api-football.com tiene 32 caracteres hexadecimales (ej: a1b2c3...d4e5f6). Cópiala desde el dashboard en api-football.com → My Account → API Key');
      return;
    }
    localStorage.setItem(this._LS_KEY, val);
    document.getElementById('input-af-key').value = '';
    document.getElementById('input-af-key').placeholder = '••••••••' + val.slice(-6);
    // Limpiar estado anterior para que el banner refleje la nueva situación
    API_STATUS.usingMock  = false;
    API_STATUS.lastError  = null;
    API_STATUS.lastSuccess = null;
    this.clearCache(false);
    this.renderStatus();
    Toast.success('✅ Key guardada. Recargando datos...');
    setTimeout(() => location.reload(), 1200);
  },

  removeKey() {
    localStorage.removeItem(this._LS_KEY);
    const input = document.getElementById('input-af-key');
    if (input) { input.value = ''; input.placeholder = 'Pega tu x-rapidapi-key aquí'; }
    this.clearCache(false);
    Toast.info('Key eliminada. Usando key por defecto.');
    this.renderStatus();
  },

  clearCache(showToast = true) {
    const keys = ['wcc_af_today_ts','wcc_af_next_ts','wcc_af_yest_ts',
                  'wcc_cache_upcoming_today','wcc_cache_upcoming_next','wcc_cache_upcoming_yest',
                  'wcc_upcoming_day','wcc_af_standings_ts',
                  'wcc_af_req_count','wcc_af_req_day',
                  'wcc_af_hour_slot','wcc_af_hour_count','wcc_shared_live'];
    keys.forEach(k => localStorage.removeItem(k));
    if (showToast) Toast.success('🗑️ Caché limpiada. Los datos se recargarán.');
  },

  async testKey() {
    const btn = document.getElementById('btn-test-af-key');
    if (btn) btn.textContent = '⏳ Verificando...';
    const key = localStorage.getItem(this._LS_KEY) || '';
    if (!key) {
      Toast.error('No hay key guardada. Ingresa una key primero.');
      if (btn) btn.textContent = '🔍 Verificar key';
      return;
    }
    if (!/^[a-f0-9]{32}$/i.test(key)) {
      Toast.error('❌ Formato inválido. La key debe tener 32 caracteres hexadecimales.');
      if (btn) btn.textContent = '🔍 Verificar key';
      return;
    }
    try {
      // api-football.com usa header 'x-apisports-key' (no RapidAPI)
      const res = await fetch('https://v3.football.api-sports.io/status', {
        headers: {
          'x-apisports-key': key,
          'x-rapidapi-key':  key,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        },
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data?.errors && Object.keys(data.errors).length > 0) {
        const msg = JSON.stringify(data.errors);
        throw new Error(msg.includes('token') || msg.includes('Access') ? 'auth' : msg);
      }
      const plan  = data?.response?.subscription?.plan || 'Free';
      const used  = data?.response?.requests?.current  ?? '?';
      const limit = data?.response?.requests?.limit_day ?? '?';
      Toast.success(`✅ Key válida · Plan: ${plan} · Requests hoy: ${used}/${limit}`);
      API_STATUS.lastError = null;
    } catch(err) {
      const msg = err.message;
      if (msg === 'auth' || msg.includes('403') || msg.includes('401') || msg.includes('token') || msg.includes('Access') || msg.includes('suspended')) {
        if (msg.includes('suspended')) {
          Toast.error('🚫 Cuenta suspendida — Revisa tu cuenta en dashboard.api-football.com');
          API_STATUS.lastError = 'suspended';
        } else {
          Toast.error('❌ Key inválida. Verifica que la copiaste bien desde api-football.com → My Account');
          API_STATUS.lastError = 'auth';
        }
      } else if (msg.includes('429')) {
        Toast.error('⚠️ Límite diario alcanzado. Vuelve mañana.');
        API_STATUS.lastError = 'rate_limit';
      } else {
        Toast.error('❌ Sin conexión o error de red: ' + msg);
        API_STATUS.lastError = 'network';
      }
    } finally {
      if (btn) btn.textContent = '🔍 Verificar key';
      this.renderStatus();
    }
  },

  renderStatus() {
    const banner = document.getElementById('api-status-banner');
    if (!banner) return;
    const hasCustomKey   = !!localStorage.getItem(this._LS_KEY);
    const err            = API_STATUS.lastError;
    const usingMock      = API_STATUS.usingMock;
    const reqToday       = API_STATUS.requestsToday;
    const reqThisHour    = API_STATUS.requestsThisHour || 0;
    const hadSuccess     = !!API_STATUS.lastSuccess;
    const hourlyLimitHit = err === 'hourly_limit';
    const maxPerHour     = typeof _AF_DEFAULT_MAX_PER_HOUR !== 'undefined' ? _AF_DEFAULT_MAX_PER_HOUR : 10;

    let html = '';

    if (err === 'suspended') {
      html = `<div style="background:rgba(255,68,68,0.15);border:1px solid #ff4444;border-radius:6px;padding:0.5rem 0.75rem;font-size:0.72rem;color:#ff8888">
        🚫 <strong>Cuenta suspendida</strong> — Tu cuenta en api-football.com está suspendida. Revisa tu estado en <a href="https://dashboard.api-football.com" target="_blank" style="color:#ff8888;text-decoration:underline">dashboard.api-football.com</a>.
      </div>`;
    } else if (err === 'auth') {
      html = `<div style="background:rgba(255,68,68,0.1);border:1px solid #ff4444;border-radius:6px;padding:0.5rem 0.75rem;font-size:0.72rem;color:#ff8888">
        ❌ <strong>Key inválida</strong> — Verifica que la copiaste bien desde <a href="https://dashboard.api-football.com" target="_blank" style="color:#ff8888;text-decoration:underline">api-football.com → My Account</a>.
      </div>`;
    } else if (err === 'rate_limit') {
      html = `<div style="background:rgba(255,170,0,0.1);border:1px solid #ffaa00;border-radius:6px;padding:0.5rem 0.75rem;font-size:0.72rem;color:#ffcc44">
        ⚠️ <strong>Límite diario alcanzado</strong> — Se resetea a medianoche. Requests usados hoy: ${reqToday}/100.
      </div>`;
    } else if (hourlyLimitHit || (!hasCustomKey && reqThisHour >= maxPerHour)) {
      html = `<div style="background:rgba(255,140,0,0.12);border:1px solid #ff8c00;border-radius:6px;padding:0.5rem 0.75rem;font-size:0.72rem;color:#ffb347">
        🕐 <strong>Límite horario alcanzado</strong> (${reqThisHour}/${maxPerHour} req esta hora con key por defecto) —
        <a href="https://dashboard.api-football.com" target="_blank" style="color:#ffb347;text-decoration:underline">Añade tu propia key gratis</a>
        para actualizaciones sin límite. Se resetea solo al cambiar de hora.
      </div>`;
    } else if (hadSuccess) {
      const ago = Math.round((Date.now() - API_STATUS.lastSuccess) / 60000);
      const keyLabel = hasCustomKey ? '🔑 key propia' : `🔒 key por defecto (${reqThisHour}/${maxPerHour} req/hora)`;
      html = `<div style="background:rgba(68,255,136,0.08);border:1px solid #44ff88;border-radius:6px;padding:0.5rem 0.75rem;font-size:0.72rem;color:#44cc88">
        ✅ <strong>API activa</strong> · ${keyLabel} · Sync hace ${ago} min · Requests hoy: ${reqToday}
      </div>`;
    } else if (hasCustomKey && usingMock) {
      html = `<div style="background:rgba(255,170,0,0.1);border:1px solid #ffaa00;border-radius:6px;padding:0.5rem 0.75rem;font-size:0.72rem;color:#ffcc44">
        ⚠️ <strong>Key guardada, API sin respuesta</strong> — Puede ser error de red temporal. Usa <em>Verificar key</em> para comprobar que sea válida.
      </div>`;
    } else if (!hasCustomKey && usingMock) {
      html = `<div style="background:rgba(255,170,0,0.1);border:1px solid #ffaa00;border-radius:6px;padding:0.5rem 0.75rem;font-size:0.72rem;color:#ffcc44">
        ⚠️ <strong>Usando datos estáticos</strong> — Agrega tu key de <a href="https://dashboard.api-football.com" target="_blank" style="color:#ffcc44;text-decoration:underline">api-football.com</a> para datos en tiempo real.
      </div>`;
    } else {
      html = `<div style="background:rgba(100,100,100,0.1);border:1px solid var(--border);border-radius:6px;padding:0.5rem 0.75rem;font-size:0.72rem;color:var(--text-muted)">
        ℹ️ ${hasCustomKey
          ? '🔑 Key propia guardada — usa <em>Verificar key</em> para confirmar.'
          : `🔒 Key por defecto (${maxPerHour} req/hora). <a href="https://dashboard.api-football.com" target="_blank" style="color:var(--text-muted);text-decoration:underline">Añade la tuya gratis</a> para sin límite.`
        }
      </div>`;
    }
    banner.innerHTML = html;
  }
};
