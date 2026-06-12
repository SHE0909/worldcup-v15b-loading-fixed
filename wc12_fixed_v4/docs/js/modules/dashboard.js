/**
 * dashboard.js — Panel principal  v2
 * Mejoras: venue en upcoming, evaluación predicciones al actualizar,
 *          partidos terminados visibles, mejor formato de fechas
 */

const Dashboard = {

  async render() {
    // Cargar upcoming PRIMERO para que getLiveMatches pueda detectar si hay partido activo
    await this.renderUpcoming();
    await Promise.all([
      this.renderLive(),
      this.renderStandings(),
      this.renderFavorites()
    ]);

    // Actualizar próximos partidos cada 30 minutos (pausa si pestaña oculta)
    if (!this._upcomingRefreshTimer) {
      this._upcomingRefreshTimer = API.registerTimer(() => this.renderUpcoming(), 5 * 60 * 1000);
    }
    // Actualizar posiciones cada 6 horas (pausa si pestaña oculta)
    if (!this._standingsRefreshTimer) {
      this._standingsRefreshTimer = API.registerTimer(() => this.renderStandings(), 6 * 60 * 60 * 1000);
    }
  },

  /* ── En Vivo — v14 ── */
  async renderLive() {
    const el = document.getElementById('live-matches');
    if (!el) return;

    if (!el.dataset.initialized) {
      el.innerHTML = '<p class="empty-state" style="opacity:.4;font-size:0.7rem">Consultando partidos en vivo...</p>';
      el.dataset.initialized = '1';
    }

    // Consultar ambas fuentes en paralelo
    const [liveFromApi, upcomingAll] = await Promise.all([
      API.getLiveMatches(),
      API.getUpcomingMatches()
    ]);

    // Partidos en vivo reales de la API
    const liveSet = new Set((liveFromApi||[]).map(m => m.id));
    const liveOnly = [...(liveFromApi||[]).filter(m => m.status === 'live')];

    // Agregar partidos del upcoming que el sistema detectó como live por hora
    // pero que la API de live no reportó (ej: MOCK o TheSportsDB sin cobertura)
    // Sanitizar: solo agregar si realmente están dentro del tiempo estimado (<115 min)
    for (const m of (upcomingAll||[])) {
      if (liveSet.has(m.id)) continue;
      // BUG FIX: además de status==='live' explícito, detectar partidos cuyo
      // horario ya pasó pero la API/mock todavía los marca como 'scheduled'
      // (misma heurística que usa Predicciones vía API.getMatchState)
      const isLiveByStatus = m.status === 'live';
      const isLiveByTime   = m.status === 'scheduled' && typeof API.getMatchState === 'function'
        && API.getMatchState(m) === 'live';

      if (isLiveByStatus || isLiveByTime) {
        // Verificar que no haya pasado más de 115 min desde el inicio
        if (m.date && m.time) {
          const start   = new Date(`${m.date}T${m.time}:00Z`);
          const diffMin = (Date.now() - start.getTime()) / 60000;
          if (diffMin > 115) continue; // ya terminó, no mostrar como live
        }
        liveOnly.push(isLiveByTime ? { ...m, status: 'live' } : m);
      }
    }

    if (liveOnly.length === 0) {
      el.innerHTML = '<p class="empty-state">No hay partidos en vivo ahora mismo</p>';
      return;
    }

    el.innerHTML = liveOnly.map(m => {
      const isFriendly = m.type === 'friendly' || m.type !== 'worldcup';
      const badgeStyle = isFriendly
        ? 'background:rgba(74,168,255,0.2);color:#4aa8ff;border:1px solid rgba(74,168,255,0.4)'
        : 'background:rgba(255,215,0,0.15);color:var(--gold);border:1px solid rgba(255,215,0,0.35)';
      const scoreH = m.scoreHome ?? 0;
      const scoreA = m.scoreAway ?? 0;
      return `
      <div class="match-item match-live-item has-bar" style="border-left-color:#ff4466;display:block">
        <div style="display:flex;gap:4px;margin-bottom:4px;align-items:center">
          <span style="font-size:0.5rem;padding:1px 5px;border-radius:10px;font-weight:700;letter-spacing:1px;${badgeStyle}">
            ${isFriendly ? 'AMISTOSO' : '🏆 MUNDIAL'}
          </span>
          <span class="match-live-badge" style="font-size:0.55rem;margin-left:auto">
            🔴 ${m.minute ? m.minute+"'" : 'EN VIVO'}
          </span>
        </div>
        <div class="match-teams-row">
          <span>${m.homeFlag||''} ${m.home}</span>
          <span class="match-score" style="color:#ff4466;font-weight:800">${scoreH} — ${scoreA}</span>
          <span>${m.away} ${m.awayFlag||''}</span>
        </div>
        ${m.competition ? `<div style="font-size:0.62rem;color:var(--text-muted);margin-top:2px;text-align:center">${m.competition}</div>` : ''}
        ${m.venue ? `<div style="font-size:0.58rem;color:var(--text-muted);text-align:center">📍 ${m.venue}</div>` : ''}
      </div>`;
    }).join('');

    // Auto-refresh cada 2 minutos siempre activo para mantener el estado sincronizado
    // (antes solo se creaba cuando había partidos vivos, dejando el caché stale al terminar)
    if (!this._liveRefreshTimer) {
      this._liveRefreshTimer = API.registerTimer(async () => {
        // Limpiar caché de ambos paneles para que los marcadores estén sincronizados
        delete API._memCache['live'];
        delete API._memCache['upcoming'];
        this.renderLive();
        this.renderUpcoming();
        // Evaluar predicciones automáticamente cuando un partido termina
        try {
          const allMatches = await API.getUpcomingMatches();
          if (typeof Predictions !== 'undefined') {
            await Predictions.checkLiveFinished(allMatches || []);
          }
        } catch(_) {}
      }, 2 * 60 * 1000);
    }
  },
  /* ── Próximos y resultados del día — v15 ─────────────────────────
     LÓGICA:
     • Panel IZQUIERDO (renderLive): solo partidos status==='live'
     • Panel DERECHO (renderUpcoming):
         - "HOY": todos los partidos de hoy (finished, live, scheduled)
           incluyendo los que ya terminaron con su marcador
         - "PRÓXIMOS": partidos de días futuros (sin marcar ya terminados)
     • Los partidos de ayer o anteriores NO se muestran (ya pasó el día)
     • Un partido con scoreHome/Away fijo → siempre 'finished' sin importar la hora
     ────────────────────────────────────────────────────────────────── */
  async renderUpcoming() {
    const el = document.getElementById('upcoming-matches');
    if (!el) return;

    const [allRaw, liveMatches] = await Promise.all([
      API.getUpcomingMatches(),
      API.getLiveMatches()
    ]);

    // Actualizar estado con datos de live en tiempo real
    const liveById   = new Map((liveMatches||[]).map(m => [m.id, m]));
    const liveByTeam = new Map();
    (liveMatches||[]).forEach(m => {
      liveByTeam.set((m.home||'').toLowerCase(), m);
      liveByTeam.set((m.away||'').toLowerCase(), m);
    });

    const all = (allRaw||[]).map(m => {
      const liveMatch = liveById.get(m.id)
        || (liveByTeam.has((m.home||'').toLowerCase()) && liveByTeam.has((m.away||'').toLowerCase())
            ? liveByTeam.get((m.home||'').toLowerCase()) : null);
      if (liveMatch) {
        return { ...m, status:'live', scoreHome:liveMatch.scoreHome, scoreAway:liveMatch.scoreAway, minute:liveMatch.minute };
      }
      // Sanitizar: si el caché dice 'live' pero ya pasaron más de 115 min → forzar finished
      // Esto evita que partidos terminados sigan apareciendo como "en vivo" por caché stale
      if (m.status === 'live' && m.date && m.time) {
        const start   = new Date(`${m.date}T${m.time}:00Z`);
        const diffMin = (Date.now() - start.getTime()) / 60000;
        if (diffMin > 115) return { ...m, status: 'finished' };
      }
      // BUG FIX: si el partido sigue 'scheduled' pero ya pasó su hora de inicio
      // (mismo cálculo que usa Predicciones via API.getMatchState), tratarlo
      // como 'live' para que Home y Predicciones queden sincronizados.
      if (m.status === 'scheduled' && typeof API.getMatchState === 'function') {
        const state = API.getMatchState(m);
        if (state === 'live')     return { ...m, status: 'live' };
        if (state === 'finished') return { ...m, status: 'finished' };
      }
      return m;
    });

    if (!all || all.length === 0) {
      el.innerHTML = '<p class="empty-state">Sin partidos cargados</p>';
      return;
    }

    // Fecha "hoy" en zona local del usuario
    const now      = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const yestDate = new Date(now); yestDate.setDate(yestDate.getDate()-1);
    const yestStr  = `${yestDate.getFullYear()}-${String(yestDate.getMonth()+1).padStart(2,'0')}-${String(yestDate.getDate()).padStart(2,'0')}`;
    // Partidos con date UTC del día siguiente pero hora UTC que en local corresponde a hoy
    // (por ej. 2026-06-08T00:00Z = 2026-06-07 18:00 hora El Salvador UTC-6)
    const isTodayUTC = (m) => {
      if (m.date === todayStr) return true;
      // Verificar si la hora UTC del partido cae en el día local de hoy
      if (m.time && (m.date === todayStr || m.date > todayStr)) {
        const matchUTC = new Date(`${m.date}T${m.time}:00Z`);
        const matchLocal = new Date(matchUTC.getFullYear(), matchUTC.getMonth(), matchUTC.getDate());
        const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return matchUTC >= todayLocal && matchUTC < new Date(todayLocal.getTime() + 86400000);
      }
      return false;
    };
    const renderMatch = m => {
      const isToday    = isTodayUTC(m);
      const isYesterday= m.date === yestStr;
      const isLive     = m.status === 'live';
      const isFinished = m.status === 'finished';
      const isFriendly = m.type === 'friendly';

      const badgeLabel = isFriendly ? 'AMISTOSO' : '🏆 MUNDIAL';
      const badgeStyle = isFriendly
        ? 'background:rgba(74,168,255,0.15);color:var(--rare);border:1px solid rgba(74,168,255,0.3)'
        : 'background:rgba(255,215,0,0.12);color:var(--gold);border:1px solid rgba(255,215,0,0.3)';

      const barColor = isLive ? '#ff4466' : isFinished ? '#555' : isToday ? '#4aa8ff' : 'transparent';

      let statusBadge = '';
      if (isLive) {
        statusBadge = `<span style="font-size:0.5rem;padding:1px 5px;border-radius:6px;background:rgba(255,68,102,0.2);color:#ff4466;font-weight:700;margin-left:2px">🔴 EN VIVO${m.minute ? ' · '+m.minute+"'" : ''}</span>`;
      } else if (isFinished) {
        statusBadge = '<span style="font-size:0.5rem;padding:1px 5px;border-radius:6px;background:rgba(100,100,100,0.2);color:#888;font-weight:700;margin-left:2px">✓ FIN</span>';
      } else if (isToday) {
        statusBadge = `<span style="font-size:0.5rem;padding:1px 4px;border-radius:6px;background:rgba(74,168,255,0.2);color:#4aa8ff;font-weight:700;margin-left:2px">HOY · ${m.time||''}</span>`;
      }

      // Marcador final o en vivo
      let scoreHtml = '';
      if (isFinished && m.scoreHome !== null && m.scoreAway !== null) {
        scoreHtml = `<span style="font-size:0.88rem;font-weight:800;color:#ddd;letter-spacing:1px;padding:0 4px;min-width:54px;text-align:center">${m.scoreHome} — ${m.scoreAway}</span>`;
      } else if (isFinished) {
        scoreHtml = `<span style="font-size:0.72rem;font-weight:500;color:#666;padding:0 4px;min-width:54px;text-align:center" title="Resultado no disponible en datos locales. Conecta tu API key para ver el marcador.">? — ?</span>`;
      } else if (isLive && m.scoreHome !== null && m.scoreAway !== null) {
        const sh = m.scoreHome ?? 0, sa = m.scoreAway ?? 0;
        scoreHtml = `<span style="font-size:0.88rem;font-weight:800;color:#ff4466;letter-spacing:1px;padding:0 4px;min-width:54px;text-align:center">${sh} — ${sa}</span>`;
      } else {
        const timeStr = m.time ? m.time+' hrs' : '—';
        scoreHtml = `<span style="color:var(--text-muted);font-size:0.72rem;font-weight:400;min-width:54px;text-align:center">${timeStr}</span>`;
      }

      const hasBar = isLive || isFinished || isToday;
      return `
      <div class="match-item ${hasBar ? 'has-bar' : ''}" style="${hasBar ? `border-left-color:${barColor}` : ''}">
        <div style="flex:1;min-width:0">
          <div style="display:flex;gap:4px;margin-bottom:3px;align-items:center;flex-wrap:wrap">
            <span style="font-size:0.55rem;padding:1px 5px;border-radius:10px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:1px;${badgeStyle}">${badgeLabel}</span>
            ${statusBadge}
          </div>
          <div class="match-teams-row" style="font-size:0.82rem;font-weight:600">
            <span style="${isFinished ? 'color:var(--text-secondary)' : ''}">${m.homeFlag||''} ${m.home}</span>
            ${scoreHtml}
            <span style="${isFinished ? 'color:var(--text-secondary)' : ''}">${m.away} ${m.awayFlag||''}</span>
          </div>
          ${m.venue ? `<div style="font-size:0.62rem;color:var(--text-muted);margin-top:1px">📍 ${m.venue}</div>` : ''}
        </div>
      </div>`;
    };

    // Partidos de HOY: finished (con score) + live + scheduled
    // isTodayUTC maneja partidos UTC cuya hora local cae "hoy" (ej. 00:00 UTC = 18:00 local UTC-6)
    const todayFinished  = all.filter(m => isTodayUTC(m) && m.status === 'finished');
    const todayLive      = all.filter(m => isTodayUTC(m) && m.status === 'live');
    const todayScheduled = all.filter(m => isTodayUTC(m) && m.status === 'scheduled');
    // Partidos de AYER con resultado (para que no desaparezcan hasta medianoche)
    const yesterdayDone  = all.filter(m => m.date === yestStr && m.status === 'finished');
    // Partidos futuros (días > hoy, excluir finalizados y los de hoy)
    const futureMatches  = all.filter(m => !isTodayUTC(m) && m.date >= todayStr && m.status !== 'finished' && m.date !== yestStr);

    let html = '';

    // ── AYER con resultados (si hay y no hay otros "hoy") ──
    if (yesterdayDone.length > 0) {
      const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      const [,ym,yd] = yestStr.split('-');
      html += `<p style="font-size:0.6rem;font-weight:700;color:var(--text-muted);letter-spacing:1px;text-transform:uppercase;margin:0 0 4px">
        Ayer · ${parseInt(yd)} ${months[parseInt(ym)-1]}
        <span style="color:var(--text-muted);font-weight:400;margin-left:4px">(${yesterdayDone.length} resultado${yesterdayDone.length>1?'s':''})</span>
      </p>`;
      html += yesterdayDone.map(renderMatch).join('');
    }

    // ── HOY: live → programados → finalizados ──
    const todayAll = [...todayLive, ...todayScheduled, ...todayFinished];
    if (todayAll.length > 0) {
      const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      const todayLabel = `Hoy · ${now.getDate()} ${months[now.getMonth()]}`;
      html += `<p style="font-size:0.6rem;font-weight:700;color:#4aa8ff;letter-spacing:1px;text-transform:uppercase;margin:${yesterdayDone.length?'8px':0} 0 4px">
        ${todayLabel}
        ${todayFinished.length > 0 ? `<span style="color:var(--text-muted);font-weight:400;margin-left:4px">(${todayFinished.length} finalizado${todayFinished.length>1?'s':''})</span>` : ''}
      </p>`;
      html += todayAll.map(renderMatch).join('');
    } else if (!yesterdayDone.length) {
      html += '<p style="font-size:0.72rem;color:var(--text-muted);padding:4px 0">No hay partidos hoy</p>';
    }

    // PRÓXIMOS (días futuros, máx 6)
    if (futureMatches.length > 0) {
      // Agrupar por fecha
      const byDate = {};
      futureMatches.forEach(m => { (byDate[m.date] = byDate[m.date]||[]).push(m); });

      Object.keys(byDate).sort().slice(0, 3).forEach(dateKey => {
        const [, mm, dd] = dateKey.split('-');
        const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        const label = dateKey === this._tomorrowStr() ? 'Mañana' : `${parseInt(dd)} ${months[parseInt(mm)-1]}`;
        html += `<p style="font-size:0.6rem;font-weight:700;color:var(--text-muted);letter-spacing:1px;text-transform:uppercase;margin:8px 0 4px">${label}</p>`;
        html += byDate[dateKey].slice(0, 4).map(renderMatch).join('');
      });
    }

    el.innerHTML = html;
  },

  _tomorrowStr() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },  /* ── Tabla de posiciones ── */
  async renderStandings() {
    const el = document.getElementById('standings-preview');
    if (!el) return;
    const table = await API.getStandings();

    el.innerHTML = `
      <table class="stats-table standings-mini">
        <thead>
          <tr>
            <th>#</th>
            <th>Equipo</th>
            <th>PJ</th>
            <th>DG</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          ${table.slice(0, 8).map((r, i) => {
            const dg = (r.gf || 0) - (r.gc || 0);
            const dgStr = dg > 0 ? `+${dg}` : `${dg}`;
            return `
              <tr class="${i < 2 ? 'tr-qualify' : i < 4 ? 'tr-maybe' : ''}">
                <td class="pos">${r.pos}</td>
                <td>${r.flag || ''} ${r.team}</td>
                <td style="color:var(--text-secondary)">${r.pj}</td>
                <td style="color:${dg >= 0 ? '#44ff88' : '#ff4466'}">${dgStr}</td>
                <td class="pts">${r.pts}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      <p style="font-size:0.6rem;color:var(--text-muted);margin-top:4px;text-align:right">
        🟢 Clasifican | 🟡 Posible clasificación
      </p>
    `;
  },

  /* ── Favoritos con foto y click para stats ── */
  async renderFavorites() {
    const el   = document.getElementById('favorites-preview');
    if (!el) return;
    const user = await Auth.currentUser();
    const favs = user?.favoritos || [];

    if (!favs.length) {
      el.innerHTML = '<p class="empty-state">Agrega favoritos en Estadísticas ⭐</p>';
      return;
    }

    // Render inicial con emojis
    el.innerHTML = `<div class="favs-grid">${favs.slice(0, 8).map(f => `
      <div class="fav-card" data-id="${f.id}" data-tipo="${f.tipo}" data-name="${f.name}" title="${f.name}">
        <div class="fav-card-photo" id="fav-photo-${f.id}">
          <span class="fav-card-emoji">${f.flag || (f.tipo==='team'?'🏳️':'👤')}</span>
        </div>
        <span class="fav-card-name">${f.name.split(' ')[0]}</span>
        <span class="fav-card-type">${f.tipo==='team'?'Equipo':'Jugador'}</span>
      </div>`).join('')}
    </div>`;

    // Click → mostrar modal de stats
    el.querySelectorAll('.fav-card').forEach(card => {
      card.addEventListener('click', () => this._showFavStats(
        card.dataset.id, card.dataset.tipo, card.dataset.name
      ));
    });

    // Cargar fotos async (solo jugadores por ahora)
    const pool = (typeof Gacha !== 'undefined') ? Gacha.getPool() : [];
    favs.slice(0, 8).forEach(async f => {
      if (f.tipo !== 'player') return;
      try {
        // Buscar en el pool de figuritas para usar getPhotoById (caché unificado por id)
        const poolFig = pool.find(p => p.id === f.id || p.name.toLowerCase() === f.name.toLowerCase());
        const url = poolFig
          ? await API.getPhotoById(poolFig.id, poolFig.sdbName || poolFig.name)
          : await API.getPlayerPhotosCached(f.name);
        if (!url) return;
        const wrap = document.getElementById(`fav-photo-${f.id}`);
        if (!wrap) return;
        wrap.innerHTML = `<img referrerpolicy="no-referrer" src="${url}" alt="${f.name}"
          style="width:100%;height:100%;object-fit:cover;object-position:top center;border-radius:8px;"
          onerror="this.style.display='none'">`;
      } catch(_) {}
    });
  },

  async _showFavStats(id, tipo, name) {
    if (tipo === 'player') {
      const pool   = (typeof Gacha !== 'undefined') ? Gacha.getPool() : [];
      const poolFig = pool.find(p => p.id === id || p.name.toLowerCase() === name.toLowerCase());
      // Usar SIEMPRE poolFig como fuente de stats (misma fuente que el Álbum)
      const photo  = poolFig
        ? await API.getPhotoById(poolFig.id, poolFig.sdbName || poolFig.name).catch(()=>null)
        : await API.getPlayerPhotosCached(name).catch(()=>null);
      const photoHtml = photo
        ? `<div style="width:110px;height:130px;margin:0 auto 0.75rem;border-radius:8px;overflow:hidden;border:2px solid var(--border-bright)">
             <img referrerpolicy="no-referrer" src="${photo}" style="width:100%;height:100%;object-fit:cover;object-position:top center;" onerror="this.style.display='none'">
           </div>`
        : `<div style="font-size:3rem;margin-bottom:0.5rem">${'👤'}</div>`;
      const p = poolFig || { name, pos:'—', team:'—', caps:0, goals:0, assists:0, rating:'—', flag:'' };
      Modal.open(`
        <div class="modal-player-detail">
          ${photoHtml}
          <h2 class="modal-player-name">${p.name}</h2>
          <p class="modal-player-team">${p.flag||''} ${p.team}</p>
          <div style="display:flex;gap:0.5rem;justify-content:center;margin-bottom:1rem;flex-wrap:wrap">
            <span class="pos-badge">${p.pos}</span>
            ${p.rating ? `<span class="figurita-rating">⭐ ${p.rating}</span>` : ''}
          </div>
          <div class="modal-stats-row">
            <div class="modal-stat"><span>${p.goals ?? 0}</span><label>Goles</label></div>
            <div class="modal-stat"><span>${p.assists ?? 0}</span><label>Asist.</label></div>
            <div class="modal-stat"><span>${p.apps ?? p.caps ?? 0}</span><label>Partidos</label></div>
          </div>
        </div>`);
    } else {
      /* ── Modal de EQUIPO — v12: con historial de partidos ── */
      Modal.open(`
        <div class="modal-player-detail">
          <div style="font-size:3rem;margin-bottom:0.25rem">${name.split(' ')[0]}</div>
          <h2 class="modal-player-name" style="margin-bottom:0.25rem">${name}</h2>
          <p style="font-size:0.65rem;color:var(--text-muted);margin-bottom:1rem">Cargando partidos...</p>
        </div>`);

      /* Cargar datos en paralelo */
      const [teams, teamData] = await Promise.all([
        API.getTeams(''),
        API.getTeamMatches(name)
      ]);
      const team = teams.find(t => t.id === id || t.name === name);
      const t = team || { name, flag:'🏳️', pj:0, w:0, d:0, l:0, gf:0, gc:0, pts:0 };
      const { played = [], upcoming = [] } = teamData || {};

      const _matchRow = (m, status) => {
        const isHome     = (m.home || '').toLowerCase().includes(name.toLowerCase());
        const isLive     = status === 'live';
        const isFriendly = m.type === 'friendly';
        const scoreStr   = (m.scoreHome !== null && m.scoreAway !== null)
          ? `${m.scoreHome} - ${m.scoreAway}` : '—';
        const resultColor = m.scoreHome !== null
          ? (isHome ? (m.scoreHome > m.scoreAway ? '#44ff88' : m.scoreHome < m.scoreAway ? '#ff4466' : '#aaa')
                    : (m.scoreAway > m.scoreHome ? '#44ff88' : m.scoreAway < m.scoreHome ? '#ff4466' : '#aaa'))
          : 'var(--text-muted)';
        const badge = isFriendly
          ? '<span style="font-size:0.45rem;padding:1px 4px;border-radius:6px;background:rgba(74,168,255,0.15);color:#4aa8ff;border:1px solid rgba(74,168,255,0.3)">AMI</span>'
          : '<span style="font-size:0.45rem;padding:1px 4px;border-radius:6px;background:rgba(255,215,0,0.12);color:var(--gold);border:1px solid rgba(255,215,0,0.25)">WC</span>';
        return `
          <div style="display:flex;align-items:center;gap:6px;padding:5px 0;border-bottom:1px solid var(--border)">
            ${badge}
            <span style="flex:1;font-size:0.7rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              ${m.homeFlag||''} ${m.home}
            </span>
            <span style="font-size:0.72rem;font-weight:700;color:${isLive?'#ff4466':resultColor};min-width:40px;text-align:center">
              ${isLive ? `🔴 ${scoreStr}` : scoreStr}
            </span>
            <span style="flex:1;font-size:0.7rem;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              ${m.away} ${m.awayFlag||''}
            </span>
          </div>`;
      };

      const playedHtml = played.length
        ? played.slice(0,6).map(m => _matchRow(m, m.status)).join('')
        : '<p style="font-size:0.7rem;color:var(--text-muted);padding:6px 0">Sin partidos registrados aún</p>';

      const upcomingHtml = upcoming.length
        ? upcoming.slice(0,5).map(m => `
          <div style="display:flex;align-items:center;gap:6px;padding:5px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:0.45rem;padding:1px 4px;border-radius:6px;${m.type==='friendly'?'background:rgba(74,168,255,0.15);color:#4aa8ff;border:1px solid rgba(74,168,255,0.3)':'background:rgba(255,215,0,0.12);color:var(--gold);border:1px solid rgba(255,215,0,0.25)'}">${m.type==='friendly'?'AMI':'WC'}</span>
            <span style="flex:1;font-size:0.68rem">${m.homeFlag||''} ${m.home} vs ${m.away} ${m.awayFlag||''}</span>
            <span style="font-size:0.65rem;color:var(--text-muted)">${Dashboard._formatDate(m.date)}</span>
          </div>`).join('')
        : '<p style="font-size:0.7rem;color:var(--text-muted);padding:6px 0">Sin próximos partidos</p>';

      Modal.open(`
        <div class="modal-player-detail">
          <div style="font-size:3rem;margin-bottom:0.25rem">${t.flag||'🏳️'}</div>
          <h2 class="modal-player-name" style="margin-bottom:0.5rem">${t.name}</h2>

          <div class="modal-stats-row" style="flex-wrap:wrap;gap:0.6rem;margin-bottom:1rem">
            <div class="modal-stat"><span>${t.pj||0}</span><label>PJ</label></div>
            <div class="modal-stat"><span style="color:#44ff88">${t.w||0}</span><label>G</label></div>
            <div class="modal-stat"><span>${t.d||0}</span><label>E</label></div>
            <div class="modal-stat"><span style="color:#ff4466">${t.l||0}</span><label>P</label></div>
            <div class="modal-stat"><span>${t.gf||0}</span><label>GF</label></div>
            <div class="modal-stat"><span style="color:var(--gold);font-weight:700">${t.pts||0}</span><label>Pts</label></div>
          </div>

          <div style="text-align:left;width:100%">
            <p style="font-size:0.65rem;font-weight:700;color:var(--text-muted);letter-spacing:1px;margin-bottom:4px;text-transform:uppercase">Partidos jugados</p>
            ${playedHtml}
          </div>

          <div style="text-align:left;width:100%;margin-top:0.75rem">
            <p style="font-size:0.65rem;font-weight:700;color:var(--text-muted);letter-spacing:1px;margin-bottom:4px;text-transform:uppercase">Próximos partidos</p>
            ${upcomingHtml}
          </div>
        </div>`);
    }
  },

  _formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const [, m, d] = dateStr.split('-');
      const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      return `${parseInt(d)} ${months[parseInt(m)-1]}`;
    } catch(_) { return dateStr; }
  }
};
