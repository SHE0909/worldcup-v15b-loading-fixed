/**
 * profile.js — Perfil de usuario, favoritos, export/import  v2
 * Mejoras: stats correctas, monedas visibles, actividad reciente
 */

const Profile = {

  async render() {
    const user = await Auth.currentUser();
    if (!user) return;

    // BUG FIX: usar helper para no crashear si el DOM no tiene el elemento
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('profile-name',  user.name  || 'Jugador');
    setEl('profile-email', user.email || '-');
    // BUG FIX: user.createdAt puede ser undefined en cuentas antiguas -> crash silencioso
    const fechaStr = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString('es-SV', { dateStyle: 'long' })
      : '-';
    setEl('profile-date', 'Registrado: ' + fechaStr);

    // Stats correctas
    const figuritas   = user.figuritas || [];
    const unicas      = figuritas.length;                              // figuritas distintas
    const totalCards  = figuritas.reduce((s, f) => s + 1 + (f.duplicados||0), 0); // total incluyendo dupes
    const total       = Gacha.getTotalFiguritas();
    const pct         = total > 0 ? Math.round((unicas / total) * 100) : 0;
    const monedas     = user.monedas || 0;
    const duplicados  = figuritas.reduce((s, f) => s + (f.duplicados||0), 0);

    // BUG FIX: todos los setEl con helper seguro
    setEl('ps-figuritas', `${unicas}/${total}`);
    setEl('ps-tiradas',   user.tiradas ?? 0);
    setEl('ps-wins',      user.battleWins || 0);
    setEl('ps-losses',    user.battleLosses || 0);
    setEl('ps-aciertos',  user.aciertos ?? 0);

    // Pity counter (si existe el elemento)
    const pityEl = document.getElementById('ps-pity');
    if (pityEl) pityEl.textContent = `${user.pityCount || 0}/${50}`;

    // Monedas + duplicados
    const monedasEl = document.getElementById('ps-monedas');
    if (monedasEl) monedasEl.textContent = monedas;

    // Barra de progreso del álbum en perfil
    const pctEl = document.getElementById('ps-album-pct');
    if (pctEl) pctEl.textContent = `${pct}%`;

    this.renderFavorites(user);
    this.renderBetHistory(user);

    // Botón convertir duplicados (si existe)
    const btnConvert = document.getElementById('btn-convert-dupes');
    if (btnConvert) {
      btnConvert.textContent = `🔄 Convertir duplicados (${duplicados}) → monedas`;
      btnConvert.disabled = duplicados === 0;
      btnConvert.onclick = async () => {
        const { coins, converted } = await Gacha.convertDuplicates();
        if (coins > 0) {
          Toast.success(`💰 ¡+${coins} monedas! (${converted} duplicados convertidos)`);
          await this.render(); // Refrescar
        } else {
          Toast.warn('No tienes duplicados para convertir');
        }
      };
    }
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
      const extra = p.exactCorrect ? ' +3🎴' : p.result === 'win' ? ' +1🎴' : '';
      return `
        <div class="bet-item">
          <div class="bet-left">
            <span class="bet-match">${p.matchId}</span>
            <span class="bet-pick">${this._labelPick(p.pick)}${p.exact ? ' · ' + p.exact : ''}</span>
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
      version:      '2.0',
      exportedAt:   new Date().toISOString(),
      app:          'World Cup Collector UES',
      usuario:      user.name,
      email:        user.email,
      tiradas:      user.tiradas,
      aciertos:     user.aciertos,
      monedas:      user.monedas || 0,
      pityCount:    user.pityCount || 0,
      lastDailyPull: user.lastDailyPull || null,
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
      equipo_ideal: user.equipo_ideal || {}
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
      // Restaurar tiradas exactas del export; freeSpinsClaimed se mantiene siempre en true
      user.tiradas          = typeof data.tiradas === 'number' ? data.tiradas : (user.tiradas ?? 0);
      user.freeSpinsClaimed = true;   // nunca volver a entregar las 5 iniciales
      user.aciertos         = Number(data.aciertos)  || user.aciertos;
      user.monedas          = typeof data.monedas === 'number' ? data.monedas : (user.monedas ?? 0);
      user.pityCount        = Number(data.pityCount) || 0;
      user.favoritos        = data.favoritos    || user.favoritos;
      user.predicciones     = data.predicciones || user.predicciones;
      user.equipo_ideal     = data.equipo_ideal || user.equipo_ideal;
      if (data.lastDailyPull) user.lastDailyPull = data.lastDailyPull;

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
