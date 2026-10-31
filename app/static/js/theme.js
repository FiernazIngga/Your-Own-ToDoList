// Theme toggle – runs before DOM render to avoid FOUC
(function () {
  const stored = localStorage.getItem('pyt-theme');
  const theme = stored === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
})();

document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  btn.addEventListener('click', function () {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('pyt-theme', next);
  });
});
