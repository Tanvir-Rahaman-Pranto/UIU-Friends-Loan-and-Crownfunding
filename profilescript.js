// ============================================================
//  profilescript.js  –  UIU Verification & Tab Controller
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  // Sync verification indicators on load
  syncVerificationState();

  // Render Verification panel based on current state
  renderVerificationPanel();
});

// Sync user detail badges on top and header
function syncVerificationState() {
  var dot = document.getElementById('verification-dot');
  var headerBadge = document.querySelector('.verified-badge');
  var infoBadge = document.querySelector('.badge.verified-identity');

  if (localStorage.getItem('uiu_verified') === 'true') {
    if (dot) dot.style.display = 'none';
    if (headerBadge) headerBadge.style.backgroundColor = '#22c55e';
    if (infoBadge) {
      infoBadge.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
      infoBadge.style.color = '#4ade80';
      infoBadge.innerHTML = '<span class="material-symbols-outlined" style="font-size: 0.875rem;">verified_user</span> Identity Verified';
    }
  } else {
    if (dot) dot.style.display = 'inline-block';
    if (headerBadge) headerBadge.style.backgroundColor = '#94a3b8';
    if (infoBadge) {
      infoBadge.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
      infoBadge.style.color = '#f87171';
      infoBadge.innerHTML = '<span class="material-symbols-outlined" style="font-size: 0.875rem;">error</span> Unverified Student';
    }
  }
}

// Switching Tabs logic
function switchProfileTab(tabName) {
  // Tab links styling toggling
  document.getElementById('tab-overview').classList.remove('active');
  document.getElementById('tab-verification').classList.remove('active');
  document.getElementById('tab-payments').classList.remove('active');

  document.getElementById('tab-' + tabName).classList.add('active');

  // Panel toggling
  var overviewSection = document.getElementById('profile-overview-section');
  var verificationSection = document.getElementById('profile-verification-section');

  if (tabName === 'overview') {
    overviewSection.classList.remove('hidden');
    verificationSection.classList.add('hidden');
  } else if (tabName === 'verification') {
    overviewSection.classList.add('hidden');
    verificationSection.classList.remove('hidden');
    renderVerificationPanel();
  } else {
    alert('Payment methods interface is loaded under Overview linked accounts card.');
    document.getElementById('tab-overview').click();
  }
}

// Dynamic rendering of the verification status panel
function renderVerificationPanel() {
  var panel = document.getElementById('verification-status-panel');
  var isVerified = localStorage.getItem('uiu_verified') === 'true';

  if (isVerified) {
    var studentId = localStorage.getItem('uiu_student_id') || '011191000';
    var email = localStorage.getItem('uiu_student_email') || 'rhasan191000@bscse.uiu.ac.bd';
    
    panel.innerHTML = `
      <div style="background-color: var(--emerald-50); border: 1px solid var(--emerald-200); border-radius: 12px; padding: 20px; text-align: center;">
        <span class="material-symbols-outlined" style="font-size: 4rem; color: var(--emerald-600); margin-bottom: 12px;">verified</span>
        <h4 style="font-size: 1.125rem; font-weight: 700; color: var(--emerald-700); margin-bottom: 8px;">Identity Status: Verified Student</h4>
        <p style="font-size: 0.875rem; color: var(--slate-600); margin-bottom: 20px;">Your identity as a registered student of United International University has been validated successfully.</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 12px; max-width: 400px; margin: 0 auto; text-align: left; background: white; padding: 16px; border-radius: 8px; border: 1px solid var(--slate-200);">
          <span style="font-weight: 700; font-size: 0.875rem; color: var(--slate-500);">Student ID:</span>
          <span style="font-weight: 600; font-size: 0.875rem; color: var(--slate-900);">${studentId}</span>
          <span style="font-weight: 700; font-size: 0.875rem; color: var(--slate-500);">Email Address:</span>
          <span style="font-weight: 600; font-size: 0.875rem; color: var(--slate-900);">${email}</span>
        </div>
        
        <button onclick="resetVerification()" style="margin-top: 24px; background: none; border: 1px solid #ef4444; color: #ef4444; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 0.825rem; cursor: pointer; transition: all 0.2s;">Reset Verification</button>
      </div>
    `;
  } else {
    panel.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px;">
        <p style="font-size: 0.875rem; color: var(--slate-600); line-height: 1.6;">Please input your details below. Institutional verification ensures security, trust, and allows you to participate in active bidding.</p>
        
        <div class="review-form">
          <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 0.75rem; font-weight: 700; color: var(--slate-700);">UIU Student ID</label>
            <input type="text" id="p-student-id" class="form-textarea" placeholder="e.g. 011 191 000" style="padding: 10px 14px;" />
          </div>
          <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 0.75rem; font-weight: 700; color: var(--slate-700);">Institutional Email</label>
            <input type="email" id="p-student-email" class="form-textarea" placeholder="e.g. student@bscse.uiu.ac.bd" style="padding: 10px 14px;" />
          </div>
          <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 0.75rem; font-weight: 700; color: var(--slate-700);">Verification Code (Sent to Email)</label>
            <input type="text" id="p-verify-code" class="form-textarea" placeholder="Enter code (Simulation: 123456)" style="padding: 10px 14px;" />
          </div>
          
          <button onclick="handleVerificationSubmit()" class="submit-review-btn" style="margin-top: 10px; padding: 12px 24px;">Submit and Verify Identity</button>
        </div>
      </div>
    `;
  }
}

// Trigger Verification Submit
function handleVerificationSubmit() {
  var id = document.getElementById('p-student-id').value.trim();
  var email = document.getElementById('p-student-email').value.trim();
  var code = document.getElementById('p-verify-code').value.trim();

  if (!id) {
    alert('Please enter your Student ID.');
    return;
  }

  var emailPattern = /^[a-zA-Z0-9._%+-]+@.*uiu.*\.ac\.bd$/;
  if (!email || !emailPattern.test(email)) {
    alert('Please enter a valid UIU Institutional email.');
    return;
  }

  if (code !== '123456') {
    alert('Invalid verification code. Please use the simulation code: 123456');
    return;
  }

  // Set Verified state
  localStorage.setItem('uiu_verified', 'true');
  localStorage.setItem('uiu_student_id', id);
  localStorage.setItem('uiu_student_email', email);

  alert('Success! Your UIU identity has been verified.');
  syncVerificationState();
  renderVerificationPanel();
}

// Reset Verification (for easy demo simulation testing)
function resetVerification() {
  localStorage.removeItem('uiu_verified');
  localStorage.removeItem('uiu_student_id');
  localStorage.removeItem('uiu_student_email');

  alert('Verification status reset successfully.');
  syncVerificationState();
  renderVerificationPanel();
}
