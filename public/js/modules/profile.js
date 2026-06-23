const Profile = {

  async renderizar() {
    const usuario = await Auth.currentUser();
    if (!usuario) return;

    const elemSet = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    elemSet('perfil-name',  usuario.name  || 'Jugador');
    elemSet('perfil-email', usuario.email || '-');
    const fechaStr = usuario.createdAt
      ? new Date(usuario.createdAt).toLocaleDateString('es-SV', { dateStyle: 'long' })
      : '-';
    elemSet('perfil-date', 'Registrado: ' + fechaStr);

    
    const elemAvatar = document.getElementById('perfil-avatarUser');
    if (elemAvatar) {
      if (usuario.photoURL) {
        elemAvatar.innerHTML = `<img src="${usuario.photoURL}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
      } else {
        const iniciales = (usuario.name || 'J').split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase();
        elemAvatar.textContent = iniciales;
      }
    }

    
    const figuritas   = usuario.figuritas || [];
    const unicas      = figuritas.length;
    const total       = Gacha.getTotalFiguritas();
    const porcentaje         = total > 0 ? Math.vuelta((unicas / total) * 100) : 0;
    const monedas     = usuario.monedas || 0;
    const duplicados  = figuritas.reduce((s, f) => s + (f.duplicados||0), 0);

    elemSet('ps-figuritas', `${unicas}/${total}`);
    elemSet('ps-tiradas',   usuario.tiradas ?? 0);
    elemSet('ps-victorias',      usuario.battleWins || 0);
    elemSet('ps-derrotas',    usuario.battleLosses || 0);
    elemSet('ps-aciertos',  usuario.aciertos ?? 0);

    const elemPity = document.getElementById('ps-pity');
    if (elemPity) elemPity.textContent = `${usuario.contadorPity || 0}/${50}`;

    const elemMonedas = document.getElementById('ps-monedas');
    if (elemMonedas) elemMonedas.textContent = monedas;

    const elemPorcentaje = document.getElementById('ps-album-porcentaje');
    if (elemPorcentaje) elemPorcentaje.textContent = `${porcentaje}%`;

    this.renderFavorites(usuario);
    this.renderBetHistory(usuario);
    this._bindEditEvents();

    const btnConvertir = document.getElementById('btn-convert-duplicados');
    if (btnConvertir) {
      btnConvertir.textContent = `Convertir duplicados (${duplicados}) en monedas`;
      btnConvertir.disabled = duplicados === 0;
      btnConvertir.onclick = async () => {
        const { monedas, converted } = await Gacha.convertDuplicates();
        if (monedas > 0) {
          Toast.success(`+${monedas} monedas obtenidas (${converted} duplicados)`);
          await this.renderizar();
        } else {
          Toast.warn('No tienes duplicados para convertir');
        }
      };
    }
  },

  _bindEditEvents() {
    
    const btnNombre = document.getElementById('btn-edit-name');
    if (btnNombre && !btnNombre._bound) {
      btnNombre._bound = true;
      btnNombre.addEventListener('click', () => this._editField('name', 'Nuevo nombre', 'text'));
    }
    
    const btnCorreo = document.getElementById('btn-edit-email');
    if (btnCorreo && !btnCorreo._bound) {
      btnCorreo._bound = true;
      btnCorreo.addEventListener('click', () => this._editField('email', 'Nuevo correo', 'email'));
    }
    
    const btnAvatar = document.getElementById('btn-edit-avatarUser');
    const archivoEntrada = document.getElementById('input-avatarUser-file');
    if (btnAvatar && archivoEntrada && !btnAvatar._bound) {
      btnAvatar._bound = true;
      btnAvatar.addEventListener('click', () => archivoEntrada.click());
      archivoEntrada.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await this._updateAvatar(file);
        e.target.value = '';
      });
    }
  },

  async _editField(field, placeholder, type = 'text') {
    const usuario = await Auth.currentUser();
    if (!usuario) return;

    const valorActual = usuario[field] || '';
    const nuevoValor = prompt(`${placeholder}:`, valorActual);
    if (nuevoValor === null || nuevoValor.trim() === '') return;

    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoValor.trim())) {
      Toast.error('Correo no válido');
      return;
    }

    usuario[field] = nuevoValor.trim();
    await Auth.updateUser(usuario);
    Toast.success(`${field === 'name' ? 'Nombre' : 'Correo'} actualizado`);
    await this.renderizar();
  },

  async _updateAvatar(file) {
    if (!file.type.startsWith('image/')) { Toast.error('El archivo debe ser una imagen'); return; }
    if (file.size > 2 * 1024 * 1024) { Toast.error('La imagen no debe superar 2 MB'); return; }

    
    const urlDatos = await new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const SIZE = 200;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        
        const s = Math.min(img.width, img.height);
        const sx = (img.width  - s) / 2;
        const sy = (img.height - s) / 2;
        ctx.drawImage(img, sx, sy, s, s, 0, 0, SIZE, SIZE);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = url;
    });

    const usuario = await Auth.currentUser();
    if (!usuario) return;
    usuario.photoURL = urlDatos;
    await Auth.updateUser(usuario);
    Toast.success('Foto de perfil actualizada');
    await this.renderizar();
    if (typeof window.fillDrawerUser === 'function') await window.fillDrawerUser();
  },

  renderFavorites(usuario) {
    const equiposFav   = document.getElementById('fav-equipos-list');
    const jugadoresFav = document.getElementById('fav-jugadores-list');
    const favoritos       = usuario.favoritos || [];

    const equipos   = favoritos.filter(f => f.tipo === 'equipo');
    const jugadores = favoritos.filter(f => f.tipo === 'player');

    if (equiposFav) {
      equiposFav.innerHTML = equipos.length
        ? equipos.map(f => `
            <span class="fav-tag">
              ${f.flag || ''} ${f.name}
              <button data-id="${f.id}" data-tipo="equipo" title="Eliminar">✕</button>
            </span>`).join('')
        : '<span class="text-muted" style="font-size:0.8rem">Sin equipos favoritos</span>';
    }

    if (jugadoresFav) {
      jugadoresFav.innerHTML = jugadores.length
        ? jugadores.map(f => `
            <span class="fav-tag">
              ${f.flag || ''} ${f.name}
              <button data-id="${f.id}" data-tipo="player" title="Eliminar">✕</button>
            </span>`).join('')
        : '<span class="text-muted" style="font-size:0.8rem">Sin jugadores favoritos</span>';
    }

    
    const todosLosBtns = [
      ...(equiposFav?.querySelectorAll('button') || []),
      ...(jugadoresFav?.querySelectorAll('button') || [])
    ];
    todosLosBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        await this.removeFavorite(btn.dataset.id, btn.dataset.tipo);
      });
    });
  },

  renderBetHistory(usuario) {
    const history = document.getElementById('bet-history');
    if (!history) return;
    const preds = (usuario.predicciones || []).slice().reverse();

    if (!preds.length) {
      history.innerHTML = '<p class="empty-state" style="font-size:0.8rem">Sin predicciones aún</p>';
      return;
    }

    
    const victorias       = preds.filter(p => p.result === 'win').length;
    const derrotas     = preds.filter(p => p.result === 'loss').length;
    const totalGanado = preds.reduce((acc, p) => {
      if (p.exactCorrect) return acc + 3;
      if (p.result === 'win') return acc + 1;
      return acc;
    }, 0);

    const htmlResumen = `
      <div class="bet-summary" style="display:flex;gap:0.5rem;margin-bottom:0.6rem;padding:0.5rem 0.75rem;background:var(--surface-2,rgba(255,255,255,0.05));border-radius:8px;font-size:0.75rem;flex-wrap:wrap;">
        <span>🏆 <strong>${victorias}</strong> ganados</span>
        <span style="color:var(--text-muted)">·</span>
        <span>❌ <strong>${derrotas}</strong> perdidos</span>
        <span style="color:var(--text-muted)">·</span>
        <span style="color:var(--gold)">🎴 <strong>+${totalGanado}</strong> tiradas ganadas</span>
      </div>`;

    history.innerHTML = htmlResumen + preds.slice(0, 20).map(p => {
      const icon    = p.result === 'win' ? '✅' : p.result === 'loss' ? '❌' : '⏳';
      const tiradas = p.exactCorrect ? 3 : p.result === 'win' ? 1 : 0;
      const htmlRecompensa = tiradas > 0
        ? `<span class="bet-recompensa-insignia" style="font-size:0.65rem;background:rgba(255,193,7,0.15);color:var(--gold);border-radius:4px;padding:1px 5px;margin-left:4px">+${tiradas} 🎴</span>`
        : '';
      const insigniaExacta = p.exactCorrect
        ? `<span style="font-size:0.6rem;color:#4fc3f7;margin-left:4px">EXACTO</span>` : '';
      
      const htmlMarcador = p.finalScore
        ? `<span class="bet-score" style="font-size:0.65rem;color:var(--text-muted)">${p.finalHome || ''} ${p.finalScore} ${p.finalAway || ''}</span>`
        : '';
      
      const etiquetaPartido = (p.localPartido && p.matchAway)
        ? `${p.matchHomeFlag || ''} ${p.localPartido} vs ${p.matchAway} ${p.matchAwayFlag || ''}`
        : p.idPartido;
      return `
        <div class="bet-item">
          <div class="bet-left">
            <span class="bet-match">${etiquetaPartido}</span>
            <span class="bet-pick">${this._labelPick(p.pick)}${p.exacto ? ' · ' + p.exacto : ''}${insigniaExacta}</span>
            ${htmlMarcador}
          </div>
          <span class="bet-result ${p.result}">
            ${icon}${htmlRecompensa}
          </span>
        </div>
      `;
    }).join('');
  },

  _labelPick(p) {
    return { local:'Local', visitante:'Visitante', draw:'Empate' }[p] || p;
  },

  
  async addFavorite(item, tipo) {
    const usuario = await Auth.currentUser();
    if (!usuario) return;
    const favoritos = usuario.favoritos || [];
    if (favoritos.find(f => f.id === item.id && f.tipo === tipo)) {
      Toast.warn('Ya está en favoritos');
      return;
    }
    favoritos.push({ ...item, tipo });
    usuario.favoritos = favoritos;
    await Auth.updateUser(usuario);
    
    try { await DB.logActivity(usuario.email, 'add_favorite', `${tipo}: ${item.name}`); } catch(_) {}
    Toast.success(`⭐ ${item.name} agregado a favoritos`);
    
    this.renderFavorites(usuario);
  },

  async removeFavorite(id, tipo) {
    const usuario = await Auth.currentUser();
    if (!usuario) return;
    usuario.favoritos = (usuario.favoritos || []).filter(f => !(f.id === id && f.tipo === tipo));
    await Auth.updateUser(usuario);
    Toast.show('Eliminado de favoritos');
    this.renderFavorites(usuario);
  },

  
  async isFavorite(id, tipo = null) {
    const usuario = await Auth.currentUser();
    return (usuario?.favoritos || []).some(f => f.id === id && (tipo === null || f.tipo === tipo));
  },

  
  async exportData() {
    const usuario = await Auth.currentUser();
    if (!usuario) return;

    const objExportar = {
      version:      '2.2',
      exportedAt:   new Date().toISOString(),
      app:          'World Cup Collector UES',
      usuario:      usuario.name,
      email:        usuario.email,
      photoURL:     usuario.photoURL || null,
      tiradas:      usuario.tiradas,
      aciertos:     usuario.aciertos,
      monedas:      usuario.monedas || 0,
      contadorPity:    usuario.contadorPity || 0,
      battleWins:   usuario.battleWins   || 0,
      battleLosses: usuario.battleLosses || 0,
      exchangeLog:  usuario.exchangeLog  || [],
      lastDailyPull: usuario.lastDailyPull || null,
      lastDailySpin: usuario.lastDailySpin || null,
      figuritas: (usuario.figuritas || []).map(f => ({
        id:         f.id,
        nombre:     f.name,
        equipo:     f.equipo,
        rareza:     f.rareza,
        duplicados: f.duplicados || 0,
        obtenida:   f.obtenida
      })),
      favoritos:    usuario.favoritos || [],
      predicciones: (usuario.predicciones || []).map(p => ({
        idPartido:      p.idPartido,
        pick:         p.pick,
        exacto:        p.exacto,
        result:       p.result,
        exactCorrect: p.exactCorrect || false
      })),
      equipo_ideal: usuario.equipo_ideal || {},
      wcPrediction: usuario.wcPrediction || (() => {
        try { return JSON.parse(localStorage.getItem('wcc_wc_prediction') || 'null'); } catch(_) { return null; }
      })(),
      battleAttempts: (() => {
        
        const key = usuario.email ? `wcc_battle_attempts_${usuario.email}` : 'wcc_battle_attempts';
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

    const blob = new Blob([JSON.stringify(objExportar, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `wcc_${usuario.name.replace(/\s/g,'_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Toast.success('Datos exportados 📥');
    await DB.logActivity(usuario.email, 'export', 'JSON export');
  },

  
  async importData(file) {
    if (!file) return;
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      Toast.error('El archivo debe ser un JSON válido (.json)');
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      
      if (!data.usuario || !data.email || !Array.isArray(data.figuritas)) {
        Toast.error('Estructura del archivo inválida');
        return;
      }

      
      if (data.version && parseFloat(data.version) < 1.0) {
        Toast.error('Versión de archivo no compatible');
        return;
      }

      const usuario = await Auth.currentUser();
      if (!usuario)             { Toast.error('Inicia sesión primero'); return; }
      if (usuario.email !== data.email) {
        Toast.error(`El archivo pertenece a otro usuario (${data.email})`);
        return;
      }

      const confirmado = confirm(
        `¿Importar datos de "${data.usuario}"?\n` +
        `Figuritas: ${data.figuritas.length} | Tiradas: ${data.tiradas} | Monedas: ${data.monedas || 0}\n\n` +
        `⚠️ Esto REEMPLAZARÁ tu progreso actual de figuritas y tiradas.`
      );
      if (!confirmado) return;

      
      const pool   = Gacha.getPool();
      const combinados = data.figuritas.map(f => {
        const base = pool.find(p => p.id === f.id);
        return base
          ? { ...base, duplicados: f.duplicados || 0, obtenida: f.obtenida || new Date().toISOString() }
          : null;
      }).filter(Boolean);

      usuario.figuritas        = combinados;
      
      usuario.tiradas          = typeof data.tiradas === 'number' ? data.tiradas : (usuario.tiradas ?? 0);
      usuario.freeSpinsClaimed = true;
      usuario.aciertos         = Number(data.aciertos)  || usuario.aciertos;
      usuario.monedas          = typeof data.monedas === 'number' ? data.monedas : (usuario.monedas ?? 0);
      usuario.contadorPity        = Number(data.contadorPity) || 0;
      usuario.battleWins       = typeof data.battleWins   === 'number' ? data.battleWins   : (usuario.battleWins   ?? 0);
      usuario.battleLosses     = typeof data.battleLosses === 'number' ? data.battleLosses : (usuario.battleLosses ?? 0);
      usuario.exchangeLog      = Array.isArray(data.exchangeLog) ? data.exchangeLog : (usuario.exchangeLog || []);
      usuario.favoritos        = data.favoritos    || usuario.favoritos;
      usuario.predicciones     = data.predicciones || usuario.predicciones;
      usuario.equipo_ideal     = data.equipo_ideal || usuario.equipo_ideal;
      if (data.wcPrediction) {
        usuario.wcPrediction = data.wcPrediction;
        
        try { localStorage.setItem('wcc_wc_prediction', JSON.stringify(data.wcPrediction)); } catch(_) {}
      }
      
      if (data.usuario)  usuario.name     = data.usuario;
      if (data.photoURL) usuario.photoURL = data.photoURL;
      
      if (data.lastDailyPull) usuario.lastDailyPull = data.lastDailyPull;
      if (data.lastDailySpin) usuario.lastDailySpin = data.lastDailySpin;
      
      if (data.battleAttempts) {
        try {
          const key = usuario.email ? `wcc_battle_attempts_${usuario.email}` : 'wcc_battle_attempts';
          localStorage.setItem(key, JSON.stringify(data.battleAttempts));
          
          if (typeof IntentosPartido !== 'undefined') IntentosPartido.setUser(usuario.email);
        } catch(_) {}
      }
      
      if (data.minigameStats) {
        try {
          Object.entries(data.minigameStats).forEach(([k, v]) => {
            localStorage.setItem(k, JSON.stringify(v));
          });
        } catch(_) {}
      }

      await Auth.updateUser(usuario);
      await DB.logActivity(usuario.email, 'import', `JSON import v${data.version || '1.0'}`);
      Toast.success('✅ Datos importados correctamente');
      await App.loadUserData();
    } catch (err) {
      console.error('[Profile.importData]', err);
      Toast.error('Error al leer el archivo: ' + err.message);
    }
  }
};
