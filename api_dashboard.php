<?php
include 'db.php';

/* ── Auth ── */
$user = requireLogin();
$uid  = (int) $user['user_id'];

/* ─────────────────────────────────────────────
   Helper: safely run a query and return result.
   On failure, logs the error and returns false.
───────────────────────────────────────────────*/
function safeQuery($conn, $sql) {
    $result = $conn->query($sql);
    if ($result === false) {
        error_log('api_dashboard query error: ' . $conn->error . ' | SQL: ' . $sql);
    }
    return $result;
}

/* ── 1. Active loan requests count ──
   Table: loan_request  (lowercase — matches uiu_flc schema)
   Status values expected: 'open'
──────────────────────────────────── */
$activeLoans = 0;
$r1 = safeQuery($conn, 'SELECT COUNT(*) AS c FROM loan_request WHERE status = "open"');
if ($r1) $activeLoans = (int) $r1->fetch_assoc()['c'];

/* ── 2. Active campaigns count ──
   Table: campaign
   Status values expected: 'active'
──────────────────────────────── */
$activeCampaigns = 0;
$r2 = safeQuery($conn, 'SELECT COUNT(*) AS c FROM campaign WHERE status = "active"');
if ($r2) $activeCampaigns = (int) $r2->fetch_assoc()['c'];

/* ── 3. User's active bids ──
   Table: loan_offer
   lender_id FK → user.user_id
   Status: 'pending'
───────────────────────────── */
$activeBids = 0;
$s = $conn->prepare('SELECT COUNT(*) AS c FROM loan_offer WHERE lender_id = ? AND status = "pending"');
if ($s) {
    $s->bind_param('i', $uid);
    $s->execute();
    $activeBids = (int) $s->get_result()->fetch_assoc()['c'];
    $s->close();
}

/* ── 4. User's total donations ──
   Table: donation
   donor_id FK → user.user_id
   amount column: DECIMAL/FLOAT
──────────────────────────────── */
$totalDonations = 0;
$d = $conn->prepare('SELECT COALESCE(SUM(amount), 0) AS t FROM donation WHERE donor_id = ?');
if ($d) {
    $d->bind_param('i', $uid);
    $d->execute();
    $totalDonations = (float) $d->get_result()->fetch_assoc()['t'];
    $d->close();
}

/* ── 5. Recent open loan requests (up to 5) ──
   Tables: loan_request JOIN user
   Columns from user: full_name, department, profile_photo, avg_rating
   Columns from loan_request: loan_id, amount, purpose,
                               repayment_deadline, max_interest_rate
─────────────────────────────────────────────── */
$loans = [];
$lr = safeQuery($conn, '
    SELECT
        lr.loan_id,
        lr.amount,
        lr.purpose,
        lr.repayment_deadline,
        lr.max_interest_rate,
        u.full_name,
        u.department,
        u.profile_photo,
        u.avg_rating
    FROM loan_request lr
    JOIN user u ON u.user_id = lr.borrower_id
    WHERE lr.status = "open"
    ORDER BY lr.created_at DESC
    LIMIT 5
');
if ($lr) {
    while ($row = $lr->fetch_assoc()) {
        /* Cast numeric fields so JS receives correct types */
        $row['amount']            = (float) $row['amount'];
        $row['max_interest_rate'] = (float) $row['max_interest_rate'];
        $row['avg_rating']        = (float) $row['avg_rating'];
        $loans[] = $row;
    }
}

/* ── 6. Trending active campaigns (up to 4) ──
   Table: campaign
   Columns: campaign_id, title, description,
            target_amount, collected_amount,
            category, cover_image
   NOTE: cover_image may be NULL — dashboard JS handles this gracefully.
         collected_amount defaults to 0 in DB so COALESCE not needed,
         but wrapped anyway for safety.
──────────────────────────────────────────────── */
$camps = [];
$cr = safeQuery($conn, '
    SELECT
        campaign_id,
        title,
        description,
        COALESCE(target_amount, 0)    AS target_amount,
        COALESCE(collected_amount, 0) AS collected_amount,
        category,
        cover_image
    FROM campaign
    WHERE status = "active"
    ORDER BY collected_amount DESC, created_at DESC
    LIMIT 4
');
if ($cr) {
    while ($row = $cr->fetch_assoc()) {
        $row['target_amount']    = (float) $row['target_amount'];
        $row['collected_amount'] = (float) $row['collected_amount'];
        $camps[] = $row;
    }
}

/* ── Respond ──
   respond() defined in db.php.
   Signature used in rest of codebase: respond(bool, string, int)
   Extra data passed as 4th arg — confirm db.php supports it,
   otherwise data is merged into the standard envelope below.
─────────────────────────────────────────────────────────────── */
respond(true, 'ok', 200, [
    'stats' => [
        'active_loans'     => $activeLoans,
        'active_campaigns' => $activeCampaigns,
        'active_bids'      => $activeBids,
        'total_donations'  => $totalDonations,
    ],
    'loans'     => $loans,
    'campaigns' => $camps,
]);