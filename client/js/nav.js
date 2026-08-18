function renderNavbar(activePage) {
  const user = Auth.getUser();
  const navEl = document.getElementById('navbar');
  if (!navEl) return;

  const linksByRole = {
    guest: [
      { href: 'index.html', label: 'Home', key: 'home' },
      { href: 'jobs.html', label: 'Browse Jobs', key: 'jobs' },
      { href: 'coding-practice.html', label: 'Coding Practice', key: 'coding' },
      { href: 'quizzes.html', label: 'Quizzes', key: 'quizzes' },
      { href: 'notes.html', label: 'Notes', key: 'notes' },
      { href: 'placement-prep.html', label: 'Placement Prep', key: 'prep' }
    ],
    user: [
      { href: 'index.html', label: 'Home', key: 'home' },
      { href: 'jobs.html', label: 'Browse Jobs', key: 'jobs' },
      { href: 'coding-practice.html', label: 'Coding Practice', key: 'coding' },
      { href: 'quizzes.html', label: 'Quizzes', key: 'quizzes' },
      { href: 'notes.html', label: 'Notes', key: 'notes' },
      { href: 'placement-prep.html', label: 'Placement Prep', key: 'prep' },
      { href: 'my-applications.html', label: 'Dashboard', key: 'apps' },
      { href: 'profile.html', label: 'Profile', key: 'profile' }
    ],
    recruiter: [
      { href: 'index.html', label: 'Home', key: 'home' },
      { href: 'recruiter-dashboard.html', label: 'Dashboard', key: 'dash' },
      { href: 'post-job.html', label: 'Post a Job', key: 'post' },
      { href: 'placement-prep.html', label: 'Placement Prep', key: 'prep' },
      { href: 'profile.html', label: 'Profile', key: 'profile' }
    ],
    admin: [
      { href: 'index.html', label: 'Home', key: 'home' },
      { href: 'admin-dashboard.html', label: 'Admin Dashboard', key: 'dash' },
      { href: 'admin-content.html', label: 'Manage Content', key: 'content' }
    ]
  };

  const role = user ? user.role : 'guest';
  const links = linksByRole[role];

  const linksHtml = links
    .map((l) => `<a href="${l.href}" class="${activePage === l.key ? 'active' : ''}">${l.label}</a>`)
    .join('');

  const actionsHtml = user
    ? `<div class="nav-user">
         <span class="avatar">${escapeHtml(user.name.charAt(0).toUpperCase())}</span>
         <span>${escapeHtml(user.name.split(' ')[0])}</span>
       </div>
       <button class="btn btn-ghost btn-sm" style="color:#fff" id="logoutBtn">Logout</button>`
    : `<a href="login.html" class="btn btn-ghost btn-sm" style="color:#fff">Log in</a>
       <a href="signup.html" class="btn btn-primary btn-sm">Sign up</a>`;

  const currentTheme = localStorage.getItem('jp_theme') || 'light';

  navEl.innerHTML = `
    <div class="container nav-inner">
      <a href="index.html" class="brand">CareerRail<span class="dot">.</span></a>
      <nav class="nav-links" id="navLinks">${linksHtml}</nav>
      <div class="nav-actions">
        <button class="btn btn-ghost btn-sm" id="themeToggle" style="color:#fff;font-size:1rem;padding:8px 10px" title="Toggle theme" onclick="toggleTheme()">${currentTheme === 'dark' ? '☀️' : '🌙'}</button>
        ${actionsHtml}
        <button class="hamburger" id="hamburger" aria-label="Menu">☰</button>
      </div>
    </div>
  `;

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      Auth.clear();
      window.location.href = 'index.html';
    });
  }

  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });
}
