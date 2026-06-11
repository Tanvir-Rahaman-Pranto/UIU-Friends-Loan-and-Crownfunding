// ============================================================
//  my_loans_tracker.js  –  UIU Friends Loan & Crowdfunding
// ============================================================

/**
 * switchTab(tab)
 * Switches between "Money I Borrowed" and "Money I Lent" views.
 * @param {string} tab - "borrowed" or "lent"
 */
function switchTab(tab) {
  // Hide both views
  document.getElementById('view-borrowed').style.display = 'none';
  document.getElementById('view-lent').style.display     = 'none';

  // Deactivate all tab buttons
  document.getElementById('tab-borrowed').classList.remove('active');
  document.getElementById('tab-lent').classList.remove('active');

  // Show selected view and activate its button
  document.getElementById('view-' + tab).style.display = '';
  document.getElementById('tab-' + tab).classList.add('active');
}

// ============================================================
//  Notification Bell
// ============================================================
(function setupNotification() {
  var btn = document.getElementById('notif-btn');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var dot = btn.querySelector('.notif-dot');
    if (dot) {
      dot.style.display = dot.style.display === 'none' ? '' : 'none';
    }
    alert('No new notifications at the moment.');
  });
})();

// ============================================================
//  Pay Installment Button
// ============================================================
(function setupPayButtons() {
  document.querySelectorAll('.pay-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.loan-card');
      var loanName = card ? card.querySelector('.loan-title')?.textContent : 'this loan';
      var confirmed = confirm('Confirm payment for: ' + loanName + '?');
      if (confirmed) {
        alert('Payment initiated! You will receive a confirmation shortly.');
      }
    });
  });
})();

// ============================================================
//  Cancel Pending Request
// ============================================================
(function setupCancelButtons() {
  document.querySelectorAll('.cancel-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item   = btn.closest('.list-item-row');
      var title  = item ? item.querySelector('.item-title')?.textContent : 'this request';
      var ok = confirm('Cancel request: "' + title + '"?');
      if (ok && item) {
        item.style.transition = 'opacity 0.3s';
        item.style.opacity    = '0';
        setTimeout(function () { item.remove(); }, 300);
      }
    });
  });
})();

// ============================================================
//  On page load – default to "borrowed" tab
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  switchTab('borrowed');
});
