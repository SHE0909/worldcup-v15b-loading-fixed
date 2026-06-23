const GRUPOS_WC2026 = {
  A: ['México',         'Sudáfrica',    'Corea del Sur', 'Rep. Checa'],
  B: ['Canadá',         'Bosnia-Herz.', 'Qatar',         'Suiza'],
  C: ['Brasil',         'Marruecos',    'Haití',         'Escocia'],
  D: ['EE.UU.',         'Paraguay',     'Australia',     'Turquía'],
  E: ['Alemania',       'Curazao',      'Costa de Marfil','Ecuador'],
  F: ['Países Bajos',   'Japón',        'Suecia',        'Túnez'],
  G: ['Bélgica',        'Egipto',       'Irán',          'Nueva Zelanda'],
  H: ['España',         'Cabo Verde',   'Arabia Saudita','Uruguay'],
  I: ['Francia',        'Senegal',      'Irak',          'Noruega'],
  J: ['Argentina',      'Argelia',      'Austria',       'Jordania'],
  K: ['Portugal',       'RD Congo',     'Uzbekistán',    'Colombia'],
  L: ['Inglaterra',     'Croacia',      'Ghana',         'Panamá'],
};

const FASES_WC = [
  { id:'grupos',   etiqueta:'Fase de Grupos',  recompensa:10 },
  { id:'round32',  etiqueta:'Ronda de 32',     recompensa:10 },
  { id:'r16',      etiqueta:'Octavos de Final',recompensa:10 },
  { id:'qf',       etiqueta:'Cuartos de Final',recompensa:10 },
  { id:'sf',       etiqueta:'Semifinales',     recompensa:10 },
  { id:'final',    etiqueta:'Final',           recompensa:10 },
  { id:'champion', etiqueta:'Campeón',         recompensa:50 },
];

const CLAVE_LS_WC = 'wcc_wc_prediction';   

