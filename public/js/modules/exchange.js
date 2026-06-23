const REGLAS_CANJE = [
  { id:'c2r',  from:'common',    fromQty:2, to:'rare',      etiqueta:'2 Comunes → 1 Sobre Raro',      emoji:'🎁', desc:'RNG dentro de las raras' },
  { id:'r2e',  from:'rare',      fromQty:2, to:'figEpica',      etiqueta:'2 Raras → 1 Sobre Épico',        emoji:'💜', desc:'RNG dentro de las épicas' },
  { id:'e2l',  from:'figEpica',      fromQty:2, to:'legendary', etiqueta:'2 Épicas → 1 Sobre Legendario',  emoji:'🌟', desc:'RNG entre las legendarias' },
  { id:'c3r2', from:'common',    fromQty:3, to:'rare',      etiqueta:'3 Comunes → 1 Sobre Raro+',      emoji:'🔥', desc:'Mejor odds, garantizado' },
  { id:'r3e2', from:'rare',      fromQty:3, to:'figEpica',      etiqueta:'3 Raras → 1 Sobre Épico+',       emoji:'💫', desc:'Mejor odds entre épicas' },
  { id:'e3l2', from:'figEpica',      fromQty:3, to:'legendary', etiqueta:'3 Épicas → 1 Legendario FIJO',   emoji:'👑', desc:'Garantizado legendario único' },
];

