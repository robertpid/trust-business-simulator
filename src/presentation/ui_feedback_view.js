/**
 * TRUST Business Simulator - Capa de Presentación: Vistas de Notificación y Feedback
 * 
 * Reemplaza los alerts nativos con componentes visuales no intrusivos y accesibles.
 */

export class UiFeedbackView {
  /**
   * Muestra un mensaje temporal tipo notificación Toast o Banner.
   * @param {string} message
   * @param {'info'|'success'|'warning'|'error'} [type='info']
   * @param {number} [duration_ms=4000]
   */
  static show_toast(message, type = 'info', duration_ms = 4000) {
    if (typeof document === 'undefined') return;

    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `trust-toast toast-${type}`;
    toast.setAttribute('role', 'alert');

    const colors = {
      info: { bg: '#1c2230', border: '#3b82f6', text: '#93c5fd' },
      success: { bg: '#13281c', border: '#22c55e', text: '#86efac' },
      warning: { bg: '#2b2111', border: '#f59e0b', text: '#fde68a' },
      error: { bg: '#2f1519', border: '#ef4444', text: '#fca5a5' }
    };

    const c = colors[type] || colors.info;

    toast.style.cssText = `
      background: ${c.bg};
      color: #ffffff;
      border-left: 4px solid ${c.border};
      padding: 14px 20px;
      border-radius: 8px;
      font-size: 14px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      min-width: 280px;
      max-width: 420px;
      pointer-events: auto;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 0;
      transform: translateY(-10px);
    `;

    toast.innerHTML = `<span style="color: ${c.text}; font-weight: bold; margin-right: 8px;">[${type.toUpperCase()}]</span> ${message}`;
    container.appendChild(toast);

    // Animación de entrada
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    // Auto cierre
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration_ms);
  }

  static info(msg) { this.show_toast(msg, 'info'); }
  static success(msg) { this.show_toast(msg, 'success'); }
  static warning(msg) { this.show_toast(msg, 'warning'); }
  static error(msg) { this.show_toast(msg, 'error'); }
}
