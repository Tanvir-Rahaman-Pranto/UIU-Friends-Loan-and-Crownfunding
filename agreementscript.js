// ============================================================
//  agreementscript.js  –  UIU Agreement Room
// ============================================================

var currentAgreementId = null;
var agreementData      = null;
var currentUserId      = 0;
var chatRefreshInterval = null;
var lastMessageCount   = 0;

// ── Fetch helper ──────────────────────────────────────────────────
function fetchWithAuth(url, options) {
    options = options || {};
    var method = (options.method || 'GET').toUpperCase();
    if (!options.headers) options.headers = {};
    if (['POST','PUT','DELETE','PATCH'].includes(method)) {
        options.headers['X-CSRF-Token'] = localStorage.getItem('csrf_token') || '';
    }
    options.credentials = 'include';
    return fetch(url, options).then(function(response) {
        return response.json().then(function(data) {
            if (!response.ok) throw new Error(data.message || 'API error');
            return data;
        });
    });
}

// ── Logout ────────────────────────────────────────────────────────
function doLogout(e) {
    e.preventDefault();
    fetchWithAuth('backend/api/auth/logout.php', { method: 'POST' })
        .finally(function() { window.location.href = 'login.html'; });
}

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    // Always auth first, then load agreement
    syncUserProfile().then(function() {
        var params = new URLSearchParams(window.location.search);
        var agreementId = params.get('agreement_id');

        if (agreementId) {
            currentAgreementId = parseInt(agreementId);
            loadAgreementDetails();
        } else {
            // No ID in URL — load list of agreements so user can pick one
            loadAgreementsList();
        }
    });

    var msgInput = document.getElementById('messageInput');
    if (msgInput) {
        msgInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    }
});

function showEmpty() {
    document.getElementById('ag-loading').style.display = 'none';
    document.getElementById('ag-content').style.display = 'none';
    document.getElementById('ag-empty').style.display   = 'block';
}

// ── Load agreements list when no ID in URL ────────────────────────
function loadAgreementsList() {
    fetchWithAuth('backend/api/loan/my_loans.php')
        .then(function(res) {
            var agreements = res.data.agreements || [];
            if (agreements.length === 0) {
                showEmpty();
                return;
            }
            if (agreements.length === 1) {
                // Only one — go straight to it
                currentAgreementId = agreements[0].agreement_id;
                loadAgreementDetails();
                return;
            }
            // Multiple — show picker
            showAgreementPicker(agreements);
        })
        .catch(function(err) {
            document.getElementById('ag-loading').innerHTML =
                '<p style="color:#ef4444;font-size:14px;">Failed to load agreements: ' + err.message + '<br><a href="myloans.html" style="color:#1E3A8A;">Go to My Loans</a></p>';
        });
}

// ── Show a list so user can pick which agreement to open ──────────
function showAgreementPicker(agreements) {
    var loadingEl = document.getElementById('ag-loading');
    loadingEl.innerHTML =
        '<h3 style="color:#1e293b;margin-bottom:16px;">Your Agreements</h3>' +
        '<div style="display:flex;flex-direction:column;gap:10px;max-width:500px;margin:0 auto;">' +
        agreements.map(function(ag) {
            var role  = ag.role === 'borrower' ? 'Borrowed from ' + ag.lender_name : 'Lent to ' + ag.borrower_name;
            var color = ag.repayment_status === 'completed' ? '#10b981' : '#f59e0b';
            return '<a href="agreement.html?agreement_id=' + ag.agreement_id + '" style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:white;border:1px solid #e2e8f0;border-radius:12px;text-decoration:none;color:#1e293b;box-shadow:0 1px 3px rgba(0,0,0,0.06);">' +
                '<div style="text-align:left;">' +
                    '<p style="font-weight:700;margin:0;font-size:14px;">Agreement #' + ag.agreement_id + '</p>' +
                    '<p style="color:#64748b;font-size:12px;margin:2px 0 0;">' + role + '</p>' +
                '</div>' +
                '<div style="text-align:right;">' +
                    '<p style="font-weight:800;color:#1E3A8A;margin:0;font-size:14px;">' + Number(ag.remaining_amount).toLocaleString() + ' BDT left</p>' +
                    '<p style="font-size:11px;font-weight:700;color:' + color + ';margin:2px 0 0;">' + ag.repayment_status.toUpperCase() + '</p>' +
                '</div>' +
            '</a>';
        }).join('') +
        '</div>';
}

