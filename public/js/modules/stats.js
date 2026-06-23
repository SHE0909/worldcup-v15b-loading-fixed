const TODOS_JUGADORES = [
  
  {id:'sp01', name:'Emiliano Martínez',  equipo:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'POR', caps:38,  rating:87},
  {id:'sp02', name:'Nahuel Molina',       equipo:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'DEF', caps:43,  rating:81},
  {id:'sp03', name:'Cristian Romero',     equipo:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'DEF', caps:34,  rating:85},
  {id:'sp04', name:'Lisandro Martínez',   equipo:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'DEF', caps:26,  rating:84},
  {id:'sp05', name:'Nicolás Tagliafico',  equipo:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'DEF', caps:66,  rating:81},
  {id:'sp06', name:'Rodrigo De Paul',     equipo:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'MED', caps:68,  rating:83},
  {id:'sp07', name:'Enzo Fernández',      equipo:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'MED', caps:35,  rating:82},
  {id:'sp08', name:'Alexis Mac Allister', equipo:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'MED', caps:28,  rating:83},
  {id:'sp09', name:'Lionel Messi',        equipo:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'DEL', caps:187, rating:93},
  {id:'sp10', name:'Julián Álvarez',      equipo:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'DEL', caps:38,  rating:85},
  {id:'sp11', name:'Lautaro Martínez',    equipo:'Argentina', flag:'🇦🇷', goals:0,assists:0, pos:'DEL', caps:62,  rating:86},
  
  {id:'sp12', name:'Alisson Becker',      equipo:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'POR', caps:72,  rating:89},
  {id:'sp13', name:'Danilo',              equipo:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'DEF', caps:84,  rating:81},
  {id:'sp14', name:'Marquinhos',          equipo:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'DEF', caps:84,  rating:86},
  {id:'sp15', name:'Gabriel Magalhães',   equipo:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'DEF', caps:28,  rating:83},
  {id:'sp16', name:'Guilherme Arana',     equipo:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'DEF', caps:22,  rating:80},
  {id:'sp17', name:'Casemiro',            equipo:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'MED', caps:77,  rating:85},
  {id:'sp18', name:'Lucas Paquetá',       equipo:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'MED', caps:52,  rating:84},
  {id:'sp19', name:'Bruno Guimarães',     equipo:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'MED', caps:36,  rating:84},
  {id:'sp20', name:'Raphinha',            equipo:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'DEL', caps:52,  rating:86},
  {id:'sp21', name:'Vinicius Jr.',        equipo:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'DEL', caps:55,  rating:91},
  {id:'sp22', name:'Rodrygo',             equipo:'Brasil',    flag:'🇧🇷', goals:0,assists:0, pos:'DEL', caps:38,  rating:84},
  
  {id:'sp23', name:'Mike Maignan',        equipo:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'POR', caps:28,  rating:87},
  {id:'sp24', name:'Jules Koundé',        equipo:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'DEF', caps:40,  rating:84},
  {id:'sp25', name:'Dayot Upamecano',     equipo:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'DEF', caps:36,  rating:84},
  {id:'sp26', name:'William Saliba',      equipo:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'DEF', caps:18,  rating:85},
  {id:'sp27', name:'Theo Hernández',      equipo:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'DEF', caps:38,  rating:84},
  {id:'sp28', name:'Aurélien Tchouaméni',equipo:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'MED', caps:35,  rating:83},
  {id:'sp29', name:'NGolo Kanté',         equipo:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'MED', caps:56,  rating:85},
  {id:'sp30', name:'Antoine Griezmann',   equipo:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'MED', caps:137, rating:85},
  {id:'sp31', name:'Ousmane Dembélé',     equipo:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'DEL', caps:57,  rating:84},
  {id:'sp32', name:'Kylian Mbappé',       equipo:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'DEL', caps:82,  rating:92},
  {id:'sp33', name:'Marcus Thuram',       equipo:'Francia',   flag:'🇫🇷', goals:0,assists:0, pos:'DEL', caps:30,  rating:83},
  
  {id:'sp34', name:'Unai Simón',          equipo:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'POR', caps:28,  rating:84},
  {id:'sp35', name:'Dani Carvajal',       equipo:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'DEF', caps:77,  rating:84},
  {id:'sp36', name:'Aymeric Laporte',     equipo:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'DEF', caps:20,  rating:83},
  {id:'sp37', name:'Pau Cubarsí',         equipo:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'DEF', caps:10,  rating:83},
  {id:'sp38', name:'Marc Cucurella',      equipo:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'DEF', caps:28,  rating:82},
  {id:'sp39', name:'Rodri',              equipo:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'MED', caps:61,  rating:91},
  {id:'sp40', name:'Pedri',              equipo:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'MED', caps:48,  rating:87},
  {id:'sp41', name:'Fabian Ruiz',         equipo:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'MED', caps:32,  rating:83},
  {id:'sp42', name:'Lamine Yamal',        equipo:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'DEL', caps:20,  rating:88},
  {id:'sp43', name:'Álvaro Morata',       equipo:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'DEL', caps:72,  rating:82},
  {id:'sp44', name:'Nico Williams',       equipo:'España',    flag:'🇪🇸', goals:0,assists:0, pos:'DEL', caps:18,  rating:85},
  
  {id:'sp45', name:'Diogo Costa',         equipo:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'POR', caps:22,  rating:84},
  {id:'sp46', name:'João Cancelo',        equipo:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'DEF', caps:56,  rating:85},
  {id:'sp47', name:'Rúben Dias',          equipo:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'DEF', caps:74,  rating:88},
  {id:'sp48', name:'Pepe',               equipo:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'DEF', caps:144, rating:80},
  {id:'sp49', name:'Nuno Mendes',         equipo:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'DEF', caps:26,  rating:84},
  {id:'sp50', name:'João Palhinha',       equipo:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'MED', caps:38,  rating:83},
  {id:'sp51', name:'Bruno Fernandes',     equipo:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'MED', caps:75,  rating:87},
  {id:'sp52', name:'Bernardo Silva',      equipo:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'MED', caps:89,  rating:87},
  {id:'sp53', name:'Cristiano Ronaldo',   equipo:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'DEL', caps:215, rating:88},
  {id:'sp54', name:'Diogo Jota',          equipo:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'DEL', caps:49,  rating:84},
  {id:'sp55', name:'Rafael Leão',         equipo:'Portugal',  flag:'🇵🇹', goals:0,assists:0, pos:'DEL', caps:32,  rating:85},
  
  {id:'sp56', name:'Manuel Neuer',        equipo:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'POR', caps:124, rating:86},
  {id:'sp57', name:'Joshua Kimmich',      equipo:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'DEF', caps:94,  rating:87},
  {id:'sp58', name:'Antonio Rüdiger',     equipo:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'DEF', caps:71,  rating:86},
  {id:'sp59', name:'Jonathan Tah',        equipo:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'DEF', caps:28,  rating:83},
  {id:'sp60', name:'David Raum',          equipo:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'DEF', caps:25,  rating:81},
  {id:'sp61', name:'Toni Kroos',          equipo:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'MED', caps:108, rating:88},
  {id:'sp62', name:'Robert Andrich',      equipo:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'MED', caps:22,  rating:81},
  {id:'sp63', name:'Jamal Musiala',       equipo:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'MED', caps:42,  rating:87},
  {id:'sp64', name:'Florian Wirtz',       equipo:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'MED', caps:30,  rating:87},
  {id:'sp65', name:'Thomas Müller',       equipo:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'DEL', caps:131, rating:83},
  {id:'sp66', name:'Kai Havertz',         equipo:'Alemania',  flag:'🇩🇪', goals:0,assists:0, pos:'DEL', caps:60,  rating:84},
  
  {id:'sp67', name:'Jordan Pickford',     equipo:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0,assists:0, pos:'POR', caps:60,  rating:85},
  {id:'sp68', name:'Trent Alexander-Arnold',equipo:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',goals:0,assists:0,pos:'DEF',caps:52, rating:86},
  {id:'sp69', name:'John Stones',         equipo:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0,assists:0, pos:'DEF', caps:73,  rating:85},
  {id:'sp70', name:'Marc Guehi',          equipo:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0,assists:0, pos:'DEF', caps:20,  rating:82},
  {id:'sp71', name:'Luke Shaw',           equipo:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0,assists:0, pos:'DEF', caps:36,  rating:82},
  {id:'sp72', name:'Declan Rice',         equipo:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0,assists:0, pos:'MED', caps:52,  rating:86},
  {id:'sp73', name:'Jude Bellingham',     equipo:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0,assists:0, pos:'MED', caps:40,  rating:88},
  {id:'sp74', name:'Kobbie Mainoo',       equipo:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0,assists:0, pos:'MED', caps:12,  rating:82},
  {id:'sp75', name:'Bukayo Saka',         equipo:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0,assists:0, pos:'DEL', caps:50,  rating:87},
  {id:'sp76', name:'Harry Kane',          equipo:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0,assists:0, pos:'DEL', caps:92,  rating:88},
  {id:'sp77', name:'Phil Foden',          equipo:'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals:0,assists:0, pos:'DEL', caps:42,  rating:87},
  
  {id:'sp78', name:'Bart Verbruggen',     equipo:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'POR', caps:14, rating:82},
  {id:'sp79', name:'Denzel Dumfries',     equipo:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'DEF', caps:58, rating:83},
  {id:'sp80', name:'Virgil van Dijk',     equipo:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'DEF', caps:64, rating:87},
  {id:'sp81', name:'Stefan de Vrij',      equipo:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'DEF', caps:62, rating:83},
  {id:'sp82', name:'Nathan Aké',          equipo:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'DEF', caps:38, rating:83},
  {id:'sp83', name:'Frenkie de Jong',     equipo:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'MED', caps:61, rating:86},
  {id:'sp84', name:'Tijjani Reijnders',   equipo:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'MED', caps:22, rating:83},
  {id:'sp85', name:'Xavi Simons',         equipo:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'MED', caps:18, rating:84},
  {id:'sp86', name:'Cody Gakpo',          equipo:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'DEL', caps:38, rating:84},
  {id:'sp87', name:'Memphis Depay',       equipo:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'DEL', caps:108,rating:83},
  {id:'sp88', name:'Donyell Malen',       equipo:'Países Bajos',flag:'🇳🇱', goals:0,assists:0, pos:'DEL', caps:30, rating:82},
  
  {id:'sp89', name:'Thibaut Courtois',    equipo:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'POR', caps:102, rating:90},
  {id:'sp90', name:'Thomas Meunier',      equipo:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'DEF', caps:92,  rating:79},
  {id:'sp91', name:'Toby Alderweireld',   equipo:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'DEF', caps:127, rating:82},
  {id:'sp92', name:'Wout Faes',           equipo:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'DEF', caps:24,  rating:80},
  {id:'sp93', name:'Théo Boyata',         equipo:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'DEF', caps:37,  rating:78},
  {id:'sp94', name:'Kevin De Bruyne',     equipo:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'MED', caps:108, rating:91},
  {id:'sp95', name:'Youri Tielemans',     equipo:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'MED', caps:81,  rating:83},
  {id:'sp96', name:'Axel Witsel',         equipo:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'MED', caps:130, rating:81},
  {id:'sp97', name:'Romelu Lukaku',       equipo:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'DEL', caps:112, rating:84},
  {id:'sp98', name:'Dries Mertens',       equipo:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'DEL', caps:109, rating:81},
  {id:'sp99', name:'Leandro Trossard',    equipo:'Bélgica',   flag:'🇧🇪', goals:0,assists:0, pos:'DEL', caps:40,  rating:83},
  
  {id:'sp100',name:'Yassine Bounou',      equipo:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'POR', caps:66,  rating:86},
  {id:'sp101',name:'Achraf Hakimi',       equipo:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'DEF', caps:75,  rating:86},
  {id:'sp102',name:'Nayef Aguerd',        equipo:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'DEF', caps:42,  rating:82},
  {id:'sp103',name:'Romain Saïss',        equipo:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'DEF', caps:88,  rating:81},
  {id:'sp104',name:'Noussair Mazraoui',   equipo:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'DEF', caps:36,  rating:82},
  {id:'sp105',name:'Selim Amallah',       equipo:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'MED', caps:30,  rating:79},
  {id:'sp106',name:'Sofyan Amrabat',      equipo:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'MED', caps:62,  rating:83},
  {id:'sp107',name:'Hakim Ziyech',        equipo:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'MED', caps:62,  rating:83},
  {id:'sp108',name:'Youssef En-Nesyri',   equipo:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'DEL', caps:58,  rating:82},
  {id:'sp109',name:'Sofiane Boufal',      equipo:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'DEL', caps:48,  rating:81},
  {id:'sp110',name:'Abderrazak Hamdallah',equipo:'Marruecos', flag:'🇲🇦', goals:0,assists:0, pos:'DEL', caps:48,  rating:80},
  
  {id:'sp111',name:'Shuichi Gonda',       equipo:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'POR', caps:58,  rating:80},
  {id:'sp112',name:'Hiroki Sakai',        equipo:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'DEF', caps:68,  rating:79},
  {id:'sp113',name:'Maya Yoshida',        equipo:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'DEF', caps:136, rating:79},
  {id:'sp114',name:'Ko Itakura',          equipo:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'DEF', caps:28,  rating:80},
  {id:'sp115',name:'Yuto Nagatomo',       equipo:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'DEF', caps:149, rating:78},
  {id:'sp116',name:'Wataru Endo',         equipo:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'MED', caps:62,  rating:82},
  {id:'sp117',name:'Takuma Asano',        equipo:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'MED', caps:52,  rating:79},
  {id:'sp118',name:'Takefusa Kubo',       equipo:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'MED', caps:38,  rating:83},
  {id:'sp119',name:'Kaoru Mitoma',        equipo:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'DEL', caps:40,  rating:84},
  {id:'sp120',name:'Ritsu Doan',          equipo:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'DEL', caps:50,  rating:82},
  {id:'sp121',name:'Daichi Kamada',       equipo:'Japón',     flag:'🇯🇵', goals:0,assists:0, pos:'DEL', caps:44,  rating:82},
  
  {id:'sp122',name:'Guillermo Ochoa',     equipo:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'POR', caps:152, rating:82},
  {id:'sp123',name:'Jorge Sánchez',       equipo:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'DEF', caps:38,  rating:78},
  {id:'sp124',name:'César Montes',        equipo:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'DEF', caps:40,  rating:79},
  {id:'sp125',name:'Johan Vásquez',       equipo:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'DEF', caps:28,  rating:78},
  {id:'sp126',name:'Jesús Gallardo',      equipo:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'DEF', caps:56,  rating:78},
  {id:'sp127',name:'Edson Álvarez',       equipo:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'MED', caps:68,  rating:82},
  {id:'sp128',name:'Héctor Herrera',      equipo:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'MED', caps:121, rating:79},
  {id:'sp129',name:'Orbelín Pineda',      equipo:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'MED', caps:62,  rating:79},
  {id:'sp130',name:'Hirving Lozano',      equipo:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'DEL', caps:76,  rating:82},
  {id:'sp131',name:'Santiago Giménez',    equipo:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'DEL', caps:32,  rating:83},
  {id:'sp132',name:'Chucky Lozano',       equipo:'México',    flag:'🇲🇽', goals:0,assists:0, pos:'DEL', caps:76,  rating:82},
  
  {id:'sp133',name:'Matt Turner',         equipo:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'POR', caps:36,  rating:80},
  {id:'sp134',name:'Sergino Dest',        equipo:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'DEF', caps:38,  rating:80},
  {id:'sp135',name:'Tim Ream',            equipo:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'DEF', caps:62,  rating:78},
  {id:'sp136',name:'Miles Robinson',      equipo:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'DEF', caps:36,  rating:79},
  {id:'sp137',name:'Antonee Robinson',    equipo:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'DEF', caps:40,  rating:80},
  {id:'sp138',name:'Tyler Adams',         equipo:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'MED', caps:52,  rating:81},
  {id:'sp139',name:'Weston McKennie',     equipo:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'MED', caps:47,  rating:80},
  {id:'sp140',name:'Yunus Musah',         equipo:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'MED', caps:36,  rating:81},
  {id:'sp141',name:'Christian Pulisic',   equipo:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'DEL', caps:69,  rating:83},
  {id:'sp142',name:'Ricardo Pepi',        equipo:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'DEL', caps:24,  rating:80},
  {id:'sp143',name:'Gio Reyna',           equipo:'EEUU',      flag:'🇺🇸', goals:0,assists:0, pos:'DEL', caps:30,  rating:81},
  
  {id:'sp144',name:'Ørjan Nyland',        equipo:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'POR', caps:48,  rating:80},
  {id:'sp145',name:'Kristoffer Ajer',     equipo:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'DEF', caps:52,  rating:81},
  {id:'sp146',name:'Leo Østigård',        equipo:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'DEF', caps:30,  rating:79},
  {id:'sp147',name:'Stefan Strandberg',   equipo:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'DEF', caps:44,  rating:78},
  {id:'sp148',name:'Fredrik Björkan',     equipo:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'DEF', caps:26,  rating:77},
  {id:'sp149',name:'Sander Berge',        equipo:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'MED', caps:50,  rating:82},
  {id:'sp150',name:'Martin Ødegaard',     equipo:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'MED', caps:89,  rating:86},
  {id:'sp151',name:'Morten Thorsby',      equipo:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'MED', caps:38,  rating:78},
  {id:'sp152',name:'Erling Haaland',      equipo:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'DEL', caps:34,  rating:91},
  {id:'sp153',name:'Alexander Sørloth',   equipo:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'DEL', caps:58,  rating:82},
  {id:'sp154',name:'Mohamed Elyounoussi',equipo:'Noruega',   flag:'🇳🇴', goals:0,assists:0, pos:'DEL', caps:74,  rating:79},
  
  {id:'sp155',name:'Sergio Rochet',       equipo:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'POR', caps:28,  rating:81},
  {id:'sp156',name:'Nahitan Nández',      equipo:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'DEF', caps:52,  rating:81},
  {id:'sp157',name:'José María Giménez',  equipo:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'DEF', caps:60,  rating:83},
  {id:'sp158',name:'Diego Godín',         equipo:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'DEF', caps:161, rating:80},
  {id:'sp159',name:'Mathías Olivera',     equipo:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'DEF', caps:30,  rating:81},
  {id:'sp160',name:'Federico Valverde',   equipo:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'MED', caps:64,  rating:87},
  {id:'sp161',name:'Rodrigo Bentancur',   equipo:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'MED', caps:60,  rating:83},
  {id:'sp162',name:'Matías Vecino',       equipo:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'MED', caps:78,  rating:80},
  {id:'sp163',name:'Darwin Núñez',        equipo:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'DEL', caps:39,  rating:85},
  {id:'sp164',name:'Luis Suárez',         equipo:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'DEL', caps:142, rating:82},
  {id:'sp165',name:'Facundo Torres',      equipo:'Uruguay',   flag:'🇺🇾', goals:0,assists:0, pos:'DEL', caps:22,  rating:80},
  
  {id:'sp166',name:'Camilo Vargas',       equipo:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'POR', caps:40,  rating:79},
  {id:'sp167',name:'Santiago Arias',      equipo:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'DEF', caps:58,  rating:78},
  {id:'sp168',name:'Yerry Mina',          equipo:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'DEF', caps:49,  rating:80},
  {id:'sp169',name:'Davinson Sánchez',    equipo:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'DEF', caps:68,  rating:82},
  {id:'sp170',name:'Johan Mojica',        equipo:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'DEF', caps:44,  rating:78},
  {id:'sp171',name:'James Rodríguez',     equipo:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'MED', caps:104, rating:84},
  {id:'sp172',name:'Wilmar Barrios',      equipo:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'MED', caps:62,  rating:79},
  {id:'sp173',name:'Mateus Uribe',        equipo:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'MED', caps:58,  rating:79},
  {id:'sp174',name:'Luis Díaz',           equipo:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'DEL', caps:42,  rating:86},
  {id:'sp175',name:'Falcao García',       equipo:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'DEL', caps:109, rating:79},
  {id:'sp176',name:'Rafael Santos Borré', equipo:'Colombia',  flag:'🇨🇴', goals:0,assists:0, pos:'DEL', caps:44,  rating:80},
  
  {id:'sp177',name:'Edouard Mendy',       equipo:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'POR', caps:54,  rating:83},
  {id:'sp178',name:'Youssouf Sabaly',     equipo:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'DEF', caps:40,  rating:79},
  {id:'sp179',name:'Kalidou Koulibaly',   equipo:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'DEF', caps:92,  rating:85},
  {id:'sp180',name:'Abdou Diallo',        equipo:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'DEF', caps:38,  rating:80},
  {id:'sp181',name:'Formose Mendy',       equipo:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'DEF', caps:22,  rating:77},
  {id:'sp182',name:'Idrissa Gueye',       equipo:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'MED', caps:88,  rating:82},
  {id:'sp183',name:'Nampalys Mendy',      equipo:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'MED', caps:46,  rating:78},
  {id:'sp184',name:'Ismaïla Sarr',        equipo:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'DEL', caps:52,  rating:82},
  {id:'sp185',name:'Sadio Mané',          equipo:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'DEL', caps:99,  rating:84},
  {id:'sp186',name:'Famara Diédhiou',     equipo:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'DEL', caps:44,  rating:79},
  {id:'sp187',name:'Boulaye Dia',         equipo:'Senegal',   flag:'🇸🇳', goals:0,assists:0, pos:'DEL', caps:22,  rating:80},
  
  {id:'sp188',name:'Maxime Crépeau',      equipo:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'POR', caps:36,  rating:79},
  {id:'sp189',name:'Richie Laryea',       equipo:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'DEF', caps:40,  rating:78},
  {id:'sp190',name:'Steven Vitória',      equipo:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'DEF', caps:30,  rating:78},
  {id:'sp191',name:'Derek Cornelius',     equipo:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'DEF', caps:24,  rating:77},
  {id:'sp192',name:'Alphonso Davies',     equipo:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'DEF', caps:55,  rating:86},
  {id:'sp193',name:'Stephen Eustáquio',   equipo:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'MED', caps:38,  rating:80},
  {id:'sp194',name:'Atiba Hutchinson',    equipo:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'MED', caps:104, rating:78},
  {id:'sp195',name:'Samuel Piette',       equipo:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'MED', caps:52,  rating:77},
  {id:'sp196',name:'Cyle Larin',          equipo:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'DEL', caps:60,  rating:80},
  {id:'sp197',name:'Jonathan David',      equipo:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'DEL', caps:36,  rating:84},
  {id:'sp198',name:'Tajon Buchanan',      equipo:'Canadá',    flag:'🇨🇦', goals:0,assists:0, pos:'DEL', caps:34,  rating:80},
  
  {id:'sp199',name:'Yann Sommer',         equipo:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'POR', caps:94,  rating:85},
  {id:'sp200',name:'Silvan Widmer',       equipo:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'DEF', caps:44,  rating:80},
  {id:'sp201',name:'Manuel Akanji',       equipo:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'DEF', caps:52,  rating:84},
  {id:'sp202',name:'Fabian Schär',        equipo:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'DEF', caps:78,  rating:82},
  {id:'sp203',name:'Ricardo Rodríguez',   equipo:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'DEF', caps:96,  rating:81},
  {id:'sp204',name:'Granit Xhaka',        equipo:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'MED', caps:128, rating:83},
  {id:'sp205',name:'Remo Freuler',        equipo:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'MED', caps:58,  rating:81},
  {id:'sp206',name:'Xherdan Shaqiri',     equipo:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'DEL', caps:112, rating:81},
  {id:'sp207',name:'Ruben Vargas',        equipo:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'DEL', caps:32,  rating:80},
  {id:'sp208',name:'Breel Embolo',        equipo:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'DEL', caps:52,  rating:81},
  {id:'sp209',name:'Haris Seferovic',     equipo:'Suiza',     flag:'🇨🇭', goals:0,assists:0, pos:'DEL', caps:88,  rating:79},
  
  {id:'sp210',name:'Dominik Livaković',   equipo:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'POR', caps:48,  rating:84},
  {id:'sp211',name:'Josip Juranović',     equipo:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'DEF', caps:48,  rating:80},
  {id:'sp212',name:'Domagoj Vida',        equipo:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'DEF', caps:104, rating:79},
  {id:'sp213',name:'Joško Gvardiol',      equipo:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'DEF', caps:38,  rating:85},
  {id:'sp214',name:'Borna Sosa',          equipo:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'DEF', caps:28,  rating:80},
  {id:'sp215',name:'Luka Modrić',         equipo:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'MED', caps:179, rating:87},
  {id:'sp216',name:'Mateo Kovačić',       equipo:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'MED', caps:99,  rating:85},
  {id:'sp217',name:'Marcelo Brozović',    equipo:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'MED', caps:89,  rating:83},
  {id:'sp218',name:'Ivan Perišić',        equipo:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'DEL', caps:123, rating:82},
  {id:'sp219',name:'Andrej Kramarić',     equipo:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'DEL', caps:82,  rating:82},
  {id:'sp220',name:'Bruno Petković',      equipo:'Croacia',   flag:'🇭🇷', goals:0,assists:0, pos:'DEL', caps:42,  rating:79},
  
  {id:'sp221',name:'Kasper Schmeichel',   equipo:'Dinamarca', flag:'🇩🇰', goals:0,assists:0, pos:'POR', caps:92,  rating:83},
  {id:'sp222',name:'Henrik Dalsgaard',    equipo:'Dinamarca', flag:'🇩🇰', goals:0,assists:0, pos:'DEF', caps:50,  rating:78},
  {id:'sp223',name:'Andreas Christensen', equipo:'Dinamarca', flag:'🇩🇰', goals:0,assists:0, pos:'DEF', caps:60,  rating:84},
  {id:'sp224',name:'Joachim Andersen',    equipo:'Dinamarca', flag:'🇩🇰', goals:0,assists:0, pos:'DEF', caps:36,  rating:82},
  {id:'sp225',name:'Joakim Maehle',       equipo:'Dinamarca', flag:'🇩🇰', goals:0,assists:0, pos:'DEF', caps:44,  rating:80},
  {id:'sp226',name:'Christian Eriksen',   equipo:'Dinamarca', flag:'🇩🇰', goals:0,assists:0, pos:'MED', caps:131, rating:84},
  {id:'sp227',name:'Pierre-Emile Højbjerg',equipo:'Dinamarca',flag:'🇩🇰', goals:0,assists:0, pos:'MED', caps:78,  rating:82},
  {id:'sp228',name:'Thomas Delaney',      equipo:'Dinamarca', flag:'🇩🇰', goals:0,assists:0, pos:'MED', caps:72,  rating:80},
  {id:'sp229',name:'Mikkel Damsgaard',    equipo:'Dinamarca', flag:'🇩🇰', goals:0,assists:0, pos:'DEL', caps:30,  rating:81},
  {id:'sp230',name:'Jonas Wind',          equipo:'Dinamarca', flag:'🇩🇰', goals:0,assists:0, pos:'DEL', caps:22,  rating:79},
  {id:'sp231',name:'Kasper Dolberg',      equipo:'Dinamarca', flag:'🇩🇰', goals:0,assists:0, pos:'DEL', caps:40,  rating:79},
  
  {id:'sp232',name:'Francis Uzoho',       equipo:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'POR', caps:32,  rating:78},
  {id:'sp233',name:'Ola Aina',            equipo:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'DEF', caps:44,  rating:79},
  {id:'sp234',name:'William Troost-Ekong',equipo:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'DEF', caps:62,  rating:80},
  {id:'sp235',name:'Leon Balogun',        equipo:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'DEF', caps:58,  rating:78},
  {id:'sp236',name:'Zaidu Sanusi',        equipo:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'DEF', caps:24,  rating:77},
  {id:'sp237',name:'Wilfried Ndidi',      equipo:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'MED', caps:65,  rating:81},
  {id:'sp238',name:'Joe Aribo',           equipo:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'MED', caps:40,  rating:79},
  {id:'sp239',name:'Frank Onyeka',        equipo:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'MED', caps:30,  rating:78},
  {id:'sp240',name:'Victor Osimhen',      equipo:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'DEL', caps:32,  rating:86},
  {id:'sp241',name:'Samuel Chukwueze',    equipo:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'DEL', caps:44,  rating:81},
  {id:'sp242',name:'Kelechi Iheanacho',   equipo:'Nigeria',   flag:'🇳🇬', goals:0,assists:0, pos:'DEL', caps:52,  rating:79},
  
  {id:'sp243',name:'Pedro Gallese',       equipo:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'POR', caps:68,  rating:80},
  {id:'sp244',name:'Luis Advíncula',      equipo:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'DEF', caps:94,  rating:79},
  {id:'sp245',name:'Alexander Callens',   equipo:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'DEF', caps:42,  rating:78},
  {id:'sp246',name:'Carlos Zambrano',     equipo:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'DEF', caps:84,  rating:78},
  {id:'sp247',name:'Miguel Trauco',       equipo:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'DEF', caps:62,  rating:77},
  {id:'sp248',name:'Renato Tapia',        equipo:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'MED', caps:72,  rating:79},
  {id:'sp249',name:'Sergio Peña',         equipo:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'MED', caps:38,  rating:78},
  {id:'sp250',name:'Yoshimar Yotún',      equipo:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'MED', caps:98,  rating:77},
  {id:'sp251',name:'André Carrillo',      equipo:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'DEL', caps:102, rating:78},
  {id:'sp252',name:'Paolo Guerrero',      equipo:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'DEL', caps:108, rating:77},
  {id:'sp253',name:'Edison Flores',       equipo:'Perú',      flag:'🇵🇪', goals:0,assists:0, pos:'DEL', caps:76,  rating:78},
  
  {id:'sp254',name:'Hernán Galíndez',     equipo:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'POR', caps:30,  rating:79},
  {id:'sp255',name:'Angelo Preciado',     equipo:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'DEF', caps:38,  rating:78},
  {id:'sp256',name:'Piero Hincapié',      equipo:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'DEF', caps:34,  rating:82},
  {id:'sp257',name:'William Pacho',       equipo:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'DEF', caps:22,  rating:81},
  {id:'sp258',name:'Pervis Estupiñán',    equipo:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'DEF', caps:44,  rating:82},
  {id:'sp259',name:'Carlos Gruezo',       equipo:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'MED', caps:52,  rating:78},
  {id:'sp260',name:'Moisés Caicedo',      equipo:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'MED', caps:40,  rating:85},
  {id:'sp261',name:'Jhegson Méndez',      equipo:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'MED', caps:34,  rating:78},
  {id:'sp262',name:'Enner Valencia',      equipo:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'DEL', caps:87,  rating:82},
  {id:'sp263',name:'Jeremy Sarmiento',    equipo:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'DEL', caps:24,  rating:79},
  {id:'sp264',name:'Gonzalo Plata',       equipo:'Ecuador',   flag:'🇪🇨', goals:0,assists:0, pos:'DEL', caps:36,  rating:79},
  
  {id:'sp265',name:'Mat Ryan',            equipo:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'POR', caps:82,  rating:80},
  {id:'sp266',name:'Nathaniel Atkinson',  equipo:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'DEF', caps:24,  rating:76},
  {id:'sp267',name:'Harry Souttar',       equipo:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'DEF', caps:26,  rating:79},
  {id:'sp268',name:'Kye Rowles',          equipo:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'DEF', caps:18,  rating:76},
  {id:'sp269',name:'Milos Degenek',       equipo:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'DEF', caps:50,  rating:76},
  {id:'sp270',name:'Aaron Mooy',          equipo:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'MED', caps:86,  rating:79},
  {id:'sp271',name:'Jackson Irvine',      equipo:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'MED', caps:58,  rating:78},
  {id:'sp272',name:'Riley McGree',        equipo:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'MED', caps:26,  rating:77},
  {id:'sp273',name:'Mathew Leckie',       equipo:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'DEL', caps:90,  rating:78},
  {id:'sp274',name:'Mitchell Duke',       equipo:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'DEL', caps:40,  rating:76},
  {id:'sp275',name:'Craig Goodwin',       equipo:'Australia', flag:'🇦🇺', goals:0,assists:0, pos:'DEL', caps:30,  rating:76},
  
  {id:'sp276',name:'Alireza Beiranvand',  equipo:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'POR', caps:62,  rating:80},
  {id:'sp277',name:'Sadegh Moharrami',    equipo:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'DEF', caps:44,  rating:77},
  {id:'sp278',name:'Majid Hosseini',      equipo:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'DEF', caps:38,  rating:78},
  {id:'sp279',name:'Milad Mohammadi',     equipo:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'DEF', caps:58,  rating:77},
  {id:'sp280',name:'Ramin Rezaeian',      equipo:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'DEF', caps:72,  rating:77},
  {id:'sp281',name:'Saeid Ezatolahi',     equipo:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'MED', caps:58,  rating:78},
  {id:'sp282',name:'Ali Gholizadeh',      equipo:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'MED', caps:44,  rating:78},
  {id:'sp283',name:'Ahmad Nourollahi',    equipo:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'MED', caps:50,  rating:77},
  {id:'sp284',name:'Sardar Azmoun',       equipo:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'DEL', caps:68,  rating:80},
  {id:'sp285',name:'Mehdi Taremi',        equipo:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'DEL', caps:78,  rating:82},
  {id:'sp286',name:'Alireza Jahanbakhsh', equipo:'Irán',      flag:'🇮🇷', goals:0,assists:0, pos:'DEL', caps:90,  rating:79},
  
  {id:'sp287',name:'Mohammed Al-Owais',   equipo:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'POR', caps:56, rating:80},
  {id:'sp288',name:'Saud Abdulhamid',     equipo:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'DEF', caps:48, rating:78},
  {id:'sp289',name:'Ali Al-Bulaihi',      equipo:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'DEF', caps:52, rating:77},
  {id:'sp290',name:'Abdulelah Al-Amri',   equipo:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'DEF', caps:38, rating:77},
  {id:'sp291',name:'Yasser Al-Shahrani',  equipo:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'DEF', caps:74, rating:78},
  {id:'sp292',name:'Salman Al-Faraj',     equipo:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'MED', caps:88, rating:79},
  {id:'sp293',name:'Mohammed Kanno',      equipo:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'MED', caps:44, rating:78},
  {id:'sp294',name:'Hatan Bahbir',        equipo:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'MED', caps:28, rating:76},
  {id:'sp295',name:'Salem Al-Dawsari',    equipo:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'DEL', caps:89, rating:78},
  {id:'sp296',name:'Firas Al-Buraikan',   equipo:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'DEL', caps:38, rating:77},
  {id:'sp297',name:'Abdullah Al-Hamdan',  equipo:'Arabia Saudita',flag:'🇸🇦', goals:0,assists:0, pos:'DEL', caps:28, rating:77},
  
  {id:'sp298',name:'Lawrence Ati-Zigi',   equipo:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'POR', caps:32,  rating:79},
  {id:'sp299',name:'Andrew Ayew',         equipo:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'DEF', caps:76,  rating:78},
  {id:'sp300',name:'Alexander Djiku',     equipo:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'DEF', caps:36,  rating:78},
  {id:'sp301',name:'Daniel Amartey',      equipo:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'DEF', caps:46,  rating:78},
  {id:'sp302',name:'Gideon Mensah',       equipo:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'DEF', caps:22,  rating:76},
  {id:'sp303',name:'Thomas Partey',       equipo:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'MED', caps:58,  rating:83},
  {id:'sp304',name:'Baba Iddrisu',        equipo:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'MED', caps:28,  rating:77},
  {id:'sp305',name:'Mubarak Wakaso',      equipo:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'MED', caps:90,  rating:77},
  {id:'sp306',name:'Jordan Ayew',         equipo:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'DEL', caps:90,  rating:78},
  {id:'sp307',name:'Mohammed Kudus',      equipo:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'DEL', caps:30,  rating:82},
  {id:'sp308',name:'Inaki Williams',      equipo:'Ghana',     flag:'🇬🇭', goals:0,assists:0, pos:'DEL', caps:14,  rating:80},
  
  {id:'sp309',name:'Ronwen Williams',     equipo:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'POR', caps:38,  rating:79},
  {id:'sp310',name:'Sifiso Hlanti',       equipo:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'DEF', caps:30,  rating:76},
  {id:'sp311',name:'Rushine de Reuck',    equipo:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'DEF', caps:30,  rating:76},
  {id:'sp312',name:'Mothobi Mvala',       equipo:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'DEF', caps:24,  rating:76},
  {id:'sp313',name:'Siyanda Xulu',        equipo:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'DEF', caps:22,  rating:75},
  {id:'sp314',name:'Bongani Zungu',       equipo:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'MED', caps:42,  rating:77},
  {id:'sp315',name:'Ethan Ntseki',        equipo:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'MED', caps:18,  rating:75},
  {id:'sp316',name:'Themba Zwane',        equipo:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'MED', caps:36,  rating:77},
  {id:'sp317',name:'Percy Tau',           equipo:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'DEL', caps:62,  rating:77},
  {id:'sp318',name:'Lyle Foster',         equipo:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'DEL', caps:18,  rating:77},
  {id:'sp319',name:'Evidence Makgopa',    equipo:'Sudáfrica', flag:'🇿🇦', goals:0,assists:0, pos:'DEL', caps:14,  rating:76},
];

const Stats = {
  _currentTab: 'equipos',
  _lastQuery: '',

  async renderizar(tab = 'equipos') {
    this._currentTab = tab;
    
    const input = document.getElementById('search-input');
    if (input && this._lastQuery) input.value = this._lastQuery;
    const content = document.getElementById('stats-content');
    if (!content) return;
    content.innerHTML = '<div class="spinner"></div>';
    try {
      
      const q = this._lastQuery;
      if (tab === 'equipos')   await this.renderTeams(content, q);
      if (tab === 'jugadores') await this.renderPlayers(content, q);
      if (tab === 'grupos')  await this.renderGroups(content);
    } catch(err) {
      console.error('[Stats.renderizar]', err);
      content.innerHTML = '<p class="empty-state" style="color:var(--text-muted)">Error al cargar datos. Intenta de nuevo.</p>';
    }
  },

  async renderTeams(contenedor, query = '') {
    let equipos = await API.getTeams(query);
    
    if (!equipos || equipos.length === 0) {
      equipos = await API.getTeams(query); 
    }
    equipos = [...equipos].sort((a, b) => {
      const ptsBolsa = a.pts ?? 0, ptsB = b.pts ?? 0;
      if (ptsB !== ptsBolsa) return ptsB - ptsBolsa;
      const dgA = (a.gf ?? 0) - (a.gc ?? 0);
      const dgB = (b.gf ?? 0) - (b.gc ?? 0);
      if (dgB !== dgA) return dgB - dgA;
      const wA = a.w ?? 0, wB = b.w ?? 0;
      if (wB !== wA) return wB - wA;
      return (b.gf ?? 0) - (a.gf ?? 0);
    });
    const usuario    = await Auth.currentUser();
    const idsFavoritos  = new Set((usuario?.favoritos || []).map(f => f.id));

    contenedor.innerHTML = `
      <div class="stats-table-wrap">
        <table class="stats-table">
          <encabezadoTabla><tr>
            <th>#</th><th>Equipo</th><th>PJ</th>
            <th>W</th><th>D</th><th>L</th>
            <th>GF</th><th>GC</th><th>Pts</th><th></th>
          </tr></encabezadoTabla>
          <cuerpoTabla>
            ${equipos.map((t, i) => `
              <tr>
                <td class="text-muted">${i+1}</td>
                <td><span class="equipo-flag">${t.flag||'🏳️'}</span>${t.name}</td>
                <td>${t.pj??0}</td>
                <td class="stat-w">${t.w??0}</td>
                <td class="text-muted">${t.d??0}</td>
                <td class="stat-l">${t.l??0}</td>
                <td>${t.gf??0}</td>
                <td>${t.gc??0}</td>
                <td class="stat-pts">${t.pts??0}</td>
                <td>
                  <button class="fav-btn ${idsFavoritos.has(t.id)?'active':''}"
                    data-id="${t.id}" data-name="${t.name.replace(/'/g, '&#39;')}"
                    data-flag="${t.flag||''}" data-tipo="equipo">
                    ${idsFavoritos.has(t.id)?'★':'☆'}
                  </button>
                </td>
              </tr>`).join('')}
          </cuerpoTabla>
        </table>
      </div>`;

    contenedor.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const esFavorito = await Profile.isFavorite(btn.dataset.id, 'equipo'); 
        if (esFavorito) {
          await Profile.removeFavorite(btn.dataset.id, 'equipo');
          btn.textContent = '☆'; btn.classList.remove('active');
        } else {
          await Profile.addFavorite({id:btn.dataset.id,name:btn.dataset.name,flag:btn.dataset.flag},'equipo');
          btn.textContent = '★'; btn.classList.add('active');
        }
      });
    });
  },

  async renderPlayers(contenedor, query = '') {
    
    
    let combinados = [...TODOS_JUGADORES];
    try {
      const jugadoresApi = await API.getPlayers('');
      if (jugadoresApi && jugadoresApi.length > 0) {
        const todosNombres = new Set(TODOS_JUGADORES.map(p => p.name.toLowerCase()));
        for (const p of jugadoresApi) {
          if (!todosNombres.has(p.name.toLowerCase())) combinados.push(p);
        }
        
        jugadoresApi.forEach(ap => {
          const existente = combinados.find(p => p.name.toLowerCase() === ap.name.toLowerCase());
          if (existente && (ap.goals > 0 || ap.assists > 0)) {
            existente.goals   = ap.goals;
            existente.assists = ap.assists;
          }
        });
      }
    } catch(_) {  }
    
    const q       = query.toLowerCase();
    const jugadores = q
      ? combinados.filter(p => p.name.toLowerCase().includes(q) || coincideBusqueda(p.equipo, query))
      : combinados;

    const usuario    = await Auth.currentUser();
    const idsFavoritos  = new Set((usuario?.favoritos || []).map(f => f.id));

    if (!jugadores.length) {
      contenedor.innerHTML = '<p class="empty-state">No se encontraron jugadores.</p>';
      return;
    }

    contenedor.innerHTML = `
      <div class="stats-table-wrap">
        <table class="stats-table">
          <encabezadoTabla><tr>
            <th>Jugador</th><th>Equipo</th><th>Pos</th>
            <th>⚽</th><th>🅰️</th><th>Caps</th><th></th>
          </tr></encabezadoTabla>
          <cuerpoTabla>
            ${jugadores.map(p => `
              <tr>
                <td style="font-weight:600">${p.name}</td>
                <td><span class="equipo-flag">${p.flag||'🏳️'}</span>${p.equipo}</td>
                <td><span class="pos-insignia">${p.pos}</span></td>
                <td class="stat-w">${p.goals??0}</td>
                <td style="color:var(--rare)">${p.assists??0}</td>
                <td class="text-muted">${p.caps??0}</td>
                <td>
                  <button class="fav-btn ${idsFavoritos.has(p.id)?'active':''}"
                    data-id="${p.id}" data-name="${p.name.replace(/'/g, '&#39;')}"
                    data-flag="${p.flag||''}" data-tipo="player">
                    ${idsFavoritos.has(p.id)?'★':'☆'}
                  </button>
                </td>
              </tr>`).join('')}
          </cuerpoTabla>
        </table>
      </div>`;

    contenedor.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const esFavorito = await Profile.isFavorite(btn.dataset.id, 'player'); 
        if (esFavorito) {
          await Profile.removeFavorite(btn.dataset.id, 'player');
          btn.textContent = '☆'; btn.classList.remove('active');
        } else {
          await Profile.addFavorite({id:btn.dataset.id,name:btn.dataset.name,flag:btn.dataset.flag},'player');
          btn.textContent = '★'; btn.classList.add('active');
        }
      });
    });
  },

  async renderScorers(contenedor) {
    const goleadores = await API.getTopScorers();
    contenedor.innerHTML = `
      <div class="stats-table-wrap">
        <table class="stats-table">
          <encabezadoTabla><tr><th>#</th><th>Jugador</th><th>Equipo</th><th>⚽</th><th>🅰️</th></tr></encabezadoTabla>
          <cuerpoTabla>
            ${goleadores.map((p,i) => `
              <tr>
                <td style="font-family:'Bebas Neue',cursive;font-size:1.2rem;
                  color:${i===0?'var(--gold)':i===1?'#c0c0c0':i===2?'#cd7f32':'var(--text-muted)'}">${i+1}</td>
                <td style="font-weight:600">${p.name}</td>
                <td><span class="equipo-flag">${p.flag||'🏳️'}</span>${p.equipo}</td>
                <td style="color:var(--gold);font-family:'Bebas Neue',cursive;font-size:1.2rem">${p.goals}</td>
                <td style="color:var(--rare)">${p.assists??0}</td>
              </tr>`).join('')}
          </cuerpoTabla>
        </table>
      </div>`;
  },

  
  async renderGroups(contenedor) {
    contenedor.innerHTML = '<div class="spinner"></div>';
    try {
      const grupos = await API.getAllGroups();
      const clavesGrupo = Object.keys(grupos).sort();
      if (!clavesGrupo.length) {
        contenedor.innerHTML = '<p class="empty-state">No hay datos de grupos disponibles.</p>';
        return;
      }
      contenedor.innerHTML = '<div class="grupos-grid">' + clavesGrupo.map(g => {
        const equipos = grupos[g];
        return `
          <div class="group-table-wrap">
            <div class="group-table-title">Grupo ${g}</div>
            <table class="stats-table" style="font-size:0.72rem">
              <encabezadoTabla><tr>
                <th>#</th><th>Equipo</th><th>PJ</th>
                <th style="color:#44ff88">V</th><th>E</th><th style="color:#ff4466">D</th>
                <th>GF</th><th>GC</th><th style="color:var(--gold)">Pts</th>
              </tr></encabezadoTabla>
              <cuerpoTabla>
                ${equipos.map((t, i) => `
                  <tr style="${i < 2 ? 'border-left:2px solid var(--accent)' : ''}">
                    <td class="text-muted" style="font-size:0.8rem">${i+1}</td>
                    <td><span class="equipo-flag">${t.flag||'🏳️'}</span>${t.equipo}</td>
                    <td>${t.pj||0}</td>
                    <td style="color:#44ff88">${t.w||0}</td>
                    <td class="text-muted">${t.d||0}</td>
                    <td style="color:#ff4466">${t.l||0}</td>
                    <td>${t.gf||0}</td>
                    <td>${t.gc||0}</td>
                    <td style="color:var(--gold);font-weight:700">${t.pts||0}</td>
                  </tr>`).join('')}
              </cuerpoTabla>
            </table>
            <div style="font-size:0.6rem;color:var(--text-muted);padding:2px 4px;margin-top:2px">
              ─ Clasifican al R32
            </div>
          </div>`;
      }).join('') + '</div>';
    } catch(err) {
      contenedor.innerHTML = '<p class="empty-state" style="color:var(--text-muted)">Error al cargar grupos.</p>';
    }
  },

  async search(query) {
    this._lastQuery = query;
    const content = document.getElementById('stats-content');
    if (!content) return;
    content.innerHTML = '<div class="spinner"></div>';
    if (this._currentTab === 'equipos')   await this.renderTeams(content, query);
    if (this._currentTab === 'jugadores') await this.renderPlayers(content, query);
    if (this._currentTab === 'grupos')  await this.renderGroups(content);
  },

  findPlayer(name) {
    const q = name.toLowerCase();
    return TODOS_JUGADORES.find(p => p.name.toLowerCase().includes(q)) || null;
  }
};
