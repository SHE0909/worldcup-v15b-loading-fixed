// menu-bg.js — Video de fondo de la pantalla principal (#screen-app)
//
// Responsabilidad: reproducir en loop el video "menu.mp4" como fondo
// decorativo detrás de la interfaz. Es puramente visual (no bloquea nada
// si el video falla, no existe, o el navegador bloquea el autoplay).

(function () {
  const container = document.getElementById('menu-bg-video');
  const video      = document.getElementById('menu-bg-video-el');
  if (!container || !video) return;

  // Si el archivo no existe o falla al cargar, ocultamos el <video>
  // y dejamos el fondo de respaldo (var(--bg-base)) definido en CSS.
  video.addEventListener('error', () => {
    video.style.display = 'none';
  });

  function tryPlay() {
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        // Algunos navegadores móviles exigen un gesto del usuario incluso
        // estando muted. Reintentamos en la primera interacción.
        const retry = () => {
          video.play().catch(() => {});
          document.removeEventListener('touchstart', retry);
          document.removeEventListener('click', retry);
        };
        document.addEventListener('touchstart', retry, { once: true, passive: true });
        document.addEventListener('click', retry, { once: true });
      });
    }
  }

  // Pausar el video cuando la pestaña no está visible (ahorra batería/datos)
  // y reanudar al volver, sin afectar el resto de la app.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      video.pause();
    } else if (!document.hidden && video.paused) {
      tryPlay();
    }
  });

  if (video.readyState >= 2) {
    tryPlay();
  } else {
    video.addEventListener('loadeddata', tryPlay, { once: true });
  }
})();
