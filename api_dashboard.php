<?php
include 'db.php';
$user = requireLogin();
$uid  = $user['user_id'];

/* Active loan requests count */
$r1 = $conn->query('SELECT COUNT(*) c FROM LOAN_REQUEST WHERE status="open"');
$activeLoans = $r1->fetch_assoc()['c'];

/* Active campaigns count */
$r2 = $conn->query('SELECT COUNT(*) c FROM CAMPAIGN WHERE status="active"');
$activeCampaigns = $r2->fetch_assoc()['c'];

/* User's active bids */
$s = $conn->prepare('SELECT COUNT(*) c FROM LOAN_OFFER WHERE lender_id=? AND status="pending"');
$s->bind_param('i', $uid); $s->execute();
$activeBids = $s->get_result()->fetch_assoc()['c'];
$s->close();

/* User's total donations */
$d = $conn->prepare('SELECT COALESCE(SUM(amount),0) t FROM DONATION WHERE donor_id=?');
$d->bind_param('i', $uid); $d->execute();
$totalDonations = $d->get_result()->fetch_assoc()['t'];
$d->close();

/* Recent loan requests (5) */
$loans = [];
$lr = $conn->query('
    SELECT lr.loan_id, lr.amount, lr.purpose, lr.repayment_deadline, lr.max_interest_rate,
           u.full_name, u.avg_rating, u.department, u.profile_photo
    FROM LOAN_REQUEST lr
    JOIN USER u ON u.user_id = lr.borrower_id
    WHERE lr.status="open"
    ORDER BY lr.created_at DESC LIMIT 5
');
while ($row = $lr->fetch_assoc()) $loans[] = $row;

/* Recent campaigns (4) */
$camps = [];
$cr = $conn->query('
    SELECT campaign_id, title, description, target_amount, collected_amount, category, cover_image
    FROM CAMPAIGN WHERE status="active"
    ORDER BY created_at DESC LIMIT 4
');
while ($row = $cr->fetch_assoc()) $camps[] = $row;

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
