// Base URL: same origin (server serves the frontend), works locally too.
const API_BASE = '/api';

const Auth = {
  getToken: () => localStorage.getItem('jp_token'),
  getUser: () => {
    const raw = localStorage.getItem('jp_user');
    return raw ? JSON.parse(raw) : null;
  },
  setSession: (token, user) => {
    localStorage.setItem('jp_token', token);
    localStorage.setItem('jp_user', JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem('jp_token');
    localStorage.removeItem('jp_user');
  },
  isLoggedIn: () => !!localStorage.getItem('jp_token'),
  requireRole: (roles) => {
    const user = Auth.getUser();
    if (!user || !roles.includes(user.role)) {
      window.location.href = 'login.html';
      return null;
    }
    return user;
  }
};

async function apiRequest(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = {};
  const token = Auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isForm && body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined
  });

  let data = {};
  try { data = await res.json(); } catch (e) { /* no body */ }

  if (!res.ok) {
    if (res.status === 401) {
      Auth.clear();
    }
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

function showAlert(el, message, type = 'error') {
  el.textContent = message;
  el.className = `alert show alert-${type}`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString();
}

function formatSalary(min, max) {
  if (!min && !max) return 'Not disclosed';
  const fmt = (n) => (n >= 100000 ? `${(n / 100000).toFixed(1)}L` : `${(n / 1000).toFixed(0)}K`);
  if (min && max) return `₹${fmt(min)} - ₹${fmt(max)}`;
  return `Up to ₹${fmt(max || min)}`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
