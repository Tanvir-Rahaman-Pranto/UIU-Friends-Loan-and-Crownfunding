// ============================================================
//  crowdfundingscript.js  –  UIU Verification + Donation Logic
// ============================================================

var selectedAmount = 1000;

// ---- Page Init ----
document.addEventListener('DOMContentLoaded', function () {
    updateCfVerificationBadge();
});

// ---- Amount Selection ----
function selectAmount(amount) {
    selectedAmount = amount;
    document.getElementById('btn-500').className = 'preset-btn';
    document.getElementById('btn-1000').className = 'preset-btn';
    if (amount === 500) {
        document.getElementById('btn-500').className = 'preset-btn active';
    } else if (amount === 1000) {
        document.getElementById('btn-1000').className = 'preset-btn active';
    }
    document.getElementById('customInput').value = '';
}

function customInputChanged() {
    document.getElementById('btn-500').className = 'preset-btn';
    document.getElementById('btn-1000').className = 'preset-btn';
    var inputValue = document.getElementById('customInput').value;
    selectedAmount = parseInt(inputValue);
}

// ---- Donate (requires UIU verification) ----
function submitDonation() {
    if (localStorage.getItem('uiu_verified') !== 'true') {
        openCfVerificationModal();
        return;
    }

    if (!selectedAmount || selectedAmount <= 0) {
        alert('Please select or enter an amount to donate.');
        return;
    }

    var isAnonymous = document.getElementById('anonymousCheck').checked;
    var message = 'You are about to donate ' + selectedAmount.toLocaleString() + ' BDT.';
    if (isAnonymous) message += ' Your donation will be Anonymous.';

    var confirmed = confirm(message + '\n\nProceed?');
    if (confirmed) {
        showCfToast('✅ Thank you! Your donation of ' + selectedAmount.toLocaleString() + ' BDT was successful.');
    }
}

// ---- Start Campaign (requires UIU verification) ----
function startCampaign() {
    if (localStorage.getItem('uiu_verified') !== 'true') {
        openCfVerificationModal();
        return;
    }
    window.location.href = 'start_campaign.html';
}

// ---- Filter Pills ----
function selectFilter(element) {
    var pills = document.getElementsByClassName('filter-pill');
    for (var i = 0; i < pills.length; i++) {
        pills[i].className = 'filter-pill';
    }
    element.className = 'filter-pill active';
}

// ---- Update verification badge in header ----
function updateCfVerificationBadge() {
    var badge = document.getElementById('cf-verification-badge');
    if (!badge) return;
    if (localStorage.getItem('uiu_verified') === 'true') {
        badge.textContent = '✔ UIU Verified';
        badge.className = 'cf-badge verified';
    } else {
        badge.textContent = '⚠ Verify to Donate';
        badge.className = 'cf-badge unverified';
        badge.onclick = function() { openCfVerificationModal(); };
    }
}

// ---- Verification Modal ----
function openCfVerificationModal() {
    var modal = document.getElementById('cf-verification-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeCfVerificationModal() {
    var modal = document.getElementById('cf-verification-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function submitCfVerification() {
    var studentId = document.getElementById('cf-student-id').value.trim();
    var studentEmail = document.getElementById('cf-student-email').value.trim();

    if (!studentId) {
        alert('Please enter your UIU Student ID.');
        return;
    }
    var emailPattern = /^[a-zA-Z0-9._%+-]+@.*uiu.*\.ac\.bd$/;
    if (!studentEmail || !emailPattern.test(studentEmail)) {
        alert('Please enter a valid UIU email (e.g. student@bscse.uiu.ac.bd).');
        return;
    }

    localStorage.setItem('uiu_verified', 'true');
    localStorage.setItem('uiu_student_id', studentId);
    localStorage.setItem('uiu_student_email', studentEmail);

    closeCfVerificationModal();
    updateCfVerificationBadge();
    showCfToast('✅ Verified! You can now donate and start campaigns.');
}

// ---- Toast ----
function showCfToast(message) {
    var toast = document.getElementById('cf-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cf-toast';
        toast.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:14px 24px;border-radius:12px;font-size:14px;font-weight:600;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,0.25);max-width:500px;text-align:center;transition:opacity 0.3s;';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function() { toast.style.opacity = '0'; }, 4000);
}
