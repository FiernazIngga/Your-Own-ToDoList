// Password visibility toggle
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.btn-toggle-pass').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const wrap  = btn.closest('.input-password-wrap');
      const input = wrap.querySelector('input');
      const show  = wrap.querySelector('.eye-show');
      const hide  = wrap.querySelector('.eye-hide');
      if (input.type === 'password') {
        input.type = 'text';
        show.style.display = 'none';
        hide.style.display = 'block';
      } else {
        input.type = 'password';
        show.style.display = 'block';
        hide.style.display = 'none';
      }
    });
  });
});
