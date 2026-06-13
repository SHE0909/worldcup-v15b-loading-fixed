/**
 * toast.js — Notificaciones tipo toast
 */
const Toast = {
  _timer: null,
  show(message, type = 'info', duration = 3000) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.className   = `toast show${type !== 'info' ? ' ' + type : ''}`;
    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      el.className = 'toast';
    }, duration);
  },
  success(msg, dur) { this.show(msg, 'success', dur); },
  error(msg, dur)   { this.show(msg, 'error',   dur); },
  warn(msg, dur)    { this.show(msg, 'warn',     dur); }
};

/**
 * modal.js — Modal genérico
 */
const Modal = {
  open(html) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    if (!overlay || !content) return;
    content.innerHTML = html;
    overlay.style.display = 'flex';
    document.getElementById('modal-close').addEventListener('click', () => Modal.close(), { once: true });
    // Evitar acumular listeners de click en el overlay cada vez que se abre el modal
    if (!overlay._wccClickBound) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) Modal.close();
      });
      overlay._wccClickBound = true;
    }
  },
  close() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.style.display = 'none';
  }
};