// ── Sync header profile ───────────────────────────────────────────
function syncUserProfile() {
    return fetchWithAuth('backend/api/auth/me.php')
        .then(function(res) {
            var user = res.data;
            currentUserId = parseInt(user.user_id) || 0;

            var nameEl = document.getElementById('ag-header-name');
            if (nameEl) nameEl.textContent = user.full_name;

            var trustEl = document.getElementById('ag-header-trust');
            if (trustEl) trustEl.textContent = 'Trust: ' + starString(Math.round(user.avg_rating || 0));

            var avatar = document.getElementById('ag-header-avatar');
            if (avatar) {
                avatar.src = user.profile_photo
                    ? 'uploads/profiles/' + user.profile_photo
                    : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.full_name) + '&background=1E3A8A&color=fff';
            }
        })
        .catch(function() {
            window.location.href = 'login.html';
            return Promise.reject('Not logged in');
        });
}

// ── Load agreement ────────────────────────────────────────────────
function loadAgreementDetails() {
    var loadingEl = document.getElementById('ag-loading');
    if (loadingEl) {
        loadingEl.style.display = 'block';
        loadingEl.innerHTML =
            '<span class="material-symbols-outlined" style="font-size:48px;display:block;margin-bottom:12px;">hourglass_empty</span>' +
            'Loading agreement...';
    }
    document.getElementById('ag-content').style.display = 'none';

    fetchWithAuth('backend/api/loan/agreement.php?agreement_id=' + currentAgreementId)
        .then(function(res) {
            agreementData = res.data;
            renderAgreement(res.data);
            document.getElementById('ag-loading').style.display = 'none';
            document.getElementById('ag-content').style.display = 'block';
            loadChatMessages();
            clearInterval(chatRefreshInterval);
            chatRefreshInterval = setInterval(loadChatMessages, 3000);
        })
        .catch(function(err) {
            document.getElementById('ag-loading').innerHTML =
                '<span class="material-symbols-outlined" style="font-size:48px;display:block;margin-bottom:12px;color:#ef4444;">error</span>' +
                '<p style="color:#ef4444;font-weight:700;margin-bottom:8px;">Could not load agreement</p>' +
                '<p style="color:#64748b;font-size:13px;margin-bottom:20px;">' + err.message + '</p>' +
                '<a href="myloans.html" style="background:#1E3A8A;color:white;padding:10px 24px;border-radius:10px;text-decoration:none;font-weight:700;">← Back to My Loans</a>';
        });
}

// ── Render all agreement data ─────────────────────────────────────
function renderAgreement(data) {
    var ag = data.agreement;
    var totalRepaid = parseFloat(data.total_repaid) || 0;
    var balanceDue  = parseFloat(data.balance_due)  || 0;

    // Header title + ref
    setText('ag-title',  'Agreement: ' + ag.purpose);
    setText('ag-ref',    'Ref ID: UIU-AG-' + String(ag.agreement_id).padStart(5, '0'));

    // Status badge
    var badge   = document.getElementById('statusBadge');
    var dot     = document.getElementById('pulseDot');
    var statusEl = document.getElementById('statusText');
    var statusMap = {
        pending:   { label: 'Active – Pending Repayment', bg: '#fffbeb', border: '#fef3c7', color: '#b45309', dot: '#d97706' },
        partial:   { label: 'Partially Repaid',           bg: '#eff6ff', border: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
        completed: { label: 'Completed',                  bg: '#f0fdf4', border: '#bbf7d0', color: '#047857', dot: '#10b981' }
    };
    var s = statusMap[ag.repayment_status] || statusMap.pending;
    if (badge)  { badge.style.cssText = 'background:' + s.bg + ';border-color:' + s.border + ';color:' + s.color + ';'; }
    if (dot)    { dot.style.backgroundColor = s.dot; }
    if (statusEl) statusEl.textContent = 'Status: ' + s.label;

    // Contract summary
    setText('ag-borrower-name', ag.borrower_name);
    setText('ag-lender-name',   ag.lender_name);
    setText('ag-borrower-trust', starString(0)); // extend later with per-user rating
    setText('ag-lender-trust',   starString(0));
    setText('ag-principal',     fmtBDT(ag.principal_amount));
    setText('ag-total-payable', fmtBDT(ag.total_payable));
    setText('ag-repaid',        fmtBDT(totalRepaid));

    var interestAmt = parseFloat(ag.total_payable) - parseFloat(ag.principal_amount);
    setText('ag-interest', ag.interest_rate + '% (' + fmtBDT(interestAmt) + ')');

    var dueEl = document.getElementById('ag-due-date');
    if (dueEl) dueEl.innerHTML = '<span class="material-symbols-outlined">calendar_today</span> ' + ag.due_date;

    // Chat partner
    var partnerName = (currentUserId === parseInt(ag.borrower_id)) ? ag.lender_name : ag.borrower_name;
    setText('ag-chat-title', 'Secure Chat with ' + partnerName);

    var chatAvatar = document.getElementById('ag-chat-avatar');
    if (chatAvatar) {
        chatAvatar.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(partnerName) + '&background=1E3A8A&color=fff';
    }

    // Repayment history
    renderRepaymentHistory(data.repayments || []);

    // Instructions + action button
    renderActionArea(ag, balanceDue, partnerName);
}

function renderRepaymentHistory(repayments) {
    var el = document.getElementById('ag-repayment-list');
    if (!el) return;
    if (repayments.length === 0) {
        el.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:12px;">No repayments recorded yet.</p>';
        return;
    }
    el.innerHTML = repayments.map(function(r) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f1f5f9;">' +
            '<div>' +
                '<p style="margin:0;font-weight:700;color:#1e293b;font-size:13px;">' + fmtBDT(r.amount_paid) + '</p>' +
                '<p style="margin:0;font-size:11px;color:#94a3b8;">' + r.payment_method + ' · ' + r.paid_on + '</p>' +
            '</div>' +
            '<span style="font-size:10px;background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:4px;font-weight:700;">Paid</span>' +
        '</div>';
    }).join('');
}

