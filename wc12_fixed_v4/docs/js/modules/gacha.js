/**
 * gacha.js — v6
 * Fotos dinámicas vía TheSportsDB API, igual que v9 pero con búsqueda exacta por nombre.
 * v6: sdbName por jugador → API.getPlayerPhotosCached(sdbName) hace match exacto
 *     en lugar de tomar ciegamente player[0]. Sin PHOTO_MAP hardcodeado.
 */

const FIGURITAS_POOL = [
  /* ── GOATS (categoría exclusiva, rareza máxima) ── */
  { id:'fig_g001', name:'Lionel Messi',       sdbName:'Lionel Messi',        team:'Argentina', flag:'🇦🇷', rareza:'goat', emoji:'🐐', pos:'DEL', rating:100, goals:21, assists:14, apps:26, caps:191 },
  { id:'fig_g002', name:'Cristiano Ronaldo',  sdbName:'Cristiano Ronaldo',   team:'Portugal',  flag:'🇵🇹', rareza:'goat', emoji:'🔴', pos:'DEL', rating:99,  goals:19, assists:8,  apps:24, caps:210 },
  { id:'fig_g003', name:'Neymar Jr.',         sdbName:'Neymar Jr',           team:'Brasil',    flag:'🇧🇷', rareza:'goat', emoji:'👑', pos:'DEL', rating:98,  goals:14, assists:16, apps:18, caps:128 },

  /* ── LEGENDARIAS ── */
  { id:'fig_l001', name:'Kylian Mbappé',      sdbName:'Kylian Mbappe',       team:'Francia',   flag:'🇫🇷', rareza:'legendary', emoji:'⚡', pos:'DEL', rating:97, goals:24, assists:8,  apps:28, caps:86  },
  { id:'fig_l002', name:'Vinicius Jr.',        sdbName:'Vinicius Junior',     team:'Brasil',    flag:'🇧🇷', rareza:'legendary', emoji:'🌟', pos:'DEL', rating:96, goals:16, assists:14, apps:30, caps:58  },
  { id:'fig_l003', name:'Erling Haaland',      sdbName:'Erling Haaland',      team:'Noruega',   flag:'🇳🇴', rareza:'legendary', emoji:'🔥', pos:'DEL', rating:95, goals:28, assists:6,  apps:25, caps:35  },
  { id:'fig_l004', name:'Robert Lewandowski',  sdbName:'Robert Lewandowski',  team:'Polonia',   flag:'🇵🇱', rareza:'legendary', emoji:'🦅', pos:'DEL', rating:93, goals:20, assists:5,  apps:27, caps:151 },

  /* ── ÉPICAS ── */
  { id:'fig_e001', name:'Pedri',               sdbName:'Pedri Gonzalez',      team:'España',    flag:'🇪🇸', rareza:'epic', emoji:'🎯', pos:'MED', rating:89, goals:8,  assists:11, apps:24, caps:50 },
  { id:'fig_e002', name:'Jude Bellingham',     sdbName:'Jude Bellingham',     team:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rareza:'epic', emoji:'💫', pos:'MED', rating:88, goals:14, assists:9,  apps:27, caps:43 },
  { id:'fig_e003', name:'Rodri',               sdbName:'Rodri',               team:'España',    flag:'🇪🇸', rareza:'epic', emoji:'🛡️', pos:'MED', rating:91, goals:5,  assists:8,  apps:28, caps:64 },
  { id:'fig_e004', name:'Bernardo Silva',       sdbName:'Bernardo Silva',      team:'Portugal',  flag:'🇵🇹', rareza:'epic', emoji:'🎪', pos:'MED', rating:87, goals:7,  assists:10, apps:29, caps:91 },
  { id:'fig_e005', name:'Raphinha',             sdbName:'Raphinha',            team:'Brasil',    flag:'🇧🇷', rareza:'epic', emoji:'🦅', pos:'DEL', rating:86, goals:12, assists:8,  apps:28, caps:54 },
  { id:'fig_e006', name:'Lamine Yamal',         sdbName:'Lamine Yamal',        team:'España',    flag:'🇪🇸', rareza:'epic', emoji:'✨', pos:'DEL', rating:90, goals:15, assists:10, apps:22, caps:22 },
  { id:'fig_e007', name:'Phil Foden',           sdbName:'Phil Foden',          team:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rareza:'epic', emoji:'🌀', pos:'MED', rating:87, goals:10, assists:12, apps:25, caps:38 },
  { id:'fig_e008', name:'Gavi',                 sdbName:'Gavi',                team:'España',    flag:'🇪🇸', rareza:'epic', emoji:'⚙️', pos:'MED', rating:86, goals:5,  assists:9,  apps:20, caps:41 },
  { id:'fig_e009', name:'Bukayo Saka',          sdbName:'Bukayo Saka',         team:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rareza:'epic', emoji:'⚡', pos:'DEL', rating:87, goals:11, assists:13, apps:30, caps:44 },
  { id:'fig_e010', name:'Federico Valverde',    sdbName:'Federico Valverde',   team:'Uruguay',   flag:'🇺🇾', rareza:'epic', emoji:'🎭', pos:'MED', rating:86, goals:9,  assists:7,  apps:27, caps:55 },
  { id:'fig_e011', name:'Bruno Fernandes',      sdbName:'Bruno Fernandes',     team:'Portugal',  flag:'🇵🇹', rareza:'epic', emoji:'🎩', pos:'MED', rating:87, goals:11, assists:13, apps:30, caps:72 },
  { id:'fig_e012', name:'Rúben Neves',          sdbName:'Ruben Neves',         team:'Portugal',  flag:'🇵🇹', rareza:'epic', emoji:'🔷', pos:'MED', rating:85, goals:6,  assists:7,  apps:26, caps:58 },
  { id:'fig_e013', name:'Khvicha Kvaratskhelia',sdbName:'Khvicha Kvaratskhelia',team:'Georgia', flag:'🇬🇪', rareza:'epic', emoji:'🌟', pos:'DEL', rating:86, goals:13, assists:9,  apps:24, caps:38 },
  { id:'fig_e014', name:'Dušan Vlahović',       sdbName:'Dusan Vlahovic',      team:'Serbia',    flag:'🇷🇸', rareza:'epic', emoji:'🦁', pos:'DEL', rating:85, goals:18, assists:4,  apps:28, caps:43 },

  /* ── RARAS ── */
  { id:'fig_r001', name:'Marquinhos',           sdbName:'Marquinhos',          team:'Brasil',    flag:'🇧🇷', rareza:'rare', emoji:'🛡️', pos:'DEF', rating:84, goals:2,  assists:1, apps:24 },
  { id:'fig_r002', name:'Rúben Dias',           sdbName:'Ruben Dias',          team:'Portugal',  flag:'🇵🇹', rareza:'rare', emoji:'🏰', pos:'DEF', rating:85, goals:3,  assists:1, apps:28 },
  { id:'fig_r003', name:'Virgil van Dijk',      sdbName:'Virgil van Dijk',     team:'Holanda',   flag:'🇳🇱', rareza:'rare', emoji:'🗿', pos:'DEF', rating:85, goals:2,  assists:0, apps:26 },
  { id:'fig_r004', name:'Alisson Becker',       sdbName:'Alisson Becker',      team:'Brasil',    flag:'🇧🇷', rareza:'rare', emoji:'🧤', pos:'POR', rating:88, goals:0,  assists:0, apps:30, saves:78 },
  { id:'fig_r005', name:'Thibaut Courtois',     sdbName:'Thibaut Courtois',    team:'Bélgica',   flag:'🇧🇪', rareza:'rare', emoji:'🦁', pos:'POR', rating:89, goals:0,  assists:0, apps:27, saves:82 },
  { id:'fig_r006', name:'Antoine Griezmann',    sdbName:'Antoine Griezmann',   team:'Francia',   flag:'🇫🇷', rareza:'rare', emoji:'🦊', pos:'DEL', rating:83, goals:9,  assists:11,apps:29 },
  { id:'fig_r007', name:'Cody Gakpo',           sdbName:'Cody Gakpo',          team:'Holanda',   flag:'🇳🇱', rareza:'rare', emoji:'🌷', pos:'DEL', rating:82, goals:10, assists:5, apps:26 },
  { id:'fig_r008', name:'Hirving Lozano',       sdbName:'Hirving Lozano',      team:'México',    flag:'🇲🇽', rareza:'rare', emoji:'🌶️', pos:'DEL', rating:80, goals:8,  assists:6, apps:23 },
  { id:'fig_r009', name:'Goncalo Ramos',        sdbName:'Goncalo Ramos',       team:'Portugal',  flag:'🇵🇹', rareza:'rare', emoji:'🎯', pos:'DEL', rating:81, goals:11, assists:4, apps:22 },
  { id:'fig_r010', name:'Joao Félix',           sdbName:'Joao Felix',          team:'Portugal',  flag:'🇵🇹', rareza:'rare', emoji:'🎪', pos:'DEL', rating:80, goals:7,  assists:8, apps:20 },
  { id:'fig_r011', name:'Takefusa Kubo',        sdbName:'Takefusa Kubo',       team:'Japón',     flag:'🇯🇵', rareza:'rare', emoji:'🗾', pos:'MED', rating:79, goals:6,  assists:7, apps:24 },
  { id:'fig_r012', name:'Hakim Ziyech',         sdbName:'Hakim Ziyech',        team:'Marruecos', flag:'🇲🇦', rareza:'rare', emoji:'🌙', pos:'MED', rating:79, goals:5,  assists:9, apps:22 },
  { id:'fig_r013', name:'Jan Oblak',            sdbName:'Jan Oblak',           team:'Eslovenia', flag:'🇸🇮', rareza:'rare', emoji:'🧤', pos:'POR', rating:87, goals:0,  assists:0, apps:22, saves:85 },
  { id:'fig_r014', name:'Achraf Hakimi',        sdbName:'Achraf Hakimi',       team:'Marruecos', flag:'🇲🇦', rareza:'rare', emoji:'⚡', pos:'DEF', rating:84, goals:4,  assists:8, apps:27 },
  { id:'fig_r015', name:'Aurélien Tchouaméni', sdbName:'Aurelien Tchouameni', team:'Francia',   flag:'🇫🇷', rareza:'rare', emoji:'💪', pos:'MED', rating:83, goals:3,  assists:4, apps:25 },
  { id:'fig_r016', name:'Lautaro Martínez',     sdbName:'Lautaro Martinez',    team:'Argentina', flag:'🇦🇷', rareza:'rare', emoji:'🔵', pos:'DEL', rating:84, goals:16, assists:5, apps:28 },
  { id:'fig_r017', name:'Darwin Núñez',         sdbName:'Darwin Nunez',        team:'Uruguay',   flag:'🇺🇾', rareza:'rare', emoji:'🦁', pos:'DEL', rating:82, goals:12, assists:4, apps:24 },
  { id:'fig_r018', name:'Mike Maignan',         sdbName:'Mike Maignan',        team:'Francia',   flag:'🇫🇷', rareza:'rare', emoji:'🧲', pos:'POR', rating:85, goals:0,  assists:0, apps:25, saves:73 },

  /* ── COMUNES ── */
  { id:'fig_c001', name:'Weston McKennie',      sdbName:'Weston McKennie',     team:'EEUU',      flag:'🇺🇸', rareza:'common', emoji:'⭐', pos:'MED', rating:74, goals:4, assists:5, apps:20 },
  { id:'fig_c002', name:'Richarlison',          sdbName:'Richarlison',         team:'Brasil',    flag:'🇧🇷', rareza:'common', emoji:'🐦', pos:'DEL', rating:76, goals:8, assists:4, apps:22 },
  { id:'fig_c003', name:'Jonathan David',       sdbName:'Jonathan David',      team:'Canadá',    flag:'🇨🇦', rareza:'common', emoji:'🍁', pos:'DEL', rating:75, goals:13,assists:3, apps:24 },
  { id:'fig_c004', name:'Evan Ferguson',        sdbName:'Evan Ferguson',       team:'Irlanda',   flag:'🇮🇪', rareza:'common', emoji:'☘️', pos:'DEL', rating:72, goals:9, assists:2, apps:18 },
  { id:'fig_c005', name:'Piero Hincapié',       sdbName:'Piero Hincapie',      team:'Ecuador',   flag:'🇪🇨', rareza:'common', emoji:'🦅', pos:'DEF', rating:73, goals:1, assists:2, apps:25 },
  { id:'fig_c006', name:'Sofiane Boufal',       sdbName:'Sofiane Boufal',      team:'Marruecos', flag:'🇲🇦', rareza:'common', emoji:'⚡', pos:'MED', rating:74, goals:5, assists:7, apps:21 },
  { id:'fig_c007', name:'Pervis Estupiñán',     sdbName:'Pervis Estupinan',    team:'Ecuador',   flag:'🇪🇨', rareza:'common', emoji:'🎽', pos:'DEF', rating:74, goals:2, assists:3, apps:23 },
  { id:'fig_c008', name:'Mats Hummels',         sdbName:'Mats Hummels',        team:'Alemania',  flag:'🇩🇪', rareza:'common', emoji:'🏆', pos:'DEF', rating:76, goals:2, assists:1, apps:22 },
  { id:'fig_c009', name:'Kepa Arrizabalaga',    sdbName:'Kepa Arrizabalaga',   team:'España',    flag:'🇪🇸', rareza:'common', emoji:'🧤', pos:'POR', rating:73, goals:0, assists:0, apps:19, saves:54 },
  { id:'fig_c010', name:'Marcus Rashford',      sdbName:'Marcus Rashford',     team:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rareza:'common', emoji:'🏃', pos:'DEL', rating:77, goals:7, assists:5, apps:24 },
  { id:'fig_c011', name:'Giovanni Reyna',       sdbName:'Giovanni Reyna',      team:'EEUU',      flag:'🇺🇸', rareza:'common', emoji:'🗽', pos:'MED', rating:73, goals:3, assists:6, apps:19 },
  { id:'fig_c012', name:'Victor Osimhen',       sdbName:'Victor Osimhen',      team:'Nigeria',   flag:'🇳🇬', rareza:'common', emoji:'🦁', pos:'DEL', rating:78, goals:14,assists:2, apps:21 },
  { id:'fig_c013', name:'Romelu Lukaku',        sdbName:'Romelu Lukaku',       team:'Bélgica',   flag:'🇧🇪', rareza:'common', emoji:'💪', pos:'DEL', rating:77, goals:9, assists:3, apps:24 },
  { id:'fig_c014', name:'Ola Solbakken',        sdbName:'Ola Solbakken',       team:'Noruega',   flag:'🇳🇴', rareza:'common', emoji:'🌊', pos:'MED', rating:71, goals:3, assists:4, apps:20 },
  { id:'fig_c015', name:'Yunus Musah',          sdbName:'Yunus Musah',         team:'EEUU',      flag:'🇺🇸', rareza:'common', emoji:'🦅', pos:'MED', rating:73, goals:2, assists:3, apps:22 },
  { id:'fig_c016', name:'Kaoru Mitoma',         sdbName:'Kaoru Mitoma',        team:'Japón',     flag:'🇯🇵', rareza:'common', emoji:'🌸', pos:'DEL', rating:76, goals:8, assists:7, apps:24 },
  { id:'fig_c017', name:'Leroy Sané',           sdbName:'Leroy Sane',          team:'Alemania',  flag:'🇩🇪', rareza:'common', emoji:'💨', pos:'DEL', rating:77, goals:9, assists:8, apps:23 },
  { id:'fig_c018', name:'Joshua Kimmich',       sdbName:'Joshua Kimmich',      team:'Alemania',  flag:'🇩🇪', rareza:'common', emoji:'🔑', pos:'MED', rating:78, goals:5, assists:8, apps:26 },
  { id:'fig_c019', name:'Nicolo Barella',       sdbName:'Nicolo Barella',      team:'Italia',    flag:'🇮🇹', rareza:'common', emoji:'🍕', pos:'MED', rating:76, goals:4, assists:9, apps:25 },
  { id:'fig_c020', name:'Rasmus Højlund',       sdbName:'Rasmus Hojlund',      team:'Dinamarca', flag:'🇩🇰', rareza:'common', emoji:'🏹', pos:'DEL', rating:75, goals:11,assists:3, apps:22 },
  { id:'fig_c021', name:'Florian Wirtz',        sdbName:'Florian Wirtz',       team:'Alemania',  flag:'🇩🇪', rareza:'common', emoji:'⚡', pos:'MED', rating:77, goals:9, assists:10,apps:23 },
  { id:'fig_c022', name:'Christopher Nkunku',   sdbName:'Christopher Nkunku',  team:'Francia',   flag:'🇫🇷', rareza:'common', emoji:'🎭', pos:'MED', rating:76, goals:8, assists:7, apps:21 },
  { id:'fig_c023', name:'Gonçalo Inácio',       sdbName:'Goncalo Inacio',      team:'Portugal',  flag:'🇵🇹', rareza:'common', emoji:'🏯', pos:'DEF', rating:74, goals:2, assists:2, apps:22 },
  { id:'fig_c024', name:'Fermin Lopez',         sdbName:'Fermin Lopez',        team:'España',    flag:'🇪🇸', rareza:'common', emoji:'🌺', pos:'MED', rating:74, goals:5, assists:4, apps:20 },
];

