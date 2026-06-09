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
      const existing   = preds.find(p => p.matchId === m.id);
      const isLocked   = !!existing;
      const isFriendly = m.type === 'friendly';
      const state      = API.getMatchState(m);       // 'upcoming'|'starting_soon'|'live'|'finished'|'closed'
      const isClosed   = isLocked || state === 'closed' || state === 'live' || state === 'finished';

      // Etiqueta de estado
      let stateHtml = '';
      if (state === 'live') {
        stateHtml = `<span class="pred-state-badge pred-state-live">🔴 EN DIRECTO</span>`;
      } else if (state === 'starting_soon') {
        stateHtml = `<span class="pred-state-badge pred-state-soon">⚡ Por comenzar · ${API.getTimeUntilMatch(m)}</span>`;
      } else if (state === 'closed' && !isLocked) {
        stateHtml = `<span class="pred-state-badge pred-state-closed">🔒 Predicción cerrada</span>`;
      } else if (state === 'upcoming' && !isLocked) {
        const timeLeft = API.getTimeUntilMatch(m);
        // Avisar cuando cierra pronto (dentro de las próximas 4h pero aún abierto)
        const matchTs = new Date(`${m.date}T${m.time}:00`).getTime();
        const diffH   = (matchTs - Date.now()) / 3600000;
        if (diffH <= 5) {
          stateHtml = `<span class="pred-state-badge pred-state-warning">⏰ Cierra ${timeLeft}</span>`;
        }
      }

      // Escudos reales
      const homeCrest = API.getCrest(m.home);
      const awayCrest = API.getCrest(m.away);

      return `
        <div class="prediction-card" data-match="${m.id}">
          <div class="pred-meta">
            <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
              <span class="pred-type-badge ${isFriendly ? 'pred-type-friendly' : 'pred-type-worldcup'}">
                ${isFriendly ? '🤝 Amistoso' : '🏆 Mundial 2026'}
              </span>
              <span class="pred-competition">${m.competition || 'Mundial 2026'}</span>
              ${stateHtml}
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
              <span class="pred-vs">${state === 'live' ? `<span style="color:#ff4466">${m.scoreHome??0} — ${m.scoreAway??0}</span>` : 'VS'}</span>
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

          ${state === 'starting_soon' && !isLocked ? `
            <div class="pred-lineup-row">
              <button class="btn-lineup" data-match="${m.id}">👕 Ver alineación</button>
            </div>` : ''}

          ${isLocked
            ? this._renderLocked(existing)
            : isClosed
              ? this._renderClosed(state)
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
        // Mostrar hint de empate si se selecciona "Empate"
        const hint = card.querySelector('.draw-score-hint');
        if (hint) hint.style.display = btn.dataset.pick === 'draw' ? 'block' : 'none';
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

    // Botón Ver Alineación
    list.querySelectorAll('.btn-lineup').forEach(btn => {
      btn.addEventListener('click', () => this._showLineup(btn.dataset.match, matches));
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
        <div class="draw-score-hint" style="display:none;font-size:0.75rem;color:#ffaa44;margin-top:4px">
          ⚠️ Para empate el marcador debe ser igualado: 0-0, 1-1, 2-2…
        </div>
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

  _renderClosed(state) {
    const msg = state === 'live'
      ? '🔴 Partido en curso — predicciones cerradas'
      : state === 'finished'
        ? '✅ Partido finalizado'
        : '🔒 Predicciones cerradas (faltan menos de 3h)';
    return `
      <div class="pred-locked" style="text-align:center;padding:0.75rem 0;">
        <span style="font-size:0.78rem;color:var(--text-muted)">${msg}</span>
      </div>
    `;
  },

  async _showLineup(matchId, matches) {
    const m = matches.find(x => x.id === matchId);
    if (!m) return;

    // Intentar obtener alineación de api-football si el id es af_*
    let lineupHtml = '';
    if (matchId.startsWith('af_')) {
      try {
        const fixtureId = matchId.replace('af_', '');
        const af = await API._af(`/fixtures/lineups?fixture=${fixtureId}`);
        if (af?.response?.length > 0) {
          lineupHtml = af.response.map(team => {
            const starters   = (team.startXI || []).map(p => p.player.name).join(', ');
            const subs       = (team.substitutes || []).map(p => p.player.name).join(', ');
            const formation  = team.formation ? `[${team.formation}]` : '';
            return `
              <div style="margin-bottom:0.75rem">
                <p style="font-weight:700;color:var(--gold);margin-bottom:0.25rem">
                  ${team.team?.name || ''} ${formation}
                </p>
                <p style="font-size:0.7rem;color:var(--text-secondary);margin-bottom:0.15rem">
                  <strong>Titulares:</strong> ${starters || '—'}
                </p>
                <p style="font-size:0.7rem;color:var(--text-muted)">
                  <strong>Suplentes:</strong> ${subs || '—'}
                </p>
              </div>`;
          }).join('<hr style="border-color:var(--border);margin:0.5rem 0">');
        }
      } catch(_) {}
    }

    if (!lineupHtml) {
      lineupHtml = `<p style="font-size:0.75rem;color:var(--text-muted);text-align:center;padding:0.5rem 0">
        Alineación aún no confirmada.<br>Vuelve a revisar más cerca del inicio.
      </p>`;
    }

    Modal.open(`
      <div class="modal-player-detail">
        <h2 class="modal-player-name" style="margin-bottom:0.25rem">👕 Alineación</h2>
        <p style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.75rem">
          ${m.homeFlag||''} ${m.home} vs ${m.away} ${m.awayFlag||''}
        </p>
        ${lineupHtml}
      </div>
    `);
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

    // Validar que empate tenga marcador igualado
    if (pick === 'draw' && exact) {
      const [g1, g2] = exact.split('-').map(Number);
      if (g1 !== g2) {
        Toast.warn('En un empate ambos equipos deben tener los mismos goles. Ej: 1-1');
        return;
      }
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
   * También acepta partidos recién terminados del live feed para
   * actualizar predicciones en tiempo real sin esperar a "Actualizar stats".
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
      if (!match) continue;

      // Aceptar tanto finalResult (campo legado) como marcador directo del live feed
      let finalResult = match.finalResult;
      if (!finalResult && match.scoreHome !== undefined && match.scoreAway !== undefined
          && match.status === 'finished') {
        const sh = Number(match.scoreHome), sa = Number(match.scoreAway);
        finalResult = sh > sa ? 'home' : sa > sh ? 'away' : 'draw';
        // Guardar marcador final en la predicción para mostrarlo en el historial
        pred.finalScore = `${sh}–${sa}`;
        pred.finalHome  = match.home  || '';
        pred.finalAway  = match.away  || '';
      }
      if (!finalResult) continue;

      if (pred.pick === finalResult) {
        pred.result = 'win';
        tirasGanadas += 1;
        newWins++;
      } else {
        pred.result = 'loss';
      }

      const exactScore = match.exactScore || pred.finalScore;
      if (pred.exact && exactScore && pred.exact === exactScore) {
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
      Toast.success(`¡Predicciones acertadas! +${tirasGanadas} tiradas`);
    } else {
      // Guardar igualmente para registrar marcadores finales aunque no haya premio
      const hadPending = (user.predicciones || []).some(p => p.result === 'pending'
        && finishedMatches.some(m => String(m.id) === String(p.matchId)));
      if (hadPending) {
        user.predicciones = preds;
        await Auth.updateUser(user);
      }
    }

    return tirasGanadas;
  },

  /**
   * checkLiveFinished — llama desde el timer de live cada vez que renderUpcoming
   * detecta partidos que acaban de cambiar a 'finished'. Evalúa predicciones
   * automáticamente sin intervención del usuario.
   */
  async checkLiveFinished(allMatches) {
    if (!Array.isArray(allMatches) || !allMatches.length) return;
    const finished = allMatches.filter(m => m.status === 'finished'
      && m.scoreHome !== undefined && m.scoreAway !== undefined);
    if (!finished.length) return;
    await this.evaluatePredictions(finished);
    // Refrescar panel si está visible
    const el = document.getElementById('predictions-list');
    if (el && document.getElementById('tab-predictions')?.classList.contains('active')) {
      await this.render();
    }
  }
};