const Exchange = {

  async renderizar() {
    const usuario  = await Auth.currentUser();
    const coleccion = usuario?.figuritas || [];
    const el    = document.getElementById('tab-exchange');
    if (!el) return;

    const dupesPorRareza = this._getDuplicatesByRarity(coleccion);

    el.innerHTML = `
      <div class="section-header">
        <h2><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:6px"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>Intercambio</h2>
        <div style="font-size:0.75rem;color:var(--text-muted)">Canjea duplicados por sobres de mayor rareza</div>
      </div>

      <!-- Mis duplicados -->
      <div class="exchange-duplicados-summary">
        ${['common','rare','figEpica','legendary'].map(r => {
          const duplicados = dupesPorRareza[r] || 0;
          const etiquetasR = { common:'Comunes', rare:'Raras', figEpica:'Épicas', legendary:'Legendarias' };
          return `
            <div class="edupe-box rarity-${r}">
              <div class="edupe-count">${duplicados}</div>
              <div class="edupe-etiqueta">${etiquetasR[r]}</div>
              <div class="edupe-sub">duplicadas</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Canjear monedas por tiradas -->
      <div class="exchange-rules-title">Canjear monedas</div>
      <div class="exchange-rules-grid" id="exchange-monedas-grid" style="margin-bottom:1rem">
        <div class="exchange-rule-card ${(usuario.monedas||0) >= 100 ? 'disponibles' : 'unavailable'}">
          <div class="erc-emoji">🪙</div>
          <div class="erc-etiqueta">100 Monedas → 1 Tirada</div>
          <div class="erc-desc">Cambia tus monedas por tiradas de gacha</div>
          <div class="erc-progress">
            <span class="${(usuario.monedas||0) >= 100 ? 'erc-have' : 'erc-need'}">
              ${usuario.monedas||0}/100
            </span>
            ${(usuario.monedas||0) >= 100
              ? `<span class="erc-ready">¡Listo!</span>`
              : `<span class="erc-missing">Faltan ${100 - (usuario.monedas||0)}</span>`
            }
          </div>
          ${(usuario.monedas||0) >= 100
            ? `<button class="btn btn-primary" id="erc-monedas-btn" style="width:100%;margin-top:0.5rem;font-size:0.8rem">
                 Canjear 🎴
               </button>`
            : `<div class="erc-locked">🔒 No disponible</div>`
          }
        </div>
      </div>

      <!-- Reglas de intercambio -->
      <div class="exchange-rules-title">Opciones de canje</div>
      <div class="exchange-rules-grid" id="exchange-rules-grid">
        ${REGLAS_CANJE.map(rule => {
          const disponibles = dupesPorRareza[rule.from] || 0;
          const puedeCanjearse = disponibles >= rule.fromQty;
          return `
            <div class="exchange-rule-card ${puedeCanjearse ? 'disponibles' : 'unavailable'}"
                 data-rule="${rule.id}" ${puedeCanjearse ? '' : 'title="No tienes suficientes duplicados"'}>
              <div class="erc-emoji">${rule.emoji}</div>
              <div class="erc-etiqueta">${rule.etiqueta}</div>
              <div class="erc-desc">${rule.desc}</div>
              <div class="erc-progress">
                <span class="${puedeCanjearse ? 'erc-have' : 'erc-need'}">
                  ${disponibles}/${rule.fromQty}
                </span>
                ${puedeCanjearse
                  ? `<span class="erc-ready">¡Listo!</span>`
                  : `<span class="erc-missing">Faltan ${rule.fromQty - disponibles}</span>`
                }
              </div>
              ${puedeCanjearse
                ? `<button class="btn btn-primary erc-btn" data-rule="${rule.id}" style="width:100%;margin-top:0.5rem;font-size:0.8rem">
                     Canjear ${rule.emoji}
                   </button>`
                : `<div class="erc-locked">🔒 No disponible</div>`
              }
            </div>
          `;
        }).join('')}
      </div>

      <!-- Historial de intercambios -->
      <div class="exchange-history">
        <div class="exchange-rules-title">Últimos canjes</div>
        <div id="exchange-log" style="font-size:0.8rem;color:var(--text-muted)">
          ${(usuario.exchangeLog || []).slice(-5).reverse().map(e => `
            <div style="padding:0.3rem 0;border-bottom:1px solid var(--border)">
              ${e.emoji} ${e.etiqueta} → obtuviste <strong style="color:var(--accent)">${e.result}</strong>
              <span style="float:right;font-size:0.7rem">${new Date(e.ts).toLocaleDateString('es')}</span>
            </div>
          `).join('') || '<div style="color:var(--text-muted);font-size:0.8rem">Sin canjes todavía</div>'}
        </div>
      </div>
    `;

    
    const btnMonedas = el.querySelector('#erc-monedas-btn');
    if (btnMonedas) {
      btnMonedas.addEventListener('click', async () => {
        await this.doExchangeCoins();
      });
    }

    
    el.querySelectorAll('.erc-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idRegla = btn.dataset.rule;
        await this.doExchange(idRegla);
      });
    });
  },

  _getDuplicatesByRarity(coleccion) {
    const conteos = { common: 0, rare: 0, figEpica: 0, legendary: 0 };
    coleccion.forEach(f => {
      if (f.duplicados > 0) conteos[f.rareza] = (conteos[f.rareza] || 0) + f.duplicados;
    });
    return conteos;
  },

  async doExchangeCoins() {
    const usuario = await Auth.currentUser();
    if (!usuario) return;
    const monedas = usuario.monedas || 0;
    if (monedas < 100) {
      Toast.warn('Necesitas al menos 100 monedas para canjear');
      return;
    }

    usuario.monedas  = monedas - 100;
    usuario.tiradas  = (usuario.tiradas || 0) + 1;
    await Auth.updateUser(usuario);
    await DB.logActivity(usuario.email, 'exchange', '100 monedas → 1 tirada');
    if (typeof App !== 'undefined') await App.refreshHeader();

    Toast.success('¡Canjeado! +1 🎴 tirada de gacha');
    await this.renderizar();
  },

  async doExchange(idRegla) {
    const rule = REGLAS_CANJE.find(r => r.id === idRegla);
    if (!rule) return;

    const usuario  = await Auth.currentUser();
    const coleccion = usuario?.figuritas || [];
    const duplicados = this._getDuplicatesByRarity(coleccion);

    if ((duplicados[rule.from] || 0) < rule.fromQty) {
      Toast.warn(`No tienes suficientes duplicadas de rareza ${rule.from}`);
      return;
    }

    
    let aConsumir = rule.fromQty;
    for (const fig of coleccion) {
      if (aConsumir <= 0) break;
      if (fig.rareza === rule.from && fig.duplicados > 0) {
        const use = Math.min(fig.duplicados, aConsumir);
        fig.duplicados -= use;
        aConsumir -= use;
      }
    }

    
    const pool    = Gacha.getPool().filter(f => f.rareza === rule.to);
    const elegido2  = pool[Math.floor(Math.random() * pool.length)];
    if (!elegido2) { Toast.warn('Error interno'); return; }

    
    const existente = coleccion.find(f => f.id === elegido2.id);
    const esNuevo = !existente;
    if (existente) {
      existente.duplicados = (existente.duplicados || 0) + 1;
    } else {
      coleccion.push({ ...elegido2, duplicados: 0, obtenida: new Date().toISOString() });
    }

    
    if (!usuario.exchangeLog) usuario.exchangeLog = [];
    usuario.exchangeLog.push({
      emoji: rule.emoji,
      etiqueta: rule.etiqueta,
      result: elegido2.name,
      resultRarity: rule.to,
      esNuevo,
      ts: Date.now()
    });

    usuario.figuritas = coleccion;
    await Auth.updateUser(usuario);
    await DB.logActivity(usuario.email, 'exchange', `${rule.etiqueta} → ${elegido2.name}`);
    if (typeof App !== 'undefined') await App.refreshHeader();

    
    await this._showExchangeResult(elegido2, esNuevo, rule);
    await this.renderizar();
  },

  async _showExchangeResult(fig, esNuevo, rule) {
    
    let urlFoto = null;
    try { urlFoto = await API.getPhotoById(fig.id); } catch(_) {}

    const coloresRareza = {
      common: '#aaa', rare: 'var(--rare)', figEpica: 'var(--figEpica)', legendary: 'var(--legendary)'
    };
    const color = coloresRareza[fig.rareza] || 'var(--accent)';

    Modal.open(`
      <div style="text-align:center;padding:0.5rem 0">
        <div style="font-size:0.75rem;color:var(--text-muted);letter-spacing:2px;margin-bottom:0.5rem">
          SOBRE ABIERTO ${rule.emoji}
        </div>

        <!-- Card reveal -->
        <div style="width:120px;height:160px;margin:0 auto 1rem;border-radius:12px;
                    background:linear-gradient(160deg,var(--bg-surface),var(--bg-card));
                    border:2px solid ${color};
                    box-shadow:0 0 30px ${color}55;
                    display:flex;flex-direction:column;align-items:center;justify-content:center;
                    animation:cardReveal 0.5s ease;overflow:hidden;position:relative">
          <div style="width:100%;height:65%;overflow:hidden;display:flex;align-items:center;justify-content:center;
                      background:linear-gradient(160deg,#111827,#0f172a)">
            ${urlFoto
              ? `<img src="${urlFoto}" alt="${fig.name}"
                      style="width:100%;height:100%;object-fit:cover;object-position:top"
                      onerror="this.parentNode.innerHTML='<span style=\\'font-size:2rem\\'>${Array.isArray(fig.emoji) ? fig.emoji.join('') : (fig.emoji || '⚽')}</span>'">`
              : `<span style="font-size:3rem">${Array.isArray(fig.emoji) ? fig.emoji.join('') : (fig.emoji || '⚽')}</span>`
            }
          </div>
          <div style="padding:0.4rem;width:100%;text-align:center">
            <div style="font-family:'Bebas Neue',cursive;font-size:0.95rem;color:var(--text-primary);letter-spacing:1px">
              ${fig.name}
            </div>
            <div style="font-size:0.6rem;color:var(--text-muted)">${fig.flag||''} ${fig.equipo}</div>
          </div>
          <div style="position:absolute;top:4px;right:4px;
                      background:${color};color:#080c14;
                      font-size:0.55rem;font-weight:700;padding:1px 5px;border-radius:4px;
                      font-family:'Barlow Condensed',sans-serif;letter-spacing:1px">
            ${Gacha.getRarityLabel(fig.rareza).toUpperCase()}
          </div>
        </div>

        <h3 style="font-family:'Bebas Neue',cursive;font-size:1.5rem;color:${color};letter-spacing:2px;margin:0">
          ${fig.name}
        </h3>
        <p style="color:var(--text-secondary);font-size:0.85rem;margin:0.25rem 0">
          ${fig.flag||''} ${fig.equipo}
        </p>
        <div style="display:inline-block;background:${color}22;border:1px solid ${color}55;
                    color:${color};font-size:0.7rem;padding:2px 8px;border-radius:12px;
                    font-family:'Barlow Condensed',sans-serif;letter-spacing:1px;margin:0.5rem 0">
          ${Gacha.getRarityLabel(fig.rareza).toUpperCase()}
        </div>
        ${esNuevo
          ? `<div style="color:#44ff88;font-weight:600;font-size:0.85rem;margin-bottom:0.5rem">✨ ¡Nueva figurita!</div>`
          : `<div style="color:var(--text-muted);font-size:0.85rem;margin-bottom:0.5rem">Duplicado +1</div>`
        }
        <button class="btn btn-primary" onclick="Modal.close()" style="width:100%">
          ¡Genial!
        </button>
      </div>
    `);
  }
};
