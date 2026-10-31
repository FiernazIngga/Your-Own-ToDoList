document.addEventListener('DOMContentLoaded', function () {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebarOverlay');
  const openBtn  = document.getElementById('sidebarToggle');
  const closeBtn = document.getElementById('sidebarClose');

  function open()  { sidebar.classList.add('open'); overlay.classList.add('visible'); }
  function close() { sidebar.classList.remove('open'); overlay.classList.remove('visible'); }

  if (openBtn)  openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (overlay)  overlay.addEventListener('click', close);
});
