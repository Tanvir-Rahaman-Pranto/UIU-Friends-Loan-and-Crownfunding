/* ================================================================
   Marketplace Script — UIU Friends Network
   Connects to api_loans.php (GET=list, POST=create/bid)
   Schema refs:
     loan_request: loan_id, borrower_id, amount, purpose,
                   reason_details, repayment_deadline,
                   max_interest_rate, conditions, status(open/funded/closed/cancelled)
     loan_offer:   offer_id, loan_id, lender_id, interest_rate,
                   conditions, message_to_borrower,
                   status(pending/accepted/rejected/withdrawn)
     user:         avg_rating(float 0-5), total_reviews(int)
   ================================================================ */

'use strict';

/* ── State ── */
var currentSort     = 'latest';
var currentCategory = '';
var searchTimer     = null;


/* ── Mobile sidebar ── */
var sidebar    = document.getElementById('sidebar');
var backdrop   = document.getElementById('sidebarBackdrop');
var hamburger  = document.getElementById('hamburgerBtn');
var closeBtn   = document.getElementById('sidebarCloseBtn');

function openSidebar()  { sidebar.classList.add('open');  backdrop.classList.add('active'); }
function closeSidebar() { sidebar.classList.remove('open'); backdrop.classList.remove('active'); }

if (hamburger) hamburger.addEventListener('click', openSidebar);
if (closeBtn)  closeBtn.addEventListener('click',  closeSidebar);
if (backdrop)  backdrop.addEventListener('click',  closeSidebar);


/* ── Auth init ── */
Auth.init({
    requireLogin: true,
    onReady: function(user) {
        /* Populate trust score from avg_rating (float 0-5) */
        var rating  = parseFloat(user.avg_rating  || 0).toFixed(1);
        var reviews = parseInt(user.total_reviews  || 0);

        var el = document.getElementById('sidebarRating');
        var rv = document.getElementById('sidebarReviews');
        var nv = document.getElementById('navRating');

        if (el) el.textContent = rating + '/5';
        if (rv) rv.textContent = '(' + reviews + ')';
        if (nv) nv.textContent = rating;

        loadLoans();
    }
});


/* ════════════════════════════════════════════
   LOAD & RENDER LOANS
   ════════════════════════════════════════════ */
function loadLoans() {
    var grid   = document.getElementById('loansGrid');
    var search = document.getElementById('searchInput').value.trim();

    grid.innerHTML = '<div class="grid-loading">Loading loan requests…</div>';

    var url = 'api_loans.php?sort=' + encodeURIComponent(currentSort)
            + '&category=' + encodeURIComponent(currentCategory)
            + (search ? '&search=' + encodeURIComponent(search) : '');

    fetch(url)
        .then(function(r) { return r.text(); })
        .then(function(text) {
            var data;
            try { data = JSON.parse(text); }
            catch (e) {
                console.error('Non-JSON from api_loans.php:', text);
                grid.innerHTML = '<div class="grid-error">Server error. Please refresh.</div>';
                return;
            }
            if (!data.success) {
                grid.innerHTML = '<div class="grid-error">' + escHtml(data.message || 'Failed to load.') + '</div>';
                return;
            }
            renderLoans(data.loans || []);
        })
        .catch(function(err) {
            console.error('Network error:', err);
            grid.innerHTML = '<div class="grid-error">Network error. Please check your connection.</div>';
        });
}


function renderLoans(loans) {
    var grid = document.getElementById('loansGrid');
    if (!loans.length) {
        grid.innerHTML = '<div class="grid-empty">No open loan requests match your filters.<br>Be the first to <button onclick="openLoanModal()" class="inline-link">post a request</button>.</div>';
        return;
    }
    grid.innerHTML = loans.map(buildCard).join('');
}


