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
       <button class="btn btn-ghost btn-sm" id="logoutBtn">Logout</button>`
    : `<a href="login.html" class="nav-login-link">Log in</a>
       <a href="signup.html" class="btn btn-primary btn-sm btn-pill">Sign up</a>`;

  const currentTheme = localStorage.getItem('skillora_theme') || 'light';

  const themeIcon = currentTheme === 'dark'
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

  navEl.innerHTML = `
    <div class="container nav-inner">
      <a href="index.html" class="brand-wrap">
        <svg class="brand-logo-svg" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4C18.5 4 24 8.5 24 15C24 19.5 21 23 16.5 25C13.5 26.3 10 27 6 27C3 27 1 25 1 22C1 16 6 10.5 12 4Z" fill="#34D399" />
          <path d="M24 32C17.5 32 12 27.5 12 21C12 16.5 15 13 19.5 11C22.5 9.7 26 9 30 9C33 9 35 11 35 14C35 20 30 25.5 24 32Z" fill="#16866A" />
        </svg>
        <div class="brand-text-block">
          <span class="brand-title">Skillora</span>
          <span class="brand-tagline">Learn Skills. Land Your Future.</span>
        </div>
      </a>
      <nav class="nav-links" id="navLinks">${linksHtml}</nav>
      <div class="nav-actions">
        <button class="theme-btn" id="themeToggle" title="Toggle theme" onclick="toggleTheme()" aria-label="Toggle theme">${themeIcon}</button>
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

  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      document.getElementById('navLinks').classList.toggle('open');
    });
  }
}
