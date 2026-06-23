const Dashboard = {

  async renderizar() {
    
    await this.renderUpcoming();
    await Promise.all([
      this.renderLive(),
      this.renderStandings(),
      this.renderFavorites()
    ]);

    
    if (!this._upcomingRefreshTimer) {
      this._upcomingRefreshTimer = API.registerTimer(() => this.renderUpcoming(), 5 * 60 * 1000);
    }
    
    if (!this._standingsRefreshTimer) {
      this._standingsRefreshTimer = API.registerTimer(() => this.renderStandings(), 6 * 60 * 60 * 1000);
    }
  },

  
  async renderLive() {
    const el = document.getElementById('enVivo-partidos');
    if (!el) return;

    if (!el.dataset.initialized) {
      el.innerHTML = '<p class="empty-state" style="opacity:.4;font-size:0.7rem">Consultando partidos en vivo...</p>';
      el.dataset.initialized = '1';
    }

    
    const [liveFromApi, upcomingAll] = await Promise.all([
      API.getLiveMatches(),
      API.getUpcomingMatches()
    ]);

    
    const setEnVivo = new Set((liveFromApi||[]).map(m => m.id));
    const soloEnVivo = [...(liveFromApi||[]).filter(m => m.status === 'enVivo')];

    
    
    
    for (const m of (upcomingAll||[])) {
      if (setEnVivo.has(m.id)) continue;
      
      
      
      const esDirecPorEstado = m.status === 'enVivo';
      const esDirecPorTiempo   = m.status === 'scheduled' && typeof API.getMatchState === 'function'
        && API.getMatchState(m) === 'enVivo';

      if (esDirecPorEstado || esDirecPorTiempo) {
        
        if (m.date && m.time) {
          const start   = new Date(`${m.date}T${m.time}:00${typeof API !== 'undefined' && API._venueOffset ? API._venueOffset(m.venue) : '-06:00'}`);
          const difMinutos = (Date.now() - start.getTime()) / 60000;
          if (difMinutos > 115) continue; 
        }
        soloEnVivo.push(esDirecPorTiempo ? { ...m, status: 'enVivo' } : m);
      }
    }

    if (soloEnVivo.length === 0) {
      el.innerHTML = '<p class="empty-state">No hay partidos en vivo ahora mismo</p>';
      return;
    }

    el.innerHTML = soloEnVivo.map(m => {
      const esAmistoso = m.type === 'friendly' || m.type !== 'worldcup';
      const estiloInsignia = esAmistoso
        ? 'background:rgba(74,168,255,0.2);color:#4aa8ff;border:1px solid rgba(74,168,255,0.4)'
        : 'background:rgba(255,215,0,0.15);color:var(--gold);border:1px solid rgba(255,215,0,0.35)';
      const golesH = m.golesLocal ?? 0;
      const golesA = m.golesVisitante ?? 0;
      return `
      <div class="match-item match-enVivo-item has-bar" style="border-left-color:#ff4466;display:block">
        <div style="display:flex;gap:4px;margin-bottom:4px;align-items:center">
          <span style="font-size:0.5rem;padding:1px 5px;border-radius:10px;font-weight:700;letter-spacing:1px;${estiloInsignia}">
            ${esAmistoso ? 'AMISTOSO' : '🏆 MUNDIAL'}
          </span>
          <span class="match-enVivo-insignia" style="font-size:0.55rem;margin-left:auto">
            🔴 ${m.minute ? m.minute+"'" : 'EN VIVO'}
          </span>
        </div>
        <div class="match-equipos-row">
          <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${m.banderaLocal||''} ${m.local}</span>
          <span class="match-score" style="color:#ff4466;font-weight:800;flex-shrink:0">${golesH} — ${golesA}</span>
          <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right">${m.visitante} ${m.banderaVisitante||''}</span>
        </div>
        ${m.competencia ? `<div style="font-size:0.62rem;color:var(--text-muted);margin-top:2px;text-align:center">${m.competencia}</div>` : ''}
        ${m.venue ? `<div style="font-size:0.58rem;color:var(--text-muted);text-align:center">📍 ${m.venue}</div>` : ''}
      </div>`;
    }).join('');

    
    
    if (!this._liveRefreshTimer) {
      this._liveRefreshTimer = API.registerTimer(async () => {
        
        delete API._memCache['enVivo'];
        delete API._memCache['proximos'];
        this.renderLive();
        this.renderUpcoming();
        
        try {
          const todosPartidos = await API.getUpcomingMatches();
          if (typeof Predictions !== 'undefined') {
            await Predictions.checkLiveFinished(todosPartidos || []);
          }
        } catch(_) {}
      }, 2 * 60 * 1000);
    }
  },
  
  async renderUpcoming() {
    const el = document.getElementById('proximos-partidos');
    if (!el) return;

    const [allRaw, liveMatches] = await Promise.all([
      API.getUpcomingMatches(),
      API.getLiveMatches()
    ]);

    
    const enVivoPorId   = new Map((liveMatches||[]).map(m => [m.id, m]));
    const enVivoPorEquipo = new Map();
    (liveMatches||[]).forEach(m => {
      enVivoPorEquipo.set((m.local||'').toLowerCase(), m);
      enVivoPorEquipo.set((m.visitante||'').toLowerCase(), m);
    });

    const all = (allRaw||[]).map(m => {
      const partidoEnVivo = enVivoPorId.get(m.id)
        || (enVivoPorEquipo.has((m.local||'').toLowerCase()) && enVivoPorEquipo.has((m.visitante||'').toLowerCase())
            ? enVivoPorEquipo.get((m.local||'').toLowerCase()) : null);
      if (partidoEnVivo) {
        return { ...m, status:'enVivo', golesLocal:partidoEnVivo.golesLocal, golesVisitante:partidoEnVivo.golesVisitante, minute:partidoEnVivo.minute };
      }
      
      
      if (m.status === 'enVivo' && m.date && m.time) {
        const _off  = typeof API !== 'undefined' && API._venueOffset ? API._venueOffset(m.venue) : '-06:00';
        const start   = new Date(`${m.date}T${m.time}:00${_off}`);
        const difMinutos = (Date.now() - start.getTime()) / 60000;
        if (difMinutos > 115) return { ...m, status: 'finalizados' };
      }
      
      
      
      if (m.status === 'scheduled' && typeof API.getMatchState === 'function') {
        const state = API.getMatchState(m);
        if (state === 'enVivo')     return { ...m, status: 'enVivo' };
        if (state === 'finalizados') return { ...m, status: 'finalizados' };
      }
      return m;
    });

    if (!all || all.length === 0) {
      el.innerHTML = '<p class="empty-state">Sin partidos cargados</p>';
      return;
    }

    
    const now      = new Date();
    const strHoy = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const fechaAyer = new Date(now); fechaAyer.setDate(fechaAyer.getDate()-1);
    const strAyer  = `${fechaAyer.getFullYear()}-${String(fechaAyer.getMonth()+1).padStart(2,'0')}-${String(fechaAyer.getDate()).padStart(2,'0')}`;
    
    
    const esHoyUTC = (m) => {
      if (m.date === strHoy) return true;
      
      if (m.time && (m.date === strHoy || m.date > strHoy)) {
        const _off = typeof API !== 'undefined' && API._venueOffset ? API._venueOffset(m.venue) : '-06:00';
        const utcPartido = new Date(`${m.date}T${m.time}:00${_off}`);
        const matchLocal = new Date(utcPartido.getFullYear(), utcPartido.getMonth(), utcPartido.getDate());
        const hoyLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return utcPartido >= hoyLocal && utcPartido < new Date(hoyLocal.getTime() + 86400000);
      }
      return false;
    };
    const renderPartido = m => {
      const esHoy    = esHoyUTC(m);
      const esAyer= m.date === strAyer;
      const estaEnVivo     = m.status === 'enVivo';
      const estaFinalizado = m.status === 'finalizados';
      const esAmistoso = m.type === 'friendly';

      const etiquetaInsignia = esAmistoso ? 'AMISTOSO' : '🏆 MUNDIAL';
      const estiloInsignia = esAmistoso
        ? 'background:rgba(74,168,255,0.15);color:var(--rare);border:1px solid rgba(74,168,255,0.3)'
        : 'background:rgba(255,215,0,0.12);color:var(--gold);border:1px solid rgba(255,215,0,0.3)';

      const colorBarra = estaEnVivo ? '#ff4466' : estaFinalizado ? '#555' : esHoy ? '#4aa8ff' : 'transparent';

      let insigniaEstado = '';
      if (estaEnVivo) {
        insigniaEstado = `<span style="font-size:0.5rem;padding:1px 5px;border-radius:6px;background:rgba(255,68,102,0.2);color:#ff4466;font-weight:700;margin-left:2px">🔴 EN VIVO${m.minute ? ' · '+m.minute+"'" : ''}</span>`;
      } else if (estaFinalizado) {
        insigniaEstado = '<span style="font-size:0.5rem;padding:1px 5px;border-radius:6px;background:rgba(100,100,100,0.2);color:#888;font-weight:700;margin-left:2px">✓ FIN</span>';
      } else if (esHoy) {
        insigniaEstado = `<span style="font-size:0.5rem;padding:1px 4px;border-radius:6px;background:rgba(74,168,255,0.2);color:#4aa8ff;font-weight:700;margin-left:2px">HOY · ${m.time||''}</span>`;
      }

      
      let htmlMarcador = '';
      if (estaFinalizado && m.golesLocal != null && m.golesVisitante != null) {
        htmlMarcador = `<span style="font-size:0.88rem;font-weight:800;color:#ddd;letter-spacing:1px;padding:0 4px;min-width:54px;text-align:center">${m.golesLocal} — ${m.golesVisitante}</span>`;
      } else if (estaFinalizado) {
        htmlMarcador = `<span style="font-size:0.72rem;font-weight:500;color:#666;padding:0 4px;min-width:54px;text-align:center" title="Resultado no disponible en datos locales. Conecta tu API key para ver el marcador.">? — ?</span>`;
      } else if (estaEnVivo && m.golesLocal != null && m.golesVisitante != null) {
        const sh = m.golesLocal ?? 0, sa = m.golesVisitante ?? 0;
        htmlMarcador = `<span style="font-size:0.88rem;font-weight:800;color:#ff4466;letter-spacing:1px;padding:0 4px;min-width:54px;text-align:center">${sh} — ${sa}</span>`;
      } else {
        const strHora = m.time ? m.time+' hrs' : '—';
        htmlMarcador = `<span style="color:var(--text-muted);font-size:0.72rem;font-weight:400;min-width:54px;text-align:center">${strHora}</span>`;
      }

      const tieneBarra = estaEnVivo || estaFinalizado || esHoy;
      return `
      <div class="match-item ${tieneBarra ? 'has-bar' : ''}" style="${tieneBarra ? `border-left-color:${colorBarra}` : ''}">
        <div style="flex:1;min-width:0">
          <div style="display:flex;gap:4px;margin-bottom:3px;align-items:center;flex-wrap:wrap">
            <span style="font-size:0.55rem;padding:1px 5px;border-radius:10px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:1px;${estiloInsignia}">${etiquetaInsignia}</span>
            ${insigniaEstado}
          </div>
          <div class="match-equipos-row" style="font-size:0.82rem;font-weight:600">
            <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;${estaFinalizado ? 'color:var(--text-secondary)' : ''}">${m.banderaLocal||''} ${m.local}</span>
            <span style="flex-shrink:0">${htmlMarcador}</span>
            <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right;${estaFinalizado ? 'color:var(--text-secondary)' : ''}">${m.visitante} ${m.banderaVisitante||''}</span>
          </div>
          ${m.venue ? `<div style="font-size:0.62rem;color:var(--text-muted);margin-top:1px">📍 ${m.venue}</div>` : ''}
        </div>
      </div>`;
    };

    
    
    const hoyFinalizados  = all.filter(m => esHoyUTC(m) && m.status === 'finalizados');
    const hoyEnVivo      = all.filter(m => esHoyUTC(m) && m.status === 'enVivo');
    const hoyProgramados = all.filter(m => esHoyUTC(m) && m.status === 'scheduled');
    
    const ayerFinalizado  = all.filter(m => m.date === strAyer && m.status === 'finalizados');
    
    const partidosFuturos  = all.filter(m => !esHoyUTC(m) && m.date >= strHoy && m.status !== 'finalizados' && m.date !== strAyer);

    let html = '';

    
    if (ayerFinalizado.length > 0) {
      const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      const [,ym,yd] = strAyer.split('-');
      html += `<p style="font-size:0.6rem;font-weight:700;color:var(--text-muted);letter-spacing:1px;text-transform:uppercase;margin:0 0 4px">
        Ayer · ${parseInt(yd)} ${meses[parseInt(ym)-1]}
        <span style="color:var(--text-muted);font-weight:400;margin-left:4px">(${ayerFinalizado.length} resultado${ayerFinalizado.length>1?'s':''})</span>
      </p>`;
      html += ayerFinalizado.map(renderPartido).join('');
    }

    
    const hoyTodo = [...hoyEnVivo, ...hoyProgramados, ...hoyFinalizados];
    if (hoyTodo.length > 0) {
      const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      const etiquetaHoy = `Hoy · ${now.getDate()} ${meses[now.getMonth()]}`;
      html += `<p style="font-size:0.6rem;font-weight:700;color:#4aa8ff;letter-spacing:1px;text-transform:uppercase;margin:${ayerFinalizado.length?'8px':0} 0 4px">
        ${etiquetaHoy}
        ${hoyFinalizados.length > 0 ? `<span style="color:var(--text-muted);font-weight:400;margin-left:4px">(${hoyFinalizados.length} finalizado${hoyFinalizados.length>1?'s':''})</span>` : ''}
      </p>`;
      html += hoyTodo.map(renderPartido).join('');
    } else if (!ayerFinalizado.length) {
      html += '<p style="font-size:0.72rem;color:var(--text-muted);padding:4px 0">No hay partidos hoy</p>';
    }

    
    if (partidosFuturos.length > 0) {
      
      const porFecha = {};
      partidosFuturos.forEach(m => { (porFecha[m.date] = porFecha[m.date]||[]).push(m); });

      Object.keys(porFecha).sort().slice(0, 3).forEach(dateKey => {
        const [, mm, dd] = dateKey.split('-');
        const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        const etiqueta = dateKey === this._tomorrowStr() ? 'Mañana' : `${parseInt(dd)} ${meses[parseInt(mm)-1]}`;
        html += `<p style="font-size:0.6rem;font-weight:700;color:var(--text-muted);letter-spacing:1px;text-transform:uppercase;margin:8px 0 4px">${etiqueta}</p>`;
        html += porFecha[dateKey].slice(0, 4).map(renderPartido).join('');
      });
    }

    el.innerHTML = html;
  },

  _tomorrowStr() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },  
  async renderStandings() {
    const el = document.getElementById('clasificacion-preview');
    if (!el) return;
    const table = await API.getStandings();

    
    const topGlobal = table
      .slice()
      .sort((a, b) =>
        (b.pts - a.pts) ||
        ((b.w || 0) - (a.w || 0)) ||
        ((b.gf || 0) - (a.gf || 0)) ||
        ((b.gf - b.gc) - (a.gf - a.gc))
      )
      .slice(0, 5);

    const tabs = ['pts', 'victorias', 'gf'];
    const etiquetasTabs = { pts: 'Pts', victorias: 'Victorias', gf: 'Goles' };
    const pestanaActiva = this._standingsTab || 'pts';

    const ordenadosPorTab = (tabKey) => {
      return table.slice().sort((a, b) => {
        if (tabKey === 'pts')  return (b.pts||0) - (a.pts||0) || (b.w||0) - (a.w||0) || (b.gf||0) - (a.gf||0);
        if (tabKey === 'victorias') return (b.w||0) - (a.w||0) || (b.pts||0) - (a.pts||0) || (b.gf||0) - (a.gf||0);
        if (tabKey === 'gf')   return (b.gf||0) - (a.gf||0) || (b.pts||0) - (a.pts||0) || (b.w||0) - (a.w||0);
        return 0;
      }).slice(0, 5);
    };

    const renderFilas = (rows, tabKey) => rows.map((r, i) => {
      const val = tabKey === 'pts' ? r.pts : tabKey === 'victorias' ? (r.w||0) : (r.gf||0);
      const medalla = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}`;
      return `
        <tr>
          <td class="pos" style="font-size:0.9rem">${medalla}</td>
          <td>${r.flag || ''} ${r.equipo}</td>
          <td style="color:var(--text-secondary)">${r.pj||0}</td>
          <td style="color:var(--gold);font-weight:700">${val}</td>
        </tr>
      `;
    }).join('');

    el.innerHTML = `
      <div style="overflow-x:hidden;width:100%">
        <div class="clasificacion-tabs" style="display:flex;gap:4px;margin-bottom:6px">
          ${tabs.map(t => `
            <button class="clasificacion-tab-btn${t === pestanaActiva ? ' active' : ''}" data-stab="${t}"
              style="flex:1;padding:3px 6px;font-size:0.68rem;border:1px solid var(--border);border-radius:6px;background:${t === pestanaActiva ? 'var(--accent)' : 'transparent'};color:${t === pestanaActiva ? '#000' : 'var(--text-muted)'};cursor:pointer;font-weight:${t === pestanaActiva ? '700' : '400'}">
              ${etiquetasTabs[t]}
            </button>`).join('')}
        </div>
        <table class="stats-table clasificacion-mini">
          <encabezadoTabla>
            <tr>
              <th>#</th>
              <th>Equipo</th>
              <th>PJ</th>
              <th style="color:var(--gold)">${etiquetasTabs[pestanaActiva]}</th>
            </tr>
          </encabezadoTabla>
          <cuerpoTabla id="clasificacion-rows">
            ${renderFilas(ordenadosPorTab(pestanaActiva), pestanaActiva)}
          </cuerpoTabla>
        </table>
        <p style="font-size:0.6rem;color:var(--text-muted);margin-top:4px;text-align:right">
          Top 5 equipos · Mundial 2026
        </p>
      </div>
    `;

    
    el.querySelectorAll('.clasificacion-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.stab;
        this._standingsTab = key;
        el.querySelectorAll('.clasificacion-tab-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.stab === key);
          b.style.background = b.dataset.stab === key ? 'var(--accent)' : 'transparent';
          b.style.color = b.dataset.stab === key ? '#000' : 'var(--text-muted)';
          b.style.fontWeight = b.dataset.stab === key ? '700' : '400';
        });
        const encabezadoTabla = el.querySelector('encabezadoTabla tr th:last-child');
        if (encabezadoTabla) encabezadoTabla.textContent = etiquetasTabs[key];
        const cuerpoTabla = el.querySelector('#clasificacion-rows');
        if (cuerpoTabla) cuerpoTabla.innerHTML = renderFilas(ordenadosPorTab(key), key);
      });
    });
  },

  
  async renderFavorites() {
    const el   = document.getElementById('favorites-preview');
    if (!el) return;
    const usuario = await Auth.currentUser();
    const favoritos = usuario?.favoritos || [];

    if (!favoritos.length) {
      el.innerHTML = '<p class="empty-state">Agrega favoritos en Estadísticas ⭐</p>';
      return;
    }

    
    el.innerHTML = `<div class="favoritos-grid">${favoritos.slice(0, 8).map(f => `
      <div class="fav-card" data-id="${f.id}" data-tipo="${f.tipo}" data-name="${f.name}" title="${f.name}">
        <div class="fav-card-photo" id="fav-photo-${f.id}">
          <span class="fav-card-emoji">${f.flag || (f.tipo==='equipo'?'🏳️':'👤')}</span>
        </div>
        <span class="fav-card-name">${f.name.split(' ')[0]}</span>
        <span class="fav-card-type">${f.tipo==='equipo'?'Equipo':'Jugador'}</span>
      </div>`).join('')}
    </div>`;

    
    el.querySelectorAll('.fav-card').forEach(card => {
      card.addEventListener('click', () => this._showFavStats(
        card.dataset.id, card.dataset.tipo, card.dataset.name
      ));
    });

    
    const pool = (typeof Gacha !== 'undefined') ? Gacha.getPool() : [];
    favoritos.slice(0, 8).forEach(async f => {
      if (f.tipo !== 'player') return;
      try {
        
        const figPozo = pool.find(p => p.id === f.id || p.name.toLowerCase() === f.name.toLowerCase());
        const url = figPozo
          ? await API.getPhotoById(figPozo.id, figPozo.sdbName || figPozo.name)
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
      const figPozo = pool.find(p => p.id === id || p.name.toLowerCase() === name.toLowerCase());
      
      const photo  = figPozo
        ? await API.getPhotoById(figPozo.id, figPozo.sdbName || figPozo.name).catch(()=>null)
        : await API.getPlayerPhotosCached(name).catch(()=>null);
      const htmlFoto = photo
        ? `<div style="width:110px;height:130px;margin:0 auto 0.75rem;border-radius:8px;overflow:hidden;border:2px solid var(--border-bright)">
             <img referrerpolicy="no-referrer" src="${photo}" style="width:100%;height:100%;object-fit:cover;object-position:top center;" onerror="this.style.display='none'">
           </div>`
        : `<div style="font-size:3rem;margin-bottom:0.5rem">${'👤'}</div>`;
      const p = figPozo || { name, pos:'—', equipo:'—', caps:0, goals:0, assists:0, rating:'—', flag:'' };
      Modal.open(`
        <div class="modal2-player-detail">
          ${htmlFoto}
          <h2 class="modal2-player-name">${p.name}</h2>
          <p class="modal2-player-equipo">${p.flag||''} ${p.equipo}</p>
          <div style="display:flex;gap:0.5rem;justify-content:center;margin-bottom:1rem;flex-wrap:wrap">
            <span class="pos-insignia">${p.pos}</span>
            ${p.rating ? `<span class="figurita-rating">⭐ ${p.rating}</span>` : ''}
          </div>
          <div class="modal2-stats-row">
            <div class="modal2-stat"><span>${p.goals ?? 0}</span><etiqueta>Goles</etiqueta></div>
            <div class="modal2-stat"><span>${p.assists ?? 0}</span><etiqueta>Asist.</etiqueta></div>
            <div class="modal2-stat"><span>${p.apps ?? p.caps ?? 0}</span><etiqueta>Partidos</etiqueta></div>
          </div>
        </div>`);
    } else {
      
      Modal.open(`
        <div class="modal2-player-detail">
          <div style="font-size:3rem;margin-bottom:0.25rem">${name.split(' ')[0]}</div>
          <h2 class="modal2-player-name" style="margin-bottom:0.25rem">${name}</h2>
          <p style="font-size:0.65rem;color:var(--text-muted);margin-bottom:1rem">Cargando partidos...</p>
        </div>`);

      
      const [equipos, datosEquipo] = await Promise.all([
        API.getTeams(''),
        API.getTeamMatches(name)
      ]);
      const equipo = equipos.find(t => t.id === id || t.name === name);
      const t = equipo || { name, flag:'🏳️', pj:0, w:0, d:0, l:0, gf:0, gc:0, pts:0 };
      const { played = [], proximos = [] } = datosEquipo || {};

      const _matchRow = (m, status) => {
        const esLocal     = (m.local || '').toLowerCase().includes(name.toLowerCase());
        const estaEnVivo     = status === 'enVivo';
        const esAmistoso = m.type === 'friendly';
        const strMarcador   = (m.golesLocal !== null && m.golesVisitante !== null)
          ? `${m.golesLocal} - ${m.golesVisitante}` : '—';
        const colorResultado = m.golesLocal !== null
          ? (esLocal ? (m.golesLocal > m.golesVisitante ? '#44ff88' : m.golesLocal < m.golesVisitante ? '#ff4466' : '#aaa')
                    : (m.golesVisitante > m.golesLocal ? '#44ff88' : m.golesVisitante < m.golesLocal ? '#ff4466' : '#aaa'))
          : 'var(--text-muted)';
        const insignia = esAmistoso
          ? '<span style="font-size:0.45rem;padding:1px 4px;border-radius:6px;background:rgba(74,168,255,0.15);color:#4aa8ff;border:1px solid rgba(74,168,255,0.3)">AMI</span>'
          : '<span style="font-size:0.45rem;padding:1px 4px;border-radius:6px;background:rgba(255,215,0,0.12);color:var(--gold);border:1px solid rgba(255,215,0,0.25)">WC</span>';
        return `
          <div style="display:flex;align-items:center;gap:6px;padding:5px 0;border-bottom:1px solid var(--border)">
            ${insignia}
            <span style="flex:1;font-size:0.7rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              ${m.banderaLocal||''} ${m.local}
            </span>
            <span style="font-size:0.72rem;font-weight:700;color:${estaEnVivo?'#ff4466':colorResultado};min-width:40px;text-align:center">
              ${estaEnVivo ? `🔴 ${strMarcador}` : strMarcador}
            </span>
            <span style="flex:1;font-size:0.7rem;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              ${m.visitante} ${m.banderaVisitante||''}
            </span>
          </div>`;
      };

      const htmlJugados = played.length
        ? played.slice(0,6).map(m => _matchRow(m, m.status)).join('')
        : '<p style="font-size:0.7rem;color:var(--text-muted);padding:6px 0">Sin partidos registrados aún</p>';

      const htmlProximos = proximos.length
        ? proximos.slice(0,5).map(m => `
          <div style="display:flex;align-items:center;gap:6px;padding:5px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:0.45rem;padding:1px 4px;border-radius:6px;${m.type==='friendly'?'background:rgba(74,168,255,0.15);color:#4aa8ff;border:1px solid rgba(74,168,255,0.3)':'background:rgba(255,215,0,0.12);color:var(--gold);border:1px solid rgba(255,215,0,0.25)'}">${m.type==='friendly'?'AMI':'WC'}</span>
            <span style="flex:1;font-size:0.68rem">${m.banderaLocal||''} ${m.local} vs ${m.visitante} ${m.banderaVisitante||''}</span>
            <div style="text-align:right">
              <span style="font-size:0.65rem;color:var(--text-muted);display:block">${Dashboard._formatDate(m.date)} · ${m.time||''}</span>
              ${m.venue ? `<span style="font-size:0.58rem;color:var(--text-muted);opacity:0.7">📍 ${m.venue}</span>` : ''}
            </div>
          </div>`).join('')
        : '<p style="font-size:0.7rem;color:var(--text-muted);padding:6px 0">Sin próximos partidos</p>';

      Modal.open(`
        <div class="modal2-player-detail">
          <div style="font-size:3rem;margin-bottom:0.25rem">${t.flag||'🏳️'}</div>
          <h2 class="modal2-player-name" style="margin-bottom:0.5rem">${t.name}</h2>

          <div class="modal2-stats-row" style="flex-wrap:wrap;gap:0.6rem;margin-bottom:1rem">
            <div class="modal2-stat"><span>${t.pj||0}</span><etiqueta>PJ</etiqueta></div>
            <div class="modal2-stat"><span style="color:#44ff88">${t.w||0}</span><etiqueta>G</etiqueta></div>
            <div class="modal2-stat"><span>${t.d||0}</span><etiqueta>E</etiqueta></div>
            <div class="modal2-stat"><span style="color:#ff4466">${t.l||0}</span><etiqueta>P</etiqueta></div>
            <div class="modal2-stat"><span>${t.gf||0}</span><etiqueta>GF</etiqueta></div>
            <div class="modal2-stat"><span style="color:var(--gold);font-weight:700">${t.pts||0}</span><etiqueta>Pts</etiqueta></div>
          </div>

          <div style="text-align:left;width:100%">
            <p style="font-size:0.65rem;font-weight:700;color:var(--text-muted);letter-spacing:1px;margin-bottom:4px;text-transform:uppercase">Partidos jugados</p>
            ${htmlJugados}
          </div>

          <div style="text-align:left;width:100%;margin-top:0.75rem">
            <p style="font-size:0.65rem;font-weight:700;color:var(--text-muted);letter-spacing:1px;margin-bottom:4px;text-transform:uppercase">Próximos partidos</p>
            ${htmlProximos}
          </div>
        </div>`);
    }
  },

  _formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const [, m, d] = dateStr.split('-');
      const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      return `${parseInt(d)} ${meses[parseInt(m)-1]}`;
    } catch(_) { return dateStr; }
  }
};
