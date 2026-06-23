const IntentosPartido = {
  MAX_DAILY: 2,
  LS_KEY_PREFIX: 'wcc_battle_attempts',
  _email: '',   

  _todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  
  _lsKey() {
    return this._email ? `${this.LS_KEY_PREFIX}_${this._email}` : this.LS_KEY_PREFIX;
  },

  
  setUser(email) {
    this._email = email || '';
  },

  _load() {
    try {
      const raw = localStorage.getItem(this._lsKey());
      if (!raw) return null;
      const analizado = JSON.parse(raw);
      if (analizado.date !== this._todayStr()) return null; 
      return analizado;
    } catch(_) { return null; }
  },

  _save(data) {
    try { localStorage.setItem(this._lsKey(), JSON.stringify(data)); } catch(_) {}
  },

  
  remaining(category) {
    const data = this._load();
    if (!data) return this.MAX_DAILY;
    return Math.max(0, this.MAX_DAILY - (data.conteos[category] || 0));
  },

  
  consume(category) {
    let data = this._load() || { date: this._todayStr(), conteos: {} };
    const usado = data.conteos[category] || 0;
    if (usado >= this.MAX_DAILY) return false;
    data.conteos[category] = usado + 1;
    this._save(data);
    return true;
  },

  
  summaryHTML() {
    return ['classic','penalties','quiz','guess','connect'].map(cat => {
      const rem = this.remaining(cat);
      const etiqueta = { classic:'Clásica', penalties:'Penales', quiz:'Quiz', guess:'Adivina', connect:'Conecta', rival:'Rivales' }[cat];
      return `<span class="battle-attempts-insignia ${rem === 0 ? 'exhausted' : ''}">${etiqueta}: ${rem}/${this.MAX_DAILY}</span>`;
    }).join('');
  }
};

const FORMACIONES_DEF = {
  '4-3-3': {
    rows: [
      { etiqueta:'POR', slots:['POR'] },
      { etiqueta:'DEF', slots:['DEF','DEF','DEF','DEF'] },
      { etiqueta:'MED', slots:['MED','MED','MED'] },
      { etiqueta:'DEL', slots:['DEL','DEL','DEL'] }
    ]
  },
  '4-4-2': {
    rows: [
      { etiqueta:'POR', slots:['POR'] },
      { etiqueta:'DEF', slots:['DEF','DEF','DEF','DEF'] },
      { etiqueta:'MED', slots:['MED','MED','MED','MED'] },
      { etiqueta:'DEL', slots:['DEL','DEL'] }
    ]
  },
  '3-5-2': {
    rows: [
      { etiqueta:'POR', slots:['POR'] },
      { etiqueta:'DEF', slots:['DEF','DEF','DEF'] },
      { etiqueta:'MED', slots:['MED','MED','MED','MED','MED'] },
      { etiqueta:'DEL', slots:['DEL','DEL'] }
    ]
  }
};

const NOMBRES_CPU = [
  'Los Galácticos', 'FC Tormenta', 'Atlético Rayo',
  'Real Cosmos', 'Dragones FC', 'Thunder United',
  'Los Cóndores', 'Fénix SC', 'Estrella Blanca'
];

function generarEquipoCPU(formation = '4-3-3') {
  const pool = Gacha.getPool();
  const mezclar = arr => [...arr].sort(() => Math.random() - 0.5);

  const porPosicion = {
    POR: mezclar(pool.filter(f => f.pos === 'POR')),
    DEF: mezclar(pool.filter(f => f.pos === 'DEF')),
    MED: mezclar(pool.filter(f => f.pos === 'MED')),
    DEL: mezclar(pool.filter(f => f.pos === 'DEL')),
  };

  const idx = { POR:0, DEF:0, MED:0, DEL:0 };
  const rows = FORMACIONES_DEF[formation].rows;
  const jugadores = [];

  rows.forEach(row => {
    row.slots.forEach(pos => {
      const p = porPosicion[pos]?.[idx[pos]] || pool[Math.floor(Math.random()*pool.length)];
      idx[pos]++;
      jugadores.push({ ...p });
    });
  });

  const name = NOMBRES_CPU[Math.floor(Math.random() * NOMBRES_CPU.length)];
  return { name, formation, jugadores };
}

function generarEquipoAleatorio(coleccion, formation = '4-3-3') {
  if (!coleccion || coleccion.length < 5) return null;

  const mezclar = arr => [...arr].sort(() => Math.random() - 0.5);
  const porPosicion = {
    POR: mezclar(coleccion.filter(f => f.pos === 'POR')),
    DEF: mezclar(coleccion.filter(f => f.pos === 'DEF')),
    MED: mezclar(coleccion.filter(f => f.pos === 'MED')),
    DEL: mezclar(coleccion.filter(f => f.pos === 'DEL')),
  };

  const rows = FORMACIONES_DEF[formation].rows;
  const jugadores = [];

  rows.forEach(row => {
    row.slots.forEach(pos => {
      const pool = porPosicion[pos];
      const p = pool?.shift();
      if (p) jugadores.push({ ...p });
    });
  });

  return { name: 'Mi Equipo', formation, jugadores };
}

function poderEquipo(jugadores) {
  return jugadores.reduce((sum, p) => sum + (p.rating || 75), 0);
}