function buildCard(l) {
    /* Deadline display */
    var deadline = l.repayment_deadline
        ? new Date(l.repayment_deadline).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
        : 'Flexible';

    /* Urgency badge — warn if ≤7 days */
    var urgencyHTML = '';
    if (l.repayment_deadline) {
        var daysLeft = Math.ceil((new Date(l.repayment_deadline) - new Date()) / 86400000);
        if (daysLeft <= 7 && daysLeft >= 0)
            urgencyHTML = '<span class="urgency-badge">⚠ ' + daysLeft + ' day' + (daysLeft !== 1 ? 's' : '') + ' left</span>';
        else if (daysLeft < 0)
            urgencyHTML = '<span class="urgency-badge overdue">Overdue</span>';
    }

    /* Avatar — profile_photo or initials */
    var initials = makeInitials(l.full_name);
    var avatarHTML = l.profile_photo
        ? '<img src="' + escHtml(l.profile_photo) + '" alt="' + escHtml(l.full_name) + '" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">'
        : '<span style="font-size:18px;font-weight:700;color:#fff;">' + initials + '</span>';

    /* avg_rating is float 0-5 (NOT 0-100) */
    var rating  = parseFloat(l.avg_rating || 0).toFixed(1);

    /* Offers HTML */
    var offersHTML = '';
    if (l.offers && l.offers.length) {
        offersHTML = l.offers.map(function(o, i) {
            var isBest     = i === 0;
            var oInitials  = makeInitials(o.full_name);
            var oAvatarHTML = o.profile_photo
                ? '<img src="' + escHtml(o.profile_photo) + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">'
                : '<span>' + oInitials + '</span>';
            var oRating = parseFloat(o.avg_rating || 0).toFixed(1);
            return '<div class="offer-item' + (isBest ? ' best' : '') + '">'
                +    '<div class="offer-user">'
                +      '<div class="offer-avatar">' + oAvatarHTML + '</div>'
                +      '<div>'
                +        '<span class="offer-name">' + escHtml(o.full_name) + '</span>'
                +        '<span class="offer-trust"> · ' + oRating + '/5</span>'
                +        (isBest ? '<span class="best-badge">BEST</span>' : '')
                +      '</div>'
                +    '</div>'
                +    '<span class="offer-rate">' + parseFloat(o.interest_rate || 0).toFixed(1) + '% interest</span>'
                + '</div>';
        }).join('');
    } else {
        offersHTML = '<div class="no-offers">No offers yet — be the first to bid!</div>';
    }

    var loanId = l.loan_id;

    return '<div class="expanded-card" id="loanCard' + loanId + '">'
        +    '<div class="card-inner">'

        /* ── Top row: user + amount ── */
        +      '<div class="card-top">'
        +        '<div class="requester-info">'
        +          '<div class="requester-avatar">' + avatarHTML + '</div>'
        +          '<div class="requester-details">'
        +            '<h3>' + escHtml(l.full_name) + '</h3>'
        +            '<div class="requester-meta">'
        +              '<span class="trust-badge">' + rating + '/5 ★</span>'
        +              '<span class="user-dept">· ' + escHtml(l.department || 'UIU') + '</span>'
        +              '<span class="views-count">· ' + l.views_count + ' views</span>'
        +            '</div>'
        +          '</div>'
        +        '</div>'
        +        '<div class="loan-amount-info">'
        +          '<p class="amount-text">' + Number(l.amount).toLocaleString() + ' <span class="bdt">BDT</span></p>'
        +          '<p class="expire-text">📅 Repay by ' + deadline + '</p>'
        +          urgencyHTML
        +        '</div>'
        +      '</div>'

        /* ── Detail boxes: purpose / details / max interest ── */
        +      '<div class="detail-boxes">'
        +        '<div class="detail-box"><p class="detail-label">Purpose</p><p class="detail-value">' + escHtml(l.purpose || '—') + '</p></div>'
        +        '<div class="detail-box"><p class="detail-label">Details</p><p class="detail-value">' + escHtml(l.reason_details || '—') + '</p></div>'
        +        '<div class="detail-box"><p class="detail-label">Max Interest</p><p class="detail-value interest-val">' + parseFloat(l.max_interest_rate || 0).toFixed(1) + '%</p></div>'
        +      '</div>'

        /* ── Conditions row (shown only if set) ── */
        + (l.conditions ? '<div class="conditions-row"><span class="conditions-label">Conditions:</span> ' + escHtml(l.conditions) + '</div>' : '')

        /* ── Bidding area ── */
        +      '<div class="bidding-area">'
        +        '<h4 class="bidding-title"><span class="pulse-dot"></span> Current Offers (' + l.offer_count + ')</h4>'
        +        '<div class="offers-list">' + offersHTML + '</div>'

        /* Bid input — message_to_borrower is optional field in loan_offer */
        +        '<div class="bid-control">'
        +          '<div id="bidBanner' + loanId + '" class="bid-banner" style="display:none;"></div>'
        +          '<div class="bid-input-row">'
        +            '<input type="number" id="bidRate' + loanId + '" class="bid-input" placeholder="Your interest % (e.g. 3)" min="0" step="0.1">'
        +            '<input type="text"   id="bidMsg'  + loanId + '" class="bid-msg-input" placeholder="Message to borrower (optional)">'
        +            '<button class="place-bid-btn" data-loan-id="' + loanId + '">Place Bid</button>'
        +          '</div>'
        +        '</div>'

        +      '</div>'  /* bidding-area */
        +    '</div>'    /* card-inner */
        + '</div>';      /* expanded-card */
}


