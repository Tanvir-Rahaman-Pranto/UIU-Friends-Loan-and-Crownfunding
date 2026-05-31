/* ================================================================
   Agreement & Transfer Room Script — UIU Friends Network
   Connects to api_agreements.php
   ================================================================ */

var currentAgreement = null;
var currentUserId    = null;

Auth.init({ requireLogin: true, onReady: function(user) {
  if (user) {
    currentUserId = user.user_id;
    loadAgreements();
  }
}});

function loadAgreements() {
  fetch('api_agreements.php')
    .then(function(r){ return r.json(); })
    .then(function(data){
      if (!data.success) return;
      renderAgreementList(data.agreements);
    })
    .catch(function(e){ console.error(e); });
}

function renderAgreementList(agreements) {
  var container = document.getElementById('agreementListContainer');
  if (!container) return;

  if (!agreements.length) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:#888;">You have no agreements yet.<br><a href="marketplace.html" style="color:#1E3A8A;font-weight:600;">Browse loan requests →</a></div>';
    return;
  }

  container.innerHTML = agreements.map(function(a) {
    var statusColors = { pending:'#f59e0b', partial:'#3b82f6', completed:'#10b981', defaulted:'#ef4444' };
    var color = statusColors[a.repayment_status] || '#888';
    var isLender = a.lender_id == currentUserId;
    var counterpart = isLender ? a.borrower_name : a.lender_name;
    var role = isLender ? 'Lender' : 'Borrower';
    var pct = a.total_payable > 0 ? 0 : 0;
    if (a.repayments) {
      var paid = a.repayments.reduce(function(sum, r){ return sum + parseFloat(r.amount_paid); }, 0);
      pct = a.total_payable > 0 ? Math.min(100, Math.round(paid / a.total_payable * 100)) : 0;
    }

    return '<div class="agreement-item" onclick="openAgreement('+JSON.stringify(a).replace(/"/g,'&quot;')+')" style="background:#fff;border-radius:12px;padding:18px;margin-bottom:12px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.07);border-left:4px solid '+color+';transition:box-shadow .2s;" onmouseover="this.style.boxShadow=\'0 4px 20px rgba(0,0,0,.14)\'" onmouseout="this.style.boxShadow=\'0 2px 8px rgba(0,0,0,.07)\'">\
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">\
        <div>\
          <div style="font-weight:700;font-size:15px;">'+a.purpose+'</div>\
          <div style="font-size:12px;color:#888;margin-top:2px;">'+role+' • with <strong>'+counterpart+'</strong></div>\
        </div>\
        <div style="text-align:right;">\
          <div style="font-weight:800;font-size:16px;">'+Number(a.principal_amount).toLocaleString()+' BDT</div>\
          <span style="font-size:11px;font-weight:600;color:'+color+';background:'+color+'20;padding:2px 8px;border-radius:20px;text-transform:capitalize;">'+a.repayment_status+'</span>\
        </div>\
      </div>\
      <div style="margin-top:12px;">\
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#888;margin-bottom:4px;"><span>Repayment Progress</span><span>'+pct+'%</span></div>\
        <div style="height:6px;background:#e5e7eb;border-radius:3px;"><div style="width:'+pct+'%;height:100%;background:'+color+';border-radius:3px;"></div></div>\
      </div>\
    </div>';
  }).join('');
}

function openAgreement(agreement) {
  currentAgreement = agreement;
  var panel = document.getElementById('agreementDetailPanel');
  if (!panel) return;
  panel.style.display = 'block';
  renderAgreementDetail(agreement);
}

