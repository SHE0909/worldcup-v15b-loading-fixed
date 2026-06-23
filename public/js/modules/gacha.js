const POZO_FIGURITAS = [
  
  { id:'fig_g001', name:'Cristiano Ronaldo',    sdbName:'Cristiano Ronaldo',      equipo:'Portugal',       flag:'🇵🇹', rareza:'figGoat',      emoji:["🇵🇹","🐐","⚽"], pos:'DEL', rating:100 },
  { id:'fig_g002', name:'Lionel Messi',          sdbName:'Lionel Messi',           equipo:'Argentina',      flag:'🇦🇷', rareza:'figGoat',      emoji:["🇦🇷","🐐","🏆"], pos:'DEL', rating:99  },
  { id:'fig_g003', name:'Neymar Jr.',            sdbName:'Neymar Jr',              equipo:'Brasil',         flag:'🇧🇷', rareza:'figGoat',      emoji:["🇧🇷","🎩","⚽"], pos:'DEL', rating:98  },

  
  { id:'fig_l001', name:'Kylian Mbappé',         sdbName:'Kylian Mbappe',          equipo:'Francia',        flag:'🇫🇷', rareza:'legendary', emoji:["🇫🇷","🚀","⚽"], pos:'DEL', rating:97  },
  { id:'fig_l002', name:'Vinicius Jr.',           sdbName:'Vinicius Junior',        equipo:'Brasil',         flag:'🇧🇷', rareza:'legendary', emoji:["🇧🇷","⚡","🤍"], pos:'DEL', rating:96  },
  { id:'fig_l003', name:'Jude Bellingham',        sdbName:'Jude Bellingham',        equipo:'Inglaterra',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rareza:'legendary', emoji:["🏴","⭐","🤍"], pos:'MED', rating:95  },
  { id:'fig_l004', name:'Harry Kane',             sdbName:'Harry Kane',             equipo:'Inglaterra',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rareza:'legendary', emoji:["🏴","🎯","⚽"], pos:'DEL', rating:94  },

  
  { id:'fig_e001', name:'Lamine Yamal',           sdbName:'Lamine Yamal',           equipo:'España',         flag:'🇪🇸', rareza:'figEpica',      emoji:["🇪🇸","🌟","⚽"], pos:'DEL', rating:91  },
  { id:'fig_e002', name:'Michael Olise',          sdbName:'Michael Olise',          equipo:'Francia',        flag:'🇫🇷', rareza:'figEpica',      emoji:["🇫🇷","⚡","🎩"], pos:'DEL', rating:91  },
  { id:'fig_e003', name:'Pedri',                  sdbName:'Pedri Gonzalez',         equipo:'España',         flag:'🇪🇸', rareza:'figEpica',      emoji:["🇪🇸","🧠","⚽"], pos:'MED', rating:89  },
  { id:'fig_e004', name:'Phil Foden',             sdbName:'Phil Foden',             equipo:'Inglaterra',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rareza:'figEpica',      emoji:["🏴","🎯","⚽"], pos:'MED', rating:89  },
  { id:'fig_e005', name:'Federico Valverde',      sdbName:'Federico Valverde',      equipo:'Uruguay',        flag:'🇺🇾', rareza:'figEpica',      emoji:["🇺🇾","🚂","🤍"], pos:'MED', rating:88  },
  { id:'fig_e006', name:'Bukayo Saka',            sdbName:'Bukayo Saka',            equipo:'Inglaterra',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rareza:'figEpica',      emoji:["🏴","⚡","⚽"], pos:'DEL', rating:88  },
  { id:'fig_e007', name:'Erling Haaland',         sdbName:'Erling Haaland',         equipo:'Noruega',        flag:'🇳🇴', rareza:'figEpica',      emoji:["🇳🇴","🤖","⚽"], pos:'DEL', rating:88  },
  { id:'fig_e008', name:'Jamal Musiala',          sdbName:'Jamal Musiala',          equipo:'Alemania',       flag:'🇩🇪', rareza:'figEpica',      emoji:["🇩🇪","🎩","⚽"], pos:'MED', rating:88  },
  { id:'fig_e009', name:'Bernardo Silva',         sdbName:'Bernardo Silva',         equipo:'Portugal',       flag:'🇵🇹', rareza:'figEpica',      emoji:["🇵🇹","🧠","⚽"], pos:'MED', rating:88  },
  { id:'fig_e010', name:'Raphinha',               sdbName:'Raphinha',               equipo:'Brasil',         flag:'🇧🇷', rareza:'figEpica',      emoji:["🇧🇷","⚡","⚽"], pos:'DEL', rating:87  },
  { id:'fig_e011', name:'Rodri',                  sdbName:'Rodri',                  equipo:'España',         flag:'🇪🇸', rareza:'figEpica',      emoji:["🇪🇸","🛡️","⚽"], pos:'MED', rating:87  },
  { id:'fig_e012', name:'Cole Palmer',            sdbName:'Cole Palmer',            equipo:'Inglaterra',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rareza:'figEpica',      emoji:["🏴","🥶","⚽"], pos:'MED', rating:87  },
  { id:'fig_e013', name:'Ousmane Dembélé',        sdbName:'Ousmane Dembele',        equipo:'Francia',        flag:'🇫🇷', rareza:'figEpica',      emoji:["🇫🇷","⚡","🎩"], pos:'DEL', rating:87  },
  { id:'fig_e014', name:'Bruno Fernandes',        sdbName:'Bruno Fernandes',        equipo:'Portugal',       flag:'🇵🇹', rareza:'figEpica',      emoji:["🇵🇹","🎯","⚽"], pos:'MED', rating:87  },

  
  { id:'fig_r001', name:'Thibaut Courtois',      sdbName:'Thibaut Courtois',       equipo:'Bélgica',        flag:'🇧🇪', rareza:'rare',      emoji:["🇧🇪","🧤","🧱"], pos:'POR', rating:86  },
  { id:'fig_r002', name:'Ferran Torres',          sdbName:'Ferran Torres',          equipo:'España',         flag:'🇪🇸', rareza:'rare',      emoji:["🇪🇸","⚡","⚽"], pos:'DEL', rating:86  },
  { id:'fig_r003', name:'William Saliba',         sdbName:'William Saliba',         equipo:'Francia',        flag:'🇫🇷', rareza:'rare',      emoji:["🇫🇷","🛡️","⚽"], pos:'DEF', rating:86  },
  { id:'fig_r004', name:'Alisson Becker',         sdbName:'Alisson Becker',         equipo:'Brasil',         flag:'🇧🇷', rareza:'rare',      emoji:["🇧🇷","🧤","🧱"], pos:'POR', rating:88  },
  { id:'fig_r005', name:'Emiliano Martínez',      sdbName:'Emiliano Martinez',      equipo:'Argentina',      flag:'🇦🇷', rareza:'rare',      emoji:["🇦🇷","🧤","🏆"], pos:'POR', rating:87  },
  { id:'fig_r006', name:'Lautaro Martínez',       sdbName:'Lautaro Martinez',       equipo:'Argentina',      flag:'🇦🇷', rareza:'rare',      emoji:["🇦🇷","⚽","🔥"], pos:'DEL', rating:86  },
  { id:'fig_r007', name:'Rafael Leão',            sdbName:'Rafael Leao',            equipo:'Portugal',       flag:'🇵🇹', rareza:'rare',      emoji:["🇵🇹","⚡","🔥"], pos:'DEL', rating:85  },
  { id:'fig_r008', name:'Achraf Hakimi',          sdbName:'Achraf Hakimi',          equipo:'Marruecos',      flag:'🇲🇦', rareza:'rare',      emoji:["🇲🇦","⚡","🛡️"], pos:'DEF', rating:85  },
  { id:'fig_r009', name:'Tim Payne',              sdbName:'Tim Payne',              equipo:'Nueva Zelanda',  flag:'🇳🇿', rareza:'rare',      emoji:["🇳🇿","⚽","⭐"], pos:'DEF', rating:84  },
  { id:'fig_r010', name:'Nuno Mendes',            sdbName:'Nuno Mendes',            equipo:'Portugal',       flag:'🇵🇹', rareza:'rare',      emoji:["🇵🇹","⚡","🛡️"], pos:'DEF', rating:84  },
  { id:'fig_r011', name:'Nico Williams',          sdbName:'Nico Williams',          equipo:'España',         flag:'🇪🇸', rareza:'rare',      emoji:["🇪🇸","⚡","⭐"], pos:'DEL', rating:84  },
  { id:'fig_r012', name:'Alphonso Davies',        sdbName:'Alphonso Davies',        equipo:'Canadá',         flag:'🇨🇦', rareza:'rare',      emoji:["🇨🇦","⚡","🚀"], pos:'DEF', rating:84  },
  { id:'fig_r013', name:'Jeremie Frimpong',       sdbName:'Jeremie Frimpong',       equipo:'Holanda',        flag:'🇳🇱', rareza:'rare',      emoji:["🇳🇱","⚡","🚀"], pos:'DEF', rating:84  },
  { id:'fig_r014', name:'Kevin De Bruyne',        sdbName:'Kevin De Bruyne',        equipo:'Bélgica',        flag:'🇧🇪', rareza:'rare',      emoji:["🇧🇪","🎯","🧠"], pos:'MED', rating:84  },
  { id:'fig_r015', name:'Unai Simón',             sdbName:'Unai Simon',             equipo:'España',         flag:'🇪🇸', rareza:'rare',      emoji:["🇪🇸","🧤","🛡️"], pos:'POR', rating:84  },
  { id:'fig_r016', name:'Désire Doué',            sdbName:'Desire Doue',            equipo:'Francia',        flag:'🇫🇷', rareza:'rare',      emoji:["🇫🇷","🌟","⚽"], pos:'DEL', rating:83  },
  { id:'fig_r017', name:'Declan Rice',            sdbName:'Declan Rice',            equipo:'Inglaterra',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rareza:'rare',      emoji:["🏴","🛡️","⚽"], pos:'MED', rating:83  },
  { id:'fig_r018', name:'Vitinha',                sdbName:'Vitinha',                equipo:'Portugal',       flag:'🇵🇹', rareza:'rare',      emoji:["🇵🇹","🧠","⚽"], pos:'MED', rating:85  },

  
  { id:'fig_c001', name:'Luis Díaz',              sdbName:'Luis Diaz',              equipo:'Colombia',       flag:'🇨🇴', rareza:'common',    emoji:["🇨🇴","⚡","⚽"], pos:'DEL', rating:83  },
  { id:'fig_c002', name:'Julián Álvarez',         sdbName:'Julian Alvarez',         equipo:'Argentina',      flag:'🇦🇷', rareza:'common',    emoji:["🇦🇷","⚽","🔥"], pos:'DEL', rating:83  },
  { id:'fig_c003', name:'Moisés Caicedo',         sdbName:'Moises Caicedo',         equipo:'Ecuador',        flag:'🇪🇨', rareza:'common',    emoji:["🇪🇨","🛡️","⚽"], pos:'MED', rating:81  },
  { id:'fig_c004', name:'Jérémy Doku',            sdbName:'Jeremy Doku',            equipo:'Bélgica',        flag:'🇧🇪', rareza:'common',    emoji:["🇧🇪","⚡","⚽"], pos:'DEL', rating:81  },
  { id:'fig_c005', name:'Antonio Rudiger',        sdbName:'Antonio Rudiger',        equipo:'Alemania',       flag:'🇩🇪', rareza:'common',    emoji:["🇩🇪","🧱","⚽"], pos:'DEF', rating:80  },
  { id:'fig_c006', name:'Bradley Barcola',        sdbName:'Bradley Barcola',        equipo:'Francia',        flag:'🇫🇷', rareza:'common',    emoji:["🇫🇷","⚡","⭐"], pos:'DEL', rating:80  },
  { id:'fig_c007', name:'Enzo Fernández',         sdbName:'Enzo Fernandez',         equipo:'Argentina',      flag:'🇦🇷', rareza:'common',    emoji:["🇦🇷","🎯","⚽"], pos:'MED', rating:80  },
  { id:'fig_c008', name:'Virgil Van Dijk',        sdbName:'Virgil Van Dijk',        equipo:'Holanda',        flag:'🇳🇱', rareza:'common',    emoji:["🇳🇱","🧱","🛡️"], pos:'DEF', rating:79  },
  { id:'fig_c009', name:'Luka Modrić',            sdbName:'Luka Modric',            equipo:'Croacia',        flag:'🇭🇷', rareza:'common',    emoji:["🇭🇷","🎩","🤍"], pos:'MED', rating:79  },
  { id:'fig_c010', name:'James Rodríguez',        sdbName:'James Rodriguez',        equipo:'Colombia',       flag:'🇨🇴', rareza:'common',    emoji:["🇨🇴","🎯","⚽"], pos:'MED', rating:79  },
  { id:'fig_c011', name:'Savinho',                sdbName:'Savinho',                equipo:'Brasil',         flag:'🇧🇷', rareza:'common',    emoji:["🇧🇷","⚡","🌟"], pos:'DEL', rating:79  },
  { id:'fig_c012', name:'Giuliano Simeone',       sdbName:'Giuliano Simeone',       equipo:'Argentina',      flag:'🇦🇷', rareza:'common',    emoji:["🇦🇷","⚽","⭐"], pos:'DEL', rating:79  },
  { id:'fig_c013', name:'João Neves',             sdbName:'Joao Neves',             equipo:'Portugal',       flag:'🇵🇹', rareza:'common',    emoji:["🇵🇹","🧠","⭐"], pos:'MED', rating:79  },
  { id:'fig_c014', name:'Alejandro Balde',        sdbName:'Alejandro Balde',        equipo:'España',         flag:'🇪🇸', rareza:'common',    emoji:["🇪🇸","⚡","🛡️"], pos:'DEF', rating:79  },
  { id:'fig_c015', name:'Endrick',                sdbName:'Endrick',                equipo:'Brasil',         flag:'🇧🇷', rareza:'common',    emoji:["🇧🇷","🌟","⚽"], pos:'DEL', rating:78  },
  { id:'fig_c016', name:'Arda Güler',             sdbName:'Arda Guler',             equipo:'Turquía',        flag:'🇹🇷', rareza:'common',    emoji:["🇹🇷","🎩","⚽"], pos:'MED', rating:78  },
  { id:'fig_c017', name:'Dani Olmo',              sdbName:'Dani Olmo',              equipo:'España',         flag:'🇪🇸', rareza:'common',    emoji:["🇪🇸","🎯","⚽"], pos:'MED', rating:78  },
  { id:'fig_c018', name:'Piero Hincapié',         sdbName:'Piero Hincapie',         equipo:'Ecuador',        flag:'🇪🇨', rareza:'common',    emoji:["🇪🇨","🛡️","⚽"], pos:'DEF', rating:78  },
  { id:'fig_c019', name:'Gavi',                   sdbName:'Gavi',                   equipo:'España',         flag:'🇪🇸', rareza:'common',    emoji:["🇪🇸","⭐","⚽"], pos:'MED', rating:86  },
  { id:'fig_c020', name:'Aurélien Tchouaméni',   sdbName:'Aurelien Tchouameni',    equipo:'Francia',        flag:'🇫🇷', rareza:'common',    emoji:["🇫🇷","🛡️","⚽"], pos:'MED', rating:86  },
  { id:'fig_c021', name:'Diogo Costa',            sdbName:'Diogo Costa',            equipo:'Portugal',       flag:'🇵🇹', rareza:'common',    emoji:["🇵🇹","🧤","🧱"], pos:'POR', rating:77  },
  { id:'fig_c022', name:'Pau Cubarsí',            sdbName:'Pau Cubarsi',            equipo:'España',         flag:'🇪🇸', rareza:'common',    emoji:["🇪🇸","🧱","⭐"], pos:'DEF', rating:77  },
  { id:'fig_c023', name:'Marcus Rashford',        sdbName:'Marcus Rashford',        equipo:'Inglaterra',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', rareza:'common',    emoji:["🏴","⚡","⚽"], pos:'DEL', rating:80  },
  { id:'fig_c024', name:'Nathan Ordaz',           sdbName:'Nathan Ordaz',           equipo:'El Salvador',    flag:'🇸🇻', rareza:'common',    emoji:["🇸🇻","⚽","⭐"], pos:'DEL', rating:72  },
];

const TOTAL_FIGURITAS = POZO_FIGURITAS.length; 

const PROB_RAREZA = [
  { rareza:'figGoat',      min:99.7, max:100   },
  { rareza:'legendary', min:99,   max:99.69 },
  { rareza:'figEpica',      min:90,   max:98.99 },
  { rareza:'rare',      min:70,   max:89.99 },
  { rareza:'common',    min:0,    max:69.99 }
];

const ETIQUETAS_RAREZA    = { common:'Común', rare:'Rara', figEpica:'Épica', legendary:'Legendaria', figGoat:'🐐 GOAT' };
const VALOR_MONEDAS_RAREZA = { common:1, rare:3, figEpica:10, legendary:50, figGoat:200 };
const UMBRAL_PITY   = 50;

const Gacha = {

  _rollRarity(desdeUltima = 0) {
    if (desdeUltima >= UMBRAL_PITY) return 'legendary';
    const r = Math.random() * 100;
    for (const p of PROB_RAREZA) if (r >= p.min && r <= p.max) return p.rareza;
    return 'common';
  },

  _pickFromPool(rareza) {
    const pool = POZO_FIGURITAS.filter(f => f.rareza === rareza);
    if (!pool.length) return POZO_FIGURITAS[0];
    return pool[Math.floor(Math.random() * pool.length)];
  },

  
  async getPlayerPhoto(fig) {
    return await API.getPhotoById(fig.id);
  },

  
  async tirada(n = 1) {
    const usuario = await Auth.currentUser();
    if (!usuario) return { error: 'No hay sesión activa' };
    if (usuario.tiradas < n) return { error: `No tienes suficientes tiradas. Tienes ${usuario.tiradas}.` };

    const resultados  = [];
    const figuritasUsuario = usuario.figuritas || [];
    let contadorPity  = usuario.contadorPity || 0;

    for (let i = 0; i < n; i++) {
      const rareza   = this._rollRarity(contadorPity);
      const figurita = { ...this._pickFromPool(rareza) };
      contadorPity = rareza === 'legendary' ? 0 : contadorPity + 1;

      const existente = figuritasUsuario.find(f => f.id === figurita.id);
      if (existente) {
        existente.duplicados  = (existente.duplicados || 0) + 1;
        figurita.isDuplicate = true;
        figurita.duplicados  = existente.duplicados;
      } else {
        figuritasUsuario.push({ ...figurita, duplicados:0, obtenida: new Date().toISOString() });
        figurita.isDuplicate = false;
      }
      resultados.push(figurita);
    }

    usuario.figuritas  = figuritasUsuario;
    usuario.tiradas   -= n;
    usuario.contadorPity  = contadorPity;
    await Auth.updateUser(usuario);
    if (typeof DB !== 'undefined' && DB.logActivity)
      await DB.logActivity(usuario.email, 'gacha_pull', `x${n}`);

    return { resultados, usuario };
  },

  async claimDaily() {
    const usuario = await Auth.currentUser();
    if (!usuario) return { error: 'No session' };
    const today = new Date().toDateString();
    if (usuario.lastDailyPull === today)
      return { ok:false, msg:'Ya reclamaste tu tirada diaria 🎴' };
    usuario.tiradas       += 1;
    usuario.lastDailyPull  = today;
    await Auth.updateUser(usuario);
    if (typeof DB !== 'undefined' && DB.logActivity)
      await DB.logActivity(usuario.email, 'daily_claim', '+1');
    return { ok:true, tiradas: usuario.tiradas };
  },

  async convertDuplicates() {
    const usuario = await Auth.currentUser();
    if (!usuario) return { monedas:0, converted:0 };
    let monedas = 0, converted = 0;
    for (const f of (usuario.figuritas || [])) {
      if (f.duplicados > 0) {
        monedas     += f.duplicados * (VALOR_MONEDAS_RAREZA[f.rareza] || 1);
        converted += f.duplicados;
        f.duplicados = 0;
      }
    }
    usuario.monedas = (usuario.monedas || 0) + monedas;
    await Auth.updateUser(usuario);
    return { monedas, converted };
  },

  getRarityLabel(r)  { return ETIQUETAS_RAREZA[r] || r; },
  getPool()          { return POZO_FIGURITAS; },
  getTotalFiguritas(){ return TOTAL_FIGURITAS; }
};
