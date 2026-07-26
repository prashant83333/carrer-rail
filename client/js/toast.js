// Simple toast notification system. Call Toast.show('message', 'success'|'error'|'info').
const Toast = {
  container: null,
  init() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.id = 'toastContainer';
    this.container.style.cssText = `
      position: fixed; top: 84px; right: 20px; z-index: 999;
      display: flex; flex-direction: column; gap: 10px; max-width: 340px;
    `;
    document.body.appendChild(this.container);
  },
  show(message, type = 'info', duration = 3500) {
    this.init();
    const colors = {
      success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', icon: '✓' },
      error: { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', icon: '✕' },
      info: { bg: '#eef2ff', border: '#c7d2fe', text: '#3730a3', icon: 'ℹ' }
    };
    const c = colors[type] || colors.info;
    const el = document.createElement('div');
    el.style.cssText = `
      background: ${c.bg}; border: 1px solid ${c.border}; color: ${c.text};
      padding: 12px 16px; border-radius: 10px; font-size: 0.87rem; font-weight: 500;
      display: flex; align-items: center; gap: 10px;
      box-shadow: 0 8px 24px rgba(10,25,48,0.14);
      animation: toastIn 0.2s ease;
    `;
    el.innerHTML = `<span style="font-weight:700">${c.icon}</span><span>${message}</span>`;
    this.container.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity 0.2s, transform 0.2s';
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      setTimeout(() => el.remove(), 200);
    }, duration);
  }
};

const style = document.createElement('style');
style.textContent = `@keyframes toastIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`;
document.head.appendChild(style);
