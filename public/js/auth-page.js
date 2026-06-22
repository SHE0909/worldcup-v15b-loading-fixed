const splash = document.getElementById('splash');

async function init() {
  const safetyTimer = setTimeout(() => {
    console.warn('Init timeout — mostrando formulario de login');
    splash.classList.add('hidden');
    setTimeout(() => { if (splash.parentNode) splash.parentNode.removeChild(splash); }, 450);
  }, 6000);

  try {
    await DB.open();
    const user = await Auth.recoverSession();
    clearTimeout(safetyTimer);
    if (user) {
      window.location.replace('/app');
      return;
    }
  } catch(err) {
    console.error('Error al inicializar DB:', err);
    clearTimeout(safetyTimer);
    try { indexedDB.deleteDatabase('WCCollectorUES'); } catch(_) {}
  }

  splash.classList.add('hidden');
  setTimeout(() => { if (splash.parentNode) splash.parentNode.removeChild(splash); }, 450);
}

function setBtnLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  const txt = btn.querySelector('.btn-text');
  const spn = btn.querySelector('.btn-spinner');
  if (txt) txt.style.opacity = loading ? '0.5' : '1';
  if (spn) spn.style.display  = loading ? 'inline' : 'none';
}

function clearErrors() {
  ['login-email-err','login-pass-err','reg-name-err','reg-email-err','reg-pass-err']
    .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });
}

function setupPassToggle(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn   = document.getElementById(btnId);
  if (!input || !btn) return;
  btn.addEventListener('click', () => {
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.textContent = isHidden ? '🙈' : '👁️';
    btn.setAttribute('aria-label', isHidden ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });
}
setupPassToggle('login-pass', 'login-pass-toggle');
setupPassToggle('reg-pass', 'reg-pass-toggle');

document.getElementById('go-register').addEventListener('click', e => {
  e.preventDefault();
  clearErrors();
  document.getElementById('form-login').classList.remove('active');
  document.getElementById('form-register').classList.add('active');
});

document.getElementById('go-login').addEventListener('click', e => {
  e.preventDefault();
  clearErrors();
  document.getElementById('form-register').classList.remove('active');
  document.getElementById('form-login').classList.add('active');
});

async function doLogin() {
  clearErrors();
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;

  if (!email) { document.getElementById('login-email-err').textContent = 'Ingresa tu correo'; return; }
  if (!pass)  { document.getElementById('login-pass-err').textContent  = 'Ingresa tu contraseña'; return; }

  setBtnLoading('btn-login', true);
  const result = await Auth.login({ email, password: pass });
  setBtnLoading('btn-login', false);

  if (!result.ok) {
    if (result.field === 'email') document.getElementById('login-email-err').textContent = result.msg;
    if (result.field === 'pass')  document.getElementById('login-pass-err').textContent  = result.msg;
    return;
  }

  Toast.success(`¡Bienvenido, ${result.user.name.split(' ')[0]}! 👋`);

  const welcomeAnim  = document.getElementById('welcome-anim');
  const welcomeVideo = document.getElementById('welcome-video');
  if (welcomeAnim && welcomeVideo) {
    welcomeAnim.classList.add('visible');
    welcomeVideo.currentTime = 0;
    welcomeVideo.muted = false;
    welcomeVideo.play().catch(() => {
      welcomeVideo.muted = true;
      welcomeVideo.play().catch(() => {});
    });
    setTimeout(() => window.location.replace('/app'), 3200);
  } else {
    setTimeout(() => window.location.replace('/app'), 600);
  }
}

document.getElementById('btn-login').addEventListener('click', doLogin);
['login-email','login-pass'].forEach(id =>
  document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); })
);