const WorldCupPredictor = {

  
  async open() {
    const usuario = await Auth.currentUser();
    if (!usuario) { Toast.warn('Inicia sesión para predecir'); return; }

    
    await this._loadGroupsFromTeams();

    const prediccion = usuario.wcPrediction || {};
    const overlay = document.createElement('div');
    overlay.id = 'wcp-overlay';
    overlay.style.cssText = `
      position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;
      background:rgba(10,12,20,0.97);overflow-y:auto;
      display:flex;flex-direction:column;`;

    overlay.innerHTML = this._buildUI(prediccion);
    document.body.appendChild(overlay);

    
    overlay.querySelector('#wcp-close').addEventListener('click', () => overlay.remove());

    
    overlay.querySelectorAll('.wcp-phase-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        overlay.querySelectorAll('.wcp-phase-tab').forEach(t => t.classList.remove('active'));
        overlay.querySelectorAll('.wcp-phase-panel').forEach(p => p.style.display = 'none');
        tab.classList.add('active');
        overlay.querySelector(`#wcp-panel-${tab.dataset.phase}`).style.display = '';
        if (tab.dataset.phase === 'champion') this._refreshChampionOptions(overlay);
      });
    });

    
    overlay.querySelector('#wcp-save').addEventListener('click', () => this._save(overlay));

    
    this._initGroupPickers(overlay, prediccion);
    this._initKnockoutPickers(overlay, prediccion);
  },

  
  async _loadGroupsFromTeams() {
    try {
      
      const equipos = typeof API !== 'undefined' ? await API.getTeams() : null;
      const fuenteDatos = (equipos?.length) ? equipos : (typeof MOCK !== 'undefined' ? MOCK.equipos : null);
      if (!fuenteDatos?.length) return;

      
      const porGrupo = {};
      fuenteDatos.forEach(t => {
        if (!t.group) return;
        if (!porGrupo[t.group]) porGrupo[t.group] = [];
        porGrupo[t.group].push(t.name);
      });

      
      const keys = Object.keys(porGrupo);
      if (keys.length >= 8) {
        keys.forEach(g => {
          if (porGrupo[g].length >= 2) GRUPOS_WC2026[g] = porGrupo[g];
        });
      }
    } catch(_) {}
  },

  
  _buildUI(prediccion) {
    const infoEstado = this._calcStatus(prediccion);
    return `
      <div style="max-width:600px;width:100%;margin:0 auto;padding:1rem;">

        <!-- Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
          <div>
            <h2 style="margin:0;font-size:1.3rem;color:var(--gold)">🏆 Predecir Mundial 2026</h2>
            <p style="font-size:0.7rem;color:var(--text-muted);margin:0.2rem 0 0">
              Acierta fases → gana tiradas 🎴
            </p>
          </div>
          <button id="wcp-close" style="background:transparent;border:1px solid var(--border);
            border-radius:8px;color:var(--text-secondary);padding:0.4rem 0.8rem;cursor:pointer;
            font-size:0.85rem">✕ Cerrar</button>
        </div>

        <!-- Progreso / recompensas -->
        <div style="background:var(--card-bg,#181c28);border:1px solid var(--border);
          border-radius:12px;padding:0.85rem 1rem;margin-bottom:1rem;">
          <p style="font-size:0.65rem;font-weight:700;color:var(--text-muted);letter-spacing:1px;
            text-transform:uppercase;margin:0 0 0.5rem">Recompensas por fase</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.4rem;">
            ${FASES_WC.map(etapa => {
              const s = infoEstado[etapa.id] || 'pendientes';
              const icon = s === 'won' ? '✅' : s === 'lost' ? '❌' : '⏳';
              const col  = s === 'won' ? '#4caf6a' : s === 'lost' ? '#e05555' : 'var(--text-muted)';
              return `<div style="font-size:0.7rem;color:${col};background:rgba(255,255,255,0.04);
                border-radius:8px;padding:0.35rem 0.5rem;text-align:center;">
                ${icon} ${etapa.etiqueta}<br>
                <span style="font-weight:800;color:var(--gold)">${etapa.recompensa} 🎴</span>
              </div>`;
            }).join('')}
          </div>
          <p style="font-size:0.72rem;color:var(--gold);font-weight:700;margin:0.6rem 0 0;text-align:right">
            Total posible: <strong>${FASES_WC.reduce((s,p)=>s+p.recompensa,0)} tiradas</strong>
          </p>
        </div>

        <!-- Tabs de fases -->
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.75rem;">
          ${['grupos','round32','r16','qf','sf','final','champion'].map((etapa,i) => `
            <button class="wcp-phase-tab${i===0?' active':''}" data-phase="${etapa}"
              style="background:${i===0?'var(--gold)':'var(--card-bg,#181c28)'};
                color:${i===0?'#000':'var(--text-secondary)'};
                border:1px solid ${i===0?'var(--gold)':'var(--border)'};
                border-radius:8px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.7rem;font-weight:700;">
              ${FASES_WC[i].etiqueta}
            </button>`).join('')}
        </div>

        <!-- Paneles -->
        ${this._buildGroupsPanel()}
        ${this._buildKnockoutPanel('round32', 'Ronda de 32',    32, 16)}
        ${this._buildKnockoutPanel('r16',     'Octavos de Final', 16, 8)}
        ${this._buildKnockoutPanel('qf',      'Cuartos de Final',  8, 4)}
        ${this._buildKnockoutPanel('sf',      'Semifinales',        4, 2)}
        ${this._buildKnockoutPanel('final',   'Final',              2, 1)}
        ${this._buildChampionPanel()}

        <!-- Guardar -->
        <div style="text-align:center;padding:1.5rem 0 2rem;">
          <button id="wcp-save" style="background:linear-gradient(135deg,#c0a022,#e8c840);
            color:#000;font-weight:800;font-size:1rem;border:none;border-radius:12px;
            padding:0.85rem 2.5rem;cursor:pointer;width:100%;max-width:350px;
            box-shadow:0 4px 20px rgba(200,160,0,0.35);">
            💾 Guardar predicción
          </button>
          <p style="font-size:0.65rem;color:var(--text-muted);margin-top:0.5rem">
            Puedes editar tu predicción hasta que empiece la fase correspondiente
          </p>
        </div>
      </div>`;
  },

  _buildGroupsPanel() {
    const grupos = Object.keys(GRUPOS_WC2026);
    return `
      <div class="wcp-phase-panel" id="wcp-panel-grupos" style="">
        <p style="font-size:0.72rem;color:var(--text-muted);margin:0 0 0.75rem">
          Selecciona los <strong style="color:var(--gold)">2 equipos</strong> que clasifican de cada grupo.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:0.5rem;">
          ${grupos.map(g => `
            <div style="background:var(--card-bg,#181c28);border:1px solid var(--border);
              border-radius:10px;padding:0.75rem;">
              <p style="font-size:0.65rem;font-weight:800;color:var(--gold);letter-spacing:1px;
                text-transform:uppercase;margin:0 0 0.4rem">Grupo ${g}</p>
              <div class="wcp-group-elecciones" data-group="${g}"
                style="display:grid;grid-template-columns:1fr 1fr;gap:0.3rem;">
                ${GRUPOS_WC2026[g].map(equipo => `
                  <button class="wcp-equipo-btn" data-equipo="${equipo}" data-group="${g}"
                    style="background:rgba(255,255,255,0.05);border:1px solid var(--border);
                      border-radius:8px;padding:0.4rem 0.5rem;cursor:pointer;
                      font-size:0.72rem;color:var(--text-secondary);text-align:left;
                      transition:all 0.15s;white-space:nowrap;overflow:hidden;
                      text-overflow:ellipsis;">
                    ${this._getFlag(equipo)} ${equipo}
                  </button>`).join('')}
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  },

  _buildKnockoutPanel(phaseId, etiqueta, slots, out) {
    const pares = slots / 2;
    return `
      <div class="wcp-phase-panel" id="wcp-panel-${phaseId}" style="display:none">
        <p style="font-size:0.72rem;color:var(--text-muted);margin:0 0 0.75rem">
          Selecciona los <strong style="color:var(--gold)">${out} clasificados</strong> de ${etiqueta}.
          <br><span style="font-size:0.65rem">(Los equipos disponibles se poblarán con tu predicción de la fase anterior)</span>
        </p>
        <div id="wcp-knockout-${phaseId}" style="display:flex;flex-direction:column;gap:0.5rem;">
          ${Array(pares).fill(0).map((_,i) => `
            <div class="wcp-match-row" data-phase="${phaseId}" data-pair="${i}"
              style="background:var(--card-bg,#181c28);border:1px solid var(--border);
                border-radius:10px;padding:0.6rem 0.75rem;display:flex;align-items:center;gap:0.5rem;">
              <button class="wcp-ko-pick" data-phase="${phaseId}" data-pair="${i}" data-side="local"
                style="flex:1;background:rgba(255,255,255,0.05);border:1px solid var(--border);
                  border-radius:8px;padding:0.4rem;cursor:pointer;font-size:0.75rem;
                  color:var(--text-muted);">?</button>
              <span style="font-size:0.65rem;color:var(--text-muted);flex-shrink:0">vs</span>
              <button class="wcp-ko-pick" data-phase="${phaseId}" data-pair="${i}" data-side="visitante"
                style="flex:1;background:rgba(255,255,255,0.05);border:1px solid var(--border);
                  border-radius:8px;padding:0.4rem;cursor:pointer;font-size:0.75rem;
                  color:var(--text-muted);">?</button>
              <span style="font-size:0.65rem;color:var(--text-muted);flex-shrink:0">→</span>
              <div class="wcp-ganador-slot" data-phase="${phaseId}" data-pair="${i}"
                style="flex:1;background:rgba(200,160,0,0.1);border:1px dashed var(--gold);
                  border-radius:8px;padding:0.4rem;font-size:0.75rem;color:var(--gold);
                  text-align:center;min-height:30px;display:flex;align-items:center;justify-content:center;">
                Ganador
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  },

  _buildChampionPanel() {
    return `
      <div class="wcp-phase-panel" id="wcp-panel-champion" style="display:none">
        <p style="font-size:0.72rem;color:var(--text-muted);margin:0 0 0.75rem">
          ¿Quién será el <strong style="color:var(--gold)">Campeón del Mundial 2026</strong>?
        </p>
        <div style="background:var(--card-bg,#181c28);border:2px solid var(--gold);
          border-radius:16px;padding:1.5rem;text-align:center;margin-bottom:1rem;">
          <div id="wcp-champion-pick" style="font-size:1.1rem;font-weight:800;color:var(--gold);
            margin-bottom:1rem;min-height:2rem;">
            🏆 Selecciona el campeón
          </div>
          <p style="font-size:0.65rem;color:var(--text-muted);margin:0">
            Acertar el campeón: <strong style="color:var(--gold)">+50 tiradas 🎴</strong>
          </p>
        </div>
        <div id="wcp-champion-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.4rem;">
          <p style="grid-column:1/-1;font-size:0.7rem;color:var(--text-muted);text-align:center">
            Primero selecciona los finalistas en la pestaña "Final"</p>
        </div>
      </div>`;
  },

  
  _initGroupPickers(overlay, prediccion) {
    const predGrupo = prediccion.grupos || {};

    
    Object.keys(predGrupo).forEach(g => {
      const elecciones = predGrupo[g] || [];
      elecciones.forEach(equipo => {
        const btn = overlay.querySelector(`.wcp-equipo-btn[data-equipo="${equipo}"][data-group="${g}"]`);
        if (btn) this._selectTeamBtn(btn, overlay, g);
      });
    });

    overlay.querySelectorAll('.wcp-equipo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.dataset.group;
        const elecciones = overlay.querySelectorAll(`.wcp-equipo-btn.seleccionado[data-group="${group}"]`);
        if (btn.classList.contains('seleccionado')) {
          btn.classList.remove('seleccionado');
          this._styleTeamBtn(btn, false);
        } else if (elecciones.length < 2) {
          this._selectTeamBtn(btn, overlay, group);
        } else {
          Toast.warn('Solo puedes seleccionar 2 equipos por grupo');
        }
      });
    });
  },

  _selectTeamBtn(btn, overlay, group) {
    btn.classList.add('seleccionado');
    this._styleTeamBtn(btn, true);
  },

  _styleTeamBtn(btn, seleccionado) {
    if (seleccionado) {
      btn.style.background = 'rgba(200,160,0,0.2)';
      btn.style.borderColor = 'var(--gold)';
      btn.style.color = 'var(--gold)';
      btn.style.fontWeight = '700';
    } else {
      btn.style.background = 'rgba(255,255,255,0.05)';
      btn.style.borderColor = 'var(--border)';
      btn.style.color = 'var(--text-secondary)';
      btn.style.fontWeight = '';
    }
  },

  
  _getAvailableTeams(overlay, phaseId) {
    if (phaseId === 'round32') {
      
      const equipos = new Set();
      Object.keys(GRUPOS_WC2026).forEach(g => {
        overlay.querySelectorAll(`.wcp-equipo-btn.seleccionado[data-group="${g}"]`).forEach(b => equipos.add(b.dataset.equipo));
      });
      return [...equipos];
    }
    
    const mapaAnterior = { r16:'round32', qf:'r16', sf:'qf', final:'sf', champion_from_final:'final' };
    const faseAnterior = mapaAnterior[phaseId];
    if (!faseAnterior) return this._getAllTeams();
    const contenedorAnterior = overlay.querySelector(`#wcp-knockout-${faseAnterior}`);
    const equipos = new Set();
    if (contenedorAnterior) {
      contenedorAnterior.querySelectorAll('.wcp-ganador-slot').forEach(slot => {
        if (slot.dataset.elegido2) equipos.add(slot.dataset.elegido2);
      });
    }
    return [...equipos];
  },

  
  _refreshChampionOptions(overlay) {
    const finalistas = this._getAvailableTeams(overlay, 'champion_from_final');
    const grid = overlay.querySelector('#wcp-champion-grid');
    if (!grid) return;
    if (finalistas.length === 0) {
      grid.innerHTML = `<p style="grid-column:1/-1;font-size:0.7rem;color:var(--text-muted);text-align:center">
        Primero selecciona los finalistas en la pestaña "Final"</p>`;
      return;
    }
    grid.innerHTML = finalistas.map(t => `
      <button class="wcp-champion-btn" data-equipo="${t}"
        style="background:rgba(255,255,255,0.05);border:1px solid var(--border);
          border-radius:8px;padding:0.4rem 0.3rem;cursor:pointer;font-size:0.68rem;
          color:var(--text-secondary);transition:all 0.15s;">
        ${this._getFlag(t)} ${t}
      </button>`).join('');
    grid.querySelectorAll('.wcp-champion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        grid.querySelectorAll('.wcp-champion-btn').forEach(b => {
          b.style.background='rgba(255,255,255,0.05)'; b.style.borderColor='var(--border)'; b.style.color='var(--text-secondary)'; b.style.fontWeight='';
        });
        btn.style.background='rgba(200,160,0,0.2)'; btn.style.borderColor='var(--gold)'; btn.style.color='var(--gold)'; btn.style.fontWeight='700';
        const el = overlay.querySelector('#wcp-champion-pick');
        if (el) el.textContent = `🏆 ${this._getFlag(btn.dataset.equipo)} ${btn.dataset.equipo}`;
      });
    });
  },

  
  _initKnockoutPickers(overlay, prediccion) {
    
    
    const fases = ['round32','r16','qf','sf','final'];
    fases.forEach(phaseId => {
      const predFase = prediccion[phaseId] || {};
      const contenedor = overlay.querySelector(`#wcp-knockout-${phaseId}`);
      if (!contenedor) return;

      
      Object.entries(predFase).forEach(([pairKey, data]) => {
        const pair = parseInt(pairKey);
        if (data.local) {
          const btnLocal = contenedor.querySelector(`.wcp-ko-pick[data-pair="${pair}"][data-side="local"]`);
          if (btnLocal) { btnLocal.textContent = `${this._getFlag(data.local)} ${data.local}`; btnLocal.dataset.elegido2 = data.local; this._styleKoBtn(btnLocal, false); }
        }
        if (data.visitante) {
          const btnVisitante = contenedor.querySelector(`.wcp-ko-pick[data-pair="${pair}"][data-side="visitante"]`);
          if (btnVisitante) { btnVisitante.textContent = `${this._getFlag(data.visitante)} ${data.visitante}`; btnVisitante.dataset.elegido2 = data.visitante; this._styleKoBtn(btnVisitante, false); }
        }
        if (data.ganador) {
          const slot = contenedor.querySelector(`.wcp-ganador-slot[data-pair="${pair}"]`);
          if (slot) { slot.textContent = `${this._getFlag(data.ganador)} ${data.ganador}`; slot.dataset.elegido2 = data.ganador; }
        }
      });

      
      contenedor.querySelectorAll('.wcp-ko-pick').forEach(btn => {
        btn.addEventListener('click', () => {
          const pair = btn.dataset.pair;
          const side = btn.dataset.side;
          this._openTeamPicker(overlay, phaseId, pair, side, prediccion);
        });
      });
    });

    
    const predCampeon = prediccion.champion;
    this._refreshChampionOptions(overlay);
    if (predCampeon) {
      const el = overlay.querySelector('#wcp-champion-pick');
      if (el) el.textContent = `🏆 ${this._getFlag(predCampeon)} ${predCampeon}`;
      const btn = overlay.querySelector(`.wcp-champion-btn[data-equipo="${predCampeon}"]`);
      if (btn) { btn.style.background='rgba(200,160,0,0.2)'; btn.style.borderColor='var(--gold)'; btn.style.color='var(--gold)'; btn.style.fontWeight='700'; }
    }
  },

  _styleKoBtn(btn, seleccionado) {
    btn.style.color = 'var(--text-secondary)';
  },

  
  _openTeamPicker(overlay, phaseId, pair, side, prediccion) {
    const disponibles = this._getAvailableTeams(overlay, phaseId);
    if (disponibles.length === 0) {
      const etiquetaAnterior = phaseId === 'round32' ? 'Fase de Grupos' : 'la fase anterior';
      Toast.warn(`Primero selecciona los clasificados en ${etiquetaAnterior}`);
      return;
    }
    const modal2 = document.createElement('div');
    modal2.style.cssText = `
      position:fixed;top:0;left:0;right:0;bottom:0;z-index:10000;
      background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;`;
    modal2.innerHTML = `
      <div style="background:var(--bg,#0f1117);border:1px solid var(--border);border-radius:16px;
        padding:1rem;max-width:350px;width:90%;max-height:80vh;overflow-y:auto;">
        <h3 style="font-size:0.9rem;color:var(--gold);margin:0 0 0.75rem">Seleccionar equipo</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.35rem;">
          ${disponibles.map(t => `
            <button class="wcp-pick-equipo-btn" data-equipo="${t}"
              style="background:rgba(255,255,255,0.05);border:1px solid var(--border);
                border-radius:8px;padding:0.4rem;cursor:pointer;font-size:0.7rem;
                color:var(--text-secondary);">
              ${this._getFlag(t)} ${t}
            </button>`).join('')}
        </div>
        <button id="wcp-picker-cancel" style="margin-top:0.75rem;width:100%;
          background:rgba(255,255,255,0.08);border:1px solid var(--border);
          border-radius:8px;padding:0.5rem;cursor:pointer;color:var(--text-muted);font-size:0.8rem;">
          Cancelar
        </button>
      </div>`;
    document.body.appendChild(modal2);

    modal2.querySelector('#wcp-picker-cancel').addEventListener('click', () => modal2.remove());
    modal2.querySelectorAll('.wcp-pick-equipo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const equipo = btn.dataset.equipo;
        const contenedor = overlay.querySelector(`#wcp-knockout-${phaseId}`);
        if (contenedor) {
          const btnEliminacion = contenedor.querySelector(`.wcp-ko-pick[data-pair="${pair}"][data-side="${side}"]`);
          if (btnEliminacion) {
            btnEliminacion.textContent = `${this._getFlag(equipo)} ${equipo}`;
            btnEliminacion.dataset.elegido2 = equipo;
            btnEliminacion.style.color = 'var(--text-secondary)';
          }
        }
        modal2.remove();
      });
    });

    modal2.addEventListener('click', e => { if(e.target===modal2) modal2.remove(); });
  },

  
  async _save(overlay) {
    const usuario = await Auth.currentUser();
    if (!usuario) return;

    const prediccion = {};

    
    prediccion.grupos = {};
    Object.keys(GRUPOS_WC2026).forEach(g => {
      const elecciones = [...overlay.querySelectorAll(`.wcp-equipo-btn.seleccionado[data-group="${g}"]`)]
        .map(b => b.dataset.equipo);
      if (elecciones.length > 0) prediccion.grupos[g] = elecciones;
    });

    
    ['round32','r16','qf','sf','final'].forEach(phaseId => {
      prediccion[phaseId] = {};
      const contenedor = overlay.querySelector(`#wcp-knockout-${phaseId}`);
      if (!contenedor) return;
      contenedor.querySelectorAll('.wcp-match-row').forEach(row => {
        const pair = row.dataset.pair;
        const local = row.querySelector('.wcp-ko-pick[data-side="local"]')?.dataset.elegido2 || null;
        const visitante = row.querySelector('.wcp-ko-pick[data-side="visitante"]')?.dataset.elegido2 || null;
        const ganador = row.querySelector('.wcp-ganador-slot')?.dataset.elegido2 || null;
        if (local || visitante || ganador) prediccion[phaseId][pair] = { local, visitante, ganador };
      });
    });

    
    const btnCampeon = overlay.querySelector('.wcp-champion-btn[style*="rgba(200,160,0"]');
    prediccion.champion = btnCampeon?.dataset.equipo || null;

    
    prediccion.savedAt   = new Date().toISOString();
    prediccion.premiado  = usuario.wcPrediction?.premiado || {};

    usuario.wcPrediction = prediccion;
    await Auth.updateUser(usuario);

    try { localStorage.setItem(CLAVE_LS_WC, JSON.stringify(prediccion)); } catch(_) {}

    Toast.success('¡Predicción del Mundial guardada! 🏆');
    overlay.remove();
  },

  
  async evaluatePhase(phaseId, actualResults) {
    
    const usuario = await Auth.currentUser();
    if (!usuario || !usuario.wcPrediction) return 0;

    const prediccion    = usuario.wcPrediction;
    const premiado = prediccion.premiado || {};
    if (premiado[phaseId]) return 0;   

    const phase = FASES_WC.find(p => p.id === phaseId);
    if (!phase) return 0;

    let correcto = false;

    if (phaseId === 'grupos') {
      
      let gruposCorrectos = 0;
      const totalGrupos = Object.keys(actualResults).length;
      Object.entries(actualResults).forEach(([g, realTeams]) => {
        const predEquipos = prediccion.grupos?.[g] || [];
        const hit = predEquipos.filter(t => realTeams.includes(t)).length;
        if (hit === 2) gruposCorrectos++;
      });
      correcto = gruposCorrectos >= Math.ceil(totalGrupos * 0.5); 
    } else if (phaseId === 'champion') {
      correcto = prediccion.champion && actualResults === prediccion.champion;
    } else {
      
      const predGanadores = Object.values(prediccion[phaseId] || {})
        .map(r => r.ganador).filter(Boolean);
      const cantidadAciertos = predGanadores.filter(t => (actualResults || []).includes(t)).length;
      correcto = cantidadAciertos >= Math.ceil(predGanadores.length * 0.5);
    }

    if (correcto) {
      premiado[phaseId] = true;
      prediccion.premiado = premiado;
      usuario.wcPrediction = prediccion;
      usuario.tiradas = (usuario.tiradas || 0) + phase.recompensa;
      await Auth.updateUser(usuario);
      if (typeof DB !== 'undefined' && DB.logActivity)
        await DB.logActivity(usuario.email, 'wc_pred_reward', `${phaseId}: +${phase.recompensa} tiradas`);
      Toast.success(`🏆 ¡Fase acertada! +${phase.recompensa} tiradas 🎴`);
      return phase.recompensa;
    }

    return 0;
  },

  
  _getFlag(teamName) {
    const FLAGS = {
      'México':'🇲🇽','Mexico':'🇲🇽','Brasil':'🇧🇷','Brazil':'🇧🇷','Argentina':'🇦🇷',
      'Francia':'🇫🇷','France':'🇫🇷','España':'🇪🇸','Spain':'🇪🇸','Alemania':'🇩🇪',
      'Germany':'🇩🇪','Portugal':'🇵🇹','Marruecos':'🇲🇦','Morocco':'🇲🇦','Japón':'🇯🇵',
      'Japan':'🇯🇵','Canadá':'🇨🇦','Canada':'🇨🇦','Inglaterra':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Países Bajos':'🇳🇱','Netherlands':'🇳🇱','Uruguay':'🇺🇾','Ecuador':'🇪🇨',
      'Colombia':'🇨🇴','Chile':'🇨🇱','Perú':'🇵🇪','Peru':'🇵🇪','Croacia':'🇭🇷',
      'Croatia':'🇭🇷','Bélgica':'🇧🇪','Belgium':'🇧🇪','Italia':'🇮🇹','Italy':'🇮🇹',
      'Turquía':'🇹🇷','Turkey':'🇹🇷','Hungría':'🇭🇺','Hungary':'🇭🇺',
      'Rep. Checa':'🇨🇿','Czechia':'🇨🇿','Escocia':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'Bosnia-Herzegovina':'🇧🇦','Bosnia-Herz.':'🇧🇦','Bosnia y Herz.':'🇧🇦','Irlanda del N.':'🏴󠁧󠁢󠁮󠁩󠁲󠁿','Eslovenia':'🇸🇮','Panamá':'🇵🇦',
      'Paraguay':'🇵🇾','Bolivia':'🇧🇴','Venezuela':'🇻🇪','Costa Rica':'🇨🇷',
      'Austria':'🇦🇹','El Salvador':'🇸🇻','Jamaica':'🇯🇲','Uzbekistán':'🇺🇿',
      'Estados Unidos':'🇺🇸','USA':'🇺🇸','Arabia Saudí':'🇸🇦','Camerún':'🇨🇲',
      'Nueva Zelanda':'🇳🇿','Corea del Sur':'🇰🇷','Nigeria':'🇳🇬','Irak':'🇮🇶',
      'Sudáfrica':'🇿🇦','Haití':'🇭🇹','Curazao':'🇨🇼','Costa de Marfil':'🇨🇮',
      'Túnez':'🇹🇳','Egipto':'🇪🇬','Irán':'🇮🇷','Cabo Verde':'🇨🇻',
      'Arabia Saudita':'🇸🇦','Senegal':'🇸🇳','Noruega':'🇳🇴','Argelia':'🇩🇿',
      'Jordania':'🇯🇴','RD Congo':'🇨🇩','Suecia':'🇸🇪','Qatar':'🇶🇦',
      'Suiza':'🇨🇭','Australia':'🇦🇺','Ghana':'🇬🇭','EE.UU.':'🇺🇸',
    };
    return FLAGS[teamName] || '🏳️';
  },

  _getAllTeams() {
    const all = new Set();
    Object.values(GRUPOS_WC2026).forEach(equipos => equipos.forEach(t => all.add(t)));
    return [...all].sort();
  },

  _calcStatus(prediccion) {
    const status = {};
    FASES_WC.forEach(etapa => {
      status[etapa.id] = prediccion.premiado?.[etapa.id] ? 'won' : 'pendientes';
    });
    return status;
  }
};