/* ── Event delegation for Place Bid buttons ── */
document.getElementById('loansGrid').addEventListener('click', function(e) {
    var btn = e.target.closest('.place-bid-btn');
    if (btn) submitBid(parseInt(btn.dataset.loanId));
});


/* ════════════════════════════════════════════
   SUBMIT BID
   POST to api_loans.php with action=bid
   Fields: loan_id, interest_rate, message_to_borrower (optional)
   ════════════════════════════════════════════ */
async function submitBid(loanId) {
    var rateEl  = document.getElementById('bidRate'   + loanId);
    var msgEl   = document.getElementById('bidMsg'    + loanId);
    var banner  = document.getElementById('bidBanner' + loanId);
    var btn     = document.querySelector('[data-loan-id="' + loanId + '"]');
    var rate    = parseFloat(rateEl.value);

    function showBidBanner(msg, type) {
        banner.textContent  = msg;
        banner.className    = 'bid-banner bid-banner--' + type;
        banner.style.display = 'block';
    }

    if (isNaN(rate) || rate < 0) {
        showBidBanner('Please enter a valid interest rate (0 or higher).', 'error');
        return;
    }

    btn.disabled    = true;
    btn.textContent = 'Submitting…';

    var fd = new FormData();
    fd.append('action',              'bid');
    fd.append('loan_id',             loanId);
    fd.append('interest_rate',       rate);
    fd.append('message_to_borrower', msgEl ? msgEl.value.trim() : '');

    try {
        var r    = await fetch('api_loans.php', { method: 'POST', body: fd });
        var text = await r.text();
        var d;
        try { d = JSON.parse(text); }
        catch (e) {
            console.error('Non-JSON from bid:', text);
            showBidBanner('Unexpected server response.', 'error');
            return;
        }

        if (d.success) {
            showBidBanner(d.message || 'Bid placed!', 'success');
            rateEl.value = '';
            if (msgEl) msgEl.value = '';
            /* Refresh list after 1.2s so updated offer count is shown */
            setTimeout(loadLoans, 1200);
        } else {
            showBidBanner(d.message || 'Failed to place bid.', 'error');
        }
    } catch (err) {
        console.error('Network error placing bid:', err);
        showBidBanner('Network error. Please try again.', 'error');
    } finally {
        btn.disabled    = false;
        btn.textContent = 'Place Bid';
    }
}