const TOTAL_FIGURITAS = FIGURITAS_POOL.length;

const RARITY_PROBS = [
  { rareza:'goat',      min:99.7, max:100   },
  { rareza:'legendary', min:99,   max:99.69 },
  { rareza:'epic',      min:90,   max:98.99 },
  { rareza:'rare',      min:70,   max:89.99 },
  { rareza:'common',    min:0,    max:69.99 }
];

const RARITY_LABELS   = { common:'Común', rare:'Rara', epic:'Épica', legendary:'Legendaria', goat:'🐐 GOAT' };
const RARITY_COIN_VALUE = { common:1, rare:3, epic:10, legendary:50, goat:200 };
const PITY_THRESHOLD  = 50;

/* Fotos: gestionadas por API.getPhotoById() en localStorage */

const Gacha = {

  _rollRarity(since = 0) {
    if (since >= PITY_THRESHOLD) return 'legendary';
    const r = Math.random() * 100;
    for (const p of RARITY_PROBS) if (r >= p.min && r <= p.max) return p.rareza;
    return 'common';
  },

  _pickFromPool(rareza) {
    const pool = FIGURITAS_POOL.filter(f => f.rareza === rareza);
    if (!pool.length) return FIGURITAS_POOL[0];
    return pool[Math.floor(Math.random() * pool.length)];
  },

  /* ── Foto dinámica: usa caché único en localStorage ── */
  async getPlayerPhoto(fig) {
    return await API.getPhotoById(fig.id, fig.sdbName || fig.name);
  },

  /* ── Pull principal ── */
  async pull(n = 1) {
    const user = await Auth.currentUser();
    if (!user) return { error: 'No hay sesión activa' };
    if (user.tiradas < n) return { error: `No tienes suficientes tiradas. Tienes ${user.tiradas}.` };

    const results  = [];
    const userFigs = user.figuritas || [];
    let pityCount  = user.pityCount || 0;

    for (let i = 0; i < n; i++) {
      const rareza   = this._rollRarity(pityCount);
      const figurita = { ...this._pickFromPool(rareza) };
      pityCount = rareza === 'legendary' ? 0 : pityCount + 1;

      const existing = userFigs.find(f => f.id === figurita.id);
      if (existing) {
        existing.duplicados    = (existing.duplicados || 0) + 1;
        figurita.isDuplicate   = true;
        figurita.duplicados    = existing.duplicados;
      } else {
        userFigs.push({ ...figurita, duplicados:0, obtenida: new Date().toISOString() });
        figurita.isDuplicate = false;
      }
      results.push(figurita);
    }

    user.figuritas  = userFigs;
    user.tiradas   -= n;
    user.pityCount  = pityCount;
    await Auth.updateUser(user);
    if (typeof DB !== 'undefined' && DB.logActivity)
      await DB.logActivity(user.email, 'gacha_pull', `x${n}`);

    return { results, user };
  },

  async claimDaily() {
    const user = await Auth.currentUser();
    if (!user) return { error: 'No session' };
    const today = new Date().toDateString();
    if (user.lastDailyPull === today)
      return { ok:false, msg:'Ya reclamaste tu tirada diaria 🎴' };
    user.tiradas       += 1;
    user.lastDailyPull  = today;
    await Auth.updateUser(user);
    if (typeof DB !== 'undefined' && DB.logActivity)
      await DB.logActivity(user.email, 'daily_claim', '+1');
    return { ok:true, tiradas: user.tiradas };
  },

  async convertDuplicates() {
    const user = await Auth.currentUser();
    if (!user) return { coins:0, converted:0 };
    let coins = 0, converted = 0;
    for (const f of (user.figuritas || [])) {
      if (f.duplicados > 0) {
        coins     += f.duplicados * (RARITY_COIN_VALUE[f.rareza] || 1);
        converted += f.duplicados;
        f.duplicados = 0;
      }
    }
    user.monedas = (user.monedas || 0) + coins;
    await Auth.updateUser(user);
    return { coins, converted };
  },

  getRarityLabel(r) { return RARITY_LABELS[r] || r; },
  getPool()         { return FIGURITAS_POOL; },
  getTotalFiguritas(){ return TOTAL_FIGURITAS; }
};
