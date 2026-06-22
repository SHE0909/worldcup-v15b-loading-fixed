(function() {
  const drawer  = document.getElementById('app-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const btnOpen = document.getElementById('btn-drawer-open');
  const btnClose= document.getElementById('btn-drawer-close');
  const btnLogoutDrawer = document.getElementById('btn-drawer-logout');

  let _drawerOpen = false;

  function openDrawer() {
    _drawerOpen = true;
    drawer.classList.add('open');
    overlay.classList.add('visible');
    overlay.style.pointerEvents = 'auto';
    btnOpen?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    _drawerOpen = false;
    drawer.classList.remove('open');
    overlay.classList.remove('visible');
    overlay.style.pointerEvents = 'none';
    btnOpen?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  closeDrawer();

  btnOpen?.addEventListener('click', openDrawer);
  btnClose?.addEventListener('click', closeDrawer);
  overlay?.addEventListener('click', closeDrawer);

  drawer?.querySelectorAll('.drawer-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      drawer.querySelectorAll('.drawer-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      closeDrawer();
      App.navigateTo(btn.dataset.tab);
    });
  });

  btnLogoutDrawer?.addEventListener('click', async () => {
    closeDrawer();
    document.getElementById('btn-logout')?.click();
  });

  let swipeStartX = -1;
  let swipeTracking = false;

  drawer?.addEventListener('touchstart', e => {
    swipeStartX = e.touches[0].clientX;
    swipeTracking = true;
  }, { passive: true });
  drawer?.addEventListener('touchend', e => {
    if (swipeTracking && swipeStartX > 0 && swipeStartX - e.changedTouches[0].clientX > 60) closeDrawer();
    swipeTracking = false;
    swipeStartX = -1;
  }, { passive: true });

  let edgeSwipeStartX = -1;
  document.addEventListener('touchstart', e => {
    if (!_drawerOpen && e.touches[0].clientX < 20) {
      edgeSwipeStartX = e.touches[0].clientX;
    } else {
      edgeSwipeStartX = -1;
    }
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (edgeSwipeStartX >= 0 && e.changedTouches[0].clientX - edgeSwipeStartX > 60) openDrawer();
    edgeSwipeStartX = -1;
  }, { passive: true });

  const origNavigateTo = App?.navigateTo?.bind(App);
  if (origNavigateTo) {
    App.navigateTo = function(tab) {
      drawer?.querySelectorAll('.drawer-nav-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tab);
      });
      return origNavigateTo(tab);
    };
  }

  async function fillDrawerUser() {
    try {
      const u = await Auth.currentUser();
      if (!u) return;
      const nameEl  = document.getElementById('drawer-name');
      const statsEl = document.getElementById('drawer-stats');
      const avatarEl= document.getElementById('drawer-avatar');
      if (nameEl)  nameEl.textContent  = u.name || u.email || 'Jugador';
      if (statsEl) statsEl.textContent = `🎴 ${u.tiradas ?? 0} · 🪙 ${u.monedas ?? 0}`;
      if (avatarEl) {
        if (u.photoURL) {
          avatarEl.innerHTML = `<img src="${u.photoURL}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
        } else {
          avatarEl.textContent = (u.name || u.email || '?')[0].toUpperCase();
        }
      }
    } catch(e) {}
  }
  window.fillDrawerUser = fillDrawerUser;
  window.addEventListener('app:ready', fillDrawerUser);
  setTimeout(fillDrawerUser, 800);
})();
