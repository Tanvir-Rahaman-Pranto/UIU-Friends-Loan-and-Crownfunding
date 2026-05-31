/* ================================================================
   Crowdfunding Script — UIU Friends Network
   Connects to api_campaigns.php
   ================================================================ */

var selectedCampaignId = null;
var selectedAmount     = 0;

function loadCampaigns(filter) {
  filter = filter || 'all';
  var grid = document.getElementById('campaignsGrid');
  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#888;">Loading campaigns…</div>';

  fetch('api_campaigns.php?filter=' + filter)
    .then(function(r){ return r.json(); })
    .then(function(data){
      renderCampaigns(data.campaigns || []);
    })
    .catch(function(){
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#e53e3e;">Failed to load campaigns. Please refresh.</div>';
    });
}

function renderCampaigns(camps) {
  var grid = document.getElementById('campaignsGrid');
  if (!camps.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:#888;">No active campaigns. Start one!</div>';
    return;
  }
  grid.innerHTML = camps.map(function(c) {
    var pct = c.target_amount > 0 ? Math.min(100, Math.round(c.collected_amount / c.target_amount * 100)) : 0;
    var barColor = pct >= 70 ? '#10b981' : '#3b82f6';
    var coverHTML = c.cover_image
      ? '<img src="'+c.cover_image+'" alt="'+c.title+'" style="width:100%;height:160px;object-fit:cover;border-radius:10px 10px 0 0;">'
      : '<div style="width:100%;height:100px;background:linear-gradient(135deg,#1E3A8A,#3b82f6);border-radius:10px 10px 0 0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;">🤝</div>';
    var catBadge = '<span style="font-size:11px;padding:2px 8px;border-radius:20px;background:#e0e7ff;color:#3730a3;font-weight:600;text-transform:uppercase;">'+c.category+'</span>';
    return '<div class="campaign-card-item" style="background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.08);overflow:hidden;display:flex;flex-direction:column;">\
      '+coverHTML+'\
      <div style="padding:16px;flex:1;display:flex;flex-direction:column;gap:8px;">\
        <div style="display:flex;justify-content:space-between;align-items:center;">'+catBadge+'<span style="font-size:12px;color:#888;">by '+c.creator_name+'</span></div>\
        <h4 style="margin:0;font-size:16px;font-weight:700;">'+c.title+'</h4>\
        <p style="margin:0;font-size:13px;color:#666;flex:1;">'+c.description.substring(0,120)+(c.description.length>120?'…':'')+'</p>\
        <div style="font-size:12px;color:#888;display:flex;justify-content:space-between;">\
          <span>'+Number(c.collected_amount).toLocaleString()+' / '+Number(c.target_amount).toLocaleString()+' BDT</span>\
          <span style="font-weight:700;color:'+barColor+';">'+pct+'%</span>\
        </div>\
        <div style="height:6px;background:#e5e7eb;border-radius:3px;">\
          <div style="width:'+pct+'%;height:100%;background:'+barColor+';border-radius:3px;transition:width .3s;"></div>\
        </div>\
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#888;">\
          <span>👥 '+c.donor_count+' donors</span>\
        </div>\
        <button onclick="openDonateModal('+c.campaign_id+',\''+c.title.replace(/'/g,'\\\'')+'\')" style="margin-top:6px;padding:10px;background:#10b981;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">Donate Now</button>\
      </div>\
    </div>';
  }).join('');
}

/* ── Donation Modal ── */
function openDonateModal(campaignId, title) {
  selectedCampaignId = campaignId;
  document.getElementById('donateModalTitle').textContent = 'Donate to: ' + title;
  document.getElementById('donateModal').style.display = 'block';
  document.getElementById('donateBanner').style.display = 'none';
  document.getElementById('customInput').value = '';
  selectedAmount = 1000;
  document.querySelectorAll('.preset-btn').forEach(function(b){ b.classList.remove('active'); });
  document.getElementById('btn-1000').classList.add('active');
}

function selectAmount(amount) {
  selectedAmount = amount;
  document.querySelectorAll('.preset-btn').forEach(function(b){ b.classList.remove('active'); });
  document.getElementById('btn-' + amount).classList.add('active');
  document.getElementById('customInput').value = '';
}

