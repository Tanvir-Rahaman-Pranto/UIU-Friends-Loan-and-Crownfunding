/* ================================================================
   Login Page Script — UIU Friends Network
   ================================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── Element refs ── */
  var form        = document.getElementById('loginForm');
  var banner      = document.getElementById('loginBanner');
  var signinBtn   = document.getElementById('signinBtn');
  var btnText     = document.getElementById('signinBtnText');
  var btnIcon     = document.getElementById('signinBtnIcon');
  var toggleBtn   = document.getElementById('togglePassword');
  var pwInput     = document.getElementById('password');
  var eyeOpen     = document.getElementById('eyeOpen');
  var eyeClosed   = document.getElementById('eyeClosed');


  /* ── 1. Password show/hide toggle ── */
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var isPassword = pwInput.type === 'password';
      pwInput.type            = isPassword ? 'text' : 'password';
      eyeOpen.style.display   = isPassword ? 'none'  : 'block';
      eyeClosed.style.display = isPassword ? 'block' : 'none';
      toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
  }


  /* ── 2. Banner helper ──
     Uses the #loginBanner div already in the HTML.
     No dynamic element creation needed.
  ── */
  function showBanner(msg, type) {
    if (!banner) return;
    banner.textContent   = msg;
    banner.className     = 'login-banner login-banner--' + type;
    banner.style.display = 'block';
    banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideBanner() {
    if (!banner) return;
    banner.style.display = 'none';
  }


  /* ── 3. Button loading state ──
     Keeps the SVG arrow intact instead of
     overwriting innerHTML with textContent.
  ── */
  function setLoading(isLoading) {
    signinBtn.disabled  = isLoading;
    btnText.textContent = isLoading ? 'Signing in…' : 'Sign In';
    btnIcon.style.display = isLoading ? 'none' : 'block';
  }


  /* ── 4. Form submit → login.php ── */
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      hideBanner();

      var identifier = document.getElementById('studentId').value.trim();
      var password   = pwInput.value;

      /* Basic client-side check */
      if (!identifier || !password) {
        showBanner('Please fill in both fields.', 'error');
        return;
      }

      setLoading(true);

      try {
        var fd = new FormData();
        fd.append('identifier', identifier);
        fd.append('password',   password);

        var res  = await fetch('login.php', { method: 'POST', body: fd });

        /* Safely parse JSON — PHP warnings can corrupt the response */
        var text = await res.text();
        var data;
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          console.error('Non-JSON response from login.php:', text);
          showBanner('Unexpected server response. Please try again.', 'error');
          return;
        }

        if (data.success) {
          showBanner('Login successful! Redirecting…', 'success');
          /* Short delay so the user sees the success message */
          setTimeout(function () {
            window.location.href = 'dashboard.html';
          }, 800);
          /* Don't re-enable the button — page is about to redirect */
        } else {
          showBanner(data.message || 'Login failed. Please try again.', 'error');
          setLoading(false);
        }

      } catch (netErr) {
        console.error('Network error:', netErr);
        showBanner('Network error. Please check your connection.', 'error');
        setLoading(false);
      }
    });
  }

});