// ============================================================
//  deshboardscript.js  –  UIU Verification Control
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  updateVerificationUI();

  // Attach interceptors to home buttons
  var requestBtn = document.querySelector('.btn-white');
  if (requestBtn) {
    requestBtn.addEventListener('click', function (e) {
      if (localStorage.getItem('uiu_verified') !== 'true') {
        e.preventDefault();
        alert('Verification Required: You must verify your UIU identity before requesting a loan.');
        triggerVerification();
      } else {
        window.location.href = 'marketplace.html';
      }
    });
  }

  var startCampaignBtn = document.querySelector('.btn-green');
  if (startCampaignBtn) {
    startCampaignBtn.addEventListener('click', function (e) {
      if (localStorage.getItem('uiu_verified') !== 'true') {
        e.preventDefault();
        alert('Verification Required: You must verify your UIU identity before starting a crowdfunding campaign.');
        triggerVerification();
      } else {
        window.location.href = 'crowdfunding.html';
      }
    });
  }
});

// Update Header verification UI based on localStorage
function updateVerificationUI() {
  var badge = document.getElementById('user-verification-badge');
  var text = document.getElementById('verification-text');

  if (localStorage.getItem('uiu_verified') === 'true') {
    badge.className = 'trust-score verified';
    text.textContent = 'Verified Student';
  } else {
    badge.className = 'trust-score unverified';
    text.textContent = 'Unverified - Verify Now';
  }
}

// Open Verification Modal
function triggerVerification() {
  document.getElementById('verification-modal-overlay').classList.add('open');
}

// Close Verification Modal
function closeVerificationModal() {
  document.getElementById('verification-modal-overlay').classList.remove('open');
}

// Handle Form Submit
function submitVerificationForm() {
  var studentId = document.getElementById('v-student-id').value.trim();
  var studentEmail = document.getElementById('v-student-email').value.trim();

  // Simple UIU Student ID check (e.g. 011 191 000 format or numeric)
  if (!studentId) {
    alert('Please enter a valid UIU Student ID.');
    return;
  }

  // Institutional email validation (must end with uiu.ac.bd)
  var emailPattern = /^[a-zA-Z0-9._%+-]+@.*uiu.*\.ac\.bd$/;
  if (!studentEmail || !emailPattern.test(studentEmail)) {
    alert('Please enter a valid UIU Institutional email (e.g. student@bscse.uiu.ac.bd).');
    return;
  }

  // Simulating successful verification
  localStorage.setItem('uiu_verified', 'true');
  localStorage.setItem('uiu_student_id', studentId);
  localStorage.setItem('uiu_student_email', studentEmail);

  alert('Success! Your UIU identity has been verified successfully.');
  closeVerificationModal();
  updateVerificationUI();
}

// Redirect to Marketplace and show details modal for a specific loan
function viewLoanOnMarketplace(id) {
  window.location.href = 'marketplace.html?view-loan=' + id;
}
