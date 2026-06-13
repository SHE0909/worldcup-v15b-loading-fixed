/**
 * exchange.js — Sistema de Intercambio de Duplicados por Sobres  v7
 *
 * Reglas:
 *   2 COMMON  duplicadas → 1 sobre RARE    (RNG)
 *   2 RARE    duplicadas → 1 sobre EPIC    (RNG)
 *   2 EPIC    duplicadas → 1 sobre LEGENDARY (RNG)
 *   3 de cualquiera     → 1 sobre rareza+1 con mejor odds
 *
 * Los sobres abren con animación gacha y dan 1 figurita de esa rareza.
 */

const EXCHANGE_RULES = [
  { id:'c2r',  from:'common',    fromQty:2, to:'rare',      label:'2 Comunes → 1 Sobre Raro',      emoji:'🎁', desc:'RNG dentro de las raras' },
  { id:'r2e',  from:'rare',      fromQty:2, to:'epic',      label:'2 Raras → 1 Sobre Épico',        emoji:'💜', desc:'RNG dentro de las épicas' },
  { id:'e2l',  from:'epic',      fromQty:2, to:'legendary', label:'2 Épicas → 1 Sobre Legendario',  emoji:'🌟', desc:'RNG entre las legendarias' },
  { id:'c3r2', from:'common',    fromQty:3, to:'rare',      label:'3 Comunes → 1 Sobre Raro+',      emoji:'🔥', desc:'Mejor odds, garantizado' },
  { id:'r3e2', from:'rare',      fromQty:3, to:'epic',      label:'3 Raras → 1 Sobre Épico+',       emoji:'💫', desc:'Mejor odds entre épicas' },
  { id:'e3l2', from:'epic',      fromQty:3, to:'legendary', label:'3 Épicas → 1 Legendario FIJO',   emoji:'👑', desc:'Garantizado legendario único' },
];

