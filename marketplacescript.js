/* ================================================================
   Marketplace Script — UIU Friends Network
   Connects to api_loans.php for real data
   ================================================================ */

var currentLoans = [];

function loadLoans(sort) {
  sort = sort || 'latest';
  var grid = document.getElementById('loansGrid');
  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#888;">Loading loan requests…</div>';

  fetch('api_loans.php?sort=' + sort)
    .then(function(r){ return r.json(); })
    .then(function(data){
      currentLoans = data.loans || [];
      renderLoans(currentLoans);
    })
    .catch(function(){
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#e53e3e;">Failed to load loans. Please refresh.</div>';
    });
}

function renderLoans(loans) {
  var grid = document.getElementById('loansGrid');
  if (!loans.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:#888;">No open loan requests at the moment.</div>';
    return;
  }
  grid.innerHTML = loans.map(function(l, idx) {
    var deadline = l.repayment_deadline
      ? new Date(l.repayment_deadline).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})
      : 'Flexible';
    var daysLeft = l.repayment_deadline
      ? Math.max(0, Math.ceil((new Date(l.repayment_deadline) - new Date()) / 86400000))
      : null;
    var urgency = daysLeft !== null && daysLeft <= 7 ? '<span style="color:#e53e3e;font-size:12px;">⚠ '+daysLeft+' days left</span>' : '';
    var photo = l.profile_photo
      ? '<img src="'+l.profile_photo+'" alt="'+l.full_name+'" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">'
      : '<div style="width:44px;height:44px;border-radius:50%;background:#1E3A8A;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">'+l.full_name.split(' ').map(function(n){return n[0];}).join('').substring(0,2)+'</div>';
    var trustPct = l.avg_rating ? Math.round(l.avg_rating/5*100) : 0;

    var offersHTML = '';
    if (l.offers && l.offers.length) {
      offersHTML = l.offers.map(function(o, i){
        var isBest = i === 0;
        return '<div class="offer-item'+(isBest?' best':'')+'">\
          <div class="offer-user">\
            <div class="offer-avatar" style="overflow:hidden;">'+(o.profile_photo?'<img src="'+o.profile_photo+'" style="width:100%;height:100%;object-fit:cover;">':'<span>'+o.full_name[0]+'</span>')+'</div>\
            <span class="offer-name">'+o.full_name+' <span class="offer-trust">('+Math.round(o.avg_rating/5*100)+'% Trust)</span>'+(isBest?'<span class="best-badge">BEST</span>':'')+'</span>\
          </div>\
          <span class="offer-rate">'+(o.interest_rate||0)+'% Interest</span>\
        </div>';
      }).join('');
    } else {
      offersHTML = '<div style="color:#888;font-size:13px;text-align:center;padding:10px;">No offers yet — be the first!</div>';
    }

    return '<div class="expanded-card" id="loanCard'+l.loan_id+'">\
      <div class="card-inner">\
        <div class="card-top">\
          <div class="requester-info">\
            <div class="requester-avatar">'+photo+'</div>\
            <div class="requester-details">\
              <h3>'+l.full_name+'</h3>\
              <div class="requester-meta">\
                <span class="trust-badge">'+trustPct+'% Trust</span>\
                <span class="user-dept">• '+( l.department||'UIU')+'</span>\
              </div>\
            </div>\
          </div>\
          <div class="loan-amount-info">\
            <p class="amount-text">'+Number(l.amount).toLocaleString()+' BDT</p>\
            <p class="expire-text">📅 Repay by '+deadline+'</p>\
            '+urgency+'\
          </div>\
        </div>\
        <div class="detail-boxes">\
          <div class="detail-box"><p class="detail-label">Purpose</p><p class="detail-value">'+l.purpose+'</p></div>\
          <div class="detail-box"><p class="detail-label">Details</p><p class="detail-value">'+(l.reason_details||'—')+'</p></div>\
          <div class="detail-box"><p class="detail-label">Max Interest</p><p class="detail-value">'+(l.max_interest_rate||0)+'%</p></div>\
        </div>\
        <div class="bidding-area">\
          <h4 class="bidding-title"><span class="pulse-dot"></span> Current Loan Offers ('+l.offer_count+')</h4>\
          <div class="offers-list">'+offersHTML+'</div>\
          <div class="bid-control">\
            <div id="bidBanner'+l.loan_id+'" style="display:none;padding:8px 12px;border-radius:6px;font-size:13px;margin-bottom:8px;"></div>\
            <div class="bid-input-wrapper">\
              <input type="number" id="bidInput'+l.loan_id+'" class="bid-input" placeholder="Your interest % offer" min="0" step="0.1">\
              <button class="place-bid-btn" onclick="submitBid('+l.loan_id+')">Place Bid</button>\
            </div>\
          </div>\
        </div>\
      </div>\
    </div>';
  }).join('');
}

async function submitBid(loanId) {
  var input   = document.getElementById('bidInput' + loanId);
  var banner  = document.getElementById('bidBanner' + loanId);
  var rate    = parseFloat(input.value);

  function showB(msg, type) {
    banner.textContent = msg;
    banner.style.background = type==='error'?'#fee2e2':'#d1fae5';
    banner.style.color      = type==='error'?'#991b1b':'#065f46';
    banner.style.display    = 'block';
  }

  if (isNaN(rate) || rate < 0) { showB('Enter a valid interest rate.', 'error'); return; }

  var fd = new FormData();
  fd.append('action', 'bid');
  fd.append('loan_id', loanId);
  fd.append('interest_rate', rate);

  try {
    var r = await fetch('api_loans.php', { method:'POST', body:fd });
    var d = await r.json();
    if (d.success) {
      showB('Bid placed successfully!', 'success');
      input.value = '';
      setTimeout(function(){ loadLoans(currentSort); }, 1000);
    } else {
      showB(d.message || 'Failed to place bid.', 'error');
    }
  } catch(e) {
    showB('Network error.', 'error');
  }
}

function requestLoan() {
  window.location.href = 'deshboard.html#requestLoan';
}

/* Sort buttons */
var currentSort = 'latest';
document.querySelectorAll('.sort-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.sort-btn').forEach(function(b){ b.classList.remove('active'); });
    this.classList.add('active');
    var map = { 'Most Urgent': 'latest', 'Lowest Interest': 'interest', 'Highest Trust Score': 'trust' };
    currentSort = map[this.textContent.trim()] || 'latest';
    loadLoans(currentSort);
  });
});

/* Init */
Auth.init({ requireLogin: true, onReady: function() { loadLoans(); } });
