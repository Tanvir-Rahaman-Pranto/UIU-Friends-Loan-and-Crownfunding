/* ================================================================
   Profile Script — UIU Friends Network
   Connects to api_profile.php
   ================================================================ */

Auth.init({ requireLogin: true, onReady: function(user) {
  if (user) loadProfile(user.user_id);
}});

function loadProfile(userId) {
  fetch('api_profile.php?user_id=' + userId)
    .then(function(r){ return r.json(); })
    .then(function(data){
      if (!data.success) return;
      renderProfile(data.profile, data.stats, data.reviews, data.agreements);
    })
    .catch(function(e){ console.error(e); });
}

function renderProfile(p, stats, reviews, agreements) {
  /* Name / ID */
  document.querySelectorAll('[data-prof="name"]').forEach(function(el){ el.textContent = p.full_name; });
  document.querySelectorAll('[data-prof="id-dept"]').forEach(function(el){ el.textContent = 'ID: '+p.student_id+' | '+p.department; });
  document.querySelectorAll('[data-prof="email"]').forEach(function(el){ el.textContent = p.email; });

  /* Avatar */
  document.querySelectorAll('[data-prof="avatar"]').forEach(function(el){
    if (p.profile_photo) {
      el.style.backgroundImage = "url('" + p.profile_photo + "')";
      el.textContent = '';
    } else {
      el.textContent = p.full_name.split(' ').map(function(n){return n[0];}).join('').substring(0,2).toUpperCase();
    }
  });

  /* Trust score */
  var trust = p.avg_rating ? Math.round(p.avg_rating / 5 * 100) : 0;
  document.querySelectorAll('[data-prof="trust"]').forEach(function(el){ el.textContent = trust + '%'; });
  document.querySelectorAll('[data-prof="rating"]').forEach(function(el){ el.textContent = p.avg_rating ? Number(p.avg_rating).toFixed(1) : '0.0'; });
  document.querySelectorAll('[data-prof="reviews-count"]').forEach(function(el){ el.textContent = p.total_reviews || 0; });

  /* Stats */
  var sl = document.getElementById('statActiveLoans');
  if (sl) sl.textContent = stats.active_loans;
  var sc = document.getElementById('statActiveCampaigns');
  if (sc) sc.textContent = stats.active_campaigns;
  var sd = document.getElementById('statTotalDonated');
  if (sd) sd.textContent = Number(stats.total_donated).toLocaleString() + ' BDT';

  /* Trust bar */
  var bar = document.getElementById('trustBar');
  if (bar) bar.style.width = trust + '%';

  /* Reviews */
  var revContainer = document.getElementById('reviewsList');
  if (revContainer) {
    if (!reviews.length) {
      revContainer.innerHTML = '<p style="color:#888;text-align:center;padding:20px;">No reviews yet.</p>';
    } else {
      revContainer.innerHTML = reviews.map(function(r){
        var stars = '★'.repeat(r.rating) + '☆'.repeat(5-r.rating);
        var date  = new Date(r.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
        var photo = r.reviewer_photo
          ? '<img src="'+r.reviewer_photo+'" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">'
          : '<div style="width:36px;height:36px;border-radius:50%;background:#1E3A8A;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">'+r.reviewer_name[0]+'</div>';
        return '<div style="display:flex;gap:12px;padding:16px 0;border-bottom:1px solid #f1f5f9;">\
          '+photo+'\
          <div style="flex:1;">\
            <div style="display:flex;justify-content:space-between;align-items:center;">\
              <span style="font-weight:600;font-size:14px;">'+r.reviewer_name+'</span>\
              <span style="font-size:12px;color:#888;">'+date+'</span>\
            </div>\
            <div style="color:#f59e0b;font-size:16px;margin:2px 0;">'+stars+'</div>\
            <p style="margin:4px 0 0;font-size:13px;color:#555;">'+r.comment+'</p>\
          </div>\
        </div>';
      }).join('');
    }
  }

  /* Agreements */
  var agContainer = document.getElementById('agreementsList');
  if (agContainer) {
    if (!agreements.length) {
      agContainer.innerHTML = '<p style="color:#888;text-align:center;padding:20px;">No agreements yet.</p>';
    } else {
      agContainer.innerHTML = agreements.map(function(a){
        var statusColors = { pending:'#f59e0b', partial:'#3b82f6', completed:'#10b981', defaulted:'#ef4444' };
        var color = statusColors[a.repayment_status] || '#888';
        return '<div style="padding:14px 0;border-bottom:1px solid #f1f5f9;">\
          <div style="display:flex;justify-content:space-between;align-items:center;">\
            <div>\
              <span style="font-weight:600;font-size:14px;">'+a.borrower_name+' ↔ '+a.lender_name+'</span>\
              <div style="font-size:12px;color:#888;margin-top:2px;">'+Number(a.principal_amount).toLocaleString()+' BDT | Due: '+(a.due_date||'N/A')+'</div>\
            </div>\
            <span style="font-size:12px;font-weight:600;color:'+color+';text-transform:capitalize;background:'+color+'20;padding:3px 10px;border-radius:20px;">'+a.repayment_status+'</span>\
          </div>\
        </div>';
      }).join('');
    }
  }

  /* Verification badge */
  var vb = document.getElementById('verifiedBadge');
  if (vb) vb.style.display = p.is_verified ? 'inline-flex' : 'none';
}
