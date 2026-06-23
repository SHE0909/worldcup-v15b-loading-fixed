const NOMBRE_BD    = 'WCCollectorUES';
const VERSION_BD = 3;

let _bd     = null;
let _promBD = null; 

const DB = {
  open() {
    if (_bd)     return Promise.resolve(_bd);
    if (_promBD) return _promBD;

    _promBD = new Promise((resolve, reject) => {
      let solicitud;
      try {
        solicitud = indexedDB.open(NOMBRE_BD, VERSION_BD);
      } catch(e) {
        _promBD = null;
        reject(e);
        return;
      }

      
      const timeout = setTimeout(() => {
        _promBD = null;
        reject(new Error('IndexedDB timeout — puede haber otra pestaña bloqueando'));
      }, 8000);

      solicitud.onblocked = () => {
        
        
        console.warn('DB bloqueada por otra pestaña — esperando...');
      };

      solicitud.onupgradeneeded = (e) => {
        const db  = e.target.result;
        const old = e.oldVersion;

        
        db.onerror = (ev) => console.error('DB upgrade error:', ev);

        const asegurar = (name, opts, indexFn) => {
          if (!db.objectStoreNames.contains(name)) {
            const store = db.createObjectStore(name, opts);
            if (indexFn) indexFn(store);
          }
        };

        
        asegurar('users',       { keyPath: 'email' }, s => s.createIndex('email','email',{unique:true}));
        asegurar('session',     { keyPath: 'key' });
        asegurar('figuritas',   { keyPath: 'id'  },   s => s.createIndex('rareza','rareza',{unique:false}));
        asegurar('predicciones',{ keyPath: 'idPartido' });
        asegurar('favoritos',   { keyPath: 'id'  },   s => s.createIndex('tipo','tipo',{unique:false}));
        asegurar('stats_cache', { keyPath: 'key' });

        
        asegurar('equipo_ideal', { keyPath: 'email' });
        asegurar('activity_log', { keyPath: 'id', autoIncrement: true }, s => {
          s.createIndex('email',     'email',     { unique: false });
          s.createIndex('timestamp', 'timestamp', { unique: false });
        });

        
        asegurar('photo_cache', { keyPath: 'id' });
      };

      solicitud.onsuccess = (e) => {
        clearTimeout(timeout);
        _bd = e.target.result;
        
        _bd.onclose        = () => { _bd = null; _promBD = null; };
        _bd.onversionchange = () => { _bd.close(); _bd = null; _promBD = null; };
        resolve(_bd);
      };

      solicitud.onerror = (e) => {
        clearTimeout(timeout);
        _promBD = null;
        console.error('IndexedDB error:', e.target.error);
        reject(e.target.error);
      };
    });

    return _promBD;
  },

  
  async resetDB() {
    _bd     = null;
    _promBD = null;
    return new Promise((res, rej) => {
      const solicitud = indexedDB.deleteDatabase(NOMBRE_BD);
      solicitud.onsuccess = () => res();
      solicitud.onerror   = () => rej(solicitud.error);
      solicitud.onblocked = () => { res(); }; 
    });
  },

  
  async put(store, value) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const transaccion  = db.transaction(store, 'readwrite');
      const solicitud = transaccion.objectStore(store).put(value);
      solicitud.onsuccess = () => res(solicitud.result);
      solicitud.onerror   = () => rej(solicitud.error);
    });
  },

  async get(store, key) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const transaccion  = db.transaction(store, 'readonly');
      const solicitud = transaccion.objectStore(store).get(key);
      solicitud.onsuccess = () => res(solicitud.result);
      solicitud.onerror   = () => rej(solicitud.error);
    });
  },

  async getAll(store) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const transaccion  = db.transaction(store, 'readonly');
      const solicitud = transaccion.objectStore(store).getAll();
      solicitud.onsuccess = () => res(solicitud.result);
      solicitud.onerror   = () => rej(solicitud.error);
    });
  },

  async getAllByIndex(store, indexName, value) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const transaccion  = db.transaction(store, 'readonly');
      const idx = transaccion.objectStore(store).index(indexName);
      const solicitud = idx.getAll(value);
      solicitud.onsuccess = () => res(solicitud.result);
      solicitud.onerror   = () => rej(solicitud.error);
    });
  },

  async delete(store, key) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const transaccion  = db.transaction(store, 'readwrite');
      const solicitud = transaccion.objectStore(store).delete(key);
      solicitud.onsuccess = () => res();
      solicitud.onerror   = () => rej(solicitud.error);
    });
  },

  async clear(store) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const transaccion  = db.transaction(store, 'readwrite');
      const solicitud = transaccion.objectStore(store).clear();
      solicitud.onsuccess = () => res();
      solicitud.onerror   = () => rej(solicitud.error);
    });
  },

  
  async getSession()      { const r = await this.get('session','current'); return r?.email || null; },
  async setSession(email) { await this.put('session', { key:'current', email }); },
  async clearSession()    { await this.delete('session','current'); },

  
  async getUser(email)  { return await this.get('users', email); },
  async saveUser(usuario)  { return await this.put('users', usuario); },

  
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
    const usuario = await this.getUser(email);
    return (usuario?.figuritas || []).length;
  }
};
