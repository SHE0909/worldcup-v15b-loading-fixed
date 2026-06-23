const Predictions = {

  async renderizar(showHistory = false) {
    const todosPartidos = await API.getPredictableMatches();
    const usuario       = await Auth.currentUser();
    const preds      = usuario?.predicciones || [];
    const list       = document.getElementById('predicciones-list');
    const btnHistorial    = document.getElementById('btn-prediccion-history');
    if (!list) return;

    if (!todosPartidos || todosPartidos.length === 0) {
      list.innerHTML = '<p class="empty-state">No hay partidos disponibles para predecir en este momento.</p>';
      return;
    }

    
    const partidosTerminados = todosPartidos.filter(m => {
      const state = API.getMatchState(m);
      return state === 'finalizados';
    });
    const partidosActivos = todosPartidos.filter(m => {
      const state = API.getMatchState(m);
      return state !== 'finalizados';
    });

    
    if (btnHistorial) {
      const spanTexto = btnHistorial.querySelector('.btn-prediccion-history-text');
      if (spanTexto) {
        const esHistorico = btnHistorial.dataset.mode === 'history';
        spanTexto.textContent = esHistorico
          ? `Ver activos`
          : `Ver historial (${partidosTerminados.length})`;
      }
    }

    const partidos = showHistory
      ? partidosTerminados.slice().reverse()   
      : partidosActivos;

    if (!partidos.length) {
      list.innerHTML = showHistory
        ? '<p class="empty-state">No hay partidos finalizados aún.</p>'
        : '<p class="empty-state">No hay partidos disponibles para predecir en este momento.</p>';
      return;
    }

    list.innerHTML = partidos.map(m => {
      const existente   = preds.find(p => p.idPartido === m.id);
      const estaBloqueado   = !!existente;
      const esAmistoso = m.type === 'friendly';
      const state      = API.getMatchState(m);       
      const estaCerrado   = estaBloqueado || state === 'closed' || state === 'enVivo' || state === 'finalizados';

      
      let htmlEstado = '';
      if (state === 'enVivo') {
        const etiquetaMinuto = m.minute ? `· ⏱️ ${m.minute}'` : '';
        htmlEstado = `<span class="prediccion-state-insignia prediccion-state-enVivo" id="enVivo-min-${m.id}">🔴 EN DIRECTO ${etiquetaMinuto}</span>`;
      } else if (state === 'starting_soon') {
        htmlEstado = `<span class="prediccion-state-insignia prediccion-state-soon">⚡ Por comenzar · ${API.getTimeUntilMatch(m)}</span>`;
      } else if (state === 'closed' && !estaBloqueado) {
        htmlEstado = `<span class="prediccion-state-insignia prediccion-state-closed">🔒 Predicción cerrada</span>`;
      } else if (state === 'proximos' && !estaBloqueado) {
        const tiempoRestante = API.getTimeUntilMatch(m);
        
        const tsPartido = new Date(`${m.date}T${m.time}:00${API._venueOffset ? API._venueOffset(m.venue) : '-06:00'}`).getTime();
        const difHoras   = (tsPartido - Date.now()) / 3600000;
        if (difHoras <= 5) {
          htmlEstado = `<span class="prediccion-state-insignia prediccion-state-warning">⏰ Cierra ${tiempoRestante}</span>`;
        }
      }

      
      const escudoLocal = API.getCrest(m.local);
      const escudoVisitante = API.getCrest(m.visitante);

      return `
        <div class="prediccion-card" data-match="${m.id}">
          <div class="prediccion-meta">
            <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
              <span class="prediccion-type-insignia ${esAmistoso ? 'prediccion-type-friendly' : 'prediccion-type-worldcup'}">
                ${esAmistoso ? '🤝 Amistoso' : '🏆 Mundial 2026'}
              </span>
              <span class="prediccion-competencia">${m.competencia || 'Mundial 2026'}</span>
              ${htmlEstado}
            </div>
            <span class="prediccion-date">${this._formatDate(m.date)}${m.time ? ' · ' + m.time : ''}</span>
          </div>

          <div class="prediccion-match">
            <div class="prediccion-equipo-block">
              ${escudoLocal
                ? `<img src="${escudoLocal}" alt="${m.local}" class="prediccion-crest" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">`
                : ''}
              <span class="prediccion-crest-fallback" style="${escudoLocal ? 'display:none' : ''}">${m.banderaLocal || '🏠'}</span>
              <span class="prediccion-equipo-name">${m.local}</span>
            </div>

            <div class="prediccion-vs-block">
              <span class="prediccion-vs">${
                state === 'enVivo'
                  ? `<span style="color:#ff4466">${m.golesLocal??0} — ${m.golesVisitante??0}</span>`
                  : state === 'finalizados' && m.golesLocal !== null && m.golesVisitante !== null
                    ? `<span style="color:#ccc;font-size:1rem">${m.golesLocal} — ${m.golesVisitante}</span>`
                    : 'VS'
              }</span>
              ${state === 'enVivo' && m.minute
                ? `<span class="prediccion-enVivo-minute">⏱️ ${m.minute}'</span>`
                : `<span class="prediccion-date-insignia">${this._formatDate(m.date)}</span>`
              }
            </div>

            <div class="prediccion-equipo-block">
              ${escudoVisitante
                ? `<img src="${escudoVisitante}" alt="${m.visitante}" class="prediccion-crest" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">`
                : ''}
              <span class="prediccion-crest-fallback" style="${escudoVisitante ? 'display:none' : ''}">${m.banderaVisitante || '✈️'}</span>
              <span class="prediccion-equipo-name">${m.visitante}</span>
            </div>
          </div>

          ${m.venue ? `<div class="prediccion-venue">📍 ${m.venue}</div>` : ''}

          ${state === 'starting_soon' && !estaBloqueado ? `
            <div class="prediccion-lineup-row">
              <button class="btn-lineup" data-match="${m.id}">👕 Ver alineación</button>
            </div>` : ''}

          ${estaBloqueado
            ? this._renderLocked(existente)
            : estaCerrado
              ? this._renderClosed(state, m)
              : this._renderOpen(m)
          }
        </div>
      `;
    }).join('');

    
    list.querySelectorAll('.prediccion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.prediccion-card');
        card.querySelectorAll('.prediccion-btn').forEach(b => b.classList.remove('seleccionado'));
        btn.classList.add('seleccionado');
        
        const pista = card.querySelector('.draw-score-pista');
        if (pista) pista.style.display = btn.dataset.pick === 'draw' ? 'block' : 'none';
      });
    });

    
    list.querySelectorAll('.btn-confirm-prediccion').forEach(btn => {
      btn.addEventListener('click', () => {
        const card     = btn.closest('.prediccion-card');
        const idPartido  = card.dataset.match;
        const seleccionado = card.querySelector('.prediccion-btn.seleccionado');
        if (!seleccionado) { Toast.warn('Selecciona un resultado antes de confirmar'); return; }
        const exacto = card.querySelector('.exacto-score')?.value.trim() || '';
        this._savePrediction(idPartido, seleccionado.dataset.pick, exacto, card);
      });
    });

    
    list.querySelectorAll('.btn-lineup').forEach(btn => {
      btn.addEventListener('click', () => this._showLineup(btn.dataset.match, partidos));
    });

    
    const btnExistente = document.getElementById('btn-predict-wc-wrap');
    if (!btnExistente) {
      const btnMundial = document.createElement('div');
      btnMundial.id = 'btn-predict-wc-wrap';
      btnMundial.style.cssText = 'padding:0 0 1.2rem;margin-top:0.2rem';
      btnMundial.innerHTML = `
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
      
      list.parentElement.insertBefore(btnMundial, list);
      document.getElementById('btn-predict-wc').addEventListener('click', () => WorldCupPredictor.open());
    }

    
    const btnHistorial2 = document.getElementById('btn-prediccion-history');
    if (btnHistorial2 && !btnHistorial2._wccBound) {
      btnHistorial2._wccBound = true;
      btnHistorial2.addEventListener('click', () => {
        const esHistorico = btnHistorial2.dataset.mode === 'history';
        if (esHistorico) {
          btnHistorial2.dataset.mode = '';
          btnHistorial2.classList.remove('active');
          Predictions.renderizar(false);
        } else {
          btnHistorial2.dataset.mode = 'history';
          btnHistorial2.classList.add('active');
          Predictions.renderizar(true);
        }
      });
    }
    
    if (btnHistorial2 && btnHistorial2.dataset.mode === 'history') {
      btnHistorial2.classList.add('active');
    }
  },

  _renderOpen(m) {
    const escudoLocal = API.getCrest(m.local);
    const escudoVisitante = API.getCrest(m.visitante);

    return `
      <div class="prediccion-btns">
        <button class="prediccion-btn" data-pick="local">
          ${escudoLocal ? `<img src="${escudoLocal}" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;margin-right:4px" onerror="this.remove()">` : (m.banderaLocal || '') + ' '}
          ${m.local}
        </button>
        <button class="prediccion-btn" data-pick="draw">🤝 Empate</button>
        <button class="prediccion-btn" data-pick="visitante">
          ${escudoVisitante ? `<img src="${escudoVisitante}" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;margin-right:4px" onerror="this.remove()">` : (m.banderaVisitante || '') + ' '}
          ${m.visitante}
        </button>
      </div>
      <div class="prediccion-exacto-row">
        <input type="text" class="exacto-score"
          placeholder="Resultado exacto opcional: 2-1"
          pattern="[0-9]+-[0-9]+"
          maxlength="7"
          title="Formato: goles_local-goles_visitante (ej: 2-1)">
        <div class="draw-score-pista" style="display:none;font-size:0.75rem;color:#ffaa44;margin-top:4px">
          ⚠️ Para empate el marcador debe ser igualado: 0-0, 1-1, 2-2…
        </div>
      </div>
      <div class="prediccion-rewards-info">
        <span>🎴 Acertar ganador: <strong>+1 tirada</strong></span>
        <span>🎯 Resultado exacto: <strong>+3 tiradas</strong></span>
      </div>
      <button class="btn-confirm-prediccion">
        Confirmar predicción ✓
      </button>
    `;
  },

  _renderClosed(state, m) {
    const tieneScore = m && m.status === 'finalizados' && m.golesLocal !== null && m.golesVisitante !== null;
    const strMarcador = tieneScore ? ` · <strong style="color:#ddd">${m.golesLocal} — ${m.golesVisitante}</strong>` : '';
    const msg = state === 'enVivo'
      ? `🔴 Partido en curso — predicciones cerradas`
      : state === 'finalizados'
        ? `✅ Partido finalizado${strMarcador}`
        : '🔒 Predicciones cerradas (falta menos de 1h)';
    return `
      <div class="prediccion-locked" style="text-align:center;padding:0.75rem 0;">
        <span style="font-size:0.78rem;color:var(--text-muted)">${msg}</span>
      </div>
    `;
  },

  async _showLineup(idPartido, partidos) {
    const m = partidos.find(x => x.id === idPartido);
    if (!m) return;

    
    let htmlAlineacion = '';
    if (idPartido.startsWith('af_')) {
      try {
        const idFixture = idPartido.replace('af_', '');
        const af = await API._af(`/fixtures/lineups?fixture=${idFixture}`);
        if (af?.response?.length > 0) {
          htmlAlineacion = af.response.map(equipo => {
            const titulares   = (equipo.startXI || []).map(p => p.player.name).join(', ');
            const suplentes       = (equipo.substitutes || []).map(p => p.player.name).join(', ');
            const formation  = equipo.formation ? `[${equipo.formation}]` : '';
            return `
              <div style="margin-bottom:0.75rem">
                <p style="font-weight:700;color:var(--gold);margin-bottom:0.25rem">
                  ${equipo.equipo?.name || ''} ${formation}
                </p>
                <p style="font-size:0.7rem;color:var(--text-secondary);margin-bottom:0.15rem">
                  <strong>Titulares:</strong> ${titulares || '—'}
                </p>
                <p style="font-size:0.7rem;color:var(--text-muted)">
                  <strong>Suplentes:</strong> ${suplentes || '—'}
                </p>
              </div>`;
          }).join('<hr style="border-color:var(--border);margin:0.5rem 0">');
        }
      } catch(_) {}
    }

    if (!htmlAlineacion) {
      htmlAlineacion = `<p style="font-size:0.75rem;color:var(--text-muted);text-align:center;padding:0.5rem 0">
        Alineación aún no confirmada.<br>Vuelve a revisar más cerca del inicio.
      </p>`;
    }

    Modal.open(`
      <div class="modal2-player-detail">
        <h2 class="modal2-player-name" style="margin-bottom:0.25rem">👕 Alineación</h2>
        <p style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.75rem">
          ${m.banderaLocal||''} ${m.local} vs ${m.visitante} ${m.banderaVisitante||''}
        </p>
        ${htmlAlineacion}
      </div>
    `);
  },

  _renderLocked(prediccion) {
    const iconoResultado = prediccion.result === 'win' ? '✅' : prediccion.result === 'loss' ? '❌' : '⏳';
    const textoResultado = prediccion.result === 'win' ? 'Acertaste' : prediccion.result === 'loss' ? 'Fallaste' : 'Pendiente';
    return `
      <div class="prediccion-locked">
        <div class="prediccion-locked-pick">
          🎯 Predicción: <strong>${this._labelPred(prediccion.pick)}</strong>
          ${prediccion.exacto ? ` · Marcador: <strong>${prediccion.exacto}</strong>` : ''}
        </div>
        <div class="prediccion-result ${prediccion.result}">
          ${iconoResultado} ${textoResultado}
          ${prediccion.result === 'win' ? ' — +1 🎴' : ''}
          ${prediccion.exactCorrect ? ' +3 🎴 (¡marcador exacto!)' : ''}
        </div>
      </div>
    `;
  },

  _labelPred(pick) {
    if (pick === 'local') return 'Local';
    if (pick === 'visitante') return 'Visitante';
    if (pick === 'draw') return 'Empate';
    return pick;
  },

  _formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-');
      const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      return `${d} ${meses[parseInt(m)-1]}`;
    } catch(_) { return dateStr; }
  },

  async _savePrediction(idPartido, pick, exacto, card) {
    if (exacto && !/^\d+-\d+$/.test(exacto)) {
      Toast.warn('Formato de marcador inválido. Usa: 2-1');
      return;
    }

    
    if (pick === 'draw' && exacto) {
      const [g1, g2] = exacto.split('-').map(Number);
      if (g1 !== g2) {
        Toast.warn('En un empate ambos equipos deben tener los mismos goles. Ej: 1-1');
        return;
      }
    }

    
    
    
    if (pick === 'local' && exacto) {
      const [g1, g2] = exacto.split('-').map(Number);
      if (g1 <= g2) {
        Toast.warn('El marcador no coincide con la victoria local. El local debe tener más goles. Ej: 2-1');
        return;
      }
    }
    if (pick === 'visitante' && exacto) {
      const [g1, g2] = exacto.split('-').map(Number);
      if (g2 <= g1) {
        Toast.warn('El marcador no coincide con la victoria visitante. El visitante debe tener más goles. Ej: 1-2');
        return;
      }
    }

    const usuario = await Auth.currentUser();
    if (!usuario) return;

    const preds = usuario.predicciones || [];
    if (preds.find(p => p.idPartido === idPartido)) {
      Toast.warn('Ya tienes una predicción para este partido');
      return;
    }

    
    let localPartido = '', matchAway = '', matchHomeFlag = '', matchAwayFlag = '';
    try {
      const todosPartidos = await API.getPredictableMatches();
      const m = (todosPartidos || []).find(x => String(x.id) === String(idPartido));
      if (m) {
        localPartido     = m.local     || '';
        matchAway     = m.visitante     || '';
        matchHomeFlag = m.banderaLocal || '';
        matchAwayFlag = m.banderaVisitante || '';
      }
    } catch(_) {}

    preds.push({
      idPartido,
      localPartido,
      matchAway,
      matchHomeFlag,
      matchAwayFlag,
      pick,
      exacto:     exacto || null,
      result:    'pendientes',
      timestamp: new Date().toISOString()
    });

    usuario.predicciones = preds;
    await Auth.updateUser(usuario);
    await DB.logActivity(usuario.email, 'prediccion', `${idPartido}: ${pick}${exacto ? ' ('+exacto+')' : ''}`);

    Toast.success('¡Predicción guardada! 🎯 Buena suerte');
    setTimeout(() => this.renderizar(), 800);
  },

  
  async evaluatePredictions(partidosTerminados) {
    const usuario = await Auth.currentUser();
    if (!usuario || !Array.isArray(partidosTerminados) || !partidosTerminados.length) return 0;

    let tirasGanadas = 0;
    let nuevasVictorias      = 0;
    const preds      = usuario.predicciones || [];
    const recienResueltos = [];

    for (const prediccion of preds) {
      if (prediccion.result !== 'pendientes') continue;
      const match = partidosTerminados.find(m => String(m.id) === String(prediccion.idPartido));
      if (!match) continue;

      
      let resultadoFinal = match.resultadoFinal;
      if (!resultadoFinal && match.golesLocal !== undefined && match.golesVisitante !== undefined
          && match.status === 'finalizados') {
        const sh = Number(match.golesLocal), sa = Number(match.golesVisitante);
        resultadoFinal = sh > sa ? 'local' : sa > sh ? 'visitante' : 'draw';
        
        prediccion.finalScore = `${sh}-${sa}`;
        prediccion.finalHome  = match.local  || '';
        prediccion.finalAway  = match.visitante  || '';
      }
      if (!resultadoFinal) continue;

      
      if (!prediccion.localPartido && match.local) prediccion.localPartido = match.local;
      if (!prediccion.matchAway && match.visitante) prediccion.matchAway = match.visitante;
      if (!prediccion.matchHomeFlag && match.banderaLocal) prediccion.matchHomeFlag = match.banderaLocal;
      if (!prediccion.matchAwayFlag && match.banderaVisitante) prediccion.matchAwayFlag = match.banderaVisitante;

      let predTiradas = 0;
      if (prediccion.pick === resultadoFinal) {
        prediccion.result = 'win';
        tirasGanadas += 1;
        predTiradas  += 1;
        nuevasVictorias++;
      } else {
        prediccion.result = 'loss';
      }

      
      const normalizarScore = s => (s || '').replace(/[–—]/g, '-').trim();
      const marcadorExacto = normalizarScore(match.marcadorExacto || prediccion.finalScore);
      const predExacto  = normalizarScore(prediccion.exacto || '');
      if (predExacto && marcadorExacto && predExacto === marcadorExacto) {
        prediccion.exactCorrect = true;
        tirasGanadas += 3;
        predTiradas  += 3;
      }

      recienResueltos.push({
        localPartido:     prediccion.localPartido || match.local,
        matchAway:     prediccion.matchAway || match.visitante,
        matchHomeFlag: prediccion.matchHomeFlag || match.banderaLocal,
        matchAwayFlag: prediccion.matchAwayFlag || match.banderaVisitante,
        finalScore:    marcadorExacto,
        pick:          prediccion.pick,
        exacto:         prediccion.exacto || null,
        won:           prediccion.result === 'win',
        exactCorrect:  !!prediccion.exactCorrect,
        tiradas:       predTiradas,
      });
    }

    if (tirasGanadas > 0) {
      usuario.tiradas  = (usuario.tiradas  || 0) + tirasGanadas;
      usuario.aciertos = (usuario.aciertos || 0) + nuevasVictorias;
      usuario.predicciones = preds;
      await Auth.updateUser(usuario);
      await DB.logActivity(usuario.email, 'pred_reward', `+${tirasGanadas} tiradas por predicciones`);
      Toast.success(`¡Predicciones acertadas! +${tirasGanadas} tiradas`);
    } else {
      
      const teniaPendientes = (usuario.predicciones || []).some(p => p.result === 'pendientes'
        && partidosTerminados.some(m => String(m.id) === String(p.idPartido)));
      if (teniaPendientes) {
        usuario.predicciones = preds;
        await Auth.updateUser(usuario);
      }
    }

    if (typeof App !== 'undefined') await App.refreshHeader();
    
    if (typeof App !== 'undefined' && App._currentTab === 'perfil') {
      await Profile.renderizar();
    }
    if (recienResueltos.length) this._showResultModals(recienResueltos);

    return tirasGanadas;
  },

  
  _showResultModals(resultados) {
    if (!resultados.length) return;

    
    const SHOWN_KEY = 'wcc_pred_modals_shown';
    let setMostrados;
    try { setMostrados = new Set(JSON.parse(localStorage.getItem(SHOWN_KEY) || '[]')); }
    catch(_) { setMostrados = new Set(); }

    const pendientes = resultados.filter(r => {
      const key = `${r.localPartido}-${r.matchAway}-${r.pick}`;
      return !setMostrados.has(key);
    });

    if (!pendientes.length) return;

    
    pendientes.forEach(r => {
      setMostrados.add(`${r.localPartido}-${r.matchAway}-${r.pick}`);
    });
    try { localStorage.setItem(SHOWN_KEY, JSON.stringify([...setMostrados])); } catch(_) {}

    const [first, ...rest] = pendientes;

    const local = first.localPartido || 'Local';
    const visitante = first.matchAway || 'Visitante';
    const banderaLocal = first.matchHomeFlag || '🏠';
    const banderaVisitante = first.matchAwayFlag || '✈️';

    const iconoEncabezado  = first.won ? '🏆' : '❌';
    const textoEncabezado  = first.won ? '¡Acertaste!' : 'Fallaste esta vez';
    const colorEncabezado = first.won ? '#44ff88' : '#ff6666';

    const etiquetasEleccion = { local: local, visitante: visitante, draw: 'Empate' };
    const etiquetaEleccion  = etiquetasEleccion[first.pick] || first.pick;

    const lineasRecompensa = [];
    if (first.won) lineasRecompensa.push(`🎴 +1 tirada por acertar el ganador`);
    if (first.exactCorrect) lineasRecompensa.push(`🎯 +3 tiradas por marcador exacto`);
    if (!first.won && !first.exactCorrect) lineasRecompensa.push('Sin recompensa esta vez. ¡Suerte para la próxima!');

    Modal.open(`
      <div style="text-align:center;padding:0.5rem 0">
        <div style="font-size:2rem;margin-bottom:0.25rem">${iconoEncabezado}</div>
        <h3 style="font-family:'Bebas Neue',cursive;font-size:1.4rem;color:${colorEncabezado};letter-spacing:1px;margin:0 0 0.5rem">
          ${textoEncabezado}
        </h3>
        <p style="font-size:0.85rem;color:var(--text-secondary);margin:0 0 0.25rem">
          ${banderaLocal} ${local} <strong style="color:var(--text-primary)">${first.finalScore || ''}</strong> ${visitante} ${banderaVisitante}
        </p>
        <p style="font-size:0.75rem;color:var(--text-muted);margin:0 0 0.75rem">
          Tu predicción: <strong>${etiquetaEleccion}</strong>${first.exacto ? ` · Marcador: <strong>${first.exacto}</strong>` : ''}
        </p>
        <div style="background:var(--bg-surface);border-radius:10px;padding:0.6rem;margin-bottom:0.75rem">
          ${lineasRecompensa.map(l => `<div style="font-size:0.8rem;color:var(--text-primary);padding:2px 0">${l}</div>`).join('')}
          ${first.tiradas > 0 ? `<div style="font-size:1rem;font-weight:800;color:var(--accent);margin-top:4px">Total: +${first.tiradas} 🎴</div>` : ''}
        </div>
        <button class="btn btn-primary" id="prediccion-result-next" style="width:100%">
          ${rest.length ? 'Siguiente' : '¡Genial!'}
        </button>
      </div>
    `);

    document.getElementById('prediccion-result-next')?.addEventListener('click', () => {
      Modal.close();
      if (rest.length) this._showResultModals(rest); 
    });
  },

  
  async checkLiveFinished(todosPartidos) {
    if (!Array.isArray(todosPartidos) || !todosPartidos.length) return;
    const finalizados = todosPartidos.filter(m => m.status === 'finalizados'
      && m.golesLocal !== undefined && m.golesVisitante !== undefined);
    if (!finalizados.length) return;
    await this.evaluatePredictions(finalizados);
    
    const el = document.getElementById('predicciones-list');
    if (el && document.getElementById('tab-predicciones')?.classList.contains('active')) {
      await this.renderizar();
    }
  }
};
