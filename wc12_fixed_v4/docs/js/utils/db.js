/**
 * db.js — IndexedDB wrapper para World Cup Collector UES
 * v3: photo_cache store para fotos persistentes
 */

const DB_NAME    = 'WCCollectorUES';
const DB_VERSION = 3;

let _db     = null;
let _dbProm = null; // evita abrir múltiples veces en paralelo

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

      // Timeout de seguridad: si tarda más de 8s algo está muy mal
      const timeout = setTimeout(() => {
        _dbProm = null;
        reject(new Error('IndexedDB timeout — puede haber otra pestaña bloqueando'));
      }, 8000);

      req.onblocked = () => {
        // Otra pestaña tiene la BD abierta con versión anterior
        // Cerramos esa conexión y esperamos
        console.warn('DB bloqueada por otra pestaña — esperando...');
      };

      req.onupgradeneeded = (e) => {
        const db  = e.target.result;
        const old = e.oldVersion;

        // Capturar errores dentro del upgrade para no dejar la BD corrupta
        db.onerror = (ev) => console.error('DB upgrade error:', ev);

        const ensure = (name, opts, indexFn) => {
          if (!db.objectStoreNames.contains(name)) {
            const store = db.createObjectStore(name, opts);
            if (indexFn) indexFn(store);
          }
        };

        // Stores base (v1)
        ensure('users',       { keyPath: 'email' }, s => s.createIndex('email','email',{unique:true}));
        ensure('session',     { keyPath: 'key' });
        ensure('figuritas',   { keyPath: 'id'  },   s => s.createIndex('rareza','rareza',{unique:false}));
        ensure('predicciones',{ keyPath: 'matchId' });
        ensure('favoritos',   { keyPath: 'id'  },   s => s.createIndex('tipo','tipo',{unique:false}));
        ensure('stats_cache', { keyPath: 'key' });

        // v2 stores
        ensure('equipo_ideal', { keyPath: 'email' });
        ensure('activity_log', { keyPath: 'id', autoIncrement: true }, s => {
          s.createIndex('email',     'email',     { unique: false });
          s.createIndex('timestamp', 'timestamp', { unique: false });
        });

        // v3 store — caché de fotos (nunca falla porque tiene ensure)
        ensure('photo_cache', { keyPath: 'id' });
      };

      req.onsuccess = (e) => {
        clearTimeout(timeout);
        _db = e.target.result;
        // Si la BD se cierra inesperadamente, limpiar la referencia
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

  /* Borra y recrea la BD — SOLO usar en caso de error crítico */
  async resetDB() {
    _db     = null;
    _dbProm = null;
    return new Promise((res, rej) => {
      const req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = () => res();
      req.onerror   = () => rej(req.error);
      req.onblocked = () => { res(); }; // continuar aunque esté bloqueada
    });
  },

  /* ── CRUD genérico ── */
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

  /* ── Sesión ── */
  async getSession()      { const r = await this.get('session','current'); return r?.email || null; },
  async setSession(email) { await this.put('session', { key:'current', email }); },
  async clearSession()    { await this.delete('session','current'); },

  /* ── Usuario ── */
  async getUser(email)  { return await this.get('users', email); },
  async saveUser(user)  { return await this.put('users', user); },

  /* ── Cache de stats (TTL: 5 min) ── */
  async getCacheStats(key) {
    const row = await this.get('stats_cache', key);
    if (!row) return null;
    if (Date.now() - row.timestamp > 30 * 60 * 1000) return null; // BUG FIX: TTL ampliado a 30 min (antes 5)
    return row.data;
  },
  async setCacheStats(key, data) {
    await this.put('stats_cache', { key, data, timestamp: Date.now() });
  },

  /* ── Equipo ideal ── */
  async getEquipoIdeal(email) {
    const row = await this.get('equipo_ideal', email);
    return row?.slots || {};
  },
  async saveEquipoIdeal(email, slots) {
    await this.put('equipo_ideal', { email, slots });
  },

  /* ── Log de actividad ── */
  async logActivity(email, type, detail = '') {
    try {
      await this.put('activity_log', {
        email, type, detail,
        timestamp: Date.now()
      });
    } catch(_) { /* log no critico */ }
  },

  async getRecentActivity(email, limit = 10) {
    const all = await this.getAllByIndex('activity_log', 'email', email);
    return all.sort((a,b) => b.timestamp - a.timestamp).slice(0, limit);
  },

  /* ── Contar figuritas distintas obtenidas ── */
  async countOwnedFiguritas(email) {
    const user = await this.getUser(email);
    return (user?.figuritas || []).length;
  }
};
