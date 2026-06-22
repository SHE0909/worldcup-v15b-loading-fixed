const DB_NAME    = 'WCCollectorUES';
const DB_VERSION = 3;

let _db     = null;
let _dbProm = null; 

const DB = {
  open() {
    if (_db)     return Promise.resolve(_db);
    if (_dbProm) return _dbProm;

    _dbProm = new Promise((resolve, reject) => {
      let req;
      try {
        req = indexedDB.open(DB_NAME, DB_VERSION);
      } catch(e) {
        _dbProm = null;
        reject(e);
        return;
      }

      
      const timeout = setTimeout(() => {
        _dbProm = null;
        reject(new Error('IndexedDB timeout — puede haber otra pestaña bloqueando'));
      }, 8000);

      req.onblocked = () => {
        
        
        console.warn('DB bloqueada por otra pestaña — esperando...');
      };

      req.onupgradeneeded = (e) => {
        const db  = e.target.result;
        const old = e.oldVersion;

        
        db.onerror = (ev) => console.error('DB upgrade error:', ev);

        const ensure = (name, opts, indexFn) => {
          if (!db.objectStoreNames.contains(name)) {
            const store = db.createObjectStore(name, opts);
            if (indexFn) indexFn(store);
          }
        };

        
        ensure('users',       { keyPath: 'email' }, s => s.createIndex('email','email',{unique:true}));
        ensure('session',     { keyPath: 'key' });
        ensure('figuritas',   { keyPath: 'id'  },   s => s.createIndex('rareza','rareza',{unique:false}));
        ensure('predicciones',{ keyPath: 'matchId' });
        ensure('favoritos',   { keyPath: 'id'  },   s => s.createIndex('tipo','tipo',{unique:false}));
        ensure('stats_cache', { keyPath: 'key' });

        
        ensure('equipo_ideal', { keyPath: 'email' });
        ensure('activity_log', { keyPath: 'id', autoIncrement: true }, s => {
          s.createIndex('email',     'email',     { unique: false });
          s.createIndex('timestamp', 'timestamp', { unique: false });
        });

        
        ensure('photo_cache', { keyPath: 'id' });
      };

      req.onsuccess = (e) => {
        clearTimeout(timeout);
        _db = e.target.result;
        
        _db.onclose        = () => { _db = null; _dbProm = null; };
        _db.onversionchange = () => { _db.close(); _db = null; _dbProm = null; };
        resolve(_db);
      };

      req.onerror = (e) => {
        clearTimeout(timeout);
        _dbProm = null;
        console.error('IndexedDB error:', e.target.error);
        reject(e.target.error);
      };
    });

    return _dbProm;
  },

  
  async resetDB() {
    _db     = null;
    _dbProm = null;
    return new Promise((res, rej) => {
      const req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = () => res();
      req.onerror   = () => rej(req.error);
      req.onblocked = () => { res(); }; 
    });
  },

  
  async put(store, value) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const tx  = db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).put(value);
      req.onsuccess = () => res(req.result);
      req.onerror   = () => rej(req.error);
    });
  },

  async get(store, key) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const tx  = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => res(req.result);
      req.onerror   = () => rej(req.error);
    });
  },

  async getAll(store) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const tx  = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => res(req.result);
      req.onerror   = () => rej(req.error);
    });
  },

  async getAllByIndex(store, indexName, value) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const tx  = db.transaction(store, 'readonly');
      const idx = tx.objectStore(store).index(indexName);
      const req = idx.getAll(value);
      req.onsuccess = () => res(req.result);
      req.onerror   = () => rej(req.error);
    });
  },

  async delete(store, key) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const tx  = db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).delete(key);
      req.onsuccess = () => res();
      req.onerror   = () => rej(req.error);
    });
  },

  async clear(store) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const tx  = db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).clear();
      req.onsuccess = () => res();
      req.onerror   = () => rej(req.error);
    });
  },

  
  async getSession()      { const r = await this.get('session','current'); return r?.email || null; },
  async setSession(email) { await this.put('session', { key:'current', email }); },
  async clearSession()    { await this.delete('session','current'); },

  
  async getUser(email)  { return await this.get('users', email); },
  async saveUser(user)  { return await this.put('users', user); },

  
  async getCacheStats(key) {
    const row = await this.get('stats_cache', key);
    if (!row) return null;
    if (Date.now() - row.timestamp > 30 * 60 * 1000) return null; 
    return row.data;
  },
  async setCacheStats(key, data) {
    await this.put('stats_cache', { key, data, timestamp: Date.now() });
  },

  
  async getEquipoIdeal(email) {
    const row = await this.get('equipo_ideal', email);
    return row?.slots || {};
  },
  async saveEquipoIdeal(email, slots) {
    await this.put('equipo_ideal', { email, slots });
  },

  
  async logActivity(email, type, detail = '') {
    try {
      await this.put('activity_log', {
        email, type, detail,
        timestamp: Date.now()
      });
    } catch(_) {  }
  },

  async getRecentActivity(email, limit = 10) {
    const all = await this.getAllByIndex('activity_log', 'email', email);
    return all.sort((a,b) => b.timestamp - a.timestamp).slice(0, limit);
  },

  
  async countOwnedFiguritas(email) {
    const user = await this.getUser(email);
    return (user?.figuritas || []).length;
  }
};