/* ════════════════════════════════════════════
   LOAN REQUEST MODAL
   POST to api_loans.php with action=create
   Fields match loan_request columns exactly
   ════════════════════════════════════════════ */
function openLoanModal() {
    document.getElementById('loanModal').style.display = 'flex';
}

function closeLoanModal() {
    document.getElementById('loanModal').style.display  = 'none';
    document.getElementById('loanModalBanner').style.display = 'none';
}

document.getElementById('openLoanModalBtn').addEventListener('click', openLoanModal);
document.getElementById('loanModalCloseBtn').addEventListener('click', closeLoanModal);
document.getElementById('lm_cancel').addEventListener('click', closeLoanModal);

document.getElementById('loanModal').addEventListener('click', function(e) {
    if (e.target === this) closeLoanModal();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeLoanModal();
});

document.getElementById('lm_submit').addEventListener('click', async function() {
    var btn    = this;
    var banner = document.getElementById('loanModalBanner');
    var amount  = document.getElementById('lm_amount').value.trim();
    var purpose = document.getElementById('lm_purpose').value.trim();

    function showB(msg, type) {
        banner.textContent   = msg;
        banner.className     = 'form-banner form-banner--' + type;
        banner.style.display = 'block';
        banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (!amount || !purpose) { showB('Amount and purpose are required.', 'error'); return; }
    if (parseFloat(amount) <= 0) { showB('Amount must be greater than zero.', 'error'); return; }

    btn.disabled    = true;
    btn.textContent = 'Submitting…';

    var fd = new FormData();
    fd.append('action',              'create');
    fd.append('amount',              amount);
    fd.append('purpose',             purpose);
    fd.append('reason_details',      document.getElementById('lm_details').value.trim());
    fd.append('repayment_deadline',  document.getElementById('lm_deadline').value);
    fd.append('max_interest_rate',   document.getElementById('lm_interest').value || '0');
    fd.append('conditions',          document.getElementById('lm_conditions').value.trim());

    try {
        var r    = await fetch('api_loans.php', { method: 'POST', body: fd });
        var text = await r.text();
        var d;
        try { d = JSON.parse(text); }
        catch(e) { showB('Unexpected server response.', 'error'); return; }

        if (d.success) {
            showB('Loan request posted! It is now live on the marketplace.', 'success');
            ['lm_amount','lm_purpose','lm_details','lm_deadline','lm_interest','lm_conditions'].forEach(function(id) {
                document.getElementById(id).value = '';
            });
            setTimeout(function() { closeLoanModal(); loadLoans(); }, 1500);
        } else {
            showB(d.message || 'Failed to post request.', 'error');
        }
    } catch(err) {
        showB('Network error. Please try again.', 'error');
    } finally {
        btn.disabled    = false;
        btn.textContent = 'Submit Request';
    }
});


/* ════════════════════════════════════════════
   SORT BUTTONS
   ════════════════════════════════════════════ */
document.querySelectorAll('.sort-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.sort-btn').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        currentSort = this.dataset.sort || 'latest';
        loadLoans();
    });
});


/* ════════════════════════════════════════════
   CATEGORY TAGS
   ════════════════════════════════════════════ */
document.querySelectorAll('.category-tag').forEach(function(tag) {
    tag.addEventListener('click', function() {
        document.querySelectorAll('.category-tag').forEach(function(t) { t.classList.remove('active'); });
        this.classList.add('active');
        currentCategory = this.dataset.cat || '';
        loadLoans();
    });
});


/* ════════════════════════════════════════════
   SEARCH — debounced 400ms
   ════════════════════════════════════════════ */
document.getElementById('searchInput').addEventListener('input', function() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadLoans, 400);
});


/* ── Helpers ── */
function makeInitials(name) {
    if (!name) return '?';
    return name.trim().split(/\s+/).map(function(n){ return n[0]; }).join('').substring(0,2).toUpperCase();
}

function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}