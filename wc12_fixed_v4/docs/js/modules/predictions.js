const Predictions = {

  async render(showHistory = false) {
    const allMatches = await API.getPredictableMatches();
    const user       = await Auth.currentUser();
    const preds      = user?.predicciones || [];
    const list       = document.getElementById('predictions-list');
    const histBtn    = document.getElementById('btn-pred-history');
    if (!list) return;

    if (!allMatches || allMatches.length === 0) {
      list.innerHTML = '<p class="empty-state">No hay partidos disponibles para predecir en este momento.</p>';
      return;
    }

    
    const finishedMatches = allMatches.filter(m => {
      const state = API.getMatchState(m);
      return state === 'finished';
    });
    const activeMatches = allMatches.filter(m => {
      const state = API.getMatchState(m);
      return state !== 'finished';
    });

    
    if (histBtn) {
      const textSpan = histBtn.querySelector('.btn-pred-history-text');
      if (textSpan) {
        const isHistory = histBtn.dataset.mode === 'history';
        textSpan.textContent = isHistory
          ? `Ver activos`
          : `Ver historial (${finishedMatches.length})`;
      }
    }

    const matches = showHistory
      ? finishedMatches.slice().reverse()   
      : activeMatches;

    if (!matches.length) {
      list.innerHTML = showHistory
        ? '<p class="empty-state">No hay partidos finalizados aún.</p>'
        : '<p class="empty-state">No hay partidos disponibles para predecir en este momento.</p>';
      return;
    }

    list.innerHTML = matches.map(m => {
      const existing   = preds.find(p => p.matchId === m.id);
      const isLocked   = !!existing;
      const isFriendly = m.type === 'friendly';
      const state      = API.getMatchState(m);       
      const isClosed   = isLocked || state === 'closed' || state === 'live' || state === 'finished';

      
      let stateHtml = '';
      if (state === 'live') {
        const minuteLabel = m.minute ? `· ⏱️ ${m.minute}'` : '';
        stateHtml = `<span class="pred-state-badge pred-state-live" id="live-min-${m.id}">🔴 EN DIRECTO ${minuteLabel}</span>`;
      } else if (state === 'starting_soon') {
        stateHtml = `<span class="pred-state-badge pred-state-soon">⚡ Por comenzar · ${API.getTimeUntilMatch(m)}</span>`;
      } else if (state === 'closed' && !isLocked) {
        stateHtml = `<span class="pred-state-badge pred-state-closed">🔒 Predicción cerrada</span>`;
      } else if (state === 'upcoming' && !isLocked) {
        const timeLeft = API.getTimeUntilMatch(m);
        
        const matchTs = new Date(`${m.date}T${m.time}:00${API._venueOffset ? API._venueOffset(m.venue) : '-06:00'}`).getTime();
        const diffH   = (matchTs - Date.now()) / 3600000;
        if (diffH <= 5) {
          stateHtml = `<span class="pred-state-badge pred-state-warning">⏰ Cierra ${timeLeft}</span>`;
        }
      }

      
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
              <span class="pred-vs">${
                state === 'live'
                  ? `<span style="color:#ff4466">${m.scoreHome??0} — ${m.scoreAway??0}</span>`
                  : state === 'finished' && m.scoreHome !== null && m.scoreAway !== null
                    ? `<span style="color:#ccc;font-size:1rem">${m.scoreHome} — ${m.scoreAway}</span>`
                    : 'VS'
              }</span>
              ${state === 'live' && m.minute
                ? `<span class="pred-live-minute">⏱️ ${m.minute}'</span>`
                : `<span class="pred-date-badge">${this._formatDate(m.date)}</span>`
              }
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
              ? this._renderClosed(state, m)
              : this._renderOpen(m)
          }
        </div>
      `;
    }).join('');

    
    list.querySelectorAll('.pred-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.prediction-card');
        card.querySelectorAll('.pred-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        const hint = card.querySelector('.draw-score-hint');
        if (hint) hint.style.display = btn.dataset.pick === 'draw' ? 'block' : 'none';
      });
    });

    
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

    
    list.querySelectorAll('.btn-lineup').forEach(btn => {
      btn.addEventListener('click', () => this._showLineup(btn.dataset.match, matches));
    });

    
    const existingBtn = document.getElementById('btn-predict-wc-wrap');
    if (!existingBtn) {
      const wcBtn = document.createElement('div');
      wcBtn.id = 'btn-predict-wc-wrap';
      wcBtn.style.cssText = 'padding:0 0 1.2rem;margin-top:0.2rem';
      wcBtn.innerHTML = `
        <button id="btn-predict-wc" style="
          background:linear-gradient(135deg,#c0a022,#e8c840);
          color:#000;font-weight:800;font-size:1.05rem;
          border:none;border-radius:14px;padding:1rem 2rem;
          cursor:pointer;width:100%;
          box-shadow:0 4px 24px rgba(200,160,0,0.4);letter-spacing:0.5px;
          display:flex;align-items:center;justify-content:center;gap:0.6rem;
        "><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>
          Predecir Mundial 2026
          <span style="font-size:0.72rem;font-weight:500;opacity:0.75">· Hasta 50+ tiradas</span>
        </button>`;
      
      list.parentElement.insertBefore(wcBtn, list);
      document.getElementById('btn-predict-wc').addEventListener('click', () => WorldCupPredictor.open());
    }

    
    const histBtn2 = document.getElementById('btn-pred-history');
    if (histBtn2 && !histBtn2._wccBound) {
      histBtn2._wccBound = true;
      histBtn2.addEventListener('click', () => {
        const isHistory = histBtn2.dataset.mode === 'history';
        if (isHistory) {
          histBtn2.dataset.mode = '';
          histBtn2.classList.remove('active');
          Predictions.render(false);
        } else {
          histBtn2.dataset.mode = 'history';
          histBtn2.classList.add('active');
          Predictions.render(true);
        }
      });
    }
    
    if (histBtn2 && histBtn2.dataset.mode === 'history') {
      histBtn2.classList.add('active');
    }
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

  _renderClosed(state, m) {
    const hasScore = m && m.status === 'finished' && m.scoreHome !== null && m.scoreAway !== null;
    const scoreStr = hasScore ? ` · <strong style="color:#ddd">${m.scoreHome} — ${m.scoreAway}</strong>` : '';
    const msg = state === 'live'
      ? `🔴 Partido en curso — predicciones cerradas`
      : state === 'finished'
        ? `✅ Partido finalizado${scoreStr}`
        : '🔒 Predicciones cerradas (falta menos de 1h)';
    return `
      <div class="pred-locked" style="text-align:center;padding:0.75rem 0;">
        <span style="font-size:0.78rem;color:var(--text-muted)">${msg}</span>
      </div>
    `;
  },

  async _showLineup(matchId, matches) {
    const m = matches.find(x => x.id === matchId);
    if (!m) return;

    
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

    
    if (pick === 'draw' && exact) {
      const [g1, g2] = exact.split('-').map(Number);
      if (g1 !== g2) {
        Toast.warn('En un empate ambos equipos deben tener los mismos goles. Ej: 1-1');
        return;
      }
    }

    
    
    
    if (pick === 'home' && exact) {
      const [g1, g2] = exact.split('-').map(Number);
      if (g1 <= g2) {
        Toast.warn('El marcador no coincide con la victoria local. El local debe tener más goles. Ej: 2-1');
        return;
      }
    }
    if (pick === 'away' && exact) {
      const [g1, g2] = exact.split('-').map(Number);
      if (g2 <= g1) {
        Toast.warn('El marcador no coincide con la victoria visitante. El visitante debe tener más goles. Ej: 1-2');
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

    
    let matchHome = '', matchAway = '', matchHomeFlag = '', matchAwayFlag = '';
    try {
      const allMatches = await API.getPredictableMatches();
      const m = (allMatches || []).find(x => String(x.id) === String(matchId));
      if (m) {
        matchHome     = m.home     || '';
        matchAway     = m.away     || '';
        matchHomeFlag = m.homeFlag || '';
        matchAwayFlag = m.awayFlag || '';
      }
    } catch(_) {}

    preds.push({
      matchId,
      matchHome,
      matchAway,
      matchHomeFlag,
      matchAwayFlag,
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

  
  async evaluatePredictions(finishedMatches) {
    const user = await Auth.currentUser();
    if (!user || !Array.isArray(finishedMatches) || !finishedMatches.length) return 0;

    let tirasGanadas = 0;
    let newWins      = 0;
    const preds      = user.predicciones || [];
    const newlyResolved = [];

    for (const pred of preds) {
      if (pred.result !== 'pending') continue;
      const match = finishedMatches.find(m => String(m.id) === String(pred.matchId));
      if (!match) continue;

      
      let finalResult = match.finalResult;
      if (!finalResult && match.scoreHome !== undefined && match.scoreAway !== undefined
          && match.status === 'finished') {
        const sh = Number(match.scoreHome), sa = Number(match.scoreAway);
        finalResult = sh > sa ? 'home' : sa > sh ? 'away' : 'draw';
        
        pred.finalScore = `${sh}-${sa}`;
        pred.finalHome  = match.home  || '';
        pred.finalAway  = match.away  || '';
      }
      if (!finalResult) continue;

      
      if (!pred.matchHome && match.home) pred.matchHome = match.home;
      if (!pred.matchAway && match.away) pred.matchAway = match.away;
      if (!pred.matchHomeFlag && match.homeFlag) pred.matchHomeFlag = match.homeFlag;
      if (!pred.matchAwayFlag && match.awayFlag) pred.matchAwayFlag = match.awayFlag;

      let predTiradas = 0;
      if (pred.pick === finalResult) {
        pred.result = 'win';
        tirasGanadas += 1;
        predTiradas  += 1;
        newWins++;
      } else {
        pred.result = 'loss';
      }

      
      const normalizeScore = s => (s || '').replace(/[–—]/g, '-').trim();
      const exactScore = normalizeScore(match.exactScore || pred.finalScore);
      const predExact  = normalizeScore(pred.exact || '');
      if (predExact && exactScore && predExact === exactScore) {
        pred.exactCorrect = true;
        tirasGanadas += 3;
        predTiradas  += 3;
      }

      newlyResolved.push({
        matchHome:     pred.matchHome || match.home,
        matchAway:     pred.matchAway || match.away,
        matchHomeFlag: pred.matchHomeFlag || match.homeFlag,
        matchAwayFlag: pred.matchAwayFlag || match.awayFlag,
        finalScore:    exactScore,
        pick:          pred.pick,
        exact:         pred.exact || null,
        won:           pred.result === 'win',
        exactCorrect:  !!pred.exactCorrect,
        tiradas:       predTiradas,
      });
    }

    if (tirasGanadas > 0) {
      user.tiradas  = (user.tiradas  || 0) + tirasGanadas;
      user.aciertos = (user.aciertos || 0) + newWins;
      user.predicciones = preds;
      await Auth.updateUser(user);
      await DB.logActivity(user.email, 'pred_reward', `+${tirasGanadas} tiradas por predicciones`);
      Toast.success(`¡Predicciones acertadas! +${tirasGanadas} tiradas`);
    } else {
      
      const hadPending = (user.predicciones || []).some(p => p.result === 'pending'
        && finishedMatches.some(m => String(m.id) === String(p.matchId)));
      if (hadPending) {
        user.predicciones = preds;
        await Auth.updateUser(user);
      }
    }

    if (typeof App !== 'undefined') await App.refreshHeader();
    
    if (typeof App !== 'undefined' && App._currentTab === 'profile') {
      await Profile.render();
    }
    if (newlyResolved.length) this._showResultModals(newlyResolved);

    return tirasGanadas;
  },

  
  _showResultModals(results) {
    if (!results.length) return;

    
    const SHOWN_KEY = 'wcc_pred_modals_shown';
    let shownSet;
    try { shownSet = new Set(JSON.parse(localStorage.getItem(SHOWN_KEY) || '[]')); }
    catch(_) { shownSet = new Set(); }

    const pending = results.filter(r => {
      const key = `${r.matchHome}-${r.matchAway}-${r.pick}`;
      return !shownSet.has(key);
    });

    if (!pending.length) return;

    
    pending.forEach(r => {
      shownSet.add(`${r.matchHome}-${r.matchAway}-${r.pick}`);
    });
    try { localStorage.setItem(SHOWN_KEY, JSON.stringify([...shownSet])); } catch(_) {}

    const [first, ...rest] = pending;

    const home = first.matchHome || 'Local';
    const away = first.matchAway || 'Visitante';
    const homeFlag = first.matchHomeFlag || '🏠';
    const awayFlag = first.matchAwayFlag || '✈️';

    const headerIcon  = first.won ? '🏆' : '❌';
    const headerText  = first.won ? '¡Acertaste!' : 'Fallaste esta vez';
    const headerColor = first.won ? '#44ff88' : '#ff6666';

    const pickLabels = { home: home, away: away, draw: 'Empate' };
    const pickLabel  = pickLabels[first.pick] || first.pick;

    const rewardLines = [];
    if (first.won) rewardLines.push(`🎴 +1 tirada por acertar el ganador`);
    if (first.exactCorrect) rewardLines.push(`🎯 +3 tiradas por marcador exacto`);
    if (!first.won && !first.exactCorrect) rewardLines.push('Sin recompensa esta vez. ¡Suerte para la próxima!');

    Modal.open(`
      <div style="text-align:center;padding:0.5rem 0">
        <div style="font-size:2rem;margin-bottom:0.25rem">${headerIcon}</div>
        <h3 style="font-family:'Bebas Neue',cursive;font-size:1.4rem;color:${headerColor};letter-spacing:1px;margin:0 0 0.5rem">
          ${headerText}
        </h3>
        <p style="font-size:0.85rem;color:var(--text-secondary);margin:0 0 0.25rem">
          ${homeFlag} ${home} <strong style="color:var(--text-primary)">${first.finalScore || ''}</strong> ${away} ${awayFlag}
        </p>
        <p style="font-size:0.75rem;color:var(--text-muted);margin:0 0 0.75rem">
          Tu predicción: <strong>${pickLabel}</strong>${first.exact ? ` · Marcador: <strong>${first.exact}</strong>` : ''}
        </p>
        <div style="background:var(--bg-surface);border-radius:10px;padding:0.6rem;margin-bottom:0.75rem">
          ${rewardLines.map(l => `<div style="font-size:0.8rem;color:var(--text-primary);padding:2px 0">${l}</div>`).join('')}
          ${first.tiradas > 0 ? `<div style="font-size:1rem;font-weight:800;color:var(--accent);margin-top:4px">Total: +${first.tiradas} 🎴</div>` : ''}
        </div>
        <button class="btn btn-primary" id="pred-result-next" style="width:100%">
          ${rest.length ? 'Siguiente' : '¡Genial!'}
        </button>
      </div>
    `);

    document.getElementById('pred-result-next')?.addEventListener('click', () => {
      Modal.close();
      if (rest.length) this._showResultModals(rest); 
    });
  },

  
  async checkLiveFinished(allMatches) {
    if (!Array.isArray(allMatches) || !allMatches.length) return;
    const finished = allMatches.filter(m => m.status === 'finished'
      && m.scoreHome !== undefined && m.scoreAway !== undefined);
    if (!finished.length) return;
    await this.evaluatePredictions(finished);
    
    const el = document.getElementById('predictions-list');
    if (el && document.getElementById('tab-predictions')?.classList.contains('active')) {
      await this.render();
    }
  }
};
