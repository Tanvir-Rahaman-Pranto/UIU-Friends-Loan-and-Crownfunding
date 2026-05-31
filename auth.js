/* ================================================================
   auth.js  —  Shared session helper for UIU Friends Network
   ================================================================
   Include this script on every page BEFORE page-specific scripts.
   It:
     1. Checks session via session.php
     2. Stores user in window.currentUser
     3. Updates any navbar/sidebar element with data-auth attributes
     4. Redirects to login if page requires authentication
   ================================================================ */

(function () {
  'use strict';

  /* ── Public API ── */
  window.Auth = {
    user: null,

    /* Call once on page load */
    init: function (options) {
      options = options || {};
      var requireLogin = options.requireLogin || false;
      var onReady      = options.onReady      || function () {};

      fetch('session.php')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.loggedIn) {
            window.Auth.user    = data.user;
            window.currentUser  = data.user;
            Auth._applyLoggedIn(data.user);
          } else {
            window.currentUser = null;
            Auth._applyLoggedOut();
            if (requireLogin) {
              window.location.href = 'login.html';
              return;
            }
          }
          onReady(data.loggedIn ? data.user : null);
        })
        .catch(function () {
          Auth._applyLoggedOut();
          onReady(null);
        });
    },

    logout: function () {
      window.location.href = 'logout.php';
    },

    trustPercent: function (avgRating) {
      /* Convert 0-5 rating scale to a trust % */
      if (!avgRating) return 0;
      return Math.round((avgRating / 5) * 100);
    },

    avatarHTML: function (user, size) {
      size = size || 36;
      var hasPhoto = user && user.profile_photo && user.profile_photo.trim() !== '';
      if (hasPhoto) {
        return '<img src="' + user.profile_photo + '" alt="' + user.full_name + '" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;object-fit:cover;">';
      }
      var initials = user ? user.full_name.split(' ').map(function(n){return n[0];}).join('').substring(0,2).toUpperCase() : 'G';
      return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:#1E3A8A;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:' + Math.round(size*0.38) + 'px;">' + initials + '</div>';
    },

    /* ── Internal ── */
    _applyLoggedIn: function (u) {
      var trust = Auth.trustPercent(u.avg_rating);

      /* [data-auth="user-name"] → full name */
      document.querySelectorAll('[data-auth="user-name"]').forEach(function (el) {
        el.textContent = u.full_name;
      });
      /* [data-auth="user-id"] */
      document.querySelectorAll('[data-auth="user-id"]').forEach(function (el) {
        el.textContent = u.student_id || u.email;
      });
      /* [data-auth="user-dept"] */
      document.querySelectorAll('[data-auth="user-dept"]').forEach(function (el) {
        el.textContent = u.department || '';
      });
      /* [data-auth="trust-score"] */
      document.querySelectorAll('[data-auth="trust-score"]').forEach(function (el) {
        el.textContent = trust + '%';
      });
      /* [data-auth="avatar"] → inject avatar HTML */
      document.querySelectorAll('[data-auth="avatar"]').forEach(function (el) {
        var size = parseInt(el.getAttribute('data-size') || '36');
        el.innerHTML = Auth.avatarHTML(u, size);
      });
      /* [data-auth="show-logged-in"] → show */
      document.querySelectorAll('[data-auth="show-logged-in"]').forEach(function (el) {
        el.style.display = '';
      });
      /* [data-auth="show-logged-out"] → hide */
      document.querySelectorAll('[data-auth="show-logged-out"]').forEach(function (el) {
        el.style.display = 'none';
      });
      /* [data-auth="profile-link"] → link to profile */
      document.querySelectorAll('[data-auth="profile-link"]').forEach(function (el) {
        el.href = 'profile.html';
      });
      /* hero welcome text */
      document.querySelectorAll('[data-auth="welcome"]').forEach(function (el) {
        el.textContent = 'Welcome back, ' + u.full_name.split(' ')[0] + '!';
      });
    },

    _applyLoggedOut: function () {
      document.querySelectorAll('[data-auth="user-name"]').forEach(function (el) {
        el.textContent = 'Guest';
      });
      document.querySelectorAll('[data-auth="trust-score"]').forEach(function (el) {
        el.textContent = '--';
      });
      document.querySelectorAll('[data-auth="avatar"]').forEach(function (el) {
        var size = parseInt(el.getAttribute('data-size') || '36');
        el.innerHTML = Auth.avatarHTML(null, size);
      });
      document.querySelectorAll('[data-auth="show-logged-in"]').forEach(function (el) {
        el.style.display = 'none';
      });
      document.querySelectorAll('[data-auth="show-logged-out"]').forEach(function (el) {
        el.style.display = '';
      });
      document.querySelectorAll('[data-auth="welcome"]').forEach(function (el) {
        el.textContent = 'Welcome to UIU Friends!';
      });
    }
  };
})();
