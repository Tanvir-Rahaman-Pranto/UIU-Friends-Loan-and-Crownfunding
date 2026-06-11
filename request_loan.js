// ============================================================
//  request_loan.js  –  UIU Friends Loan & Crowdfunding
// ============================================================

// ---- Update Summary Box when user changes inputs ----
function updateSummary() {
  var amountInput   = document.getElementById('loan-amount');
  var purposeSelect = document.getElementById('loan-purpose');
  var durationSelect= document.getElementById('loan-duration');

  var sumAmount   = document.getElementById('sum-amount');
  var sumPurpose  = document.getElementById('sum-purpose');
  var sumDuration = document.getElementById('sum-duration');

  // Amount
  var amount = amountInput.value.trim();
  if (amount && !isNaN(amount)) {
    var formatted = parseInt(amount).toLocaleString();
    sumAmount.textContent = formatted + ' BDT';
  } else {
    sumAmount.textContent = '0 BDT';
  }

  // Purpose
  sumPurpose.textContent = purposeSelect.value;

  // Duration
  sumDuration.textContent = durationSelect.value;
}

// ---- Close Modal ----
function closeModal() {
  var overlay = document.getElementById('modal-overlay');
  var box     = document.getElementById('modal-box');

  box.style.transition  = 'opacity 0.2s, transform 0.2s';
  box.style.opacity     = '0';
  box.style.transform   = 'translateY(20px)';

  setTimeout(function () {
    overlay.style.display = 'none';
  }, 220);
}

// ---- Submit Loan Request ----
function submitLoan() {
  var agreeCheck  = document.getElementById('agree-check');
  var amountInput = document.getElementById('loan-amount');
  var reasonInput = document.getElementById('loan-reason');

  // Validate: agreement checkbox
  if (!agreeCheck.checked) {
    alert('Please agree to the repayment terms before posting your request.');
    agreeCheck.focus();
    return;
  }

  // Validate: amount filled
  if (!amountInput.value || isNaN(amountInput.value) || parseInt(amountInput.value) <= 0) {
    alert('Please enter a valid loan amount.');
    amountInput.focus();
    return;
  }

  // Validate: reason filled
  if (!reasonInput.value.trim()) {
    alert('Please explain why you need this loan.');
    reasonInput.focus();
    return;
  }

  // All good – show success
  var submitBtn = document.querySelector('.submit-btn');
  submitBtn.textContent = '✓ Request Posted!';
  submitBtn.style.background = '#10b981';

  setTimeout(function () {
    alert('Your loan request has been posted to the Marketplace successfully!');
    closeModal();
  }, 800);
}

// ---- Close modal when clicking the dark overlay ----
document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.getElementById('modal-overlay');

  // Initialize summary with default values
  updateSummary();

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) {
      closeModal();
    }
  });
});

// ---- Close modal with Escape key ----
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeModal();
  }
});
