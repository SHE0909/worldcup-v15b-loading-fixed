/**
 * wc_predictor.js — Predictor de Mundial 2026
 *
 * Sistema de predicción completa del torneo:
 *   • Fase de Grupos  → 10 tiradas si aciertas qué equipos pasan de cada grupo
 *   • Ronda de 32     → 10 tiradas por fase acertada
 *   • Octavos         → 10 tiradas
 *   • Cuartos         → 10 tiradas
 *   • Semifinales     → 10 tiradas
 *   • Final           → 10 tiradas
 *   • Campeón exacto  → 50 tiradas adicionales
 *
 * Las recompensas se calculan automáticamente cuando la API confirma
 * que la fase terminó (status de fixtures FT/AET/PEN).
 *
 * Almacenamiento: user.wcPrediction (en Firestore vía Auth.updateUser)
 */

/* ── Grupos del Mundial 2026 (48 equipos, 12 grupos A–L) ────────────── */
/* NOTA: estos grupos coinciden con MOCK.teams en api.js y el fixture real del sorteo.
   Se cargan también dinámicamente desde MOCK.teams o la API al abrir el predictor. */
const WC2026_GROUPS = {
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

const WC_PHASES = [
  { id:'groups',   label:'Fase de Grupos',  reward:10 },
  { id:'round32',  label:'Ronda de 32',     reward:10 },
  { id:'r16',      label:'Octavos de Final',reward:10 },
  { id:'qf',       label:'Cuartos de Final',reward:10 },
  { id:'sf',       label:'Semifinales',     reward:10 },
  { id:'final',    label:'Final',           reward:10 },
  { id:'champion', label:'Campeón',         reward:50 },
];

const WC_LS_KEY = 'wcc_wc_prediction';   // localStorage backup

const WorldCupPredictor = {

  /* ── Abrir el panel de predicción ───────────────────────────────── */
  async open() {
    const user = await Auth.currentUser();
    if (!user) { Toast.warn('Inicia sesión para predecir'); return; }

    // Cargar grupos dinámicamente desde MOCK.teams (o API) para tener datos correctos
    await this._loadGroupsFromTeams();

    const pred = user.wcPrediction || {};
    const overlay = document.createElement('div');
    overlay.id = 'wcp-overlay';
    overlay.style.cssText = `
      position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;
      background:rgba(10,12,20,0.97);overflow-y:auto;
      display:flex;flex-direction:column;`;

    overlay.innerHTML = this._buildUI(pred);
    document.body.appendChild(overlay);

    // Botón cerrar
    overlay.querySelector('#wcp-close').addEventListener('click', () => overlay.remove());

    // Navegación de fases
    overlay.querySelectorAll('.wcp-phase-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        overlay.querySelectorAll('.wcp-phase-tab').forEach(t => t.classList.remove('active'));
        overlay.querySelectorAll('.wcp-phase-panel').forEach(p => p.style.display = 'none');
        tab.classList.add('active');
        overlay.querySelector(`#wcp-panel-${tab.dataset.phase}`).style.display = '';
        if (tab.dataset.phase === 'champion') this._refreshChampionOptions(overlay);
      });
    });

    // Botón guardar
    overlay.querySelector('#wcp-save').addEventListener('click', () => this._save(overlay));

    // Populate group pickers
    this._initGroupPickers(overlay, pred);
    this._initKnockoutPickers(overlay, pred);
  },

  /* ── Cargar grupos desde MOCK.teams (fuente de verdad) ────────────── */
  async _loadGroupsFromTeams() {
    try {
      // Intentar obtener equipos reales de la API
      const teams = typeof API !== 'undefined' ? await API.getTeams() : null;
      const source = (teams?.length) ? teams : (typeof MOCK !== 'undefined' ? MOCK.teams : null);
      if (!source?.length) return;

      // Reconstruir grupos desde la fuente de datos
      const byGroup = {};
      source.forEach(t => {
        if (!t.group) return;
        if (!byGroup[t.group]) byGroup[t.group] = [];
        byGroup[t.group].push(t.name);
      });

      // Solo sobreescribir si tenemos grupos válidos (A-L con 4 equipos)
      const keys = Object.keys(byGroup);
      if (keys.length >= 8) {
        keys.forEach(g => {
          if (byGroup[g].length >= 2) WC2026_GROUPS[g] = byGroup[g];
        });
      }
    } catch(_) {}
  },

  /* ── Construir HTML del overlay ─────────────────────────────────── */
  _buildUI(pred) {
    const statusInfo = this._calcStatus(pred);
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
            ${WC_PHASES.map(ph => {
              const s = statusInfo[ph.id] || 'pending';
              const icon = s === 'won' ? '✅' : s === 'lost' ? '❌' : '⏳';
              const col  = s === 'won' ? '#4caf6a' : s === 'lost' ? '#e05555' : 'var(--text-muted)';
              return `<div style="font-size:0.7rem;color:${col};background:rgba(255,255,255,0.04);
                border-radius:8px;padding:0.35rem 0.5rem;text-align:center;">
                ${icon} ${ph.label}<br>
                <span style="font-weight:800;color:var(--gold)">${ph.reward} 🎴</span>
              </div>`;
            }).join('')}
          </div>
          <p style="font-size:0.72rem;color:var(--gold);font-weight:700;margin:0.6rem 0 0;text-align:right">
            Total posible: <strong>${WC_PHASES.reduce((s,p)=>s+p.reward,0)} tiradas</strong>
          </p>
        </div>

        <!-- Tabs de fases -->
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.75rem;">
          ${['groups','round32','r16','qf','sf','final','champion'].map((ph,i) => `
            <button class="wcp-phase-tab${i===0?' active':''}" data-phase="${ph}"
              style="background:${i===0?'var(--gold)':'var(--card-bg,#181c28)'};
                color:${i===0?'#000':'var(--text-secondary)'};
                border:1px solid ${i===0?'var(--gold)':'var(--border)'};
                border-radius:8px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.7rem;font-weight:700;">
              ${WC_PHASES[i].label}
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
    const groups = Object.keys(WC2026_GROUPS);
    return `
      <div class="wcp-phase-panel" id="wcp-panel-groups" style="">
        <p style="font-size:0.72rem;color:var(--text-muted);margin:0 0 0.75rem">
          Selecciona los <strong style="color:var(--gold)">2 equipos</strong> que clasifican de cada grupo.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:0.5rem;">
          ${groups.map(g => `
            <div style="background:var(--card-bg,#181c28);border:1px solid var(--border);
              border-radius:10px;padding:0.75rem;">
              <p style="font-size:0.65rem;font-weight:800;color:var(--gold);letter-spacing:1px;
                text-transform:uppercase;margin:0 0 0.4rem">Grupo ${g}</p>
              <div class="wcp-group-picks" data-group="${g}"
                style="display:grid;grid-template-columns:1fr 1fr;gap:0.3rem;">
                ${WC2026_GROUPS[g].map(team => `
                  <button class="wcp-team-btn" data-team="${team}" data-group="${g}"
                    style="background:rgba(255,255,255,0.05);border:1px solid var(--border);
                      border-radius:8px;padding:0.4rem 0.5rem;cursor:pointer;
                      font-size:0.72rem;color:var(--text-secondary);text-align:left;
                      transition:all 0.15s;white-space:nowrap;overflow:hidden;
                      text-overflow:ellipsis;">
                    ${this._getFlag(team)} ${team}
                  </button>`).join('')}
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  },

  _buildKnockoutPanel(phaseId, label, slots, out) {
    const pairs = slots / 2;
    return `
      <div class="wcp-phase-panel" id="wcp-panel-${phaseId}" style="display:none">
        <p style="font-size:0.72rem;color:var(--text-muted);margin:0 0 0.75rem">
          Selecciona los <strong style="color:var(--gold)">${out} clasificados</strong> de ${label}.
          <br><span style="font-size:0.65rem">(Los equipos disponibles se poblarán con tu predicción de la fase anterior)</span>
        </p>
        <div id="wcp-knockout-${phaseId}" style="display:flex;flex-direction:column;gap:0.5rem;">
          ${Array(pairs).fill(0).map((_,i) => `
            <div class="wcp-match-row" data-phase="${phaseId}" data-pair="${i}"
              style="background:var(--card-bg,#181c28);border:1px solid var(--border);
                border-radius:10px;padding:0.6rem 0.75rem;display:flex;align-items:center;gap:0.5rem;">
              <button class="wcp-ko-pick" data-phase="${phaseId}" data-pair="${i}" data-side="home"
                style="flex:1;background:rgba(255,255,255,0.05);border:1px solid var(--border);
                  border-radius:8px;padding:0.4rem;cursor:pointer;font-size:0.75rem;
                  color:var(--text-muted);">?</button>
              <span style="font-size:0.65rem;color:var(--text-muted);flex-shrink:0">vs</span>
              <button class="wcp-ko-pick" data-phase="${phaseId}" data-pair="${i}" data-side="away"
                style="flex:1;background:rgba(255,255,255,0.05);border:1px solid var(--border);
                  border-radius:8px;padding:0.4rem;cursor:pointer;font-size:0.75rem;
                  color:var(--text-muted);">?</button>
              <span style="font-size:0.65rem;color:var(--text-muted);flex-shrink:0">→</span>
              <div class="wcp-winner-slot" data-phase="${phaseId}" data-pair="${i}"
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

  /* ── Inicializar picks de grupos ────────────────────────────────── */
  _initGroupPickers(overlay, pred) {
    const groupPred = pred.groups || {};

    // Restaurar picks guardados
    Object.keys(groupPred).forEach(g => {
      const picks = groupPred[g] || [];
      picks.forEach(team => {
        const btn = overlay.querySelector(`.wcp-team-btn[data-team="${team}"][data-group="${g}"]`);
        if (btn) this._selectTeamBtn(btn, overlay, g);
      });
    });

    overlay.querySelectorAll('.wcp-team-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.dataset.group;
        const picks = overlay.querySelectorAll(`.wcp-team-btn.selected[data-group="${group}"]`);
        if (btn.classList.contains('selected')) {
          btn.classList.remove('selected');
          this._styleTeamBtn(btn, false);
        } else if (picks.length < 2) {
          this._selectTeamBtn(btn, overlay, group);
        } else {
          Toast.warn('Solo puedes seleccionar 2 equipos por grupo');
        }
      });
    });
  },

  _selectTeamBtn(btn, overlay, group) {
    btn.classList.add('selected');
    this._styleTeamBtn(btn, true);
  },

  _styleTeamBtn(btn, selected) {
    if (selected) {
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

  /* ── Equipos disponibles para una fase, según los picks de la fase anterior ── */
  _getAvailableTeams(overlay, phaseId) {
    if (phaseId === 'round32') {
      // Todos los equipos elegidos como clasificados de grupo (hasta 24)
      const teams = new Set();
      Object.keys(WC2026_GROUPS).forEach(g => {
        overlay.querySelectorAll(`.wcp-team-btn.selected[data-group="${g}"]`).forEach(b => teams.add(b.dataset.team));
      });
      return [...teams];
    }
    // r16, qf, sf, final → ganadores elegidos en la fase anterior
    const prevMap = { r16:'round32', qf:'r16', sf:'qf', final:'sf', champion_from_final:'final' };
    const prevPhase = prevMap[phaseId];
    if (!prevPhase) return this._getAllTeams();
    const prevContainer = overlay.querySelector(`#wcp-knockout-${prevPhase}`);
    const teams = new Set();
    if (prevContainer) {
      prevContainer.querySelectorAll('.wcp-winner-slot').forEach(slot => {
        if (slot.dataset.picked) teams.add(slot.dataset.picked);
      });
    }
    return [...teams];
  },

  /* ── Refrescar opciones de campeón con los finalistas elegidos ──── */
  _refreshChampionOptions(overlay) {
    const finalists = this._getAvailableTeams(overlay, 'champion_from_final');
    const grid = overlay.querySelector('#wcp-champion-grid');
    if (!grid) return;
    if (finalists.length === 0) {
      grid.innerHTML = `<p style="grid-column:1/-1;font-size:0.7rem;color:var(--text-muted);text-align:center">
        Primero selecciona los finalistas en la pestaña "Final"</p>`;
      return;
    }
    grid.innerHTML = finalists.map(t => `
      <button class="wcp-champion-btn" data-team="${t}"
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
        if (el) el.textContent = `🏆 ${this._getFlag(btn.dataset.team)} ${btn.dataset.team}`;
      });
    });
  },

  /* ── Inicializar picks de eliminatorias ─────────────────────────── */
  _initKnockoutPickers(overlay, pred) {
    // Para cada fase de eliminatoria, los equipos disponibles vienen
    // de la predicción de la fase anterior
    const phases = ['round32','r16','qf','sf','final'];
    phases.forEach(phaseId => {
      const phasePred = pred[phaseId] || {};
      const container = overlay.querySelector(`#wcp-knockout-${phaseId}`);
      if (!container) return;

      // Poblar con equipos guardados
      Object.entries(phasePred).forEach(([pairKey, data]) => {
        const pair = parseInt(pairKey);
        if (data.home) {
          const homeBtn = container.querySelector(`.wcp-ko-pick[data-pair="${pair}"][data-side="home"]`);
          if (homeBtn) { homeBtn.textContent = `${this._getFlag(data.home)} ${data.home}`; homeBtn.dataset.picked = data.home; this._styleKoBtn(homeBtn, false); }
        }
        if (data.away) {
          const awayBtn = container.querySelector(`.wcp-ko-pick[data-pair="${pair}"][data-side="away"]`);
          if (awayBtn) { awayBtn.textContent = `${this._getFlag(data.away)} ${data.away}`; awayBtn.dataset.picked = data.away; this._styleKoBtn(awayBtn, false); }
        }
        if (data.winner) {
          const slot = container.querySelector(`.wcp-winner-slot[data-pair="${pair}"]`);
          if (slot) { slot.textContent = `${this._getFlag(data.winner)} ${data.winner}`; slot.dataset.picked = data.winner; }
        }
      });

      // Click en botones home/away → abrir selector de equipo
      container.querySelectorAll('.wcp-ko-pick').forEach(btn => {
        btn.addEventListener('click', () => {
          const pair = btn.dataset.pair;
          const side = btn.dataset.side;
          this._openTeamPicker(overlay, phaseId, pair, side, pred);
        });
      });
    });

    // Champion picker
    const champPred = pred.champion;
    this._refreshChampionOptions(overlay);
    if (champPred) {
      const el = overlay.querySelector('#wcp-champion-pick');
      if (el) el.textContent = `🏆 ${this._getFlag(champPred)} ${champPred}`;
      const btn = overlay.querySelector(`.wcp-champion-btn[data-team="${champPred}"]`);
      if (btn) { btn.style.background='rgba(200,160,0,0.2)'; btn.style.borderColor='var(--gold)'; btn.style.color='var(--gold)'; btn.style.fontWeight='700'; }
    }
  },

  _styleKoBtn(btn, selected) {
    btn.style.color = 'var(--text-secondary)';
  },

  /* ── Selector de equipo para rondas de eliminatoria ─────────────── */
  _openTeamPicker(overlay, phaseId, pair, side, pred) {
    const available = this._getAvailableTeams(overlay, phaseId);
    if (available.length === 0) {
      const prevLabel = phaseId === 'round32' ? 'Fase de Grupos' : 'la fase anterior';
      Toast.warn(`Primero selecciona los clasificados en ${prevLabel}`);
      return;
    }
    const modal = document.createElement('div');
    modal.style.cssText = `
      position:fixed;top:0;left:0;right:0;bottom:0;z-index:10000;
      background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;`;
    modal.innerHTML = `
      <div style="background:var(--bg,#0f1117);border:1px solid var(--border);border-radius:16px;
        padding:1rem;max-width:350px;width:90%;max-height:80vh;overflow-y:auto;">
        <h3 style="font-size:0.9rem;color:var(--gold);margin:0 0 0.75rem">Seleccionar equipo</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.35rem;">
          ${available.map(t => `
            <button class="wcp-pick-team-btn" data-team="${t}"
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
    document.body.appendChild(modal);

    modal.querySelector('#wcp-picker-cancel').addEventListener('click', () => modal.remove());
    modal.querySelectorAll('.wcp-pick-team-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const team = btn.dataset.team;
        const container = overlay.querySelector(`#wcp-knockout-${phaseId}`);
        if (container) {
          const koBtn = container.querySelector(`.wcp-ko-pick[data-pair="${pair}"][data-side="${side}"]`);
          if (koBtn) {
            koBtn.textContent = `${this._getFlag(team)} ${team}`;
            koBtn.dataset.picked = team;
            koBtn.style.color = 'var(--text-secondary)';
          }
        }
        modal.remove();
      });
    });

    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
  },

  /* ── Guardar predicción ─────────────────────────────────────────── */
  async _save(overlay) {
    const user = await Auth.currentUser();
    if (!user) return;

    const pred = {};

    // Grupos
    pred.groups = {};
    Object.keys(WC2026_GROUPS).forEach(g => {
      const picks = [...overlay.querySelectorAll(`.wcp-team-btn.selected[data-group="${g}"]`)]
        .map(b => b.dataset.team);
      if (picks.length > 0) pred.groups[g] = picks;
    });

    // Fases eliminatorias
    ['round32','r16','qf','sf','final'].forEach(phaseId => {
      pred[phaseId] = {};
      const container = overlay.querySelector(`#wcp-knockout-${phaseId}`);
      if (!container) return;
      container.querySelectorAll('.wcp-match-row').forEach(row => {
        const pair = row.dataset.pair;
        const home = row.querySelector('.wcp-ko-pick[data-side="home"]')?.dataset.picked || null;
        const away = row.querySelector('.wcp-ko-pick[data-side="away"]')?.dataset.picked || null;
        const winner = row.querySelector('.wcp-winner-slot')?.dataset.picked || null;
        if (home || away || winner) pred[phaseId][pair] = { home, away, winner };
      });
    });

    // Campeón
    const champBtn = overlay.querySelector('.wcp-champion-btn[style*="rgba(200,160,0"]');
    pred.champion = champBtn?.dataset.team || null;

    // Timestamps de cuando fue hecha la predicción
    pred.savedAt   = new Date().toISOString();
    pred.rewarded  = user.wcPrediction?.rewarded || {};

    user.wcPrediction = pred;
    await Auth.updateUser(user);

    try { localStorage.setItem(WC_LS_KEY, JSON.stringify(pred)); } catch(_) {}

    Toast.success('¡Predicción del Mundial guardada! 🏆');
    overlay.remove();
  },

  /* ── Evaluar recompensas (llamar cuando termine cada fase) ──────── */
  async evaluatePhase(phaseId, actualResults) {
    /*
      actualResults: objeto con los equipos reales que pasaron
      Formato por fase:
        groups:   { A: ['Brasil','Francia'], B: [...], ... }
        r16..final: ['Brasil','Francia', ...]   (lista de clasificados)
        champion: 'Brasil'
    */
    const user = await Auth.currentUser();
    if (!user || !user.wcPrediction) return 0;

    const pred    = user.wcPrediction;
    const rewarded = pred.rewarded || {};
    if (rewarded[phaseId]) return 0;   // ya se otorgó el premio de esta fase

    const phase = WC_PHASES.find(p => p.id === phaseId);
    if (!phase) return 0;

    let correct = false;

    if (phaseId === 'groups') {
      // Verificar cada grupo: ¿los 2 clasificados predichos coinciden con los reales?
      let groupsCorrect = 0;
      const totalGroups = Object.keys(actualResults).length;
      Object.entries(actualResults).forEach(([g, realTeams]) => {
        const predTeams = pred.groups?.[g] || [];
        const hit = predTeams.filter(t => realTeams.includes(t)).length;
        if (hit === 2) groupsCorrect++;
      });
      correct = groupsCorrect >= Math.ceil(totalGroups * 0.5); // al menos 50% de grupos
    } else if (phaseId === 'champion') {
      correct = pred.champion && actualResults === pred.champion;
    } else {
      // Para rondas de eliminatoria: comparar ganadores predichos con reales
      const predWinners = Object.values(pred[phaseId] || {})
        .map(r => r.winner).filter(Boolean);
      const hitCount = predWinners.filter(t => (actualResults || []).includes(t)).length;
      correct = hitCount >= Math.ceil(predWinners.length * 0.5);
    }

    if (correct) {
      rewarded[phaseId] = true;
      pred.rewarded = rewarded;
      user.wcPrediction = pred;
      user.tiradas = (user.tiradas || 0) + phase.reward;
      await Auth.updateUser(user);
      if (typeof DB !== 'undefined' && DB.logActivity)
        await DB.logActivity(user.email, 'wc_pred_reward', `${phaseId}: +${phase.reward} tiradas`);
      Toast.success(`🏆 ¡Fase acertada! +${phase.reward} tiradas 🎴`);
      return phase.reward;
    }

    return 0;
  },

  /* ── Helpers ────────────────────────────────────────────────────── */
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
    Object.values(WC2026_GROUPS).forEach(teams => teams.forEach(t => all.add(t)));
    return [...all].sort();
  },

  _calcStatus(pred) {
    const status = {};
    WC_PHASES.forEach(ph => {
      status[ph.id] = pred.rewarded?.[ph.id] ? 'won' : 'pending';
    });
    return status;
  }
};
