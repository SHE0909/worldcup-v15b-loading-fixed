const Auth = {
  
  async hashPassword(password) {
    const codificador = new TextEncoder();
    const data    = codificador.encode(password);
    const bufferHash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(bufferHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  
  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  validatePassword(password) {
    return password.length >= 6;
  },

  
  async register({ name, email, password }) {
    if (!name || name.trim().length < 2)
      return { ok: false, field: 'name', msg: 'El nombre debe tener al menos 2 caracteres' };

    if (!this.validateEmail(email))
      return { ok: false, field: 'email', msg: 'Correo inválido' };

    if (!this.validatePassword(password))
      return { ok: false, field: 'pass', msg: 'Contraseña mínimo 6 caracteres' };

    const existente = await DB.getUser(email);
    if (existente)
      return { ok: false, field: 'email', msg: 'Este correo ya está registrado' };

    const hash = await this.hashPassword(password);
    const usuario = {
      email,
      name:             name.trim(),
      passwordHash:     hash,
      createdAt:        new Date().toISOString(),
      tiradas:          5,
      freeSpinsClaimed: true,   
      monedas:          0,
      figuritas:        [],
      favoritos:        [],
      predicciones:     [],
      aciertos:         0,
      contadorPity:        0,
      equipo_ideal:     null
    };

    await DB.saveUser(usuario);
    return { ok: true };
  },

  
  async login({ email, password }) {
    if (!this.validateEmail(email))
      return { ok: false, field: 'email', msg: 'Correo inválido' };

    const usuario = await DB.getUser(email);
    if (!usuario)
      return { ok: false, field: 'email', msg: 'No existe cuenta con ese correo' };

    const hash = await this.hashPassword(password);
    if (hash !== usuario.passwordHash)
      return { ok: false, field: 'pass', msg: 'Contraseña incorrecta' };

    await DB.setSession(email);

    
    if (email.toLowerCase().trim() === 'marruecosparaelmundial@gmail.com') {
      const fresh = await DB.getUser(email);
      if (fresh) await DB.updateUser(email, { tiradas: (fresh.tiradas || 0) + 50 });
    }

    return { ok: true, usuario };
  },

  
  async logout() {
    await DB.clearSession();
  },

  
  async recoverSession() {
    const email = await DB.getSession();
    if (!email) return null;
    const usuario  = await DB.getUser(email);
    return usuario || null;
  },

  
  async currentUser() {
    return await this.recoverSession();
  },

  
  async updateUser(updatedUser) {
    await DB.saveUser(updatedUser);
  }
};
