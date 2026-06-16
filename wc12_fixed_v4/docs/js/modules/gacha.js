/**
 * gacha.js — v7
 * Fotos vía CDN jsDelivr por ID de figurita (API.getPhotoById / API.getPhotoSync).
 * sdbName conservado en el pool por compatibilidad, pero ya no se usa para buscar fotos.
 * Pool actualizado al repositorio oficial WCC UES: 63 figuritas · 5 raridades.
 */

const FIGURITAS_POOL = [
  /* ── GOAT (3 jugadores) ── */
  { id:'fig_g001', name:'Cristiano Ronaldo',    sdbName:'Cristiano Ronaldo',      team:'Portugal',       flag:'🇵🇹', rareza:'goat',      emoji:["🇵🇹","🐐","⚽"], pos:'DEL', rating:100 },
  { id:'fig_g002', name:'Lionel Messi',          sdbName:'Lionel Messi',           team:'Argentina',      flag:'🇦🇷', rareza:'goat',      emoji:["🇦🇷","🐐","🏆"], pos:'DEL', rating:99  },
  { id:'fig_g003', name:'Neymar Jr.',            sdbName:'Neymar Jr',              team:'Brasil',         flag:'🇧🇷', rareza:'goat',      emoji:["🇧🇷","🎩","⚽"], pos:'DEL', rating:98  },

  /* ── LEGENDARIA (4 jugadores) ── */
  { id:'fig_l001', name:'Kylian Mbappé',         sdbName:'Kylian Mbappe',          team:'Francia',        flag:'🇫🇷', rareza:'legendary', emoji:["🇫🇷","🚀","⚽"], pos:'DEL', rating:97  },
  { id:'fig_l002', name:'Vinicius Jr.',           sdbName:'Vinicius Junior',        team:'Brasil',         flag:'🇧🇷', rareza:'legendary', emoji:["🇧🇷","⚡","🤍"], pos:'DEL', rating:96  },
  { id:'fig_l003', name:'Jude Bellingham',        sdbName:'Jude Bellingham',        team:'Inglaterra',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rareza:'legendary', emoji:["🏴","⭐","🤍"], pos:'MED', rating:95  },
  { id:'fig_l004', name:'Harry Kane',             sdbName:'Harry Kane',             team:'Inglaterra',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rareza:'legendary', emoji:["🏴","🎯","⚽"], pos:'DEL', rating:94  },

  /* ── ÉPICA (14 jugadores) ── */
  { id:'fig_e001', name:'Lamine Yamal',           sdbName:'Lamine Yamal',           team:'España',         flag:'🇪🇸', rareza:'epic',      emoji:["🇪🇸","🌟","⚽"], pos:'DEL', rating:91  },
  { id:'fig_e002', name:'Michael Olise',          sdbName:'Michael Olise',          team:'Francia',        flag:'🇫🇷', rareza:'epic',      emoji:["🇫🇷","⚡","🎩"], pos:'DEL', rating:91  },
  { id:'fig_e003', name:'Pedri',                  sdbName:'Pedri Gonzalez',         team:'España',         flag:'🇪🇸', rareza:'epic',      emoji:["🇪🇸","🧠","⚽"], pos:'MED', rating:89  },
  { id:'fig_e004', name:'Phil Foden',             sdbName:'Phil Foden',             team:'Inglaterra',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rareza:'epic',      emoji:["🏴","🎯","⚽"], pos:'MED', rating:89  },
  { id:'fig_e005', name:'Federico Valverde',      sdbName:'Federico Valverde',      team:'Uruguay',        flag:'🇺🇾', rareza:'epic',      emoji:["🇺🇾","🚂","🤍"], pos:'MED', rating:88  },
  { id:'fig_e006', name:'Bukayo Saka',            sdbName:'Bukayo Saka',            team:'Inglaterra',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rareza:'epic',      emoji:["🏴","⚡","⚽"], pos:'DEL', rating:88  },
  { id:'fig_e007', name:'Erling Haaland',         sdbName:'Erling Haaland',         team:'Noruega',        flag:'🇳🇴', rareza:'epic',      emoji:["🇳🇴","🤖","⚽"], pos:'DEL', rating:88  },
  { id:'fig_e008', name:'Jamal Musiala',          sdbName:'Jamal Musiala',          team:'Alemania',       flag:'🇩🇪', rareza:'epic',      emoji:["🇩🇪","🎩","⚽"], pos:'MED', rating:88  },
  { id:'fig_e009', name:'Bernardo Silva',         sdbName:'Bernardo Silva',         team:'Portugal',       flag:'🇵🇹', rareza:'epic',      emoji:["🇵🇹","🧠","⚽"], pos:'MED', rating:88  },
  { id:'fig_e010', name:'Raphinha',               sdbName:'Raphinha',               team:'Brasil',         flag:'🇧🇷', rareza:'epic',      emoji:["🇧🇷","⚡","⚽"], pos:'DEL', rating:87  },
  { id:'fig_e011', name:'Rodri',                  sdbName:'Rodri',                  team:'España',         flag:'🇪🇸', rareza:'epic',      emoji:["🇪🇸","🛡️","⚽"], pos:'MED', rating:87  },
  { id:'fig_e012', name:'Cole Palmer',            sdbName:'Cole Palmer',            team:'Inglaterra',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rareza:'epic',      emoji:["🏴","🥶","⚽"], pos:'MED', rating:87  },
  { id:'fig_e013', name:'Ousmane Dembélé',        sdbName:'Ousmane Dembele',        team:'Francia',        flag:'🇫🇷', rareza:'epic',      emoji:["🇫🇷","⚡","🎩"], pos:'DEL', rating:87  },
  { id:'fig_e014', name:'Bruno Fernandes',        sdbName:'Bruno Fernandes',        team:'Portugal',       flag:'🇵🇹', rareza:'epic',      emoji:["🇵🇹","🎯","⚽"], pos:'MED', rating:87  },

  /* ── RARA (18 jugadores) ── */
  { id:'fig_r001', name:'Thibaut Courtois',      sdbName:'Thibaut Courtois',       team:'Bélgica',        flag:'🇧🇪', rareza:'rare',      emoji:["🇧🇪","🧤","🧱"], pos:'POR', rating:86  },
  { id:'fig_r002', name:'Ferran Torres',          sdbName:'Ferran Torres',          team:'España',         flag:'🇪🇸', rareza:'rare',      emoji:["🇪🇸","⚡","⚽"], pos:'DEL', rating:86  },
  { id:'fig_r003', name:'William Saliba',         sdbName:'William Saliba',         team:'Francia',        flag:'🇫🇷', rareza:'rare',      emoji:["🇫🇷","🛡️","⚽"], pos:'DEF', rating:86  },
  { id:'fig_r004', name:'Alisson Becker',         sdbName:'Alisson Becker',         team:'Brasil',         flag:'🇧🇷', rareza:'rare',      emoji:["🇧🇷","🧤","🧱"], pos:'POR', rating:88  },
  { id:'fig_r005', name:'Emiliano Martínez',      sdbName:'Emiliano Martinez',      team:'Argentina',      flag:'🇦🇷', rareza:'rare',      emoji:["🇦🇷","🧤","🏆"], pos:'POR', rating:87  },
  { id:'fig_r006', name:'Lautaro Martínez',       sdbName:'Lautaro Martinez',       team:'Argentina',      flag:'🇦🇷', rareza:'rare',      emoji:["🇦🇷","⚽","🔥"], pos:'DEL', rating:86  },
  { id:'fig_r007', name:'Rafael Leão',            sdbName:'Rafael Leao',            team:'Portugal',       flag:'🇵🇹', rareza:'rare',      emoji:["🇵🇹","⚡","🔥"], pos:'DEL', rating:85  },
  { id:'fig_r008', name:'Achraf Hakimi',          sdbName:'Achraf Hakimi',          team:'Marruecos',      flag:'🇲🇦', rareza:'rare',      emoji:["🇲🇦","⚡","🛡️"], pos:'DEF', rating:85  },
  { id:'fig_r009', name:'Tim Payne',              sdbName:'Tim Payne',              team:'Nueva Zelanda',  flag:'🇳🇿', rareza:'rare',      emoji:["🇳🇿","⚽","⭐"], pos:'DEF', rating:84  },
  { id:'fig_r010', name:'Nuno Mendes',            sdbName:'Nuno Mendes',            team:'Portugal',       flag:'🇵🇹', rareza:'rare',      emoji:["🇵🇹","⚡","🛡️"], pos:'DEF', rating:84  },
  { id:'fig_r011', name:'Nico Williams',          sdbName:'Nico Williams',          team:'España',         flag:'🇪🇸', rareza:'rare',      emoji:["🇪🇸","⚡","⭐"], pos:'DEL', rating:84  },
  { id:'fig_r012', name:'Alphonso Davies',        sdbName:'Alphonso Davies',        team:'Canadá',         flag:'🇨🇦', rareza:'rare',      emoji:["🇨🇦","⚡","🚀"], pos:'DEF', rating:84  },
  { id:'fig_r013', name:'Jeremie Frimpong',       sdbName:'Jeremie Frimpong',       team:'Holanda',        flag:'🇳🇱', rareza:'rare',      emoji:["🇳🇱","⚡","🚀"], pos:'DEF', rating:84  },
  { id:'fig_r014', name:'Kevin De Bruyne',        sdbName:'Kevin De Bruyne',        team:'Bélgica',        flag:'🇧🇪', rareza:'rare',      emoji:["🇧🇪","🎯","🧠"], pos:'MED', rating:84  },
  { id:'fig_r015', name:'Unai Simón',             sdbName:'Unai Simon',             team:'España',         flag:'🇪🇸', rareza:'rare',      emoji:["🇪🇸","🧤","🛡️"], pos:'POR', rating:84  },
  { id:'fig_r016', name:'Désire Doué',            sdbName:'Desire Doue',            team:'Francia',        flag:'🇫🇷', rareza:'rare',      emoji:["🇫🇷","🌟","⚽"], pos:'DEL', rating:83  },
  { id:'fig_r017', name:'Declan Rice',            sdbName:'Declan Rice',            team:'Inglaterra',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rareza:'rare',      emoji:["🏴","🛡️","⚽"], pos:'MED', rating:83  },
  { id:'fig_r018', name:'Vitinha',                sdbName:'Vitinha',                team:'Portugal',       flag:'🇵🇹', rareza:'rare',      emoji:["🇵🇹","🧠","⚽"], pos:'MED', rating:85  },

  /* ── COMÚN (24 jugadores) ── */
  { id:'fig_c001', name:'Luis Díaz',              sdbName:'Luis Diaz',              team:'Colombia',       flag:'🇨🇴', rareza:'common',    emoji:["🇨🇴","⚡","⚽"], pos:'DEL', rating:83  },
  { id:'fig_c002', name:'Julián Álvarez',         sdbName:'Julian Alvarez',         team:'Argentina',      flag:'🇦🇷', rareza:'common',    emoji:["🇦🇷","⚽","🔥"], pos:'DEL', rating:83  },
  { id:'fig_c003', name:'Moisés Caicedo',         sdbName:'Moises Caicedo',         team:'Ecuador',        flag:'🇪🇨', rareza:'common',    emoji:["🇪🇨","🛡️","⚽"], pos:'MED', rating:81  },
  { id:'fig_c004', name:'Jérémy Doku',            sdbName:'Jeremy Doku',            team:'Bélgica',        flag:'🇧🇪', rareza:'common',    emoji:["🇧🇪","⚡","⚽"], pos:'DEL', rating:81  },
  { id:'fig_c005', name:'Antonio Rudiger',        sdbName:'Antonio Rudiger',        team:'Alemania',       flag:'🇩🇪', rareza:'common',    emoji:["🇩🇪","🧱","⚽"], pos:'DEF', rating:80  },
  { id:'fig_c006', name:'Bradley Barcola',        sdbName:'Bradley Barcola',        team:'Francia',        flag:'🇫🇷', rareza:'common',    emoji:["🇫🇷","⚡","⭐"], pos:'DEL', rating:80  },
  { id:'fig_c007', name:'Enzo Fernández',         sdbName:'Enzo Fernandez',         team:'Argentina',      flag:'🇦🇷', rareza:'common',    emoji:["🇦🇷","🎯","⚽"], pos:'MED', rating:80  },
  { id:'fig_c008', name:'Virgil Van Dijk',        sdbName:'Virgil Van Dijk',        team:'Holanda',        flag:'🇳🇱', rareza:'common',    emoji:["🇳🇱","🧱","🛡️"], pos:'DEF', rating:79  },
  { id:'fig_c009', name:'Luka Modrić',            sdbName:'Luka Modric',            team:'Croacia',        flag:'🇭🇷', rareza:'common',    emoji:["🇭🇷","🎩","🤍"], pos:'MED', rating:79  },
  { id:'fig_c010', name:'James Rodríguez',        sdbName:'James Rodriguez',        team:'Colombia',       flag:'🇨🇴', rareza:'common',    emoji:["🇨🇴","🎯","⚽"], pos:'MED', rating:79  },
  { id:'fig_c011', name:'Savinho',                sdbName:'Savinho',                team:'Brasil',         flag:'🇧🇷', rareza:'common',    emoji:["🇧🇷","⚡","🌟"], pos:'DEL', rating:79  },
  { id:'fig_c012', name:'Giuliano Simeone',       sdbName:'Giuliano Simeone',       team:'Argentina',      flag:'🇦🇷', rareza:'common',    emoji:["🇦🇷","⚽","⭐"], pos:'DEL', rating:79  },
  { id:'fig_c013', name:'João Neves',             sdbName:'Joao Neves',             team:'Portugal',       flag:'🇵🇹', rareza:'common',    emoji:["🇵🇹","🧠","⭐"], pos:'MED', rating:79  },
  { id:'fig_c014', name:'Alejandro Balde',        sdbName:'Alejandro Balde',        team:'España',         flag:'🇪🇸', rareza:'common',    emoji:["🇪🇸","⚡","🛡️"], pos:'DEF', rating:79  },
  { id:'fig_c015', name:'Endrick',                sdbName:'Endrick',                team:'Brasil',         flag:'🇧🇷', rareza:'common',    emoji:["🇧🇷","🌟","⚽"], pos:'DEL', rating:78  },
  { id:'fig_c016', name:'Arda Güler',             sdbName:'Arda Guler',             team:'Turquía',        flag:'🇹🇷', rareza:'common',    emoji:["🇹🇷","🎩","⚽"], pos:'MED', rating:78  },
  { id:'fig_c017', name:'Dani Olmo',              sdbName:'Dani Olmo',              team:'España',         flag:'🇪🇸', rareza:'common',    emoji:["🇪🇸","🎯","⚽"], pos:'MED', rating:78  },
  { id:'fig_c018', name:'Piero Hincapié',         sdbName:'Piero Hincapie',         team:'Ecuador',        flag:'🇪🇨', rareza:'common',    emoji:["🇪🇨","🛡️","⚽"], pos:'DEF', rating:78  },
  { id:'fig_c019', name:'Gavi',                   sdbName:'Gavi',                   team:'España',         flag:'🇪🇸', rareza:'common',    emoji:["🇪🇸","⭐","⚽"], pos:'MED', rating:86  },
  { id:'fig_c020', name:'Aurélien Tchouaméni',   sdbName:'Aurelien Tchouameni',    team:'Francia',        flag:'🇫🇷', rareza:'common',    emoji:["🇫🇷","🛡️","⚽"], pos:'MED', rating:86  },
  { id:'fig_c021', name:'Diogo Costa',            sdbName:'Diogo Costa',            team:'Portugal',       flag:'🇵🇹', rareza:'common',    emoji:["🇵🇹","🧤","🧱"], pos:'POR', rating:77  },
  { id:'fig_c022', name:'Pau Cubarsí',            sdbName:'Pau Cubarsi',            team:'España',         flag:'🇪🇸', rareza:'common',    emoji:["🇪🇸","🧱","⭐"], pos:'DEF', rating:77  },
  { id:'fig_c023', name:'Marcus Rashford',        sdbName:'Marcus Rashford',        team:'Inglaterra',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rareza:'common',    emoji:["🏴","⚡","⚽"], pos:'DEL', rating:80  },
  { id:'fig_c024', name:'Nathan Ordaz',           sdbName:'Nathan Ordaz',           team:'El Salvador',    flag:'🇸🇻', rareza:'common',    emoji:["🇸🇻","⚽","⭐"], pos:'DEL', rating:72  },
];

const TOTAL_FIGURITAS = FIGURITAS_POOL.length; // 63

const RARITY_PROBS = [
  { rareza:'goat',      min:99.7, max:100   },
  { rareza:'legendary', min:99,   max:99.69 },
  { rareza:'epic',      min:90,   max:98.99 },
  { rareza:'rare',      min:70,   max:89.99 },
  { rareza:'common',    min:0,    max:69.99 }
];

const RARITY_LABELS    = { common:'Común', rare:'Rara', epic:'Épica', legendary:'Legendaria', goat:'🐐 GOAT' };
const RARITY_COIN_VALUE = { common:1, rare:3, epic:10, legendary:50, goat:200 };
const PITY_THRESHOLD   = 50;

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

  /* Foto por CDN: construye la URL directamente desde el ID de la figurita */
  async getPlayerPhoto(fig) {
    return await API.getPhotoById(fig.id);
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
        existing.duplicados  = (existing.duplicados || 0) + 1;
        figurita.isDuplicate = true;
        figurita.duplicados  = existing.duplicados;
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

  getRarityLabel(r)  { return RARITY_LABELS[r] || r; },
  getPool()          { return FIGURITAS_POOL; },
  getTotalFiguritas(){ return TOTAL_FIGURITAS; }
};