/**
 * battle.js — Sistema de Batallas de Alineaciones  v8
 *
 * Flujo:
 * 1. El usuario tiene su equipo ideal guardado (o se genera uno random de sus figuritas)
 * 2. El rival es una alineación CPU generada del pool global
 * 3. Se resuelve con minijuegos:
 *    - Penales (3 turnos, el que más mete gana)
 *    - Tiro libre (timing)
 *    - Jugador vs Jugador (comparar ratings + azar)
 * 4. Recompensas: tiradas + monedas
 *
 * v8: Límite de 3 intentos por categoría por día.
 *     Cada intento se consume siempre, gane o pierda.
 */

/* ─── Límite diario de intentos por categoría ──────────────────────────────
   Cada categoría (classic, penalties, quiz) tiene máx. 3 intentos por día.
   El intento se consume al INICIAR el juego, no al terminar.
   Almacenado en localStorage: { date, counts: { classic:0, penalties:0, quiz:0 } }
─────────────────────────────────────────────────────────────────────────── */
const BattleAttempts = {
  MAX_DAILY: 3,
  LS_KEY: 'wcc_battle_attempts',

  _todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  _load() {
    try {
      const raw = localStorage.getItem(this.LS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.date !== this._todayStr()) return null; // nuevo día
      return parsed;
    } catch(_) { return null; }
  },

  _save(data) {
    try { localStorage.setItem(this.LS_KEY, JSON.stringify(data)); } catch(_) {}
  },

  /** Devuelve cuántos intentos quedan para la categoría hoy. */
  remaining(category) {
    const data = this._load();
    if (!data) return this.MAX_DAILY;
    return Math.max(0, this.MAX_DAILY - (data.counts[category] || 0));
  },

  /** Consume un intento. Devuelve false si ya no hay intentos disponibles. */
  consume(category) {
    let data = this._load() || { date: this._todayStr(), counts: {} };
    const used = data.counts[category] || 0;
    if (used >= this.MAX_DAILY) return false;
    data.counts[category] = used + 1;
    this._save(data);
    return true;
  },

  /** Resumen legible de intentos restantes para la UI. */
  summaryHTML() {
    return ['classic','penalties','quiz'].map(cat => {
      const rem = this.remaining(cat);
      const label = { classic:'Clásica', penalties:'Penales', quiz:'Quiz' }[cat];
      return `<span class="battle-attempts-badge ${rem === 0 ? 'exhausted' : ''}">${label}: ${rem}/${this.MAX_DAILY}</span>`;
    }).join('');
  }
};

const FORMATIONS_DEF = {
  '4-3-3': {
    rows: [
      { label:'POR', slots:['POR'] },
      { label:'DEF', slots:['DEF','DEF','DEF','DEF'] },
      { label:'MED', slots:['MED','MED','MED'] },
      { label:'DEL', slots:['DEL','DEL','DEL'] }
    ]
  },
  '4-4-2': {
    rows: [
      { label:'POR', slots:['POR'] },
      { label:'DEF', slots:['DEF','DEF','DEF','DEF'] },
      { label:'MED', slots:['MED','MED','MED','MED'] },
      { label:'DEL', slots:['DEL','DEL'] }
    ]
  },
  '3-5-2': {
    rows: [
      { label:'POR', slots:['POR'] },
      { label:'DEF', slots:['DEF','DEF','DEF'] },
      { label:'MED', slots:['MED','MED','MED','MED','MED'] },
      { label:'DEL', slots:['DEL','DEL'] }
    ]
  }
};

const CPU_TEAM_NAMES = [
  'Los Galácticos', 'FC Tormenta', 'Atlético Rayo',
  'Real Cosmos', 'Dragones FC', 'Thunder United',
  'Los Cóndores', 'Fénix SC', 'Estrella Blanca'
];

