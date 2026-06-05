/**
 * predictions.js — Sistema de Predicciones  v3
 * Mejoras v6:
 *   - Escudos reales de selecciones (flagcdn)
 *   - Amistosos pre-mundial incluidos
 *   - Badge "Amistoso" vs "Mundial" 
 *   - Sede del partido
 *   - Diseño mejorado
 */

const Predictions = {

  async render() {
    const matches = await API.getPredictableMatches();
    const user    = await Auth.currentUser();
    const preds   = user?.predicciones || [];
    const list    = document.getElementById('predictions-list');
    if (!list) return;

    if (!matches || matches.length === 0) {
      list.innerHTML = '<p class="empty-state">No hay partidos disponibles para predecir en este momento.</p>';
      return;
    }

    list.innerHTML = matches.map(m => {
      const existing = preds.find(p => p.matchId === m.id);
      const isLocked = !!existing;
      const isFriendly = m.type === 'friendly';

      // Escudos reales
      const homeCrest = API.getCrest(m.home);
      const awayCrest = API.getCrest(m.away);

      return `
        <div class="prediction-card" data-match="${m.id}">
          <div class="pred-meta">
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <span class="pred-type-badge ${isFriendly ? 'pred-type-friendly' : 'pred-type-worldcup'}">
                ${isFriendly ? '🤝 Amistoso' : '🏆 Mundial 2026'}
              </span>
              <span class="pred-competition">${m.competition || 'Mundial 2026'}</span>
            </div>
            <span class="pred-date">${this._formatDate(m.date)}${m.time ? ' · ' + m.time : ''}</span>
          </div>

          <div class="prediction-match">
            <div class="pred-team-block">
              ${homeCrest
                ? `<img src="${homeCrest}" alt="${m.home}" class="pred-crest" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">`
                : ''}
              <span class="pred-crest-fallback" style="${homeCrest ? 'display:none' : ''}">${m.homeFlag || '🏠'}</span>
              <span class="pred-team-name">${m.home}</span>
            </div>

            <div class="pred-vs-block">
              <span class="pred-vs">VS</span>
              <span class="pred-date-badge">${this._formatDate(m.date)}</span>
            </div>

            <div class="pred-team-block">
              ${awayCrest
                ? `<img src="${awayCrest}" alt="${m.away}" class="pred-crest" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">`
                : ''}
              <span class="pred-crest-fallback" style="${awayCrest ? 'display:none' : ''}">${m.awayFlag || '✈️'}</span>
              <span class="pred-team-name">${m.away}</span>
            </div>
          </div>

          ${m.venue ? `<div class="pred-venue">📍 ${m.venue}</div>` : ''}

          ${isLocked
            ? this._renderLocked(existing)
            : this._renderOpen(m)
          }
        </div>
      `;
    }).join('');

    // Botones de predicción
    list.querySelectorAll('.pred-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.prediction-card');
        card.querySelectorAll('.pred-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    // Botón confirmar
    list.querySelectorAll('.btn-confirm-pred').forEach(btn => {
      btn.addEventListener('click', () => {
        const card     = btn.closest('.prediction-card');
        const matchId  = card.dataset.match;
        const selected = card.querySelector('.pred-btn.selected');
        if (!selected) { Toast.warn('Selecciona un resultado antes de confirmar'); return; }
        const exact = card.querySelector('.exact-score')?.value.trim() || '';
        this._savePrediction(matchId, selected.dataset.pick, exact, card);
      });
    });
  },

  _renderOpen(m) {
    const homeCrest = API.getCrest(m.home);
    const awayCrest = API.getCrest(m.away);

    return `
      <div class="prediction-btns">
        <button class="pred-btn" data-pick="home">
          ${homeCrest ? `<img src="${homeCrest}" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;margin-right:4px" onerror="this.remove()">` : (m.homeFlag || '') + ' '}
          ${m.home}
        </button>
        <button class="pred-btn" data-pick="draw">🤝 Empate</button>
        <button class="pred-btn" data-pick="away">
          ${awayCrest ? `<img src="${awayCrest}" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;margin-right:4px" onerror="this.remove()">` : (m.awayFlag || '') + ' '}
          ${m.away}
        </button>
      </div>
      <div class="pred-exact-row">
        <input type="text" class="exact-score"
          placeholder="Resultado exacto opcional: 2-1"
          pattern="[0-9]+-[0-9]+"
          maxlength="7"
          title="Formato: goles_local-goles_visitante (ej: 2-1)">
      </div>
      <div class="pred-rewards-info">
        <span>🎴 Acertar ganador: <strong>+1 tirada</strong></span>
        <span>🎯 Resultado exacto: <strong>+3 tiradas</strong></span>
      </div>
      <button class="btn-confirm-pred">
        Confirmar predicción ✓
      </button>
    `;
  },

  _renderLocked(pred) {
    const resultIcon = pred.result === 'win' ? '✅' : pred.result === 'loss' ? '❌' : '⏳';
    const resultText = pred.result === 'win' ? 'Acertaste' : pred.result === 'loss' ? 'Fallaste' : 'Pendiente';
    return `
      <div class="pred-locked">
        <div class="pred-locked-pick">
          🎯 Predicción: <strong>${this._labelPred(pred.pick)}</strong>
          ${pred.exact ? ` · Marcador: <strong>${pred.exact}</strong>` : ''}
        </div>
        <div class="pred-result ${pred.result}">
          ${resultIcon} ${resultText}
          ${pred.result === 'win' ? ' — +1 🎴' : ''}
          ${pred.exactCorrect ? ' +3 🎴 (¡marcador exacto!)' : ''}
        </div>
      </div>
    `;
  },

  _labelPred(pick) {
    if (pick === 'home') return 'Local';
    if (pick === 'away') return 'Visitante';
    if (pick === 'draw') return 'Empate';
    return pick;
  },

  _formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-');
      const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      return `${d} ${months[parseInt(m)-1]}`;
    } catch(_) { return dateStr; }
  },

  async _savePrediction(matchId, pick, exact, card) {
    if (exact && !/^\d+-\d+$/.test(exact)) {
      Toast.warn('Formato de marcador inválido. Usa: 2-1');
      return;
    }

    const user = await Auth.currentUser();
    if (!user) return;

    const preds = user.predicciones || [];
    if (preds.find(p => p.matchId === matchId)) {
      Toast.warn('Ya tienes una predicción para este partido');
      return;
    }

    preds.push({
      matchId,
      pick,
      exact:     exact || null,
      result:    'pending',
      timestamp: new Date().toISOString()
    });

    user.predicciones = preds;
    await Auth.updateUser(user);
    await DB.logActivity(user.email, 'prediction', `${matchId}: ${pick}${exact ? ' ('+exact+')' : ''}`);

    Toast.success('¡Predicción guardada! 🎯 Buena suerte');
    setTimeout(() => this.render(), 800);
  },

  /**
   * evaluatePredictions(finishedMatches)
   * Llama desde dashboard al actualizar stats.
   */
  async evaluatePredictions(finishedMatches) {
    const user = await Auth.currentUser();
    if (!user || !Array.isArray(finishedMatches) || !finishedMatches.length) return 0;

    let tirasGanadas = 0;
    let newWins      = 0;
    const preds      = user.predicciones || [];

    for (const pred of preds) {
      if (pred.result !== 'pending') continue;
      const match = finishedMatches.find(m => String(m.id) === String(pred.matchId));
      if (!match || !match.finalResult) continue;

      if (pred.pick === match.finalResult) {
        pred.result = 'win';
        tirasGanadas += 1;
        newWins++;
      } else {
        pred.result = 'loss';
      }

      if (pred.exact && match.exactScore && pred.exact === match.exactScore) {
        pred.exactCorrect = true;
        tirasGanadas += 3;
      }
    }

    if (tirasGanadas > 0) {
      user.tiradas  = (user.tiradas  || 0) + tirasGanadas;
      user.aciertos = (user.aciertos || 0) + newWins;
      user.predicciones = preds;
      await Auth.updateUser(user);
      await DB.logActivity(user.email, 'pred_reward', `+${tirasGanadas} tiradas por predicciones`);
      Toast.success(`🎉 ¡Acertaste predicciones! +${tirasGanadas} tiradas`);
    }

    user.predicciones = preds;
    await Auth.updateUser(user);
    return tirasGanadas;
  }
};