async function doRegister() {
  clearErrors();
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;

  setBtnLoading('btn-register', true);
  const result = await Auth.register({ name, email, password: pass });
  setBtnLoading('btn-register', false);

  if (!result.ok) {
    if (result.field === 'name')  document.getElementById('reg-name-err').textContent  = result.msg;
    if (result.field === 'email') document.getElementById('reg-email-err').textContent = result.msg;
    if (result.field === 'pass')  document.getElementById('reg-pass-err').textContent  = result.msg;
    return;
  }

  Toast.success('¡Cuenta creada! Inicia sesión para continuar.');
  clearErrors();
  document.getElementById('form-register').classList.remove('active');
  document.getElementById('form-login').classList.add('active');
  const loginEmailInput = document.getElementById('login-email');
  if (loginEmailInput) loginEmailInput.value = email;
}

const TUTORIAL_STEPS = [
  {
    title: '¡Bienvenido al Mundial!',
    text: 'World Cup Collector UES es tu app para vivir la Copa Mundial 2026: colecciona figuritas, predice partidos y gana recompensas mientras sigues cada detalle del torneo.'
  },
  {
    title: 'Sobres y Álbum',
    text: 'En "Gacha" abres sobres usando tus tiradas para conseguir figuritas de selecciones y jugadores. Guárdalas en tu "Álbum" y marca tus favoritas.'
  },
  {
    title: 'Seguimiento y En Vivo',
    text: 'En "Seguimiento" revisa estadísticas, grupos y la tabla de posiciones. En "En Vivo" sigue los partidos del Mundial en tiempo real.'
  },
  {
    title: 'Predicciones y Minijuegos',
    text: 'Adivina los resultados en "Predicciones" para ganar monedas, y suma más jugando en "Minijuegos".'
  },
  {
    title: 'Canjear y Perfil',
    text: 'Usa tus monedas en "Canjear" para conseguir recompensas, y revisa tu progreso y datos en "Perfil". ¡Ya estás listo para jugar!'
  }
];
let tutorialStep = 0;

function renderTutorialStep() {
  const step = TUTORIAL_STEPS[tutorialStep];
  document.getElementById('tutorial-title').textContent = step.title;
  document.getElementById('tutorial-text').textContent  = step.text;

  const dotsEl = document.getElementById('tutorial-dots');
  dotsEl.innerHTML = TUTORIAL_STEPS.map((_, i) =>
    `<span class="tutorial-dot${i === tutorialStep ? ' active' : ''}"></span>`
  ).join('');

  const backBtn = document.getElementById('tutorial-back');
  const nextBtn = document.getElementById('tutorial-next');
  backBtn.style.visibility = tutorialStep === 0 ? 'hidden' : 'visible';
  nextBtn.textContent = tutorialStep === TUTORIAL_STEPS.length - 1 ? '¡Empezar a jugar!' : 'Siguiente';
}

function showTutorial() {
  tutorialStep = 0;
  renderTutorialStep();
  document.getElementById('tutorial-overlay').classList.add('show');
}

function closeTutorialAndEnter() {
  document.getElementById('tutorial-overlay').classList.remove('show');
  window.location.replace('/app');
}

document.getElementById('tutorial-next').addEventListener('click', () => {
  if (tutorialStep < TUTORIAL_STEPS.length - 1) {
    tutorialStep++;
    renderTutorialStep();
  } else {
    closeTutorialAndEnter();
  }
});
document.getElementById('tutorial-back').addEventListener('click', () => {
  if (tutorialStep > 0) {
    tutorialStep--;
    renderTutorialStep();
  }
});
document.getElementById('tutorial-skip').addEventListener('click', closeTutorialAndEnter);

document.getElementById('btn-register').addEventListener('click', doRegister);
['reg-name','reg-email','reg-pass'].forEach(id =>
  document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); })
);

document.getElementById('go-transfer').addEventListener('click', e => {
  e.preventDefault(); clearErrors();
  document.getElementById('form-login').classList.remove('active');
  document.getElementById('form-transfer').classList.add('active');
});
document.getElementById('go-login-from-transfer').addEventListener('click', e => {
  e.preventDefault(); clearErrors();
  document.getElementById('form-transfer').classList.remove('active');
  document.getElementById('form-login').classList.add('active');
});

