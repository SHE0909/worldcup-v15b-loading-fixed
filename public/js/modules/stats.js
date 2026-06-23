const ALL_PLAYERS = [
  
  {id:'sp01', name:'Emiliano Martínez',  team:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'POR', caps:38,  rating:87},
  {id:'sp02', name:'Nahuel Molina',       team:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'DEF', caps:43,  rating:81},
  {id:'sp03', name:'Cristian Romero',     team:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'DEF', caps:34,  rating:85},
  {id:'sp04', name:'Lisandro Martínez',   team:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'DEF', caps:26,  rating:84},
  {id:'sp05', name:'Nicolás Tagliafico',  team:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'DEF', caps:66,  rating:81},
  {id:'sp06', name:'Rodrigo De Paul',     team:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'MED', caps:68,  rating:83},
  {id:'sp07', name:'Enzo Fernández',      team:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'MED', caps:35,  rating:82},
  {id:'sp08', name:'Alexis Mac Allister', team:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'MED', caps:28,  rating:83},
  {id:'sp09', name:'Lionel Messi',        team:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'DEL', caps:187, rating:93},
  {id:'sp10', name:'Julián Álvarez',      team:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'DEL', caps:38,  rating:85},
  {id:'sp11', name:'Lautaro Martínez',    team:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'DEL', caps:62,  rating:86},
  
  {id:'sp12', name:'Alisson Becker',      team:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'POR', caps:72,  rating:89},
  {id:'sp13', name:'Danilo',              team:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'DEF', caps:84,  rating:81},
  {id:'sp14', name:'Marquinhos',          team:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'DEF', caps:84,  rating:86},
  {id:'sp15', name:'Gabriel Magalhães',   team:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'DEF', caps:28,  rating:83},
  {id:'sp16', name:'Guilherme Arana',     team:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'DEF', caps:22,  rating:80},
  {id:'sp17', name:'Casemiro',            team:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'MED', caps:77,  rating:85},
  {id:'sp18', name:'Lucas Paquetá',       team:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'MED', caps:52,  rating:84},
  {id:'sp19', name:'Bruno Guimarães',     team:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'MED', caps:36,  rating:84},
  {id:'sp20', name:'Raphinha',            team:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'DEL', caps:52,  rating:86},
  {id:'sp21', name:'Vinicius Jr.',        team:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'DEL', caps:55,  rating:91},
  {id:'sp22', name:'Rodrygo',             team:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'DEL', caps:38,  rating:84},
  
  {id:'sp23', name:'Mike Maignan',        team:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'POR', caps:28,  rating:87},
  {id:'sp24', name:'Jules Koundé',        team:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'DEF', caps:40,  rating:84},
  {id:'sp25', name:'Dayot Upamecano',     team:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'DEF', caps:36,  rating:84},
  {id:'sp26', name:'William Saliba',      team:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'DEF', caps:18,  rating:85},
  {id:'sp27', name:'Theo Hernández',      team:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'DEF', caps:38,  rating:84},
  {id:'sp28', name:'Aurélien Tchouaméni',team:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'MED', caps:35,  rating:83},
  {id:'sp29', name:'NGolo Kanté',         team:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'MED', caps:56,  rating:85},
  {id:'sp30', name:'Antoine Griezmann',   team:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'MED', caps:137, rating:85},
  {id:'sp31', name:'Ousmane Dembélé',     team:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'DEL', caps:57,  rating:84},
  {id:'sp32', name:'Kylian Mbappé',       team:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'DEL', caps:82,  rating:92},
  {id:'sp33', name:'Marcus Thuram',       team:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'DEL', caps:30,  rating:83},
  
  {id:'sp34', name:'Unai Simón',          team:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'POR', caps:28,  rating:84},
  {id:'sp35', name:'Dani Carvajal',       team:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'DEF', caps:77,  rating:84},
  {id:'sp36', name:'Aymeric Laporte',     team:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'DEF', caps:20,  rating:83},
  {id:'sp37', name:'Pau Cubarsí',         team:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'DEF', caps:10,  rating:83},
  {id:'sp38', name:'Marc Cucurella',      team:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'DEF', caps:28,  rating:82},
  {id:'sp39', name:'Rodri',              team:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'MED', caps:61,  rating:91},
  {id:'sp40', name:'Pedri',              team:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'MED', caps:48,  rating:87},
  {id:'sp41', name:'Fabian Ruiz',         team:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'MED', caps:32,  rating:83},
  {id:'sp42', name:'Lamine Yamal',        team:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'DEL', caps:20,  rating:88},
  {id:'sp43', name:'Álvaro Morata',       team:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'DEL', caps:72,  rating:82},
  {id:'sp44', name:'Nico Williams',       team:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'DEL', caps:18,  rating:85},
  
  {id:'sp45', name:'Diogo Costa',         team:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'POR', caps:22,  rating:84},
  {id:'sp46', name:'João Cancelo',        team:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'DEF', caps:56,  rating:85},
  {id:'sp47', name:'Rúben Dias',          team:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'DEF', caps:74,  rating:88},
  {id:'sp48', name:'Pepe',               team:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'DEF', caps:144, rating:80},
  {id:'sp49', name:'Nuno Mendes',         team:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'DEF', caps:26,  rating:84},
  {id:'sp50', name:'João Palhinha',       team:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'MED', caps:38,  rating:83},
  {id:'sp51', name:'Bruno Fernandes',     team:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'MED', caps:75,  rating:87},
  {id:'sp52', name:'Bernardo Silva',      team:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'MED', caps:89,  rating:87},
  {id:'sp53', name:'Cristiano Ronaldo',   team:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'DEL', caps:215, rating:88},
  {id:'sp54', name:'Diogo Jota',          team:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'DEL', caps:49,  rating:84},
  {id:'sp55', name:'Rafael Leão',         team:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'DEL', caps:32,  rating:85},
  
  {id:'sp56', name:'Manuel Neuer',        team:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'POR', caps:124, rating:86},
  {id:'sp57', name:'Joshua Kimmich',      team:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'DEF', caps:94,  rating:87},
  {id:'sp58', name:'Antonio Rüdiger',     team:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'DEF', caps:71,  rating:86},
  {id:'sp59', name:'Jonathan Tah',        team:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'DEF', caps:28,  rating:83},
  {id:'sp60', name:'David Raum',          team:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'DEF', caps:25,  rating:81},
  {id:'sp61', name:'Toni Kroos',          team:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'MED', caps:108, rating:88},
  {id:'sp62', name:'Robert Andrich',      team:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'MED', caps:22,  rating:81},
  {id:'sp63', name:'Jamal Musiala',       team:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'MED', caps:42,  rating:87},
  {id:'sp64', name:'Florian Wirtz',       team:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'MED', caps:30,  rating:87},
  {id:'sp65', name:'Thomas Müller',       team:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'DEL', caps:131, rating:83},
  {id:'sp66', name:'Kai Havertz',         team:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'DEL', caps:60,  rating:84},
  
  {id:'sp67', name:'Jordan Pickford',     team:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0,assists:0, pos:'POR', caps:60,  rating:85},
  {id:'sp68', name:'Trent Alexander-Arnold',team:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',goals:0,assists:0,pos:'DEF',caps:52, rating:86},
  {id:'sp69', name:'John Stones',         team:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0,assists:0, pos:'DEF', caps:73,  rating:85},
  {id:'sp70', name:'Marc Guehi',          team:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0,assists:0, pos:'DEF', caps:20,  rating:82},
  {id:'sp71', name:'Luke Shaw',           team:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0,assists:0, pos:'DEF', caps:36,  rating:82},
  {id:'sp72', name:'Declan Rice',         team:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0,assists:0, pos:'MED', caps:52,  rating:86},
  {id:'sp73', name:'Jude Bellingham',     team:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0,assists:0, pos:'MED', caps:40,  rating:88},
  {id:'sp74', name:'Kobbie Mainoo',       team:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0,assists:0, pos:'MED', caps:12,  rating:82},
  {id:'sp75', name:'Bukayo Saka',         team:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0,assists:0, pos:'DEL', caps:50,  rating:87},
  {id:'sp76', name:'Harry Kane',          team:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0,assists:0, pos:'DEL', caps:92,  rating:88},
  {id:'sp77', name:'Phil Foden',          team:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0,assists:0, pos:'DEL', caps:42,  rating:87},
  
  {id:'sp78', name:'Bart Verbruggen',     team:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'POR', caps:14, rating:82},
  {id:'sp79', name:'Denzel Dumfries',     team:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'DEF', caps:58, rating:83},
  {id:'sp80', name:'Virgil van Dijk',     team:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'DEF', caps:64, rating:87},
  {id:'sp81', name:'Stefan de Vrij',      team:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'DEF', caps:62, rating:83},
  {id:'sp82', name:'Nathan Aké',          team:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'DEF', caps:38, rating:83},
  {id:'sp83', name:'Frenkie de Jong',     team:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'MED', caps:61, rating:86},
  {id:'sp84', name:'Tijjani Reijnders',   team:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'MED', caps:22, rating:83},
  {id:'sp85', name:'Xavi Simons',         team:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'MED', caps:18, rating:84},
  {id:'sp86', name:'Cody Gakpo',          team:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'DEL', caps:38, rating:84},
  {id:'sp87', name:'Memphis Depay',       team:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'DEL', caps:108,rating:83},
  {id:'sp88', name:'Donyell Malen',       team:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'DEL', caps:30, rating:82},
  
  {id:'sp89', name:'Thibaut Courtois',    team:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'POR', caps:102, rating:90},
  {id:'sp90', name:'Thomas Meunier',      team:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'DEF', caps:92,  rating:79},
  {id:'sp91', name:'Toby Alderweireld',   team:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'DEF', caps:127, rating:82},
  {id:'sp92', name:'Wout Faes',           team:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'DEF', caps:24,  rating:80},
  {id:'sp93', name:'Théo Boyata',         team:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'DEF', caps:37,  rating:78},
  {id:'sp94', name:'Kevin De Bruyne',     team:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'MED', caps:108, rating:91},
  {id:'sp95', name:'Youri Tielemans',     team:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'MED', caps:81,  rating:83},
  {id:'sp96', name:'Axel Witsel',         team:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'MED', caps:130, rating:81},
  {id:'sp97', name:'Romelu Lukaku',       team:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'DEL', caps:112, rating:84},
  {id:'sp98', name:'Dries Mertens',       team:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'DEL', caps:109, rating:81},
  {id:'sp99', name:'Leandro Trossard',    team:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'DEL', caps:40,  rating:83},
  
  {id:'sp100',name:'Yassine Bounou',      team:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'POR', caps:66,  rating:86},
  {id:'sp101',name:'Achraf Hakimi',       team:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'DEF', caps:75,  rating:86},
  {id:'sp102',name:'Nayef Aguerd',        team:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'DEF', caps:42,  rating:82},
  {id:'sp103',name:'Romain Saïss',        team:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'DEF', caps:88,  rating:81},
  {id:'sp104',name:'Noussair Mazraoui',   team:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'DEF', caps:36,  rating:82},
  {id:'sp105',name:'Selim Amallah',       team:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'MED', caps:30,  rating:79},
  {id:'sp106',name:'Sofyan Amrabat',      team:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'MED', caps:62,  rating:83},
  {id:'sp107',name:'Hakim Ziyech',        team:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'MED', caps:62,  rating:83},
  {id:'sp108',name:'Youssef En-Nesyri',   team:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'DEL', caps:58,  rating:82},
  {id:'sp109',name:'Sofiane Boufal',      team:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'DEL', caps:48,  rating:81},
  {id:'sp110',name:'Abderrazak Hamdallah',team:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'DEL', caps:48,  rating:80},
  
  {id:'sp111',name:'Shuichi Gonda',       team:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'POR', caps:58,  rating:80},
  {id:'sp112',name:'Hiroki Sakai',        team:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'DEF', caps:68,  rating:79},
  {id:'sp113',name:'Maya Yoshida',        team:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'DEF', caps:136, rating:79},
  {id:'sp114',name:'Ko Itakura',          team:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'DEF', caps:28,  rating:80},
  {id:'sp115',name:'Yuto Nagatomo',       team:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'DEF', caps:149, rating:78},
  {id:'sp116',name:'Wataru Endo',         team:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'MED', caps:62,  rating:82},
  {id:'sp117',name:'Takuma Asano',        team:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'MED', caps:52,  rating:79},
  {id:'sp118',name:'Takefusa Kubo',       team:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'MED', caps:38,  rating:83},
  {id:'sp119',name:'Kaoru Mitoma',        team:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'DEL', caps:40,  rating:84},
  {id:'sp120',name:'Ritsu Doan',          team:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'DEL', caps:50,  rating:82},
  {id:'sp121',name:'Daichi Kamada',       team:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'DEL', caps:44,  rating:82},
  
  {id:'sp122',name:'Guillermo Ochoa',     team:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'POR', caps:152, rating:82},
  {id:'sp123',name:'Jorge Sánchez',       team:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'DEF', caps:38,  rating:78},
  {id:'sp124',name:'César Montes',        team:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'DEF', caps:40,  rating:79},
  {id:'sp125',name:'Johan Vásquez',       team:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'DEF', caps:28,  rating:78},
  {id:'sp126',name:'Jesús Gallardo',      team:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'DEF', caps:56,  rating:78},
  {id:'sp127',name:'Edson Álvarez',       team:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'MED', caps:68,  rating:82},
  {id:'sp128',name:'Héctor Herrera',      team:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'MED', caps:121, rating:79},
  {id:'sp129',name:'Orbelín Pineda',      team:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'MED', caps:62,  rating:79},
  {id:'sp130',name:'Hirving Lozano',      team:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'DEL', caps:76,  rating:82},
  {id:'sp131',name:'Santiago Giménez',    team:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'DEL', caps:32,  rating:83},
  {id:'sp132',name:'Chucky Lozano',       team:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'DEL', caps:76,  rating:82},
  
  {id:'sp133',name:'Matt Turner',         team:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'POR', caps:36,  rating:80},
  {id:'sp134',name:'Sergino Dest',        team:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'DEF', caps:38,  rating:80},
  {id:'sp135',name:'Tim Ream',            team:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'DEF', caps:62,  rating:78},
  {id:'sp136',name:'Miles Robinson',      team:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'DEF', caps:36,  rating:79},
  {id:'sp137',name:'Antonee Robinson',    team:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'DEF', caps:40,  rating:80},
  {id:'sp138',name:'Tyler Adams',         team:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'MED', caps:52,  rating:81},
  {id:'sp139',name:'Weston McKennie',     team:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'MED', caps:47,  rating:80},
  {id:'sp140',name:'Yunus Musah',         team:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'MED', caps:36,  rating:81},
  {id:'sp141',name:'Christian Pulisic',   team:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'DEL', caps:69,  rating:83},
  {id:'sp142',name:'Ricardo Pepi',        team:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'DEL', caps:24,  rating:80},
  {id:'sp143',name:'Gio Reyna',           team:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'DEL', caps:30,  rating:81},
  
  {id:'sp144',name:'Ørjan Nyland',        team:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'POR', caps:48,  rating:80},
  {id:'sp145',name:'Kristoffer Ajer',     team:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'DEF', caps:52,  rating:81},
  {id:'sp146',name:'Leo Østigård',        team:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'DEF', caps:30,  rating:79},
  {id:'sp147',name:'Stefan Strandberg',   team:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'DEF', caps:44,  rating:78},
  {id:'sp148',name:'Fredrik Björkan',     team:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'DEF', caps:26,  rating:77},
  {id:'sp149',name:'Sander Berge',        team:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'MED', caps:50,  rating:82},
  {id:'sp150',name:'Martin Ødegaard',     team:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'MED', caps:89,  rating:86},
  {id:'sp151',name:'Morten Thorsby',      team:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'MED', caps:38,  rating:78},
  {id:'sp152',name:'Erling Haaland',      team:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'DEL', caps:34,  rating:91},
  {id:'sp153',name:'Alexander Sørloth',   team:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'DEL', caps:58,  rating:82},
  {id:'sp154',name:'Mohamed Elyounoussi',team:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'DEL', caps:74,  rating:79},
  
  {id:'sp155',name:'Sergio Rochet',       team:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'POR', caps:28,  rating:81},
  {id:'sp156',name:'Nahitan Nández',      team:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'DEF', caps:52,  rating:81},
  {id:'sp157',name:'José María Giménez',  team:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'DEF', caps:60,  rating:83},
  {id:'sp158',name:'Diego Godín',         team:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'DEF', caps:161, rating:80},
  {id:'sp159',name:'Mathías Olivera',     team:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'DEF', caps:30,  rating:81},
  {id:'sp160',name:'Federico Valverde',   team:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'MED', caps:64,  rating:87},
  {id:'sp161',name:'Rodrigo Bentancur',   team:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'MED', caps:60,  rating:83},
  {id:'sp162',name:'Matías Vecino',       team:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'MED', caps:78,  rating:80},
  {id:'sp163',name:'Darwin Núñez',        team:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'DEL', caps:39,  rating:85},
  {id:'sp164',name:'Luis Suárez',         team:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'DEL', caps:142, rating:82},
  {id:'sp165',name:'Facundo Torres',      team:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'DEL', caps:22,  rating:80},
  
  {id:'sp166',name:'Camilo Vargas',       team:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'POR', caps:40,  rating:79},
  {id:'sp167',name:'Santiago Arias',      team:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'DEF', caps:58,  rating:78},
  {id:'sp168',name:'Yerry Mina',          team:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'DEF', caps:49,  rating:80},
  {id:'sp169',name:'Davinson Sánchez',    team:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'DEF', caps:68,  rating:82},
  {id:'sp170',name:'Johan Mojica',        team:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'DEF', caps:44,  rating:78},
  {id:'sp171',name:'James Rodríguez',     team:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'MED', caps:104, rating:84},
  {id:'sp172',name:'Wilmar Barrios',      team:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'MED', caps:62,  rating:79},
  {id:'sp173',name:'Mateus Uribe',        team:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'MED', caps:58,  rating:79},
  {id:'sp174',name:'Luis Díaz',           team:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'DEL', caps:42,  rating:86},
  {id:'sp175',name:'Falcao García',       team:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'DEL', caps:109, rating:79},
  {id:'sp176',name:'Rafael Santos Borré', team:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'DEL', caps:44,  rating:80},
  
  {id:'sp177',name:'Edouard Mendy',       team:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'POR', caps:54,  rating:83},
  {id:'sp178',name:'Youssouf Sabaly',     team:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'DEF', caps:40,  rating:79},
  {id:'sp179',name:'Kalidou Koulibaly',   team:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'DEF', caps:92,  rating:85},
  {id:'sp180',name:'Abdou Diallo',        team:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'DEF', caps:38,  rating:80},
  {id:'sp181',name:'Formose Mendy',       team:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'DEF', caps:22,  rating:77},
  {id:'sp182',name:'Idrissa Gueye',       team:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'MED', caps:88,  rating:82},
  {id:'sp183',name:'Nampalys Mendy',      team:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'MED', caps:46,  rating:78},
  {id:'sp184',name:'Ismaïla Sarr',        team:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'DEL', caps:52,  rating:82},
  {id:'sp185',name:'Sadio Mané',          team:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'DEL', caps:99,  rating:84},
  {id:'sp186',name:'Famara Diédhiou',     team:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'DEL', caps:44,  rating:79},
  {id:'sp187',name:'Boulaye Dia',         team:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'DEL', caps:22,  rating:80},
  
  {id:'sp188',name:'Maxime Crépeau',      team:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'POR', caps:36,  rating:79},
  {id:'sp189',name:'Richie Laryea',       team:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'DEF', caps:40,  rating:78},
  {id:'sp190',name:'Steven Vitória',      team:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'DEF', caps:30,  rating:78},
  {id:'sp191',name:'Derek Cornelius',     team:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'DEF', caps:24,  rating:77},
  {id:'sp192',name:'Alphonso Davies',     team:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'DEF', caps:55,  rating:86},
  {id:'sp193',name:'Stephen Eustáquio',   team:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'MED', caps:38,  rating:80},
  {id:'sp194',name:'Atiba Hutchinson',    team:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'MED', caps:104, rating:78},
  {id:'sp195',name:'Samuel Piette',       team:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'MED', caps:52,  rating:77},
  {id:'sp196',name:'Cyle Larin',          team:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'DEL', caps:60,  rating:80},
  {id:'sp197',name:'Jonathan David',      team:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'DEL', caps:36,  rating:84},
  {id:'sp198',name:'Tajon Buchanan',      team:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'DEL', caps:34,  rating:80},
  
  {id:'sp199',name:'Yann Sommer',         team:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'POR', caps:94,  rating:85},
  {id:'sp200',name:'Silvan Widmer',       team:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'DEF', caps:44,  rating:80},
  {id:'sp201',name:'Manuel Akanji',       team:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'DEF', caps:52,  rating:84},
  {id:'sp202',name:'Fabian Schär',        team:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'DEF', caps:78,  rating:82},
  {id:'sp203',name:'Ricardo Rodríguez',   team:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'DEF', caps:96,  rating:81},
  {id:'sp204',name:'Granit Xhaka',        team:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'MED', caps:128, rating:83},
  {id:'sp205',name:'Remo Freuler',        team:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'MED', caps:58,  rating:81},
  {id:'sp206',name:'Xherdan Shaqiri',     team:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'DEL', caps:112, rating:81},
  {id:'sp207',name:'Ruben Vargas',        team:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'DEL', caps:32,  rating:80},
  {id:'sp208',name:'Breel Embolo',        team:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'DEL', caps:52,  rating:81},
  {id:'sp209',name:'Haris Seferovic',     team:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'DEL', caps:88,  rating:79},
  
  {id:'sp210',name:'Dominik Livaković',   team:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'POR', caps:48,  rating:84},
  {id:'sp211',name:'Josip Juranović',     team:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'DEF', caps:48,  rating:80},
  {id:'sp212',name:'Domagoj Vida',        team:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'DEF', caps:104, rating:79},
  {id:'sp213',name:'Joško Gvardiol',      team:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'DEF', caps:38,  rating:85},
  {id:'sp214',name:'Borna Sosa',          team:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'DEF', caps:28,  rating:80},
  {id:'sp215',name:'Luka Modrić',         team:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'MED', caps:179, rating:87},
  {id:'sp216',name:'Mateo Kovačić',       team:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'MED', caps:99,  rating:85},
  {id:'sp217',name:'Marcelo Brozović',    team:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'MED', caps:89,  rating:83},
  {id:'sp218',name:'Ivan Perišić',        team:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'DEL', caps:123, rating:82},
  {id:'sp219',name:'Andrej Kramarić',     team:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'DEL', caps:82,  rating:82},
  {id:'sp220',name:'Bruno Petković',      team:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'DEL', caps:42,  rating:79},
  
  {id:'sp221',name:'Kasper Schmeichel',   team:'Dinamarca', flag:'🇩🇰', goals:0,assists:0, pos:'POR', caps:92,  rating:83},
  {id:'sp222',name:'Henrik Dalsgaard',    team:'Dinamarca', flag:'🇩🇰', goals:0,assists:0, pos:'DEF', caps:50,  rating:78},
  {id:'sp223',name:'Andreas Christensen', team:'Dinamarca', flag:'🇩🇰', goals:0,assists:0, pos:'DEF', caps:60,  rating:84},
  {id:'sp224',name:'Joachim Andersen',    team:'Dinamarca', flag:'🇩🇰', goals:0,assists:0, pos:'DEF', caps:36,  rating:82},
  {id:'sp225',name:'Joakim Maehle',       team:'Dinamarca', flag:'🇩🇰', goals:0,assists:0, pos:'DEF', caps:44,  rating:80},
  {id:'sp226',name:'Christian Eriksen',   team:'Dinamarca', flag:'🇩🇰', goals:0,assists:0, pos:'MED', caps:131, rating:84},
  {id:'sp227',name:'Pierre-Emile Højbjerg',team:'Dinamarca',flag:'🇩🇰', goals:0,assists:0, pos:'MED', caps:78,  rating:82},
  {id:'sp228',name:'Thomas Delaney',      team:'Dinamarca', flag:'🇩🇰', goals:0,assists:0, pos:'MED', caps:72,  rating:80},
  {id:'sp229',name:'Mikkel Damsgaard',    team:'Dinamarca', flag:'🇩🇰', goals:0,assists:0, pos:'DEL', caps:30,  rating:81},
  {id:'sp230',name:'Jonas Wind',          team:'Dinamarca', flag:'🇩🇰', goals:0,assists:0, pos:'DEL', caps:22,  rating:79},
  {id:'sp231',name:'Kasper Dolberg',      team:'Dinamarca', flag:'🇩🇰', goals:0,assists:0, pos:'DEL', caps:40,  rating:79},
  
  {id:'sp232',name:'Francis Uzoho',       team:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'POR', caps:32,  rating:78},
  {id:'sp233',name:'Ola Aina',            team:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'DEF', caps:44,  rating:79},
  {id:'sp234',name:'William Troost-Ekong',team:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'DEF', caps:62,  rating:80},
  {id:'sp235',name:'Leon Balogun',        team:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'DEF', caps:58,  rating:78},
  {id:'sp236',name:'Zaidu Sanusi',        team:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'DEF', caps:24,  rating:77},
  {id:'sp237',name:'Wilfried Ndidi',      team:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'MED', caps:65,  rating:81},
  {id:'sp238',name:'Joe Aribo',           team:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'MED', caps:40,  rating:79},
  {id:'sp239',name:'Frank Onyeka',        team:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'MED', caps:30,  rating:78},
  {id:'sp240',name:'Victor Osimhen',      team:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'DEL', caps:32,  rating:86},
  {id:'sp241',name:'Samuel Chukwueze',    team:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'DEL', caps:44,  rating:81},
  {id:'sp242',name:'Kelechi Iheanacho',   team:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'DEL', caps:52,  rating:79},
  
  {id:'sp243',name:'Pedro Gallese',       team:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'POR', caps:68,  rating:80},
  {id:'sp244',name:'Luis Advíncula',      team:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'DEF', caps:94,  rating:79},
  {id:'sp245',name:'Alexander Callens',   team:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'DEF', caps:42,  rating:78},
  {id:'sp246',name:'Carlos Zambrano',     team:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'DEF', caps:84,  rating:78},
  {id:'sp247',name:'Miguel Trauco',       team:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'DEF', caps:62,  rating:77},
  {id:'sp248',name:'Renato Tapia',        team:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'MED', caps:72,  rating:79},
  {id:'sp249',name:'Sergio Peña',         team:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'MED', caps:38,  rating:78},
  {id:'sp250',name:'Yoshimar Yotún',      team:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'MED', caps:98,  rating:77},
  {id:'sp251',name:'André Carrillo',      team:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'DEL', caps:102, rating:78},
  {id:'sp252',name:'Paolo Guerrero',      team:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'DEL', caps:108, rating:77},
  {id:'sp253',name:'Edison Flores',       team:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'DEL', caps:76,  rating:78},
  
  {id:'sp254',name:'Hernán Galíndez',     team:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'POR', caps:30,  rating:79},
  {id:'sp255',name:'Angelo Preciado',     team:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'DEF', caps:38,  rating:78},
  {id:'sp256',name:'Piero Hincapié',      team:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'DEF', caps:34,  rating:82},
  {id:'sp257',name:'William Pacho',       team:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'DEF', caps:22,  rating:81},
  {id:'sp258',name:'Pervis Estupiñán',    team:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'DEF', caps:44,  rating:82},
  {id:'sp259',name:'Carlos Gruezo',       team:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'MED', caps:52,  rating:78},
  {id:'sp260',name:'Moisés Caicedo',      team:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'MED', caps:40,  rating:85},
  {id:'sp261',name:'Jhegson Méndez',      team:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'MED', caps:34,  rating:78},
  {id:'sp262',name:'Enner Valencia',      team:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'DEL', caps:87,  rating:82},
  {id:'sp263',name:'Jeremy Sarmiento',    team:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'DEL', caps:24,  rating:79},
  {id:'sp264',name:'Gonzalo Plata',       team:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'DEL', caps:36,  rating:79},
  
  {id:'sp265',name:'Mat Ryan',            team:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'POR', caps:82,  rating:80},
  {id:'sp266',name:'Nathaniel Atkinson',  team:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'DEF', caps:24,  rating:76},
  {id:'sp267',name:'Harry Souttar',       team:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'DEF', caps:26,  rating:79},
  {id:'sp268',name:'Kye Rowles',          team:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'DEF', caps:18,  rating:76},
  {id:'sp269',name:'Milos Degenek',       team:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'DEF', caps:50,  rating:76},
  {id:'sp270',name:'Aaron Mooy',          team:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'MED', caps:86,  rating:79},
  {id:'sp271',name:'Jackson Irvine',      team:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'MED', caps:58,  rating:78},
  {id:'sp272',name:'Riley McGree',        team:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'MED', caps:26,  rating:77},
  {id:'sp273',name:'Mathew Leckie',       team:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'DEL', caps:90,  rating:78},
  {id:'sp274',name:'Mitchell Duke',       team:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'DEL', caps:40,  rating:76},
  {id:'sp275',name:'Craig Goodwin',       team:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'DEL', caps:30,  rating:76},
  
  {id:'sp276',name:'Alireza Beiranvand',  team:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'POR', caps:62,  rating:80},
  {id:'sp277',name:'Sadegh Moharrami',    team:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'DEF', caps:44,  rating:77},
  {id:'sp278',name:'Majid Hosseini',      team:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'DEF', caps:38,  rating:78},
  {id:'sp279',name:'Milad Mohammadi',     team:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'DEF', caps:58,  rating:77},
  {id:'sp280',name:'Ramin Rezaeian',      team:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'DEF', caps:72,  rating:77},
  {id:'sp281',name:'Saeid Ezatolahi',     team:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'MED', caps:58,  rating:78},
  {id:'sp282',name:'Ali Gholizadeh',      team:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'MED', caps:44,  rating:78},
  {id:'sp283',name:'Ahmad Nourollahi',    team:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'MED', caps:50,  rating:77},
  {id:'sp284',name:'Sardar Azmoun',       team:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'DEL', caps:68,  rating:80},
  {id:'sp285',name:'Mehdi Taremi',        team:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'DEL', caps:78,  rating:82},
  {id:'sp286',name:'Alireza Jahanbakhsh', team:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'DEL', caps:90,  rating:79},
  
  {id:'sp287',name:'Mohammed Al-Owais',   team:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'POR', caps:56, rating:80},
  {id:'sp288',name:'Saud Abdulhamid',     team:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'DEF', caps:48, rating:78},
  {id:'sp289',name:'Ali Al-Bulaihi',      team:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'DEF', caps:52, rating:77},
  {id:'sp290',name:'Abdulelah Al-Amri',   team:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'DEF', caps:38, rating:77},
  {id:'sp291',name:'Yasser Al-Shahrani',  team:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'DEF', caps:74, rating:78},
  {id:'sp292',name:'Salman Al-Faraj',     team:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'MED', caps:88, rating:79},
  {id:'sp293',name:'Mohammed Kanno',      team:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'MED', caps:44, rating:78},
  {id:'sp294',name:'Hatan Bahbir',        team:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'MED', caps:28, rating:76},
  {id:'sp295',name:'Salem Al-Dawsari',    team:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'DEL', caps:89, rating:78},
  {id:'sp296',name:'Firas Al-Buraikan',   team:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'DEL', caps:38, rating:77},
  {id:'sp297',name:'Abdullah Al-Hamdan',  team:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'DEL', caps:28, rating:77},
  
  {id:'sp298',name:'Lawrence Ati-Zigi',   team:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'POR', caps:32,  rating:79},
  {id:'sp299',name:'Andrew Ayew',         team:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'DEF', caps:76,  rating:78},
  {id:'sp300',name:'Alexander Djiku',     team:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'DEF', caps:36,  rating:78},
  {id:'sp301',name:'Daniel Amartey',      team:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'DEF', caps:46,  rating:78},
  {id:'sp302',name:'Gideon Mensah',       team:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'DEF', caps:22,  rating:76},
  {id:'sp303',name:'Thomas Partey',       team:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'MED', caps:58,  rating:83},
  {id:'sp304',name:'Baba Iddrisu',        team:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'MED', caps:28,  rating:77},
  {id:'sp305',name:'Mubarak Wakaso',      team:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'MED', caps:90,  rating:77},
  {id:'sp306',name:'Jordan Ayew',         team:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'DEL', caps:90,  rating:78},
  {id:'sp307',name:'Mohammed Kudus',      team:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'DEL', caps:30,  rating:82},
  {id:'sp308',name:'Inaki Williams',      team:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'DEL', caps:14,  rating:80},
  
  {id:'sp309',name:'Ronwen Williams',     team:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'POR', caps:38,  rating:79},
  {id:'sp310',name:'Sifiso Hlanti',       team:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'DEF', caps:30,  rating:76},
  {id:'sp311',name:'Rushine de Reuck',    team:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'DEF', caps:30,  rating:76},
  {id:'sp312',name:'Mothobi Mvala',       team:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'DEF', caps:24,  rating:76},
  {id:'sp313',name:'Siyanda Xulu',        team:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'DEF', caps:22,  rating:75},
  {id:'sp314',name:'Bongani Zungu',       team:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'MED', caps:42,  rating:77},
  {id:'sp315',name:'Ethan Ntseki',        team:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'MED', caps:18,  rating:75},
  {id:'sp316',name:'Themba Zwane',        team:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'MED', caps:36,  rating:77},
  {id:'sp317',name:'Percy Tau',           team:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'DEL', caps:62,  rating:77},
  {id:'sp318',name:'Lyle Foster',         team:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'DEL', caps:18,  rating:77},
  {id:'sp319',name:'Evidence Makgopa',    team:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'DEL', caps:14,  rating:76},
];

const Stats = {
  _currentTab: 'teams',
  _lastQuery: '',

  async render(tab = 'teams') {
    this._currentTab = tab;
    
    const input = document.getElementById('search-input');
    if (input && this._lastQuery) input.value = this._lastQuery;
    const content = document.getElementById('stats-content');
    if (!content) return;
    content.innerHTML = '<div class="spinner"></div>';
    try {
      
      const q = this._lastQuery;
      if (tab === 'teams')   await this.renderTeams(content, q);
      if (tab === 'players') await this.renderPlayers(content, q);
      if (tab === 'groups')  await this.renderGroups(content);
    } catch(err) {
      console.error('[Stats.render]', err);
      content.innerHTML = '<p class="empty-state" style="color:var(--text-muted)">Error al cargar datos. Intenta de nuevo.</p>';
    }
  },

  async renderTeams(container, query = '') {
    let teams = await API.getTeams(query);
    
    if (!teams || teams.length === 0) {
      teams = await API.getTeams(query); 
    }
    teams = [...teams].sort((a, b) => {
      const ptsA = a.pts ?? 0, ptsB = b.pts ?? 0;
      if (ptsB !== ptsA) return ptsB - ptsA;
      const dgA = (a.gf ?? 0) - (a.gc ?? 0);
      const dgB = (b.gf ?? 0) - (b.gc ?? 0);
      if (dgB !== dgA) return dgB - dgA;
      const wA = a.w ?? 0, wB = b.w ?? 0;
      if (wB !== wA) return wB - wA;
      return (b.gf ?? 0) - (a.gf ?? 0);
    });
    const user    = await Auth.currentUser();
    const favIds  = new Set((user?.favoritos || []).map(f => f.id));

    container.innerHTML = `
      <div class="stats-table-wrap">
        <table class="stats-table">
          <thead><tr>
            <th>#</th><th>Equipo</th><th>PJ</th>
            <th>W</th><th>D</th><th>L</th>
            <th>GF</th><th>GC</th><th>Pts</th><th></th>
          </tr></thead>
          <tbody>
            ${teams.map((t, i) => `
              <tr>
                <td class="text-muted">${i+1}</td>
                <td><span class="team-flag">${t.flag||'🏳️'}</span>${t.name}</td>
                <td>${t.pj??0}</td>
                <td class="stat-w">${t.w??0}</td>
                <td class="text-muted">${t.d??0}</td>
                <td class="stat-l">${t.l??0}</td>
                <td>${t.gf??0}</td>
                <td>${t.gc??0}</td>
                <td class="stat-pts">${t.pts??0}</td>
                <td>
                  <button class="fav-btn ${favIds.has(t.id)?'active':''}"
                    data-id="${t.id}" data-name="${t.name.replace(/'/g, '&#39;')}"
                    data-flag="${t.flag||''}" data-tipo="team">
                    ${favIds.has(t.id)?'★':'☆'}
                  </button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    container.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const isFav = await Profile.isFavorite(btn.dataset.id, 'team'); 
        if (isFav) {
          await Profile.removeFavorite(btn.dataset.id, 'team');
          btn.textContent = '☆'; btn.classList.remove('active');
        } else {
          await Profile.addFavorite({id:btn.dataset.id,name:btn.dataset.name,flag:btn.dataset.flag},'team');
          btn.textContent = '★'; btn.classList.add('active');
        }
      });
    });
  },

  async renderPlayers(container, query = '') {
    
    
    let merged = [...ALL_PLAYERS];
    try {
      const apiPlayers = await API.getPlayers('');
      if (apiPlayers && apiPlayers.length > 0) {
        const allNames = new Set(ALL_PLAYERS.map(p => p.name.toLowerCase()));
        for (const p of apiPlayers) {
          if (!allNames.has(p.name.toLowerCase())) merged.push(p);
        }
        
        apiPlayers.forEach(ap => {
          const existing = merged.find(p => p.name.toLowerCase() === ap.name.toLowerCase());
          if (existing && (ap.goals > 0 || ap.assists > 0)) {
            existing.goals   = ap.goals;
            existing.assists = ap.assists;
          }
        });
      }
    } catch(_) {  }
    
    const q       = query.toLowerCase();
    const players = q
      ? merged.filter(p => p.name.toLowerCase().includes(q) || matchesSearch(p.team, query))
      : merged;

    const user    = await Auth.currentUser();
    const favIds  = new Set((user?.favoritos || []).map(f => f.id));

    if (!players.length) {
      container.innerHTML = '<p class="empty-state">No se encontraron jugadores.</p>';
      return;
    }

    container.innerHTML = `
      <div class="stats-table-wrap">
        <table class="stats-table">
          <thead><tr>
            <th>Jugador</th><th>Equipo</th><th>Pos</th>
            <th>⚽</th><th>🅰️</th><th>Caps</th><th></th>
          </tr></thead>
          <tbody>
            ${players.map(p => `
              <tr>
                <td style="font-weight:600">${p.name}</td>
                <td><span class="team-flag">${p.flag||'🏳️'}</span>${p.team}</td>
                <td><span class="pos-badge">${p.pos}</span></td>
                <td class="stat-w">${p.goals??0}</td>
                <td style="color:var(--rare)">${p.assists??0}</td>
                <td class="text-muted">${p.caps??0}</td>
                <td>
                  <button class="fav-btn ${favIds.has(p.id)?'active':''}"
                    data-id="${p.id}" data-name="${p.name.replace(/'/g, '&#39;')}"
                    data-flag="${p.flag||''}" data-tipo="player">
                    ${favIds.has(p.id)?'★':'☆'}
                  </button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    container.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const isFav = await Profile.isFavorite(btn.dataset.id, 'player'); 
        if (isFav) {
          await Profile.removeFavorite(btn.dataset.id, 'player');
          btn.textContent = '☆'; btn.classList.remove('active');
        } else {
          await Profile.addFavorite({id:btn.dataset.id,name:btn.dataset.name,flag:btn.dataset.flag},'player');
          btn.textContent = '★'; btn.classList.add('active');
        }
      });
    });
  },

  async renderScorers(container) {
    const scorers = await API.getTopScorers();
    container.innerHTML = `
      <div class="stats-table-wrap">
        <table class="stats-table">
          <thead><tr><th>#</th><th>Jugador</th><th>Equipo</th><th>⚽</th><th>🅰️</th></tr></thead>
          <tbody>
            ${scorers.map((p,i) => `
              <tr>
                <td style="font-family:'Bebas Neue',cursive;font-size:1.2rem;
                  color:${i===0?'var(--gold)':i===1?'#c0c0c0':i===2?'#cd7f32':'var(--text-muted)'}">${i+1}</td>
                <td style="font-weight:600">${p.name}</td>
                <td><span class="team-flag">${p.flag||'🏳️'}</span>${p.team}</td>
                <td style="color:var(--gold);font-family:'Bebas Neue',cursive;font-size:1.2rem">${p.goals}</td>
                <td style="color:var(--rare)">${p.assists??0}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  },

  
  async renderGroups(container) {
    container.innerHTML = '<div class="spinner"></div>';
    try {
      const groups = await API.getAllGroups();
      const groupKeys = Object.keys(groups).sort();
      if (!groupKeys.length) {
        container.innerHTML = '<p class="empty-state">No hay datos de grupos disponibles.</p>';
        return;
      }
      container.innerHTML = '<div class="groups-grid">' + groupKeys.map(g => {
        const teams = groups[g];
        return `
          <div class="group-table-wrap">
            <div class="group-table-title">Grupo ${g}</div>
            <table class="stats-table" style="font-size:0.72rem">
              <thead><tr>
                <th>#</th><th>Equipo</th><th>PJ</th>
                <th style="color:#44ff88">V</th><th>E</th><th style="color:#ff4466">D</th>
                <th>GF</th><th>GC</th><th style="color:var(--gold)">Pts</th>
              </tr></thead>
              <tbody>
                ${teams.map((t, i) => `
                  <tr style="${i < 2 ? 'border-left:2px solid var(--accent)' : ''}">
                    <td class="text-muted" style="font-size:0.8rem">${i+1}</td>
                    <td><span class="team-flag">${t.flag||'🏳️'}</span>${t.team}</td>
                    <td>${t.pj||0}</td>
                    <td style="color:#44ff88">${t.w||0}</td>
                    <td class="text-muted">${t.d||0}</td>
                    <td style="color:#ff4466">${t.l||0}</td>
                    <td>${t.gf||0}</td>
                    <td>${t.gc||0}</td>
                    <td style="color:var(--gold);font-weight:700">${t.pts||0}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
            <div style="font-size:0.6rem;color:var(--text-muted);padding:2px 4px;margin-top:2px">
              ─ Clasifican al R32
            </div>
          </div>`;
      }).join('') + '</div>';
    } catch(err) {
      container.innerHTML = '<p class="empty-state" style="color:var(--text-muted)">Error al cargar grupos.</p>';
    }
  },

  async search(query) {
    this._lastQuery = query;
    const content = document.getElementById('stats-content');
    if (!content) return;
    content.innerHTML = '<div class="spinner"></div>';
    if (this._currentTab === 'teams')   await this.renderTeams(content, query);
    if (this._currentTab === 'players') await this.renderPlayers(content, query);
    if (this._currentTab === 'groups')  await this.renderGroups(content);
  },

  findPlayer(name) {
    const q = name.toLowerCase();
    return ALL_PLAYERS.find(p => p.name.toLowerCase().includes(q)) || null;
  }
};