function renderActionArea(ag, balanceDue, partnerName) {
    var btn       = document.getElementById('confirmBtn');
    var waitText  = document.getElementById('waitingText');
    var spinner   = document.getElementById('spinnerIcon');
    var instrBody = document.getElementById('ag-instructions-body');
    var instrTitle= document.getElementById('ag-instructions-title');

    if (!btn) return;

    var isBorrower = (parseInt(ag.borrower_id) === currentUserId);

    if (ag.repayment_status === 'completed') {
        btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Agreement Fully Settled';
        btn.style.background = '#10b981';
        btn.disabled = true;
        if (spinner)  { spinner.className = 'material-symbols-outlined'; spinner.textContent = 'check_circle'; }
        if (waitText)  waitText.textContent = 'This loan has been fully repaid. Thank you for using UIU Friends!';
        if (instrTitle) instrTitle.textContent = 'Agreement Closed';
        if (instrBody)  instrBody.textContent  = 'All payments have been settled. No further action required.';
        document.getElementById('ag-payment-methods').innerHTML = '';
        return;
    }

    if (isBorrower) {
        // Borrower can repay
        btn.innerHTML = '<span class="material-symbols-outlined">payments</span> Repay Installment – ' + fmtBDT(balanceDue) + ' remaining';
        btn.style.background = '#1E3A8A';
        btn.disabled = false;
        btn.onclick  = function() { triggerRepay(balanceDue); };
        if (spinner)  { spinner.className = 'material-symbols-outlined'; spinner.textContent = 'hourglass_empty'; }
        if (waitText)  waitText.textContent = 'Outstanding balance: ' + fmtBDT(balanceDue) + '. Transfer to ' + partnerName + ' using one of the methods below.';
        if (instrTitle) instrTitle.textContent = 'How to Repay ' + partnerName;
        if (instrBody)  instrBody.textContent  = 'Transfer ' + fmtBDT(balanceDue) + ' to ' + partnerName + ' using one of the payment methods below. Include "Loan-' + ag.agreement_id + '" in the reference field, then click the button above to confirm.';

        // Load lender payment methods
        loadLenderPaymentMethods(parseInt(ag.lender_id));
    } else {
        // Lender is waiting
        btn.innerHTML = '<span class="material-symbols-outlined">hourglass_top</span> Awaiting Repayment from ' + partnerName;
        btn.style.background = '#64748b';
        btn.disabled = true;
        if (spinner)  { spinner.className = 'material-symbols-outlined animate-spin'; spinner.textContent = 'progress_activity'; }
        if (waitText)  waitText.textContent = 'Outstanding: ' + fmtBDT(balanceDue) + '. Waiting for ' + partnerName + ' to repay.';
        if (instrTitle) instrTitle.textContent = 'Your Payment Details';
        if (instrBody)  instrBody.textContent  = partnerName + ' will transfer the funds to your payment methods below. You will see repayments appear in the history section.';

        // Load own payment methods for lender to see/share
        loadLenderPaymentMethods(currentUserId);
    }
}

function loadLenderPaymentMethods(userId) {
    // Fetch payment methods for display in instructions
    fetchWithAuth('backend/api/user/payment_methods.php')
        .then(function(res) {
            var methods = (res.data || []).filter(function(m) {
                // If viewing as borrower, show lender methods — we can only fetch current user's own
                // So for borrower, we show lender methods from agreement data (which we don't have separately)
                // For lender, show own methods
                return true;
            });
            renderPaymentMethods(methods);
        })
        .catch(function() {
            document.getElementById('ag-payment-methods').innerHTML =
                '<p style="font-size:12px;color:#94a3b8;">Payment method details not available. Use the chat to coordinate.</p>';
        });
}