function customInputChanged() {
  document.querySelectorAll('.preset-btn').forEach(function(b){ b.classList.remove('active'); });
  var v = parseInt(document.getElementById('customInput').value);
  if (!isNaN(v) && v > 0) selectedAmount = v;
}

async function submitDonation() {
  var banner  = document.getElementById('donateBanner');
  var anon    = document.getElementById('anonymousCheck').checked;
  var txRef   = document.getElementById('txRef') ? document.getElementById('txRef').value.trim() : '';

  function showB(msg, type) {
    banner.textContent = msg;
    banner.style.background = type==='error'?'#fee2e2':'#d1fae5';
    banner.style.color      = type==='error'?'#991b1b':'#065f46';
    banner.style.display    = 'block';
  }

  if (!selectedAmount || selectedAmount <= 0) { showB('Please select or enter a valid amount.','error'); return; }
  if (!selectedCampaignId) { showB('No campaign selected.','error'); return; }

  var btn = document.getElementById('donateSubmitBtn');
  btn.disabled = true; btn.textContent = 'Processing…';

  var fd = new FormData();
  fd.append('action','donate');
  fd.append('campaign_id', selectedCampaignId);
  fd.append('amount', selectedAmount);
  fd.append('is_anonymous', anon ? '1' : '0');
  fd.append('transaction_ref', txRef);

  try {
    var r = await fetch('api_campaigns.php', { method:'POST', body:fd });
    var d = await r.json();
    if (d.success) {
      showB('Thank you! Your donation of '+selectedAmount+' BDT was recorded.','success');
      setTimeout(function(){
        document.getElementById('donateModal').style.display = 'none';
        loadCampaigns(currentFilter);
      }, 1500);
    } else {
      showB(d.message || 'Donation failed.','error');
    }
  } catch(e) {
    showB('Network error. Please try again.','error');
  }
  btn.disabled=false; btn.textContent='Confirm Donation';
}

/* Start campaign modal */
function startCampaign() {
  document.getElementById('campaignModal').style.display = 'block';
}

async function submitCampaign() {
  var title   = document.getElementById('cm_title').value.trim();
  var desc    = document.getElementById('cm_desc').value.trim();
  var target  = document.getElementById('cm_target').value;
  var cat     = document.getElementById('cm_cat').value;
  var banner  = document.getElementById('campaignBanner');

  function showB(msg, type) {
    banner.textContent = msg;
    banner.style.background = type==='error'?'#fee2e2':'#d1fae5';
    banner.style.color      = type==='error'?'#991b1b':'#065f46';
    banner.style.display    = 'block';
  }
  if (!title || !target) { showB('Title and target amount are required.','error'); return; }

  var btn = document.getElementById('campaignSubmitBtn');
  btn.disabled=true; btn.textContent='Submitting…';

  var fd = new FormData();
  fd.append('action','create'); fd.append('title',title); fd.append('description',desc);
  fd.append('target_amount',target); fd.append('category',cat);
  var coverFile = document.getElementById('cm_cover');
  if (coverFile && coverFile.files[0]) fd.append('cover_image', coverFile.files[0]);

  try {
    var r = await fetch('api_campaigns.php',{method:'POST',body:fd});
    var d = await r.json();
    if (d.success) {
      showB('Campaign submitted for admin review!','success');
      setTimeout(function(){ document.getElementById('campaignModal').style.display='none'; loadCampaigns('all'); },1500);
    } else { showB(d.message,'error'); }
  } catch(e) { showB('Network error.','error'); }
  btn.disabled=false; btn.textContent='Submit Campaign';
}

/* Filter */
var currentFilter = 'all';
function selectFilter(el, filter) {
  document.querySelectorAll('.filter-pill').forEach(function(p){ p.classList.remove('active'); });
  el.classList.add('active');
  currentFilter = filter || 'all';
  loadCampaigns(currentFilter);
}

/* Init */
Auth.init({ requireLogin: true, onReady: function(){ loadCampaigns(); } });
