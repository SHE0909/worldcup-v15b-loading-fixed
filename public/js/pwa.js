if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('[PWA] SW registrado:', reg.scope);

      const onNewSW = (worker) => {
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed') {
            console.log('[PWA] Nueva versión disponible, actualizando...');
            worker.postMessage('SKIP_WAITING');
          }
        });
      };

      if (reg.waiting) onNewSW(reg.waiting);

      reg.addEventListener('updatefound', () => {
        if (reg.installing) onNewSW(reg.installing);
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      setInterval(() => reg.update(), 5 * 60 * 1000);

    }).catch(e => console.warn('[PWA] SW fallo:', e));
  });
} else if (location.protocol === 'file:') {
  console.info('[PWA] SW desactivado en file:// — abre desde un servidor HTTP para PWA completo.');
}

let deferredPrompt;
window._pwaPrompt = null;

function _showPwaProfileBtn() {
  const sec = document.getElementById('profile-pwa-section');
  if (sec) sec.style.display = 'block';
}
function _hidePwaProfileBtn() {
  const sec = document.getElementById('profile-pwa-section');
  if (sec) sec.style.display = 'none';
}

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  window._pwaPrompt = e;
  const banner = document.getElementById('pwa-install-banner');
  if (banner && !localStorage.getItem('pwa-banner-dismissed')) {
    banner.style.display = 'flex';
  }
  _showPwaProfileBtn();
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  window._pwaPrompt = null;
  _hidePwaProfileBtn();
});

document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  window._pwaPrompt = null;
  document.getElementById('pwa-install-banner').style.display = 'none';
  _hidePwaProfileBtn();
});

document.getElementById('pwa-banner-close')?.addEventListener('click', () => {
  document.getElementById('pwa-install-banner').style.display = 'none';
  localStorage.setItem('pwa-banner-dismissed', '1');
});

(function() {
  const discordBanner = document.getElementById('discord-banner');
  const discordClose  = document.getElementById('discord-banner-close');
  const LS_KEY = 'discord-banner-dismissed';
  if (discordBanner && !localStorage.getItem(LS_KEY)) {
    setTimeout(() => {
      const pwaBanner = document.getElementById('pwa-install-banner');
      const pwaVisible = pwaBanner && pwaBanner.style.display !== 'none';
      discordBanner.style.display = pwaVisible ? 'none' : 'flex';
      if (pwaVisible) {
        const observer = new MutationObserver(() => {
          if (pwaBanner.style.display === 'none') {
            discordBanner.style.display = 'flex';
            observer.disconnect();
          }
        });
        observer.observe(pwaBanner, { attributes: true, attributeFilter: ['style'] });
      }
    }, 1500);
  }
  discordClose?.addEventListener('click', () => {
    discordBanner.style.display = 'none';
    localStorage.setItem(LS_KEY, '1');
  });
})();

document.getElementById('btn-install-pwa-profile')?.addEventListener('click', async () => {
  const prompt = window._pwaPrompt;
  if (!prompt) {
    Toast.warn('La instalación no está disponible. Es posible que la app ya esté instalada.');
    return;
  }
  prompt.prompt();
  const { outcome } = await prompt.userChoice;
  window._pwaPrompt = null;
  deferredPrompt = null;
  _hidePwaProfileBtn();
  if (outcome === 'accepted') Toast.success('¡App instalada exitosamente!');
});