function renderPaymentMethods(methods) {
    var el = document.getElementById('ag-payment-methods');
    if (!el) return;
    if (!methods || methods.length === 0) {
        el.innerHTML = '<p style="font-size:12px;color:#94a3b8;margin-top:8px;">No payment methods on file. Use the chat to share account details.</p>';
        return;
    }
    var labels = { bkash: 'bKash', nagad: 'Nagad', bank: 'Bank Transfer', cash: 'Cash' };
    el.innerHTML = methods.map(function(m) {
        return '<div class="account-box">' +
            '<p class="account-label">' + (labels[m.type] || m.type) + (m.is_default ? ' ★' : '') + '</p>' +
            '<p class="account-number">' + m.account_number + '</p>' +
            '<p style="font-size:11px;color:#94a3b8;margin:2px 0 0;">' + m.account_name + '</p>' +
        '</div>';
    }).join('');
}

// ── Repay ─────────────────────────────────────────────────────────
function triggerRepay(balanceDue) {
    var inputAmt = prompt('Enter repayment amount (BDT):\nRemaining balance: ' + fmtBDT(balanceDue), balanceDue.toFixed(2));
    if (inputAmt === null) return;
    var amount = parseFloat(inputAmt);
    if (isNaN(amount) || amount <= 0) { alert('Enter a valid amount.'); return; }
    if (amount > balanceDue + 0.01)   { alert('Amount exceeds outstanding balance.'); return; }

    var method = prompt('Payment method (bkash / nagad / bank / cash):', 'bkash') || 'bkash';

    fetchWithAuth('backend/api/loan/repay.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            agreement_id:    currentAgreementId,
            amount_paid:     amount,
            payment_method:  method,
            transaction_ref: 'TXN_AG_' + Date.now(),
            note:            'Repayment via Agreement Room.'
        })
    })
    .then(function() {
        alert('Repayment of ' + fmtBDT(amount) + ' recorded successfully!');
        loadAgreementDetails();
    })
    .catch(function(err) {
        alert('Repayment failed: ' + err.message);
    });
}

// ── Chat ──────────────────────────────────────────────────────────
function loadChatMessages() {
    if (!currentAgreementId) return;
    fetchWithAuth('backend/api/loan/messages.php?agreement_id=' + currentAgreementId)
        .then(function(res) {
            var messages = res.data || [];
            if (messages.length === lastMessageCount) return; // no new messages
            lastMessageCount = messages.length;

            var chatEl = document.getElementById('chatMessages');
            if (!chatEl) return;
            var wasAtBottom = (chatEl.scrollTop + chatEl.clientHeight >= chatEl.scrollHeight - 20);

            if (messages.length === 0) {
                chatEl.innerHTML =
                    '<div class="chat-system-msg"><span class="system-tag">Agreement Formed</span></div>' +
                    '<p class="chat-hint" style="text-align:center;font-size:12px;color:#94a3b8;padding:8px;">No messages yet. Say hello!</p>';
                return;
            }

            chatEl.innerHTML =
                '<div class="chat-system-msg"><span class="system-tag">Agreement Formed</span></div>' +
                messages.map(function(msg) {
                    var timeStr = new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    var cls = msg.is_mine ? 'msg-row mine' : 'msg-row';
                    return '<div class="' + cls + '">' +
                        (!msg.is_mine ? '<div class="msg-avatar"><img src="https://ui-avatars.com/api/?name=' + encodeURIComponent(msg.sender_name) + '&background=1E3A8A&color=fff" alt=""></div>' : '') +
                        '<div class="msg-bubble">' +
                            escapeHtml(msg.content) +
                            '<p class="msg-time">' + timeStr + '</p>' +
                        '</div>' +
                    '</div>';
                }).join('');

            if (wasAtBottom) chatEl.scrollTop = chatEl.scrollHeight;
        })
        .catch(function(err) { console.error('Chat error:', err); });
}

function sendMessage() {
    var input = document.getElementById('messageInput');
    if (!input) return;
    var text = input.value.trim();
    if (!text || !currentAgreementId) return;

    input.value = '';
    fetchWithAuth('backend/api/loan/messages.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agreement_id: currentAgreementId, content: text })
    })
    .then(function() { loadChatMessages(); })
    .catch(function(err) {
        input.value = text; // restore on failure
        alert('Send failed: ' + err.message);
    });
}

// ── Utilities ─────────────────────────────────────────────────────
function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
}

function fmtBDT(amount) {
    return Number(amount).toLocaleString() + ' BDT';
}

function starString(n) {
    var s = '';
    for (var i = 0; i < 5; i++) s += i < n ? '★' : '☆';
    return s;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
