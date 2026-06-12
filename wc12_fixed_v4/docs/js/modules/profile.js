
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

    // Calcular totales
    const wins       = preds.filter(p => p.result === 'win').length;
    const losses     = preds.filter(p => p.result === 'loss').length;
    const totalGanado = preds.reduce((acc, p) => {
      if (p.exactCorrect) return acc + 3;
      if (p.result === 'win') return acc + 1;
      return acc;
    }, 0);

    const summaryHtml = `
      <div class="bet-summary" style="display:flex;gap:0.5rem;margin-bottom:0.6rem;padding:0.5rem 0.75rem;background:var(--surface-2,rgba(255,255,255,0.05));border-radius:8px;font-size:0.75rem;flex-wrap:wrap;">
        <span>🏆 <strong>${wins}</strong> ganados</span>
        <span style="color:var(--text-muted)">·</span>
        <span>❌ <strong>${losses}</strong> perdidos</span>
        <span style="color:var(--text-muted)">·</span>
        <span style="color:var(--gold)">🎴 <strong>+${totalGanado}</strong> tiradas ganadas</span>
      </div>`;

    history.innerHTML = summaryHtml + preds.slice(0, 20).map(p => {
      const icon    = p.result === 'win' ? '✅' : p.result === 'loss' ? '❌' : '⏳';
      const tiradas = p.exactCorrect ? 3 : p.result === 'win' ? 1 : 0;
      const rewardHtml = tiradas > 0
        ? `<span class="bet-reward-badge" style="font-size:0.65rem;background:rgba(255,193,7,0.15);color:var(--gold);border-radius:4px;padding:1px 5px;margin-left:4px">+${tiradas} 🎴</span>`
        : '';
      const exactBadge = p.exactCorrect
        ? `<span style="font-size:0.6rem;color:#4fc3f7;margin-left:4px">EXACTO</span>` : '';
      // Mostrar marcador final si está disponible
      const scoreHtml = p.finalScore
        ? `<span class="bet-score" style="font-size:0.65rem;color:var(--text-muted)">${p.finalHome || ''} ${p.finalScore} ${p.finalAway || ''}</span>`
        : '';
      // Nombre del partido: usar home/away guardados, si no el matchId como fallback
      const matchLabel = (p.matchHome && p.matchAway)
        ? `${p.matchHomeFlag || ''} ${p.matchHome} vs ${p.matchAway} ${p.matchAwayFlag || ''}`
        : p.matchId;
      return `
        <div class="bet-item">
          <div class="bet-left">
            <span class="bet-match">${matchLabel}</span>
            <span class="bet-pick">${this._labelPick(p.pick)}${p.exact ? ' · ' + p.exact : ''}${exactBadge}</span>
            ${scoreHtml}
          </div>
          <span class="bet-result ${p.result}">
            ${icon}${rewardHtml}
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
      wcPrediction: user.wcPrediction || (() => {
        try { return JSON.parse(localStorage.getItem('wcc_wc_prediction') || 'null'); } catch(_) { return null; }
      })(),
      battleAttempts: (() => {
        // Usar clave específica del usuario si está disponible
        const key = user.email ? `wcc_battle_attempts_${user.email}` : 'wcc_battle_attempts';
        try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch(_) { return null; }
      })(),
      minigameStats: (() => {
        try {
          const stats = {};
          ['wcc_quiz_stats','wcc_penalty_stats','wcc_classic_stats'].forEach(k => {
            const v = localStorage.getItem(k);
            if (v) stats[k] = JSON.parse(v);
          });
          return Object.keys(stats).length ? stats : null;
        } catch(_) { return null; }
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
      if (data.wcPrediction) {
        user.wcPrediction = data.wcPrediction;
        // Backup en localStorage para acceso síncrono
        try { localStorage.setItem('wcc_wc_prediction', JSON.stringify(data.wcPrediction)); } catch(_) {}
      }
      // Restaurar nombre y foto de perfil si están en el export
      if (data.usuario)  user.name     = data.usuario;
      if (data.photoURL) user.photoURL = data.photoURL;
      // Restaurar marcas de tiradas diarias para no resetear el límite al importar en otro navegador
      if (data.lastDailyPull) user.lastDailyPull = data.lastDailyPull;
      if (data.lastDailySpin) user.lastDailySpin = data.lastDailySpin;
      // Restaurar intentos diarios de batalla con clave específica del usuario
      if (data.battleAttempts) {
        try {
          const key = user.email ? `wcc_battle_attempts_${user.email}` : 'wcc_battle_attempts';
          localStorage.setItem(key, JSON.stringify(data.battleAttempts));
          // Actualizar el email en BattleAttempts si está disponible
          if (typeof BattleAttempts !== 'undefined') BattleAttempts.setUser(user.email);
        } catch(_) {}
      }
      // Restaurar estadísticas de minijuegos
      if (data.minigameStats) {
        try {
          Object.entries(data.minigameStats).forEach(([k, v]) => {
            localStorage.setItem(k, JSON.stringify(v));
          });
        } catch(_) {}
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