const Battle = {
  _state: null,

  async renderizar() {
    const usuario  = await Auth.currentUser();
    
    IntentosPartido.setUser(usuario?.email || '');
    const coleccion = usuario?.figuritas || [];
    const el    = document.getElementById('tab-battle');
    if (!el) return;

    if (coleccion.length < 5) {
      el.innerHTML = `
        <div class="section-header" style="justify-content:center;text-align:center"><h2><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-4px;margin-right:6px"><rect x="2" y="6" width="20" height="12" rx="6"/><path d="M6 12h4M8 10v4"/><circle cx="15" cy="11" r="1" fill="currentColor"/><circle cx="18" cy="13" r="1" fill="currentColor"/></svg>Minijuegos</h2></div>
        <div class="battle-empty">
          <div style="font-size:3rem;margin-bottom:1rem">🃏</div>
          <h3>Necesitas al menos 5 figuritas</h3>
          <p style="color:var(--text-muted)">Ve al sistema Gacha y obtén más figuritas para poder batallar</p>
          <button class="btn btn-primary" onclick="App.navigateTo('gacha')" style="margin-top:1rem">
            🎴 Ir a Gacha
          </button>
        </div>
      `;
      return;
    }

    el.innerHTML = `
      <div class="section-header">
        <h2 style="text-align:center;width:100%"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-4px;margin-right:6px"><rect x="2" y="6" width="20" height="12" rx="6"/><path d="M6 12h4M8 10v4"/><circle cx="15" cy="11" r="1" fill="currentColor"/><circle cx="18" cy="13" r="1" fill="currentColor"/></svg>Minijuegos</h2>
        <div class="battle-record" id="battle-record">
          🏆 <span id="br-victorias">${usuario.battleWins||0}</span>V
          💀 <span id="br-derrotas">${usuario.battleLosses||0}</span>D
        </div>
      </div>

      <div class="battle-modes">
        <div class="battle-mode-card ${IntentosPartido.remaining('classic') === 0 ? 'bmode-exhausted' : ''}" id="bmode-classic">
          <div class="bmode-icon">⚔</div>
          <div class="bmode-title">Batalla Clásica</div>
          <div class="bmode-desc">Compara ratings con factor suerte. Rápido y emocionante.</div>
          <div class="bmode-recompensa">+1 tirada al ganar</div>
          <div class="bmode-attempts">Intentos hoy: ${IntentosPartido.remaining('classic')}/${IntentosPartido.MAX_DAILY}</div>
        </div>
        <div class="battle-mode-card ${IntentosPartido.remaining('penalties') === 0 ? 'bmode-exhausted' : ''}" id="bmode-penalties">
          <div class="bmode-icon">🥅</div>
          <div class="bmode-title">Tanda de Penales</div>
          <div class="bmode-desc">3 penales cada uno. Minijuego de timing.</div>
          <div class="bmode-recompensa">+2 tiradas al ganar</div>
          <div class="bmode-attempts">Intentos hoy: ${IntentosPartido.remaining('penalties')}/${IntentosPartido.MAX_DAILY}</div>
        </div>
        <div class="battle-mode-card ${IntentosPartido.remaining('quiz') === 0 ? 'bmode-exhausted' : ''}" id="bmode-quiz">
          <div class="bmode-icon">🧠</div>
          <div class="bmode-title">Quiz Mundialista</div>
          <div class="bmode-desc">5 preguntas sobre el Mundial. Cada acierto suma puntos.</div>
          <div class="bmode-recompensa">+2 tiradas + monedas</div>
          <div class="bmode-attempts">Intentos hoy: ${IntentosPartido.remaining('quiz')}/${IntentosPartido.MAX_DAILY}</div>
        </div>
        <div class="battle-mode-card ${IntentosPartido.remaining('guess') === 0 ? 'bmode-exhausted' : ''}" id="bmode-guess">
          <div class="bmode-icon">🔮</div>
          <div class="bmode-title">Adivina por Emoji</div>
          <div class="bmode-desc">Mira el emoji característico e identifica al jugador entre 4 opciones. ¡Sin fallar!</div>
          <div class="bmode-recompensa">+1 tirada por acierto</div>
          <div class="bmode-attempts">Intentos hoy: ${IntentosPartido.remaining('guess')}/${IntentosPartido.MAX_DAILY}</div>
        </div>
        <div class="battle-mode-card ${IntentosPartido.remaining('connect') === 0 ? 'bmode-exhausted' : ''}" id="bmode-connect">
          <div class="bmode-icon">🔗</div>
          <div class="bmode-title">Conecta Jugador</div>
          <div class="bmode-desc">Une cada jugador con su selección. ¡Un fallo y se acaba!</div>
          <div class="bmode-recompensa">+2 tiradas si completas</div>
          <div class="bmode-attempts">Intentos hoy: ${IntentosPartido.remaining('connect')}/${IntentosPartido.MAX_DAILY}</div>
        </div>
      </div>

      <div class="battle-equipo-preview">
        <div class="battle-equipo-panel" id="battle-usuario-panel">
          <div class="btp-title">👤 Tu Equipo</div>
          <div class="btp-formation" id="btp-usuario-formation">Cargando...</div>
          <button class="btn btn-sm" id="btn-battle-random-equipo">🎲 Alineación aleatoria</button>
        </div>
        <div class="battle-vs-center">VS</div>
        <div class="battle-equipo-panel" id="battle-cpu-panel">
          <div class="btp-title">🤖 CPU</div>
          <div class="btp-formation" id="btp-cpu-formation">¿?</div>
          <button class="btn btn-sm" id="btn-battle-new-rival">🔀 Nuevo rival</button>
        </div>
      </div>
    `;

    
    const idealGuardado = usuario?.equipo_ideal || {};
    const formacionGuardada = usuario?.formacion || '4-3-3';
    const jugadoresIdeales = Album.buildIdealTeamPlayers
      ? Album.buildIdealTeamPlayers(coleccion, idealGuardado, formacionGuardada)
      : [];
    const tieneIdeal = jugadoresIdeales.length >= 5;
    const equipoInicialUsuario = tieneIdeal
      ? { name: 'Mi Equipo', formation: '4-3-3', jugadores: jugadoresIdeales }
      : (generarEquipoAleatorio(coleccion) || { name:'Mi Equipo', jugadores:coleccion.slice(0,11), formation:'4-3-3' });

    this._state = {
      equipoUsuario: equipoInicialUsuario,
      equipoCPU:  generarEquipoCPU(),
      usuario, coleccion,
      usingIdeal: tieneIdeal
    };
    this._renderTeamPanels();

    
    document.getElementById('bmode-classic').addEventListener('click', () => {
      if (!IntentosPartido.consume('classic')) {
        Toast.warn('Ya usaste los 2 intentos de Batalla Clásica hoy. Vuelve mañana.');
        return;
      }
      this.startClassicBattle();
    });
    document.getElementById('bmode-penalties').addEventListener('click', () => {
      if (!IntentosPartido.consume('penalties')) {
        Toast.warn('Ya usaste los 2 intentos de Penales hoy. Vuelve mañana.');
        return;
      }
      this.startPenaltyBattle();
    });
    document.getElementById('bmode-quiz').addEventListener('click', () => {
      if (!IntentosPartido.consume('quiz')) {
        Toast.warn('Ya usaste los 2 intentos de Quiz hoy. Vuelve mañana.');
        return;
      }
      this.startQuizBattle();
    });
    document.getElementById('bmode-guess').addEventListener('click', () => {
      if (!IntentosPartido.consume('guess')) {
        Toast.warn('Ya usaste los 2 intentos de Adivina el Jugador hoy. Vuelve mañana.');
        return;
      }
      this.startGuessPlayer();
    });
    document.getElementById('bmode-connect').addEventListener('click', () => {
      if (!IntentosPartido.consume('connect')) {
        Toast.warn('Ya usaste los 2 intentos de Conecta Jugador hoy. Vuelve mañana.');
        return;
      }
      this.startConnectPlayer();
    });
    document.getElementById('btn-battle-random-equipo').addEventListener('click', () => {
      if (this._state.usingIdeal) {
        
        const rnd = generarEquipoAleatorio(this._state.coleccion);
        if (rnd) { this._state.equipoUsuario = rnd; this._state.usingIdeal = false; }
        Toast.show('🎲 Alineación aleatoria');
      } else {
        
        const idealGuardado = this._state.usuario?.equipo_ideal || {};
        const ip = Album.buildIdealTeamPlayers
          ? Album.buildIdealTeamPlayers(this._state.coleccion, idealGuardado) : [];
        if (ip.length >= 5) {
          this._state.equipoUsuario = { name:'Mi Equipo', formation:'4-3-3', jugadores: ip };
          this._state.usingIdeal = true;
          Toast.success('✅ Equipo Ideal activo');
        } else {
          const rnd = generarEquipoAleatorio(this._state.coleccion);
          if (rnd) this._state.equipoUsuario = rnd;
          Toast.show('🎲 Nueva alineación aleatoria');
        }
      }
      this._renderTeamPanels();
      
      const btn = document.getElementById('btn-battle-random-equipo');
      if (btn) btn.textContent = this._state.usingIdeal ? '🎲 Modo aleatorio' : '📋 Mi Equipo Ideal';
    });
    const actualizarBtnRival = () => {
      const btnRival = document.getElementById('btn-battle-new-rival');
      if (!btnRival) return;
      const rem = IntentosPartido.remaining('rival');
      btnRival.textContent = `🔀 Nuevo rival (${rem}/3)`;
      btnRival.disabled = rem === 0;
      btnRival.style.opacity = rem === 0 ? '0.45' : '1';
    };
    actualizarBtnRival();

    document.getElementById('btn-battle-new-rival').addEventListener('click', () => {
      if (!IntentosPartido.consume('rival')) {
        Toast.warn('Ya cambiaste el rival 3 veces hoy. Vuelve mañana.');
        return;
      }
      this._state.equipoCPU = generarEquipoCPU();
      this._renderTeamPanels();
      actualizarBtnRival();
      Toast.show('🔀 Nuevo rival generado');
    });
  },

  _renderTeamPanels() {
    const { equipoUsuario, equipoCPU } = this._state;
    const poderUsuario = poderEquipo(equipoUsuario.jugadores);
    const poderCPU  = poderEquipo(equipoCPU.jugadores);

    document.getElementById('btp-usuario-formation').innerHTML = `
      <div class="btp-name">${equipoUsuario.name}</div>
      <div class="btp-formation-tag">${equipoUsuario.formation}</div>
      <div class="btp-jugadores">
        ${equipoUsuario.jugadores.slice(0,5).map(p => `
          <div class="btp-player">
            <span class="btp-emoji">${Array.isArray(p.emoji) ? p.emoji.join('') : (p.emoji||'⚽')}</span>
            <span class="btp-pname">${p.name.split(' ')[0]}</span>
            <span class="btp-rating ${p.rareza}">${p.rating||75}</span>
          </div>
        `).join('')}
        ${equipoUsuario.jugadores.length > 5 ? `<div style="font-size:0.7rem;color:var(--text-muted);text-align:center">+${equipoUsuario.jugadores.length-5} más</div>` : ''}
      </div>
      <div class="btp-power">⚡ Poder: <strong>${poderUsuario}</strong></div>
    `;

    document.getElementById('btp-cpu-formation').innerHTML = `
      <div class="btp-name">${equipoCPU.name}</div>
      <div class="btp-formation-tag">${equipoCPU.formation}</div>
      <div class="btp-jugadores">
        ${equipoCPU.jugadores.slice(0,5).map(p => `
          <div class="btp-player">
            <span class="btp-emoji">${Array.isArray(p.emoji) ? p.emoji.join('') : (p.emoji||'⚽')}</span>
            <span class="btp-pname">${p.name.split(' ')[0]}</span>
            <span class="btp-rating ${p.rareza}">${p.rating||75}</span>
          </div>
        `).join('')}
        ${equipoCPU.jugadores.length > 5 ? `<div style="font-size:0.7rem;color:var(--text-muted);text-align:center">+${equipoCPU.jugadores.length-5} más</div>` : ''}
      </div>
      <div class="btp-power">⚡ Poder: <strong>${poderCPU}</strong></div>
    `;
  },

  
  async startClassicBattle() {
    const { equipoUsuario, equipoCPU } = this._state;
    const poderUsuario = poderEquipo(equipoUsuario.jugadores) + Math.random() * 80;
    const poderCPU  = poderEquipo(equipoCPU.jugadores)  + Math.random() * 80;

    const vueltas = [];
    const compararPosiciones = ['POR','DEF','MED','DEL'];

    compararPosiciones.forEach(pos => {
      const jugadoresUsuario = equipoUsuario.jugadores.filter(p => p.pos === pos);
      const jugadoresCPU = equipoCPU.jugadores.filter(p => p.pos === pos);
      if (!jugadoresUsuario.length || !jugadoresCPU.length) return;

      const ratingUsuario = jugadoresUsuario.reduce((s,p) => s + (p.rating||75), 0) / jugadoresUsuario.length + Math.random()*15;
      const ratingCPU = jugadoresCPU.reduce((s,p) => s + (p.rating||75), 0) / jugadoresCPU.length + Math.random()*15;

      vueltas.push({
        pos,
        userScore: Math.vuelta(ratingUsuario),
        cpuScore:  Math.vuelta(ratingCPU),
        ganador:    ratingUsuario > ratingCPU ? 'usuario' : 'cpu'
      });
    });

    const victoriasUsuario = vueltas.filter(r => r.ganador === 'usuario').length;
    const ganoCPU  = vueltas.filter(r => r.ganador === 'cpu').length;
    const won = victoriasUsuario > ganoCPU;
    const sorteado = victoriasUsuario === ganoCPU;

    let recompensa = 0;
    if (won) recompensa = 1;
    else if (sorteado) recompensa = 0;

    await this._applyBattleResult(won, sorteado, recompensa);

    Modal.open(`
      <div class="battle-result-modal2">
        <div class="brm-header ${won ? 'win' : sorteado ? 'draw' : 'loss'}">
          ${won ? '🏆 ¡VICTORIA!' : sorteado ? '🤝 EMPATE' : '💀 DERROTA'}
        </div>
        <div class="brm-score">
          <span>${equipoUsuario.name} <strong>${victoriasUsuario}</strong></span>
          <span style="color:var(--text-muted)">vs</span>
          <span><strong>${ganoCPU}</strong> ${equipoCPU.name}</span>
        </div>
        <div class="brm-vueltas">
          ${vueltas.map(r => `
            <div class="brm-vuelta ${r.ganador === 'usuario' ? 'win' : 'loss'}">
              <span class="brm-pos">${r.pos}</span>
              <span class="brm-us">${r.userScore}</span>
              <span style="color:var(--text-muted)">vs</span>
              <span class="brm-cpu">${r.cpuScore}</span>
              <span>${r.ganador === 'usuario' ? '✅' : '❌'}</span>
            </div>
          `).join('')}
        </div>
        ${recompensa > 0 ? `<div class="brm-recompensa">🎴 +${recompensa} tirada ganada</div>` : ''}
        <button class="btn btn-primary" onclick="Modal.close();Battle.renderizar()" style="width:100%;margin-top:1rem">
          Continuar
        </button>
      </div>
    `);
  },

  
  async startPenaltyBattle() {
    let golesUsuario = 0, cpuGoals = 0;
    let vuelta = 0;
    const totalVueltas = 3; 

    const DIRS = ['↖️ Izq. arriba','⬆️ Centro','↗️ Der. arriba','↙️ Izq. abajo','⬇️ Raso centro','↘️ Der. abajo'];
    const DIRS_SHORT = ['Izq. arr.','Centro','Der. arr.','Izq. abajo','Raso','Der. abajo'];

    const mostrarResultado = (marcoUsuario, marcoCPU, onNext) => {
      const fondoGol = marcoUsuario ? 'goal-flash' : '';
      Modal.open(`
        <div style="text-align:center;padding:1rem 0" class="${fondoGol}">
          <div style="font-size:2.5rem;margin-bottom:0.3rem">
            <span class="${marcoUsuario ? 'ball-kick-anim' : ''}">⚽</span>
          </div>
          <div style="font-size:${marcoUsuario?'1.4rem':'1.1rem'};font-weight:900;color:${marcoUsuario?'#44ff88':'#ff4466'};font-family:'Bebas Neue',cursive;letter-spacing:1px;margin-bottom:0.3rem">
            ${marcoUsuario ? '🥅 ¡¡GOOOL!!' : '🧤 ¡Atajado!'}
          </div>
          <div style="display:flex;justify-content:center;gap:1.5rem;margin:0.4rem 0">
            <div>
              <div style="font-size:0.7rem;color:var(--text-muted)">CPU</div>
              <div style="font-size:0.9rem;color:${marcoCPU?'#ff8844':'#44ff88'};font-weight:700">
                ${marcoCPU ? '⚽ Gol' : '✋ ¡Atajaste!'}
              </div>
            </div>
          </div>
          <div style="font-size:2rem;font-family:'Bebas Neue',cursive;margin:0.5rem 0;letter-spacing:2px">
            ${golesUsuario} — ${cpuGoals}
          </div>
          <button class="btn btn-primary" style="margin-top:1rem;width:100%" id="next-penalty-btn">
            ${vuelta < totalVueltas ? `Ronda ${vuelta+1} →` : 'Ver resultado →'}
          </button>
        </div>
      `);
      setTimeout(() => {
        document.getElementById('next-penalty-btn')?.addEventListener('click', () => {
          Modal.close();
          setTimeout(onNext, 200);
        });
      }, 50);
    };

    
    const tirarCPU = (onDone) => {
      const dirDisparoCPU = Math.floor(Math.random() * 6); 
      const etiquetasDirCPU = ['↖️ Izq. arriba', '⬆️ Centro', '↗️ Der. arriba', '↙️ Izq. abajo', '⬇️ Raso centro', '↘️ Der. abajo'];
      Modal.open(`
        <div style="text-align:center;padding:0.5rem 0">
          <div style="font-size:1.8rem;margin-bottom:0.3rem">🥅</div>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem">
            <strong>¡La CPU va a disparar!</strong><br>
            Elige hacia dónde tirarte:
          </p>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.4rem;max-width:280px;margin:0 auto">
            ${etiquetasDirCPU.map((etiqueta, i) => `
              <button class="penalty-save-btn btn btn-secondary" data-dir="${i}"
                style="padding:0.5rem 0.2rem;font-size:0.72rem">
                ${etiqueta}
              </button>
            `).join('')}
          </div>
        </div>
      `);
      setTimeout(() => {
        document.querySelectorAll('.penalty-save-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const dirAtajeUsuario = parseInt(btn.dataset.dir);
            const marcoCPU = (dirAtajeUsuario !== dirDisparoCPU); 
            if (marcoCPU) cpuGoals++;
            Modal.close();
            setTimeout(() => onDone(marcoCPU), 200);
          });
        });
      }, 50);
    };

    const hacerRonda = () => {
      if (vuelta >= totalVueltas) {
        this._endPenaltyBattle(golesUsuario, cpuGoals);
        return;
      }
      vuelta++;

      
      Modal.open(`
        <div style="text-align:center;padding:0.5rem 0">
          <div style="font-family:'Bebas Neue',cursive;font-size:1.2rem;color:var(--text-muted);margin-bottom:0.5rem">
            RONDA ${vuelta} DE ${totalVueltas}
          </div>
          <div style="font-size:2rem;margin:0.3rem 0">⚽ Tu turno de disparar</div>
          <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.8rem">
            Marcador: <strong>${golesUsuario}</strong> - <strong>${cpuGoals}</strong>
          </div>
          <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:0.8rem">
            ¿Hacia dónde pateas?
          </p>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.4rem;max-width:280px;margin:0 auto">
            ${DIRS.map((dir, i) => `
              <button class="penalty-dir-btn btn btn-secondary" data-dir="${i}"
                style="padding:0.5rem 0.2rem;font-size:0.72rem">
                ${dir}
              </button>
            `).join('')}
          </div>
        </div>
      `);

      setTimeout(() => {
        document.querySelectorAll('.penalty-dir-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const dirUsuario    = parseInt(btn.dataset.dir);
            const dirAtajeCPU = Math.floor(Math.random() * 6);
            const marcoUsuario = (dirUsuario !== dirAtajeCPU) || Math.random() > 0.25;
            if (marcoUsuario) golesUsuario++;
            Modal.close();

            
            setTimeout(() => {
              tirarCPU((marcoCPU) => {
                mostrarResultado(marcoUsuario, marcoCPU, hacerRonda);
              });
            }, 200);
          });
        });
      }, 50);
    };

    hacerRonda();
  },

  async _endPenaltyBattle(golesUsuario, cpuGoals) {
    const won   = golesUsuario > cpuGoals;
    const sorteado = golesUsuario === cpuGoals;
    const recompensa = won ? 2 : sorteado ? 1 : 0;
    await this._applyBattleResult(won, sorteado, recompensa);

    setTimeout(() => {
      Modal.open(`
        <div class="battle-result-modal2">
          <div class="brm-header ${won ? 'win' : sorteado ? 'draw' : 'loss'}">
            ${won ? '🏆 ¡GANASTE LA TANDA!' : sorteado ? '🤝 EMPATE' : '💀 LA PERDISTE'}
          </div>
          <div class="brm-score" style="font-size:2rem;font-family:'Bebas Neue',cursive;letter-spacing:4px">
            ${golesUsuario} — ${cpuGoals}
          </div>
          <div style="font-size:0.85rem;color:var(--text-muted);margin:0.5rem 0">Penales marcados</div>
          ${recompensa > 0 ? `<div class="brm-recompensa">🎴 +${recompensa} tirada${recompensa>1?'s':''} ganada${recompensa>1?'s':''}</div>` : ''}
          <button class="btn btn-primary" onclick="Modal.close();Battle.renderizar()" style="width:100%;margin-top:1rem">
            Continuar
          </button>
        </div>
      `);
    }, 200);
  },

  
  _quizQuestions: [
    { q:'¿En qué año se jugó el primer Mundial de Fútbol?',        opts:['1920','1926','1930','1934'],              ans:2 },
    { q:'¿Qué país tiene más Mundiales ganados (5)?',              opts:['Alemania','Italia','Argentina','Brasil'],  ans:3 },
    { q:'¿Quién es el máximo goleador histórico del Mundial?',     opts:['Ronaldo','Pelé','Gerd Müller','Miroslav Klose'], ans:3 },
    { q:'¿Cuántos países participan en el Mundial 2026?',          opts:['32','36','40','48'],                      ans:3 },
    { q:'¿Dónde se juega el partido inaugural del Mundial 2026?',  opts:['SoFi Stadium','MetLife','AT&T Stadium','Estadio Azteca'], ans:3 },
    { q:'¿Qué selección ganó el Mundial 2022?',                    opts:['Francia','Brasil','Croacia','Argentina'], ans:3 },
    { q:'¿Cuántos goles marcó Messi en el Mundial 2022?',          opts:['5','6','8','7'],                          ans:3 },
    { q:'¿Qué jugador tiene más Mundiales ganados (5)?',           opts:['Ronaldo','Maradona','Zidane','Pelé'],      ans:3 },
    { q:'¿En qué año ganó España su único Mundial?',               opts:['2006','2014','2018','2010'],               ans:3 },
    { q:'¿Quién fue el portero de Argentina en Qatar 2022?',       opts:['Romero','Armani','Rulli','E. Martínez'],  ans:3 },
    { q:'¿Qué selección no clasificó al Mundial 2026?',            opts:['Argentina','Brasil','México','Italia'],    ans:3 },
    { q:'¿En qué país NO se jugará el Mundial 2026?',              opts:['México','Canadá','Estados Unidos','Colombia'], ans:3 },
    { q:'¿Cuál es el apodo del Estadio Azteca?',                   opts:['La Bombonera','Camp Nou','Bernabéu','El Coloso de Santa Úrsula'], ans:3 },
    { q:'¿Cuántas ediciones del Mundial hasta 2026?',              opts:['21','22','24','23'],                      ans:3 },
    { q:'¿Quién ganó el Balón de Oro del Mundial 2022?',           opts:['Mbappé','Di María','Modric','Messi'],     ans:3 },
    { q:'¿Quién es el DT de Argentina campeón en 2022?',           opts:['Bielsa','Sabella','Basile','Scaloni'],    ans:3 },
    { q:'¿Cuántos goles marcó Haaland en la temporada 22/23?',     opts:['30','35','38','52'],                      ans:3 },
    { q:'¿De qué país es Kylian Mbappé?',                          opts:['Bélgica','Senegal','Costa de Marfil','Francia'], ans:3 },
    { q:'¿En qué posición juega Rodri?',                           opts:['Extremo','Delantero','Defensa','Mediocampista defensivo'], ans:3 },
    { q:'¿Qué equipo ganó la Champions 2024?',                     opts:['Bayern','PSG','Arsenal','Real Madrid'],   ans:3 },
    
    { q:'¿Cuántas sedes tiene el Mundial 2026?',                   opts:['12','14','16','11'],                      ans:1 },
    { q:'¿Cuál es la sede canadiense del Mundial 2026?',           opts:['Ottawa','Montreal','Toronto','Vancouver'], ans:2 },
    { q:'¿Cuántos partidos tendrá el Mundial 2026?',               opts:['64','80','96','104'],                     ans:2 },
    { q:'¿Qué formato de grupos usa el Mundial 2026?',             opts:['8 grupos de 6','12 grupos de 4','8 grupos de 4','16 grupos de 3'], ans:1 },
    { q:'¿Cuál es el estadio de la final del Mundial 2026?',       opts:['SoFi Stadium','Rose Bowl','MetLife Stadium','AT&T Stadium'], ans:2 },
    
    { q:'¿Qué país organizó el Mundial 2022?',                     opts:['Emiratos Árabes','Arabia Saudita','Kuwait','Catar'], ans:3 },
    { q:'¿Quién marcó el "Gol del Siglo" en 1986?',                opts:['Platini','Zico','Maradona','Butcher'],    ans:2 },
    { q:'¿Cuántas veces ha sido anfitrión Brasil del Mundial?',    opts:['1','2','3','4'],                          ans:1 },
    { q:'¿Qué equipo europeo ha ganado más Mundiales (4)?',        opts:['Francia','España','Alemania','Italia'],   ans:3 },
    { q:'¿En qué Mundial se usó el VAR por primera vez?',          opts:['Rusia 2018','Brasil 2014','Catar 2022','Francia 1998'], ans:0 },
    { q:'¿Cuál fue el primer Mundial celebrado en Asia?',          opts:['Japón/Corea 2002','China 2030','Catar 2022','Australia 2023'], ans:0 },
    { q:'¿Cuántos penaltis erró Baggio en la final del 94?',       opts:['0','1','2','3'],                          ans:1 },
    { q:'¿Qué jugador ganó el Balón de Oro 2023?',                 opts:['Benzema','Messi','Mbappé','Haaland'],     ans:1 },
    
    { q:'¿Qué selección tiene el récord de goles en un solo Mundial (27)?', opts:['Brasil','Hungría','Francia','Alemania'], ans:1 },
    { q:'¿Cuántos goles marcó Mbappé en el Mundial 2022?',         opts:['6','7','8','9'],                          ans:2 },
    { q:'¿Qué selección llegó a la final del Mundial 2022?',       opts:['Brasil','Portugal','Francia','Marruecos'], ans:2 },
    { q:'¿Cuál es la selección con más participaciones mundialistas?', opts:['Brasil','Alemania','Italia','Argentina'], ans:0 },
    { q:'¿Qué portero ganó el Guante de Oro en Qatar 2022?',       opts:['Courtois','Alisson','Lloris','E. Martínez'], ans:3 },
    { q:'¿Qué selección fue eliminada en grupos en Qatar 2022 como gran sorpresa?', opts:['Alemania','España','Bélgica','Uruguay'], ans:0 },
    
    { q:'¿Cuántas Champions League tiene el Real Madrid?',         opts:['13','14','15','16'],                      ans:2 },
    { q:'¿Qué club ganó la Premier 2023-24?',                      opts:['Arsenal','Liverpool','Man City','Chelsea'], ans:2 },
    { q:'¿En qué estadio se jugó la final de la Champions 2024?',  opts:['Wembley','Bernabéu','Allianz Arena','Estadio Olímpico de Londres'], ans:0 },
    { q:'¿Quién fue el máximo goleador de La Liga 2023-24?',       opts:['Vinícius','Bellingham','Lewandowski','Artem Dovbyk'], ans:3 },
    { q:'¿Qué equipo ganó la Libertadores 2023?',                  opts:['Fluminense','Boca Juniors','River Plate','Atlético Mineiro'], ans:0 },
    
    { q:'¿Cuántos árbitros participan en un partido oficial FIFA actualmente (con VAR)?', opts:['4','5','6','7'], ans:2 },
    { q:'¿Qué medida tiene el campo de fútbol según FIFA (largo máx.)?', opts:['100m','110m','120m','130m'],        ans:2 },
    { q:'¿Qué jugador tiene más seguidores en Instagram (fútbol)?', opts:['Mbappé','Ronaldo','Messi','Neymar'],     ans:1 },
    { q:'¿Cuántos minutos dura la prórroga en un partido de fútbol?', opts:['20','25','30','40'],                   ans:2 },
    { q:'¿Qué selección tiene el uniforme más antiguo del mundo (desde 1872)?', opts:['Inglaterra','Escocia','Gales','Irlanda'], ans:1 },
    { q:'¿Qué selección ganó la Copa América 2024?',               opts:['Brasil','Colombia','Uruguay','Argentina'], ans:3 },
  ],

  async startQuizBattle() {
    const preguntas = [...this._quizQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
    let score = 0;
    let qi = 0;

    const hacerPregunta = () => {
      if (qi >= preguntas.length) {
        this._endQuizBattle(score, preguntas.length);
        return;
      }
      const q = preguntas[qi];
      const opcionesMezcladas = [...q.opts].map((o, i) => ({ text: o, orig: i }))
                            .sort(() => Math.random() - 0.5);
      qi++;

      Modal.open(`
        <div style="padding:0.5rem 0">
          <div style="font-size:0.7rem;color:var(--text-muted);font-family:'Barlow Condensed',sans-serif;letter-spacing:2px;margin-bottom:0.5rem">
            PREGUNTA ${qi} DE ${preguntas.length} · ${score} pts
          </div>
          <div class="quiz-progress-bar">
            <div class="quiz-progress-fill" style="width:${((qi-1)/preguntas.length)*100}%"></div>
          </div>
          <p style="font-size:0.95rem;font-weight:600;color:var(--text-primary);margin:0.75rem 0;line-height:1.4">
            ${q.q}
          </p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-top:0.75rem">
            ${opcionesMezcladas.map(opt => `
              <button class="quiz-opt-btn" data-orig="${opt.orig}" style="text-align:left;font-size:0.8rem">
                ${opt.text}
              </button>
            `).join('')}
          </div>
        </div>
      `);

      setTimeout(() => {
        document.querySelectorAll('.quiz-opt-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const elegido = parseInt(btn.dataset.orig);
            const correcto = elegido === q.ans;
            if (correcto) score++;

            
            document.querySelectorAll('.quiz-opt-btn').forEach(b => {
              const esCorrect = parseInt(b.dataset.orig) === q.ans;
              b.style.background = esCorrect ? 'rgba(68,255,136,0.2)' : (b === btn && !correcto ? 'rgba(255,68,102,0.2)' : '');
              b.style.borderColor = esCorrect ? '#44ff88' : (b === btn && !correcto ? '#ff4466' : '');
              b.disabled = true;
            });

            
            if (correcto) {
              const rect = btn.getBoundingClientRect();
              const el = document.createElement('div');
              el.className = 'points-float';
              el.textContent = '+1 pt ✓';
              el.style.cssText = `top:${rect.top - 10}px;left:${rect.left + rect.width/2 - 30}px`;
              document.body.appendChild(el);
              setTimeout(() => el.remove(), 1100);
            }

            setTimeout(() => {
              Modal.close();
              setTimeout(hacerPregunta, 200);
            }, 1000);
          });
        });
      }, 50);
    };

    hacerPregunta();
  },

  async _endQuizBattle(score, total) {
    const won   = score >= Math.ceil(total * 0.6); 
    const sorteado = score === Math.floor(total / 2);
    const tiradas = score >= total ? 3 : score >= Math.ceil(total*0.6) ? 2 : score > 0 ? 1 : 0;
    const monedas = score * 5;
    await this._applyBattleResult(won, sorteado, tiradas, monedas);

    setTimeout(() => {
      Modal.open(`
        <div class="battle-result-modal2">
          <div class="brm-header ${won ? 'win' : score > 0 ? 'draw' : 'loss'}">
            ${score >= total ? '🧠 ¡PERFECTO!' : won ? '🏆 ¡MUY BIEN!' : score > 0 ? '📚 BUEN INTENTO' : '💀 A ESTUDIAR MÁS'}
          </div>
          <div class="brm-score" style="font-size:2.5rem;font-family:'Bebas Neue',cursive">
            ${score}/${total}
          </div>
          <div style="font-size:0.8rem;color:var(--text-muted);margin:0.25rem 0">respuestas correctas</div>
          <div style="margin:1rem 0">
            ${Array.from({length:total}, (_,i) => `
              <span style="font-size:1.2rem">${i < score ? '✅' : '❌'}</span>
            `).join('')}
          </div>
          <div class="brm-recompensa">
            ${tiradas > 0 ? `🎴 +${tiradas} tirada${tiradas>1?'s':''}` : ''}
            ${monedas > 0 ? `&nbsp;&nbsp;💰 +${monedas} monedas` : ''}
          </div>
          <button class="btn btn-primary" onclick="Modal.close();Battle.renderizar()" style="width:100%;margin-top:1rem">
            Continuar
          </button>
        </div>
      `);
    }, 200);
  },

  
  async startGuessPlayer() {
    const todasFiguritas = Gacha.getPool();
    if (!todasFiguritas.length) { Toast.error('No hay jugadores disponibles'); return; }

    const aAdivinar = [...todasFiguritas].sort(() => Math.random() - 0.5).slice(0, 5);
    let score = 0;
    let indPregunta = 0;

    const hacerPregunta = () => {
      if (indPregunta >= aAdivinar.length) {
        return this._endGuessPlayer(score, aAdivinar.length);
      }
      const correcto = aAdivinar[indPregunta];
      const incorrecto = todasFiguritas.filter(f => f.id !== correcto.id)
                            .sort(() => Math.random() - 0.5).slice(0, 3);
      const opciones = [...incorrecto, correcto].sort(() => Math.random() - 0.5);

      const htmlOpciones = opciones.map(opt =>
        `<button class="btn guess-opt-btn" data-id="${opt.id}" style="font-size:0.78rem;padding:0.5rem">${opt.name}</button>`
      ).join('');

      Modal.open(`
        <div style="text-align:center;padding:0.5rem">
          <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.5rem">Jugador ${indPregunta+1} de ${aAdivinar.length} · Aciertos: ${score}</div>
          <div class="guess-emoji-circle">
            <span class="guess-emoji-pop">${Array.isArray(correcto.emoji) ? correcto.emoji.join(' ') : (correcto.emoji || '❓')}</span>
          </div>
          <p style="margin-bottom:0.75rem;font-weight:600">¿Quién es este jugador?</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem">
            ${htmlOpciones}
          </div>
        </div>
      `);

      setTimeout(() => {
        document.querySelectorAll('.guess-opt-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const esCorrect = btn.dataset.id === correcto.id;
            if (esCorrect) score++;
            document.querySelectorAll('.guess-opt-btn').forEach(b => {
              b.style.background = b.dataset.id === correcto.id
                ? 'rgba(68,255,136,0.25)'
                : (b === btn && !esCorrect ? 'rgba(255,68,102,0.2)' : '');
              b.style.borderColor = b.dataset.id === correcto.id
                ? '#44ff88'
                : (b === btn && !esCorrect ? '#ff4466' : '');
              b.disabled = true;
            });
            setTimeout(() => {
              Modal.close();
              indPregunta++;
              setTimeout(hacerPregunta, 200);
            }, 900);
          });
        });
      }, 50);
    };

    hacerPregunta();
  },

  async _endGuessPlayer(score, total) {
    const tiradas = score;
    const won = score >= Math.ceil(total * 0.6);
    await this._applyBattleResult(won, false, tiradas, 0);
    setTimeout(() => {
      Modal.open(`
        <div class="battle-result-modal2">
          <div class="brm-header ${won ? 'win' : score > 0 ? 'draw' : 'loss'}">
            ${score === total ? '🎯 ¡PERFECTO!' : won ? '👤 ¡BIEN HECHO!' : score > 0 ? '👤 BUEN INTENTO' : '😅 ¡A PRACTICAR!'}
          </div>
          <div class="brm-score" style="font-size:2.5rem;font-family:'Bebas Neue',cursive">${score}/${total}</div>
          <div style="font-size:0.8rem;color:var(--text-muted);margin:0.25rem 0">jugadores adivinados</div>
          <div class="brm-recompensa">${tiradas > 0 ? `🎴 +${tiradas} tirada${tiradas>1?'s':''}` : 'Sin recompensa esta vez'}</div>
          <button class="btn btn-primary" onclick="Modal.close();Battle.renderizar()" style="width:100%;margin-top:1rem">Continuar</button>
        </div>
      `);
    }, 200);
  },

  
  async startConnectPlayer() {
    const todasFiguritas = Gacha.getPool();
    if (!todasFiguritas.length) { Toast.error('No hay jugadores disponibles'); return; }

    const porEquipo = {};
    todasFiguritas.forEach(f => { (porEquipo[f.equipo] = porEquipo[f.equipo] || []).push(f); });
    const equipos = Object.keys(porEquipo).sort(() => Math.random() - 0.5).slice(0, 6);
    const jugadores = equipos.map(t => porEquipo[t][Math.floor(Math.random()*porEquipo[t].length)]);

    const jugadoresMezclados = [...jugadores].sort(() => Math.random() - 0.5).map(p => Object.assign({}, p));
    const equiposMezclados   = [...jugadores].sort(() => Math.random() - 0.5).map(p => ({ name: p.equipo, flag: p.flag }));

    let jugadorSeleccionado = null;
    let coincidio = 0;
    const self = this;

    const renderizar = () => {
      const jugadoresActivos = jugadoresMezclados.filter(p => !p._matched);
      const equiposActivos   = equiposMezclados.filter(t => !t._matched);

      const htmlJugadores = jugadoresActivos.map((p, i) =>
        `<button class="btn connect-player-btn connect-card-in" style="animation-delay:${i*0.05}s"
           data-idx="${jugadoresMezclados.indexOf(p)}"
           ${jugadorSeleccionado && jugadorSeleccionado.id === p.id ? 'data-seleccionado="1"' : ''}>
           ${p.name}
         </button>`
      ).join('');

      const htmlEquipos = equiposActivos.map((t, i) =>
        `<button class="btn connect-equipo-btn connect-card-in" style="animation-delay:${i*0.05}s"
           data-idx="${equiposMezclados.indexOf(t)}">
           ${t.flag} ${t.name}
         </button>`
      ).join('');

      Modal.open(`
        <div style="padding:0.5rem">
          <div class="connect-progress">
            <div class="connect-progress-etiqueta">Empareja jugador con selección · ${coincidio}/${jugadores.length} correctos</div>
            <div class="connect-progress-bar"><div class="connect-progress-fill" style="width:${(coincidio/jugadores.length)*100}%"></div></div>
          </div>
          <div class="connect-grid">
            <div>${htmlJugadores}</div>
            <div>${htmlEquipos}</div>
          </div>
          <div style="text-align:center;font-size:0.7rem;color:var(--text-muted);margin-top:0.5rem">
            Toca un jugador y luego su selección
          </div>
        </div>
      `);

      
      document.querySelectorAll('.connect-player-btn[data-seleccionado="1"]').forEach(b => b.classList.add('connect-seleccionado'));

      setTimeout(() => {
        document.querySelectorAll('.connect-player-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            jugadorSeleccionado = jugadoresMezclados[parseInt(btn.dataset.idx)];
            renderizar();
          });
        });

        document.querySelectorAll('.connect-equipo-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            if (!jugadorSeleccionado) { Toast.show('Selecciona un jugador primero'); return; }
            const datosEquipo = equiposMezclados[parseInt(btn.dataset.idx)];
            const esCorrect = jugadorSeleccionado.equipo === datosEquipo.name;
            const btnJugador = document.querySelector(`.connect-player-btn[data-idx="${jugadoresMezclados.indexOf(jugadorSeleccionado)}"]`);

            if (esCorrect) {
              jugadorSeleccionado._matched = true;
              datosEquipo._matched = true;
              coincidio++;
              Toast.success(`✅ ¡Correcto! ${jugadorSeleccionado.name} → ${datosEquipo.flag} ${datosEquipo.name}`);
              btn.classList.add('connect-correcto');
              btnJugador?.classList.add('connect-correcto');
              const eraUltimo = coincidio >= jugadores.length;
              jugadorSeleccionado = null;
              setTimeout(() => {
                if (eraUltimo) { Modal.close(); self._endConnectPlayer(true, coincidio); }
                else renderizar();
              }, 350);
            } else {
              Toast.error(`❌ ¡Incorrecto! ${jugadorSeleccionado.name} no juega en ${datosEquipo.flag} ${datosEquipo.name}`);
              btn.classList.add('connect-incorrecto');
              btnJugador?.classList.add('connect-incorrecto');
              setTimeout(() => {
                Modal.close();
                setTimeout(() => self._endConnectPlayer(false, coincidio), 200);
              }, 450);
            }
          });
        });
      }, 50);
    };

    renderizar();
  },

  async _endConnectPlayer(won, coincidio) {
    const tiradas = won ? 2 : coincidio >= 3 ? 1 : 0;
    await this._applyBattleResult(won, false, tiradas, won ? 20 : 0);
    setTimeout(() => {
      Modal.open(`
        <div class="battle-result-modal2">
          <div class="brm-header ${won ? 'win' : coincidio > 0 ? 'draw' : 'loss'}">
            ${won ? '🔗 ¡PERFECTO!' : coincidio >= 3 ? '🔗 BUEN INTENTO' : '💀 FALLASTE'}
          </div>
          <div class="brm-score" style="font-size:2.5rem;font-family:'Bebas Neue',cursive">${coincidio}</div>
          <div style="font-size:0.8rem;color:var(--text-muted);margin:0.25rem 0">conexiones correctas</div>
          <div class="brm-recompensa">${tiradas > 0 ? `🎴 +${tiradas} tirada${tiradas>1?'s':''}` : 'Sin recompensa esta vez'}</div>
          <button class="btn btn-primary" onclick="Modal.close();Battle.renderizar()" style="width:100%;margin-top:1rem">Continuar</button>
        </div>
      `);
    }, 200);
  },

  
  async _applyBattleResult(won, sorteado, tiradas = 0, monedas = 0) {
    const usuario = await Auth.currentUser();
    if (!usuario) return;

    if (won)  usuario.battleWins   = (usuario.battleWins   || 0) + 1;
    else      usuario.battleLosses = (usuario.battleLosses || 0) + 1;

    if (tiradas > 0) usuario.tiradas = (usuario.tiradas || 0) + tiradas;
    if (monedas > 0) usuario.monedas = (usuario.monedas || 0) + monedas;

    await Auth.updateUser(usuario);
    await DB.logActivity(usuario.email, 'battle', `${won?'victoria':'derrota'} +${tiradas}🎴 +${monedas}💰`);
    if (typeof App !== 'undefined') await App.refreshHeader();
    if (tiradas > 0) Toast.success(`⚔️ Batalla terminada! +${tiradas} tirada${tiradas>1?'s':''}${monedas>0?` +${monedas}💰`:''}`);
  }
};
