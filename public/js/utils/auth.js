const Auth = {
  
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data    = encoder.encode(password);
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuf))
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

    const existing = await DB.getUser(email);
    if (existing)
      return { ok: false, field: 'email', msg: 'Este correo ya está registrado' };

    const hash = await this.hashPassword(password);
    const user = {
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
      pityCount:        0,
      equipo_ideal:     null
    };

    await DB.saveUser(user);
    return { ok: true };
  },

  
  async login({ email, password }) {
    if (!this.validateEmail(email))
      return { ok: false, field: 'email', msg: 'Correo inválido' };

    const user = await DB.getUser(email);
    if (!user)
      return { ok: false, field: 'email', msg: 'No existe cuenta con ese correo' };

    const hash = await this.hashPassword(password);
    if (hash !== user.passwordHash)
      return { ok: false, field: 'pass', msg: 'Contraseña incorrecta' };

    await DB.setSession(email);

    
    if (email.toLowerCase().trim() === 'marruecosparaelmundial@gmail.com') {
      const fresh = await DB.getUser(email);
      if (fresh) await DB.updateUser(email, { tiradas: (fresh.tiradas || 0) + 50 });
    }

    return { ok: true, user };
  },

  
  async logout() {
    await DB.clearSession();
  },

  
  async recoverSession() {
    const email = await DB.getSession();
    if (!email) return null;
    const user  = await DB.getUser(email);
    return user || null;
  },

  
  async currentUser() {
    return await this.recoverSession();
  },

  
  async updateUser(updatedUser) {
    await DB.saveUser(updatedUser);
  }
};
