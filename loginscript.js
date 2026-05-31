/* ================================================================
   Login Page Script — UIU Friends Network
   ================================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── Password toggle ── */
  var toggleBtn   = document.getElementById('togglePassword');
  var pwInput     = document.getElementById('password');
  var eyeOpen     = document.getElementById('eyeOpen');
  var eyeClosed   = document.getElementById('eyeClosed');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var show = pwInput.getAttribute('type') === 'password';
      pwInput.setAttribute('type', show ? 'text' : 'password');
      eyeOpen.style.display   = show ? 'none'  : 'block';
      eyeClosed.style.display = show ? 'block' : 'none';
    });
  }

  /* ── Banner helper ── */
  function showBanner(msg, type) {
    var banner = document.getElementById('loginBanner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'loginBanner';
      banner.style.cssText = 'margin:12px 0;padding:12px 16px;border-radius:8px;font-size:14px;font-weight:500;';
      document.getElementById('loginForm').prepend(banner);
    }
    banner.textContent = msg;
    banner.style.background = type === 'error' ? '#fee2e2' : '#d1fae5';
    banner.style.color      = type === 'error' ? '#991b1b' : '#065f46';
    banner.style.border     = '1px solid ' + (type === 'error' ? '#fca5a5' : '#6ee7b7');
    banner.style.display    = 'block';
  }

  /* ── Form submit → login.php ── */
  var form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var identifier = document.getElementById('studentId').value.trim();
      var password   = document.getElementById('password').value;
      var btn        = form.querySelector('.btn-signin');

      if (!identifier || !password) {
        showBanner('Please fill in both fields.', 'error');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Signing in…';

      try {
        var fd = new FormData();
        fd.append('identifier', identifier);
        fd.append('password',   password);

        var res  = await fetch('login.php', { method: 'POST', body: fd });
        var data = await res.json();

        if (data.success) {
          showBanner('Login successful! Redirecting…', 'success');
          setTimeout(function () { window.location.href = 'deshboard.html'; }, 800);
        } else {
          showBanner(data.message || 'Login failed.', 'error');
          btn.disabled = false;
          btn.innerHTML = 'Sign In <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>';
        }
      } catch (err) {
        showBanner('Network error. Please check your connection.', 'error');
        btn.disabled = false;
      }
    });
  }

  /* ── Create account link ── */
  var createLink = document.querySelector('.create-link');
  if (createLink) createLink.href = 'registration.html';

});