/* Generar alineación random de CPU del pool de figuritas */
function generateCpuTeam(formation = '4-3-3') {
  const pool = Gacha.getPool();
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

  const byPos = {
    POR: shuffle(pool.filter(f => f.pos === 'POR')),
    DEF: shuffle(pool.filter(f => f.pos === 'DEF')),
    MED: shuffle(pool.filter(f => f.pos === 'MED')),
    DEL: shuffle(pool.filter(f => f.pos === 'DEL')),
  };

  const idx = { POR:0, DEF:0, MED:0, DEL:0 };
  const rows = FORMATIONS_DEF[formation].rows;
  const players = [];

  rows.forEach(row => {
    row.slots.forEach(pos => {
      const p = byPos[pos]?.[idx[pos]] || pool[Math.floor(Math.random()*pool.length)];
      idx[pos]++;
      players.push({ ...p });
    });
  });

  const name = CPU_TEAM_NAMES[Math.floor(Math.random() * CPU_TEAM_NAMES.length)];
  return { name, formation, players };
}

/* Generar alineación random del usuario (de sus figuritas) */
function generateUserRandomTeam(owned, formation = '4-3-3') {
  if (!owned || owned.length < 5) return null;

  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
  const byPos = {
    POR: shuffle(owned.filter(f => f.pos === 'POR')),
    DEF: shuffle(owned.filter(f => f.pos === 'DEF')),
    MED: shuffle(owned.filter(f => f.pos === 'MED')),
    DEL: shuffle(owned.filter(f => f.pos === 'DEL')),
  };

  const rows = FORMATIONS_DEF[formation].rows;
  const players = [];

  rows.forEach(row => {
    row.slots.forEach(pos => {
      const pool = byPos[pos];
      const p = pool?.shift();
      if (p) players.push({ ...p });
    });
  });

  return { name: 'Mi Equipo', formation, players };
}

/* Calcular poder total de un equipo */
function teamPower(players) {
  return players.reduce((sum, p) => sum + (p.rating || 75), 0);
}