function renderAgreementDetail(a) {
  var isLender = a.lender_id == currentUserId;
  var counterpartName = isLender ? a.borrower_name : a.lender_name;
  var counterpartId   = isLender ? a.borrower_id  : a.lender_id;

  /* Title */
  var titleEl = document.getElementById('detailTitle');
  if (titleEl) titleEl.textContent = a.purpose;

  /* Summary */
  var sumEl = document.getElementById('detailSummary');
  if (sumEl) sumEl.innerHTML =
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
    detail_box('Principal',  Number(a.principal_amount).toLocaleString() + ' BDT') +
    detail_box('Interest',   (a.interest_rate||0) + '%') +
    detail_box('Total Payable', Number(a.total_payable||0).toLocaleString() + ' BDT') +
    detail_box('Due Date',   a.due_date || 'N/A') +
    detail_box('Borrower',   a.borrower_name) +
    detail_box('Lender',     a.lender_name) +
    '</div>';

  /* Repayments */
  var repEl = document.getElementById('repaymentHistory');
  if (repEl) {
    if (!a.repayments || !a.repayments.length) {
      repEl.innerHTML = '<p style="color:#888;font-size:13px;">No repayments recorded yet.</p>';
    } else {
      var totalPaid = 0;
      repEl.innerHTML = a.repayments.map(function(r){
        totalPaid += parseFloat(r.amount_paid);
        return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;">\
          <span>'+r.paid_on+' via '+r.payment_method+'</span>\
          <span style="font-weight:600;color:#10b981;">+'+Number(r.amount_paid).toLocaleString()+' BDT</span>\
        </div>';
      }).join('') + '<div style="padding:10px 0;font-size:13px;font-weight:700;color:#1E3A8A;">Total Paid: '+Number(totalPaid).toLocaleString()+' BDT</div>';
    }
  }

  /* Show/hide repayment button */
  var repBtn = document.getElementById('repaymentBtn');
  if (repBtn) repBtn.style.display = !isLender && a.repayment_status !== 'completed' ? 'block' : 'none';

  /* Messages */
  var chatEl = document.getElementById('chatMessages');
  if (chatEl) {
    chatEl.innerHTML = '';
    (a.messages || []).forEach(function(m){
      var mine = m.sender_id == currentUserId;
      chatEl.innerHTML += '<div class="msg-row '+(mine?'mine':'theirs')+'">\
        <div class="msg-bubble">'+m.content+'<p class="msg-time">'+new Date(m.sent_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+'</p></div>\
      </div>';
    });
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  /* Store counterpart for messaging */
  document.getElementById('chatMessages').dataset.counterpart = counterpartId;
  document.getElementById('chatMessages').dataset.agreementId = a.agreement_id;
}

function detail_box(label, value) {
  return '<div style="background:#f8fafc;border-radius:8px;padding:12px;">\
    <div style="font-size:11px;color:#888;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px;">'+label+'</div>\
    <div style="font-weight:700;font-size:15px;">'+value+'</div>\
  </div>';
}

async function sendMessage() {
  var input   = document.getElementById('messageInput');
  var msg     = input.value.trim();
  var chat    = document.getElementById('chatMessages');
  if (!msg || !chat) return;

  var agreeId     = chat.dataset.agreementId;
  var counterpart = chat.dataset.counterpart;

  var fd = new FormData();
  fd.append('action','message');
  fd.append('agreement_id', agreeId);
  fd.append('receiver_id',  counterpart);
  fd.append('content',      msg);

  try {
    var r = await fetch('api_agreements.php',{method:'POST',body:fd});
    var d = await r.json();
    if (d.success) {
      input.value = '';
      var now = new Date();
      var time = now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
      chat.innerHTML += '<div class="msg-row mine"><div class="msg-bubble">'+msg+'<p class="msg-time">'+time+'</p></div></div>';
      chat.scrollTop = chat.scrollHeight;
    }
  } catch(e) {}
}

document.addEventListener('DOMContentLoaded', function() {
  var msgInput = document.getElementById('messageInput');
  if (msgInput) {
    msgInput.addEventListener('keypress', function(e){
      if (e.key === 'Enter') sendMessage();
    });
  }
});

async function confirmTransfer() {
  if (!currentAgreement) return;
  var confirmed = confirm('Confirm you have sent the payment for Agreement #' + currentAgreement.agreement_id + '?');
  if (!confirmed) return;

  var method = prompt('Payment method? (bkash / nagad / bank / cash)', 'bkash');
  var txRef  = prompt('Transaction reference (optional):', '');
  var amount = currentAgreement.total_payable || currentAgreement.principal_amount;

  var fd = new FormData();
  fd.append('action','repayment');
  fd.append('agreement_id', currentAgreement.agreement_id);
  fd.append('amount_paid', amount);
  fd.append('payment_method', method || 'other');
  fd.append('transaction_ref', txRef || '');

  try {
    var r = await fetch('api_agreements.php',{method:'POST',body:fd});
    var d = await r.json();
    if (d.success) {
      alert('Repayment recorded! The agreement status has been updated.');
      loadAgreements();
    } else {
      alert(d.message || 'Failed to record repayment.');
    }
  } catch(e) { alert('Network error.'); }
}