const Exchange = {

  async render() {
    const user  = await Auth.currentUser();
    const owned = user?.figuritas || [];
    const el    = document.getElementById('tab-exchange');
    if (!el) return;

    const dupesByRarity = this._getDuplicatesByRarity(owned);

    el.innerHTML = `
      <div class="section-header">
        <h2>🔄 Intercambio</h2>
        <div style="font-size:0.75rem;color:var(--text-muted)">Canjea duplicados por sobres de mayor rareza</div>
      </div>

      <!-- Mis duplicados -->
      <div class="exchange-dupes-summary">
        ${['common','rare','epic','legendary'].map(r => {
          const dupes = dupesByRarity[r] || 0;
          const rLabels = { common:'Comunes', rare:'Raras', epic:'Épicas', legendary:'Legendarias' };
          return `
            <div class="edupe-box rarity-${r}">
              <div class="edupe-count">${dupes}</div>
              <div class="edupe-label">${rLabels[r]}</div>
              <div class="edupe-sub">duplicadas</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Canjear monedas por tiradas -->
      <div class="exchange-rules-title">Canjear monedas</div>
      <div class="exchange-rules-grid" id="exchange-coins-grid" style="margin-bottom:1rem">
        <div class="exchange-rule-card ${(user.monedas||0) >= 100 ? 'available' : 'unavailable'}">
          <div class="erc-emoji">🪙</div>
          <div class="erc-label">100 Monedas → 1 Tirada</div>
          <div class="erc-desc">Cambia tus monedas por tiradas de gacha</div>
          <div class="erc-progress">
            <span class="${(user.monedas||0) >= 100 ? 'erc-have' : 'erc-need'}">
              ${user.monedas||0}/100
            </span>
            ${(user.monedas||0) >= 100
              ? `<span class="erc-ready">¡Listo!</span>`
              : `<span class="erc-missing">Faltan ${100 - (user.monedas||0)}</span>`
            }
          </div>
          ${(user.monedas||0) >= 100
            ? `<button class="btn btn-primary" id="erc-coins-btn" style="width:100%;margin-top:0.5rem;font-size:0.8rem">
                 Canjear 🎴
               </button>`
            : `<div class="erc-locked">🔒 No disponible</div>`
          }
        </div>
      </div>

      <!-- Reglas de intercambio -->
      <div class="exchange-rules-title">Opciones de canje</div>
      <div class="exchange-rules-grid" id="exchange-rules-grid">
        ${EXCHANGE_RULES.map(rule => {
          const available = dupesByRarity[rule.from] || 0;
          const canExchange = available >= rule.fromQty;
          return `
            <div class="exchange-rule-card ${canExchange ? 'available' : 'unavailable'}"
                 data-rule="${rule.id}" ${canExchange ? '' : 'title="No tienes suficientes duplicados"'}>
              <div class="erc-emoji">${rule.emoji}</div>
              <div class="erc-label">${rule.label}</div>
              <div class="erc-desc">${rule.desc}</div>
              <div class="erc-progress">
                <span class="${canExchange ? 'erc-have' : 'erc-need'}">
                  ${available}/${rule.fromQty}
                </span>
                ${canExchange
                  ? `<span class="erc-ready">¡Listo!</span>`
                  : `<span class="erc-missing">Faltan ${rule.fromQty - available}</span>`
                }
              </div>
              ${canExchange
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
          ${(user.exchangeLog || []).slice(-5).reverse().map(e => `
            <div style="padding:0.3rem 0;border-bottom:1px solid var(--border)">
              ${e.emoji} ${e.label} → obtuviste <strong style="color:var(--accent)">${e.result}</strong>
              <span style="float:right;font-size:0.7rem">${new Date(e.ts).toLocaleDateString('es')}</span>
            </div>
          `).join('') || '<div style="color:var(--text-muted);font-size:0.8rem">Sin canjes todavía</div>'}
        </div>
      </div>
    `;

    // Canjear monedas por tirada
    const coinsBtn = el.querySelector('#erc-coins-btn');
    if (coinsBtn) {
      coinsBtn.addEventListener('click', async () => {
        await this.doExchangeCoins();
      });
    }

    // Eventos de canje
    el.querySelectorAll('.erc-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ruleId = btn.dataset.rule;
        await this.doExchange(ruleId);
      });
    });
  },

  _getDuplicatesByRarity(owned) {
    const counts = { common: 0, rare: 0, epic: 0, legendary: 0 };
    owned.forEach(f => {
      if (f.duplicados > 0) counts[f.rareza] = (counts[f.rareza] || 0) + f.duplicados;
    });
    return counts;
  },

  async doExchangeCoins() {
    const user = await Auth.currentUser();
    if (!user) return;
    const monedas = user.monedas || 0;
    if (monedas < 100) {
      Toast.warn('Necesitas al menos 100 monedas para canjear');
      return;
    }

    user.monedas  = monedas - 100;
    user.tiradas  = (user.tiradas || 0) + 1;
    await Auth.updateUser(user);
    await DB.logActivity(user.email, 'exchange', '100 monedas → 1 tirada');
    if (typeof App !== 'undefined') await App.refreshHeader();

    Toast.success('¡Canjeado! +1 🎴 tirada de gacha');
    await this.render();
  },

  async doExchange(ruleId) {
    const rule = EXCHANGE_RULES.find(r => r.id === ruleId);
    if (!rule) return;

    const user  = await Auth.currentUser();
    const owned = user?.figuritas || [];
    const dupes = this._getDuplicatesByRarity(owned);

    if ((dupes[rule.from] || 0) < rule.fromQty) {
      Toast.warn(`No tienes suficientes duplicadas de rareza ${rule.from}`);
      return;
    }

    // Consumir duplicados
    let toConsume = rule.fromQty;
    for (const fig of owned) {
      if (toConsume <= 0) break;
      if (fig.rareza === rule.from && fig.duplicados > 0) {
        const use = Math.min(fig.duplicados, toConsume);
        fig.duplicados -= use;
        toConsume -= use;
      }
    }

    // Obtener figurita de la rareza target
    const pool    = Gacha.getPool().filter(f => f.rareza === rule.to);
    const picked  = pool[Math.floor(Math.random() * pool.length)];
    if (!picked) { Toast.warn('Error interno'); return; }

    // Agregar al álbum o duplicado
    const existing = owned.find(f => f.id === picked.id);
    const isNew = !existing;
    if (existing) {
      existing.duplicados = (existing.duplicados || 0) + 1;
    } else {
      owned.push({ ...picked, duplicados: 0, obtenida: new Date().toISOString() });
    }

    // Log de intercambio
    if (!user.exchangeLog) user.exchangeLog = [];
    user.exchangeLog.push({
      emoji: rule.emoji,
      label: rule.label,
      result: picked.name,
      resultRarity: rule.to,
      isNew,
      ts: Date.now()
    });

    user.figuritas = owned;
    await Auth.updateUser(user);
    await DB.logActivity(user.email, 'exchange', `${rule.label} → ${picked.name}`);
    if (typeof App !== 'undefined') await App.refreshHeader();

    // Mostrar resultado con animación gacha
    await this._showExchangeResult(picked, isNew, rule);
    await this.render();
  },

  async _showExchangeResult(fig, isNew, rule) {
    // Intentar cargar foto
    let photoUrl = null;
    try { photoUrl = await API.getPlayerPhotosCached(fig.sdbName || fig.name); } catch(_) {}

    const rarityColors = {
      common: '#aaa', rare: 'var(--rare)', epic: 'var(--epic)', legendary: 'var(--legendary)'
    };
    const color = rarityColors[fig.rareza] || 'var(--accent)';

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
            ${photoUrl
              ? `<img src="${photoUrl}" alt="${fig.name}"
                      style="width:100%;height:100%;object-fit:cover;object-position:top"
                      onerror="this.parentNode.innerHTML='<span style=\\'font-size:3rem\\'>${fig.emoji}</span>'">`
              : `<span style="font-size:3rem">${fig.emoji}</span>`
            }
          </div>
          <div style="padding:0.4rem;width:100%;text-align:center">
            <div style="font-family:'Bebas Neue',cursive;font-size:0.95rem;color:var(--text-primary);letter-spacing:1px">
              ${fig.name}
            </div>
            <div style="font-size:0.6rem;color:var(--text-muted)">${fig.flag||''} ${fig.team}</div>
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
          ${fig.flag||''} ${fig.team}
        </p>
        <div style="display:inline-block;background:${color}22;border:1px solid ${color}55;
                    color:${color};font-size:0.7rem;padding:2px 8px;border-radius:12px;
                    font-family:'Barlow Condensed',sans-serif;letter-spacing:1px;margin:0.5rem 0">
          ${Gacha.getRarityLabel(fig.rareza).toUpperCase()}
        </div>
        ${isNew
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