const Battle = {
  _state: null,

  async render() {
    const user  = await Auth.currentUser();
    const owned = user?.figuritas || [];
    const el    = document.getElementById('tab-battle');
    if (!el) return;

    if (owned.length < 5) {
      el.innerHTML = `
        <div class="section-header"><h2>⚔️ Batallas</h2></div>
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
        <h2>⚔️ Batallas</h2>
        <div class="battle-record" id="battle-record">
          🏆 <span id="br-wins">${user.battleWins||0}</span>V
          💀 <span id="br-losses">${user.battleLosses||0}</span>D
        </div>
      </div>

      <div class="battle-modes">
        <div class="battle-mode-card ${BattleAttempts.remaining('classic') === 0 ? 'bmode-exhausted' : ''}" id="bmode-classic">
          <div class="bmode-icon">⚔</div>
          <div class="bmode-title">Batalla Clásica</div>
          <div class="bmode-desc">Compara ratings con factor suerte. Rápido y emocionante.</div>
          <div class="bmode-reward">+1 tirada al ganar</div>
          <div class="bmode-attempts">Intentos hoy: ${BattleAttempts.remaining('classic')}/${BattleAttempts.MAX_DAILY}</div>
        </div>
        <div class="battle-mode-card ${BattleAttempts.remaining('penalties') === 0 ? 'bmode-exhausted' : ''}" id="bmode-penalties">
          <div class="bmode-icon">🥅</div>
          <div class="bmode-title">Tanda de Penales</div>
          <div class="bmode-desc">3 penales cada uno. Minijuego de timing.</div>
          <div class="bmode-reward">+2 tiradas al ganar</div>
          <div class="bmode-attempts">Intentos hoy: ${BattleAttempts.remaining('penalties')}/${BattleAttempts.MAX_DAILY}</div>
        </div>
        <div class="battle-mode-card ${BattleAttempts.remaining('quiz') === 0 ? 'bmode-exhausted' : ''}" id="bmode-quiz">
          <div class="bmode-icon">🧠</div>
          <div class="bmode-title">Quiz Mundialista</div>
          <div class="bmode-desc">5 preguntas sobre el Mundial. Cada acierto suma puntos.</div>
          <div class="bmode-reward">+2 tiradas + monedas</div>
          <div class="bmode-attempts">Intentos hoy: ${BattleAttempts.remaining('quiz')}/${BattleAttempts.MAX_DAILY}</div>
        </div>
      </div>

      <div class="battle-team-preview">
        <div class="battle-team-panel" id="battle-user-panel">
          <div class="btp-title">👤 Tu Equipo</div>
          <div class="btp-formation" id="btp-user-formation">Cargando...</div>
          <button class="btn btn-sm" id="btn-battle-random-team">🎲 Alineación aleatoria</button>
        </div>
        <div class="battle-vs-center">VS</div>
        <div class="battle-team-panel" id="battle-cpu-panel">
          <div class="btp-title">🤖 CPU</div>
          <div class="btp-formation" id="btp-cpu-formation">¿?</div>
          <button class="btn btn-sm" id="btn-battle-new-rival">🔀 Nuevo rival</button>
        </div>
      </div>
    `;

    // Leer equipo ideal guardado; si no tiene suficientes, generar random
    const savedIdeal = user?.equipo_ideal || {};
    const savedFormation = user?.formacion || '4-3-3';
    const idealPlayers = Album.buildIdealTeamPlayers
      ? Album.buildIdealTeamPlayers(owned, savedIdeal, savedFormation)
      : [];
    const hasIdeal = idealPlayers.length >= 5;
    const userTeamInit = hasIdeal
      ? { name: 'Mi Equipo', formation: '4-3-3', players: idealPlayers }
      : (generateUserRandomTeam(owned) || { name:'Mi Equipo', players:owned.slice(0,11), formation:'4-3-3' });

    this._state = {
      userTeam: userTeamInit,
      cpuTeam:  generateCpuTeam(),
      user, owned,
      usingIdeal: hasIdeal
    };
    this._renderTeamPanels();

    // Eventos — verificar límite de intentos antes de iniciar
    document.getElementById('bmode-classic').addEventListener('click', () => {
      if (!BattleAttempts.consume('classic')) {
        Toast.warn('Ya usaste los 3 intentos de Batalla Clásica hoy. Vuelve mañana.');
        return;
      }
      this.startClassicBattle();
    });
    document.getElementById('bmode-penalties').addEventListener('click', () => {
      if (!BattleAttempts.consume('penalties')) {
        Toast.warn('Ya usaste los 3 intentos de Penales hoy. Vuelve mañana.');
        return;
      }
      this.startPenaltyBattle();
    });
    document.getElementById('bmode-quiz').addEventListener('click', () => {
      if (!BattleAttempts.consume('quiz')) {
        Toast.warn('Ya usaste los 3 intentos de Quiz hoy. Vuelve mañana.');
        return;
      }
      this.startQuizBattle();
    });
    document.getElementById('btn-battle-random-team').addEventListener('click', () => {
      if (this._state.usingIdeal) {
        // Switch to random
        const rnd = generateUserRandomTeam(this._state.owned);
        if (rnd) { this._state.userTeam = rnd; this._state.usingIdeal = false; }
        Toast.show('🎲 Alineación aleatoria');
      } else {
        // Try to restore ideal
        const savedIdeal = this._state.user?.equipo_ideal || {};
        const ip = Album.buildIdealTeamPlayers
          ? Album.buildIdealTeamPlayers(this._state.owned, savedIdeal) : [];
        if (ip.length >= 5) {
          this._state.userTeam = { name:'Mi Equipo', formation:'4-3-3', players: ip };
          this._state.usingIdeal = true;
          Toast.success('✅ Equipo Ideal activo');
        } else {
          const rnd = generateUserRandomTeam(this._state.owned);
          if (rnd) this._state.userTeam = rnd;
          Toast.show('🎲 Nueva alineación aleatoria');
        }
      }
      this._renderTeamPanels();
      // Update button label
      const btn = document.getElementById('btn-battle-random-team');
      if (btn) btn.textContent = this._state.usingIdeal ? '🎲 Modo aleatorio' : '📋 Mi Equipo Ideal';
    });
    document.getElementById('btn-battle-new-rival').addEventListener('click', () => {
      this._state.cpuTeam = generateCpuTeam();
      this._renderTeamPanels();
      Toast.show('🔀 Nuevo rival generado');
    });
  },

  _renderTeamPanels() {
    const { userTeam, cpuTeam } = this._state;
    const userPwr = teamPower(userTeam.players);
    const cpuPwr  = teamPower(cpuTeam.players);

    document.getElementById('btp-user-formation').innerHTML = `
      <div class="btp-name">${userTeam.name}</div>
      <div class="btp-formation-tag">${userTeam.formation}</div>
      <div class="btp-players">
        ${userTeam.players.slice(0,5).map(p => `
          <div class="btp-player">
            <span class="btp-emoji">${p.emoji||'⚽'}</span>
            <span class="btp-pname">${p.name.split(' ')[0]}</span>
            <span class="btp-rating ${p.rareza}">${p.rating||75}</span>
          </div>
        `).join('')}
        ${userTeam.players.length > 5 ? `<div style="font-size:0.7rem;color:var(--text-muted);text-align:center">+${userTeam.players.length-5} más</div>` : ''}
      </div>
      <div class="btp-power">⚡ Poder: <strong>${userPwr}</strong></div>
    `;

    document.getElementById('btp-cpu-formation').innerHTML = `
      <div class="btp-name">${cpuTeam.name}</div>
      <div class="btp-formation-tag">${cpuTeam.formation}</div>
      <div class="btp-players">
        ${cpuTeam.players.slice(0,5).map(p => `
          <div class="btp-player">
            <span class="btp-emoji">${p.emoji||'⚽'}</span>
            <span class="btp-pname">${p.name.split(' ')[0]}</span>
            <span class="btp-rating ${p.rareza}">${p.rating||75}</span>
          </div>
        `).join('')}
        ${cpuTeam.players.length > 5 ? `<div style="font-size:0.7rem;color:var(--text-muted);text-align:center">+${cpuTeam.players.length-5} más</div>` : ''}
      </div>
      <div class="btp-power">⚡ Poder: <strong>${cpuPwr}</strong></div>
    `;
  },

  /* ══════════════════════════════════════════
     BATALLA CLÁSICA — Comparación de ratings
  ══════════════════════════════════════════ */
  async startClassicBattle() {
    const { userTeam, cpuTeam } = this._state;
    const userPwr = teamPower(userTeam.players) + Math.random() * 80;
    const cpuPwr  = teamPower(cpuTeam.players)  + Math.random() * 80;

    const rounds = [];
    const comparePositions = ['POR','DEF','MED','DEL'];

    comparePositions.forEach(pos => {
      const uPlayers = userTeam.players.filter(p => p.pos === pos);
      const cPlayers = cpuTeam.players.filter(p => p.pos === pos);
      if (!uPlayers.length || !cPlayers.length) return;

      const uRating = uPlayers.reduce((s,p) => s + (p.rating||75), 0) / uPlayers.length + Math.random()*15;
      const cRating = cPlayers.reduce((s,p) => s + (p.rating||75), 0) / cPlayers.length + Math.random()*15;

      rounds.push({
        pos,
        userScore: Math.round(uRating),
        cpuScore:  Math.round(cRating),
        winner:    uRating > cRating ? 'user' : 'cpu'
      });
    });

    const userWins = rounds.filter(r => r.winner === 'user').length;
    const cpuWins  = rounds.filter(r => r.winner === 'cpu').length;
    const won = userWins > cpuWins;
    const drawn = userWins === cpuWins;

    let reward = 0;
    if (won) reward = 1;
    else if (drawn) reward = 0;

    await this._applyBattleResult(won, drawn, reward);

    Modal.open(`
      <div class="battle-result-modal">
        <div class="brm-header ${won ? 'win' : drawn ? 'draw' : 'loss'}">
          ${won ? '🏆 ¡VICTORIA!' : drawn ? '🤝 EMPATE' : '💀 DERROTA'}
        </div>
        <div class="brm-score">
          <span>${userTeam.name} <strong>${userWins}</strong></span>
          <span style="color:var(--text-muted)">vs</span>
          <span><strong>${cpuWins}</strong> ${cpuTeam.name}</span>
        </div>
        <div class="brm-rounds">
          ${rounds.map(r => `
            <div class="brm-round ${r.winner === 'user' ? 'win' : 'loss'}">
              <span class="brm-pos">${r.pos}</span>
              <span class="brm-us">${r.userScore}</span>
              <span style="color:var(--text-muted)">vs</span>
              <span class="brm-cpu">${r.cpuScore}</span>
              <span>${r.winner === 'user' ? '✅' : '❌'}</span>
            </div>
          `).join('')}
        </div>
        ${reward > 0 ? `<div class="brm-reward">🎴 +${reward} tirada ganada</div>` : ''}
        <button class="btn btn-primary" onclick="Modal.close();Battle.render()" style="width:100%;margin-top:1rem">
          Continuar
        </button>
      </div>
    `);
  },

  /* ══════════════════════════════════════════
     TANDA DE PENALES — Minijuego interactivo
     Ronda A: usuario dispara, CPU ataja
     Ronda B: CPU dispara, usuario elige dónde atajar
  ══════════════════════════════════════════ */
  async startPenaltyBattle() {
    let userGoals = 0, cpuGoals = 0;
    let round = 0;
    const totalRounds = 3; // 3 rondas: cada ronda = 1 disparo usuario + 1 disparo CPU

    const DIRS = ['↖️ Izq. arriba','⬆️ Centro','↗️ Der. arriba','↙️ Izq. abajo','⬇️ Raso centro','↘️ Der. abajo'];
    const DIRS_SHORT = ['Izq. arr.','Centro','Der. arr.','Izq. abajo','Raso','Der. abajo'];

    const showResult = (userScored, cpuScored, onNext) => {
      const goalBg = userScored ? 'goal-flash' : '';
      Modal.open(`
        <div style="text-align:center;padding:1rem 0" class="${goalBg}">
          <div style="font-size:2.5rem;margin-bottom:0.3rem">
            <span class="${userScored ? 'ball-kick-anim' : ''}">⚽</span>
          </div>
          <div style="font-size:${userScored?'1.4rem':'1.1rem'};font-weight:900;color:${userScored?'#44ff88':'#ff4466'};font-family:'Bebas Neue',cursive;letter-spacing:1px;margin-bottom:0.3rem">
            ${userScored ? '🥅 ¡¡GOOOL!!' : '🧤 ¡Atajado!'}
          </div>
          <div style="display:flex;justify-content:center;gap:1.5rem;margin:0.4rem 0">
            <div>
              <div style="font-size:0.7rem;color:var(--text-muted)">CPU</div>
              <div style="font-size:0.9rem;color:${cpuScored?'#ff8844':'#44ff88'};font-weight:700">
                ${cpuScored ? '⚽ Gol' : '✋ ¡Atajaste!'}
              </div>
            </div>
          </div>
          <div style="font-size:2rem;font-family:'Bebas Neue',cursive;margin:0.5rem 0;letter-spacing:2px">
            ${userGoals} — ${cpuGoals}
          </div>
          <button class="btn btn-primary" style="margin-top:1rem;width:100%" id="next-penalty-btn">
            ${round < totalRounds ? `Ronda ${round+1} →` : 'Ver resultado →'}
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

    // Fase B: Usuario ataja el disparo de la CPU
    const doCpuShoot = (onDone) => {
      const cpuShotDir = Math.floor(Math.random() * 6); // 0-5, igual que el tirador
      const cpuDirLabels = ['↖️ Izq. arriba', '⬆️ Centro', '↗️ Der. arriba', '↙️ Izq. abajo', '⬇️ Raso centro', '↘️ Der. abajo'];
      Modal.open(`
        <div style="text-align:center;padding:0.5rem 0">
          <div style="font-size:1.8rem;margin-bottom:0.3rem">🥅</div>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem">
            <strong>¡La CPU va a disparar!</strong><br>
            Elige hacia dónde tirarte:
          </p>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.4rem;max-width:280px;margin:0 auto">
            ${cpuDirLabels.map((label, i) => `
              <button class="penalty-save-btn btn btn-secondary" data-dir="${i}"
                style="padding:0.5rem 0.2rem;font-size:0.72rem">
                ${label}
              </button>
            `).join('')}
          </div>
        </div>
      `);
      setTimeout(() => {
        document.querySelectorAll('.penalty-save-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const userSaveDir = parseInt(btn.dataset.dir);
            const cpuScored = (userSaveDir !== cpuShotDir); // ataja si acierta dirección
            if (cpuScored) cpuGoals++;
            Modal.close();
            setTimeout(() => onDone(cpuScored), 200);
          });
        });
      }, 50);
    };

    const doRound = () => {
      if (round >= totalRounds) {
        this._endPenaltyBattle(userGoals, cpuGoals);
        return;
      }
      round++;

      // Fase A: Usuario dispara
      Modal.open(`
        <div style="text-align:center;padding:0.5rem 0">
          <div style="font-family:'Bebas Neue',cursive;font-size:1.2rem;color:var(--text-muted);margin-bottom:0.5rem">
            RONDA ${round} DE ${totalRounds}
          </div>
          <div style="font-size:2rem;margin:0.3rem 0">⚽ Tu turno de disparar</div>
          <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.8rem">
            Marcador: <strong>${userGoals}</strong> - <strong>${cpuGoals}</strong>
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
            const userDir    = parseInt(btn.dataset.dir);
            const cpuSaveDir = Math.floor(Math.random() * 6);
            const userScored = (userDir !== cpuSaveDir) || Math.random() > 0.25;
            if (userScored) userGoals++;
            Modal.close();

            // Después del disparo del usuario, la CPU dispara
            setTimeout(() => {
              doCpuShoot((cpuScored) => {
                showResult(userScored, cpuScored, doRound);
              });
            }, 200);
          });
        });
      }, 50);
    };

    doRound();
  },

  async _endPenaltyBattle(userGoals, cpuGoals) {
    const won   = userGoals > cpuGoals;
    const drawn = userGoals === cpuGoals;
    const reward = won ? 2 : drawn ? 1 : 0;
    await this._applyBattleResult(won, drawn, reward);

    setTimeout(() => {
      Modal.open(`
        <div class="battle-result-modal">
          <div class="brm-header ${won ? 'win' : drawn ? 'draw' : 'loss'}">
            ${won ? '🏆 ¡GANASTE LA TANDA!' : drawn ? '🤝 EMPATE' : '💀 LA PERDISTE'}
          </div>
          <div class="brm-score" style="font-size:2rem;font-family:'Bebas Neue',cursive;letter-spacing:4px">
            ${userGoals} — ${cpuGoals}
          </div>
          <div style="font-size:0.85rem;color:var(--text-muted);margin:0.5rem 0">Penales marcados</div>
          ${reward > 0 ? `<div class="brm-reward">🎴 +${reward} tirada${reward>1?'s':''} ganada${reward>1?'s':''}</div>` : ''}
          <button class="btn btn-primary" onclick="Modal.close();Battle.render()" style="width:100%;margin-top:1rem">
            Continuar
          </button>
        </div>
      `);
    }, 200);
  },

  /* ══════════════════════════════════════════
     QUIZ MUNDIALISTA
  ══════════════════════════════════════════ */
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
    // Bloque 2 – Mundial 2026
    { q:'¿Cuántas sedes tiene el Mundial 2026?',                   opts:['12','14','16','11'],                      ans:1 },
    { q:'¿Cuál es la sede canadiense del Mundial 2026?',           opts:['Ottawa','Montreal','Toronto','Vancouver'], ans:2 },
    { q:'¿Cuántos partidos tendrá el Mundial 2026?',               opts:['64','80','96','104'],                     ans:2 },
    { q:'¿Qué formato de grupos usa el Mundial 2026?',             opts:['8 grupos de 6','12 grupos de 4','8 grupos de 4','16 grupos de 3'], ans:1 },
    { q:'¿Cuál es el estadio de la final del Mundial 2026?',       opts:['SoFi Stadium','Rose Bowl','MetLife Stadium','AT&T Stadium'], ans:2 },
    // Bloque 3 – Historia del fútbol
    { q:'¿Qué país organizó el Mundial 2022?',                     opts:['Emiratos Árabes','Arabia Saudita','Kuwait','Catar'], ans:3 },
    { q:'¿Quién marcó el "Gol del Siglo" en 1986?',                opts:['Platini','Zico','Maradona','Butcher'],    ans:2 },
    { q:'¿Cuántas veces ha sido anfitrión Brasil del Mundial?',    opts:['1','2','3','4'],                          ans:1 },
    { q:'¿Qué equipo europeo ha ganado más Mundiales (4)?',        opts:['Francia','España','Alemania','Italia'],   ans:3 },
    { q:'¿En qué Mundial se usó el VAR por primera vez?',          opts:['Rusia 2018','Brasil 2014','Catar 2022','Francia 1998'], ans:0 },
    { q:'¿Cuál fue el primer Mundial celebrado en Asia?',          opts:['Japón/Corea 2002','China 2030','Catar 2022','Australia 2023'], ans:0 },
    { q:'¿Cuántos penaltis erró Baggio en la final del 94?',       opts:['0','1','2','3'],                          ans:1 },
    { q:'¿Qué jugador ganó el Balón de Oro 2023?',                 opts:['Benzema','Messi','Mbappé','Haaland'],     ans:1 },
    // Bloque 4 – Selecciones y estadísticas
    { q:'¿Qué selección tiene el récord de goles en un solo Mundial (27)?', opts:['Brasil','Hungría','Francia','Alemania'], ans:1 },
    { q:'¿Cuántos goles marcó Mbappé en el Mundial 2022?',         opts:['6','7','8','9'],                          ans:2 },
    { q:'¿Qué selección llegó a la final del Mundial 2022?',       opts:['Brasil','Portugal','Francia','Marruecos'], ans:2 },
    { q:'¿Cuál es la selección con más participaciones mundialistas?', opts:['Brasil','Alemania','Italia','Argentina'], ans:0 },
    { q:'¿Qué portero ganó el Guante de Oro en Qatar 2022?',       opts:['Courtois','Alisson','Lloris','E. Martínez'], ans:3 },
    { q:'¿Qué selección fue eliminada en grupos en Qatar 2022 como gran sorpresa?', opts:['Alemania','España','Bélgica','Uruguay'], ans:0 },
    // Bloque 5 – Clubs y Champions
    { q:'¿Cuántas Champions League tiene el Real Madrid?',         opts:['13','14','15','16'],                      ans:2 },
    { q:'¿Qué club ganó la Premier 2023-24?',                      opts:['Arsenal','Liverpool','Man City','Chelsea'], ans:2 },
    { q:'¿En qué estadio se jugó la final de la Champions 2024?',  opts:['Wembley','Bernabéu','Allianz Arena','Estadio Olímpico de Londres'], ans:0 },
    { q:'¿Quién fue el máximo goleador de La Liga 2023-24?',       opts:['Vinícius','Bellingham','Lewandowski','Artem Dovbyk'], ans:3 },
    { q:'¿Qué equipo ganó la Libertadores 2023?',                  opts:['Fluminense','Boca Juniors','River Plate','Atlético Mineiro'], ans:0 },
    // Bloque 6 – Curiosidades
    { q:'¿Cuántos árbitros participan en un partido oficial FIFA actualmente (con VAR)?', opts:['4','5','6','7'], ans:2 },
    { q:'¿Qué medida tiene el campo de fútbol según FIFA (largo máx.)?', opts:['100m','110m','120m','130m'],        ans:2 },
    { q:'¿Qué jugador tiene más seguidores en Instagram (fútbol)?', opts:['Mbappé','Ronaldo','Messi','Neymar'],     ans:1 },
    { q:'¿Cuántos minutos dura la prórroga en un partido de fútbol?', opts:['20','25','30','40'],                   ans:2 },
    { q:'¿Qué selección tiene el uniforme más antiguo del mundo (desde 1872)?', opts:['Inglaterra','Escocia','Gales','Irlanda'], ans:1 },
    { q:'¿Qué selección ganó la Copa América 2024?',               opts:['Brasil','Colombia','Uruguay','Argentina'], ans:3 },
  ],

  async startQuizBattle() {
    const questions = [...this._quizQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
    let score = 0;
    let qi = 0;

    const doQuestion = () => {
      if (qi >= questions.length) {
        this._endQuizBattle(score, questions.length);
        return;
      }
      const q = questions[qi];
      const shuffledOpts = [...q.opts].map((o, i) => ({ text: o, orig: i }))
                            .sort(() => Math.random() - 0.5);
      qi++;

      Modal.open(`
        <div style="padding:0.5rem 0">
          <div style="font-size:0.7rem;color:var(--text-muted);font-family:'Barlow Condensed',sans-serif;letter-spacing:2px;margin-bottom:0.5rem">
            PREGUNTA ${qi} DE ${questions.length} · ${score} pts
          </div>
          <div class="quiz-progress-bar">
            <div class="quiz-progress-fill" style="width:${((qi-1)/questions.length)*100}%"></div>
          </div>
          <p style="font-size:0.95rem;font-weight:600;color:var(--text-primary);margin:0.75rem 0;line-height:1.4">
            ${q.q}
          </p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-top:0.75rem">
            ${shuffledOpts.map(opt => `
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
            const chosen = parseInt(btn.dataset.orig);
            const correct = chosen === q.ans;
            if (correct) score++;

            // Marcar respuestas
            document.querySelectorAll('.quiz-opt-btn').forEach(b => {
              const isCorrect = parseInt(b.dataset.orig) === q.ans;
              b.style.background = isCorrect ? 'rgba(68,255,136,0.2)' : (b === btn && !correct ? 'rgba(255,68,102,0.2)' : '');
              b.style.borderColor = isCorrect ? '#44ff88' : (b === btn && !correct ? '#ff4466' : '');
              b.disabled = true;
            });

            // Animación flotante de puntos si respuesta correcta
            if (correct) {
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
              setTimeout(doQuestion, 200);
            }, 1000);
          });
        });
      }, 50);
    };

    doQuestion();
  },

  async _endQuizBattle(score, total) {
    const won   = score >= Math.ceil(total * 0.6); // 60%+ = victoria
    const drawn = score === Math.floor(total / 2);
    const tiradas = score >= total ? 3 : score >= Math.ceil(total*0.6) ? 2 : score > 0 ? 1 : 0;
    const monedas = score * 5;
    await this._applyBattleResult(won, drawn, tiradas, monedas);

    setTimeout(() => {
      Modal.open(`
        <div class="battle-result-modal">
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
          <div class="brm-reward">
            ${tiradas > 0 ? `🎴 +${tiradas} tirada${tiradas>1?'s':''}` : ''}
            ${monedas > 0 ? `&nbsp;&nbsp;💰 +${monedas} monedas` : ''}
          </div>
          <button class="btn btn-primary" onclick="Modal.close();Battle.render()" style="width:100%;margin-top:1rem">
            Continuar
          </button>
        </div>
      `);
    }, 200);
  },

  /* Aplicar resultado al usuario */
  async _applyBattleResult(won, drawn, tiradas = 0, monedas = 0) {
    const user = await Auth.currentUser();
    if (!user) return;

    if (won)  user.battleWins   = (user.battleWins   || 0) + 1;
    else      user.battleLosses = (user.battleLosses || 0) + 1;

    if (tiradas > 0) user.tiradas = (user.tiradas || 0) + tiradas;
    if (monedas > 0) user.monedas = (user.monedas || 0) + monedas;

    await Auth.updateUser(user);
    await DB.logActivity(user.email, 'battle', `${won?'victoria':'derrota'} +${tiradas}🎴 +${monedas}💰`);
    if (typeof App !== 'undefined') await App.refreshHeader();
    if (tiradas > 0) Toast.success(`⚔️ Batalla terminada! +${tiradas} tirada${tiradas>1?'s':''}${monedas>0?` +${monedas}💰`:''}`);
  }
};