document.getElementById('transfer-file').addEventListener('change', function() {
  const lbl = document.getElementById('transfer-file-label');
  const nameEl = document.getElementById('transfer-file-name');
  if (this.files[0]) {
    nameEl.textContent = '✓ ' + this.files[0].name;
    lbl.classList.add('has-file');
  } else {
    nameEl.textContent = 'Toca para seleccionar tu archivo…';
    lbl.classList.remove('has-file');
  }
});

async function doTransfer() {
  clearErrors();
  const email   = document.getElementById('transfer-email').value.trim();
  const pass    = document.getElementById('transfer-pass').value;
  const fileEl  = document.getElementById('transfer-file');
  const file    = fileEl.files[0];
  let hasError  = false;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('transfer-email-err').textContent = 'Correo inválido'; hasError = true;
  }
  if (!pass || pass.length < 6) {
    document.getElementById('transfer-pass-err').textContent = 'Mínimo 6 caracteres'; hasError = true;
  }
  if (!file) {
    document.getElementById('transfer-file-err').textContent = 'Selecciona tu archivo .json'; hasError = true;
  }
  if (hasError) return;

  setBtnLoading('btn-transfer', true);
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data.email || !data.figuritas || !data.usuario) {
      document.getElementById('transfer-file-err').textContent = 'Archivo inválido o corrupto'; return;
    }
    if (data.email.toLowerCase() !== email.toLowerCase()) {
      document.getElementById('transfer-email-err').textContent =
        'El archivo pertenece a ' + data.email + ', no a este correo'; return;
    }

    const existing = await DB.getUser(email);
    if (existing) {
      const hash = await Auth.hashPassword(pass);
      existing.passwordHash = hash;
      existing.figuritas    = data.figuritas || existing.figuritas;
      existing.tiradas      = typeof data.tiradas === 'number' ? data.tiradas : existing.tiradas;
      existing.monedas      = typeof data.monedas === 'number' ? data.monedas : existing.monedas;
      existing.aciertos     = Number(data.aciertos) || existing.aciertos;
      existing.pityCount    = Number(data.pityCount) || 0;
      existing.favoritos    = data.favoritos    || existing.favoritos;
      existing.predicciones = data.predicciones || existing.predicciones;
      existing.equipo_ideal = data.equipo_ideal || existing.equipo_ideal;
      if (data.photoURL)      existing.photoURL     = data.photoURL;
      if (data.lastDailyPull) existing.lastDailyPull = data.lastDailyPull;
      if (data.lastDailySpin) existing.lastDailySpin = data.lastDailySpin;
      existing.freeSpinsClaimed = true;
      await DB.saveUser(existing);
    } else {
      const hash = await Auth.hashPassword(pass);
      const user = {
        email,
        name:             data.usuario || email.split('@')[0],
        passwordHash:     hash,
        createdAt:        new Date().toISOString(),
        tiradas:          typeof data.tiradas === 'number' ? data.tiradas : 0,
        freeSpinsClaimed: true,
        monedas:          typeof data.monedas === 'number' ? data.monedas : 0,
        aciertos:         Number(data.aciertos) || 0,
        pityCount:        Number(data.pityCount) || 0,
        figuritas:        data.figuritas || [],
        favoritos:        data.favoritos || [],
        predicciones:     data.predicciones || [],
        equipo_ideal:     data.equipo_ideal || {},
        photoURL:         data.photoURL || null,
        lastDailyPull:    data.lastDailyPull || null,
        lastDailySpin:    data.lastDailySpin || null,
      };
      await DB.saveUser(user);
    }

    await DB.setSession(email);
    Toast.success('✅ Cuenta restaurada — ¡Bienvenido de vuelta, ' + data.usuario.split(' ')[0] + '!');
    setTimeout(() => window.location.replace('/app'), 800);
  } catch(err) {
    document.getElementById('transfer-file-err').textContent = 'Error al leer el archivo: ' + err.message;
  } finally {
    setBtnLoading('btn-transfer', false);
  }
}

document.getElementById('btn-transfer').addEventListener('click', doTransfer);

init();
